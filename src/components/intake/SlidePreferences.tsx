import { useIntakeStore } from '@/store/intakeStore';

const preferredModes = [
  { value: 'listening_first', label: 'Listening First', description: 'I prefer to hear things before reading' },
  { value: 'silent_reading', label: 'Silent Reading', description: 'I like to read quietly to myself' },
  { value: 'reading_aloud', label: 'Reading Aloud', description: 'I understand better when I read out loud' },
  { value: 'mixed', label: 'Mixed', description: 'I like a combination of approaches' },
];

const fontSizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'soft', label: 'Soft' },
];

const highlightModes = [
  { value: 'word', label: 'Word', description: 'Highlight each word' },
  { value: 'line', label: 'Line', description: 'Highlight the whole line' },
  { value: 'none', label: 'None', description: 'No highlighting' },
];

const SlidePreferences = () => {
  const { uiPreferences, setUIPreferences } = useIntakeStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Your Preferences</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          How do you prefer to read and learn? There are no wrong answers.
        </p>
      </div>

      {/* Preferred mode */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-4">
          How do you prefer to learn new material?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {preferredModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setUIPreferences({ preferred_mode: mode.value as any })}
              className={`p-4 border-2 border-foreground text-left transition-colors ${
                uiPreferences.preferred_mode === mode.value
                  ? 'bg-foreground text-background'
                  : 'bg-transparent hover:bg-accent'
              }`}
            >
              <span className="font-headline font-bold block">{mode.label}</span>
              <span className={`text-sm ${
                uiPreferences.preferred_mode === mode.value
                  ? 'text-background/80'
                  : 'text-muted-foreground'
              }`}>
                {mode.description}
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
        <div className="flex gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => setUIPreferences({ font_size: size.value as any })}
              className={`flex-1 py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
                uiPreferences.font_size === size.value
                  ? 'bg-foreground text-background'
                  : 'bg-transparent hover:bg-accent'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-4">
          Which background feels easiest to read?
        </h3>
        <div className="flex gap-3">
          {themes.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => setUIPreferences({ theme: theme.value as any })}
              className={`flex-1 py-3 px-4 border-2 border-foreground font-headline font-bold transition-colors ${
                uiPreferences.theme === theme.value
                  ? 'bg-foreground text-background'
                  : 'bg-transparent hover:bg-accent'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Highlight mode */}
      <div className="newspaper-card">
        <h3 className="font-headline font-bold text-lg mb-4">
          How would you like text to be highlighted?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {highlightModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setUIPreferences({ highlight_mode: mode.value as any })}
              className={`p-4 border-2 border-foreground text-center transition-colors ${
                uiPreferences.highlight_mode === mode.value
                  ? 'bg-foreground text-background'
                  : 'bg-transparent hover:bg-accent'
              }`}
            >
              <span className="font-headline font-bold block">{mode.label}</span>
              <span className={`text-sm ${
                uiPreferences.highlight_mode === mode.value
                  ? 'text-background/80'
                  : 'text-muted-foreground'
              }`}>
                {mode.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidePreferences;
