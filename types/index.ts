// types/index.ts
export interface User {
    _id: string;
    username: string;
    email: string;
    phone: string;
    role: 'user' | 'provider' | 'admin';
    profilePic: string;
    isActive: boolean;
    isVerified: boolean;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    email: string;
}

export interface ApiError {
    success: boolean;
    message: string;
}