// src/api/weakPoints.ts
import { apiClient } from './client';
import { WeakPointTag } from '../types';

export const weakPointsApi = {
  list: async (subjectId: string): Promise<WeakPointTag[]> => {
    const res = await apiClient.get<{ data: WeakPointTag[] }>(
      `/subjects/${subjectId}/persona/weak-points`
    );
    return res.data.data;
  },

  get: async (subjectId: string, tagId: string): Promise<WeakPointTag> => {
    const res = await apiClient.get<{ data: WeakPointTag }>(
      `/subjects/${subjectId}/persona/weak-points/${tagId}`
    );
    return res.data.data;
  },

  delete: async (subjectId: string, tagId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/persona/weak-points/${tagId}`);
  },
};
