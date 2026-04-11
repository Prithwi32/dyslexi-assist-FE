import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { progressService } from '@/services/backendApi';
import { BookOpen, ArrowRight, BarChart, Clock, Star, Calendar } from 'lucide-react';
import type { UserProgress, SessionSummary } from '@/types/api';

const Index = () => {
  const { session, isAuthenticated, logout } = useAuthStore();
  const loggedIn = isAuthenticated();
  const navigate = useNavigate();

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loggedIn && session?.userId) {
       loadDashboardData(session.userId);
    }
  }, [loggedIn, session]);

  const handleGenerateReport = async () => {
    if (!session?.userId) return;
    setIsGeneratingReport(true);
    setReport(null);
    try {
      const res = await progressService.getUserReport(session.userId);
      if (res.success && res.report) {
        setReport(res.report);
      }
    } catch (e) {
      console.error("Failed to generate report", e);
      setReport("Failed to generate report. Please try again later.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const loadDashboardData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [progData, sessData] = await Promise.all([
        progressService.getUserProgress(userId).catch(() => null),
        progressService.getUserSessions(userId, 5).catch(() => null)
      ]);
      
      if (progData) setProgress(progData.progress);
      if (sessData) setRecentSessions(sessData.sessions);
    } catch (e) {
      console.error("Failed to load dashboard", e);
    } finally {
      setIsLoading(false);
    }
  };

  const LandingView = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Newspaper masthead */}
        <div className="text-center mb-8">
          <div className="rule-double pb-4 mb-4">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-2">
              The Reading Support Gazette
            </p>
            <h1 className="headline-lg tracking-tight">DYSLEXI-ASSIST</h1>
            <p className="text-muted-foreground mt-2 italic">
              "Personalized Reading Support for Every Learner"
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Est. 2024</span>
            <span>•</span>
            <span>Vol. 1, No. 1</span>
            <span>•</span>
            <span>Free Edition</span>
          </div>
        </div>

        {/* Main card */}
        <div className="newspaper-card animate-fade-in">
          <div className="rule-thick mb-6" />
          
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-16 h-16 text-foreground" strokeWidth={1} />
          </div>

          <h2 className="headline-md text-center mb-4">
            Discover Your Unique Reading Profile
          </h2>
          
          <div className="rule-thin mb-6" />

          <p className="text-lg leading-relaxed text-center mb-6">
             Dyslexi-Assist creates a personalized reading experience based on your individual strengths and needs. Our gentle assessment helps us understand how you learn best.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 border border-foreground/20">
              <span className="font-headline font-bold text-3xl">10</span>
              <p className="text-sm text-muted-foreground">Minutes to complete</p>
            </div>
            <div className="text-center p-4 border border-foreground/20">
              <span className="font-headline font-bold text-3xl">12</span>
              <p className="text-sm text-muted-foreground">Simple activities</p>
            </div>
            <div className="text-center p-4 border border-foreground/20">
              <span className="font-headline font-bold text-3xl">∞</span>
              <p className="text-sm text-muted-foreground">Skip any time</p>
            </div>
          </div>

          <div className="rule-thin mb-6" />

          {/* CTAs */}
          <div className="space-y-4">
            <Link
              to="/register"
              className="btn-newspaper-primary w-full inline-flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="btn-newspaper-outline w-full inline-flex items-center justify-center"
            >
              <span>I Already Have an Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="min-h-screen flex flex-col pt-4 pb-12">
       {/* Header */}
        <header className="container mx-auto px-4 mb-8">
          <div className="flex justify-between items-center border-b-2 border-primary/20 pb-4">
            <div>
              <h1 className="headline-md">The Daily Reader</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {session?.username}</p>
            </div>
            <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground underline">
              Log Out
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 flex-1">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Stats & Action */}
              <div className="md:col-span-2 space-y-8">
                 {/* Hero Action */}
                 <div className="newspaper-card p-8 text-center border-4 border-double border-primary/20">
                    <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h2 className="headline-md mb-2">Ready to Read?</h2>
                    <p className="mb-6 text-muted-foreground">Start a new session tailored to your needs.</p>
                    <button 
                      onClick={() => navigate('/reader')}
                      className="btn-newspaper-primary w-full md:w-auto px-8"
                    >
                      Enter Reading Studio
                    </button>
                 </div>

                 {/* Progress Stats */}
                 <div className="newspaper-card">
                    <h3 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
                       <BarChart className="w-5 h-5" /> Your Progress
                    </h3>
                    <div className="rule-thin mb-4" />
                    
                    {progress ? (
                       <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                             <span className="block text-3xl font-bold font-headline">{progress.completed_sessions}</span>
                             <span className="text-xs text-muted-foreground uppercase tracking-wide">Sessions</span>
                          </div>
                          <div>
                             <span className="block text-3xl font-bold font-headline text-primary">
                                {Math.round(progress.overall_average_score * 100)}%
                             </span>
                             <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Score</span>
                          </div>
                          <div>
                             <span className="block text-3xl font-bold font-headline">
                                {Math.round(progress.total_reading_time_seconds / 60)}
                             </span>
                             <span className="text-xs text-muted-foreground uppercase tracking-wide">Minutes Read</span>
                          </div>
                       </div>
                    ) : (
                       <div className="text-center py-8 text-muted-foreground italic">
                          No progress data yet. Start reading!
                       </div>
                    )}
                 </div>
              </div>

              {/* Right Column: Recent Sessions */}
              <div className="newspaper-card h-fit">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Recent History
                   </h3>
                   {recentSessions.length > 0 && (
                     <button 
                       onClick={handleGenerateReport} 
                       disabled={isGeneratingReport}
                       className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 disabled:opacity-50"
                     >
                       {isGeneratingReport ? "Generating..." : "Get Report"}
                     </button>
                   )}
                 </div>
                 <div className="rule-thick mb-4" />
                 
                 {report && (
                   <div className="bg-muted p-4 rounded-md mb-6 border border-primary/20">
                     <h4 className="font-bold text-sm mb-2">Reading Improvement Report</h4>
                     <p className="text-sm whitespace-pre-wrap text-muted-foreground">{report}</p>
                   </div>
                 )}
                 
                 {recentSessions.length > 0 ? (
                    <ul className="space-y-4">
                       {recentSessions.map((sess) => (
                          <li key={sess.session_id} className="pb-4 border-b border-dashed border-primary/20 last:border-0">
                             <div 
                               className="flex justify-between items-start mb-1 cursor-pointer hover:bg-foreground/5 p-1 rounded"
                               onClick={() => setExpandedSessionId(expandedSessionId === sess.session_id ? null : sess.session_id)}
                             >
                                <span className="font-bold font-headline text-sm line-clamp-1">{sess.file_name}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                  {new Date(sess.created_at || Date.now()).toLocaleDateString()}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                                <Star className="w-3 h-3 text-yellow-600" />
                                <span>Score: {Math.round(sess.average_score * 100)}%</span>
                             </div>

                             {expandedSessionId === sess.session_id && sess.chunks && (
                               <div className="mt-3 pl-2 border-l-2 border-primary/30 space-y-3">
                                 {sess.chunks.length > 0 ? sess.chunks.map((chunk, i) => (
                                   <div key={chunk.chunk_id || i} className="text-xs space-y-1">
                                     <p className="text-muted-foreground italic">"{chunk.transcript}"</p>
                                     {chunk.errors_detected?.length > 0 && (
                                       <div className="flex flex-wrap gap-1 mt-1">
                                         {chunk.errors_detected.map((err, j) => (
                                           <span key={j} className="bg-red-100 text-red-800 px-1 rounded text-[10px]">
                                             {err.word_actual} ({err.error_type})
                                           </span>
                                         ))}
                                       </div>
                                     )}
                                     <p className="font-medium text-primary mt-1">{chunk.feedback}</p>
                                   </div>
                                 )) : (
                                   <p className="text-xs text-muted-foreground">No reading chunks recorded.</p>
                                 )}
                               </div>
                             )}
                          </li>
                       ))}
                    </ul>
                 ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                       Your reading history will appear here.
                    </p>
                 )}
                 
                 <div className="mt-6 pt-4 border-t-2 border-foreground/10 text-center">
                    <p className="text-xs text-muted-foreground">
                       Keep reading to build your history!
                    </p>
                 </div>
              </div>
           </div>
        </main>
    </div>
  );

  return loggedIn ? <DashboardView /> : <LandingView />;
};

export default Index;
