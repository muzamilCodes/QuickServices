import { create } from 'zustand';

interface User {
  _id: string;
  username: string;
  email: string;
  mobile: string;
  isAdmin: boolean;
  isVerified: boolean;
}

interface RegisterPayload {
  username: string;
  email: string;
  mobile: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterPayload) => Promise<AuthResponse>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const parseStoredUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawUser = localStorage.getItem('user');
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = parseStoredUser();
    set({
      user,
      isAuthenticated: Boolean(token),
      isLoading: false,
    });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as AuthResponse;

      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  register: async (data: RegisterPayload) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as AuthResponse;
      set({ isLoading: false });
      return result;
    } catch {
      set({ isLoading: false });
      return { success: false, message: 'Registration failed' };
    }
  },

  verifyOTP: async (email: string, otp: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = (await response.json()) as AuthResponse;

      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
