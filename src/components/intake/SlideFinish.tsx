import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SlideFinish = () => {
  const navigate = useNavigate();

  const handleGenerateResults = () => {
    navigate('/export');
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
          Click below to review your results and export your data.
        </p>

        <button
          type="button"
          onClick={handleGenerateResults}
          className="btn-newspaper-primary text-xl px-8 py-4"
        >
          Generate Results JSON
        </button>
      </div>

      <p className="helper-text max-w-md mx-auto">
        Your data is stored locally and can be exported for analysis.
      </p>
    </div>
  );
};

export default SlideFinish;
