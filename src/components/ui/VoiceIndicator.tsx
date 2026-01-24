import { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceIndicatorProps {
  isRecording: boolean;
  className?: string;
}

const VoiceIndicator = ({ isRecording, className }: VoiceIndicatorProps) => {
  const [bars, setBars] = useState<number[]>([0.3, 0.5, 0.7, 0.5, 0.3]);

  useEffect(() => {
    if (!isRecording) {
      setBars([0.3, 0.5, 0.7, 0.5, 0.3]);
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30",
      className
    )}>
      <div className="relative">
        <Mic className="w-5 h-5 text-destructive animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-ping" />
      </div>
      
      <div className="flex items-end gap-0.5 h-6">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-1 bg-destructive rounded-full transition-all duration-100"
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>
      
      <span className="text-sm font-medium text-destructive">
        Listening...
      </span>
    </div>
  );
};

export default VoiceIndicator;
