import { useState, useCallback, useRef, useEffect } from 'react';

interface TranscriptionResult {
  text: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

interface UseSTTOptions {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onTranscription?: (result: TranscriptionResult) => void;
  onError?: (error: string) => void;
}

type CaptureStatus = 'idle' | 'starting' | 'listening' | 'processing' | 'error';

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognitionType = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionType;
    webkitSpeechRecognition?: SpeechRecognitionType;
  }
}

export function useSpeechToText(options: UseSTTOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const startTimeRef = useRef<number>(0);
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');
  const lastNonEmptyTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const stopResolveRef = useRef<((result: TranscriptionResult) => void) | null>(null);
  const hasEndedRef = useRef<boolean>(false);
  const shouldCaptureRef = useRef<boolean>(false); // user-intent: keep capturing until explicit stop
  const isStoppingRef = useRef<boolean>(false); // differentiates natural end vs user stop

  // Keep isRecordingRef in sync with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const getFullTranscript = useCallback(() => {
    // Prefer last known non-empty transcript to avoid returning "" on timing edge-cases.
    const combined = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
    return (combined || lastNonEmptyTranscriptRef.current || '').trim();
  }, []);

  const setTranscriptStates = useCallback(() => {
    const final = finalTranscriptRef.current.trim();
    const interim = interimTranscriptRef.current.trim();
    const combined = `${final} ${interim}`.trim();
    setLiveTranscript(combined);
    setInterimTranscript(interim);

    if (combined) lastNonEmptyTranscriptRef.current = combined;
  }, []);

  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
      } catch {
        // ignore
      }
    }
    recognitionRef.current = null;
  }, []);

  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    return recognition;
  }, []);

  const startRecognition = useCallback((resetTranscript: boolean) => {
    // Called only after user gesture via startRecording or from onend auto-restart.

    if (resetTranscript) {
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      lastNonEmptyTranscriptRef.current = '';
      setTranscription(null);
      setInterimTranscript('');
      setLiveTranscript('');
    }

    const recognition = createRecognition();
    recognitionRef.current = recognition;
    hasEndedRef.current = false;

    recognition.onstart = () => {
      isRecordingRef.current = true;
      setIsRecording(true);
      setStatus('listening');
      options.onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Incremental accumulation: only process new indices.
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result?.[0]?.transcript ?? '';
        if (!text) continue;

        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${text}`.trim();
          interimTranscriptRef.current = '';
        } else {
          interimTranscriptRef.current = text;
        }
      }

      setTranscriptStates();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const err = event.error;
      console.error('Speech recognition error:', err);

      // Some errors mean the browser stopped listening; keep capture UI up if user intends to continue.
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        // Permission/OS policy — cannot recover.
        shouldCaptureRef.current = false;
        isStoppingRef.current = true;
        setStatus('error');
        setIsCapturing(false);
        setIsRecording(false);
        cleanupRecognition();
        options.onError?.('Microphone permission was denied. Please allow microphone access and try again.');
        return;
      }

      if (err !== 'no-speech' && err !== 'aborted') {
        options.onError?.(`Speech recognition error: ${err}`);
      }
    };

    recognition.onend = () => {
      hasEndedRef.current = true;
      isRecordingRef.current = false;
      setIsRecording(false);
      cleanupRecognition();

      // If stopAndTranscribe is waiting, resolve it here.
      if (stopResolveRef.current) {
        const full = getFullTranscript();
        const result: TranscriptionResult = { text: full };
        stopResolveRef.current(result);
        stopResolveRef.current = null;
      }

      // Auto-restart if the browser ends early (common on mobile / some browsers)
      // and the user hasn't explicitly stopped.
      if (shouldCaptureRef.current && !isStoppingRef.current) {
        // Keep UI in "listening" state while we restart.
        setStatus('listening');
        setTimeout(() => {
          if (shouldCaptureRef.current && !recognitionRef.current) {
            try {
              startRecognition(false);
            } catch (e) {
              console.error('Failed to auto-restart recognition:', e);
              shouldCaptureRef.current = false;
              setStatus('error');
              setIsCapturing(false);
              options.onError?.('Speech recognition stopped unexpectedly and could not restart.');
            }
          }
        }, 150);
      } else {
        // User stopped: finalize capture UI.
        setStatus('idle');
        setIsCapturing(false);
      }
    };

    recognition.start();
  }, [cleanupRecognition, createRecognition, getFullTranscript, options, setTranscriptStates]);

  const startRecording = useCallback(async () => {
    // This is the "user intent" start; we keep capture UI stable even if the browser ends early.
    if (shouldCaptureRef.current) return;

    try {
      shouldCaptureRef.current = true;
      isStoppingRef.current = false;
      startTimeRef.current = Date.now();

      setIsCapturing(true);
      setStatus('starting');

      // Ensure any previous instance is torn down.
      cleanupRecognition();
      startRecognition(true);
    } catch (error) {
      console.error('Speech recognition start error:', error);
      shouldCaptureRef.current = false;
      isStoppingRef.current = true;
      setIsCapturing(false);
      setIsRecording(false);
      setStatus('error');
      options.onError?.(error instanceof Error ? error.message : 'Could not start speech recognition');
    }
  }, [cleanupRecognition, options, startRecognition]);

  const stopRecording = useCallback(async (): Promise<Blob> => {
    shouldCaptureRef.current = false;
    isStoppingRef.current = true;
    setStatus('processing');
    const duration = Date.now() - startTimeRef.current;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
      cleanupRecognition();
    }
    
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsCapturing(false);
    setStatus('idle');
    options.onStop?.(duration);
    
    // Create a dummy blob for compatibility
    const blob = new Blob(['audio'], { type: 'audio/webm' });
    setAudioBlob(blob);
    return blob;
  }, [options]);

  const transcribe = useCallback(async (): Promise<TranscriptionResult> => {
    // With Web Speech API, transcription happens in real-time
    // This just returns the accumulated transcript
    setIsTranscribing(true);
    
    try {
      const text = getFullTranscript();
      const result: TranscriptionResult = { text };
      
      setTranscription(text);
      options.onTranscription?.(result);
      return result;
    } finally {
      setIsTranscribing(false);
    }
  }, [options, getFullTranscript]);

  const stopAndTranscribe = useCallback(async (): Promise<TranscriptionResult> => {
    setIsTranscribing(true);
    setIsCapturing(true);
    setStatus('processing');
    shouldCaptureRef.current = false;
    isStoppingRef.current = true;
    
    return new Promise<TranscriptionResult>((resolve) => {
      const duration = Date.now() - startTimeRef.current;
      
      // Helper to finalize and resolve
      const finalizeAndResolve = () => {
        const fullTranscript = getFullTranscript();
        const result: TranscriptionResult = { text: fullTranscript };
        
        stopResolveRef.current = null;
        setIsTranscribing(false);
        setTranscription(result.text);
        setTranscriptStates();
        options.onTranscription?.(result);
        options.onStop?.(duration);
        cleanupRecognition();
        isRecordingRef.current = false;
        setIsRecording(false);
        setIsCapturing(false);
        setStatus('idle');
        resolve(result);
      };
      
      if (recognitionRef.current && !hasEndedRef.current) {
        // Set up the resolve callback for when onend fires
        stopResolveRef.current = (result) => {
          setIsTranscribing(false);
          setTranscription(result.text);
          // Ensure UI reflects final transcript.
          finalTranscriptRef.current = result.text;
          interimTranscriptRef.current = '';
          lastNonEmptyTranscriptRef.current = result.text;
          setTranscriptStates();
          options.onTranscription?.(result);
          options.onStop?.(duration);
          setIsCapturing(false);
          setStatus('idle');
          resolve(result);
        };
        
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
          // Fallback: resolve immediately with current transcript
          finalizeAndResolve();
          return;
        }
        
        // Timeout fallback in case onend doesn't fire
        setTimeout(() => {
          if (stopResolveRef.current) {
            finalizeAndResolve();
          }
        }, 2500);
      } else {
        // No recognition running or already ended, just return current transcript
        finalizeAndResolve();
      }
    });
  }, [cleanupRecognition, getFullTranscript, options, setTranscriptStates]);

  const reset = useCallback(() => {
    shouldCaptureRef.current = false;
    isStoppingRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
      cleanupRecognition();
    }
    isRecordingRef.current = false;
    hasEndedRef.current = false;
    setIsRecording(false);
    setIsCapturing(false);
    setAudioBlob(null);
    setTranscription(null);
    setInterimTranscript('');
    setLiveTranscript('');
    setStatus('idle');
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    lastNonEmptyTranscriptRef.current = '';
    stopResolveRef.current = null;
  }, [cleanupRecognition]);

  return {
    isRecording,
    isTranscribing,
    isCapturing,
    status,
    audioBlob,
    transcription,
    interimTranscript,
    liveTranscript,
    startRecording,
    stopRecording,
    stopAndTranscribe,
    transcribe,
    reset,
  };
}
