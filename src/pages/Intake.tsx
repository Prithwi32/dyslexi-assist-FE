import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useIntakeStore } from '@/store/intakeStore';
import { ChevronLeft, ChevronRight, SkipForward, LogOut } from 'lucide-react';

// Import all slide components
import SlideConsent from '@/components/intake/SlideConsent';
import SlidePreferences from '@/components/intake/SlidePreferences';
import SlideLetterSound from '@/components/intake/SlideLetterSound';
import SlidePhonemeBlend from '@/components/intake/SlidePhonemeBlend';
import SlidePhonemeSegment from '@/components/intake/SlidePhonemeSegment';
import SlideRAN from '@/components/intake/SlideRAN';
import SlideRealWords from '@/components/intake/SlideRealWords';
import SlideNonwords from '@/components/intake/SlideNonwords';
import SlidePassage from '@/components/intake/SlidePassage';
import SlideComprehension from '@/components/intake/SlideComprehension';
import SlideSelfReport from '@/components/intake/SlideSelfReport';
import SlideFinish from '@/components/intake/SlideFinish';

const TOTAL_SLIDES = 12;

const slideInfo = [
  { title: 'Setup', component: SlideConsent },
  { title: 'Preferences', component: SlidePreferences },
  { title: 'Letter Sounds', component: SlideLetterSound },
  { title: 'Sound Blending', component: SlidePhonemeBlend },
  { title: 'Counting Sounds', component: SlidePhonemeSegment },
  { title: 'Quick Naming', component: SlideRAN },
  { title: 'Word Reading', component: SlideRealWords },
  { title: 'Made-Up Words', component: SlideNonwords },
  { title: 'Passage', component: SlidePassage },
  { title: 'Comprehension', component: SlideComprehension },
  { title: 'Self-Report', component: SlideSelfReport },
  { title: 'Finish', component: SlideFinish },
];

const Intake = () => {
  const navigate = useNavigate();
  const { session, logout, isAuthenticated } = useAuthStore();
  const { currentSlide, setCurrentSlide, nextSlide, prevSlide, setUserInfo } = useIntakeStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/register');
    } else if (session) {
      // Ensure intake store user info matches current auth session
      setUserInfo({
        name: session.username,
        email: session.username.includes('@') ? session.username : undefined, // crude guess if username is email
        // We don't have age/grade in session, but that's fine, they come from profile or defaults
      });
    }
  }, [isAuthenticated, navigate, session, setUserInfo]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNext = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      nextSlide();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      prevSlide();
    }
  };

  const handleSkip = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      nextSlide();
    }
  };

  const CurrentSlideComponent = slideInfo[currentSlide]?.component || SlideConsent;
  const isLastSlide = currentSlide === TOTAL_SLIDES - 1;
  const isFirstSlide = currentSlide === 0;

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline font-bold text-xl">DYSLEXI-ASSIST</h1>
              <p className="text-sm text-muted-foreground">Welcome, {session.username}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-headline font-bold text-sm">
            Step {currentSlide + 1} of {TOTAL_SLIDES}
          </span>
          <span className="text-sm text-muted-foreground">
            {slideInfo[currentSlide]?.title}
          </span>
        </div>
        <div className="progress-newspaper">
          <div 
            className="progress-newspaper-fill"
            style={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }}
          />
        </div>
      </div>

      {/* Helper text */}
      <div className="container mx-auto px-4 mb-4">
        <div className="bg-accent/50 border border-foreground/20 p-3 text-center">
          <p className="helper-text text-sm">
            This is not a test. Skip anything. This helps personalize reading support.
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 pb-32">
        <div className="slide-container">
          <CurrentSlideComponent onComplete={handleNext} />
        </div>
      </main>

      {/* Navigation footer */}
      {!isLastSlide && (
        <footer className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-foreground">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={isFirstSlide}
                className={`btn-newspaper-outline flex items-center gap-2 ${
                  isFirstSlide ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="btn-newspaper-outline flex items-center gap-2"
              >
                <span>Skip</span>
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="btn-newspaper-primary flex items-center gap-2"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Intake;
