import { useState, useCallback, useRef } from 'react';

interface UseTTSOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTextToSpeech(options: UseTTSOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Stop any current playback
    stop();
    setIsLoading(true);

    try {
      // Check cache first
      let audioUrl = cacheRef.current.get(text);

      if (!audioUrl) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text }),
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || 'TTS request failed');
        }

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        cacheRef.current.set(text, audioUrl);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        options.onStart?.();
      };

      audio.onended = () => {
        setIsPlaying(false);
        options.onEnd?.();
      };

      audio.onerror = () => {
        setIsPlaying(false);
        options.onError?.('Audio playback failed');
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      options.onError?.(error instanceof Error ? error.message : 'TTS failed');
    } finally {
      setIsLoading(false);
    }
  }, [stop, options]);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
}
