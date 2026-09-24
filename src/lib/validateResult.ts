import type { StudySet, AppError, Flashcard, QuizQuestion } from '../types/result';

export interface ValidationOutcome {
  isValid: boolean;
  data?: StudySet;
  error?: AppError;
}

/**
 * Pre-cleans raw text from LLMs that might wrap JSON in markdown backticks (e.g. ```json ... ```).
 */
export function cleanRawOutput(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  
  // Remove markdown code fences if the model included them despite instructions
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  
  return cleaned.trim();
}

/**
 * Validates and structurally verifies the model's output before it reaches React state.
 * Prevents runtime crashes from malformed JSON, missing fields, or empty responses.
 */
export function validateResult(raw: unknown): ValidationOutcome {
  // 1. Handle empty / null / undefined responses
  if (raw === null || raw === undefined) {
    return {
      isValid: false,
      error: {
        type: 'EMPTY_RESPONSE',
        message: 'The AI returned an empty response. Please try with different notes.',
        technicalDetails: 'Received null or undefined payload from server.'
      }
    };
  }

  let parsed: any = raw;

  // 2. If it's a raw string, parse it defensively
  if (typeof raw === 'string') {
    const cleaned = cleanRawOutput(raw);
    if (!cleaned) {
      return {
        isValid: false,
        error: {
          type: 'EMPTY_RESPONSE',
          message: 'The AI model returned an empty text string.',
          technicalDetails: 'Parsed text was 0 characters after trimming.'
        }
      };
    }

    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr: any) {
      return {
        isValid: false,
        error: {
          type: 'MALFORMED_JSON',
          message: 'The AI generated an invalid JSON format that could not be parsed.',
          technicalDetails: `JSON.parse error: ${parseErr.message || 'SyntaxError'}`
        }
      };
    }
  }

  // 3. Structural Validation: Ensure parsed value is a non-null object
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      isValid: false,
      error: {
        type: 'WRONG_SHAPE',
        message: 'The AI response did not match the expected study set structure.',
        technicalDetails: 'Expected a root JSON object with { topicTitle, cards, quiz }.'
      }
    };
  }

  // Check required cards array
  if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    return {
      isValid: false,
      error: {
        type: 'WRONG_SHAPE',
        message: 'No flashcards were found in the generated response.',
        technicalDetails: 'Missing or empty "cards" array in AI response.'
      }
    };
  }

  // 4. Validate and sanitize individual flashcards
  const sanitizedCards: Flashcard[] = [];
  for (let i = 0; i < parsed.cards.length; i++) {
    const c = parsed.cards[i];
    if (!c || typeof c !== 'object') {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          message: `Flashcard #${i + 1} is corrupted or missing.`,
          technicalDetails: `cards[${i}] is not an object.`
        }
      };
    }

    if (!c.question || typeof c.question !== 'string' || !c.answer || typeof c.answer !== 'string') {
      return {
        isValid: false,
        error: {
          type: 'WRONG_SHAPE',
          message: `Flashcard #${i + 1} is missing a required question or answer.`,
          technicalDetails: `cards[${i}] requires non-empty string properties 'question' and 'answer'.`
        }
      };
    }

    sanitizedCards.push({
      id: c.id ? String(c.id) : `card-${i + 1}-${Date.now()}`,
      question: c.question.trim(),
      answer: c.answer.trim(),
      hint: typeof c.hint === 'string' ? c.hint.trim() : undefined,
      category: typeof c.category === 'string' ? c.category.trim() : 'Core Concept',
      difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium'
    });
  }

  // 5. Validate and sanitize quiz questions (if present or generate fallback)
  const sanitizedQuiz: QuizQuestion[] = [];
  if (Array.isArray(parsed.quiz)) {
    for (let i = 0; i < parsed.quiz.length; i++) {
      const q = parsed.quiz[i];
      if (
        q &&
        typeof q === 'object' &&
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2
      ) {
        const correctIdx = typeof q.correctAnswerIndex === 'number' && 
                           q.correctAnswerIndex >= 0 && 
                           q.correctAnswerIndex < q.options.length
                           ? q.correctAnswerIndex 
                           : 0;

        sanitizedQuiz.push({
          id: q.id ? String(q.id) : `quiz-${i + 1}`,
          question: q.question.trim(),
          options: q.options.map((opt: any) => String(opt).trim()),
          correctAnswerIndex: correctIdx,
          explanation: typeof q.explanation === 'string' ? q.explanation.trim() : 'Review the concept summary for details.'
        });
      }
    }
  }

  const studySet: StudySet = {
    topicTitle: typeof parsed.topicTitle === 'string' && parsed.topicTitle.trim() 
      ? parsed.topicTitle.trim() 
      : 'Study Deck',
    summary: typeof parsed.summary === 'string' && parsed.summary.trim() 
      ? parsed.summary.trim() 
      : `Generated ${sanitizedCards.length} flashcards based on your input notes.`,
    cards: sanitizedCards,
    quiz: sanitizedQuiz
  };

  return {
    isValid: true,
    data: studySet
  };
}
