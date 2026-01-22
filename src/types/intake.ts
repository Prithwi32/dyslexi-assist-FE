// Dyslexi-Assist Intake Data Types
// Matching exact JSON structures from user.json and results.json

// ============= Results JSON Structure =============

export interface SessionResults {
  id: string;                    // Session ID
  userId: string;                // Reference to user
  createdAt: string;             // ISO timestamp
  gradeBand: string;             // Grade level band
  tasks: TaskResult[];           // All task results
  flags: SessionFlags;           // Behavioral flags
}

export interface TaskResult {
  taskId: string;                // Unique task identifier
  type: TaskType;                // Task category
  difficulty: number;            // 1-5 difficulty level
  correct: boolean | null;       // null if not scored
  responseTimeMs: number;        // Time to respond
  errorType: string | null;      // Type of error if incorrect
  transcript: string | null;     // Voice transcription if applicable
}

export type TaskType = 
  | 'reading'
  | 'writing'
  | 'letter_sound'
  | 'phoneme_blend'
  | 'phoneme_segment'
  | 'rapid_naming'
  | 'real_word'
  | 'nonword'
  | 'comprehension';

export interface SessionFlags {
  avoidReadingAloud: boolean;
  highAnxietySignals: boolean;
}

// ============= User Profile JSON Structure =============

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number | null;
  gradeLevel: string;
  readingProfile: ReadingProfile;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProfile {
  baselineWpm: number | null;
  baselineComprehension: number | null;
  difficultyPatterns: string[];
  lastAssessedAt: string | null;
}

export interface UserPreferences {
  pacingPreference: 'SLOW' | 'MEDIUM' | 'FAST';
  highlightColor: string;
  fontSizeMultiplier: number;
  enableVoiceFeedback: boolean;
  enableVisualHighlighting: boolean;
}

// ============= Intake Store State =============

export interface IntakeState {
  // Session info
  sessionId: string;
  
  // User info for profile creation
  userName: string;
  userEmail: string;
  userAge: number | null;
  gradeLevel: string;
  
  // Microphone consent
  micEnabled: boolean;
  
  // Collected task results
  tasks: TaskResult[];
  
  // Reading metrics calculated from passage
  passageWpm: number | null;
  passageDurationMs: number | null;
  passageTranscript: string | null;
  
  // Comprehension score
  comprehensionScore: number | null;
  
  // Self-reported challenges
  difficultyPatterns: string[];
  
  // User preferences
  preferences: UserPreferences;
  
  // Behavioral flags
  flags: SessionFlags;
  
  // Navigation
  currentSlide: number;
  slideStartTime: number;
}

// ============= Data Item Types (for slides) =============

export interface LetterSoundItem {
  id: string;
  prompt: string;
  targetSound: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
}

export interface PhonemeBlendItem {
  id: string;
  prompt: string;
  audioText: string;
  options: string[];
  correctAnswer: string;
  distractorType: string;
  difficulty: number;
}

export interface PhonemeSegmentItem {
  id: string;
  prompt: string;
  word: string;
  correctCount: number;
  difficulty: number;
}

export interface WordItem {
  id: string;
  word: string;
  options?: string[];
  correctSpelling?: string;
  difficulty: number;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  questionType: 'literal' | 'inferential' | 'vocab_in_context';
  difficulty: number;
}

// ============= Legacy Types (for backwards compatibility) =============

export interface UserSession {
  userId: string;
  username: string;
  isLoggedIn: boolean;
  createdAt: string;
}
