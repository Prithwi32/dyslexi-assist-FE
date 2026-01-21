import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = login(username, password);
    
    if (result.success) {
      toast({
        title: "Welcome back",
        description: "Let's continue with your assessment.",
      });
      navigate('/intake');
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Newspaper header */}
        <div className="text-center mb-8">
          <div className="rule-double mb-4">
            <h1 className="headline-lg">DYSLEXI-ASSIST</h1>
          </div>
          <p className="text-muted-foreground italic">
            "Personalized Reading Support for Every Learner"
          </p>
          <p className="text-sm text-muted-foreground mt-1">Est. 2024</p>
        </div>

        {/* Login form card */}
        <div className="newspaper-card animate-fade-in">
          <div className="rule-thick mb-6" />
          <h2 className="headline-sm text-center mb-2">WELCOME BACK</h2>
          <p className="helper-text text-center mb-6">
            Sign in to continue your personalized journey.
          </p>
          <div className="rule-thin mb-6" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block font-headline font-bold mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-newspaper"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-headline font-bold mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-newspaper"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-accent border-2 border-foreground">
                <p className="text-foreground font-body">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-newspaper-primary w-full">
              Log In
            </button>
          </form>

          <div className="rule-thin my-6" />

          <p className="text-center text-muted-foreground">
            New here?{' '}
            <Link to="/register" className="font-bold underline hover:text-foreground">
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-6 italic">
          Your progress is automatically saved.
        </p>
      </div>
    </div>
  );
};

export default Login;
