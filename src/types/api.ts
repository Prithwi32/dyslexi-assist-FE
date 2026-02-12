// Backend API Types based on API_GUIDE.md

// ============= Common Types =============

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface ErrorResponse {
  detail: string;
}

// ============= User Management Types =============

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  age: number;
  grade_level: string;
  metadata?: Record<string, unknown>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  age: number;
  grade_level: string;
  created_at: string;
  last_login: string | null;
  metadata?: Record<string, unknown>;
}

export interface RegisterResponse extends ApiResponse {
  user: User;
  access_token: string | null;
}

export interface LoginResponse extends ApiResponse {
  user: User;
  access_token: string | null;
}

// ============= Assignment Types =============

export interface TaskSubmission {
  task_type: string;
  prompt: string;
  user_response: string;
  correct_answer: string;
  is_correct: boolean;
  response_time_ms: number;
  difficulty_level: number;
  metadata?: Record<string, unknown>;
}

export interface BehavioralFlags {
  avoid_reading_aloud?: boolean;
  high_anxiety_signals?: boolean;
  frequent_breaks_needed?: boolean;
  prefers_visual_aids?: boolean;
  struggles_with_instructions?: boolean;
  easily_distracted?: boolean;
  low_confidence?: boolean;
  frustration_evident?: boolean;
  needs_encouragement?: boolean;
  slow_processing_speed?: boolean;
  difficulty_tracking_text?: boolean;
  reverses_letters_numbers?: boolean;
  trouble_with_sequencing?: boolean;
  memory_issues?: boolean;
}

export interface SubmitAssignmentRequest {
  user_id: string;
  session_id: string;
  assignment_name: string;
  assignment_type: string;
  tasks: TaskSubmission[];
  flags: BehavioralFlags;
  metadata?: Record<string, unknown>;
}

export interface AssignmentMetrics {
  accuracy: number;
  average_response_time_ms: number;
}

export interface SubmitAssignmentResponse extends ApiResponse {
  assignment_id: string;
  metrics: AssignmentMetrics;
}

export interface Assignment {
  _id: string;
  user_id: string;
  session_id: string;
  assignment_name: string;
  assignment_type: string;
  accuracy: number;
  average_response_time_ms: number;
  created_at: string;
}

export interface GetAssignmentsResponse extends ApiResponse {
  user_id: string;
  total_assignments: number;
  assignments: Assignment[];
}

export interface WeaknessAnalysis {
  overall_accuracy: number;
  behavioral_patterns: Record<string, number>;
  task_type_accuracy: Record<string, number>;
  recommendations: string[];
}

export interface GetWeaknessesResponse extends ApiResponse {
  user_id: string;
  analysis: WeaknessAnalysis;
}

// ============= Session Types =============

export interface GazePoint {
  x: number;  // 0.0 to 1.0
  y: number;  // 0.0 to 1.0
  t: number;  // Unix timestamp
}

export interface StartSessionResponse extends ApiResponse {
  session_id: string;
  file_name: string;
  study_text: string;
  text_length: number;
  metadata?: Record<string, unknown>;
}

export interface ProcessChunkRequest {
  session_id: string;
  gaze: GazePoint[];
  transcript: string;
}

export interface ConcentrationAnalysis {
  focus_level: string;
  issues: string[];
  attention_span: string;
}

export interface ChunkAnalysis {
  reading_score: number;
  performance_category: 'excellent' | 'good' | 'needs_improvement' | 'struggling';
  errors_detected: string[];
  concentration_analysis: ConcentrationAnalysis;
  pronunciation_issues: string[];
  feedback: string;
  intervention_needed: boolean;
  intervention_message: string;
}

export interface SessionInfo {
  total_chunks_processed: number;
  average_score: number;
}

export interface ProcessChunkResponse extends ApiResponse {
  analysis: ChunkAnalysis;
  session_info: SessionInfo;
}

export interface EndSessionRequest {
  session_id: string;
}

export interface EndSessionResponse extends ApiResponse {
  session_id: string;
  user_id: string;
  file_name: string;
  total_chunks_processed: number;
  total_errors: number;
  average_score: number;
  feedback_count: number;
}

export interface SessionChunkData {
  chunk_number: number;
  transcript: string;
  gaze_points_count: number;
  reading_score: number;
  errors_count: number;
  timestamp: string;
}

export interface SessionAnalyticsData {
  session_id: string;
  user_id: string;
  total_chunks: number;
  average_score: number;
  total_errors: number;
  completed: boolean;
  created_at: string;
  chunks: SessionChunkData[];
}

export interface GetSessionAnalyticsResponse extends ApiResponse {
  analytics: SessionAnalyticsData;
}

// ============= Progress Types =============

export interface SessionSummary {
  session_id: string;
  user_id: string;
  file_name: string;
  study_text_preview: string;
  total_chunks_processed: number;
  average_score: number;
  total_errors: number;
  completed: boolean;
  created_at: string;
}

export interface GetUserSessionsResponse extends ApiResponse {
  user_id: string;
  total_sessions: number;
  sessions: SessionSummary[];
}

export interface RecentSession {
  session_id: string;
  file_name: string;
  average_score: number;
  chunks_processed: number;
  created_at: string;
}

export interface UserProgress {
  user_id: string;
  total_sessions: number;
  completed_sessions: number;
  total_chunks_processed: number;
  overall_average_score: number;
  recent_sessions: RecentSession[];
}

export interface GetUserProgressResponse extends ApiResponse {
  progress: UserProgress;
}

// ============= Health Check Type =============

export interface HealthResponse {
  status: string;
  version: string;
}

// ============= Debug Types =============

export interface SessionDebugInfo {
  session_id: string;
  user_id: string;
  file_name: string;
  total_chunks_processed: number;
  total_errors: number;
  average_score: number;
  feedback_count: number;
}

export interface DebugSessionsResponse {
  active_sessions: number;
  sessions: Record<string, SessionDebugInfo>;
}

export interface ClearSessionsResponse {
  ok: boolean;
  cleared_sessions: number;
}
