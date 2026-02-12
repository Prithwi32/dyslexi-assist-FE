import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useIntakeStore } from '@/store/intakeStore';
import { useAuthStore } from '@/store/authStore';
import { assignmentService } from '@/services/backendApi';
import { useToast } from '@/hooks/use-toast';

const SlideFinish = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { generateResults } = useIntakeStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session?.userId) return;
    
    setIsSubmitting(true);
    try {
      // 1. Generate results from store
      const results = generateResults();
      
      // 2. Convert to assignment format
      const assignmentData = assignmentService.convertIntakeToAssignment(
        session.userId,
        results,
        "Initial Intake Assessment"
      );
      
      // 3. Submit to backend
      await assignmentService.submitAssignment(assignmentData);
      
      toast({
        title: "Assessment Complete",
        description: "Your profile has been created successfully.",
        variant: "default",
      });
      
      // 4. Navigate to Home/Dashboard
      navigate('/');
      
    } catch (error: any) {
      console.error("Submission failed:", error);
      if (error.response) {
        console.error("Error data:", JSON.stringify(error.response.data, null, 2));
      }
      toast({
        title: "Submission failed",
        description: "Could not save your results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-center py-8">
      <div className="flex justify-center">
        <CheckCircle className="w-20 h-20 text-success" strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="headline-lg mb-4">All Done!</h2>
        <div className="rule-double mx-auto max-w-xs mb-6" />
      </div>

      <div className="newspaper-card max-w-lg mx-auto">
        <p className="text-xl leading-relaxed mb-6">
          Thank you for completing the intake questionnaire. Your responses will help us create a personalized reading experience just for you.
        </p>
        
        <p className="text-muted-foreground mb-8">
          Click below to create your profile and start reading.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-newspaper-primary text-xl px-8 py-4 w-full flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-6 h-6 animate-spin" />}
          {isSubmitting ? 'Saving Profile...' : 'Finish & Start Reading'}
        </button>
      </div>

      <p className="helper-text max-w-md mx-auto">
        Your data is processed securely to personalize your experience.
      </p>
    </div>
  );
};

export default SlideFinish;
