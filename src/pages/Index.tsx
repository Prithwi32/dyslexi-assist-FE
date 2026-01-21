import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, ArrowRight } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  return (
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
            {loggedIn ? (
              <Link
                to="/intake"
                className="btn-newspaper-primary w-full inline-flex items-center justify-center gap-2"
              >
                <span>Continue Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground italic">
            No test scores. No judgment. Just personalized support.
          </p>
          <div className="rule-thin mx-auto max-w-xs mt-4" />
          <p className="text-xs text-muted-foreground mt-4">
            This assessment is designed to be comfortable and stress-free.
            <br />
            You can skip any question at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
