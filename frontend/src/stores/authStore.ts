import { create } from 'zustand';
import api from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('cpl_user') || 'null'),
  token: localStorage.getItem('cpl_token'),
  isAuthenticated: !!localStorage.getItem('cpl_token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('cpl_token', data.token);
      localStorage.setItem('cpl_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('cpl_token');
    localStorage.removeItem('cpl_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('cpl_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('cpl_user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('cpl_token');
      localStorage.removeItem('cpl_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
