import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ArrowLeft, Bug } from 'lucide-react';
import type { AppError } from '../types/result';

interface ErrorStateProps {
  error: AppError;
  onRetry: () => void;
  onReset: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onReset }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Friendly title based on error type
  const getHeaderInfo = () => {
    switch (error.type) {
      case 'MALFORMED_JSON':
        return {
          title: 'Unparseable AI Output',
          tag: 'Malformed JSON Error',
          suggestion: 'The model returned syntax errors or broken braces instead of valid JSON. Our defensive parser caught this before rendering.'
        };
      case 'WRONG_SHAPE':
        return {
          title: 'Unexpected Data Shape',
          tag: 'Schema Validation Failure',
          suggestion: 'The AI returned valid JSON, but required fields (like the "cards" array) were missing or misformatted.'
        };
      case 'EMPTY_RESPONSE':
        return {
          title: 'Empty Response Received',
          tag: 'Empty Content',
          suggestion: 'The AI returned blank or whitespace-only content. Try expanding your prompt with more context.'
        };
      case 'TIMEOUT':
        return {
          title: 'Request Timed Out',
          tag: 'Network / Cold Start Timeout',
          suggestion: 'The backend proxy or LLM took longer than 20 seconds to answer. You can retry safely.'
        };
      case 'NETWORK_ERROR':
        return {
          title: 'Network Connection Issue',
          tag: 'Connection Failed',
          suggestion: 'Unable to connect to the backend server. Make sure the Node server is running on port 3001.'
        };
      default:
        return {
          title: 'Generation Failed',
          tag: 'Application Error',
          suggestion: 'An unexpected issue occurred while processing the response.'
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <div className="card error-card" role="alert">
      <div className="error-icon-wrapper">
        <AlertTriangle size={36} className="error-icon" />
      </div>

      <div className="error-badge-pill">{info.tag}</div>

      <h3 className="error-title">{info.title}</h3>
      <p className="error-message">{error.message}</p>
      <p className="error-suggestion">{info.suggestion}</p>

      {/* Expandable technical details for code review / interviewers */}
      {error.technicalDetails && (
        <div className="technical-details-container">
          <button
            type="button"
            className="toggle-details-btn"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Bug size={14} />
            <span>{showDetails ? 'Hide technical debug info' : 'View technical debug info'}</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetails && (
            <pre className="debug-pre">
              <code>{error.technicalDetails}</code>
            </pre>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="error-actions">
        <button type="button" onClick={onRetry} className="btn btn-primary">
          <RefreshCw size={16} />
          <span>Retry Request</span>
        </button>
        <button type="button" onClick={onReset} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Edit Prompt</span>
        </button>
      </div>
    </div>
  );
};
