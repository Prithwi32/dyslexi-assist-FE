import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { comprehensionQuestions } from '@/data/intakeItems';
import type { TaskResult } from '@/types/intake';

const SlideComprehension = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const { addComprehension, getTimeOnScreen } = useIntakeStore();

  const question = comprehensionQuestions[currentQuestion];
  const isComplete = currentQuestion >= comprehensionQuestions.length;

  useEffect(() => {
    setItemStartTime(Date.now());
  }, [currentQuestion]);

  const handleChoice = (choice: string) => {
    const responseTime = Date.now() - itemStartTime;
    const isCorrect = choice === question.correctAnswer;

    const result: TaskResult = {
      item_id: question.id,
      task_type: `comprehension_${question.questionType}`,
      response: choice,
      expected: question.correctAnswer,
      is_correct: isCorrect,
      response_time_ms: responseTime,
    };

    addComprehension(result);
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