import { describe, it, expect, beforeEach } from 'vitest';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAuthStore } from '../store/useAuthStore';

describe('Gamification & Auth Store Classroom Integration', () => {
  beforeEach(() => {
    // Reset stores
    useGamificationStore.setState({
      xp: 0,
      currentClassLevel: 1,
      graduatedClasses: [],
      classSelectorOpen: false,
      graduationModalData: null,
      completedIds: [],
    });
    useAuthStore.setState({
      user: null,
      sessionChecked: true,
      isAuthModalOpen: false,
    });
  });

  it('initializes with default class level 1 and empty graduated classes', () => {
    const state = useGamificationStore.getState();
    expect(state.currentClassLevel).toBe(1);
    expect(state.graduatedClasses).toEqual([]);
    expect(state.classSelectorOpen).toBe(false);
  });

  it('updates class level and toggles selector modal', () => {
    useGamificationStore.getState().setCurrentClassLevel(3);
    expect(useGamificationStore.getState().currentClassLevel).toBe(3);

    useGamificationStore.getState().setClassSelectorOpen(true);
    expect(useGamificationStore.getState().classSelectorOpen).toBe(true);

    useGamificationStore.getState().setClassSelectorOpen(false);
    expect(useGamificationStore.getState().classSelectorOpen).toBe(false);
  });

  it('hydrates classroom level and graduated classes from user profile', () => {
    const mockUser: any = {
      id: 'test-user-1',
      username: 'be_hoc_gioi',
      email: 'be@example.com',
      class_level: 2,
      graduated_classes: [1],
      completed_lessons: ['blink-led', 'button-led'],
    };

    useGamificationStore.getState().hydrateFromUser(mockUser);
    const state = useGamificationStore.getState();
    expect(state.currentClassLevel).toBe(2);
    expect(state.graduatedClasses).toContain(1);
  });

  it('graduates current class, awards XP, advances level, and triggers graduation modal data', () => {
    useGamificationStore.getState().setCurrentClassLevel(1);
    useGamificationStore.getState().graduateCurrentClassNow();

    const state = useGamificationStore.getState();
    expect(state.currentClassLevel).toBe(2);
    expect(state.graduatedClasses).toContain(1);
    expect(state.graduationModalData).not.toBeNull();
    expect(state.graduationModalData?.graduatedLevel).toBe(1);
    expect(state.graduationModalData?.promotedToLevel).toBe(2);
    expect(state.graduationModalData?.xpBonus).toBe(300);
    expect(state.xp).toBeGreaterThanOrEqual(300);

    // Dismiss modal
    useGamificationStore.getState().dismissGraduationModal();
    expect(useGamificationStore.getState().graduationModalData).toBeNull();
  });

  it('enforces mandatory login gate when session is checked and user is not authenticated', () => {
    useAuthStore.setState({
      user: null,
      sessionChecked: false,
      isAuthModalOpen: false,
    });

    useAuthStore.setState({ sessionChecked: true });
    const { sessionChecked, user, openAuthModal } = useAuthStore.getState();
    const shouldEnforceGate = sessionChecked && !user;
    expect(shouldEnforceGate).toBe(true);

    if (shouldEnforceGate) {
      openAuthModal('login');
    }

    const state = useAuthStore.getState();
    expect(state.isAuthModalOpen).toBe(true);
    expect(state.authModalTab).toBe('login');
  });
});
