import { rest } from 'msw';

export const handlers = [
  // Simulate a successful whispers fetch
  rest.get('/api/whispers', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([{ id: '1', content: 'Mock whisper', emotion: 'joy', timestamp: new Date().toISOString() }])
    );
  }),

  // Simulate a slow response
  rest.get('/api/whispers-slow', (req, res, ctx) => {
    return res(
      ctx.delay(5000),
      ctx.status(200),
      ctx.json([{ id: '1', content: 'Slow whisper', emotion: 'calm', timestamp: new Date().toISOString() }])
    );
  }),

  // Simulate an error
  rest.get('/api/whispers-error', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Server error' }));
  }),

  // Simulate error logging endpoint
  rest.post('/api/logs/error', (req, res, ctx) => {
    return res(ctx.status(200));
  }),

  // Simulate feedback endpoint
  rest.post('/api/logs/feedback', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
]; 