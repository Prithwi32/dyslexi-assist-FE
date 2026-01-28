import { useState, useEffect, useRef, useCallback } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { nonwordItems } from '@/data/intakeItems';
import { Volume2, Mic, MicOff, Square } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import VoiceIndicator from '@/components/ui/VoiceIndicator';

const SlideNonwords = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const [isRecordingItem, setIsRecordingItem] = useState(false);
  const { micEnabled, addTask } = useIntakeStore();
  const { speak, isLoading } = useTextToSpeech();
  const {
    startRecording,
    stopAndTranscribe,
    isRecording,
    isTranscribing,
    isCapturing,
    liveTranscript,
    reset,
  } = useSpeechToText();
  const hasStartedRef = useRef(false);
  const [sttError, setSttError] = useState<string | null>(null);

  const useVoiceMode = micEnabled;
  const item = nonwordItems[currentItem];
  const isComplete = currentItem >= nonwordItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
    hasStartedRef.current = false;
    setIsRecordingItem(false);
    setSttError(null);
    reset();
  }, [currentItem, reset]);

  const handlePlayAudio = async () => {
    await speak(item.word);
  };

  const handleStartVoice = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsRecordingItem(true);
    setSttError(null);
    await startRecording();
  };

  const handleVoiceAttempt = useCallback(async () => {
    const responseTime = Date.now() - itemStartTime;
    const result = await stopAndTranscribe();
    const text = (result.text ?? '').trim();
    const transcript = text ? text : (liveTranscript.trim() ? liveTranscript.trim() : null);

    if (!transcript) {
      setSttError('No speech was captured. Please try again.');
      await startRecording();
      return;
    }

    addTask({
      taskId: item.id,
      type: 'nonword',
      difficulty: item.difficulty,
      correct: null, // Cannot determine without ASR comparison
      responseTimeMs: responseTime,
      errorType: null,
      transcript,
    });

    setCurrentItem((prev) => prev + 1);
  }, [itemStartTime, stopAndTranscribe, item, addTask, liveTranscript, startRecording]);

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctSpelling;

    addTask({
      taskId: item.id,
      type: 'nonword',
      difficulty: item.difficulty,
      correct: isCorrect,
      responseTimeMs: responseTime,
      errorType: isCorrect ? null : 'spelling_error',
      transcript: null,
    });

    setCurrentItem((prev) => prev + 1);
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
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Made-Up Words</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          {useVoiceMode 
            ? "These are made-up words. Try to sound them out and read aloud."
            : "These are made-up words. Listen and choose how it should be spelled."
          }
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Word {currentItem + 1} of {nonwordItems.length}
        </p>
      </div>

      <div className="newspaper-card">
        {/* Mode indicator */}
        <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
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

        {useVoiceMode ? (
          <>
            <div className="text-center mb-8 py-8 bg-background border-2 border-foreground">
              <span className="text-5xl font-headline font-bold">{item.word}</span>
            </div>
            
            {/* Voice recording indicator */}
            {isRecordingItem && (
              <div className="flex justify-center mb-4">
                <VoiceIndicator
                  isRecording={isRecording}
                  status={isTranscribing ? 'processing' : 'listening'}
                />
              </div>
            )}

            {/* Live transcript preview */}
            {isRecordingItem && (
              <div className="mx-auto mb-4 max-w-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Live transcript</div>
                <div className="bg-background border border-border rounded-md px-3 py-2 text-sm">
                  {liveTranscript ? (
                    <span className="text-foreground">{liveTranscript}</span>
                  ) : isCapturing ? (
                    <span className="text-muted-foreground italic">(listening…)</span>
                  ) : (
                    <span className="text-muted-foreground italic">(press start and speak)</span>
                  )}
                </div>
                {sttError && (
                  <div className="mt-2 text-sm text-destructive">{sttError}</div>
                )}
              </div>
            )}

            <div className="text-center space-y-4">
              {!isRecordingItem ? (
                <button
                  type="button"
                  onClick={handleStartVoice}
                  className="btn-newspaper-primary inline-flex items-center gap-2"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Speaking</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleVoiceAttempt}
                  disabled={isTranscribing}
                  className="btn-newspaper inline-flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  <span>{isTranscribing ? 'Processing...' : 'Done — Next Word'}</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={handlePlayAudio}
                disabled={isLoading}
                className="audio-btn"
              >
                <Volume2 className="w-5 h-5" />
                <span>{isLoading ? 'Playing...' : 'Play Word'}</span>
              </button>
            </div>

            <p className="text-center text-muted-foreground mb-6">
              Which spelling matches the sound?
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {item.options?.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleChoice(option)}
                  className="mcq-option py-4 text-center"
                >
                  <span className="text-xl font-headline">{option}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SlideNonwords;
