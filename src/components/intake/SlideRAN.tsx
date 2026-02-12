import { useState, useCallback, useRef } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { ranGridItems } from '@/data/intakeItems';
import { Mic, MicOff, Play, Square } from 'lucide-react';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import VoiceIndicator from '@/components/ui/VoiceIndicator';

const SlideRAN = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [tappedCells, setTappedCells] = useState<Set<number>>(new Set());
  const [misTaps, setMisTaps] = useState(0);
  
  const { micEnabled, addTask } = useIntakeStore();
  const {
    startRecording,
    stopAndTranscribe,
    isRecording,
    isTranscribing,
    isCapturing,
    liveTranscript,
  } = useSpeechToText();
  const useVoiceMode = micEnabled;
  const transcriptRef = useRef<string | null>(null);

  const handleStart = async () => {
    setIsStarted(true);
    setStartTime(Date.now());
    setTappedCells(new Set());
    setMisTaps(0);
    setSttError(null);
    
    if (useVoiceMode) {
      await startRecording();
    }
  };

  const handleStop = useCallback(async () => {
    if (!startTime) return;
    
    const totalTime = Date.now() - startTime;
    
    // Get transcript if voice mode
    if (useVoiceMode) {
      try {
        const result = await stopAndTranscribe();
        const text = (result.text ?? '').trim();
        const resolved = text ? text : (liveTranscript.trim() ? liveTranscript.trim() : null);

        if (!resolved) {
          // Don't let a verbal task submit with null transcript.
          setSttError('No speech was captured. Please try again (make sure mic permission is allowed).');
          await startRecording();
          return;
        }

        transcriptRef.current = resolved;
      } catch (error) {
        console.error('Error during stopAndTranscribe:', error);
        // Fallback to liveTranscript
        const fallback = liveTranscript.trim() || null;
        if (!fallback) {
          setSttError('No speech was captured. Please try again (make sure mic permission is allowed).');
          await startRecording();
          return;
        }
        transcriptRef.current = fallback;
      }
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
  }, [startTime, useVoiceMode, misTaps, addTask, stopAndTranscribe, liveTranscript, startRecording]);

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

        {/* Voice recording indicator */}
        {useVoiceMode && isStarted && isCapturing && (
          <div className="flex justify-center mb-4">
            <VoiceIndicator
              isRecording={isRecording}
              status={isTranscribing ? 'processing' : 'listening'}
            />
          </div>
        )}

        {/* Live transcript preview */}
        {useVoiceMode && isStarted && (
          <div className="mx-auto mb-4 max-w-lg">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Live transcript</div>
            <div className="bg-background border border-border rounded-md px-3 py-2 text-sm">
              {liveTranscript ? (
                <span className="text-foreground">{liveTranscript}</span>
              ) : (
                <span className="text-muted-foreground italic">(start speaking…)</span>
              )}
            </div>
            {sttError && (
              <div className="mt-2 text-sm text-destructive">{sttError}</div>
            )}
          </div>
        )}

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
              disabled={isTranscribing}
              className="btn-newspaper inline-flex items-center gap-2"
            >
              <Square className="w-5 h-5" />
              <span>{isTranscribing ? 'Processing...' : 'Stop'}</span>
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
