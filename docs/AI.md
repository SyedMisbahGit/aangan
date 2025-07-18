# AI Listener in College Whisper (Aangan/CUJ)

This document explains how the AI listener works, with a focus on its probabilistic, poetic, and CUJ zone/emotion-specific behavior.

---

## Purpose
The AI listener enhances the campus experience by generating poetic, context-aware replies to user whispers. It is designed to:
- Encourage emotional expression
- Foster a sense of wonder and connection
- Tailor responses to campus zones and emotional themes (CUJ/Aangan)

---

## Async AI Reply Flow (Background Job/Queue)
- When a user posts a whisper (`/api/whispers`), the system may probabilistically schedule an AI reply.
- **AI replies are now scheduled as background jobs** (not inline with HTTP requests) using a persistent job queue (`ai_reply_jobs` table).
- The job queue is processed by a background worker (in-process or via cron), ensuring user requests are never blocked by AI generation.
- Each job includes: whisperId, zone, emotion, delay, and retry count.
- Job status transitions: `pending` → `running` → `done`/`error` (with up to 3 retries on failure).
- All job events, inputs, outputs, and errors are logged for observability.

---

## When Does the AI Reply?
- The AI listener is triggered when a user posts a new whisper (via `/api/whispers`).
- Not every whisper receives an AI reply—responses are **probabilistic** (e.g., 30-50% chance, tunable).
- The decision to reply is influenced by:
  - Zone (e.g., Courtyard, Library)
  - Emotion (e.g., Joy, Melancholy)
  - Whisper content (length, sentiment, novelty)
  - Each whisper now includes a `guestId` (if available), so AI replies are always attached to the correct user's whisper and appear in their personal history.

---

## How Does the AI Generate Replies?
1. **Context Gathering:**
   - The system collects the zone, emotion, and content of the whisper.
   - The `guestId` (if present) is included in the whisper data and preserved in the AI reply.
2. **Probabilistic Trigger:**
   - A random check (with zone/emotion weighting) determines if the AI will reply.
3. **Prompt Construction (Standardized):**
   - Prompts are now defined in a **shared, structured template**: `{ zone, emotion, promptTemplate }`.
   - The system uses a single `getPrompt(zone, emotion)` function for all AI/ghost/ambient replies.
   - Prompts are poetic, empathetic, and tailored to the zone’s theme and emotion.
4. **Poetic Generation:**
   - The AI crafts a short, poetic, and emotionally resonant reply.
   - Replies are tailored to the zone’s theme (e.g., tranquil in Courtyard, studious in Library).
5. **Safety & Moderation:**
   - All AI replies are checked for safety and appropriateness before being sent.
6. **Delivery:**
   - The reply is attached to the original whisper and delivered in real-time via Socket.IO.
   - The reply is attached to the original whisper, which is associated with the user's guestId for history and diary features.

---

## Ghost Whisper Generation
- Ghost whispers are generated daily for each zone by a script (`generate-ghost-whispers.js`).
- **Idempotency:** The script checks how many ghosts exist for the zone/day and only creates more if needed (never duplicates).
- **Time-of-day Distribution:** Each ghost is scheduled at a random time during the day (not just script run time).
- **Overlap Avoidance:** Before creating a ghost, the script checks for any real (non-AI) whisper in the same zone within ±30 minutes and skips if found.
- **Prompt Structure:** Uses the same shared prompt template as AI replies.
- **Logging:** Logs zone, emotion, content, scheduled time, and skip reason if any.
- **How to run:** `node backend/scripts/generate-ghost-whispers.js` (can be run via Railway/Vercel cron).

---

## Logging & Fallback
- All AI reply jobs are logged: input prompt, zone, delay, output, errors, and job status transitions.
- If AI generation fails, the job is retried up to 3 times (with delay); after 3 failures, it is marked as `error` and the error is stored in the DB.
- All errors and retries are logged for developer review.

---

## Manual AI Pull Endpoint
- `POST /api/whispers/:id/check-ai-reply`:
  - Returns cached AI reply if already generated.
  - Otherwise, enqueues a background job (if not already queued) and returns `{ status: 'pending' }`.
  - Ensures async, non-blocking behavior for manual AI reply checks.

---

## Unit Testing
- The AI reply job queue (`aiReplyJobQueue.js`) is covered by unit tests (`aiReplyJobQueue.test.js`).
- Tests cover: job enqueue, successful processing, retry/failure logic, and error handling.
- Mocks are used for DB and fetch to simulate all scenarios.
- To run tests: `npx jest backend/src/aiReplyJobQueue.test.js` (or integrate with your test runner).

---

## Developer Tips
- **Prompt updates:** Edit the `promptTemplates` array and `getPrompt(zone, emotion)` in `backend/src/app.js` and `generate-ghost-whispers.js` for all AI/ghost replies.
- **Debugging:** Check logs for job status, errors, and AI outputs. Failed jobs are retried up to 3 times.
- **Extending:** To add new zones/emotions, update the prompt template and ensure all scripts/endpoints use the shared logic.
- **Running locally:** Start the backend, then run the ghost whisper script or trigger AI replies via the API. Use the manual pull endpoint to test async reply generation.

---

## Example Flow
1. User posts a whisper in the "Courtyard" zone with emotion "Hopeful":
   > "I wish for a gentle rain to cool this summer day."
   (The request includes the user's guestId for association.)
2. AI listener is triggered (passes probability check).
3. AI receives prompt:
   > "Reply poetically to this message, as if you are the spirit of the Courtyard, feeling Hopeful."
4. AI generates:
   > "A breeze stirs, promising clouds and gentle relief."
5. Reply is checked for safety and sent to the user.
6. The reply is attached to the original whisper, which is associated with the user's guestId for history and diary features.

---

## User Feedback: AI Reply Status in the UI (v1.6+)

- When a user submits a whisper, the UI now displays a footer on the whisper card:
  - "The Courtyard is listening..." if an AI reply is being processed (pending)
  - "AI may whisper back soon" if a reply is possible (probabilistic)
  - No footer if the AI has replied or will not reply
- This ensures users always feel acknowledged, even if the AI does not reply immediately, and reduces confusion or feelings of being ignored.
- **AI Reply Clarity (v2.0):** All AI replies are clearly marked in the UI, with “Whisper again” and “Did this help?” reactions, and animated emotional feedback.
- **Analytics Hooks:** Local event tracking for AI reply success/timeout and user reactions.

---

For more on system integration, see [ARCHITECTURE.md]. For API usage, see [API_REFERENCE.md]. 