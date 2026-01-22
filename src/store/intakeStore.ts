import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  IntakeState, 
  TaskResult,
  SessionResults,
  UserProfile,
  UserPreferences,
  SessionFlags,
} from '@/types/intake';

interface IntakeActions {
  // Navigation
  setCurrentSlide: (slide: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  
  // User info
  setUserInfo: (info: { name?: string; email?: string; age?: number | null; gradeLevel?: string }) => void;
  setMicEnabled: (enabled: boolean) => void;
  
  // Task results
  addTask: (task: TaskResult) => void;
  
  // Passage results
  setPassageResults: (wpm: number | null, durationMs: number, transcript: string | null) => void;
  
  // Comprehension
  setComprehensionScore: (score: number) => void;
  
  // Self-report
  setDifficultyPatterns: (patterns: string[]) => void;
  
  // Preferences
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Flags
  setFlags: (flags: Partial<SessionFlags>) => void;
  
  // Utilities
  resetSlideTimer: () => void;
  getTimeOnScreen: () => number;
  resetIntake: () => void;
  
  // Generate final outputs
  generateResults: () => SessionResults;
  generateUserProfile: () => UserProfile;
}

type IntakeStore = IntakeState & IntakeActions;

const initialPreferences: UserPreferences = {
  pacingPreference: 'MEDIUM',
  highlightColor: '#FFFF00',
  fontSizeMultiplier: 1.0,
  enableVoiceFeedback: true,
  enableVisualHighlighting: true,
};

const initialFlags: SessionFlags = {
  avoidReadingAloud: false,
  highAnxietySignals: false,
};

const initialState: IntakeState = {
  sessionId: '',
  userName: '',
  userEmail: '',
  userAge: null,
  gradeLevel: '5-6',
  micEnabled: false,
  tasks: [],
  passageWpm: null,
  passageDurationMs: null,
  passageTranscript: null,
  comprehensionScore: null,
  difficultyPatterns: [],
  preferences: initialPreferences,
  flags: initialFlags,
  currentSlide: 0,
  slideStartTime: Date.now(),
};

export const useIntakeStore = create<IntakeStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Initialize session ID on first use
      sessionId: crypto.randomUUID(),
      
      // Navigation
      setCurrentSlide: (slide) => set({ currentSlide: slide, slideStartTime: Date.now() }),
      nextSlide: () => set((state) => ({ 
        currentSlide: state.currentSlide + 1, 
        slideStartTime: Date.now() 
      })),
      prevSlide: () => set((state) => ({ 
        currentSlide: Math.max(0, state.currentSlide - 1), 
        slideStartTime: Date.now() 
      })),
      
      // User info
      setUserInfo: (info) => set((state) => ({
        userName: info.name ?? state.userName,
        userEmail: info.email ?? state.userEmail,
        userAge: info.age !== undefined ? info.age : state.userAge,
        gradeLevel: info.gradeLevel ?? state.gradeLevel,
      })),
      setMicEnabled: (micEnabled) => set({ micEnabled }),
      
      // Task results
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),
      
      // Passage results
      setPassageResults: (wpm, durationMs, transcript) => set({
        passageWpm: wpm,
        passageDurationMs: durationMs,
        passageTranscript: transcript,
      }),
      
      // Comprehension
      setComprehensionScore: (score) => set({ comprehensionScore: score }),
      
      // Self-report
      setDifficultyPatterns: (patterns) => set({ 
        difficultyPatterns: patterns,
        // Auto-detect anxiety signals
        flags: {
          ...get().flags,
          avoidReadingAloud: patterns.includes('Reading aloud anxiety'),
          highAnxietySignals: patterns.length >= 4,
        }
      }),
      
      // Preferences
      setPreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      
      // Flags
      setFlags: (flags) => set((state) => ({
        flags: { ...state.flags, ...flags }
      })),
      
      // Utilities
      resetSlideTimer: () => set({ slideStartTime: Date.now() }),
      getTimeOnScreen: () => Date.now() - get().slideStartTime,
      
      resetIntake: () => set({ 
        ...initialState, 
        sessionId: crypto.randomUUID(),
        slideStartTime: Date.now() 
      }),
      
      // Generate SessionResults matching results.json structure
      generateResults: (): SessionResults => {
        const state = get();
        
        return {
          id: state.sessionId,
          userId: state.userEmail || crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          gradeBand: state.gradeLevel,
          tasks: state.tasks,
          flags: state.flags,
        };
      },
      
      // Generate UserProfile matching user.json structure
      generateUserProfile: (): UserProfile => {
        const state = get();
        const now = new Date().toISOString();
        
        return {
          id: crypto.randomUUID(),
          email: state.userEmail,
          name: state.userName,
          age: state.userAge,
          gradeLevel: state.gradeLevel,
          readingProfile: {
            baselineWpm: state.passageWpm,
            baselineComprehension: state.comprehensionScore,
            difficultyPatterns: state.difficultyPatterns,
            lastAssessedAt: now,
          },
          preferences: state.preferences,
          createdAt: now,
          updatedAt: now,
        };
      },
    }),
    {
      name: 'dyslexi-assist-intake-v3',
      partialize: (state) => ({
        sessionId: state.sessionId,
        userName: state.userName,
        userEmail: state.userEmail,
        userAge: state.userAge,
        gradeLevel: state.gradeLevel,
        micEnabled: state.micEnabled,
        tasks: state.tasks,
        passageWpm: state.passageWpm,
        passageDurationMs: state.passageDurationMs,
        passageTranscript: state.passageTranscript,
        comprehensionScore: state.comprehensionScore,
        difficultyPatterns: state.difficultyPatterns,
        preferences: state.preferences,
        flags: state.flags,
        currentSlide: state.currentSlide,
      }),
    }
  )
);
