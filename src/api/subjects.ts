// src/api/subjects.ts
import { apiClient } from './client';
import { Subject } from '../types';

export const subjectsApi = {
  list: async (): Promise<Subject[]> => {
    const res = await apiClient.get<{ data: Subject[] }>('/subjects');
    return res.data.data;
  },

  get: async (subjectId: string): Promise<Subject> => {
    const res = await apiClient.get<{ data: Subject }>(`/subjects/${subjectId}`);
    return res.data.data;
  },

  create: async (name: string, description?: string): Promise<Subject> => {
    const res = await apiClient.post<{ data: Subject }>('/subjects', { name, description });
    return res.data.data;
  },

  update: async (subjectId: string, fields: { name?: string; description?: string }): Promise<Subject> => {
    const res = await apiClient.patch<{ data: Subject }>(`/subjects/${subjectId}`, fields);
    return res.data.data;
  },

  delete: async (subjectId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}`);
  },
};
