import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  IntakePayload, 
  Attempt, 
  ModalitiesEnabled, 
  UIPreferences,
  SelfReportData 
} from '@/types/intake';

interface IntakeState {
  // Current slide index
  currentSlide: number;
  
  // Basic setup
  locale: string;
  gradeBand: 'primary' | 'middle_school' | 'high_school' | 'adult';
  modalitiesEnabled: ModalitiesEnabled;
  uiPreferences: UIPreferences;
  
  // All attempts (one per item)
  attempts: Attempt[];
  
  // Self report data
  selfReport: SelfReportData;
  
  // RAN specific data
  ranData: {
    totalTimeMs: number;
    mode: 'voice' | 'quiet';
    misTaps: number;
  };
  
  // Passage reading data
  passageData: {
    durationS: number;
    mode: 'voice' | 'listen';
  };
  
  // Timestamps for tracking
  slideStartTime: number;
  
  // Actions
  setCurrentSlide: (slide: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setLocale: (locale: string) => void;
  setGradeBand: (band: 'primary' | 'middle_school' | 'high_school' | 'adult') => void;
  setModalitiesEnabled: (modalities: Partial<ModalitiesEnabled>) => void;
  setUIPreferences: (prefs: Partial<UIPreferences>) => void;
  addAttempt: (attempt: Attempt) => void;
  setSelfReport: (report: Partial<SelfReportData>) => void;
  setRanData: (data: Partial<IntakeState['ranData']>) => void;
  setPassageData: (data: Partial<IntakeState['passageData']>) => void;
  resetSlideTimer: () => void;
  getTimeOnScreen: () => number;
  resetIntake: () => void;
  generatePayload: (userId: string) => IntakePayload;
}

const initialState = {
  currentSlide: 0,
  locale: 'en-IN',
  gradeBand: 'middle_school' as const,
  modalitiesEnabled: { mic: false, eye: false },
  uiPreferences: {
    font_size: 'large' as const,
    theme: 'soft' as const,
    highlight_mode: 'word' as const,
    tts_default_rate: 1.0,
    preferred_mode: 'mixed' as const,
  },
  attempts: [],
  selfReport: {
    hardest_aspects: [],
    other_text: null,
  },
  ranData: {
    totalTimeMs: 0,
    mode: 'quiet' as const,
    misTaps: 0,
  },
  passageData: {
    durationS: 0,
    mode: 'listen' as const,
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
      
      setModalitiesEnabled: (modalities) => set((state) => ({
        modalitiesEnabled: { ...state.modalitiesEnabled, ...modalities }
      })),
      
      setUIPreferences: (prefs) => set((state) => ({
        uiPreferences: { ...state.uiPreferences, ...prefs }
      })),
      
      addAttempt: (attempt) => set((state) => ({
        attempts: [...state.attempts, attempt]
      })),
      
      setSelfReport: (report) => set((state) => ({
        selfReport: { ...state.selfReport, ...report }
      })),
      
      setRanData: (data) => set((state) => ({
        ranData: { ...state.ranData, ...data }
      })),
      
      setPassageData: (data) => set((state) => ({
        passageData: { ...state.passageData, ...data }
      })),
      
      resetSlideTimer: () => set({ slideStartTime: Date.now() }),
      
      getTimeOnScreen: () => Date.now() - get().slideStartTime,
      
      resetIntake: () => set({ ...initialState, slideStartTime: Date.now() }),
      
      generatePayload: (userId: string): IntakePayload => {
        const state = get();
        const sessionId = crypto.randomUUID();
        
        return {
          user_id: userId,
          intake_session_id: sessionId,
          created_at: new Date().toISOString(),
          locale: state.locale,
          grade_band: state.gradeBand,
          modalities_enabled: state.modalitiesEnabled,
          ui_preferences: state.uiPreferences,
          attempts: state.attempts,
          derived_profile_v1: {
            phonological_awareness_score: null,
            ran_speed_score: null,
            decoding_accuracy_score: null,
            decoding_fluency_score: null,
            comprehension_literal: null,
            comprehension_inferential: null,
            vocab_in_context: null,
            confidence_calibration: null,
          },
          flags: {
            avoid_reading_aloud: state.selfReport.hardest_aspects.includes('Reading aloud anxiety'),
            high_anxiety_signals: state.selfReport.hardest_aspects.length >= 4,
            low_asr_quality: false,
          },
          self_report: state.selfReport,
        };
      },
    }),
    {
      name: 'dyslexi-assist-intake',
      partialize: (state) => ({
        currentSlide: state.currentSlide,
        locale: state.locale,
        gradeBand: state.gradeBand,
        modalitiesEnabled: state.modalitiesEnabled,
        uiPreferences: state.uiPreferences,
        attempts: state.attempts,
        selfReport: state.selfReport,
        ranData: state.ranData,
        passageData: state.passageData,
      }),
    }
  )
);
