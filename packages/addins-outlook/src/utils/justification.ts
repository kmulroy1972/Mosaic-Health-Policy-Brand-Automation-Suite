import { asAsync } from './async';

export async function requestJustification(): Promise<string | null> {
  if (typeof Office.context.ui?.displayDialogAsync !== 'function') {
    return null;
  }

  return asAsync<string | null>((resolve) => {
    Office.context.ui.displayDialogAsync(
      `${location.origin}/justification.html`,
      { height: 30, width: 40, displayInIframe: true },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed || !result.value) {
          resolve(null);
          return;
        }

        const dialog = result.value;
        dialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg: any) => {
          resolve(arg.message ?? null);
          dialog.close();
        });
        dialog.addEventHandler(Office.EventType.DialogEventReceived, () => {
          resolve(null);
        });
      }
    );
  });
}
