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
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const startTimeRef = useRef<number>(0);
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const stopResolveRef = useRef<((result: TranscriptionResult) => void) | null>(null);
  const hasEndedRef = useRef<boolean>(false);

  // Keep isRecordingRef in sync with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const getFullTranscript = useCallback(() => {
    // Combine final transcript with any remaining interim words
    const final = finalTranscriptRef.current.trim();
    const interim = interimTranscriptRef.current.trim();
    
    // If we have a final transcript, use it. Otherwise fall back to interim
    if (final) {
      return final;
    }
    return interim;
  }, []);

  const startRecording = useCallback(async () => {
    // Prevent double-start
    if (isRecordingRef.current || recognitionRef.current) {
      console.log('Already recording, ignoring start request');
      return;
    }

    try {
      // Use browser's built-in Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognitionRef.current = recognition;
      startTimeRef.current = Date.now();
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      hasEndedRef.current = false;
      setInterimTranscript('');

      recognition.onstart = () => {
        console.log('Speech recognition started');
        isRecordingRef.current = true;
        setIsRecording(true);
        options.onStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentFinal = '';
        let currentInterim = '';
        
        // Process ALL results from the beginning to build complete transcript
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            currentFinal += result[0].transcript + ' ';
          } else {
            currentInterim += result[0].transcript;
          }
        }
        
        // Store the accumulated final transcript
        if (currentFinal) {
          finalTranscriptRef.current = currentFinal.trim();
          console.log('Accumulated final transcript:', finalTranscriptRef.current);
        }
        
        // Store interim for fallback
        interimTranscriptRef.current = currentInterim;
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          options.onError?.(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        hasEndedRef.current = true;
        isRecordingRef.current = false;
        setIsRecording(false);
        
        // Get the best available transcript
        const fullTranscript = getFullTranscript();
        console.log('Final transcript on end:', fullTranscript);
        
        // Clear interim display
        setInterimTranscript('');
        
        // If there's a pending stop promise, resolve it
        if (stopResolveRef.current) {
          const result: TranscriptionResult = { text: fullTranscript };
          console.log('Resolving stop promise with:', result.text);
          stopResolveRef.current(result);
          stopResolveRef.current = null;
        }
      };

      recognition.start();
      console.log('Recognition.start() called');
    } catch (error) {
      console.error('Speech recognition error:', error);
      isRecordingRef.current = false;
      setIsRecording(false);
      options.onError?.(error instanceof Error ? error.message : 'Could not start speech recognition');
    }
  }, [options, getFullTranscript]);

  const stopRecording = useCallback(async (): Promise<Blob> => {
    console.log('stopRecording called, isRecordingRef:', isRecordingRef.current);
    
    const duration = Date.now() - startTimeRef.current;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }
    
    isRecordingRef.current = false;
    setIsRecording(false);
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
    console.log('stopAndTranscribe called, current transcript:', finalTranscriptRef.current);
    setIsTranscribing(true);
    
    return new Promise<TranscriptionResult>((resolve) => {
      const duration = Date.now() - startTimeRef.current;
      
      // Helper to finalize and resolve
      const finalizeAndResolve = () => {
        const fullTranscript = getFullTranscript();
        const result: TranscriptionResult = { text: fullTranscript };
        console.log('Finalizing with transcript:', fullTranscript);
        
        stopResolveRef.current = null;
        setIsTranscribing(false);
        setTranscription(result.text);
        setInterimTranscript('');
        options.onTranscription?.(result);
        options.onStop?.(duration);
        recognitionRef.current = null;
        isRecordingRef.current = false;
        setIsRecording(false);
        resolve(result);
      };
      
      if (recognitionRef.current && !hasEndedRef.current) {
        // Set up the resolve callback for when onend fires
        stopResolveRef.current = (result) => {
          console.log('Stop resolve callback triggered with:', result.text);
          setIsTranscribing(false);
          setTranscription(result.text);
          setInterimTranscript('');
          options.onTranscription?.(result);
          options.onStop?.(duration);
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
        
        // Longer timeout fallback in case onend doesn't fire
        // Give browser time to process final results
        setTimeout(() => {
          if (stopResolveRef.current) {
            console.log('Timeout: resolving with current transcript');
            finalizeAndResolve();
          }
        }, 1500); // Increased to 1.5 seconds
      } else {
        // No recognition running or already ended, just return current transcript
        finalizeAndResolve();
      }
    });
  }, [options, getFullTranscript]);

  const reset = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }
    isRecordingRef.current = false;
    hasEndedRef.current = false;
    setIsRecording(false);
    setAudioBlob(null);
    setTranscription(null);
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    stopResolveRef.current = null;
  }, []);

  return {
    isRecording,
    isTranscribing,
    audioBlob,
    transcription,
    interimTranscript,
    startRecording,
    stopRecording,
    stopAndTranscribe,
    transcribe,
    reset,
  };
}
