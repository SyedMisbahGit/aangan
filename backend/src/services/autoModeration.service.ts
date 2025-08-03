import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import logger from '../utils/logger';
import { containsFilteredKeywords } from '../utils/moderation/keywordFilter';
import { imageModerationService, ModerationResult } from './imageModeration.service';
import { BadRequestError } from '../utils/errors';

type ContentType = 'whisper' | 'comment' | 'user_profile' | 'media';

interface AutoModerationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number; // Higher numbers run first
  condition: (content: any, metadata: any) => Promise<boolean> | boolean;
  action: (contentId: string, contentType: ContentType, reason: string, metadata?: any) => Promise<void>;
}

interface AutoModerationOptions {
  /** Whether to throw an error if content is flagged */
  throwOnFlag?: boolean;
  /** Additional metadata to pass to moderation rules */
  metadata?: Record<string, any>;
  /** Whether to skip certain rule types */
  skipRules?: string[];
}

class AutoModerationService {
  private rules: Map<string, AutoModerationRule> = new Map();
  
  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Register a new auto-moderation rule
   */
  public registerRule(rule: Omit<AutoModerationRule, 'id'>): string {
    const id = uuidv4();
    this.rules.set(id, { ...rule, id });
    return id;
  }

  /**
   * Remove an auto-moderation rule by ID
   */
  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get all registered rules
   */
  public getRules(): AutoModerationRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check content against all active rules and take appropriate actions
   */
  public async moderateContent(
    content: any,
    contentType: ContentType,
    options: AutoModerationOptions = {}
  ): Promise<{ isApproved: boolean; flags: Array<{ ruleId: string; reason: string }> }> {
    const { throwOnFlag = true, metadata = {}, skipRules = [] } = options;
    const flags: Array<{ ruleId: string; ruleName: string; reason: string }> = [];
    
    // Get active rules, sorted by priority (highest first)
    const activeRules = Array.from(this.rules.values())
      .filter(rule => rule.isActive && !skipRules.includes(rule.id))
      .sort((a, b) => b.priority - a.priority);
    
    // Process each rule
    for (const rule of activeRules) {
      try {
        const matches = await rule.condition(content, metadata);
        
        if (matches) {
          const reason = `Auto-flagged by rule: ${rule.name}`;
          flags.push({
            ruleId: rule.id,
            ruleName: rule.name,
            reason,
          });
          
          // Execute the rule's action
          await rule.action(content.id || content._id, contentType, reason, metadata);
          
          // If we should stop on first match, break the loop
          if (throwOnFlag) {
            break;
          }
        }
      } catch (error) {
        logger.error(`Error executing auto-moderation rule ${rule.name}:`, error);
        // Continue with other rules even if one fails
      }
    }
    
    const isApproved = flags.length === 0;
    
    if (!isApproved && throwOnFlag) {
      throw new BadRequestError(
        'Content violates community guidelines',
        'CONTENT_FLAGGED',
        { flags, contentType }
      );
    }
    
    return { isApproved, flags };
  }

  /**
   * Initialize default auto-moderation rules
   */
  private initializeDefaultRules(): void {
    // Rule 1: Block explicit images
    this.registerRule({
      name: 'Explicit Image Detection',
      description: 'Blocks images containing explicit content',
      isActive: true,
      priority: 100,
      condition: async (content) => {
        // Only process content with images
        if (!content.mediaUrl && !content.imageUrl) return false;
        
        try {
          // In a real implementation, we would fetch and check the image
          // For now, we'll assume the image moderation is done in the upload middleware
          return false;
        } catch (error) {
          logger.error('Error checking image content:', error);
          return false;
        }
      },
      action: async (contentId, contentType, reason, metadata) => {
        await this.flagContent(contentId, contentType, reason, 'explicit_content');
      },
    });

    // Rule 2: Profanity Filter
    this.registerRule({
      name: 'Profanity Filter',
      description: 'Flags content containing profanity or offensive language',
      isActive: true,
      priority: 90,
      condition: (content) => {
        const textFields = [content.text, content.title, content.description, content.bio]
          .filter(Boolean)
          .join(' ');
          
        if (!textFields) return false;
        
        const { hasMatch } = containsFilteredKeywords(textFields);
        return hasMatch;
      },
      action: async (contentId, contentType, reason, metadata) => {
        await this.flagContent(contentId, contentType, reason, 'profanity');
      },
    });

    // Rule 3: Spam Detection
    this.registerRule({
      name: 'Spam Detection',
      description: 'Detects and flags potential spam content',
      isActive: true,
      priority: 80,
      condition: async (content, metadata) => {
        // Check for repetitive content
        if (content.text && content.text.length > 0) {
          // Simple check for repeated phrases (basic spam detection)
          const words = content.text.split(/\s+/);
          const wordCount = words.length;
          const uniqueWords = new Set(words.map(w => w.toLowerCase()));
          const uniqueRatio = uniqueWords.size / wordCount;
          
          // If more than 50% of words are repeated, flag as potential spam
          if (uniqueRatio < 0.5) {
            return true;
          }
          
          // Check for excessive links
          const linkRegex = /https?:\/\/[^\s]+/g;
          const links = content.text.match(linkRegex) || [];
          if (links.length > 3) {
            return true;
          }
        }
        
        return false;
      },
      action: async (contentId, contentType, reason, metadata) => {
        await this.flagContent(contentId, contentType, reason, 'spam');
      },
    });

    // Rule 4: New User Restrictions
    this.registerRule({
      name: 'New User Restrictions',
      description: 'Applies stricter rules to new user accounts',
      isActive: true,
      priority: 70,
      condition: async (content, metadata) => {
        const user = metadata.user;
        if (!user) return false;
        
        // Check if user is new (account created in the last 7 days)
        const accountAge = Date.now() - new Date(user.created_at).getTime();
        const isNewUser = accountAge < 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (!isNewUser) return false;
        
        // For new users, check for external links
        if (content.text && content.text.includes('http')) {
          return true;
        }
        
        return false;
      },
      action: async (contentId, contentType, reason, metadata) => {
        // For new users, we might want to hold the content for review
        // instead of outright flagging it
        await this.flagContent(
          contentId, 
          contentType, 
          `${reason} - New user restriction`, 
          'new_user_restriction'
        );
      },
    });
  }

  /**
   * Helper method to flag content in the database
   */
  private async flagContent(
    contentId: string,
    contentType: ContentType,
    reason: string,
    flagType: string
  ): Promise<void> {
    try {
      await db('content_flags').insert({
        id: uuidv4(),
        content_id: contentId,
        content_type: contentType,
        reason: flagType,
        details: reason,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      logger.info(`Content flagged: ${contentType} ${contentId} - ${reason}`);
    } catch (error) {
      logger.error('Error flagging content:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const autoModerationService = new AutoModerationService();

export default autoModerationService;
