import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { nonwordItems } from '@/data/intakeItems';
import type { Attempt } from '@/types/intake';
import { Volume2, Mic, MicOff } from 'lucide-react';

const SlideNonwords = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { modalitiesEnabled, addAttempt, getTimeOnScreen } = useIntakeStore();

  const useVoiceMode = modalitiesEnabled.mic;
  const item = nonwordItems[currentItem];
  const isComplete = currentItem >= nonwordItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentItem]);

  const handlePlayAudio = () => {
    console.log(`Playing audio: ${item.audioId}`);
  };

  const handleVoiceAttempt = () => {
    const responseTime = Date.now() - itemStartTime;

    const attempt: Attempt = {
      screen_id: `NONWORD_${String(currentItem + 1).padStart(2, '0')}`,
      task_type: 'nonword_reading_voice',
      item_id: item.id,
      presented_at: itemStartTime / 1000,
      response: {
        choice_id: 'voice_attempted',
        text: item.word,
        audio_blob_id: 'mock_blob',
      },
      timing: {
        rt_ms: responseTime,
        time_on_screen_ms: getTimeOnScreen(),
      },
      scoring: {
        is_correct: null,
        error_type: null,
        partial_credit: 0,
        expected: item.word,
      },
      features: {
        distractor_type: null,
        difficulty_level: 3,
      },
      quality: {
        asr_confidence: null,
        device_lag_ms: 20,
      },
    };

    addAttempt(attempt);
    setCurrentItem((prev) => prev + 1);
  };

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctSpelling;

    const attempt: Attempt = {
      screen_id: `NONWORD_${String(currentItem + 1).padStart(2, '0')}`,
      task_type: 'nonword_reading_mcq',
      item_id: item.id,
      presented_at: itemStartTime / 1000,
      response: {
        choice_id: choice,
        text: null,
        audio_blob_id: null,
      },
      timing: {
        rt_ms: responseTime,
        time_on_screen_ms: getTimeOnScreen(),
      },
      scoring: {
        is_correct: isCorrect,
        error_type: isCorrect ? null : 'decoding_error',
        partial_credit: 0,
        expected: item.correctSpelling || item.word,
      },
      features: {
        distractor_type: 'phonetic_similarity',
        difficulty_level: 3,
      },
      quality: {
        asr_confidence: null,
        device_lag_ms: 20,
      },
    };

    addAttempt(attempt);
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
                className="audio-btn"
              >
                <Volume2 className="w-5 h-5" />
                <span>Play Word</span>
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
