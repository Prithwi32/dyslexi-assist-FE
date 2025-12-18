// Dyslexi-Assist Intake Data Types
// Matches the required JSON export schema exactly

export interface ModalitiesEnabled {
  mic: boolean;
  eye: boolean;
}

export interface UIPreferences {
  font_size: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'soft';
  highlight_mode: 'word' | 'line' | 'none';
  tts_default_rate: number;
  preferred_mode: 'listening_first' | 'silent_reading' | 'reading_aloud' | 'mixed';
}

export interface AttemptResponse {
  choice_id: string | null;
  text: string | null;
  audio_blob_id: string | null;
}

export interface AttemptTiming {
  rt_ms: number;
  time_on_screen_ms: number;
}

export interface AttemptScoring {
  is_correct: boolean | null;
  error_type: string | null;
  partial_credit: number;
  expected: string | null;
}

export interface AttemptFeatures {
  distractor_type: string | null;
  difficulty_level: number;
}

export interface AttemptQuality {
  asr_confidence: number | null;
  device_lag_ms: number;
}

export interface Attempt {
  screen_id: string;
  task_type: string;
  item_id: string;
  presented_at: number;
  response: AttemptResponse;
  timing: AttemptTiming;
  scoring: AttemptScoring;
  features: AttemptFeatures;
  quality: AttemptQuality;
}

export interface DerivedProfile {
  phonological_awareness_score: number | null;
  ran_speed_score: number | null;
  decoding_accuracy_score: number | null;
  decoding_fluency_score: number | null;
  comprehension_literal: number | null;
  comprehension_inferential: number | null;
  vocab_in_context: number | null;
  confidence_calibration: number | null;
}

export interface Flags {
  avoid_reading_aloud: boolean;
  high_anxiety_signals: boolean;
  low_asr_quality: boolean;
}

export interface SelfReportData {
  hardest_aspects: string[];
  other_text: string | null;
}

export interface IntakePayload {
  user_id: string;
  intake_session_id: string;
  created_at: string;
  locale: string;
  grade_band: 'primary' | 'middle_school' | 'high_school' | 'adult';
  modalities_enabled: ModalitiesEnabled;
  ui_preferences: UIPreferences;
  attempts: Attempt[];
  derived_profile_v1: DerivedProfile;
  flags: Flags;
  self_report?: SelfReportData;
}

// Slide-specific item types
export interface LetterSoundItem {
  id: string;
  prompt: string;
  targetSound: string;
  options: string[];
  correctAnswer: string;
}

export interface PhonemeBlendItem {
  id: string;
  prompt: string;
  audioId: string;
  options: string[];
  correctAnswer: string;
  distractorType: string;
}

export interface PhonemeSegmentItem {
  id: string;
  prompt: string;
  audioId: string;
  correctCount: number;
}

export interface WordItem {
  id: string;
  word: string;
  audioId: string;
  options?: string[]; // For no-voice mode
  correctSpelling?: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType: 'literal' | 'inferential' | 'vocab_in_context';
}

// User session
export interface UserSession {
  userId: string;
  username: string;
  isLoggedIn: boolean;
  createdAt: string;
}
