import { useState, useEffect, useRef, useCallback } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { fluencyPassage, fluencyPassageWordCount } from '@/data/intakeItems';
import { Volume2, Mic, MicOff, Play, Square, Clock } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import VoiceIndicator from '@/components/ui/VoiceIndicator';

const SlidePassage = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  
  const { micEnabled, setPassageResults } = useIntakeStore();
  const { speak, isLoading } = useTextToSpeech();
  const {
    startRecording,
    stopAndTranscribe,
    isRecording,
    isTranscribing,
    isCapturing,
    liveTranscript,
  } = useSpeechToText();
  const useVoiceMode = micEnabled;
  const maxTime = 45; // seconds
  const transcriptRef = useRef<string | null>(null);

  const handleStop = useCallback(async () => {
    if (!startTime) return;
    
    const totalTimeMs = Date.now() - startTime;
    const totalTimeSec = totalTimeMs / 1000;
    
    // Get transcript if voice mode
    if (useVoiceMode) {
      const result = await stopAndTranscribe();
      const text = (result.text ?? '').trim();
      const resolved = text ? text : (liveTranscript.trim() ? liveTranscript.trim() : null);

      if (!resolved) {
        setSttError('No speech was captured. Please try again (make sure mic permission is allowed).');
        await startRecording();
        return;
      }

      transcriptRef.current = resolved;
    }

    const wpm = useVoiceMode ? Math.round((fluencyPassageWordCount / totalTimeSec) * 60) : null;
    
    setPassageResults(wpm, totalTimeMs, transcriptRef.current);
    setIsComplete(true);
  }, [startTime, useVoiceMode, setPassageResults, stopAndTranscribe, liveTranscript, startRecording]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isComplete && startTime) {
      interval = setInterval(() => {
        const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsed(secondsElapsed);
        
        // Auto-stop at 45 seconds for voice mode
        if (useVoiceMode && secondsElapsed >= maxTime) {
          handleStop();
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isStarted, isComplete, startTime, useVoiceMode, handleStop]);

  const handleStart = async () => {
    setIsStarted(true);
    setStartTime(Date.now());
    setSttError(null);
    
    if (useVoiceMode) {
      await startRecording();
    }
  };

  const handlePlayAudio = async () => {
    await speak(fluencyPassage);
  };

  if (isComplete) {
    return (
      <div className="text-center animate-fade-in py-12">
        <h2 className="headline-md mb-4">Section Complete</h2>
        <p className="helper-text">Great work! Click Next to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Passage Reading</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          {useVoiceMode 
            ? "Read this passage aloud at a comfortable pace. You have 45 seconds."
            : "Listen to this passage being read. Focus on understanding the story."
          }
        </p>
      </div>

      {/* Mode and timer */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          {useVoiceMode ? (
            <>
              <Mic className="w-5 h-5" />
              <span>Voice mode</span>
            </>
          ) : (
            <>
              <MicOff className="w-5 h-5" />
              <span>Listening mode</span>
            </>
          )}
        </div>
        
        {isStarted && (
          <div className="flex items-center gap-2 font-headline font-bold">
            <Clock className="w-5 h-5" />
            <span>{useVoiceMode ? `${maxTime - elapsed}s` : `${elapsed}s`}</span>
          </div>
        )}
      </div>

      {/* Voice recording indicator */}
      {useVoiceMode && isStarted && isCapturing && (
        <div className="flex justify-center">
          <VoiceIndicator isRecording={isRecording} status={isTranscribing ? 'processing' : 'listening'} />
        </div>
      )}

      {/* Live transcript preview */}
      {useVoiceMode && isStarted && (
        <div className="mx-auto max-w-2xl">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Live transcript</div>
          <div className="bg-background border border-border rounded-md px-3 py-2 text-sm">
            {liveTranscript ? (
              <span className="text-foreground">{liveTranscript}</span>
            ) : (
              <span className="text-muted-foreground italic">(start speaking…)</span>
            )}
          </div>
          {sttError && (
            <div className="mt-2 text-sm text-destructive">{sttError}</div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="text-center">
        {!isStarted ? (
          <div className="flex justify-center gap-4">
            {!useVoiceMode && (
              <button
                type="button"
                onClick={handlePlayAudio}
                disabled={isLoading}
                className="audio-btn"
              >
                <Volume2 className="w-5 h-5" />
                <span>{isLoading ? 'Loading...' : 'Listen'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleStart}
              className="btn-newspaper-primary inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              <span>{useVoiceMode ? 'Start Reading' : 'Start Timer'}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            disabled={isTranscribing}
            className="btn-newspaper inline-flex items-center gap-2"
          >
            <Square className="w-5 h-5" />
            <span>{isTranscribing ? 'Processing...' : "I'm Done"}</span>
          </button>
        )}
      </div>

      {/* Passage card */}
      <div className="newspaper-card max-h-[50vh] overflow-y-auto">
        <div className="prose prose-lg max-w-none">
          {fluencyPassage.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 leading-relaxed text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidePassage;
