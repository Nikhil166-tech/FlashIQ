import React, { useState, useRef } from 'react';
import { PromptInput } from './components/PromptInput';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ResultView } from './components/ResultView';
import { callGenerateApi } from './lib/api';
import { validateResult } from './lib/validateResult';
import { type StudySet, type AppError, type FailureScenario } from './types/result';
import { BrainCircuit, BookMarked, Code2, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isMockResult, setIsMockResult] = useState<boolean>(false);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [lastScenario, setLastScenario] = useState<FailureScenario>('none');

  // Guarding against stale responses / race conditions (Section 6 & 7 of assignment guide)
  const requestId = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Main generation handler with race-condition prevention & defensive validation.
   */
  const handleGenerate = async (promptText: string, scenario: FailureScenario = 'none') => {
    // 1. Increment request counter
    const currentId = ++requestId.current;
    
    // 2. Abort any previous pending in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // 3. Reset error and update UI state
    setError(null);
    setIsLoading(true);
    setLastPrompt(promptText);
    setLastScenario(scenario);

    try {
      // 4. Fetch raw data from backend proxy
      const response = await callGenerateApi(
        promptText, 
        scenario, 
        abortControllerRef.current.signal
      );

      // 5. STALE CHECK: Discard this response if a newer request was dispatched
      if (currentId !== requestId.current) {
        console.warn(`[FlashIQ] Discarding stale response #${currentId} because newer request #${requestId.current} is active.`);
        return;
      }

      // 6. DEFENSIVE VALIDATION: Validate structure, types, and schema before touching state
      const validation = validateResult(response.raw);

      if (!validation.isValid || !validation.data) {
        setError(
          validation.error || {
            type: 'WRONG_SHAPE',
            message: 'Received invalid data shape from AI model.'
          }
        );
        setStudySet(null);
        return;
      }

      // 7. Successful validation -> commit to React state
      setStudySet(validation.data);
      setIsMockResult(Boolean(response.isMock));
    } catch (err: any) {
      // Check if this request was superseded before showing error
      if (currentId !== requestId.current) return;

      console.error('[FlashIQ] Error generating study materials:', err);
      
      const isTimeout = err.message && err.message.toLowerCase().includes('timed out');
      const isNetwork = err.message && err.message.toLowerCase().includes('reach backend');

      setError({
        type: isTimeout ? 'TIMEOUT' : isNetwork ? 'NETWORK_ERROR' : 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred while communicating with the server.',
        technicalDetails: err.stack || String(err)
      });
      setStudySet(null);
    } finally {
      if (currentId === requestId.current) {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setStudySet(null);
    setError(null);
  };

  const handleRetry = () => {
    if (lastPrompt) {
      handleGenerate(lastPrompt, lastScenario);
    }
  };

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="brand" onClick={handleReset} role="button" tabIndex={0}>
            <div className="brand-icon">
              <BrainCircuit size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-title">FlashIQ</span>
              <span className="brand-tag">Interactive AI Study Tool</span>
            </div>
          </div>

          <div className="nav-badges">
            <span className="nav-pill">
              <Sparkles size={13} />
              <span>Structured AI (Non-Chat)</span>
            </span>
            <span className="nav-pill">
              <BookMarked size={13} />
              <span>Flashcards & Quiz</span>
            </span>
            <a
              href="https://github.com/Nikhil166-tech/FlashIQ"
              target="_blank"
              rel="noreferrer"
              className="nav-link-git"
              title="View on GitHub"
            >
              <Code2 size={16} />
            </a>
          </div>
        </div>
      </header>

      {/* Main App Content Area */}
      <main className="main-content">
        <div className="content-container">
          {/* Active Result View */}
          {studySet && !isLoading && !error && (
            <ResultView
              studySet={studySet}
              isMock={isMockResult}
              onReset={handleReset}
            />
          )}

          {/* Loading View */}
          {isLoading && (
            <LoadingState onCancel={handleCancel} />
          )}

          {/* Error View */}
          {error && !isLoading && (
            <ErrorState
              error={error}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          )}

          {/* Default Idle Input View */}
          {!studySet && !isLoading && !error && (
            <PromptInput
              onSubmit={handleGenerate}
              isLoading={isLoading}
              initialPrompt={lastPrompt}
            />
          )}
        </div>
      </main>

      {/* Simple, informative footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>
            FlashIQ &bull; Frontend Internship Assignment &bull; Built with React, Vite, Node Proxy &amp; Google Gemini API
          </p>
          <p className="footer-subtext">
            Strict JSON validation &bull; Race condition prevention &bull; Defensive error handling
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
