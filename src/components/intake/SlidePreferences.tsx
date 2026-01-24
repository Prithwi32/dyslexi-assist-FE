import { useIntakeStore } from '@/store/intakeStore';

const pacingOptions = [
  { value: 'SLOW', label: 'Slow', description: 'I prefer to take my time' },
  { value: 'MEDIUM', label: 'Medium', description: 'A balanced pace works for me' },
  { value: 'FAST', label: 'Fast', description: 'I like to move quickly' },
];

const fontSizeOptions = [
  { value: 0.8, label: 'Smaller' },
  { value: 1.0, label: 'Normal' },
  { value: 1.2, label: 'Larger' },
  { value: 1.5, label: 'Extra Large' },
];

const highlightColorOptions = [
  { value: '#FFFF00', label: 'Yellow', colorClass: 'bg-yellow-300' },
  { value: '#90EE90', label: 'Green', colorClass: 'bg-green-300' },
  { value: '#87CEEB', label: 'Blue', colorClass: 'bg-blue-300' },
  { value: '#FFB6C1', label: 'Pink', colorClass: 'bg-pink-300' },
];

const SlidePreferences = () => {
  const { preferences, setPreferences } = useIntakeStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Your Preferences</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          How do you prefer to read and learn? There are no wrong answers.
        </p>
      </div>

      {/* Pacing preference */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-4">
          What pace feels most comfortable?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {pacingOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreferences({ pacingPreference: option.value as 'SLOW' | 'MEDIUM' | 'FAST' })}
              className={`p-4 border-2 border-foreground text-left transition-colors ${
                preferences.pacingPreference === option.value
                  ? 'bg-foreground text-background'
                  : 'bg-transparent hover:bg-accent'
              }`}
            >
              <span className="font-headline font-bold block">{option.label}</span>
              <span className={`text-sm ${
                preferences.pacingPreference === option.value
                  ? 'text-background/80'
                  : 'text-muted-foreground'
              }`}>
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-4">
          What text size is comfortable for you?
        </h3>
        <div className="flex gap-3 flex-wrap">
          {fontSizeOptions.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => setPreferences({ fontSizeMultiplier: size.value })}
              className={`flex-1 min-w-[100px] py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
                preferences.fontSizeMultiplier === size.value
                  ? 'bg-foreground text-background'
                  : 'bg-transparent hover:bg-accent'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight color */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-4">
          Which highlight color helps you focus?
        </h3>
        <div className="flex gap-4 justify-center">
          {highlightColorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setPreferences({ highlightColor: color.value })}
              className={`w-16 h-16 rounded-full border-4 transition-all ${color.colorClass} ${
                preferences.highlightColor === color.value
                  ? 'border-foreground scale-110'
                  : 'border-transparent hover:border-muted-foreground'
              }`}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Voice feedback toggle */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-4">
          Would you like voice feedback while reading?
        </h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPreferences({ enableVoiceFeedback: true })}
            className={`flex-1 py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
              preferences.enableVoiceFeedback
                ? 'bg-foreground text-background'
                : 'bg-transparent hover:bg-accent'
            }`}
          >
            Yes, I'd like audio
          </button>
          <button
            type="button"
            onClick={() => setPreferences({ enableVoiceFeedback: false })}
            className={`flex-1 py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
              !preferences.enableVoiceFeedback
                ? 'bg-foreground text-background'
                : 'bg-transparent hover:bg-accent'
            }`}
          >
            No, just visual
          </button>
        </div>
      </div>

      {/* Visual highlighting toggle */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-4">
          Would you like words highlighted as you read?
        </h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPreferences({ enableVisualHighlighting: true })}
            className={`flex-1 py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
              preferences.enableVisualHighlighting
                ? 'bg-foreground text-background'
                : 'bg-transparent hover:bg-accent'
            }`}
          >
            Yes, highlight words
          </button>
          <button
            type="button"
            onClick={() => setPreferences({ enableVisualHighlighting: false })}
            className={`flex-1 py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
              !preferences.enableVisualHighlighting
                ? 'bg-foreground text-background'
                : 'bg-transparent hover:bg-accent'
            }`}
          >
            No highlighting
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlidePreferences;
