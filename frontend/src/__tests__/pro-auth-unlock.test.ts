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
});
