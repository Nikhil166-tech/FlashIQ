import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Strict system prompt enforcing valid JSON structure
const SYSTEM_PROMPT = `
You are an expert educational study assistant AI.
Given notes, a summary, or a topic, generate a high-yield flashcard deck and a multiple-choice quiz.

CRITICAL INSTRUCTION:
Return ONLY valid JSON matching this exact schema. Do not write any conversational intro or markdown prose outside the JSON:

{
  "topicTitle": "Brief Title of the Topic",
  "summary": "1-2 sentence overview of key concepts covered",
  "cards": [
    {
      "id": "c1",
      "question": "Clear, focused question testing a concept",
      "answer": "Concise, precise answer",
      "hint": "A subtle clue or memory hook",
      "category": "Core Concept",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "A conceptual multiple-choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Why this answer is correct and what the common misconception is."
    }
  ]
}

Generate between 5 to 8 flashcards and 3 to 5 quiz questions. Ensure the JSON is 100% syntactically valid.
`;

/**
 * Intelligent fallback generator when no API key is provided or for offline review.
 */
function getFallbackStudySet(prompt: string) {
  const p = prompt.toLowerCase();

  if (p.includes('react') || p.includes('hook') || p.includes('component')) {
    return {
      topicTitle: "React Hooks & Component Lifecycle",
      summary: "Core principles of modern functional React, state synchronization, and performance optimization.",
      cards: [
        {
          id: "c1",
          question: "What is the primary purpose of the useEffect hook in React?",
          answer: "It allows functional components to perform side effects (data fetching, subscriptions, DOM mutations) after rendering.",
          hint: "Think about replacing componentDidMount / componentDidUpdate",
          category: "Hooks",
          difficulty: "easy"
        },
        {
          id: "c2",
          question: "Why should you never call hooks conditionally or inside loops?",
          answer: "React relies on the exact call order of hooks across renders to preserve internal state arrays.",
          hint: "The 'Rules of Hooks'",
          category: "Architecture",
          difficulty: "medium"
        },
        {
          id: "c3",
          question: "How does the useRef hook differ from useState?",
          answer: "Mutating a ref (.current) does NOT trigger a re-render, whereas calling setState queues a component re-render.",
          hint: "Persistent mutable values without visual updates",
          category: "State Management",
          difficulty: "medium"
        },
        {
          id: "c4",
          question: "What problem does React.memo solve, and when should it be used?",
          answer: "It prevents unnecessary re-renders of child components when their props have not changed (shallow comparison).",
          hint: "Higher-order component for memoization",
          category: "Performance",
          difficulty: "hard"
        },
        {
          id: "c5",
          question: "What is the Virtual DOM and why is reconciliation beneficial?",
          answer: "A lightweight in-memory representation of real DOM nodes. Reconciliation computes the minimal diff to patch the real DOM efficiently.",
          hint: "Batching and diffing algorithm",
          category: "Core Engine",
          difficulty: "medium"
        }
      ],
      quiz: [
        {
          id: "q1",
          question: "Which hook should be used to memoize an expensive calculation between renders?",
          options: ["useCallback", "useMemo", "useRef", "useEffect"],
          correctAnswerIndex: 1,
          explanation: "useMemo caches the result of a calculation, whereas useCallback caches the function instance itself."
        },
        {
          id: "q2",
          question: "What happens if you pass an empty dependency array [] to useEffect?",
          options: [
            "It runs on every render",
            "It never runs",
            "It runs once after the initial render",
            "It causes an infinite loop"
          ],
          correctAnswerIndex: 2,
          explanation: "An empty dependency array signals that the effect does not depend on any state/props, so it only mounts once."
        },
        {
          id: "q3",
          question: "How should you update state that depends on the previous state value?",
          options: [
            "setCount(count + 1)",
            "setCount((prev) => prev + 1)",
            "count.current += 1",
            "this.setState({ count })"
          ],
          correctAnswerIndex: 1,
          explanation: "Using the functional updater form setCount(prev => prev + 1) guarantees state updates are based on the latest queued state."
        }
      ]
    };
  }

  // Default general study topic
  return {
    topicTitle: prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt || "General Knowledge Deck",
    summary: `Structured flashcards and revision questions extracted from: "${prompt.slice(0, 70)}..."`,
    cards: [
      {
        id: "c1",
        question: "What is the core definition of the studied subject?",
        answer: "The fundamental concept revolves around systematic application, structure, and reliable input-to-output mapping.",
        hint: "Consider the foundational premise",
        category: "Fundamentals",
        difficulty: "easy"
      },
      {
        id: "c2",
        question: "What is the primary mechanism of operation?",
        answer: "Processes inputs through defined transformations, verifying constraints at each intermediate step before final output.",
        hint: "Step-by-step workflow",
        category: "Mechanism",
        difficulty: "medium"
      },
      {
        id: "c3",
        question: "What is the main failure mode and how is it mitigated?",
        answer: "Handling unexpected or malformed inputs defensively with explicit fallback states and validation schemas.",
        hint: "Resilience and error boundaries",
        category: "Edge Cases",
        difficulty: "hard"
      },
      {
        id: "c4",
        question: "How does this topic relate to practical system design?",
        answer: "It emphasizes separation of concerns: isolating presentation, proxying data retrieval, and isolating keys securely.",
        hint: "Client-server separation",
        category: "Practical Application",
        difficulty: "medium"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "Why should client-side applications never store private AI secret keys?",
        options: [
          "Browsers cannot send HTTP headers",
          "Client bundles are public and can be easily inspected/scraped",
          "JavaScript doesn't support environment variables",
          "LLM APIs reject browser requests automatically"
        ],
        correctAnswerIndex: 1,
        explanation: "Any code sent to the browser is public. Storing API keys in frontend code leads to key theft and quota abuse."
      },
      {
        id: "q2",
        question: "What is the primary reason to validate LLM output before passing it to React state?",
        options: [
          "LLMs always return XML",
          "To speed up browser rendering",
          "LLM outputs can be non-deterministic, malformed, or missing required fields",
          "React requires all state to be encrypted"
        ],
        correctAnswerIndex: 2,
        explanation: "Unpredictable outputs can cause unhandled null pointer exceptions or blank screens if rendered without validation."
      }
    ]
  };
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    timestamp: new Date().toISOString()
  });
});

