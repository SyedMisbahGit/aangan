# College Whisper Backend API Reference

This document summarizes the main backend API endpoints for College Whisper (Aangan/CUJ), focusing on whispers, zones, and activity. Use this as a guide for building features or integrations.

---

## Authentication
- Most endpoints require user authentication (token via header or cookie).
- Unauthenticated requests will receive a 401 error.

---

## Endpoints

### 1. Whispers
#### `GET /api/whispers`
- **Description:** Fetch a list of whispers (optionally filtered by zone, emotion, or user/guest).
- **Query Params:**
  - `zone` (string, optional): Filter by zone name
  - `emotion` (string, optional): Filter by emotion
  - `guestId` (string, optional): Filter by guest/user (for personal history)
  - `limit` (number, optional): Max results (default: 20)
  - `offset` (number, optional): Pagination offset
- **Response:**
```json
[
  {
    "id": "...",
    "guestId": "...",
    "zone": "Courtyard",
    "emotion": "Joy",
    "content": "...",
    "createdAt": "...",
    "aiReply": "..." // if present
  }
]
```

#### `POST /api/whispers`
- **Description:** Create a new whisper (may trigger AI reply).
- **Body:**
```json
{
  "zone": "Courtyard",
  "emotion": "Joy",
  "content": "Your message here",
  "guestId": "..." // optional, for user association
}
```
- **Response:**
```json
{
  "id": "...",
  "guestId": "...",
  "aiReply": "..." // if AI responds
}
```
- **Notes:**
  - AI reply is probabilistic and zone/emotion-specific.
  - Content moderation is enforced.
  - If guestId is provided, the whisper will be associated with that user/guest and appear in their history.

---

### 2. Zones
#### `