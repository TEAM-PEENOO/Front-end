// src/api/progress.ts
import { apiClient } from './client';
import { Progress } from '../types';

export const progressApi = {
  get: async (subjectId: string): Promise<Progress> => {
    const res = await apiClient.get<{ data: Progress }>(`/subjects/${subjectId}/progress`);
    return res.data.data;
  },
};
