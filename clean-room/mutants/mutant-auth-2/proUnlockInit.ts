// Mutant 2: Sabotaged board gate to block STM32 / Pi Pro runs
// clean-room/mutants/mutant-auth-2/proUnlockInit.ts

import { installBoardGateImpl } from './proBoardGate';
import { installSdCardUploadGate } from './proSdCardGate';
import { installHardwareFlashGate } from './proWebFlash';
import { registerSessionCheck } from './proSession';
import { installSaveActionImpl } from './proSaveAction';

let _initialized = false;

export function initProUnlock(): void {
  if (_initialized) return;
  _initialized = true;

  // MUTANT 2 CORRUPTION: Always block STM32 & Pi boards
  installBoardGateImpl(() => ({
    decision: 'block',
    requiredPlan: 'pro',
    featureName: 'Sabotaged Gate',
  }));

  installSdCardUploadGate(() => true);
  installHardwareFlashGate({ allowed: () => true, upgradeUrl: '' });
  registerSessionCheck(() => {});
  installSaveActionImpl(() => {});
}

initProUnlock();
