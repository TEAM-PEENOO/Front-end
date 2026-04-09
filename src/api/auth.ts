// src/api/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  /** 백엔드가 redirect로 전달해준 JWT를 저장 */
  saveToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem('access_token', token);
  },

  /** 저장된 JWT로 내 정보 조회 */
  me: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('access_token');
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/me');
    await AsyncStorage.removeItem('access_token');
  },
};
