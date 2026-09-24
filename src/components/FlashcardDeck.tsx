import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Shuffle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  HelpCircle,
  Eye,
  Filter
} from 'lucide-react';
import type { Flashcard } from '../types/result';

interface FlashcardDeckProps {
  initialCards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ initialCards }) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [onlyNeedsReview, setOnlyNeedsReview] = useState(false);
  
  // Track mastery status: cardId -> 'mastered' | 'review'
  const [cardStatus, setCardStatus] = useState<Record<string, 'mastered' | 'review'>>({});

  // Filtered card list based on toggle
  const activeDeck = onlyNeedsReview 
    ? cards.filter((c) => cardStatus[c.id] === 'review') 
    : cards;

  // Ensure currentIndex stays within bounds when list length changes
  const safeIndex = activeDeck.length > 0 ? Math.min(currentIndex, activeDeck.length - 1) : 0;
  const currentCard = activeDeck[safeIndex];

  // Reset flip and hint when switching cards
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [safeIndex, onlyNeedsReview]);

  const handleNext = useCallback(() => {
    if (activeDeck.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
  }, [activeDeck.length]);

  const handlePrev = useCallback(() => {
    if (activeDeck.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeDeck.length) % activeDeck.length);
  }, [activeDeck.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  // Mark as Mastered or Needs Review
  const markStatus = (status: 'mastered' | 'review') => {
    if (!currentCard) return;
    setCardStatus((prev) => ({
      ...prev,
      [currentCard.id]: status
    }));
    // Auto advance to next card
    if (safeIndex < activeDeck.length - 1) {
      handleNext();
    }
  };

  // Shuffle Deck
  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const masteredCount = cards.filter((c) => cardStatus[c.id] === 'mastered').length;
  const reviewCount = cards.filter((c) => cardStatus[c.id] === 'review').length;

  if (activeDeck.length === 0) {
    return (
      <div className="empty-deck-state">
        <CheckCircle2 size={48} className="success-icon" />
        <h3>Great job!</h3>
        <p>You have no cards marked for review in this filter.</p>
        <button
          type="button"
          onClick={() => setOnlyNeedsReview(false)}
          className="btn btn-primary"
        >
          View All {cards.length} Cards
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((safeIndex + 1) / activeDeck.length) * 100);

  return (
    <div className="flashcard-deck-container">
      {/* Top Deck Controls & Stats */}
      <div className="deck-toolbar">
        <div className="deck-stats-badges">
          <span className="badge badge-neutral">
            Card {safeIndex + 1} of {activeDeck.length}
          </span>
          <span className="badge badge-success">
            <CheckCircle2 size={13} /> {masteredCount} Mastered
          </span>
          <span className="badge badge-warning">
            <Clock size={13} /> {reviewCount} Need Review
          </span>
        </div>

        <div className="deck-actions-right">
          <button
            type="button"
            className={`btn-filter ${onlyNeedsReview ? 'active' : ''}`}
            onClick={() => {
              setOnlyNeedsReview(!onlyNeedsReview);
              setCurrentIndex(0);
            }}
            title="Filter by Needs Review"
          >
            <Filter size={14} />
            <span>Needs Review ({reviewCount})</span>
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={handleShuffle}
            title="Shuffle Deck"
          >
            <Shuffle size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="deck-progress-track">
        <div 
          className="deck-progress-fill" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flip Card Component */}
      <div className="card-stage">
        <div 
          className={`flashcard-3d ${isFlipped ? 'is-flipped' : ''}`}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          aria-label={isFlipped ? 'Answer side visible. Click to see question.' : 'Question side visible. Click to flip for answer.'}
        >
          {/* FRONT FACE (Question) */}
          <div className="card-face card-face-front">
            <div className="face-header">
              <span className="category-pill">{currentCard.category || 'Concept'}</span>
              <span className={`difficulty-pill ${currentCard.difficulty || 'medium'}`}>
                {currentCard.difficulty || 'medium'}
              </span>
            </div>

            <div className="face-body">
              <h3 className="card-question-text">{currentCard.question}</h3>
              {showHint && currentCard.hint && (
                <div className="card-hint-box" onClick={(e) => e.stopPropagation()}>
                  <HelpCircle size={14} />
                  <span><strong>Hint:</strong> {currentCard.hint}</span>
                </div>
              )}
            </div>

            <div className="face-footer">
              {currentCard.hint && !showHint ? (
                <button
                  type="button"
                  className="hint-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                >
                  <Eye size={13} />
                  <span>Reveal Hint</span>
                </button>
              ) : <div />}

              <div className="flip-instruction">
                <RotateCw size={13} />
                <span>Click or tap spacebar to flip</span>
              </div>
            </div>
          </div>

          {/* BACK FACE (Answer) */}
          <div className="card-face card-face-back">
            <div className="face-header">
              <span className="category-pill answer-pill">Answer</span>
              <span className="badge-answered">
                <Sparkles size={12} /> Key Takeaway
              </span>
            </div>

            <div className="face-body">
              <p className="card-answer-text">{currentCard.answer}</p>
            </div>

            <div className="face-footer">
              <div className="flip-instruction">
                <RotateCw size={13} />
                <span>Click to flip back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Scoring Buttons */}
      <div className="confidence-controls">
        <button
          type="button"
          className={`btn-confidence btn-review ${cardStatus[currentCard.id] === 'review' ? 'active' : ''}`}
          onClick={() => markStatus('review')}
        >
          <Clock size={16} />
          <span>Still Learning</span>
        </button>

        <button
          type="button"
          className={`btn-confidence btn-master ${cardStatus[currentCard.id] === 'mastered' ? 'active' : ''}`}
          onClick={() => markStatus('mastered')}
        >
          <CheckCircle2 size={16} />
          <span>I Know This!</span>
        </button>
      </div>

      {/* Navigation Arrows */}
      <div className="deck-nav-bar">
        <button
          type="button"
          className="btn btn-secondary nav-btn"
          onClick={handlePrev}
          disabled={activeDeck.length <= 1}
        >
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        <span className="keyboard-guide">
          Use <kbd>&larr;</kbd> <kbd>&rarr;</kbd> arrows to navigate, <kbd>Space</kbd> to flip
        </span>

        <button
          type="button"
          className="btn btn-secondary nav-btn"
          onClick={handleNext}
          disabled={activeDeck.length <= 1}
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
