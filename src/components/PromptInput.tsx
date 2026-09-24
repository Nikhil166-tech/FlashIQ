import React, { useState } from 'react';
import { Sparkles, BookOpen, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import type { FailureScenario } from '../types/result';

interface PromptInputProps {
  onSubmit: (prompt: string, scenario?: FailureScenario) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    // Keep exact signature compatibility, default scenario to 'none'
    onSubmit(prompt.trim(), 'none');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="prompt-section">
      {/* Recruiter-friendly Hero Section */}
      <div className="study-hero">
        <div className="hero-pill">
          <Zap size={14} className="hero-pill-icon" />
          <span>Active Recall &bull; Spaced Repetition Engine</span>
        </div>
        <h1 className="hero-title">
          Master any subject faster with <span className="highlight-gradient">AI Flashcards</span>
        </h1>
        <p className="hero-subtitle">
          Paste your lecture notes, textbook chapters, or topic notes below. FlashIQ transforms
          unstructured study material into 3D interactive flashcards and an adaptive practice quiz.
        </p>
      </div>

      {/* Main Study Input Card */}
      <form onSubmit={handleSubmit} className="card prompt-card">
        <div className="prompt-header">
          <div>
            <h2 className="prompt-title">Study Material / Notes</h2>
            <p className="prompt-subtitle">
              Input the raw content you want to study. The AI will extract core concepts and key takeaways.
            </p>
          </div>
        </div>

        {/* Quick Topic Starter Chips */}
        <div className="presets-wrapper">
          <span className="presets-label">
            <BookOpen size={14} /> Quick examples:
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

        {/* Free-Form Textarea */}
        <div className="textarea-container">
          <textarea
            className="prompt-textarea"
            rows={7}
            placeholder="Paste your study notes, textbook paragraph, or a topic outline here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            required
          />
          <div className="textarea-footer">
            <span className="char-count">{prompt.length} characters</span>
            <span className="hint-shortcut">
              Tip: Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to generate instantly
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="prompt-actions">
          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={!prompt.trim() || isLoading}
          >
            <Sparkles size={17} />
            <span>{isLoading ? 'Synthesizing Materials...' : 'Generate Study Set'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* Value Badges Footer */}
      <div className="study-features-grid">
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="feature-heading">3D Active Recall</h4>
            <p className="feature-desc">Flip cards with keyboard navigation to strengthen neural recall pathways.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Lightbulb size={18} />
          </div>
          <div>
            <h4 className="feature-heading">Interactive Quizzing</h4>
            <p className="feature-desc">Instant conceptual feedback with detailed explanations on every question.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Zap size={18} />
          </div>
          <div>
            <h4 className="feature-heading">Re-test Wrong Answers</h4>
            <p className="feature-desc">Target weak spots directly by re-testing only the concepts you missed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
