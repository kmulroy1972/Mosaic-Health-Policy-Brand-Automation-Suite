import 'office-js';

import type { BrandMasterConfig, TemplateSyncResult } from '../types';
import { logEvent } from '../utils/logging';

const ORG_MASTER_ID = 'MHP_ORG_MASTER';

export async function ensureOfficialMaster(
  presentation: PowerPoint.Presentation,
  _config: BrandMasterConfig
): Promise<TemplateSyncResult> {
  const masters = presentation.slideMasters;
  masters.load('items/id,items/name');
  await presentation.context.sync();

  const officialMaster = masters.items.find((master) => master.id === ORG_MASTER_ID);
  if (officialMaster) {
    logEvent('ppt_master_verified', { id: officialMaster.id });
    return { appliedMasterId: officialMaster.id };
  }

  logEvent('ppt_master_missing', { expected: ORG_MASTER_ID });
  return {
    message: 'Official master not found in deck; relink via Org Assets.'
  };
}
