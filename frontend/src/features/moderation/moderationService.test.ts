import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { API_BASE_URL } from '../../app/config';
import {
  reportContent,
  getReportedContent,
  reviewReport,
  takeModerationAction,
  getModerationLogs,
  getFlaggedUsers,
  ModerationServiceError,
  ModerationAction,
  ReportReason,
  ModerationStatus,
} from './moderationService';

// Mock data for tests
const mockReport = {
  id: 'report-123',
  contentId: 'whisper-456',
  contentType: 'whisper',
  reason: ReportReason.INAPPROPRIATE,
  status: ModerationStatus.PENDING,
  reportedBy: 'user-789',
  reportedAt: new Date().toISOString(),
  content: {
    id: 'whisper-456',
    text: 'This is a test whisper that needs moderation',
    author: 'author-123',
    createdAt: new Date().toISOString(),
  },
};

const mockModerationAction = {
  id: 'action-123',
  reportId: 'report-123',
  action: ModerationAction.REMOVE_CONTENT,
  reason: 'Violates community guidelines',
  moderatorId: 'moderator-123',
  performedAt: new Date().toISOString(),
};

const mockModerationLog = {
  id: 'log-123',
  action: ModerationAction.REMOVE_CONTENT,
  targetId: 'whisper-456',
  targetType: 'whisper',
  reason: 'Inappropriate content',
  moderatorId: 'moderator-123',
  performedAt: new Date().toISOString(),
};

const mockFlaggedUser = {
  userId: 'user-123',
  username: 'problemuser',
  email: 'problem@example.com',
  reportsCount: 5,
  lastReportedAt: new Date().toISOString(),
  status: 'active' as const,
};

