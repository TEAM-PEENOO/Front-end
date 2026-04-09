// src/api/stages.ts
import { apiClient } from './client';
import { Stage } from '../types';

export const stagesApi = {
  list: async (subjectId: string): Promise<Stage[]> => {
    const res = await apiClient.get<Stage[]>(`/subjects/${subjectId}/stages`);
    return res.data;
  },

  get: async (subjectId: string, stageId: string): Promise<Stage> => {
    const res = await apiClient.get<Stage>(`/subjects/${subjectId}/stages/${stageId}`);
    return res.data;
  },

  create: async (
    subjectId: string,
    name: string,
    curriculum_item_ids?: string[],
    order_index?: number
  ): Promise<Stage> => {
    const res = await apiClient.post<Stage>(`/subjects/${subjectId}/stages`, {
      name,
      curriculum_item_ids,
      order_index,
    });
    return res.data;
  },

  update: async (
    subjectId: string,
    stageId: string,
    fields: { name?: string; curriculum_item_ids?: string[] }
  ): Promise<Stage> => {
    const res = await apiClient.patch<Stage>(`/subjects/${subjectId}/stages/${stageId}`, fields);
    return res.data;
  },

  reorder: async (subjectId: string, order: string[]): Promise<{ id: string; order_index: number }[]> => {
    const res = await apiClient.put<{ id: string; order_index: number }[]>(
      `/subjects/${subjectId}/stages/reorder`,
      { order }
    );
    return res.data;
  },

  delete: async (subjectId: string, stageId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/stages/${stageId}`);
  },
};
