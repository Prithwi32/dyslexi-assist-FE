import { useState } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { selfReportOptions } from '@/data/intakeItems';

const SlideSelfReport = () => {
  const { selfReport, setSelfReport } = useIntakeStore();
  const [otherText, setOtherText] = useState(selfReport.other_notes || '');

  const toggleOption = (option: string) => {
    const current = selfReport.challenges;
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setSelfReport({ challenges: updated });
  };

  const handleOtherChange = (text: string) => {
    setOtherText(text);
    setSelfReport({ other_notes: text || null });
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
                selfReport.challenges.includes(option)
                  ? 'bg-foreground text-background'
                  : 'bg-transparent hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 border-2 border-current flex items-center justify-center ${
                  selfReport.challenges.includes(option) ? 'bg-background' : ''
                }`}>
                  {selfReport.challenges.includes(option) && (
                    <span className="text-foreground font-bold">✓</span>
                  )}
                </div>
                <span className="font-body text-lg">{option}</span>
              </div>
            </button>
          ))}

          {/* Other option with text input */}
          <div className="pt-4 border-t-2 border-foreground/30">
            <label className="block font-headline font-bold mb-2">
              Anything else? (optional)
            </label>
            <textarea
              value={otherText}
              onChange={(e) => handleOtherChange(e.target.value)}
              placeholder="Tell us in your own words..."
              className="input-newspaper min-h-[100px] resize-none"
            />
          </div>
        </div>
      </div>

      <p className="helper-text text-center">
        Remember: There are no wrong answers. This is just to help personalize your experience.
      </p>
    </div>
  );
};

export default SlideSelfReport;
