// src/api/personas.ts
import { apiClient } from './client';
import { Persona, Personality, PersonaMemory } from '../types';

export const personasApi = {
  get: async (subjectId: string): Promise<Persona> => {
    const res = await apiClient.get<{ data: Persona }>(`/subjects/${subjectId}/persona`);
    return res.data.data;
  },

  create: async (subjectId: string, name: string, personality: Personality): Promise<Persona> => {
    const res = await apiClient.post<{ data: Persona }>(`/subjects/${subjectId}/persona`, {
      name,
      personality,
    });
    return res.data.data;
  },

  update: async (
    subjectId: string,
    fields: { name?: string; personality?: Personality }
  ): Promise<Persona> => {
    const res = await apiClient.patch<{ data: Persona }>(`/subjects/${subjectId}/persona`, fields);
    return res.data.data;
  },

  delete: async (subjectId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/persona`);
  },

  // ── Memory ──
  getMemory: async (subjectId: string): Promise<PersonaMemory[]> => {
    const res = await apiClient.get<{ data: PersonaMemory[] }>(`/subjects/${subjectId}/persona/memory`);
    return res.data.data;
  },

  getMemoryItem: async (subjectId: string, memoryId: string): Promise<PersonaMemory> => {
    const res = await apiClient.get<{ data: PersonaMemory }>(`/subjects/${subjectId}/persona/memory/${memoryId}`);
    return res.data.data;
  },

  deleteMemoryItem: async (subjectId: string, memoryId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/persona/memory/${memoryId}`);
  },
};
