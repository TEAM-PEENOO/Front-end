// src/api/weakPoints.ts
import { apiClient } from './client';
import { WeakPointTag, PracticeData } from '../types';

export const weakPointsApi = {
  list: async (subjectId: string): Promise<WeakPointTag[]> => {
    const res = await apiClient.get<WeakPointTag[]>(
      `/subjects/${subjectId}/persona/weak-points`
    );
    return res.data;
  },

  get: async (subjectId: string, tagId: string): Promise<WeakPointTag> => {
    const res = await apiClient.get<WeakPointTag>(
      `/subjects/${subjectId}/persona/weak-points/${tagId}`
    );
    return res.data;
  },

  delete: async (subjectId: string, tagId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/persona/weak-points/${tagId}`);
  },

  practice: async (subjectId: string, tagId: string): Promise<PracticeData> => {
    const res = await apiClient.post<PracticeData>(
      `/subjects/${subjectId}/persona/weak-points/${tagId}/practice`
    );
    return res.data;
  },
};
