import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { comprehensionQuestions } from '@/data/intakeItems';
import type { Attempt } from '@/types/intake';

const SlideComprehension = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { addAttempt, getTimeOnScreen } = useIntakeStore();

  const question = comprehensionQuestions[currentQuestion];
  const isComplete = currentQuestion >= comprehensionQuestions.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentQuestion]);

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === question.correctAnswer;

    const attempt: Attempt = {
      screen_id: `COMPREHENSION_${String(currentQuestion + 1).padStart(2, '0')}`,
      task_type: `comprehension_${question.questionType}`,
      item_id: question.id,
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
        error_type: isCorrect ? null : `${question.questionType}_error`,
        partial_credit: 0,
        expected: question.correctAnswer,
      },
      features: {
        distractor_type: question.questionType,
        difficulty_level: question.questionType === 'literal' ? 1 : question.questionType === 'inferential' ? 2 : 3,
      },
      quality: {
        asr_confidence: null,
        device_lag_ms: 20,
      },
    };

    addAttempt(attempt);
    setCurrentQuestion((prev) => prev + 1);
  };

  if (isComplete) {
    return (
      <div className="text-center animate-fade-in py-12">
        <h2 className="headline-md mb-4">Section Complete</h2>
        <p className="helper-text">Great work! Click Next to continue.</p>
      </div>
    );
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'literal': return 'About the Story';
      case 'inferential': return 'Thinking Deeper';
      case 'vocab_in_context': return 'Word Meaning';
      default: return '';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Understanding the Story</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          Answer these questions about the passage you just read.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {comprehensionQuestions.length}
        </p>
      </div>

      <div className="newspaper-card">
        <div className="inline-block px-3 py-1 bg-accent border border-foreground mb-4 text-sm font-headline">
          {getQuestionTypeLabel(question.questionType)}
        </div>

        <p className="font-headline font-bold text-xl mb-6">
          {question.question}
        </p>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChoice(option)}
              className="mcq-option w-full text-left p-4"
            >
              <span className="font-body text-lg">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlideComprehension;