// Main generate endpoint
app.post('/api/generate', async (req, res) => {
  const { prompt, scenario = 'none' } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Please provide a non-empty text prompt or study notes.' });
  }

  // --- FAILURE SIMULATION ROUTES (For reviewer / interview demo) ---
  if (scenario === 'malformed_json') {
    // Return broken JSON intentionally
    return res.json({
      raw: '{"topicTitle": "Malformed Deck", "cards": [{"question": "What is broken?", "answer": unquoted_broken_string...',
      isMock: true,
      simulatedScenario: 'malformed_json'
    });
  }

  if (scenario === 'wrong_shape') {
    // Return valid JSON but missing the required 'cards' array
    return res.json({
      raw: {
        title: "Wrong Shape Object",
        unexpectedProperty: "No flashcards array provided here",
        notes: "Missing required cards structure"
      },
      isMock: true,
      simulatedScenario: 'wrong_shape'
    });
  }

  if (scenario === 'empty_response') {
    // Return empty string
    return res.json({
      raw: '',
      isMock: true,
      simulatedScenario: 'empty_response'
    });
  }

  if (scenario === 'slow_response') {
    // Wait 22 seconds to test client-side timeout handling
    await new Promise((resolve) => setTimeout(resolve, 22000));
    return res.json({
      raw: getFallbackStudySet(prompt),
      isMock: true,
      simulatedScenario: 'slow_response'
    });
  }

  // --- LIVE LLM CALL ---
  const apiKey = process.env.GEMINI_API_KEY;

  // Check if user has supplied a valid Gemini API Key
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('[Server] No GEMINI_API_KEY detected in .env. Serving contextual fallback data.');
    // Simulated realistic delay (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({
      raw: getFallbackStudySet(prompt),
      isMock: true,
      message: 'Running in demonstration mode (offline mock dataset). Set GEMINI_API_KEY in .env for live Gemini calls.'
    });
  }

  try {
    const fullUserPrompt = `${SYSTEM_PROMPT}\n\nStudy Notes / User Input:\n${prompt}`;

    // Call Google Gemini API (gemini-3.8-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullUserPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Lower temperature for consistent structured JSON output
          responseMimeType: 'application/json', // Force JSON output if supported
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('[Gemini API Busy/RateLimited] Falling back to intelligent generator:', response.status, errorText);
      return res.json({
        raw: getFallbackStudySet(prompt),
        isMock: true,
        notice: `Live Gemini API returned status ${response.status}. Served high-yield contextual study set.`
      });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return res.status(502).json({
        error: 'The AI model returned an empty candidate text.'
      });
    }

    return res.json({
      raw: candidateText,
      isMock: false,
      provider: 'Google Gemini 1.5 Flash'
    });
  } catch (err: any) {
    console.error('[Backend Proxy Error]', err);
    return res.status(500).json({
      error: `Internal Proxy Error: ${err.message || 'Unknown network error'}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`FlashIQ Backend Proxy listening on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api/generate`);
  console.log(`API Key status: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT SET (Mock Mode Active)'}`);
  console.log(`===============================================`);
});
