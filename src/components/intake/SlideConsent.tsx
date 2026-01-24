import { useIntakeStore } from '@/store/intakeStore';

interface SlideConsentProps {
  onComplete: () => void;
}

const gradeBands = [
  { value: 'K-2', label: 'Grades K-2' },
  { value: '3-4', label: 'Grades 3-4' },
  { value: '5-6', label: 'Grades 5-6' },
  { value: '7-8', label: 'Grades 7-8' },
  { value: '9-12', label: 'Grades 9-12' },
  { value: 'adult', label: 'Adult Learner' },
];

const SlideConsent = ({ onComplete }: SlideConsentProps) => {
  const { 
    gradeLevel, 
    micEnabled,
    setUserInfo, 
    setMicEnabled,
  } = useIntakeStore();

  const handleMicChoice = (enabled: boolean) => {
    setMicEnabled(enabled);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Before We Begin</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          Let's set up a few things to make this experience comfortable for you.
        </p>
      </div>

      {/* Microphone consent */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-3">
          Would you like to enable your microphone?
        </h3>
        <p className="text-muted-foreground mb-4">
          This helps us personalize some reading activities. You can change this later.
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleMicChoice(true)}
            className={`flex-1 py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
              micEnabled 
                ? 'bg-foreground text-background' 
                : 'bg-transparent hover:bg-accent'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleMicChoice(false)}
            className={`flex-1 py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
              !micEnabled 
                ? 'bg-foreground text-background' 
                : 'bg-transparent hover:bg-accent'
            }`}
          >
            Not now
          </button>
        </div>
      </div>

      {/* Grade band selection */}
      <div className="newspaper-card">
        <label htmlFor="gradeLevel" className="block font-headline font-bold text-lg mb-3">
          What grade level best describes you?
        </label>
        <select
          id="gradeLevel"
          value={gradeLevel}
          onChange={(e) => setUserInfo({ gradeLevel: e.target.value })}
          className="input-newspaper"
        >
          {gradeBands.map((band) => (
            <option key={band.value} value={band.value}>
              {band.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SlideConsent;
