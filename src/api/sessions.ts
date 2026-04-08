// src/api/sessions.ts
import { apiClient, streamFetch } from './client';
import { TeachingSession } from '../types';

interface SessionListParams {
  curriculum_item_id?: string;
  limit?: number;
  offset?: number;
}

interface EndSessionResult {
  session_id: string;
  quality_score: number;
  weak_points: { concept: string; description: string }[];
  updated_memories: { concept: string; summary: string; taught_count: number; retention: number }[];
}

export const sessionsApi = {
  list: async (subjectId: string, params?: SessionListParams): Promise<{ data: TeachingSession[]; total: number }> => {
    const res = await apiClient.get<{ data: TeachingSession[]; total: number }>(
      `/subjects/${subjectId}/persona/sessions`,
      { params }
    );
    return res.data;
  },

  get: async (subjectId: string, sessionId: string): Promise<TeachingSession> => {
    const res = await apiClient.get<{ data: TeachingSession }>(
      `/subjects/${subjectId}/persona/sessions/${sessionId}`
    );
    return res.data.data;
  },

  create: async (subjectId: string, concept: string, curriculum_item_id?: string): Promise<TeachingSession> => {
    const res = await apiClient.post<{ data: TeachingSession }>(
      `/subjects/${subjectId}/persona/sessions`,
      { concept, curriculum_item_id }
    );
    return res.data.data;
  },

  /** SSE 스트리밍 채팅 — onDelta로 토큰 단위 업데이트 */
  chat: async (
    subjectId: string,
    sessionId: string,
    message: string,
    onDelta: (delta: string) => void
  ): Promise<void> => {
    await streamFetch(
      `/subjects/${subjectId}/persona/sessions/${sessionId}/chat`,
      { message },
      onDelta
    );
  },

  end: async (subjectId: string, sessionId: string): Promise<EndSessionResult> => {
    const res = await apiClient.post<{ data: EndSessionResult }>(
      `/subjects/${subjectId}/persona/sessions/${sessionId}/end`
    );
    return res.data.data;
  },

  delete: async (subjectId: string, sessionId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/persona/sessions/${sessionId}`);
  },
};
