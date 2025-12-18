import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useIntakeStore } from '@/store/intakeStore';
import { sendIntakeData, validatePayload, downloadJson, copyToClipboard } from '@/services/intakeService';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Send, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import type { IntakePayload } from '@/types/intake';

const Export = () => {
  const navigate = useNavigate();
  const { session, logout, isAuthenticated } = useAuthStore();
  const { generatePayload, resetIntake } = useIntakeStore();
  const { toast } = useToast();

  const [payload, setPayload] = useState<IntakePayload | null>(null);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/register');
      return;
    }

    if (session) {
      const generatedPayload = generatePayload(session.userId);
      setPayload(generatedPayload);
      setValidation(validatePayload(generatedPayload));
    }
  }, [isAuthenticated, session, generatePayload, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCopy = async () => {
    if (payload) {
      const success = await copyToClipboard(JSON.stringify(payload, null, 2));
      toast({
        title: success ? "Copied!" : "Could not copy",
        description: success 
          ? "JSON copied to clipboard" 
          : "Please select and copy manually",
      });
    }
  };

  const handleDownload = () => {
    if (payload) {
      const filename = `dyslexi-assist-intake-${payload.intake_session_id.slice(0, 8)}.json`;
      downloadJson(payload, filename);
      toast({
        title: "Downloaded",
        description: `Saved as ${filename}`,
      });
    }
  };

  const handleSend = async () => {
    if (!payload || !validation.valid) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const result = await sendIntakeData(payload);
      setSendResult(result);
      toast({
        title: result.success ? "Sent successfully" : "Send failed",
        description: result.message,
      });
    } catch (error) {
      setSendResult({
        success: false,
        message: 'Failed to send data. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleStartOver = () => {
    resetIntake();
    navigate('/intake');
  };

  if (!session || !payload) {
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
              <p className="text-sm text-muted-foreground">Results Export</p>
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

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title section */}
          <div className="text-center">
            <h2 className="headline-lg mb-4">Review & Export</h2>
            <div className="rule-double mx-auto max-w-xs mb-4" />
            <p className="helper-text max-w-xl mx-auto">
              Your intake data is ready. Review the JSON below and choose how to export it.
            </p>
          </div>

          {/* Validation status */}
          <div className={`newspaper-card ${validation.valid ? 'border-success' : ''}`}>
            <div className="flex items-center gap-3">
              {validation.valid ? (
                <>
                  <CheckCircle className="w-6 h-6 text-success" />
                  <span className="font-headline font-bold">Data validated successfully</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-warning" />
                  <div>
                    <span className="font-headline font-bold block">Validation issues found</span>
                    <ul className="text-sm text-muted-foreground mt-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="newspaper-card text-center">
              <span className="text-3xl font-headline font-bold">{payload.attempts.length}</span>
              <p className="text-sm text-muted-foreground">Items Completed</p>
            </div>
            <div className="newspaper-card text-center">
              <span className="text-3xl font-headline font-bold">{payload.locale}</span>
              <p className="text-sm text-muted-foreground">Locale</p>
            </div>
            <div className="newspaper-card text-center">
              <span className="text-3xl font-headline font-bold capitalize">
                {payload.grade_band.replace('_', ' ')}
              </span>
              <p className="text-sm text-muted-foreground">Grade Band</p>
            </div>
            <div className="newspaper-card text-center">
              <span className="text-3xl font-headline font-bold">
                {payload.modalities_enabled.mic ? 'Yes' : 'No'}
              </span>
              <p className="text-sm text-muted-foreground">Mic Enabled</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-newspaper-outline inline-flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
              <span>Copy JSON</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="btn-newspaper-outline inline-flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Download .json</span>
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!validation.valid || isSending}
              className={`btn-newspaper-primary inline-flex items-center gap-2 ${
                !validation.valid || isSending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="w-5 h-5" />
              <span>{isSending ? 'Sending...' : 'Send to Backend'}</span>
            </button>
          </div>

          {/* Send result */}
          {sendResult && (
            <div className={`newspaper-card ${sendResult.success ? 'border-success' : ''}`}>
              <div className="flex items-center gap-3">
                {sendResult.success ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-warning" />
                )}
                <span className="font-body">{sendResult.message}</span>
              </div>
            </div>
          )}

          {/* JSON display */}
          <div className="newspaper-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-bold text-lg">Results JSON</h3>
              <span className="text-sm text-muted-foreground">
                {JSON.stringify(payload).length.toLocaleString()} bytes
              </span>
            </div>
            <div className="rule-thin mb-4" />
            <pre className="bg-background border-2 border-foreground p-4 overflow-x-auto text-sm font-mono max-h-[50vh] overflow-y-auto">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>

          {/* Start over */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleStartOver}
              className="btn-newspaper-outline"
            >
              Start New Assessment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Export;
