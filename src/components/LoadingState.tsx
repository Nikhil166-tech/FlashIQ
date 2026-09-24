import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface LoadingStateProps {
  onCancel?: () => void;
}

const MESSAGES = [
  'Sending notes to secure backend proxy...',
  'Requesting structured JSON flashcards from AI...',
  'Defensively validating response shape and types...',
  'Generating interactive card flips and quiz questions...'
];

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card loading-card" role="status" aria-live="polite">
      <div className="loading-icon-wrapper">
        <Loader2 className="spinner-icon" size={44} />
        <div className="sparkle-badge">
          <Sparkles size={16} />
        </div>
      </div>

      <h3 className="loading-title">Synthesizing Study Materials</h3>
      <p className="loading-step-text">{MESSAGES[messageIndex]}</p>

      {/* Visual Progress Steps */}
      <div className="loading-progress-bars">
        {MESSAGES.map((_, idx) => (
          <div
            key={idx}
            className={`loading-bar-segment ${idx <= messageIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className="loading-safety-note">
        <ShieldCheck size={14} />
        <span>Validating strict JSON schema before rendering</span>
      </div>

      {onCancel && (
        <button type="button" onClick={onCancel} className="btn btn-secondary cancel-btn">
          Cancel Request
        </button>
      )}
    </div>
  );
};
