import { useState, useCallback, useRef } from 'react';

interface UseTTSOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTextToSpeech(options: UseTTSOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const stop = useCallback(() => {
    // Stop Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Stop any current playback
    stop();
    setIsLoading(true);

    try {
      // Use browser's built-in Web Speech API (free, no API key needed)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Wait for voices to load
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          await new Promise<void>((resolve) => {
            window.speechSynthesis.onvoiceschanged = () => {
              voices = window.speechSynthesis.getVoices();
              resolve();
            };
            // Timeout fallback
            setTimeout(resolve, 100);
          });
        }
        
        // Try to use a good English voice
        const englishVoice = voices.find(
          (v) => v.lang.startsWith('en') && v.name.includes('Google')
        ) || voices.find(
          (v) => v.lang.startsWith('en') && v.localService
        ) || voices.find((v) => v.lang.startsWith('en'));
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        setIsLoading(false);
        setIsPlaying(true);
        options.onStart?.();

        await new Promise<void>((resolve, reject) => {
          utterance.onend = () => {
            setIsPlaying(false);
            options.onEnd?.();
            resolve();
          };
          utterance.onerror = (e) => {
            setIsPlaying(false);
            reject(new Error(e.error));
          };
          window.speechSynthesis.speak(utterance);
        });
      } else {
        throw new Error('Speech synthesis not supported in this browser');
      }
    } catch (error) {
      console.error('TTS error:', error);
      options.onError?.(error instanceof Error ? error.message : 'TTS failed');
      setIsPlaying(false);
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