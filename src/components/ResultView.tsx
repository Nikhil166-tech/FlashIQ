import React, { useState } from 'react';
import { Layers, CheckSquare, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
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
            <strong>Demo Fallback Active:</strong> Running with structured sample dataset. Set <code>GEMINI_API_KEY</code> in <code>.env</code> for live Gemini generation.
          </span>
        </div>
      )}

      {/* Header bar */}
      <div className="result-header card">
        <div className="result-header-main">
          <div className="topic-badge">
            <BookOpen size={14} />
            <span>Study Topic</span>
          </div>
          <h2 className="result-topic-title">{studySet.topicTitle}</h2>
          <p className="result-summary">{studySet.summary}</p>
        </div>

        <button type="button" onClick={onReset} className="btn btn-secondary reset-topic-btn">
          <ArrowLeft size={16} />
          <span>New Study Notes</span>
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
