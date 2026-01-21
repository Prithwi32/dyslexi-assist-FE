import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('The passwords do not match. Please check and try again.');
      return;
    }
    
    const result = register(username, password);
    
    if (result.success) {
      toast({
        title: "Account created",
        description: "Welcome! Let's begin your personalized assessment.",
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

        {/* Registration form card */}
        <div className="newspaper-card animate-fade-in">
          <div className="rule-thick mb-6" />
          <h2 className="headline-sm text-center mb-2">CREATE ACCOUNT</h2>
          <p className="helper-text text-center mb-6">
            Join us to discover your unique reading profile.
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
                placeholder="Choose a username"
                required
                minLength={3}
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
                placeholder="Create a password"
                required
                minLength={4}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-headline font-bold mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-newspaper"
                placeholder="Type your password again"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-accent border-2 border-foreground">
                <p className="text-foreground font-body">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-newspaper-primary w-full">
              Create Account
            </button>
          </form>

          <div className="rule-thin my-6" />

          <p className="text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline hover:text-foreground">
              Log in
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-muted-foreground mt-6 italic">
          Your information is kept private and secure.
        </p>
      </div>
    </div>
  );
};

export default Register;
