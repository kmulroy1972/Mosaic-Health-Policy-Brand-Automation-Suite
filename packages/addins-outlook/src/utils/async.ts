import 'office-js';

export function asAsync<T>(
  callback: (resolve: (value: T) => void, reject: (reason?: unknown) => void) => void
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    callback(resolve, reject);
  });
}

export function getRecipientsAsync(item: Office.MessageCompose): Promise<string[]> {
  return new Promise((resolve, reject) => {
    item.to.getAsync((toResult) => {
      if (toResult.status === Office.AsyncResultStatus.Failed) {
        reject(toResult.error);
        return;
      }
      const addresses: string[] = [];
      const addRecipients = (recipients?: Office.EmailAddressDetails[] | null) => {
        if (!recipients) {
          return;
        }
        recipients.forEach((recipient) => {
          if (recipient.emailAddress) {
            addresses.push(recipient.emailAddress);
          }
        });
      };

      addRecipients(toResult.value);

      item.cc.getAsync((ccResult) => {
        if (ccResult.status === Office.AsyncResultStatus.Failed) {
          reject(ccResult.error);
          return;
        }
        addRecipients(ccResult.value);
        item.bcc.getAsync((bccResult) => {
          if (bccResult.status === Office.AsyncResultStatus.Failed) {
            reject(bccResult.error);
            return;
          }
          addRecipients(bccResult.value);
          resolve(addresses);
        });
      });
    });
  });
}

export function getBodyPreviewAsync(item: Office.MessageCompose): Promise<string> {
  return new Promise((resolve, reject) => {
    item.body.getAsync(Office.CoercionType.Html, (result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
        resolve(result.value as string);
      } else if (result.status === Office.AsyncResultStatus.Failed) {
        reject(result.error);
      } else {
        resolve('');
      }
    });
  });
}

export function prependBodyAsync(item: Office.MessageCompose, html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    item.body.prependAsync(html, { coercionType: Office.CoercionType.Html }, (result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve();
      } else {
        reject(result.error);
      }
    });
  });
}

export function appendBodyAsync(item: Office.MessageCompose, html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    item.body.appendOnSendAsync(html, { coercionType: Office.CoercionType.Html }, (result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve();
      } else {
        reject(result.error);
      }
    });
  });
}
