import { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceIndicatorProps {
  isRecording?: boolean;
  status?: 'listening' | 'processing' | 'error';
  label?: string;
  className?: string;
}

const VoiceIndicator = ({ isRecording = false, status, label, className }: VoiceIndicatorProps) => {
  const [bars, setBars] = useState<number[]>([0.3, 0.5, 0.7, 0.5, 0.3]);

  const effectiveStatus = status ?? (isRecording ? 'listening' : 'processing');
  const isListening = effectiveStatus === 'listening';
  const isProcessing = effectiveStatus === 'processing';
  const isError = effectiveStatus === 'error';

  useEffect(() => {
    if (!isListening) {
      setBars([0.3, 0.5, 0.7, 0.5, 0.3]);
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50 border border-border",
      className
    )}>
      <div className="relative">
        <Mic className={cn(
          "w-5 h-5",
          isListening && "text-primary animate-pulse",
          isProcessing && "text-muted-foreground",
          isError && "text-destructive"
        )} />
        {isListening && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
        )}
      </div>
      
      <div className="flex items-end gap-0.5 h-6">
        {bars.map((height, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-100",
              isListening && "bg-primary",
              !isListening && "bg-muted-foreground/40"
            )}
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>
      
      <span className={cn(
        "text-sm font-medium",
        isListening && "text-primary",
        isProcessing && "text-muted-foreground",
        isError && "text-destructive"
      )}>
        {label ?? (isListening ? 'Listening…' : isProcessing ? 'Processing…' : 'Mic error')}
      </span>
    </div>
  );
};

export default VoiceIndicator;
