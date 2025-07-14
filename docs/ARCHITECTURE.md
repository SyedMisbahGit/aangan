# College Whisper Architecture

## Overview
College Whisper is a real-time, AI-augmented social platform designed for campus communities. The system is built with a modular backend (Node.js/Express), a modern React frontend, and leverages Socket.IO for live features. The platform is tailored for CUJ (Aangan) use cases, including Dreamy Courtyard UX, AI whispering, and zone-based emotional engagement.

---

## High-Level System Diagram

- **Frontend (React + Vite)**
  - User interface, zone navigation, whisper creation, live feeds
  - Connects to backend via REST and Socket.IO
- **Backend (Node.js/Express)**
  - REST API endpoints (e.g., /api/whispers, /zones, /activity)
  - Socket.IO server for real-time updates
  - AI whisper logic and orchestration
  - Database access (PostgreSQL via Knex.js)
- **Database (PostgreSQL)**
  - Stores users, whispers, zones, activity logs, emotions
- **AI Listener**
  - Generates poetic, context-aware replies to whispers
  - Zone/emotion-specific logic
  - Probabilistic response engine

---

## Data Flow

1. **User Action**: User posts a whisper or interacts with a zone.
2. **Frontend**: Sends REST request (e.g., POST /api/whispers) or emits a Socket.IO event.
3. **Backend**:
   - Validates and stores data in PostgreSQL
   - Triggers AI listener if whisper qualifies for a reply
   - Emits real-time updates to relevant clients via Socket.IO
4. **AI Listener**:
   - Analyzes whisper content, zone, and emotion
   - Generates a poetic/probabilistic reply (if triggered)
   - Sends reply back through backend to frontend
5. **Frontend**: Updates UI in real-time (new whispers, AI replies, activity, etc.)

---

## CUJ (Aangan) Specific Design

- **Zones**: Each zone represents a campus area or emotional theme. Zone logic is central to data routing and AI context.
- **Dreamy Courtyard UX**: Special UI/UX flows for onboarding, whispering, and emotional engagement.
- **AI Whispering**: AI replies are tailored to zone/emotion, with poetic and context-aware responses.
- **Activity Streams**: Real-time activity feeds powered by Socket.IO.
- **Moderation & Safety**: Backend enforces content rules and safety checks before data is broadcast or stored.

---

## User/Guest Association & Whisper History

- Each whisper can now be associated with a user or guest via a `guestId` (anonymous user ID stored in localStorage).
- The backend stores `guestId` in the `whispers` table and supports filtering by guestId in API endpoints.
- The frontend includes guestId when creating whispers and can fetch a user's own whispers for personal history ("My Whispers").
- This enables diary-like continuity and personal reflection, even for anonymous users.

---

## Ambient Presence & Listen View Experience (v1.6+)

- **Ambient Presence Avatars:** The Lounge/Listen view now displays a row of animated, anonymous avatars ("soft echoes") at the top, representing recent listeners or hearts. This creates a sense of warm, ambient community presence without revealing identities.
- **Poetic Presence Line:** Below the avatars, a poetic line (e.g., "12 hearts are listening quietly tonight") dynamically reflects the number of active users or hearts, making the space feel alive and welcoming.
- **Listen View Fallback:** The Lounge always preloads 2–3 real whispers from the backend if available. If loading, a shimmer animation is shown. If no whispers are available, a poetic fallback message is displayed, ensuring the view is never blank or cold.
- **AI Reply Footer:** Whisper cards now show a footer indicating AI reply status: "The Courtyard is listening..." (pending), "AI may whisper back soon" (possible), or nothing if delivered/none. This provides clear feedback and reduces user confusion.

---

## Moderation & Reporting (v1.6+)

- Users can now report inappropriate or harmful whispers via the UI (3-dot menu on each card).
- Reports are sent to the backend and stored in the `whisper_reports` table, including the whisper ID, reason, guest ID (if available), and timestamp.
- Admins can review reported whispers for moderation action.
- API: `POST /api/whispers/:id/report` (see API_REFERENCE.md)

---

## Key Technologies
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO, Knex.js
- **Database**: PostgreSQL
- **AI**: Custom probabilistic/poetic engine (see docs/AI.md)

---

## Extensibility
- Modular backend allows for new endpoints and features (e.g., new zones, activity types)
- AI listener can be extended for new emotional/zone logic
- Real-time system supports additional live features (e.g., notifications, live events)

---

For more details, see [docs/API_REFERENCE.md] and [docs/AI.md]. 