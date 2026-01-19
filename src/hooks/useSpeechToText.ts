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

export function useSpeechToText(options: UseSTTOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      options.onStart?.();
    } catch (error) {
      console.error('Microphone access error:', error);
      options.onError?.('Could not access microphone. Please check permissions.');
    }
  }, [options]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    const duration = Date.now() - startTimeRef.current;
    
    return new Promise<Blob>((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setIsRecording(false);
        options.onStop?.(duration);
        
        // Stop all tracks
        mediaRecorderRef.current!.stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };
      
      mediaRecorderRef.current!.stop();
    });
  }, [isRecording, options]);

  const transcribe = useCallback(async (blob?: Blob) => {
    const audioToTranscribe = blob || audioBlob;
    if (!audioToTranscribe) {
      options.onError?.('No audio to transcribe');
      return null;
    }

    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioToTranscribe, 'recording.webm');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`,
        {
          method: 'POST',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Transcription failed');
      }

      const result: TranscriptionResult = await response.json();
      setTranscription(result.text);
      options.onTranscription?.(result);
      return result;
    } catch (error) {
      console.error('STT error:', error);
      options.onError?.(error instanceof Error ? error.message : 'Transcription failed');
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, [audioBlob, options]);

  const stopAndTranscribe = useCallback(async () => {
    const blob = await stopRecording();
    if (blob) {
      return await transcribe(blob);
    }
    return null;
  }, [stopRecording, transcribe]);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setTranscription(null);
    chunksRef.current = [];
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
