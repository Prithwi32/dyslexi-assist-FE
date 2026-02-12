import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testBackendIntegration, testHealthCheck } from '@/services/apiTests';
import { CheckCircle, XCircle, Loader2, Play } from 'lucide-react';

const ApiTest = () => {
  const navigate = useNavigate();
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<any>(null);

  const handleHealthCheck = async () => {
    setIsTestingHealth(true);
    setHealthStatus('idle');
    
    try {
      const result = await testHealthCheck();
      setHealthStatus(result.success ? 'success' : 'error');
      console.log('Health check result:', result);
    } catch (error) {
      setHealthStatus('error');
      console.error('Health check error:', error);
    } finally {
      setIsTestingHealth(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsTestingAll(true);
    setTestResults(null);
    
    try {
      const results = await testBackendIntegration();
      setTestResults(results);
      console.log('All tests completed:', results);
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsTestingAll(false);
    }
  };

  const getStatusIcon = (status: 'idle' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const countSuccesses = (results: any) => {
    if (!results) return { success: 0, total: 0 };
    const values = Object.values(results);
    const success = values.filter((r: any) => r?.success).length;
    return { success, total: values.length };
  };

  const stats = testResults ? countSuccesses(testResults) : { success: 0, total: 0 };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline font-bold text-xl">DYSLEXI-ASSIST</h1>
              <p className="text-sm text-muted-foreground">API Integration Test</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="headline-lg mb-4">Backend API Test Suite</h2>
            <div className="rule-double mx-auto max-w-xs mb-4" />
            <p className="helper-text max-w-xl mx-auto">
              Test the connection and functionality of the FastAPI backend running on localhost:8001
            </p>
          </div>

          {/* Quick Health Check */}
          <div className="newspaper-card">
            <h3 className="font-headline font-bold text-lg mb-4">Quick Health Check</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Verify the backend server is running and responding
            </p>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleHealthCheck}
                disabled={isTestingHealth}
                className="btn-newspaper-primary inline-flex items-center gap-2"
              >
                {isTestingHealth ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isTestingHealth ? 'Testing...' : 'Test Health'}</span>
              </button>
              
              {healthStatus !== 'idle' && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(healthStatus)}
                  <span className="text-sm font-medium">
                    {healthStatus === 'success' 
                      ? 'Backend is running ✓' 
                      : 'Backend is not responding ✗'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Full Test Suite */}
          <div className="newspaper-card">
            <h3 className="font-headline font-bold text-lg mb-4">Full Integration Test Suite</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run comprehensive tests for all API endpoints including user management, assignments, and analytics
            </p>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleRunAllTests}
                disabled={isTestingAll}
                className="btn-newspaper-primary inline-flex items-center gap-2"
              >
                {isTestingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isTestingAll ? 'Running Tests...' : 'Run All Tests'}</span>
              </button>

              {isTestingAll && (
                <div className="bg-accent/50 border border-border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">
                    Running tests... Check browser console for detailed output.
                  </p>
                </div>
              )}

              {testResults && (
                <div className="bg-background border-2 border-foreground rounded-md p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline font-bold text-lg">Test Results</h4>
                    <div className="text-sm">
                      <span className="font-bold text-green-600">{stats.success}</span>
                      <span className="text-muted-foreground"> / {stats.total} passed</span>
                    </div>
                  </div>

                  <div className="rule-thin" />

                  <div className="space-y-2">
                    {Object.entries(testResults).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between py-2">
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {getStatusIcon(value?.success ? 'success' : 'error')}
                      </div>
                    ))}
                  </div>

                  <div className="rule-thin" />

                  <div className="text-sm text-muted-foreground">
                    {stats.success === stats.total ? (
                      <p className="text-green-600 font-medium">
                        🎉 All tests passed! Backend integration is working correctly.
                      </p>
                    ) : (
                      <p className="text-amber-600 font-medium">
                        ⚠️ Some tests failed. Check the browser console for details.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="newspaper-card bg-accent/20">
            <h3 className="font-headline font-bold text-lg mb-3">Prerequisites</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>FastAPI backend must be running on <code className="bg-background px-1 py-0.5 rounded">http://localhost:8001</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>MongoDB should be connected for full functionality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Check browser console (F12) for detailed test output</span>
              </li>
            </ul>
          </div>

          {/* Tested Endpoints */}
          <div className="newspaper-card">
            <h3 className="font-headline font-bold text-lg mb-3">Tested Endpoints</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-bold mb-2">User Management:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Health Check</li>
                  <li>• Register User</li>
                  <li>• Login User</li>
                  <li>• Get User Profile</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">Assignments:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Submit Assignment</li>
                  <li>• Get User Assignments</li>
                  <li>• Analyze Weaknesses</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">Debug:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• List All Sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiTest;
