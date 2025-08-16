# WebSocket API Documentation

This document provides detailed information about the WebSocket API used in the Aangan backend for real-time communication.

## Table of Contents
- [Overview](#overview)
- [Connection](#connection)
- [Authentication](#authentication)
- [Channels](#channels)
- [Events](#events)
- [Error Handling](#error-handling)
- [Example Usage](#example-usage)
- [Testing](#testing)

## Overview

The WebSocket API is built on Socket.IO and provides real-time, bidirectional communication between the server and clients. It supports:

- Real-time messaging
- Channel-based pub/sub
- Automatic reconnection
- Fallback to polling if WebSocket is not available
- Optional Redis backend for horizontal scaling

## Connection

### Connecting to the Server

```javascript
import { io } from 'socket.io-client';

// Connect to the WebSocket server
const socket = io('http://your-backend-url', {
  // Recommended options
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

// Connection established
socket.on('connect', () => {
  console.log('Connected to WebSocket server');  
});
```

### Connection States

- `connect` - Successfully connected to the server
- `disconnect` - Disconnected from the server
- `connect_error` - Error occurred during connection
- `reconnect_attempt` - Attempting to reconnect
- `reconnect` - Successfully reconnected
- `reconnect_error` - Error during reconnection
- `reconnect_failed` - All reconnection attempts failed

## Authentication

### JWT Authentication

To authenticate a WebSocket connection, include the JWT token in the connection options:

```javascript
const socket = io('http://your-backend-url', {
  auth: {
    token: 'your.jwt.token.here'
  }
});
```

### Authentication Events

- `authenticated` - Successfully authenticated
- `unauthorized` - Authentication failed

## Channels

Channels allow you to organize messages by topic. Clients can subscribe to specific channels to receive relevant messages.

### Subscribing to a Channel

```javascript
// Subscribe to a channel
socket.emit('subscribe', 'channel-name');

// Handle subscription success
socket.on('subscribed', (channel) => {
  console.log(`Subscribed to ${channel}`);
});
```

### Unsubscribing from a Channel

```javascript
// Unsubscribe from a channel
socket.emit('unsubscribe', 'channel-name');

// Handle unsubscription success
socket.on('unsubscribed', (channel) => {
  console.log(`Unsubscribed from ${channel}`);
});
```

## Events

### Publishing Messages

Publish a message to a channel:

```javascript
const message = {
  text: 'Hello, world!',
  timestamp: new Date().toISOString(),
  from: 'user123'
};

socket.emit('publish', {
  channel: 'channel-name',
  message: message
});
```

### Receiving Messages

Listen for messages on subscribed channels:

```javascript
socket.on('message', (data) => {
  console.log(`[${data.channel}]`, data.message);
  // data: { channel: string, message: any }
});
```

### System Events

- `user_joined` - A user joined a channel
- `user_left` - A user left a channel
- `typing` - A user is typing in a channel
- `message_delivered` - Message was delivered to the server
- `message_read` - Message was read by the recipient

## Error Handling

### Common Errors

- `unauthorized` - Authentication failed
- `invalid_channel` - Invalid channel name
- `subscription_failed` - Failed to subscribe to channel
- `publish_failed` - Failed to publish message

### Error Handling Example

```javascript
// Handle all errors
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Handle specific errors
socket.on('subscription_failed', (error) => {
  console.error('Subscription failed:', error.message);
});
```

## Example Usage

### Complete Example

```javascript
import { io } from 'socket.io-client';

// Connect with authentication
const socket = io('http://your-backend-url', {
  auth: {
    token: 'your.jwt.token.here'
  },
  reconnection: true
});

// Connection established
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  
  // Subscribe to a channel
  socket.emit('subscribe', 'general');
});

// Handle subscription success
socket.on('subscribed', (channel) => {
  console.log(`Subscribed to ${channel}`);
  
  // Send a message
  socket.emit('publish', {
    channel: 'general',
    message: {
      text: 'Hello, everyone!',
      timestamp: new Date().toISOString(),
      from: 'user123'
    }
  });
});

// Receive messages
socket.on('message', (data) => {
  console.log(`[${data.channel}] ${data.message.from}: ${data.message.text}`);
});

// Handle errors
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Handle disconnection
socket.on('disconnect', (reason) => {
  console.log(`Disconnected: ${reason}`);
});
```

## Testing

### Using the Test Client

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the test client in your browser:
   ```
   http://localhost:3001/socketio-test.html
   ```

3. Use the test interface to:
   - Connect to the WebSocket server
   - Subscribe to channels
   - Publish messages
   - Monitor incoming messages

### Testing in Development

For testing without Redis:

1. Set `USE_REDIS=false` in your `.env` file
2. The application will use an in-memory pub/sub system
3. All WebSocket functionality remains available

### Production Considerations

In production:
1. Always use Redis for pub/sub to enable horizontal scaling
2. Configure proper CORS settings
3. Use secure WebSocket (WSS) with valid certificates
4. Implement rate limiting and abuse prevention
5. Monitor connection counts and message throughput
