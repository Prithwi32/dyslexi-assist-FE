import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { letterSoundItems } from '@/data/intakeItems';
import type { TaskResult } from '@/types/intake';

const SlideLetterSound = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { addLetterSound, getTimeOnScreen } = useIntakeStore();

  const item = letterSoundItems[currentItem];
  const isComplete = currentItem >= letterSoundItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentItem]);

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctAnswer;

    const result: TaskResult = {
      item_id: item.id,
      task_type: 'letter_sound',
      response: choice,
      expected: item.correctAnswer,
      is_correct: isCorrect,
      response_time_ms: responseTime,
    };

    addLetterSound(result);
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