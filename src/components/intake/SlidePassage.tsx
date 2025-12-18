import { useState, useEffect } from 'react';
import { useIntakeStore } from '@/store/intakeStore';
import { fluencyPassage } from '@/data/intakeItems';
import type { Attempt } from '@/types/intake';
import { Volume2, Mic, MicOff, Play, Square, Clock } from 'lucide-react';

const SlidePassage = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  
  const { modalitiesEnabled, setPassageData, addAttempt } = useIntakeStore();
  const useVoiceMode = modalitiesEnabled.mic;
  const maxTime = 45; // seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isComplete && startTime) {
      interval = setInterval(() => {
        const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsed(secondsElapsed);
        
        // Auto-stop at 45 seconds for voice mode
        if (useVoiceMode && secondsElapsed >= maxTime) {
          handleStop();
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isStarted, isComplete, startTime, useVoiceMode]);

  const handleStart = () => {
    setIsStarted(true);
    setStartTime(Date.now());
  };

  const handlePlayAudio = () => {
    console.log('Playing TTS for passage...');
    // In production, this would play TTS
  };

  const handleStop = () => {
    if (startTime) {
      const totalTime = (Date.now() - startTime) / 1000;
      
      setPassageData({
        durationS: totalTime,
        mode: useVoiceMode ? 'voice' : 'listen',
      });

      const attempt: Attempt = {
        screen_id: 'PASSAGE_FLUENCY',
        task_type: 'passage_reading_fluency',
        item_id: 'passage_maya_v1',
        presented_at: startTime / 1000,
        response: {
          choice_id: null,
          text: null,
          audio_blob_id: useVoiceMode ? 'mock_passage_audio' : null,
        },
        timing: {
          rt_ms: totalTime * 1000,
          time_on_screen_ms: totalTime * 1000,
        },
        scoring: {
          is_correct: null,
          error_type: null,
          partial_credit: 0,
          expected: null,
        },
        features: {
          distractor_type: null,
          difficulty_level: 3,
        },
        quality: {
          asr_confidence: null,
          device_lag_ms: 15,
        },
      };

      addAttempt(attempt);
      setIsComplete(true);
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
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="headline-md mb-4">Passage Reading</h2>
        <div className="rule-thin mx-auto max-w-xs mb-4" />
        <p className="helper-text max-w-xl mx-auto">
          {useVoiceMode 
            ? "Read this passage aloud at a comfortable pace. You have 45 seconds."
            : "Listen to this passage being read. Focus on understanding the story."
          }
        </p>
      </div>

      {/* Mode and timer */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          {useVoiceMode ? (
            <>
              <Mic className="w-5 h-5" />
              <span>Voice mode</span>
            </>
          ) : (
            <>
              <MicOff className="w-5 h-5" />
              <span>Listening mode</span>
            </>
          )}
        </div>
        
        {isStarted && (
          <div className="flex items-center gap-2 font-headline font-bold">
            <Clock className="w-5 h-5" />
            <span>{useVoiceMode ? `${maxTime - elapsed}s` : `${elapsed}s`}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center">
        {!isStarted ? (
          <div className="flex justify-center gap-4">
            {!useVoiceMode && (
              <button
                type="button"
                onClick={handlePlayAudio}
                className="audio-btn"
              >
                <Volume2 className="w-5 h-5" />
                <span>Listen</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleStart}
              className="btn-newspaper-primary inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              <span>{useVoiceMode ? 'Start Reading' : 'Start Timer'}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="btn-newspaper inline-flex items-center gap-2"
          >
            <Square className="w-5 h-5" />
            <span>I'm Done</span>
          </button>
        )}
      </div>

      {/* Passage card */}
      <div className="newspaper-card max-h-[50vh] overflow-y-auto">
        <div className="prose prose-lg max-w-none">
          {fluencyPassage.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 leading-relaxed text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidePassage;
