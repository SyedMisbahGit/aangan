import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { API_BASE_URL } from '../../app/config';
import {
  generateWhisper,
  analyzeSentiment,
  getAISuggestions,
  moderateContent,
  AIServiceError,
} from './aiService';

// Mock the API responses
const mockWhisperResponse = {
  id: 'whisper-ai-123',
  content: 'This is a generated whisper based on your input.',
  isPublic: true,
  tags: ['ai-generated', 'suggestion'],
  sentiment: {
    score: 0.8,
    label: 'positive',
  },
};

const mockSentimentResponse = {
  sentiment: {
    score: 0.9,
    label: 'very_positive',
    emotions: ['joy', 'excitement'],
  },
  entities: [
    { text: 'Aangan', type: 'ORGANIZATION', score: 0.98 },
  ],
};

const mockSuggestionResponse = {
  suggestions: [
    'Have you considered joining the photography club?',
    'The library has great resources for your research.',
  ],
  context: 'Based on your interests in photography and research',
};

const mockModerationResponse = {
  isApproved: true,
  flags: [],
  reasons: [],
  confidence: 0.95,
  suggestedAction: 'approve',
};

// Set up the mock server
const server = setupServer(
  rest.post(`${API_BASE_URL}/ai/generate-whisper`, (req, res, ctx) => {
    return res(ctx.json(mockWhisperResponse));
  }),
  
  rest.post(`${API_BASE_URL}/ai/analyze-sentiment`, (req, res, ctx) => {
    return res(ctx.json(mockSentimentResponse));
  }),
  
  rest.post(`${API_BASE_URL}/ai/suggestions`, (req, res, ctx) => {
    return res(ctx.json(mockSuggestionResponse));
  }),
  
  rest.post(`${API_BASE_URL}/ai/moderate`, (req, res, ctx) => {
    return res(ctx.json(mockModerationResponse));
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after all tests are done
afterAll(() => server.close());

describe('AIService', () => {
  describe('generateWhisper', () => {
    it('should generate a whisper with the given prompt', async () => {
      const prompt = 'Write an encouraging message for students';
      const options = { isPublic: true, tags: ['encouragement'] };
      
      const result = await generateWhisper(prompt, options);
      
      expect(result).toEqual(mockWhisperResponse);
    });
    
    it('should throw an error when the API call fails', async () => {
      // Mock a server error
      server.use(
        rest.post(`${API_BASE_URL}/ai/generate-whisper`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: 'AI service unavailable' })
          );
        })
      );
      
      await expect(generateWhisper('test')).rejects.toThrow(AIServiceError);
    });
    
    it('should include the auth token when user is authenticated', async () => {
      const token = 'test-auth-token';
      localStorage.setItem('auth', JSON.stringify({ token }));
      
      let authHeader: string | null = null;
      
      server.use(
        rest.post(`${API_BASE_URL}/ai/generate-whisper`, (req, res, ctx) => {
          authHeader = req.headers.get('Authorization');
          return res(ctx.json(mockWhisperResponse));
        })
      );
      
      await generateWhisper('test');
      
      expect(authHeader).toBe(`Bearer ${token}`);
      localStorage.removeItem('auth');
    });
  });
  
  describe('analyzeSentiment', () => {
    it('should analyze the sentiment of the provided text', async () => {
      const text = 'I love using Aangan! It\'s amazing!';
      
      const result = await analyzeSentiment(text);
      
      expect(result).toEqual(mockSentimentResponse);
      expect(result.sentiment.label).toBe('very_positive');
      expect(result.entities).toHaveLength(1);
    });
    
    it('should handle empty text input', async () => {
      await expect(analyzeSentiment('')).rejects.toThrow('Text cannot be empty');
    });
  });
  
  describe('getAISuggestions', () => {
    it('should get AI suggestions based on user context', async () => {
      const context = {
        interests: ['photography', 'research'],
        recentActivity: ['viewed library resources', 'joined photography group'],
      };
      
      const result = await getAISuggestions(context);
      
      expect(result).toEqual(mockSuggestionResponse);
      expect(result.suggestions).toHaveLength(2);
    });
    
    it('should include user ID when available', async () => {
      const userId = 'user-123';
      const context = { userId };
      
      let requestBody: any = null;
      
      server.use(
        rest.post(`${API_BASE_URL}/ai/suggestions`, async (req, res, ctx) => {
          requestBody = await req.json();
          return res(ctx.json(mockSuggestionResponse));
        })
      );
      
      await getAISuggestions(context);
      
      expect(requestBody).toHaveProperty('userId', userId);
    });
  });
  
  describe('moderateContent', () => {
    it('should moderate content and return moderation result', async () => {
      const content = 'This is a test message that needs moderation';
      const options = { checkFor: ['hate_speech', 'harassment'] };
      
      const result = await moderateContent(content, options);
      
      expect(result).toEqual(mockModerationResponse);
      expect(result.isApproved).toBe(true);
    });
    
    it('should handle different moderation thresholds', async () => {
      const content = 'This is a test message';
      const options = { 
        checkFor: ['hate_speech', 'harassment'],
        threshold: 0.9, // Higher threshold for stricter moderation
      };
      
      const result = await moderateContent(content, options);
      
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });
  
  describe('error handling', () => {
    it('should handle network errors', async () => {
      // Simulate a network error
      server.use(
        rest.post(`${API_BASE_URL}/ai/generate-whisper`, (req, res) => {
          return res.networkError('Failed to connect');
        })
      );
      
      await expect(generateWhisper('test')).rejects.toThrow('Network request failed');
    });
    
    it('should handle invalid API responses', async () => {
      // Return invalid response format
      server.use(
        rest.post(`${API_BASE_URL}/ai/analyze-sentiment`, (req, res, ctx) => {
          return res(ctx.json({ invalid: 'response' }));
        })
      );
      
      await expect(analyzeSentiment('test')).rejects.toThrow('Invalid response format');
    });
  });
  
  describe('rate limiting', () => {
    it('should respect rate limits and retry when needed', async () => {
      let requestCount = 0;
      
      server.use(
        rest.post(`${API_BASE_URL}/ai/generate-whisper`, (req, res, ctx) => {
          requestCount++;
          
          if (requestCount <= 1) {
            return res(
              ctx.status(429),
              ctx.set('Retry-After', '1'),
              ctx.json({ message: 'Too many requests' })
            );
          }
          
          return res(ctx.json(mockWhisperResponse));
        })
      );
      
      // Mock setTimeout to speed up the test
      jest.useFakeTimers();
      
      const promise = generateWhisper('test', {}, { maxRetries: 3, retryDelay: 1000 });
      
      // Fast-forward time to trigger the retry
      jest.advanceTimersByTime(1000);
      
      const result = await promise;
      expect(result).toEqual(mockWhisperResponse);
      expect(requestCount).toBe(2);
      
      jest.useRealTimers();
    });
  });
});
