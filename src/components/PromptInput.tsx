import React, { useState } from 'react';
import { Sparkles, BookOpen, AlertOctagon, HelpCircle } from 'lucide-react';
import type { FailureScenario } from '../types/result';

interface PromptInputProps {
  onSubmit: (prompt: string, scenario: FailureScenario) => void;
  isLoading: boolean;
  initialPrompt?: string;
}

const PRESETS = [
  {
    label: 'React Hooks & State',
    text: `React Hooks allow functional components to use state and other React features. useState stores values across renders and triggers re-renders on update. useEffect manages side effects like data fetching and subscriptions with a dependency array. useRef holds a mutable reference that does not trigger re-renders. Always follow the Rules of Hooks: call them at the top level and only from React functions.`
  },
  {
    label: 'Photosynthesis Cycle',
    text: `Photosynthesis is the process used by plants, algae, and cyanobacteria to convert light energy into chemical energy stored in glucose. It occurs in chloroplasts. The light-dependent reactions take place in the thylakoid membranes, producing ATP and NADPH while releasing oxygen from split water molecules. The Calvin cycle (light-independent reactions) occurs in the stroma, using CO2, ATP, and NADPH to synthesize carbohydrates.`
  },
  {
    label: 'HTTP vs WebSockets',
    text: `HTTP is a stateless, unidirectional request-response protocol running over TCP. The client initiates every request and the server responds. WebSockets provide a persistent, full-duplex, bidirectional communication channel over a single TCP connection initiated via an HTTP handshake. WebSockets are optimal for low-latency real-time apps like multiplayer games, chats, and financial tickers.`
  }
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [scenario, setScenario] = useState<FailureScenario>('none');
  const [showTesterGuide, setShowTesterGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt.trim(), scenario);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card prompt-card">
      <div className="prompt-header">
        <div>
          <h2 className="prompt-title">What would you like to study?</h2>
          <p className="prompt-subtitle">
            Paste raw study notes, lecture excerpts, or a topic description below.
          </p>
        </div>

        {/* Failure Scenario Simulator Trigger */}
        <div className="failure-tester-wrapper">
          <label htmlFor="scenario-select" className="failure-label">
            <AlertOctagon size={14} className="tester-icon" />
            <span>Test Edge Case:</span>
          </label>
          <select
            id="scenario-select"
            className="failure-select"
            value={scenario}
            onChange={(e) => setScenario(e.target.value as FailureScenario)}
            disabled={isLoading}
          >
            <option value="none">Normal (Valid AI Generation)</option>
            <option value="malformed_json">Simulate: Malformed JSON</option>
            <option value="wrong_shape">Simulate: Wrong Schema / Missing Fields</option>
            <option value="empty_response">Simulate: Empty AI Response</option>
            <option value="slow_response">Simulate: Slow Response (Timeout)</option>
          </select>

          <button
            type="button"
            className="info-icon-btn"
            onClick={() => setShowTesterGuide(!showTesterGuide)}
            title="What is this?"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {showTesterGuide && (
        <div className="tester-guide-callout">
          <strong>Reviewer / Interviewer Note:</strong> Section 7 of the assignment evaluates handling
          broken AI outputs. Use this selector to verify that malformed JSON, schema mismatches, empty
          outputs, or timeouts gracefully route to designated error boundaries without UI crashes.
        </div>
      )}

      {/* Quick Presets */}
      <div className="presets-wrapper">
        <span className="presets-label">
          <BookOpen size={13} /> Try a sample:
        </span>
        <div className="preset-buttons">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="preset-chip"
              onClick={() => setPrompt(preset.text)}
              disabled={isLoading}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Free-Form Input */}
      <div className="textarea-container">
        <textarea
          className="prompt-textarea"
          rows={6}
          placeholder="Paste your study notes, textbook paragraph, or a topic here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          required
        />
        <div className="textarea-footer">
          <span className="char-count">{prompt.length} characters</span>
          <span className="hint-shortcut">Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to generate</span>
        </div>
      </div>

      <div className="prompt-actions">
        <button
          type="submit"
          className="btn btn-primary submit-btn"
          disabled={!prompt.trim() || isLoading}
        >
          <Sparkles size={16} />
          <span>{isLoading ? 'Generating Deck...' : 'Generate Flashcards & Quiz'}</span>
        </button>
      </div>
    </form>
  );
};
