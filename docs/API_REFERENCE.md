# API Reference (Updated July 2025)

## Table of Contents

- [Project Structure](#project-structure)
- [Aliases](#aliases)
- [Key Endpoints](#key-endpoints)
- [Async/Job Queue Notes](#asyncjob-queue-notes)
- [Testing](#testing)
- [See also](#see-also)

## Project Structure

- **Backend API routes:** `backend/src/routes/`
- **Backend DB/migrations:** `backend/migrations/`
- **Frontend API services:** `frontend/src/services/`

## Aliases

- `@` → `frontend/src`
- `@lib` → `frontend/lib`
- `@theme` → `frontend/theme/theme.ts`

## Key Endpoints

### POST /api/whispers

- Create a new whisper (user-generated).
- Probabilistically schedules an AI reply (50% chance, tunable) via async job queue (never blocks user request).
- Returns the created whisper immediately.

**Request Body:**

```json
{
  "content": "Your whisper content here",
  "emotion": "happy|sad|angry|anxious|grateful",
  "zone": "campus|hostel|library",
  "expiresAt": "2025-07-30T12:00:00.000Z",
  "guest_id": "user-guest-id",
  "is_ai_generated": false
}
```

**Success Response (201):**

```json
{
  "id": 123,
  "content": "Your whisper content here",
  "emotion": "happy",
  "zone": "campus",
  "created_at": "2025-07-29T11:30:00.000Z",
  "guest_id": "user-guest-id",
  "is_ai_generated": false
}
```

### POST /api/ai/generate-whisper

- Internal endpoint for generating an AI whisper (used by job queue, ghost script, ambient system).
- Uses shared, structured prompt templates (zone + emotion).
- Returns the generated AI whisper object.

**Request Body:**

```json
{
  "zone": "campus",
  "emotion": "happy",
  "context": "Optional context for the AI",
  "guest_id": "ai-guest-id"
}
```

**Success Response (200):**

```json
{
  "id": 124,
  "content": "AI-generated whisper content",
  "emotion": "happy",
  "zone": "campus",
  "is_ai_generated": true,
  "created_at": "2025-07-29T11:35:00.000Z"
}
```

### POST /api/whispers/:id/check-ai-reply

- Manual endpoint to check for (or trigger) an AI reply to a specific whisper.
- Returns cached AI reply if available, otherwise enqueues a background job and returns `{ status: 'pending' }`.
- Always async, never blocks.

### Ghost Whisper Script

- Not an API endpoint, but can be run via cron: `node backend/scripts/generate-ghost-whispers.js`
- Idempotent, distributes ghosts across the day, avoids overlap with real whispers.

## Async/Job Queue Notes

- All AI replies are generated via a persistent job queue (`ai_reply_jobs` table).
- Job status: `pending`, `running`, `done`, `error` (with up to 3 retries on failure).
- All job events, inputs, outputs, and errors are logged.

## Testing

- All endpoints and services are covered by Vitest tests in `frontend/src/__tests__/` and backend tests (if any).

## See also

- [ARCHITECTURE.md](./ARCHITECTURE.md)