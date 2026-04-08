// src/api/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/register', { email, password });
    await AsyncStorage.setItem('access_token', res.data.data.access_token);
    return res.data.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', { email, password });
    await AsyncStorage.setItem('access_token', res.data.data.access_token);
    return res.data.data;
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get<{ data: User }>('/auth/me');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('access_token');
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/me');
    await AsyncStorage.removeItem('access_token');
  },
};
