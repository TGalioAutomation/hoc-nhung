// Mutant 1 (Classroom): Breaks mandatory login gate
// clean-room/mutants/mutant-classroom-1/useAuthStore.ts
// Sabotage: openAuthModal refuses to open modal or sessionChecked is broken,
// causing mandatory login gate to fail enforcement.

import { create } from 'zustand';
import axios from 'axios';
import { getApiBase } from '../../lib/apiBase';
import { useGamificationStore } from '../../store/useGamificationStore';

export interface User {
  id: string;
  username: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  role?: string;
  is_admin: boolean;
  is_active: boolean;
  is_pro: boolean;
  is_paid_subscriber: boolean;
  plan_id: string;
  plan: string;
  tier: string;
  subscription_status: string;
  subscription_period_end?: string;
  class_level?: number;
  completed_lessons?: string[];
  graduated_classes?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  sessionChecked: boolean;
  isPro: boolean;
  isPaidSubscriber: boolean;
  plan: string;
  plan_id: string;
  tier: string;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  isAccountModalOpen: boolean;
  accountModalTab: 'profile' | 'admin' | 'projects' | 'community';

  login: (ident: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string, displayName?: string, classLevel?: number) => Promise<User>;
  logout: () => Promise<void>;
  checkSession: () => Promise<User | null>;
  updateProfile: (data: any) => Promise<User>;
  selectClassLevel: (classLevel: number) => Promise<void>;
  syncProgressToAccount: (payload: any) => Promise<void>;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openAccountModal: (tab?: any) => void;
  closeAccountModal: () => void;
  openAdminModal: () => void;
  setUser: (user: User | null, token?: string | null) => void;
}

export function ensureProUser(user: User): User {
  return {
    ...user,
    class_level: Math.max(1, Math.min(5, Number(user.class_level) || 1)),
    completed_lessons: Array.isArray(user.completed_lessons) ? user.completed_lessons : [],
    graduated_classes: Array.isArray(user.graduated_classes) ? user.graduated_classes.map(Number).filter((n) => !isNaN(n)) : [],
    is_pro: true,
    is_paid_subscriber: true,
    plan: 'pro',
    plan_id: 'pro',
    tier: 'pro',
    subscription_status: 'active',
    subscription_period_end: user.subscription_period_end || '2099-12-31T23:59:59Z',
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  sessionChecked: false,
  isPro: true,
  isPaidSubscriber: true,
  plan: 'pro',
  plan_id: 'pro',
  tier: 'pro',
  isAuthModalOpen: false,
  authModalTab: 'login',
  isAccountModalOpen: false,
  accountModalTab: 'profile',

  // MUTATION SABOTAGE: openAuthModal fails to open the modal (Mandatory login gate bypass)
  openAuthModal: (tab = 'login') => {
    // SABOTAGED: Always keep isAuthModalOpen false
    set({ isAuthModalOpen: false, authModalTab: tab });
  },
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openAccountModal: (tab = 'profile') => set({ isAccountModalOpen: true, accountModalTab: tab }),
  closeAccountModal: () => set({ isAccountModalOpen: false }),
  openAdminModal: () => set({ isAccountModalOpen: true, accountModalTab: 'admin' }),

  setUser: (user, token) => set({ user, token }),
  login: async () => { throw new Error('mutant'); },
  register: async () => { throw new Error('mutant'); },
  logout: async () => {},
  checkSession: async () => null,
  updateProfile: async () => { throw new Error('mutant'); },
  selectClassLevel: async () => {},
  syncProgressToAccount: async () => {},
}));
