import { useIntakeStore } from '@/store/intakeStore';

interface SlideConsentProps {
  onComplete: () => void;
}

const locales = [
  { value: 'en-IN', label: 'English (India)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'hi-IN', label: 'Hindi' },
];

const gradeBands = [
  { value: 'primary', label: 'Primary School' },
  { value: 'middle_school', label: 'Middle School' },
  { value: 'high_school', label: 'High School' },
  { value: 'adult', label: 'Adult Learner' },
];

const SlideConsent = ({ onComplete }: SlideConsentProps) => {
  const { 
    locale, 
    gradeBand, 
    micEnabled,
    setLocale, 
    setGradeBand, 
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

      {/* Language selection */}
      <div className="newspaper-card">
        <label htmlFor="locale" className="block font-headline font-bold text-lg mb-3">
          Choose your language
        </label>
        <select
          id="locale"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="input-newspaper"
        >
          {locales.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grade band selection */}
      <div className="newspaper-card">
        <label htmlFor="gradeBand" className="block font-headline font-bold text-lg mb-3">
          What best describes you?
        </label>
        <select
          id="gradeBand"
          value={gradeBand}
          onChange={(e) => setGradeBand(e.target.value as any)}
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