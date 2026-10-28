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

  // Actions
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

// Helper to sanitize and enforce Universal Pro Invariants
export function ensureProUser(user: User): User {
  return {
    ...user,
    is_pro: true,
    is_paid_subscriber: true,
    plan: 'pro',
    plan_id: 'pro',
    tier: 'pro',
    subscription_status: 'active',
    subscription_period_end: user.subscription_period_end || '2099-12-31T23:59:59Z',
  };
}

interface PersistedAuth {
  user: User | null;
  token: string | null;
}

function loadPersisted(): PersistedAuth {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.user) {
        return {
          user: ensureProUser(data.user),
          token: data.token || null,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { user: null, token: null };
}

function savePersisted(user: User | null, token: string | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    }
  } catch {
    /* ignore */
  }
}

// Axios instance with cookies and baseURL
const authApi = axios.create({ withCredentials: true });
authApi.interceptors.request.use((config) => {
  config.baseURL = getApiBase();
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const initial = loadPersisted();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  token: initial.token,
  loading: false,
  // Universal Pro flags — always active across the platform
  isPro: true,
  isPaidSubscriber: true,
  plan: 'pro',
  plan_id: 'pro',
  tier: 'pro',
  isAuthModalOpen: false,
  authModalTab: 'login',
  isAccountModalOpen: false,
  accountModalTab: 'profile',

  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openAccountModal: (tab = 'profile') => set({ isAccountModalOpen: true, accountModalTab: tab }),
  closeAccountModal: () => set({ isAccountModalOpen: false }),
  openAdminModal: () => set({ isAccountModalOpen: true, accountModalTab: 'admin' }),

  setUser: (user, token) => {
    const proUser = user ? ensureProUser(user) : null;
    const finalToken = token !== undefined ? token : get().token;
    savePersisted(proUser, finalToken);
    set({ user: proUser, token: finalToken });
  },

  login: async (ident, password) => {
    set({ loading: true });
    try {
      const { data } = await authApi.post('/auth/login', {
        email_or_username: ident,
        password,
      });
      const proUser = ensureProUser(data.user);
      const token = data.access_token;
      savePersisted(proUser, token);
      set({
        user: proUser,
        token,
        loading: false,
        isAuthModalOpen: false,
      });
      return proUser;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (username, email, password, displayName) => {
    set({ loading: true });
    try {
      const { data } = await authApi.post('/auth/register', {
        username,
        email,
        password,
        display_name: displayName,
      });
      const proUser = ensureProUser(data.user);
      const token = data.access_token;
      savePersisted(proUser, token);
      set({
        user: proUser,
        token,
        loading: false,
        isAuthModalOpen: false,
      });
      return proUser;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.post('/auth/logout');
    } catch {
      /* ignore */
    } finally {
      savePersisted(null, null);
      set({ user: null, token: null, isAccountModalOpen: false });
    }
  },

  checkSession: async () => {
    try {
      const { data } = await authApi.get('/auth/session');
      if (data && data.authenticated && data.user) {
        const proUser = ensureProUser(data.user);
        savePersisted(proUser, get().token);
        set({ user: proUser });
        return proUser;
      } else {
        // If server says not authenticated, check token via /auth/me if token exists
        const currentToken = get().token;
        if (currentToken) {
          try {
            const { data: userData } = await authApi.get('/auth/me');
            if (userData && userData.id) {
              const proUser = ensureProUser(userData);
              savePersisted(proUser, currentToken);
              set({ user: proUser });
              return proUser;
            }
          } catch {
            savePersisted(null, null);
            set({ user: null, token: null });
            return null;
          }
        }
        return null;
      }
    } catch (err) {
      console.warn('[auth] session check failed:', err);
      return null;
    }
  },

  updateProfile: async (payload) => {
    set({ loading: true });
    try {
      const { data } = await authApi.put('/auth/profile', {
        display_name: payload.displayName,
        username: payload.username,
        email: payload.email,
        password: payload.password,
      });
      const proUser = ensureProUser(data);
      savePersisted(proUser, get().token);
      set({ user: proUser, loading: false });
      return proUser;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));
