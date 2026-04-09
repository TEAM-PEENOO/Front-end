// src/api/curriculum.ts
import { apiClient } from './client';
import { CurriculumItem } from '../types';

export const curriculumApi = {
  list: async (subjectId: string): Promise<CurriculumItem[]> => {
    const res = await apiClient.get<CurriculumItem[]>(`/subjects/${subjectId}/curriculum`);
    return res.data;
  },

  get: async (subjectId: string, itemId: string): Promise<CurriculumItem> => {
    const res = await apiClient.get<CurriculumItem>(`/subjects/${subjectId}/curriculum/${itemId}`);
    return res.data;
  },

  create: async (subjectId: string, title: string, note?: string, order_index?: number): Promise<CurriculumItem> => {
    const res = await apiClient.post<CurriculumItem>(`/subjects/${subjectId}/curriculum`, {
      title,
      note,
      order_index,
    });
    return res.data;
  },

  update: async (subjectId: string, itemId: string, fields: { title?: string; note?: string }): Promise<CurriculumItem> => {
    const res = await apiClient.patch<CurriculumItem>(`/subjects/${subjectId}/curriculum/${itemId}`, fields);
    return res.data;
  },

  reorder: async (subjectId: string, order: string[]): Promise<{ id: string; order_index: number }[]> => {
    const res = await apiClient.put<{ id: string; order_index: number }[]>(
      `/subjects/${subjectId}/curriculum/reorder`,
      { order }
    );
    return res.data;
  },

  delete: async (subjectId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/curriculum/${itemId}`);
  },
};
