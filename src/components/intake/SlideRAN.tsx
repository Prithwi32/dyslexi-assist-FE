import { useState, useCallback, useRef } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { ranGridItems } from '@/data/intakeItems';
import { Mic, MicOff, Play, Square } from 'lucide-react';
import { useSpeechToText } from '@/hooks/useSpeechToText';

const SlideRAN = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [tappedCells, setTappedCells] = useState<Set<number>>(new Set());
  const [misTaps, setMisTaps] = useState(0);
  
  const { micEnabled, addTask } = useIntakeStore();
  const { startRecording, stopAndTranscribe, isRecording } = useSpeechToText();
  const useVoiceMode = micEnabled;
  const transcriptRef = useRef<string | null>(null);

  const handleStart = () => {
    setIsStarted(true);
    setStartTime(Date.now());
    setTappedCells(new Set());
    setMisTaps(0);
    
    if (useVoiceMode) {
      startRecording();
    }
  };

  const handleStop = useCallback(async () => {
    if (startTime) {
      const totalTime = Date.now() - startTime;
      
      // Get transcript if voice mode
      if (useVoiceMode) {
        const result = await stopAndTranscribe();
        transcriptRef.current = result.text || null;
      }

      // Add as a task result
      addTask({
        taskId: 'ran_1',
        type: 'rapid_naming',
        difficulty: 2,
        correct: misTaps === 0,
        responseTimeMs: totalTime,
        errorType: misTaps > 0 ? 'sequence_error' : null,
        transcript: transcriptRef.current,
      });

      setIsComplete(true);
    }
  }, [startTime, useVoiceMode, misTaps, addTask, stopAndTranscribe]);

  const handleCellTap = (index: number) => {
    if (!isStarted || isComplete) return;
    
    // Check if tapping in correct order
    const expectedIndex = tappedCells.size;
    if (index !== expectedIndex) {
      setMisTaps((prev) => prev + 1);
    }
    
    setTappedCells((prev) => new Set([...prev, index]));
    
    // Auto-complete when all cells are tapped
    if (tappedCells.size === ranGridItems.length - 1) {
      handleStop();
    }
  };

  if (isComplete) {
    return (
      <div className="text-center animate-fade-in py-12">
        <h2 className="headline-md mb-4">Section Complete</h2>
        <p className="helper-text">Great work! Click Next to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Quick Naming</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          {useVoiceMode 
            ? "Say each number out loud as quickly as you can, going left to right, top to bottom."
            : "Tap each number in order (left to right, top to bottom) as quickly as you can."
          }
        </p>
      </div>

      <div className="newspaper-card">
        {/* Mode indicator */}
        <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
          {useVoiceMode ? (
            <>
              <Mic className="w-5 h-5" />
              <span>Voice mode enabled</span>
            </>
          ) : (
            <>
              <MicOff className="w-5 h-5" />
              <span>Tap mode (microphone off)</span>
            </>
          )}
        </div>

        {/* Start/Stop controls */}
        {!isStarted ? (
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={handleStart}
              className="btn-newspaper-primary inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              <span>Start</span>
            </button>
          </div>
        ) : (
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={handleStop}
              className="btn-newspaper inline-flex items-center gap-2"
            >
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {/* RAN Grid */}
        <div className="ran-grid max-w-md mx-auto">
          {ranGridItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleCellTap(index)}
              disabled={!isStarted || useVoiceMode}
              className={`ran-cell ${
                tappedCells.has(index) ? 'ran-cell-tapped' : ''
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {isStarted && !useVoiceMode && (
          <p className="text-center text-muted-foreground mt-4 text-sm">
            Tapped: {tappedCells.size} / {ranGridItems.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default SlideRAN;
