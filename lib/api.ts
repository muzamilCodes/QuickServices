// lib/api.ts
import axios from 'axios';
import type { LoginResponse, RegisterResponse, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken
                });
                
                const { accessToken, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// ===================== AUTH APIS =====================
export const authAPI = {
    // Register
    register: (data: { username: string; email: string; password: string; phone: string }) =>
        api.post<RegisterResponse>('/auth/register', data),
    
    // Verify OTP after registration
    verifyOTP: (data: { email: string; otp: string }) =>
        api.post<LoginResponse>('/auth/verify-otp', data),
    
    // Login with password
    login: (data: { email: string; password: string }) =>
        api.post<LoginResponse>('/auth/login', data),
    
    // Send OTP for login
    sendLoginOTP: (data: { email: string }) =>
        api.post<{ success: boolean; message: string }>('/auth/send-login-otp', data),
    
    // Verify login OTP
    verifyLoginOTP: (data: { email: string; otp: string }) =>
        api.post<LoginResponse>('/auth/verify-login-otp', data),
    
    // Forgot password - send OTP
    forgotPassword: (data: { email: string }) =>
        api.post<{ success: boolean; message: string }>('/auth/forgot-password', data),
    
    // Reset password with OTP
    resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
        api.post<{ success: boolean; message: string }>('/auth/reset-password', data),
    
    // Get profile
    getProfile: () =>
        api.get<{ success: boolean; user: User }>('/auth/profile'),
    
    // Update profile
    updateProfile: (data: { username?: string; phone?: string }) =>
        api.put<{ success: boolean; user: User }>('/auth/profile', data),
    
    // Logout
    logout: () =>
        api.post<{ success: boolean; message: string }>('/auth/logout'),
    
    // Refresh token
    refreshToken: (refreshToken: string) =>
        api.post<{ success: boolean; accessToken: string; refreshToken: string }>('/auth/refresh-token', { refreshToken }),
};

// ===================== ADMIN APIS =====================
export const adminAPI = {
    getAllUsers: () =>
        api.get<{ success: boolean; count: number; users: User[] }>('/auth/admin/users'),
    
    updateUserStatus: (userId: string, data: { isActive?: boolean; role?: string }) =>
        api.put<{ success: boolean; user: User }>(`/auth/admin/users/${userId}`, data),
    
    deleteUser: (userId: string) =>
        api.delete<{ success: boolean; message: string }>(`/auth/admin/users/${userId}`),
};

export default api;
