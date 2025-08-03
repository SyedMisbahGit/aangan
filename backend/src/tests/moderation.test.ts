import { autoModerationService } from '../services/autoModeration.service';
import { imageModerationService } from '../services/imageModeration.service';
import { containsFilteredKeywords } from '../utils/moderation/keywordFilter';

describe('Moderation System', () => {
  describe('Keyword Filter', () => {
    it('should detect profanity in text', () => {
      const testText = 'This is a test with profanity1 in it';
      const result = containsFilteredKeywords(testText);
      expect(result.hasMatch).toBe(true);
      expect(result.matchedWords).toContain('profanity1');
    });

    it('should allow clean text', () => {
      const testText = 'This is a clean message';
      const result = containsFilteredKeywords(testText);
      expect(result.hasMatch).toBe(false);
    });
  });

  describe('Auto Moderation Service', () => {
    it('should have default rules registered', () => {
      const rules = autoModerationService.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should moderate content with profanity', async () => {
      const testContent = {
        id: 'test-1',
        text: 'This contains profanity1',
        userId: 'user-1'
      };
      
      const result = await autoModerationService.moderateContent(
        testContent,
        'whisper'
      );
      
      expect(result.isApproved).toBe(false);
      expect(result.flags.length).toBeGreaterThan(0);
    });
  });

  describe('Image Moderation Service', () => {
    it('should validate image file', () => {
      // This is a basic test - actual image validation would require a real file
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('test')
      };
      
      // Should not throw for valid file
      expect(() => imageModerationService.validateImageFile(mockFile)).not.toThrow();
    });
  });
});
