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
  const transcriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const stopResolveRef = useRef<((result: TranscriptionResult) => void) | null>(null);

  // Keep isRecordingRef in sync with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

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
      transcriptRef.current = '';
      setInterimTranscript('');

      recognition.onstart = () => {
        console.log('Speech recognition started');
        isRecordingRef.current = true;
        setIsRecording(true);
        options.onStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interim = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        
        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
          console.log('Final transcript:', transcriptRef.current);
        }
        
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          options.onError?.(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        isRecordingRef.current = false;
        setIsRecording(false);
        setInterimTranscript('');
        
        // If there's a pending stop promise, resolve it
        if (stopResolveRef.current) {
          const result: TranscriptionResult = { text: transcriptRef.current.trim() };
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
  }, [options]);

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
      const text = transcriptRef.current.trim();
      const result: TranscriptionResult = { text };
      
      setTranscription(text);
      options.onTranscription?.(result);
      return result;
    } finally {
      setIsTranscribing(false);
    }
  }, [options]);

  const stopAndTranscribe = useCallback(async (): Promise<TranscriptionResult> => {
    console.log('stopAndTranscribe called');
    setIsTranscribing(true);
    
    return new Promise<TranscriptionResult>((resolve) => {
      const duration = Date.now() - startTimeRef.current;
      
      if (recognitionRef.current) {
        // Set up the resolve callback for when onend fires
        stopResolveRef.current = (result) => {
          setIsTranscribing(false);
          setTranscription(result.text);
          options.onTranscription?.(result);
          options.onStop?.(duration);
          resolve(result);
        };
        
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
          // Fallback: resolve immediately with current transcript
          const result: TranscriptionResult = { text: transcriptRef.current.trim() };
          stopResolveRef.current = null;
          setIsTranscribing(false);
          setTranscription(result.text);
          options.onTranscription?.(result);
          options.onStop?.(duration);
          resolve(result);
        }
        
        // Timeout fallback in case onend doesn't fire
        setTimeout(() => {
          if (stopResolveRef.current) {
            console.log('Timeout: resolving with current transcript');
            const result: TranscriptionResult = { text: transcriptRef.current.trim() };
            stopResolveRef.current = null;
            setIsTranscribing(false);
            setTranscription(result.text);
            options.onTranscription?.(result);
            options.onStop?.(duration);
            resolve(result);
          }
        }, 500);
      } else {
        // No recognition running, just return current transcript
        const result: TranscriptionResult = { text: transcriptRef.current.trim() };
        setIsTranscribing(false);
        setTranscription(result.text);
        options.onTranscription?.(result);
        resolve(result);
      }
      
      recognitionRef.current = null;
      isRecordingRef.current = false;
      setIsRecording(false);
    });
  }, [options]);

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
    setIsRecording(false);
    setAudioBlob(null);
    setTranscription(null);
    setInterimTranscript('');
    transcriptRef.current = '';
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
