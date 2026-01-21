import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { phonemeBlendItems } from '@/data/intakeItems';
import type { Attempt } from '@/types/intake';
import { Volume2 } from 'lucide-react';

const SlidePhonemeBlend = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { addAttempt, getTimeOnScreen } = useIntakeStore();

  const item = phonemeBlendItems[currentItem];
  const isComplete = currentItem >= phonemeBlendItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentItem]);

  const handlePlayAudio = () => {
    // Mock audio playback - in production, this would play actual audio
    console.log(`Playing audio: ${item.audioId}`);
  };

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctAnswer;

    const attempt: Attempt = {
      screen_id: `PHONEME_BLEND_${String(currentItem + 1).padStart(2, '0')}`,
      task_type: 'phoneme_blending_mcq',
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
        error_type: isCorrect ? null : item.distractorType,
        partial_credit: 0,
        expected: item.correctAnswer,
      },
      features: {
        distractor_type: item.distractorType,
        difficulty_level: 2,
      },
      quality: {
        asr_confidence: null,
        device_lag_ms: 25,
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
        <h2 className="headline-md mb-4">Sound Blending</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          Listen to the sounds, then pick the word they make together.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Item {currentItem + 1} of {phonemeBlendItems.length}
        </p>
      </div>

      <div className="newspaper-card">
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={handlePlayAudio}
            className="audio-btn"
          >
            <Volume2 className="w-5 h-5" />
            <span>Play Sounds</span>
          </button>
        </div>

        <p className="font-headline text-lg text-center mb-6 text-muted-foreground">
          {item.prompt}
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {item.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChoice(option)}
              className="mcq-option py-6 text-center"
            >
              <span className="text-2xl font-headline font-bold">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidePhonemeBlend;
