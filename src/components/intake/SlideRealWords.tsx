import { useState, useEffect, useCallback, useRef } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { realWordItems } from '@/data/intakeItems';
import type { TaskResult } from '@/types/intake';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { Volume2, Mic, MicOff, Loader2, Square } from 'lucide-react';
import VoiceIndicator from '@/components/ui/VoiceIndicator';

const SlideRealWords = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const [isRecordingItem, setIsRecordingItem] = useState(false);
  const { micEnabled, addTask } = useIntakeStore();
  const hasStartedRef = useRef(false);
  const [sttError, setSttError] = useState<string | null>(null);
  
  const { speak, isLoading: ttsLoading, isPlaying } = useTextToSpeech();
  const { 
    isRecording, 
    isTranscribing,
    isCapturing,
    liveTranscript,
    interimTranscript,
    startRecording, 
    stopAndTranscribe,
    reset: resetRecording
  } = useSpeechToText();

  const useVoiceMode = micEnabled;
  const item = realWordItems[currentItem];
  const isComplete = currentItem >= realWordItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
    hasStartedRef.current = false;
    setIsRecordingItem(false);
    setSttError(null);
    resetRecording();
  }, [currentItem, resetRecording]);

  const handlePlayAudio = () => {
    speak(item.word);
  };

  const handleStartRecording = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsRecordingItem(true);
    setSttError(null);
    await startRecording();
  };

  const handleStopAndSubmit = useCallback(async () => {
    const responseTime = Date.now() - itemStartTime;
    
    let transcript: string | null = null;
    let isCorrect: boolean | null = null;
    
    const result = await stopAndTranscribe();
    const text = (result?.text ?? '').trim();
    transcript = text ? text : (liveTranscript.trim() ? liveTranscript.trim() : null);

    if (!transcript) {
      setSttError('No speech was captured. Please try again.');
      await startRecording();
      return;
    }
    
    // Check if the transcription contains the word
    if (transcript) {
      isCorrect = transcript.toLowerCase().includes(item.word.toLowerCase());
    }

    const taskResult: TaskResult = {
      taskId: item.id,
      type: 'real_word',
      difficulty: item.difficulty,
      correct: isCorrect,
      responseTimeMs: responseTime,
      errorType: isCorrect === false ? 'reading_error' : null,
      transcript,
    };

    addTask(taskResult);
    setCurrentItem((prev) => prev + 1);
  }, [itemStartTime, stopAndTranscribe, item, addTask, liveTranscript, startRecording]);

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctSpelling;

    const taskResult: TaskResult = {
      taskId: item.id,
      type: 'real_word',
      difficulty: item.difficulty,
      correct: isCorrect,
      responseTimeMs: responseTime,
      errorType: isCorrect ? null : 'spelling',
      transcript: null,
    };

    addTask(taskResult);
    setCurrentItem((prev) => prev + 1);
  };

  const handleSkip = async () => {
    if (isRecordingItem) {
      await stopAndTranscribe();
    }
    
    const taskResult: TaskResult = {
      taskId: item.id,
      type: 'real_word',
      difficulty: item.difficulty,
      correct: null,
      responseTimeMs: Date.now() - itemStartTime,
      errorType: 'skipped',
      transcript: null,
    };

    addTask(taskResult);
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
        <h2 className="headline-md mb-4">Word Reading</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          {useVoiceMode 
            ? "Read the word out loud. Press the microphone to start recording."
            : "Listen to the word, then choose the correct spelling."
          }
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Word {currentItem + 1} of {realWordItems.length}
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
          // Voice mode: show word to read and record
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
                  {(liveTranscript || interimTranscript) ? (
                    <span className="text-foreground">{liveTranscript || interimTranscript}</span>
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
                  onClick={handleStartRecording}
                  disabled={isTranscribing}
                  className="btn-newspaper-primary inline-flex items-center gap-2"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopAndSubmit}
                  disabled={isTranscribing}
                  className="btn-newspaper inline-flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  <span>{isTranscribing ? 'Processing...' : 'Stop & Submit'}</span>
                </button>
              )}
              
              {isTranscribing && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
              
              <div>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isTranscribing}
                  className="text-muted-foreground hover:text-foreground underline text-sm"
                >
                  Skip this word
                </button>
              </div>
            </div>
          </>
        ) : (
          // Listening mode: play audio and choose spelling
          <>
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={handlePlayAudio}
                disabled={ttsLoading || isPlaying}
                className="audio-btn"
              >
                {ttsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
                <span>{isPlaying ? 'Playing...' : 'Play Word'}</span>
              </button>
            </div>

            <p className="text-center text-muted-foreground mb-6">
              Which spelling is correct?
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

export default SlideRealWords;
