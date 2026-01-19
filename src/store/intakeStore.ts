import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  IntakePayload, 
  TaskResult,
  RapidNamingResult,
  PassageResult,
  SelfReport,
} from '@/types/intake';

interface IntakeState {
  // Current slide index
  currentSlide: number;
  
  // Settings
  locale: string;
  gradeBand: 'primary' | 'middle_school' | 'high_school' | 'adult';
  micEnabled: boolean;
  preferences: {
    font_size: 'small' | 'medium' | 'large';
    theme: 'light' | 'dark' | 'soft';
    highlight_mode: 'word' | 'line' | 'none';
    reading_mode: 'listening_first' | 'silent_reading' | 'reading_aloud' | 'mixed';
  };
  
  // Results by section
  letterSounds: TaskResult[];
  phonemeBlending: TaskResult[];
  phonemeSegmentation: TaskResult[];
  rapidNaming: RapidNamingResult | null;
  realWords: TaskResult[];
  nonwords: TaskResult[];
  passage: PassageResult | null;
  comprehension: TaskResult[];
  selfReport: SelfReport;
  
  // Timing
  slideStartTime: number;
  
  // Actions
  setCurrentSlide: (slide: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setLocale: (locale: string) => void;
  setGradeBand: (band: 'primary' | 'middle_school' | 'high_school' | 'adult') => void;
  setMicEnabled: (enabled: boolean) => void;
  setPreferences: (prefs: Partial<IntakeState['preferences']>) => void;
  
  // Result setters
  addLetterSound: (result: TaskResult) => void;
  addPhonemeBlend: (result: TaskResult) => void;
  addPhonemeSegment: (result: TaskResult) => void;
  setRapidNaming: (result: RapidNamingResult) => void;
  addRealWord: (result: TaskResult) => void;
  addNonword: (result: TaskResult) => void;
  setPassage: (result: PassageResult) => void;
  addComprehension: (result: TaskResult) => void;
  setSelfReport: (report: Partial<SelfReport>) => void;
  
  // Utilities
  resetSlideTimer: () => void;
  getTimeOnScreen: () => number;
  resetIntake: () => void;
  generatePayload: (userId: string) => IntakePayload;
}

const initialPreferences = {
  font_size: 'large' as const,
  theme: 'soft' as const,
  highlight_mode: 'word' as const,
  reading_mode: 'mixed' as const,
};

const initialState = {
  currentSlide: 0,
  locale: 'en-IN',
  gradeBand: 'middle_school' as const,
  micEnabled: false,
  preferences: initialPreferences,
  letterSounds: [],
  phonemeBlending: [],
  phonemeSegmentation: [],
  rapidNaming: null,
  realWords: [],
  nonwords: [],
  passage: null,
  comprehension: [],
  selfReport: {
    challenges: [],
    other_notes: null,
  },
  slideStartTime: Date.now(),
};

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentSlide: (slide) => set({ currentSlide: slide, slideStartTime: Date.now() }),
      nextSlide: () => set((state) => ({ 
        currentSlide: state.currentSlide + 1, 
        slideStartTime: Date.now() 
      })),
      prevSlide: () => set((state) => ({ 
        currentSlide: Math.max(0, state.currentSlide - 1), 
        slideStartTime: Date.now() 
      })),
      
      setLocale: (locale) => set({ locale }),
      setGradeBand: (gradeBand) => set({ gradeBand }),
      setMicEnabled: (micEnabled) => set({ micEnabled }),
      setPreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      
      addLetterSound: (result) => set((state) => ({
        letterSounds: [...state.letterSounds, result]
      })),
      addPhonemeBlend: (result) => set((state) => ({
        phonemeBlending: [...state.phonemeBlending, result]
      })),
      addPhonemeSegment: (result) => set((state) => ({
        phonemeSegmentation: [...state.phonemeSegmentation, result]
      })),
      setRapidNaming: (rapidNaming) => set({ rapidNaming }),
      addRealWord: (result) => set((state) => ({
        realWords: [...state.realWords, result]
      })),
      addNonword: (result) => set((state) => ({
        nonwords: [...state.nonwords, result]
      })),
      setPassage: (passage) => set({ passage }),
      addComprehension: (result) => set((state) => ({
        comprehension: [...state.comprehension, result]
      })),
      setSelfReport: (report) => set((state) => ({
        selfReport: { ...state.selfReport, ...report }
      })),
      
      resetSlideTimer: () => set({ slideStartTime: Date.now() }),
      getTimeOnScreen: () => Date.now() - get().slideStartTime,
      
      resetIntake: () => set({ ...initialState, slideStartTime: Date.now() }),
      
      generatePayload: (userId: string): IntakePayload => {
        const state = get();
        
        return {
          session_id: crypto.randomUUID(),
          user_id: userId,
          created_at: new Date().toISOString(),
          
          settings: {
            locale: state.locale,
            grade_band: state.gradeBand,
            mic_enabled: state.micEnabled,
            preferences: state.preferences,
          },
          
          results: {
            letter_sounds: state.letterSounds,
            phoneme_blending: state.phonemeBlending,
            phoneme_segmentation: state.phonemeSegmentation,
            rapid_naming: state.rapidNaming,
            real_words: state.realWords,
            nonwords: state.nonwords,
            passage: state.passage,
            comprehension: state.comprehension,
            self_report: state.selfReport,
          },
          
          flags: {
            avoid_reading_aloud: state.selfReport.challenges.includes('Reading aloud anxiety'),
            high_anxiety: state.selfReport.challenges.length >= 4,
          },
        };
      },
    }),
    {
      name: 'dyslexi-assist-intake-v2',
      partialize: (state) => ({
        currentSlide: state.currentSlide,
        locale: state.locale,
        gradeBand: state.gradeBand,
        micEnabled: state.micEnabled,
        preferences: state.preferences,
        letterSounds: state.letterSounds,
        phonemeBlending: state.phonemeBlending,
        phonemeSegmentation: state.phonemeSegmentation,
        rapidNaming: state.rapidNaming,
        realWords: state.realWords,
        nonwords: state.nonwords,
        passage: state.passage,
        comprehension: state.comprehension,
        selfReport: state.selfReport,
      }),
    }
  )
);
