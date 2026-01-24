import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { phonemeSegmentItems } from '@/data/intakeItems';
import { Volume2 } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const SlidePhonemeSegment = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { addTask } = useIntakeStore();
  const { speak, isLoading } = useTextToSpeech();

  const item = phonemeSegmentItems[currentItem];
  const isComplete = currentItem >= phonemeSegmentItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentItem]);

  const handlePlayAudio = async () => {
    await speak(item.word);
  };

  const handleChoice = (count: number) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = count === item.correctCount;

    addTask({
      taskId: item.id,
      type: 'phoneme_segment',
      difficulty: item.difficulty,
      correct: isCorrect,
      responseTimeMs: responseTime,
      errorType: isCorrect ? null : 'counting_error',
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
            disabled={isLoading}
            className="audio-btn"
          >
            <Volume2 className="w-5 h-5" />
            <span>{isLoading ? 'Playing...' : 'Play Word'}</span>
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
