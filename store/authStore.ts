import { create } from 'zustand';

interface User {
    _id: string;
    username: string;
    email: string;
    mobile: string;
    isAdmin: boolean;
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (data: any) => Promise<any>;
    verifyOTP: (email: string, otp: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
            set({ isAuthenticated: true, isLoading: false });
        } else {
            set({ isAuthenticated: false, isLoading: false });
        }
    },

    login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await fetch('http://localhost:4000/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                set({ user: data.user, isAuthenticated: true, isLoading: false });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch (error) {
            set({ isLoading: false });
            return false;
        }
    },

    register: async (data: any) => {
        set({ isLoading: true });
        try {
            const response = await fetch('http://localhost:4000/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            set({ isLoading: false });
            return result;
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: 'Registration failed' };
        }
    },

    verifyOTP: async (email: string, otp: string) => {
        set({ isLoading: true });
        try {
            const response = await fetch('http://localhost:4000/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                set({ user: data.user, isAuthenticated: true, isLoading: false });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch (error) {
            set({ isLoading: false });
            return false;
        }
    },

    logout: async () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, isLoading: false });
    },
}));

// Call checkAuth immediately
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
        useAuthStore.setState({ isAuthenticated: true, isLoading: false });
    } else {
        useAuthStore.setState({ isAuthenticated: false, isLoading: false });
    }
}