// src/api/subjects.ts
import { apiClient } from './client';
import { Subject } from '../types';

export const subjectsApi = {
  list: async (): Promise<Subject[]> => {
    const res = await apiClient.get<Subject[]>('/subjects');
    return res.data;
  },

  get: async (subjectId: string): Promise<Subject> => {
    const res = await apiClient.get<Subject>(`/subjects/${subjectId}`);
    return res.data;
  },

  create: async (name: string, description?: string): Promise<Subject> => {
    const res = await apiClient.post<Subject>('/subjects', { name, description });
    return res.data;
  },

  update: async (subjectId: string, fields: { name?: string; description?: string }): Promise<Subject> => {
    const res = await apiClient.patch<Subject>(`/subjects/${subjectId}`, fields);
    return res.data;
  },

  delete: async (subjectId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}`);
  },
};
