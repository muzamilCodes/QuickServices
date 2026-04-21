// store/authStore.ts
import { create } from 'zustand';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    
    // Actions
    register: (data: { username: string; email: string; password: string; phone: string }) => Promise<{ success: boolean; message: string; email?: string }>;
    verifyOTP: (email: string, otp: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    sendLoginOTP: (email: string) => Promise<boolean>;
    verifyLoginOTP: (email: string, otp: string) => Promise<boolean>;
    forgotPassword: (email: string) => Promise<boolean>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
    getProfile: () => Promise<void>;
    updateProfile: (data: { username?: string; phone?: string }) => Promise<boolean>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    register: async (data) => {
        set({ isLoading: true });
        try {
            const response = await authAPI.register(data);
            return { success: true, message: response.data.message, email: response.data.email };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        } finally {
            set({ isLoading: false });
        }
    },

    verifyOTP: async (email, otp) => {
        set({ isLoading: true });
        try {
            const response = await authAPI.verifyOTP({ email, otp });
            const { accessToken, refreshToken, user } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            set({ user, isAuthenticated: true });
            return true;
        } catch (error: any) {
            console.error('OTP verification failed:', error.response?.data?.message);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await authAPI.login({ email, password });
            const { accessToken, refreshToken, user } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            set({ user, isAuthenticated: true });
            return true;
        } catch (error: any) {
            console.error('Login failed:', error.response?.data?.message);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    sendLoginOTP: async (email) => {
        set({ isLoading: true });
        try {
            await authAPI.sendLoginOTP({ email });
            return true;
        } catch (error: any) {
            console.error('Send OTP failed:', error.response?.data?.message);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    verifyLoginOTP: async (email, otp) => {
        set({ isLoading: true });
        try {
            const response = await authAPI.verifyLoginOTP({ email, otp });
            const { accessToken, refreshToken, user } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            set({ user, isAuthenticated: true });
            return true;
        } catch (error: any) {
            console.error('OTP verification failed:', error.response?.data?.message);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
            await authAPI.forgotPassword({ email });
            return true;
        } catch (error: any) {
            console.error('Forgot password failed:', error.response?.data?.message);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    resetPassword: async (email, otp, newPassword) => {
        set({ isLoading: true });
        try {
            await authAPI.resetPassword({ email, otp, newPassword });
            return true;
        } catch (error: any) {
            console.error('Reset password failed:', error.response?.data?.message);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    getProfile: async () => {
        try {
            const response = await authAPI.getProfile();
            set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
            console.error('Get profile failed:', error);
        }
    },

    updateProfile: async (data) => {
        set({ isLoading: true });
        try {
            const response = await authAPI.updateProfile(data);
            set({ user: response.data.user });
            return true;
        } catch (error: any) {
            console.error('Update profile failed:', error.response?.data?.message);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false });
        }
    },

    setUser: (user) => set({ user, isAuthenticated: !!user }),
}));