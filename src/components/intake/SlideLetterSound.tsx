import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { letterSoundItems } from '@/data/intakeItems';
import type { Attempt } from '@/types/intake';

const SlideLetterSound = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { addAttempt, getTimeOnScreen } = useIntakeStore();

  const item = letterSoundItems[currentItem];
  const isComplete = currentItem >= letterSoundItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentItem]);

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctAnswer;

    const attempt: Attempt = {
      screen_id: `LETTER_SOUND_${String(currentItem + 1).padStart(2, '0')}`,
      task_type: 'letter_sound_mcq',
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
        error_type: isCorrect ? null : 'letter_confusion',
        partial_credit: 0,
        expected: item.correctAnswer,
      },
      features: {
        distractor_type: 'visual_similarity',
        difficulty_level: 1,
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
        <h2 className="headline-md mb-4">Letter Sounds</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          Tap the letter that matches the sound. Take your time.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Item {currentItem + 1} of {letterSoundItems.length}
        </p>
      </div>

      <div className="newspaper-card">
        <p className="font-headline font-bold text-xl text-center mb-8">
          {item.prompt}
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {item.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChoice(option)}
              className="mcq-option py-8 text-center"
            >
              <span className="text-4xl font-headline font-bold">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlideLetterSound;
