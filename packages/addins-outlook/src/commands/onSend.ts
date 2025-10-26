import 'office-js';

import { evaluatePolicy } from '../policies/evaluator';
import type { OnSendResult, PolicyOptions } from '../types';
import { getBodyPreviewAsync, getRecipientsAsync } from '../utils/async';
import { ensureDisclaimer } from '../utils/disclaimer';
import { requestJustification } from '../utils/justification';
import { logError, logEvent } from '../utils/logging';
import { ensureSignature } from '../utils/signature';

const DEFAULT_POLICY: PolicyOptions = {
  allowedDomains: ['mhp.com'],
  redFlagKeywords: ['confidential', 'phi', 'pii'],
  hardBlockKeywords: ['ssn', 'passport']
};

function notify(message: string) {
  const item = Office.context.mailbox.item;
  if (item && 'notificationMessages' in item) {
    const notifications = (item as Office.MessageCompose).notificationMessages;
    notifications.addAsync(
      'mhp-policy',
      {
        type: 'informationalMessage',
        message,
        icon: 'icon16',
        persistent: false
      },
      () => {}
    );
  }
}

async function processOnSend(options: PolicyOptions = DEFAULT_POLICY): Promise<OnSendResult> {
  const mailbox = Office.context.mailbox.item as Office.MessageCompose;
  const recipients = await getRecipientsAsync(mailbox);
  const bodyPreview = await getBodyPreviewAsync(mailbox);

  const decision = evaluatePolicy(mailbox, recipients, bodyPreview, options);

  if (!decision.allowSend) {
    logEvent('outlook_policy_block', { issues: decision.issues });
    notify('Message blocked due to policy violation.');
    return {
      allowSend: false
    };
  }

  if (decision.requiresJustification) {
    const justification = await requestJustification();
    if (!justification) {
      notify('Justification required to proceed.');
      return {
        allowSend: false
      };
    }
    decision.justification = justification;
  }

  const hasExternal = decision.context.externalRecipients.length > 0;
  await ensureSignature(mailbox);
  await ensureDisclaimer(mailbox, hasExternal);

  logEvent('outlook_policy_pass', {
    recipients,
    externalRecipientCount: decision.context.externalRecipients.length,
    justification: decision.justification
  });

  return { allowSend: true };
}

export async function handleOnSend(event: Office.AddinCommands.Event): Promise<void> {
  try {
    const result = await processOnSend();
    if (result.allowSend) {
      event.completed();
    } else {
      event.completed({ allowEvent: false });
    }
  } catch (error) {
    logError('outlook_on_send_failed', error);
    notify('Unexpected error during policy evaluation.');
    event.completed({ allowEvent: false });
  }
}
