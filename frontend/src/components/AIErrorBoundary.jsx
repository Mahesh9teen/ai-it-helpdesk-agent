import React, { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiMail } from 'react-icons/fi';

/**
 * Error Boundary with AI-powered diagnostics and automatic recovery.
 * Catches React component errors and sends them to backend for AI analysis.
 */
class AIErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      aiDiagnosis: null,
      isRecovering: false,
      recoveryStatus: ''
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorInfo: null,
      aiDiagnosis: null,
      isRecovering: false,
      recoveryStatus: ''
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // Send error to backend for AI analysis
    this.analyzeErrorWithAI(error, errorInfo);
  }

  analyzeErrorWithAI = async (error, errorInfo) => {
    try {
      const response = await fetch('/api/v1/errors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_type: error.constructor.name,
          error_message: error.message,
          error_context: {
            component_stack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            user_agent: navigator.userAgent
          },
          traceback: error.stack
        })
      });

      if (response.ok) {
        const diagnosis = await response.json();
        this.setState({ aiDiagnosis: diagnosis });

        // Attempt automatic recovery if AI recommends it
        if (diagnosis.auto_fix_action && diagnosis.recovery_status !== 'manual_required') {
          this.attemptAutoRecovery(diagnosis);
        }
      }
    } catch (err) {
      console.error('Failed to analyze error with AI:', err);
    }
  };

  attemptAutoRecovery = async (diagnosis) => {
    this.setState({ 
      isRecovering: true,
      recoveryStatus: `Attempting auto-recovery: ${diagnosis.auto_fix_action}...`
    });

    try {
      const response = await fetch('/api/v1/errors/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_type: diagnosis.error_type,
          auto_fix_action: diagnosis.auto_fix_action,
          context: diagnosis
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          this.setState({ 
            recoveryStatus: `✓ Recovery successful: ${result.message}`,
            hasError: false,
            error: null,
            errorInfo: null
          });

          // Reload page after short delay
          setTimeout(() => window.location.reload(), 2000);
        } else {
          this.setState({ 
            recoveryStatus: `✗ Recovery failed: ${result.message}`,
            isRecovering: false
          });
        }
      }
    } catch (err) {
      this.setState({ 
        recoveryStatus: `Error during recovery: ${String(err)}`,
        isRecovering: false
      });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      aiDiagnosis: null,
      isRecovering: false,
      recoveryStatus: ''
    });
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleSendReport = () => {
    const { error, errorInfo, aiDiagnosis } = this.state;
    const subject = `Error Report: ${error?.message}`;
    const body = `
Error Message: ${error?.message}
Error Type: ${error?.constructor.name}

Component Stack:
${errorInfo?.componentStack}

Stack Trace:
${error?.stack}

AI Diagnosis:
${JSON.stringify(aiDiagnosis, null, 2)}

URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();

    const mailto = `mailto:support@company.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  render() {
    const { hasError, error, errorInfo, aiDiagnosis, isRecovering, recoveryStatus } = this.state;

    if (!hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="w-6 h-6 text-white" />
                <h1 className="text-2xl font-bold text-white">Application Error</h1>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* AI Recovery Status */}
              {isRecovering && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin">
                      <FiRefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">AI-Powered Recovery</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{recoveryStatus}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Diagnosis */}
              {aiDiagnosis && (
                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h2 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
                    🤖 AI Diagnosis
                  </h2>
                  <div className="space-y-2 text-sm">
                    <p className="text-purple-800 dark:text-purple-200">
                      <span className="font-semibold">Diagnosis:</span> {aiDiagnosis.diagnosis}
                    </p>
                    <p className="text-purple-800 dark:text-purple-200">
                      <span className="font-semibold">Severity:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-white text-xs font-bold
                        ${aiDiagnosis.severity === 'critical' ? 'bg-red-600' :
                          aiDiagnosis.severity === 'high' ? 'bg-orange-600' :
                          aiDiagnosis.severity === 'medium' ? 'bg-yellow-600' :
                          'bg-green-600'}`}
                      >
                        {aiDiagnosis.severity.toUpperCase()}
                      </span>
                    </p>
                    {aiDiagnosis.root_cause && (
                      <p className="text-purple-800 dark:text-purple-200">
                        <span className="font-semibold">Root Cause:</span> {aiDiagnosis.root_cause}
                      </p>
                    )}
                    {aiDiagnosis.suggested_fixes && aiDiagnosis.suggested_fixes.length > 0 && (
                      <div>
                        <span className="font-semibold text-purple-900 dark:text-purple-100">Suggested Fixes:</span>
                        <ul className="mt-2 space-y-1 ml-4 list-disc text-purple-700 dark:text-purple-300">
                          {aiDiagnosis.suggested_fixes.slice(0, 3).map((fix, i) => (
                            <li key={i}>{fix}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Details</h3>
                <div className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-sm font-mono overflow-auto max-h-64">
                  <p className="text-red-600 dark:text-red-400 mb-2">
                    {error?.constructor.name}: {error?.message}
                  </p>
                  {error?.stack && (
                    <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </div>

              {/* Component Stack */}
              {errorInfo?.componentStack && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Component Stack</h3>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-sm font-mono overflow-auto max-h-40">
                    <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleReset}
                  disabled={isRecovering}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Try Recovery
                </button>

                <button
                  onClick={this.handleReload}
                  disabled={isRecovering}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Reload Page
                </button>

                <button
                  onClick={this.handleSendReport}
                  disabled={isRecovering}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  <FiMail className="w-4 h-4" />
                  Send Report
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                <p className="mb-2">
                  <span className="font-semibold">What happened?</span> An unexpected error occurred in the application.
                </p>
                <p>
                  <span className="font-semibold">What's being done?</span> Our AI system has analyzed the error and recommended recovery steps. Try "Try Recovery" to automatically fix the issue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AIErrorBoundary;
