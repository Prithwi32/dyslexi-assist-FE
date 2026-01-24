import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { phonemeBlendItems } from '@/data/intakeItems';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Volume2, Loader2 } from 'lucide-react';

const SlidePhonemeBlend = () => {
  const [currentItem, setCurrentItem] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { addTask } = useIntakeStore();
  const { speak, isLoading, isPlaying } = useTextToSpeech();

  const item = phonemeBlendItems[currentItem];
  const isComplete = currentItem >= phonemeBlendItems.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentItem]);

  const handlePlayAudio = () => {
    // Speak the phoneme sounds slowly
    speak(item.audioText);
  };

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === item.correctAnswer;

    addTask({
      taskId: item.id,
      type: 'phoneme_blend',
      difficulty: item.difficulty,
      correct: isCorrect,
      responseTimeMs: responseTime,
      errorType: isCorrect ? null : item.distractorType,
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
            disabled={isLoading || isPlaying}
            className="audio-btn"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            <span>{isPlaying ? 'Playing...' : 'Play Sounds'}</span>
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