// Set up the mock server
const server = setupServer(
  // Report content
  rest.post(`${API_BASE_URL}/moderation/reports`, (req, res, ctx) => {
    return res(ctx.json(mockReport));
  }),
  
  // Get reported content
  rest.get(`${API_BASE_URL}/moderation/reports`, (req, res, ctx) => {
    return res(ctx.json({
      items: [mockReport],
      total: 1,
      page: 1,
      limit: 10,
    }));
  }),
  
  // Get single report
  rest.get(`${API_BASE_URL}/moderation/reports/:reportId`, (req, res, ctx) => {
    return res(ctx.json(mockReport));
  }),
  
  // Review report
  rest.post(`${API_BASE_URL}/moderation/reports/:reportId/review`, (req, res, ctx) => {
    return res(ctx.json({
      ...mockReport,
      status: ModerationStatus.REVIEWED,
      reviewedBy: 'moderator-123',
      reviewedAt: new Date().toISOString(),
    }));
  }),
  
  // Take moderation action
  rest.post(`${API_BASE_URL}/moderation/actions`, (req, res, ctx) => {
    return res(ctx.json(mockModerationAction));
  }),
  
  // Get moderation logs
  rest.get(`${API_BASE_URL}/moderation/logs`, (req, res, ctx) => {
    return res(ctx.json({
      items: [mockModerationLog],
      total: 1,
      page: 1,
      limit: 10,
    }));
  }),
  
  // Get flagged users
  rest.get(`${API_BASE_URL}/moderation/flagged-users`, (req, res, ctx) => {
    return res(ctx.json({
      items: [mockFlaggedUser],
      total: 1,
      page: 1,
      limit: 10,
    }));
  }),
  
  // Get user reports
  rest.get(`${API_BASE_URL}/moderation/users/:userId/reports`, (req, res, ctx) => {
    return res(ctx.json({
      items: [{
        ...mockReport,
        reportedUser: {
          id: req.params.userId,
          username: 'testuser',
        },
      }],
      total: 1,
    }));
  }),
  
  // Update user status
  rest.patch(`${API_BASE_URL}/moderation/users/:userId/status`, (req, res, ctx) => {
    return res(ctx.json({
      ...mockFlaggedUser,
      status: 'suspended',
      suspensionReason: 'Multiple violations',
      suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after all tests are done
afterAll(() => server.close());

describe('ModerationService', () => {
  describe('reportContent', () => {
    it('should report content successfully', async () => {
      const reportData = {
        contentId: 'whisper-456',
        contentType: 'whisper',
        reason: ReportReason.INAPPROPRIATE,
        additionalContext: 'This content is offensive',
      };
      
      const result = await reportContent(reportData);
      
      expect(result).toEqual(mockReport);
    });
    
    it('should include auth token when user is authenticated', async () => {
      const token = 'test-auth-token';
      localStorage.setItem('auth', JSON.stringify({ token }));
      
      let authHeader: string | null = null;
      
      server.use(
        rest.post(`${API_BASE_URL}/moderation/reports`, (req, res, ctx) => {
          authHeader = req.headers.get('Authorization');
          return res(ctx.json(mockReport));
        })
      );
      
      await reportContent({
        contentId: 'whisper-456',
        contentType: 'whisper',
        reason: ReportReason.INAPPROPRIATE,
      });
      
      expect(authHeader).toBe(`Bearer ${token}`);
      localStorage.removeItem('auth');
    });
    
    it('should throw an error for invalid report data', async () => {
      await expect(
        reportContent({
          contentId: '',
          contentType: 'invalid-type',
          reason: 'invalid-reason' as any,
        })
      ).rejects.toThrow(ModerationServiceError);
    });
  });
  
  describe('getReportedContent', () => {
    it('should fetch reported content with default pagination', async () => {
      const result = await getReportedContent();
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockReport);
      expect(result.total).toBe(1);
    });
    
    it('should apply filters when provided', async () => {
      const filters = {
        status: ModerationStatus.PENDING,
        contentType: 'whisper',
        reporterId: 'user-123',
      };
      
      let requestUrl: string | null = null;
      
      server.use(
        rest.get(`${API_BASE_URL}/moderation/reports`, (req, res, ctx) => {
          requestUrl = req.url.toString();
          return res(ctx.json({ items: [], total: 0, page: 1, limit: 10 }));
        })
      );
      
      await getReportedContent({ page: 2, limit: 20 }, filters);
      
      expect(requestUrl).toContain('page=2');
      expect(requestUrl).toContain('limit=20');
      expect(requestUrl).toContain(`status=${ModerationStatus.PENDING}`);
      expect(requestUrl).toContain('contentType=whisper');
      expect(requestUrl).toContain('reporterId=user-123');
    });
  });
  
  describe('reviewReport', () => {
    it('should mark a report as reviewed', async () => {
      const reportId = 'report-123';
      const reviewNotes = 'This has been reviewed';
      
      const result = await reviewReport(reportId, reviewNotes);
      
      expect(result.status).toBe(ModerationStatus.REVIEWED);
      expect(result.reviewedBy).toBe('moderator-123');
      expect(result.reviewedAt).toBeDefined();
    });
    
    it('should require moderator permissions', async () => {
      server.use(
        rest.post(`${API_BASE_URL}/moderation/reports/:reportId/review`, (req, res, ctx) => {
          return res(
            ctx.status(403),
            ctx.json({ message: 'Forbidden: Moderator access required' })
          );
        })
      );
      
      await expect(reviewReport('report-123', 'test')).rejects.toThrow(
        'Forbidden: Moderator access required'
      );
    });
  });
  
  describe('takeModerationAction', () => {
    it('should take moderation action on content', async () => {
      const actionData = {
        reportId: 'report-123',
        action: ModerationAction.REMOVE_CONTENT,
        reason: 'Violates community guidelines',
        notifyUser: true,
        notifyMessage: 'Your content was removed for violating our guidelines',
      };
      
      const result = await takeModerationAction(actionData);
      
      expect(result).toEqual(mockModerationAction);
      expect(result.action).toBe(ModerationAction.REMOVE_CONTENT);
    });
    
    it('should handle different action types', async () => {
      const actions = [
        ModerationAction.WARN_USER,
        ModerationAction.SUSPEND_USER,
        ModerationAction.BAN_USER,
        ModerationAction.REMOVE_CONTENT,
      ];
      
      for (const action of actions) {
        const result = await takeModerationAction({
          reportId: 'report-123',
          action,
          reason: 'Test reason',
        });
        
        expect(result.action).toBe(action);
      }
    });
  });
  
  describe('getModerationLogs', () => {
    it('should fetch moderation logs with filters', async () => {
      const filters = {
        action: ModerationAction.REMOVE_CONTENT,
        moderatorId: 'moderator-123',
        targetType: 'whisper',
      };
      
      const result = await getModerationLogs({ page: 1, limit: 10 }, filters);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockModerationLog);
      expect(result.total).toBe(1);
    });
  });
  
  describe('getFlaggedUsers', () => {
    it('should fetch flagged users with pagination', async () => {
      const result = await getFlaggedUsers({ page: 1, limit: 10 });
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockFlaggedUser);
      expect(result.total).toBe(1);
    });
    
    it('should filter by user status', async () => {
      const status = 'suspended';
      let requestUrl: string | null = null;
      
      server.use(
        rest.get(`${API_BASE_URL}/moderation/flagged-users`, (req, res, ctx) => {
          requestUrl = req.url.toString();
          return res(ctx.json({ items: [], total: 0, page: 1, limit: 10 }));
        })
      );
      
      await getFlaggedUsers({ page: 1, limit: 10 }, { status });
      
      expect(requestUrl).toContain(`status=${status}`);
    });
  });
  
  describe('getUserReports', () => {
    it('should fetch reports for a specific user', async () => {
      const userId = 'user-123';
      const result = await getUserReports(userId);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].reportedUser.id).toBe(userId);
    });
  });
  
  describe('updateUserStatus', () => {
    it('should update user status with reason', async () => {
      const userId = 'user-123';
      const status = 'suspended';
      const reason = 'Multiple violations';
      const durationDays = 7;
      
      const result = await updateUserStatus(userId, status, reason, durationDays);
      
      expect(result.status).toBe('suspended');
      expect(result.suspensionReason).toBe(reason);
      expect(result.suspendedUntil).toBeDefined();
    });
  });
  
  describe('error handling', () => {
    it('should handle network errors', async () => {
      server.use(
        rest.post(`${API_BASE_URL}/moderation/reports`, (req, res) => {
          return res.networkError('Failed to connect');
        })
      );
      
      await expect(
        reportContent({
          contentId: 'test',
          contentType: 'whisper',
          reason: ReportReason.INAPPROPRIATE,
        })
      ).rejects.toThrow('Network request failed');
    });
    
    it('should handle API errors with custom messages', async () => {
      const errorMessage = 'Content already reported';
      
      server.use(
        rest.post(`${API_BASE_URL}/moderation/reports`, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ message: errorMessage })
          );
        })
      );
      
      await expect(
        reportContent({
          contentId: 'duplicate',
          contentType: 'whisper',
          reason: ReportReason.INAPPROPRIATE,
        })
      ).rejects.toThrow(errorMessage);
    });
  });
});
