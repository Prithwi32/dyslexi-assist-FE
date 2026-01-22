import { useState, useCallback, useRef } from 'react';

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
  
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const startTimeRef = useRef<number>(0);
  const transcriptRef = useRef<string>('');

  const startRecording = useCallback(async () => {
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
      transcriptRef.current = '';

      recognition.onstart = () => {
        setIsRecording(true);
        options.onStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        
        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          options.onError?.(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Recognition ended naturally
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      options.onError?.(error instanceof Error ? error.message : 'Could not start speech recognition');
    }
  }, [options]);

  const stopRecording = useCallback(async () => {
    if (!recognitionRef.current || !isRecording) return;

    const duration = Date.now() - startTimeRef.current;
    
    return new Promise<Blob>((resolve) => {
      recognitionRef.current!.onend = () => {
        setIsRecording(false);
        options.onStop?.(duration);
        
        // Create a dummy blob for compatibility
        const blob = new Blob(['audio'], { type: 'audio/webm' });
        setAudioBlob(blob);
        resolve(blob);
      };
      
      recognitionRef.current!.stop();
    });
  }, [isRecording, options]);

  const transcribe = useCallback(async () => {
    // With Web Speech API, transcription happens in real-time
    // This just returns the accumulated transcript
    setIsTranscribing(true);
    
    try {
      const text = transcriptRef.current.trim();
      const result: TranscriptionResult = { text };
      
      setTranscription(text);
      options.onTranscription?.(result);
      return result;
    } finally {
      setIsTranscribing(false);
    }
  }, [options]);

  const stopAndTranscribe = useCallback(async () => {
    await stopRecording();
    
    // Small delay to ensure all results are processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return await transcribe();
  }, [stopRecording, transcribe]);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setTranscription(null);
    transcriptRef.current = '';
  }, []);

  return {
    isRecording,
    isTranscribing,
    audioBlob,
    transcription,
    startRecording,
    stopRecording,
    stopAndTranscribe,
    transcribe,
    reset,
  };
}
