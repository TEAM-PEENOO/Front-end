// ── Auth ──────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// ── Subject ───────────────────────────────────────────────────────────
export interface Subject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  persona: PersonaSummary | null;
}

// ── Curriculum Item ───────────────────────────────────────────────────
export interface CurriculumItem {
  id: string;
  subject_id: string;
  title: string;
  note: string | null;
  order_index: number;
  created_at: string;
  taught: boolean;
}

// ── Stage ─────────────────────────────────────────────────────────────
export interface StageItem {
  id: string;
  title: string;
  order_index: number;
  taught: boolean;
}

export interface Stage {
  id: string;
  subject_id: string;
  name: string;
  order_index: number;
  passed: boolean;
  passed_at: string | null;
  created_at: string;
  curriculum_items: StageItem[];
  exam_unlocked: boolean;
  untaught_count: number;
}

// ── Persona ───────────────────────────────────────────────────────────
export type Personality = 'curious' | 'careful' | 'clumsy' | 'perfectionist';

export interface PersonaSummary {
  id: string;
  name: string;
  personality: Personality;
  current_stage_id: string | null;
}

export interface Persona extends PersonaSummary {
  subject_id: string;
  created_at: string;
}

// ── Persona Memory ────────────────────────────────────────────────────
export type RetentionLabel = '선명' | '흐릿해지는 중' | '많이 흐릿함' | '거의 잊어버림' | '잊어버림';

export interface PersonaMemory {
  id: string;
  concept: string;
  summary: string | null;
  taught_count: number;
  stability: number;
  last_taught_at: string;
  retention: number;
  retention_label: RetentionLabel;
  curriculum_item_id: string | null;
}

// ── Teaching Session ──────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface WeakPoint {
  concept: string;
  description: string;
}

export interface TeachingSession {
  id: string;
  persona_id: string;
  curriculum_item_id: string | null;
  concept: string;
  quality_score: number | null;
  weak_points: WeakPoint[];
  messages: ChatMessage[];
  summary_generated: boolean;
  created_at: string;
}

// ── Exam ──────────────────────────────────────────────────────────────
export type QuestionType = 'multiple_choice' | 'short_answer';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options: string[] | null;
  answer?: string; // 채점 전까지 서버가 숨김
  concept_tag: string;
  difficulty: 1 | 2 | 3;
}

export interface UserAnswer {
  question_id: string;
  answer: string;
}

export interface PersonaAnswer {
  question_id: string;
  thought: string;
  answer: string;
}

export interface Exam {
  id: string;
  stage_id: string;
  questions: ExamQuestion[];
  user_answers: UserAnswer[];
  persona_answers: PersonaAnswer[];
  user_score: number | null;
  persona_score: number | null;
  combined_score: number | null;
  passed: boolean | null;
  created_at: string;
}

export interface GradeResult {
  exam_id: string;
  user_score: number;
  persona_score: number;
  combined_score: number;
  passed: boolean;
  pass_threshold: number;
  persona_answers: PersonaAnswer[];
  wrong_concepts: string[];
  next_stage_id: string | null;
}

// ── Weak Point Tag ────────────────────────────────────────────────────
export interface WeakPointTag {
  id: string;
  concept: string;
  fail_count: number;
  last_failed_at: string;
  created_at: string;
}

// ── Practice ──────────────────────────────────────────────────────────
export interface PracticeData {
  concept: string;
  fail_count: number;
  problem: string;
  hints: string[];
  concept_title: string;
  concept_explanation: string;
}

// ── Progress ──────────────────────────────────────────────────────────
export interface ProgressStageItem {
  id: string;
  title: string;
  taught: boolean;
  retention: number;
  retention_label: RetentionLabel;
}

export interface ProgressCurrentStage {
  id: string;
  name: string;
  order_index: number;
  exam_unlocked: boolean;
  untaught_count: number;
  items: ProgressStageItem[];
}

export interface ExamScore {
  exam_id: string;
  combined_score: number;
  passed: boolean;
  created_at: string;
}

export interface StageHistory {
  stage_id: string;
  stage_name: string;
  passed: boolean;
  passed_at: string | null;
  exam_scores: ExamScore[];
}

export interface Progress {
  subject: { id: string; name: string };
  persona: { id: string; name: string; personality: Personality };
  current_stage: ProgressCurrentStage | null;
  overall_retention: number;
  stage_history: StageHistory[];
  weak_points: { concept: string; fail_count: number }[];
}
