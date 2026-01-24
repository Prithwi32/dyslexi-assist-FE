import { useIntakeStore } from '@/store/intakeStore';
import { selfReportOptions } from '@/data/intakeItems';

const SlideSelfReport = () => {
  const { difficultyPatterns, setDifficultyPatterns } = useIntakeStore();

  const toggleOption = (option: string) => {
    const updated = difficultyPatterns.includes(option)
      ? difficultyPatterns.filter((o) => o !== option)
      : [...difficultyPatterns, option];
    setDifficultyPatterns(updated);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Your Experience</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          What feels hardest right now? Select all that apply. This helps us understand how to support you best.
        </p>
      </div>

      <div className="newspaper-card">
        <div className="space-y-3">
          {selfReportOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`w-full text-left p-4 border-2 border-foreground transition-colors ${
                difficultyPatterns.includes(option)
                  ? 'bg-foreground text-background'
                  : 'bg-transparent hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 border-2 border-current flex items-center justify-center ${
                  difficultyPatterns.includes(option) ? 'bg-background' : ''
                }`}>
                  {difficultyPatterns.includes(option) && (
                    <span className="text-foreground font-bold">✓</span>
                  )}
                </div>
                <span className="font-body text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="helper-text text-center">
        Remember: There are no wrong answers. This is just to help personalize your experience.
      </p>
    </div>
  );
};

export default SlideSelfReport;
