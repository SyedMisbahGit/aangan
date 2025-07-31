# 🚀 College Whisper API Reference (v2.0)

> **Last Updated**: July 31, 2025  
> **Base URL**: `https://api.collegewhisper.app/v1`

## 📋 Table of Contents

- [Authentication](#-authentication)
- [Rate Limiting](#-rate-limiting)
- [Error Handling](#-error-handling)
- [Endpoints](#-endpoints)
  - [Whispers](#whispers)
  - [AI Integration](#ai-integration)
  - [Realtime WebSocket](#realtime-websocket)
  - [Moderation](#moderation)
  - [Analytics](#analytics)
- [WebSocket Protocol](#-websocket-protocol)
- [Data Models](#-data-models)
- [Changelog](#-changelog)

## 🔐 Authentication

### JWT Authentication
All API endpoints (except public ones) require a valid JWT token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

### Authentication Flows
1. **Guest Authentication**:
   - Automatically assigned a guest ID
   - Limited to read-only operations

2. **User Authentication**:
   - Email/Password or OAuth
   - Full access to user-specific features

3. **Admin Authentication**:
   - Special admin JWT with elevated privileges
   - Required for moderation endpoints

## ⚡ Rate Limiting

- **Public Endpoints**: 100 requests/15 minutes per IP
- **Authenticated Endpoints**: 1000 requests/15 minutes per user
- **WebSocket Messages**: 60 messages/minute per connection
- **Moderation Endpoints**: 30 requests/minute per admin

## ❌ Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      "field": "validation_error_details"
    },
    "timestamp": "2025-07-31T18:30:00Z"
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|------------|-------------|
| `invalid_auth` | 401 | Invalid or expired token |
| `permission_denied` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `validation_error` | 422 | Request validation failed |
| `rate_limited` | 429 | Too many requests |
| `internal_error` | 500 | Internal server error |

## 📡 Endpoints

### Whispers

#### `POST /api/whispers`
Create a new whisper

**Request Body:**
```json
{
  "content": "Your whisper content here",
  "emotion": "happy|sad|angry|anxious|grateful|hopeful|excited|inspired|overwhelmed|nostalgic",
  "zone": "campus|hostel|library|canteen|auditorium|quad|tapri",
  "expires_at": "2025-07-30T12:00:00.000Z",
  "is_anonymous": false,
  "metadata": {}
}
```

**Success Response (201):**
```json
{
  "id": "whisper_123",
  "content": "Your whisper content here",
  "emotion": "happy",
  "zone": "campus",
  "is_ai_generated": false,
  "is_anonymous": false,
  "created_at": "2025-07-31T18:30:00Z",
  "expires_at": "2025-07-30T12:00:00.000Z",
  "metadata": {}
}
```

#### `GET /api/whispers?zone=campus&emotion=happy&limit=20&before=2025-07-31T18:30:00Z`
List whispers with filters

### AI Integration

#### `POST /api/ai/generate-whisper`
Generate an AI whisper (internal use)

**Request Body:**
```json
{
  "zone": "campus",
  "emotion": "happy",
  "context": "Optional context",
  "in_reply_to": "whisper_123",
  "style": "comfort|celebration|reflection|connection"
}
```

### Realtime WebSocket

#### Connection URL
```
wss://api.collegewhisper.app/socket.io/?token=<jwt_token>
```

#### Events
- `whisper:new` - New whisper created
- `whisper:deleted` - Whisper was deleted
- `whisper:reacted` - Reaction added to whisper
- `user:typing` - User is typing in a zone
- `zone:activity` - Zone activity update
- `emotion:pulse` - Emotion distribution update

### Moderation

#### `POST /api/moderation/reports`
Report content

**Request Body:**
```json
{
  "content_id": "whisper_123",
  "content_type": "whisper",
  "reason": "inappropriate|harassment|spam|other",
  "additional_context": "Additional details..."
}
```

## 🌐 WebSocket Protocol

### Connection Lifecycle
1. **Connect**: Client connects with JWT token
2. **Authenticate**: Server validates token and establishes session
3. **Subscribe**: Client joins zones of interest
4. **Ping/Pong**: Heartbeat every 25s (timeout: 10s)

### Message Format
```typescript
interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: string;
  request_id?: string;
}
```

### Error Handling
- `invalid_token` - Authentication failed
- `rate_limited` - Too many messages
- `invalid_event` - Unknown event type
- `validation_error` - Invalid message format

## 📊 Data Models

### Whisper
```typescript
interface Whisper {
  id: string;
  content: string;
  emotion: string;
  zone: string;
  is_ai_generated: boolean;
  is_anonymous: boolean;
  created_at: string;
  expires_at?: string;
  metadata: Record<string, any>;
  reply_to?: string;
  reactions: Record<string, number>; // { '❤️': 5, '😢': 2 }
}
```

### User
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  last_active: string;
}
```

## 📜 Changelog

### v2.0 (July 2025)
- Added WebSocket real-time updates
- Enhanced AI whisper generation
- Improved moderation endpoints
- Added analytics events

### v1.0 (June 2025)
- Initial release
- Basic CRUD operations
- JWT authentication
- Simple rate limiting

## 🔗 See Also
- [WebSocket Protocol Documentation](./REALTIME_FEATURES.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Error Codes Reference](./ERROR_CODES.md)

- All AI replies are generated via a persistent job queue (`ai_reply_jobs` table).
- Job status: `pending`, `running`, `done`, `error` (with up to 3 retries on failure).
- All job events, inputs, outputs, and errors are logged.

## Testing

- All endpoints and services are covered by Vitest tests in `frontend/src/__tests__/` and backend tests (if any).

## See also

- [ARCHITECTURE.md](./ARCHITECTURE.md)