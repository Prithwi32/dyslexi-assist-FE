import { useState, useEffect, useCallback } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { realWordItems } from '@/data/intakeItems';
import type { TaskResult } from '@/types/intake';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { Volume2, Mic, MicOff, Loader2 } from 'lucide-react';

const SlideRealWords = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { micEnabled, addRealWord } = useIntakeStore();
  
  const { speak, isLoading: ttsLoading, isPlaying } = useTextToSpeech();
  const { 
    isRecording, 
    isTranscribing,
    startRecording, 
    stopAndTranscribe,
    reset: resetRecording
  } = useSpeechToText();

  const useVoiceMode = micEnabled;
  const item = realWordItems[currentItem];
  const isComplete = currentItem >= realWordItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
    resetRecording();
  }, [currentItem, resetRecording]);

  const handlePlayAudio = () => {
    speak(item.word);
  };

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopAndSubmit = useCallback(async () => {
    const responseTime = Date.now() - itemStartTime;
    
    let transcription: string | null = null;
    let isCorrect: boolean | null = null;
    
    if (isRecording) {
      const result = await stopAndTranscribe();
      transcription = result?.text || null;
      
      // Simple matching - check if the transcription contains the word
      if (transcription) {
        isCorrect = transcription.toLowerCase().includes(item.word.toLowerCase());
      }
    }

    const taskResult: TaskResult = {
      item_id: item.id,
      task_type: 'real_word_reading_voice',
      response: transcription || 'voice_attempted',
      expected: item.word,
      is_correct: isCorrect,
      response_time_ms: responseTime,
      transcription,
    };

    addRealWord(taskResult);
    setCurrentItem((prev) => prev + 1);
  }, [itemStartTime, isRecording, stopAndTranscribe, item, addRealWord]);

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctSpelling;

    const taskResult: TaskResult = {
      item_id: item.id,
      task_type: 'real_word_reading_mcq',
      response: choice,
      expected: item.correctSpelling || item.word,
      is_correct: isCorrect,
      response_time_ms: responseTime,
    };

    addRealWord(taskResult);
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
            <div className="text-center space-y-4">
              {!isRecording ? (
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
                  className="btn-newspaper inline-flex items-center gap-2 animate-pulse"
                >
                  <Mic className="w-5 h-5 text-destructive" />
                  <span>Stop & Submit</span>
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
                  onClick={() => {
                    if (isRecording) stopAndTranscribe();
                    handleStopAndSubmit();
                  }}
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
