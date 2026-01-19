// Dyslexi-Assist Intake Data Types
// Simplified and intuitive structure

// ============= Core Types =============

export interface IntakePayload {
  // Session metadata
  session_id: string;
  user_id: string;
  created_at: string;
  
  // User settings
  settings: {
    locale: string;
    grade_band: 'primary' | 'middle_school' | 'high_school' | 'adult';
    mic_enabled: boolean;
    preferences: {
      font_size: 'small' | 'medium' | 'large';
      theme: 'light' | 'dark' | 'soft';
      highlight_mode: 'word' | 'line' | 'none';
      reading_mode: 'listening_first' | 'silent_reading' | 'reading_aloud' | 'mixed';
    };
  };
  
  // Assessment results by section
  results: {
    letter_sounds: TaskResult[];
    phoneme_blending: TaskResult[];
    phoneme_segmentation: TaskResult[];
    rapid_naming: RapidNamingResult | null;
    real_words: TaskResult[];
    nonwords: TaskResult[];
    passage: PassageResult | null;
    comprehension: TaskResult[];
    self_report: SelfReport;
  };
  
  // Summary scores (computed later by backend)
  scores?: ScoreSummary;
  
  // Flags for personalization
  flags: {
    avoid_reading_aloud: boolean;
    high_anxiety: boolean;
  };
}

// ============= Task Results =============

export interface TaskResult {
  item_id: string;
  task_type: string;
  response: string | null;           // What the user chose/said
  expected: string | null;           // Correct answer
  is_correct: boolean | null;        // null if not scored (e.g., voice mode without ASR)
  response_time_ms: number;
  transcription?: string | null;     // STT result if voice mode
  confidence?: number | null;        // ASR confidence 0-1
}

export interface RapidNamingResult {
  mode: 'voice' | 'tap';
  total_time_ms: number;
  items_count: number;
  errors: number;                    // Mistaps or missed items
  transcription?: string | null;
}

export interface PassageResult {
  mode: 'voice' | 'listen';
  duration_seconds: number;
  word_count: number;
  transcription?: string | null;
  words_per_minute?: number | null;
}

export interface SelfReport {
  challenges: string[];              // What feels hardest
  other_notes: string | null;        // Free text
}

// ============= Score Summary =============

export interface ScoreSummary {
  phonological_awareness: number | null;
  rapid_naming_speed: number | null;
  decoding_accuracy: number | null;
  reading_fluency: number | null;
  comprehension: number | null;
}

// ============= Data Item Types (for slides) =============

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
  audioText: string;           // Text to speak via TTS
  options: string[];
  correctAnswer: string;
  distractorType: string;
}

export interface PhonemeSegmentItem {
  id: string;
  prompt: string;
  word: string;                // Word to speak
  correctCount: number;
}

export interface WordItem {
  id: string;
  word: string;
  options?: string[];
  correctSpelling?: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType: 'literal' | 'inferential' | 'vocab_in_context';
}

// ============= Legacy Types (deprecated) =============

export interface UserSession {
  userId: string;
  username: string;
  isLoggedIn: boolean;
  createdAt: string;
}

// For backwards compatibility during migration
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
