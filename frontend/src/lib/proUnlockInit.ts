import { installBoardGateImpl } from './proBoardGate';
import { installSdCardUploadGate } from './proSdCardGate';
import { installHardwareFlashGate } from './proWebFlash';
import { registerSessionCheck } from './proSession';
import { installSaveActionImpl } from './proSaveAction';
import { ONLINE_ONLY_BOARD_ADS, suppressOnlineOnlyAds } from './onlineOnlyBoards';
import { registerEditorCommand } from './editorCommands';
import { useAuthStore } from '../store/useAuthStore';

let _initialized = false;

export function initProUnlock(): void {
  if (_initialized) return;
  _initialized = true;

  console.info('🚀 [Velxio Pro] Initializing 100% Universal Pro Unlock & Account Systems...');

  // 1. Board Gate: Always allow all Pro boards (STM32, Raspberry Pi QEMU, ESP32, etc.)
  installBoardGateImpl(() => 'allow');

  // 2. MicroSD Card Gate: Always allow uploading files to MicroSD
  installSdCardUploadGate(() => true);

  // 3. WebSerial Hardware Flashing: Always allow flashing to real physical hardware
  installHardwareFlashGate({
    allowed: () => true,
    upgradeUrl: '',
  });

  // 4. Session Check Hook: Connect to useAuthStore
  registerSessionCheck(() => {
    void useAuthStore.getState().checkSession();
  });

  // 5. Suppress online-only ad cards (makes all boards directly placeable and usable)
  try {
    const allAdIds = ONLINE_ONLY_BOARD_ADS.map((b) => b.id);
    suppressOnlineOnlyAds(allAdIds);
  } catch (err) {
    console.warn('[Velxio Pro] Failed to suppress online-only ads:', err);
  }

  // 6. Pro Save Action: Open Cloud Save / Account Projects tab when user hits Save
  installSaveActionImpl(() => {
    const user = useAuthStore.getState().user;
    if (!user) {
      useAuthStore.getState().openAuthModal('login');
    } else {
      useAuthStore.getState().openAccountModal('projects');
    }
  });

  // 7. Register Editor Menubar Commands for Account & Projects
  try {
    registerEditorCommand('account.myProjects', () => {
      useAuthStore.getState().openAccountModal('projects');
    });
    registerEditorCommand('account.login', () => {
      const user = useAuthStore.getState().user;
      if (!user) {
        useAuthStore.getState().openAuthModal('login');
      } else {
        useAuthStore.getState().openAccountModal('profile');
      }
    });
  } catch (err) {
    console.warn('[Velxio Pro] Editor command registration:', err);
  }

  console.info('👑 [Velxio Pro] 100% Universal Pro Unlock initialized successfully!');
}

// Auto-run on import
initProUnlock();
