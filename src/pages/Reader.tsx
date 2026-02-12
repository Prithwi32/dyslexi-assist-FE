import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { sessionService } from '@/services/backendApi';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useToast } from '@/hooks/use-toast';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import type { GazePoint } from '@/types/api';
import { 
  Upload, 
  BookOpen, 
  Mic, 
  Square, 
  Loader2, 
  FileText, 
  LogOut,
  ChevronLeft,
  AlertCircle,
  Highlighter,
  Volume2
} from 'lucide-react';
import VoiceIndicator from '@/components/ui/VoiceIndicator';

declare global {
  interface Window {
    webgazer: any;
  }
}

const Reader = () => {
  const navigate = useNavigate();
  const { session, logout, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();
  
  // Session State
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    text: string;
    fileName: string;
  } | null>(null);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  
  // Reading/Recording State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [analyzingChunk, setAnalyzingChunk] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null);

  // Gaze Tracking State
  const gazePointsRef = useRef<GazePoint[]>([]);
  const isWebGazerInitialized = useRef(false);
  
  // Callback for automatic chunk processing
  const handleChunk = useCallback(async (chunkText: string) => {
    if (!activeSession || !chunkText.trim()) return;

    // Capture current gaze points and clear the buffer for the next chunk
    const currentGazePoints = [...gazePointsRef.current];
    gazePointsRef.current = []; // Reset for next chunk

    setAnalyzingChunk(true);
    
    // Show processing toast immediately
    toast({
      title: "Analyzing Speech",
      description: "Processing your reading...",
      duration: 3000,
    });

    try {
      const analysisResponse = await sessionService.processChunk(
        activeSession.sessionId,
        chunkText,
        currentGazePoints
      );
      
      const feedback = analysisResponse.analysis.feedback;
      setAnalysisFeedback(feedback);
      
      // Speak feedback if meaningful
      if (feedback && feedback !== "Good reading!") { 
         speak(feedback);
      }
      
    } catch (error) {
      console.error('Chunk analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not process the reading chunk.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingChunk(false);
    }
  }, [activeSession, speak, toast]);

  const sttOptions = useRef({
    onFinalResult: (text: string) => {
        // We use a ref to access the current handleChunk closure without resetting the STT hook
        // However, handleChunk depends on activeSession.
        // We need a stable callback for useSpeechToText.
    }
  });

  // Effect to update the ref if needed, or simply suppress re-creation
  // Better approach: useSpeechToText should verify if options changed deep or just rely on ref.
  // The hook has `[options]` dependency. If I pass a new object, it resets.
  // So I must Memoize sttOptions.

  const memoizedOptions = useMemo(() => ({
    onFinalResult: (text: string) => {
       handleChunk(text);
    },
    onError: (err: string) => {
        console.error("STT Error", err);
        toast({ title: "Microphone Error", description: err, variant: "destructive" });
    }
  }), [handleChunk, toast]);

  const {
    startRecording,
    stopAndTranscribe,
    isRecording,
    isTranscribing,
    isCapturing,
    liveTranscript,
    reset: resetSTT
  } = useSpeechToText(memoizedOptions);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Cleanup WebGazer on unmount or session end
  useEffect(() => {
    return () => {
      if (window.webgazer) {
        window.webgazer.end();
      }
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initWebGazer = async () => {
    if (!window.webgazer || isWebGazerInitialized.current) return;

    try {
      await window.webgazer.setRegression('ridge')
        .setGazeListener((data: any, timestamp: number) => {
          if (data && isRecording) {
            // Normalize coordinates
            const x = data.x / window.innerWidth;
            const y = data.y / window.innerHeight;
            
            // Only store valid points (0-1 range)
            if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
              gazePointsRef.current.push({
                x,
                y,
                t: Date.now() / 1000 // UNIX timestamp in seconds
              });
            }
          }
        })
        .begin();
      
      // Hide the gaze dot (optional, maybe user wants to see it)
      window.webgazer.showPredictionPoints(true); 
      isWebGazerInitialized.current = true;
    } catch (e) {
      console.error("Failed to init WebGazer", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!sessionService.isValidFileType(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await sessionService.startSessionWithFile(
        file,
        session?.userId, // Using the user ID from auth store
        undefined, // Let backend generate session ID
        { source: 'reader_upload' }
      );
      
      setActiveSession({
        sessionId: response.session_id,
        text: response.study_text,
        fileName: response.file_name,
      });

      // Init gaze tracking when session starts
      setTimeout(initWebGazer, 1000);

      toast({
        title: "Ready to read",
        description: `Loaded ${response.file_name} successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not process the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartReading = async () => {
    setStartTime(Date.now());
    setAnalysisFeedback(null);
    gazePointsRef.current = []; // Clear previous gaze points
    resetSTT();
    await startRecording();
    
    // Resume webgazer if paused
    if (window.webgazer && isWebGazerInitialized.current) {
        window.webgazer.resume();
    }
  };

  const handleStopReading = async () => {
    if (!activeSession) return;
    
    // Pause webgazer
    if (window.webgazer) {
        window.webgazer.pause();
    }

    try {
      // Just stop recording. Any pending speech will trigger onFinalResult via the hook's onend/onresult behavior 
      // or simply be discarded if too short. 
      // If the browser supports "continuous", stopping usually flushes the buffer.
      await stopAndTranscribe(); // We call this to ensure cleanup, but we ignore the return value for processing logic.
      
      toast({
        title: "Paused",
        description: "Recording stopped.",
      });

    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    
    try {
      await sessionService.endSession(activeSession.sessionId);
      if (window.webgazer) {
          window.webgazer.end();
          isWebGazerInitialized.current = false;
      }
      stopSpeaking();
      setActiveSession(null);
      setAnalysisFeedback(null);
      resetSTT();
      navigate('/'); // Go back to home/dashboard
    } catch (error) {
      console.error('End session error:', error);
    }
  };

  // Render Upload View
  if (!activeSession) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
        {/* Header */}
        <header className="border-b-2 border-primary/20 bg-[#FDFBF7] sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <h1 className="font-headline font-bold text-xl tracking-tight">DYSLEXI-READER</h1>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="headline-lg mb-4">Reading Studio</h2>
              <div className="rule-double mx-auto max-w-xs mb-4 text-primary/30" />
              <p className="helper-text">
                Upload your study material to begin a simplified, focus-friendly reading session.
              </p>
            </div>

            <div className="newspaper-card p-8 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-primary/60" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-headline font-bold text-xl">Upload Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOCX, and TXT files
                  </p>
                </div>

                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Processing your document...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn-newspaper-primary inline-flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Select File to Read</span>
                    </label>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground pt-4 border-t border-primary/10">
                  <p>Your privacy is protected. Files are processed securely.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render Reading Interface
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Reader Header */}
      <header className="border-b border-primary/10 bg-[#FDFBF7] shadow-sm sticky top-0 z-10 transition-all">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleEndSession}
                className="p-2 hover:bg-primary/5 rounded-full transition-colors"
                title="Exit Session"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="font-headline font-bold text-lg leading-none truncate max-w-[200px] md:max-w-md">
                  {activeSession.fileName}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">Reading Session</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               {activeSession && (
                 <span className="text-xs font-mono bg-primary/5 px-2 py-1 rounded hidden sm:inline-block">
                   SESSION ID: {activeSession.sessionId.slice(-6).toUpperCase()}
                 </span>
               )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-3xl mx-auto bg-white shadow-sm border border-primary/5 p-8 md:p-12 min-h-full rounded-sm">
            <article className="prose prose-lg md:prose-xl max-w-none font-serif text-foreground leading-loose">
              {activeSession.text.split('\n').map((para, i) => (
                para.trim() ? <p key={i} className="mb-6">{para}</p> : null
              ))}
            </article>
          </div>
        </main>

        {/* Sidebar Controls */}
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-primary/10 bg-[#FAF9F5] p-4 flex flex-col gap-6 z-20">
          
          {/* Controls Card */}
          <div className="newspaper-card p-5 space-y-4">
            <h3 className="font-headline font-bold text-sm uppercase tracking-wide text-muted-foreground">
              Voice Controls
            </h3>
            
            {!isRecording ? (
              <button
                onClick={handleStartReading}
                // disabled={analyzingChunk} // Allow restarting even if previous chunk is analyzing
                className="w-full btn-newspaper-primary flex items-center justify-center gap-2 py-3"
              >
                <Mic className="w-5 h-5" />
                <span>Start Reading</span>
              </button>
            ) : (
              <button
                onClick={handleStopReading}
                className="w-full btn-newspaper flex items-center justify-center gap-2 py-3 border-red-200 hover:bg-red-50 text-red-700"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Stop Reading</span>
              </button>
            )}

            {/* Voice Indicator */}
            {isRecording && (
              <div className="flex flex-col items-center gap-2 py-2 bg-white rounded border border-primary/10">
                <VoiceIndicator isRecording={isRecording} status={analyzingChunk ? 'processing' : 'listening'} />
                <span className="text-xs font-mono text-muted-foreground animate-pulse">
                  {analyzingChunk ? 'Analyzing...' : 'Listening...'}
                </span>
                
                {/* Live Transcript Preview */}
                <div className="w-full px-3 py-2 text-xs text-muted-foreground border-t border-primary/5 mt-2 max-h-20 overflow-hidden text-center italic">
                  "{liveTranscript || '...'}"
                </div>
              </div>
            )}
          </div>

          {/* Feedback Card */}
          {(analysisFeedback || analyzingChunk) && (
            <div className={`newspaper-card p-5 space-y-3 animate-fade-in ${
              analyzingChunk ? 'bg-blue-50/50 border-blue-100' : 'bg-green-50/50 border-green-100'
            }`}>
              <div className="flex items-center gap-2">
                {analyzingChunk ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <Highlighter className="w-4 h-4 text-green-600" />
                )}
                <h3 className={`font-headline font-bold text-sm uppercase tracking-wide ${
                  analyzingChunk ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {analyzingChunk ? 'Analyzing...' : 'Assistant Feedback'}
                </h3>
              </div>
              <div className={`rule-thin ${analyzingChunk ? 'bg-blue-200' : 'bg-green-200'}`} />
              <p className="text-sm leading-relaxed text-foreground/80">
                {analyzingChunk ? 'Analyzing your reading pattern and gaze...' : analysisFeedback}
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="mt-auto p-4 bg-primary/5 rounded border border-primary/10 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-2 font-bold text-primary/60">
              <AlertCircle className="w-4 h-4" />
              <span>Reading Tip</span>
            </div>
            <p>
              Take your time. If you get stuck on a word, pause and try to sound it out. 
              The assistant is listening to help you, not judge you.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Reader;
