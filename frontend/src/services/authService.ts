import { api } from './api';
import type { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth.types';

export const AuthService = {
  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    return response.data;
  },

  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    return response.data;
  },
};
