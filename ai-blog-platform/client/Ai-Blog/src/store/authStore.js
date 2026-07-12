import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  isInitializing: true, // Used to block UI loading while checking session on mount

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ loading: false });
      return { success: false, message: errorMessage };
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ loading: false });
      return { success: false, message: errorMessage };
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  checkAuth: async () => {
    set({ isInitializing: true });
    try {
      const response = await api.get('/auth/me');
      const { user } = response.data;
      
      // Keep session alive
      set({ user, isAuthenticated: true, isInitializing: false });
    } catch (error) {
      // Session expired or no token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
    }
  },

  setLoading: (loading) => set({ loading }),
  
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  }
}));

export default useAuthStore;
