import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { phonemeSegmentItems } from '@/data/intakeItems';
import type { Attempt } from '@/types/intake';
import { Volume2 } from 'lucide-react';

const SlidePhonemeSegment = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { addAttempt, getTimeOnScreen } = useIntakeStore();

  const item = phonemeSegmentItems[currentItem];
  const isComplete = currentItem >= phonemeSegmentItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentItem]);

  const handlePlayAudio = () => {
    console.log(`Playing audio: ${item.audioId}`);
  };

  const handleChoice = (count: number) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = count === item.correctCount;

    const attempt: Attempt = {
      screen_id: `PHONEME_SEGMENT_${String(currentItem + 1).padStart(2, '0')}`,
      task_type: 'phoneme_segmentation_mcq',
      item_id: item.id,
      presented_at: itemStartTime / 1000,
      response: {
        choice_id: String(count),
        text: null,
        audio_blob_id: null,
      },
      timing: {
        rt_ms: responseTime,
        time_on_screen_ms: getTimeOnScreen(),
      },
      scoring: {
        is_correct: isCorrect,
        error_type: isCorrect ? null : 'count_error',
        partial_credit: 0,
        expected: String(item.correctCount),
      },
      features: {
        distractor_type: 'phoneme_count',
        difficulty_level: item.correctCount > 3 ? 3 : 2,
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
        <h2 className="headline-md mb-4">Counting Sounds</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          Listen carefully and count how many sounds you hear in the word.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Item {currentItem + 1} of {phonemeSegmentItems.length}
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
            <span>Play Word</span>
          </button>
        </div>

        <p className="font-headline text-lg text-center mb-6">
          {item.prompt}
        </p>

        <div className="flex justify-center gap-4 max-w-md mx-auto">
          {[2, 3, 4, 5].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => handleChoice(count)}
              className="mcq-option w-20 h-20 flex items-center justify-center"
            >
              <span className="text-3xl font-headline font-bold">{count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidePhonemeSegment;
