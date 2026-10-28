import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, ensureProUser, type User } from '../store/useAuthStore';
import { boardGateVerdict } from '../lib/proBoardGate';
import { sdCardUploadAllowed } from '../lib/proSdCardGate';
import { hardwareFlashAllowed } from '../lib/proWebFlash';
import { hasSaveActionImpl } from '../lib/proSaveAction';
import '../lib/proUnlockInit';

describe('100% Universal Pro Unlock & Auth Store Verification', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('ensures pro invariants are strictly maintained on any user entity', () => {
    const rawUser: User = {
      id: 'test-id',
      username: 'sample_student',
      email: 'student@example.com',
      is_admin: false,
      is_active: true,
      is_pro: false,
      is_paid_subscriber: false,
      plan_id: 'free',
      plan: 'free',
      tier: 'free',
      subscription_status: 'inactive',
    };

    const proUser = ensureProUser(rawUser);

    expect(proUser.is_pro).toBe(true);
    expect(proUser.is_paid_subscriber).toBe(true);
    expect(proUser.plan).toBe('pro');
    expect(proUser.plan_id).toBe('pro');
    expect(proUser.tier).toBe('pro');
    expect(proUser.subscription_status).toBe('active');
    expect(proUser.subscription_period_end).toBe('2099-12-31T23:59:59Z');
  });

  it('verifies that useAuthStore defaults to unlocked Pro state even in guest mode', () => {
    const state = useAuthStore.getState();
    expect(state.isPro).toBe(true);
    expect(state.isPaidSubscriber).toBe(true);
    expect(state.plan).toBe('pro');
    expect(state.tier).toBe('pro');
  });

  it('verifies that Pro board gates allow STM32 and Raspberry Pi runs without blocking', () => {
    const stm32Verdict = boardGateVerdict('stm32-bluepill' as any, 'run');
    expect(stm32Verdict).toEqual({ decision: 'allow' });

    const piVerdict = boardGateVerdict('pi-3b' as any, 'run');
    expect(piVerdict).toEqual({ decision: 'allow' });
  });

  it('verifies that microSD upload and real hardware flash gates are 100% unlocked', () => {
    expect(sdCardUploadAllowed()).toBe(true);
    expect(hardwareFlashAllowed()).toBe(true);
  });

  it('verifies that custom save action implementation is properly registered', () => {
    expect(hasSaveActionImpl()).toBe(true);
  });

  it('manages modal opening and tab switching reliably', () => {
    const store = useAuthStore.getState();

    store.openAccountModal('admin');
    expect(useAuthStore.getState().isAccountModalOpen).toBe(true);
    expect(useAuthStore.getState().accountModalTab).toBe('admin');

    store.closeAccountModal();
    expect(useAuthStore.getState().isAccountModalOpen).toBe(false);

    store.openAuthModal('register');
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    expect(useAuthStore.getState().authModalTab).toBe('register');

    store.closeAuthModal();
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
  });

  it('verifies that all 19+ microcontroller variants (STM32, Pi, ESP32, Arduino, RP2040) are 100% unlocked for community use', () => {
    const allMcuKinds = [
      // STM32 family (QEMU arm)
      'stm32-bluepill',
      'stm32-blackpill',
      'stm32-nucleo-c031c6',
      'stm32-nucleo-f103rb',
      'stm32-nucleo-f401re',
      'stm32-nucleo-f411re',
      'stm32-nucleo-l031k6',
      'stm32-nucleo-g031k8',
      'stm32-nucleo-g474re',
      // Raspberry Pi family (QEMU Linux)
      'pi-zero',
      'pi-1',
      'pi-2',
      'pi-3b',
      'pi-4b',
      'pi-5',
      // ESP32 family
      'esp32',
      'esp32-s2',
      'esp32-s3',
      'esp32-c3',
      'esp32-c6',
      'esp32-cam',
      // RP2040 & Arduino
      'raspberry-pi-pico',
      'arduino-uno',
      'arduino-nano',
      'arduino-mega',
    ];

    expect(allMcuKinds.length).toBeGreaterThanOrEqual(19);

    for (const kind of allMcuKinds) {
      const runVerdict = boardGateVerdict(kind as any, 'run');
      expect(runVerdict).toEqual({ decision: 'allow' });

      const addVerdict = boardGateVerdict(kind as any, 'add');
      expect(addVerdict).toEqual({ decision: 'allow' });
    }
  });

  it('verifies student and admin entities preserve complete unlocked entitlements for open community access', () => {
    const studentUser: User = {
      id: 'student-01',
      username: 'em_hoc_sinh',
      email: 'hocsinh@velxio.local',
      role: 'student',
      is_admin: false,
      is_active: true,
      is_pro: true,
      is_paid_subscriber: true,
      plan: 'pro',
      plan_id: 'pro',
      tier: 'pro',
    };

    const adminUser: User = {
      id: 'admin-01',
      username: 'admin',
      email: 'admin@velxio.local',
      role: 'admin',
      is_admin: true,
      is_active: true,
      is_pro: true,
      is_paid_subscriber: true,
      plan: 'pro',
      plan_id: 'pro',
      tier: 'pro',
    };

    const ensuredStudent = ensureProUser(studentUser);
    expect(ensuredStudent.is_pro).toBe(true);
    expect(ensuredStudent.plan).toBe('pro');
    expect(ensuredStudent.subscription_status).toBe('active');

    const ensuredAdmin = ensureProUser(adminUser);
    expect(ensuredAdmin.is_pro).toBe(true);
    expect(ensuredAdmin.is_admin).toBe(true);
    expect(ensuredAdmin.plan).toBe('pro');
    expect(ensuredAdmin.subscription_status).toBe('active');
  });
});
