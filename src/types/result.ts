/**
 * Type definitions for FlashIQ (Study Assistant)
 * Matches the structured data schema returned by the LLM backend proxy.
 */

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudySet {
  topicTitle: string;
  summary: string;
  cards: Flashcard[];
  quiz: QuizQuestion[];
}

export type FailureScenario = 
  | 'none' 
  | 'malformed_json' 
  | 'wrong_shape' 
  | 'slow_response' 
  | 'empty_response';

export type ErrorType = 
  | 'MALFORMED_JSON' 
  | 'WRONG_SHAPE' 
  | 'EMPTY_RESPONSE' 
  | 'TIMEOUT' 
  | 'NETWORK_ERROR' 
  | 'SERVER_ERROR';

export interface AppError {
  type: ErrorType;
  message: string;
  technicalDetails?: string;
}
