import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useIntakeStore } from '@/store/intakeStore';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number | ''>(10);
  const [grade, setGrade] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuthStore();
  const { resetIntake, setUserInfo } = useIntakeStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('The passwords do not match. Please check and try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await register({
        email,
        password,
        name,
        age: Number(age),
        grade_level: grade,
        metadata: {}
      });
      
      if (result.success) {
        toast({
          title: "Account created",
          description: "Welcome! Let's begin your personalized assessment.",
        });
        
        // Reset intake store for the new user and pre-fill known info
        resetIntake();
        setUserInfo({
          name: name,
          email: email,
          age: Number(age),
          gradeLevel: grade
        });

        navigate('/intake');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch(err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-headline font-bold mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-newspaper"
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block font-headline font-bold mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-newspaper"
                placeholder="John Doe"
                required
                minLength={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block font-headline font-bold mb-1">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="input-newspaper"
                  placeholder="10"
                  required
                  min={5}
                  max={99}
                />
              </div>
              <div>
                <label htmlFor="grade" className="block font-headline font-bold mb-1">
                  Grade Level
                </label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="input-newspaper"
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="1st">1st Grade</option>
                  <option value="2nd">2nd Grade</option>
                  <option value="3rd">3rd Grade</option>
                  <option value="4th">4th Grade</option>
                  <option value="5th">5th Grade</option>
                  <option value="6th">6th Grade</option>
                  <option value="7th">7th Grade</option>
                  <option value="8th">8th Grade</option>
                  <option value="High School">High School</option>
                  <option value="Adult">Adult</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block font-headline font-bold mb-1">
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
              <label htmlFor="confirmPassword" className="block font-headline font-bold mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-newspaper"
                placeholder="Confirm password"
                required
                minLength={4}
              />
            </div>

            {error && (
              <div className="p-3 bg-accent border-2 border-foreground">
                <p className="text-foreground font-body text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-newspaper-primary w-full disabled:opacity-50">
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
