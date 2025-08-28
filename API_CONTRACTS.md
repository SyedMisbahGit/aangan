# API Contracts

This document outlines the API contracts for the Aangan application.

## Table of Contents

- [User Profile](#user-profile)
  - [Get User Profile](#get-user-profile)
  - [Update User Profile](#update-user-profile)
- [Admin](#admin)
  - [List Users](#list-users)

## User Profile

### Get User Profile

**Endpoint:** `GET /api/user/profile`

**Description:** Retrieve the authenticated user's profile information.

**Authentication:** JWT Token Required

**Request Headers:**

```http
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "testuser",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-15T12:34:56.789Z"
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error while processing the request

### Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Description:** Update the authenticated user's profile information.

**Authentication:** JWT Token Required

**Request Headers:**

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newemail@example.com",
  "username": "newusername",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: No fields to update or invalid data
- `400 Bad Request`: Email already in use
- `400 Bad Request`: Username already taken
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error while processing the request

## Admin

### List Users

**Endpoint:** `GET /api/admin/users`

**Description:** Retrieve a paginated list of all users (Admin only).

**Authentication:** JWT Token with Admin role required

**Request Headers:**

```http
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**

- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20): Number of items per page
- `search` (optional): Search term to filter users by email or username
- `role` (optional): Filter users by role

**Response (200 OK):**

```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user1@example.com",
      "username": "user1",
      "role": "user",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_login": "2024-01-15T12:34:56.789Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not have admin privileges
- `500 Internal Server Error`: Server error while processing the request

