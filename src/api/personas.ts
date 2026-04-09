// src/api/personas.ts
import { apiClient } from './client';
import { Persona, Personality, PersonaMemory } from '../types';

export const personasApi = {
  get: async (subjectId: string): Promise<Persona> => {
    const res = await apiClient.get<Persona>(`/subjects/${subjectId}/persona`);
    return res.data;
  },

  create: async (subjectId: string, name: string, personality: Personality): Promise<Persona> => {
    const res = await apiClient.post<Persona>(`/subjects/${subjectId}/persona`, {
      name,
      personality,
    });
    return res.data;
  },

  update: async (
    subjectId: string,
    fields: { name?: string; personality?: Personality }
  ): Promise<Persona> => {
    const res = await apiClient.patch<Persona>(`/subjects/${subjectId}/persona`, fields);
    return res.data;
  },

  delete: async (subjectId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/persona`);
  },

  // ── Memory ──
  getMemory: async (subjectId: string): Promise<PersonaMemory[]> => {
    const res = await apiClient.get<PersonaMemory[]>(`/subjects/${subjectId}/persona/memory`);
    return res.data;
  },

  getMemoryItem: async (subjectId: string, memoryId: string): Promise<PersonaMemory> => {
    const res = await apiClient.get<PersonaMemory>(`/subjects/${subjectId}/persona/memory/${memoryId}`);
    return res.data;
  },

  deleteMemoryItem: async (subjectId: string, memoryId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/persona/memory/${memoryId}`);
  },
};
