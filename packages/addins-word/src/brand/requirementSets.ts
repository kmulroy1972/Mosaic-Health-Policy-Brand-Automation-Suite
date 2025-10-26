import 'office-js';

import type { RequirementSet } from '../types';

export function detectRequirementSet(): RequirementSet {
  const supported = Office.context.requirements.isSetSupported('WordApi', '1.7')
    ? 'WordApi1.7'
    : Office.context.requirements.isSetSupported('WordApi', '1.5')
      ? 'WordApi1.5'
      : 'WordApi1.3';
  return supported;
}
