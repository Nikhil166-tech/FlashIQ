import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Trophy, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { QuizQuestion } from '../types/result';

interface QuizModeProps {
  questions: QuizQuestion[];
}

export const QuizMode: React.FC<QuizModeProps> = ({ questions }) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [retestMode, setRetestMode] = useState(false);

  const currentQ = activeQuestions[currentIdx];
  const totalCount = activeQuestions.length;
  const currentSelected = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const hasAnsweredCurrent = currentSelected !== undefined;

  // Select an option
  const handleSelectOption = (optIndex: number) => {
    if (hasAnsweredCurrent || isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalCount - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  // Calculate score
  const correctCount = activeQuestions.filter(
    (q) => selectedAnswers[q.id] === q.correctAnswerIndex
  ).length;

  const wrongQuestions = activeQuestions.filter(
    (q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== q.correctAnswerIndex
  );

  // Re-test ONLY wrong answers (explicit requirement from Section 3!)
  const handleRetestWrong = () => {
    if (wrongQuestions.length === 0) return;
    
    // Clear answers for the wrong questions
    const nextAnswers = { ...selectedAnswers };
    wrongQuestions.forEach((q) => {
      delete nextAnswers[q.id];
    });

    setActiveQuestions(wrongQuestions);
    setSelectedAnswers(nextAnswers);
    setCurrentIdx(0);
    setIsSubmitted(false);
    setRetestMode(true);
  };

  // Reset complete quiz
  const handleRestartFull = () => {
    setActiveQuestions(questions);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setRetestMode(false);
  };

  if (activeQuestions.length === 0) {
    return (
      <div className="card text-center p-6">
        <p>No quiz questions available for this topic.</p>
      </div>
    );
  }

  // Final Results Summary Screen
  if (isSubmitted) {
    const scorePercentage = Math.round((correctCount / totalCount) * 100);
    const isPerfect = scorePercentage === 100;

    return (
      <div className="card quiz-summary-card">
        <div className="summary-trophy">
          <Trophy size={48} className={isPerfect ? 'trophy-gold' : 'trophy-standard'} />
        </div>

        <h2 className="summary-title">
          {isPerfect ? 'Flawless Score!' : 'Quiz Completed!'}
        </h2>
        
        <p className="summary-subtitle">
          {retestMode ? 'Re-test Session Finished' : 'Review your knowledge check results'}
        </p>

        <div className="score-circle">
          <span className="score-number">{scorePercentage}%</span>
          <span className="score-label">{correctCount} of {totalCount} Correct</span>
        </div>

        {wrongQuestions.length > 0 ? (
          <div className="wrong-review-banner">
            <p>
              You missed <strong>{wrongQuestions.length}</strong> {wrongQuestions.length === 1 ? 'question' : 'questions'}. 
              Solidify your memory by re-testing only the missed questions.
            </p>
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleRetestWrong}
            >
              <RotateCcw size={16} />
              <span>Re-test {wrongQuestions.length} Wrong {wrongQuestions.length === 1 ? 'Answer' : 'Answers'}</span>
            </button>
          </div>
        ) : (
          <div className="all-correct-banner">
            <Sparkles size={20} />
            <span>You have mastered all tested concepts! Excellent work.</span>
          </div>
        )}

        <div className="summary-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRestartFull}
          >
            <RotateCcw size={16} />
            <span>Retake Entire Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {/* Quiz Progress Header */}
      <div className="quiz-header">
        <div className="quiz-badge-info">
          <span className="badge badge-neutral">
            Question {currentIdx + 1} of {totalCount}
          </span>
          {retestMode && (
            <span className="badge badge-warning">
              Re-testing Missed Items
            </span>
          )}
        </div>

        <div className="quiz-mini-score">
          Score: {correctCount}/{currentIdx + (hasAnsweredCurrent ? 1 : 0)}
        </div>
      </div>

      {/* Question Card */}
      <div className="card quiz-question-card">
        <h3 className="quiz-prompt-text">{currentQ.question}</h3>

        {/* Options List */}
        <div className="quiz-options-list">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = currentSelected === optIdx;
            const isCorrectOption = optIdx === currentQ.correctAnswerIndex;
            
            let btnClass = 'quiz-option-btn';
            if (hasAnsweredCurrent) {
              if (isCorrectOption) {
                btnClass += ' option-correct';
              } else if (isSelected) {
                btnClass += ' option-incorrect';
              } else {
                btnClass += ' option-dimmed';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                className={btnClass}
                onClick={() => handleSelectOption(optIdx)}
                disabled={hasAnsweredCurrent}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="option-text">{option}</span>

                {hasAnsweredCurrent && isCorrectOption && (
                  <CheckCircle size={18} className="option-indicator text-success" />
                )}
                {hasAnsweredCurrent && isSelected && !isCorrectOption && (
                  <XCircle size={18} className="option-indicator text-danger" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback & AI Explanation */}
        {hasAnsweredCurrent && (
          <div className={`quiz-feedback-box ${currentSelected === currentQ.correctAnswerIndex ? 'feedback-positive' : 'feedback-negative'}`}>
            <div className="feedback-header">
              <HelpCircle size={16} />
              <span>
                {currentSelected === currentQ.correctAnswerIndex
                  ? 'Correct! Here is why:'
                  : 'Incorrect. Key Explanation:'}
              </span>
            </div>
            <p className="feedback-explanation">{currentQ.explanation}</p>
          </div>
        )}

        {/* Navigation Action */}
        <div className="quiz-footer-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
          >
            <span>{currentIdx < totalCount - 1 ? 'Next Question' : 'View Results'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
