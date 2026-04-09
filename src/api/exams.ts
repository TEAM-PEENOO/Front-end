// src/api/exams.ts
import { apiClient } from './client';
import { Exam, GradeResult, UserAnswer } from '../types';

export const examsApi = {
  list: async (subjectId: string, stageId?: string): Promise<Exam[]> => {
    const res = await apiClient.get<{ data: Exam[] }>(
      `/subjects/${subjectId}/persona/exams`,
      { params: stageId ? { stage_id: stageId } : undefined }
    );
    return res.data.data;
  },

  get: async (subjectId: string, examId: string): Promise<Exam> => {
    const res = await apiClient.get<{ data: Exam }>(`/subjects/${subjectId}/persona/exams/${examId}`);
    return res.data.data;
  },

  /** 시험 생성 — 해금 조건 미충족 시 422 EXAM_LOCKED 에러 throw */
  create: async (subjectId: string, stageId: string): Promise<Exam> => {
    const res = await apiClient.post<{ data: Exam }>(
      `/subjects/${subjectId}/stages/${stageId}/exams`
    );
    return res.data.data;
  },

  submitUserAnswers: async (subjectId: string, examId: string, answers: UserAnswer[]): Promise<void> => {
    await apiClient.put(`/subjects/${subjectId}/persona/exams/${examId}/user-answers`, { answers });
  },

  grade: async (subjectId: string, examId: string): Promise<GradeResult> => {
    const res = await apiClient.post<{ data: GradeResult }>(
      `/subjects/${subjectId}/persona/exams/${examId}/grade`
    );
    return res.data.data;
  },

  delete: async (subjectId: string, examId: string): Promise<void> => {
    await apiClient.delete(`/subjects/${subjectId}/persona/exams/${examId}`);
  },

  examHistory: async (subjectId: string, stageId: string) => {
    const res = await apiClient.get<{ data: any }>(`/subjects/${subjectId}/stages/${stageId}/exam-history`);
    return res.data.data;
  },
};
