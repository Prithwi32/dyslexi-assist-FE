import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { nonwordItems } from '@/data/intakeItems';
import type { TaskResult } from '@/types/intake';
import { Volume2, Mic, MicOff } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const SlideNonwords = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { micEnabled, addNonword, getTimeOnScreen } = useIntakeStore();
  const { speak, isLoading } = useTextToSpeech();

  const useVoiceMode = micEnabled;
  const item = nonwordItems[currentItem];
  const isComplete = currentItem >= nonwordItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentItem]);

  const handlePlayAudio = async () => {
    await speak(item.word);
  };

  const handleVoiceAttempt = () => {
    const responseTime = Date.now() - itemStartTime;

    const result: TaskResult = {
      item_id: item.id,
      task_type: 'nonword_reading_voice',
      response: 'voice_attempted',
      expected: item.word,
      is_correct: null, // Cannot determine without ASR
      response_time_ms: responseTime,
    };

    addNonword(result);
    setCurrentItem((prev) => prev + 1);
  };

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctSpelling;

    const result: TaskResult = {
      item_id: item.id,
      task_type: 'nonword_reading_mcq',
      response: choice,
      expected: item.correctSpelling || item.word,
      is_correct: isCorrect,
      response_time_ms: responseTime,
    };

    addNonword(result);
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
            <div className="text-center">
              <button
                type="button"
                onClick={handleVoiceAttempt}
                className="btn-newspaper-primary"
              >
                I've read it — Next
              </button>
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