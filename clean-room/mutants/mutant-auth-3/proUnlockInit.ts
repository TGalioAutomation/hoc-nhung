// Mutant 3: Sabotaged microSD upload and physical hardware flash gates
// clean-room/mutants/mutant-auth-3/proUnlockInit.ts

import { installBoardGateImpl } from './proBoardGate';
import { installSdCardUploadGate } from './proSdCardGate';
import { installHardwareFlashGate } from './proWebFlash';
import { registerSessionCheck } from './proSession';
import { installSaveActionImpl } from './proSaveAction';

let _initialized = false;

export function initProUnlock(): void {
  if (_initialized) return;
  _initialized = true;

  installBoardGateImpl(() => 'allow');

  // MUTANT 3 CORRUPTION: Block microSD uploads and physical hardware flashing
  installSdCardUploadGate(() => false); // SABOTAGED
  installHardwareFlashGate({
    allowed: () => false, // SABOTAGED
    upgradeUrl: 'https://example.com/upgrade',
  });

  registerSessionCheck(() => {});
  installSaveActionImpl(() => {});
}

initProUnlock();
