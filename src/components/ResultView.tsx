import React, { useState } from 'react';
import { Layers, CheckSquare, ArrowLeft, BookOpen, AlertCircle, Sparkles, Brain } from 'lucide-react';
import type { StudySet } from '../types/result';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizMode } from './QuizMode';

interface ResultViewProps {
  studySet: StudySet;
  isMock?: boolean;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ studySet, isMock, onReset }) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');

  return (
    <div className="result-view-container">
      {/* Top Banner if Mock mode is active */}
      {isMock && (
        <div className="mock-banner" role="status">
          <AlertCircle size={15} />
          <span>
            <strong>Demo Dataset Active:</strong> Running with contextual sample data. Set <code>GEMINI_API_KEY</code> in <code>.env</code> for live Gemini generation.
          </span>
        </div>
      )}

      {/* Recruiter-friendly Study Deck Header */}
      <div className="result-header card">
        <div className="result-header-main">
          <div className="topic-meta-bar">
            <div className="topic-badge">
              <BookOpen size={13} />
              <span>Study Deck</span>
            </div>
            <div className="session-status-badge">
              <Sparkles size={12} />
              <span>AI Synthesized Set</span>
            </div>
          </div>

          <h2 className="result-topic-title">{studySet.topicTitle}</h2>
          <p className="result-summary">{studySet.summary}</p>

          {/* Quick Metrics Bar */}
          <div className="deck-quick-metrics">
            <div className="metric-chip">
              <Layers size={14} className="metric-icon" />
              <span><strong>{studySet.cards.length}</strong> Flashcards</span>
            </div>
            {studySet.quiz && (
              <div className="metric-chip">
                <Brain size={14} className="metric-icon" />
                <span><strong>{studySet.quiz.length}</strong> Quiz Questions</span>
              </div>
            )}
            <div className="metric-chip">
              <span className="metric-dot" />
              <span>Active Study Session</span>
            </div>
          </div>
        </div>

        <button type="button" onClick={onReset} className="btn btn-secondary reset-topic-btn">
          <ArrowLeft size={15} />
          <span>New Notes</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="study-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
        >
          <Layers size={17} />
          <span>Flashcards Deck</span>
          <span className="tab-count">{studySet.cards.length}</span>
        </button>

        {studySet.quiz && studySet.quiz.length > 0 && (
          <button
            type="button"
            className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <CheckSquare size={17} />
            <span>Practice Quiz</span>
            <span className="tab-count">{studySet.quiz.length}</span>
          </button>
        )}
      </div>

      {/* Active Tab Content */}
      <div className="tab-content">
        {activeTab === 'flashcards' && (
          <FlashcardDeck initialCards={studySet.cards} />
        )}

        {activeTab === 'quiz' && studySet.quiz && (
          <QuizMode questions={studySet.quiz} />
        )}
      </div>
    </div>
  );
};
