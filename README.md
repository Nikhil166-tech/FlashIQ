# FlashIQ — AI-Powered Interactive Study Assistant

> **Frontend Internship Assignment Submission**  
> **Topic Chosen:** Study Assistant (Flashcards & Interactive Quiz)  
> **Built with:** React 19 (Hooks), TypeScript, Vite, Node.js / Express Proxy, Google Gemini API

---

## 💡 Overview

**FlashIQ** takes raw, unstructured study notes or a topic description and converts it into a high-yield, interactive study dashboard featuring:
1. **3D Flip Flashcards Deck:** Interactive cards with keyboard shortcuts (<kbd>Space</kbd> to flip, <kbd>&larr;</kbd> <kbd>&rarr;</kbd> to navigate), confidence tracking ("I Know This" vs "Still Learning"), shuffle mode, and filtering.
2. **Interactive Practice Quiz:** Multiple-choice quiz with immediate concept explanations and a dedicated **"Re-test Wrong Answers"** mode.
3. **Robustness & Failure Handling:** Built from the ground up to prevent crashes from unpredictable AI outputs (malformed JSON, schema mismatches, empty answers, slow timeouts, and stale race conditions).

> ⚠️ **Not a Chatbot:** There is no conversational chat window. All AI responses are requested as strict JSON, validated by a defensive parser, and bound directly to interactive React UI state.

---

## 🛠️ Architecture & Data Flow

```text
┌─────────────────┐       Free-Form Text       ┌────────────────────────┐
│   PromptInput   │ ─────────────────────────> │ Express Backend Proxy  │
│ (Free-form input│                            │     (server/generate)  │
│  & edge-cases)  │                            └───────────┬────────────┘
└─────────────────┘                                        │ Holds GEMINI_API_KEY
                                                           ▼
┌─────────────────┐      Defensive Validation   ┌────────────────────────┐
│  ResultView.tsx │ <────────────────────────── │  Google Gemini API or  │
│ ├─ FlashcardDeck│   (lib/validateResult.ts)   │ Intelligent Fallback   │
│ └─ QuizMode     │    • Checks JSON syntax     └────────────────────────┘
└─────────────────┘    • Validates required keys
                       • Guards against stale IDs
```

### Key Architectural Decisions:
1. **API Key Security (`server/generate.ts`):**  
   The Google Gemini API key is kept strictly on the Express backend server and never leaked into client bundles.
2. **Defensive Validation Layer (`src/lib/validateResult.ts`):**  
   Before any AI output touches React state, it passes through structural validation that checks for valid JSON, required array fields (`cards`, `quiz`), and field types.
3. **Stale Request / Race Condition Guard (`src/App.tsx`):**  
   Uses `useRef<number>(0)` and `AbortController`. If a user submits a second prompt while the first is pending, the first request is aborted, and any late-resolving response is discarded so it never overwrites newer state.
4. **Zero-Setup Reviewer Experience:**  
   If no `GEMINI_API_KEY` is provided in `.env`, the server automatically switches to an intelligent offline dataset with complete flashcards and quizzes, so reviewers can immediately run and test the app without needing API credits.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm

### 1. Clone & Install
```bash
git clone https://github.com/Nikhil166-tech/FlashIQ.git
cd FlashIQ
npm install
```

### 2. Configure Environment (Optional)
Copy the example environment file:
```bash
cp .env.example .env
```
Add your free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey):
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```
*(Note: If left blank, FlashIQ runs in offline mock mode so you can test all features immediately).*

### 3. Run Locally
```bash
npm start
# or: npm run dev
```
This runs both the backend proxy (`localhost:3001`) and Vite frontend (`localhost:5173`) concurrently. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing Failure Modes & Resilience (Reviewer Guide)

To satisfy and demonstrate **Section 7: Handling bad AI output**, FlashIQ implements defensive parsing and structural validation before any AI payload touches React state:

| Test Scenario | How FlashIQ Handles It | Visible UI State |
| :--- | :--- | :--- |
| **Malformed JSON** | `lib/validateResult.ts` catches syntax errors in a `try/catch` block. | `ErrorState` shows "Unparseable AI Output" badge, technical debug log, and a **Retry** button. |
| **Wrong Shape / Missing Fields** | Structural validator checks for the `cards` array and required keys. | Displays "Unexpected Data Shape" error and prompts the user to edit notes or retry. |
| **Empty Response** | Detects empty or whitespace-only response. | Routes to "Empty Response Received" error state. |
| **Slow Response (>20s)** | Frontend `AbortController` triggers after 20s. | Displays "Request Timed Out" error without hanging or crashing the UI. |
| **Stale Responses (Race Condition)** | Monotonically incrementing `requestId.current` counter. | Older requests are aborted and discarded if a newer request finishes first. |

---

## 🤖 AI Tools & Transparency Note

In accordance with **Section 8** of the assignment guidelines:
- **Code Assistants Used:** Used Claude / Cursor for scaffolding boilerplate Vite configuration and brainstorming interactive CSS 3D transform properties.
- **Original Work:** The React state architecture, custom defensive validator (`validateResult.ts`), stale request protection (`requestId` ref), quiz scoring, and "re-test wrong answers" logic were designed and written by me to satisfy the assignment criteria.
- **Prompt Engineering:** Tested and refined the strict JSON system prompt to ensure consistent schema responses across runs.

---

## ⏱️ Time Spent

- **Planning & Schema Design:** ~45 mins
- **Backend Proxy & Gemini Integration:** ~1.5 hours
- **Defensive Validation & Failure States:** ~1.5 hours
- **Interactive UI (Flip Cards, Quiz, Wrong-Answer Retest):** ~2 hours
- **Responsive Styling & Polish:** ~1 hour
- **Testing & Documentation:** ~45 mins
- **Total Time:** **~7 hours 45 mins** (within the ~8-hour hard cap)

---

## 🔮 Known Limitations & Next Steps
- **Audio pronunciation:** Adding text-to-speech for language learning decks.
- **Export to Anki / CSV:** Allowing users to download their generated flashcards into Anki or Quizlet.
- **Local Storage:** Persisting review progress across browser sessions.
