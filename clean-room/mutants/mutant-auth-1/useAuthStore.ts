// Mutant 1: Sabotaged isPro invariant & default guest auth state
// clean-room/mutants/mutant-auth-1/useAuthStore.ts

import { create } from 'zustand';
import axios from 'axios';
import { getApiBase } from '../../lib/apiBase';

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
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isPro: boolean;
  isPaidSubscriber: boolean;
  plan: string;
  plan_id: string;
  tier: string;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  isAccountModalOpen: boolean;
  accountModalTab: 'profile' | 'admin' | 'projects';

  login: (ident: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<User>;
  logout: () => Promise<void>;
  checkSession: () => Promise<User | null>;
  updateProfile: (data: { displayName?: string; username?: string; email?: string; password?: string }) => Promise<User>;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openAccountModal: (tab?: 'profile' | 'admin' | 'projects') => void;
  closeAccountModal: () => void;
  openAdminModal: () => void;
  setUser: (user: User | null, token?: string | null) => void;
}

const STORAGE_KEY = 'velxio-auth-v1';

// MUTANT 1 CORRUPTION: Inverts is_pro and is_paid_subscriber to false
export function ensureProUser(user: User): User {
  return {
    ...user,
    is_pro: false, // SABOTAGED
    is_paid_subscriber: false, // SABOTAGED
    plan: 'free',
    plan_id: 'free',
    tier: 'free',
    subscription_status: 'inactive',
    subscription_period_end: undefined,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  // MUTANT 1 CORRUPTION: Defaults to false (Free/Guest locked)
  isPro: false, // SABOTAGED
  isPaidSubscriber: false, // SABOTAGED
  plan: 'free',
  plan_id: 'free',
  tier: 'free',
  isAuthModalOpen: false,
  authModalTab: 'login',
  isAccountModalOpen: false,
  accountModalTab: 'profile',

  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openAccountModal: (tab = 'profile') => set({ isAccountModalOpen: true, accountModalTab: tab }),
  closeAccountModal: () => set({ isAccountModalOpen: false }),
  openAdminModal: () => set({ isAccountModalOpen: true, accountModalTab: 'admin' }),

  setUser: (user, token = null) => {
    const proUser = user ? ensureProUser(user) : null;
    set({ user: proUser, token });
  },

  login: async () => { throw new Error('mutant'); },
  register: async () => { throw new Error('mutant'); },
  logout: async () => {},
  checkSession: async () => null,
  updateProfile: async () => { throw new Error('mutant'); },
}));
