import axios from 'axios';
import { BadRequestError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';
// Using require for form-data to avoid ES module interop issues
const FormData = require('form-data');
import { Readable } from 'stream';

// Type for the file object from multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
  stream?: Readable;
}

// Configuration for the content moderation service
interface ModerationConfig {
  provider: 'azure' | 'aws' | 'google' | 'moderatecontent' | 'sightengine';
  apiKey: string;
  apiSecret?: string; // For services that use a secret
  endpoint?: string;
  minConfidence?: number; // Minimum confidence score to flag content (0-1)
  maxImageSizeMB?: number; // Maximum image size in MB
  allowedMimeTypes?: string[]; // Allowed MIME types for uploads
}

// Default configuration
const defaultConfig: ModerationConfig = {
  provider: 'moderatecontent', // Default to free tier
  apiKey: process.env.IMAGE_MODERATION_API_KEY || '',
  minConfidence: 0.7,
  maxImageSizeMB: 5,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Raw response data from providers.
// We use a generic type to represent the various structures.
type ProviderData = Record<string, unknown>;

// Type for moderation results
export interface ModerationResult {
  isApproved: boolean;
  isExplicit: boolean;
  isSuggestion: boolean;
  categories: {
    adult: number;
    suggestive: number;
    violence: number;
    medical: number;
    spoof: number;
    racy: number;
    gore: number;
    [key: string]: number; // Allow additional categories
  };
  tags?: string[];
  reason?: string;
  providerData?: ProviderData; // Raw response from the provider
}

// Custom error interface to add context
interface ModerationErrorContext {
  isExplicit?: boolean;
  categories?: Record<string, number>;
  provider?: string;
  originalError?: string;
}

interface ContextualForbiddenError extends ForbiddenError {
  context?: ModerationErrorContext;
}

/**
 * Service for moderating images using various content moderation APIs
 */
class ImageModerationService {
  private config: ModerationConfig;

  constructor(customConfig: Partial<ModerationConfig> = {}) {
    this.config = { ...defaultConfig, ...customConfig };
    this.validateConfig();
  }

  private validateConfig() {
    if (!this.config.apiKey) {
      logger.warn('Image moderation API key not configured. Image moderation will be disabled.');
    }
  }

  /**
   * Check if the image moderation service is properly configured
   */
  public isEnabled(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Validate an image file before processing
   */
  private validateImageFile(file: MulterFile): void {
    if (!file) {
      throw new BadRequestError('No file provided', 'NO_FILE');
    }

    // Check file size
    const maxSizeBytes = (this.config.maxImageSizeMB || 5) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestError(
        `File size exceeds maximum allowed size of ${this.config.maxImageSizeMB}MB`,
        'FILE_TOO_LARGE'
      );
    }

    // Check MIME type
    if (this.config.allowedMimeTypes && !this.config.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestError(
        `Unsupported file type: ${file.mimetype}. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`,
        'INVALID_FILE_TYPE'
      );
    }
  }

  /**
   * Moderate an image using the configured provider
   * @param file The image file to moderate (from multer)
   * @param options Additional options for moderation
   * @returns Promise with moderation results
   */
  public async moderateImage(
    file: MulterFile,
    options: {
      requireModeration?: boolean; // Whether to throw an error if moderation fails
      customConfig?: Partial<ModerationConfig>;
    } = {}
  ): Promise<ModerationResult> {
    const { requireModeration = true, customConfig = {} } = options;
    const config = { ...this.config, ...customConfig };

    this.validateImageFile(file);

    // If no API key is configured, skip moderation in development/test
    if (!config.apiKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Image moderation is not properly configured');
      }
      logger.warn('Image moderation skipped - no API key configured');
      return this.getDefaultApprovedResult();
    }

    try {
      let result: ModerationResult;

      switch (config.provider) {
        case 'azure':
          result = await this.moderateWithAzure(file, config);
          break;
        case 'aws':
          result = await this.moderateWithAWS(file, config);
          break;
        case 'google':
          result = await this.moderateWithGoogle(file, config);
          break;
        case 'sightengine':
          result = await this.moderateWithSightengine(file, config);
          break;
        case 'moderatecontent':
        default:
          result = await this.moderateWithModerateContent(file, config);
          break;
      }

      // If moderation is required and the image is not approved, throw an error
      if (requireModeration && !result.isApproved) {
        const error: ContextualForbiddenError = new ForbiddenError(
          'Image content violates our community guidelines',
          'IMAGE_MODERATION_FAILED'
        );
        // Add additional context to the error object
        error.context = {
          isExplicit: result.isExplicit,
          categories: result.categories,
          provider: config.provider,
        };
        throw error;
      }

      return result;
    } catch (error) {
      // Log the error with proper error type handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Image moderation error:', errorMessage);

      // In production, fail closed (reject) if moderation fails
      if (process.env.NODE_ENV === 'production' || requireModeration) {
        const errorObj: ContextualForbiddenError = new ForbiddenError(
          'Unable to verify image content. Please try a different image.',
          'IMAGE_MODERATION_ERROR'
        );
        // Add additional context to the error object
        errorObj.context = { originalError: errorMessage };
        throw errorObj;
      }

      // In development, log the error but allow the image
      logger.warn('Image moderation failed, but allowing in development mode');
      return this.getDefaultApprovedResult();
    }
  }

  /**
   * Get a default approved result (used when moderation is skipped)
   */
  private getDefaultApprovedResult(): ModerationResult {
    return {
      isApproved: true,
      isExplicit: false,
      isSuggestion: false,
      categories: {
        adult: 0,
        suggestive: 0,
        violence: 0,
        medical: 0,
        spoof: 0,
        racy: 0,
        gore: 0,
      },
      tags: [],
      providerData: { skipped: true },
    };
  }

  // --- Provider Implementations ---

  /**
   * Moderate image using ModerateContent.com API (free tier available)
   */
  private async moderateWithModerateContent(
    file: MulterFile,
    config: ModerationConfig
  ): Promise<ModerationResult> {
    // Create form data instance and append the file
    const formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname });

    // Make the request with the form data
    const response = await axios.post(
      `https://api.moderatecontent.com/moderate/?key=${config.apiKey}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync(),
        },
      }
    );

    const data = response.data as {
      rating_letter?: string;
      rating_index: number;
      error?: string;
    };

    if (data.error) {
      throw new Error(`ModerateContent API error: ${data.error}`);
    }

    const minConfidence = config.minConfidence || 0.7;

    // Parse the response from ModerateContent
    const result: ModerationResult = {
      isApproved: true,
      isExplicit: false,
      isSuggestion: false,
      categories: {
        adult: data.rating_letter === 'a' ? 1 : 0,
        suggestive: data.rating_letter === 't' ? 1 : 0,
        violence: data.rating_letter === 'r' ? 1 : 0,
        medical: 0,
        spoof: 0,
        racy: 0,
        gore: 0,
      },
      tags: data.rating_letter ? [data.rating_letter] : [],
      providerData: data,
    };

    // Determine if the image should be rejected based on the rating index and minConfidence
    // rating_index: 0 = safe, 1 = suggestive, 2 = explicit
    result.isExplicit = data.rating_index > 1 || 
      (data.rating_index === 1 && minConfidence <= 0.5);
    result.isApproved = !result.isExplicit;

    return result;
  }

  /**
   * Moderate image using Azure Content Moderator
   */
  private async moderateWithAzure(
    file: MulterFile,
    config: ModerationConfig
  ): Promise<ModerationResult> {
    const endpoint = config.endpoint || 'https://{region}.api.cognitive.microsoft.com';
    const url = `${endpoint}/contentmoderator/moderate/v1.0/ProcessImage/Evaluate`;

    const response = await axios.post(url, file.buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
      params: {
        CacheImage: false,
      },
    });

    const data = response.data as {
      AdultClassificationScore?: number;
      RacyClassificationScore?: number;
      GoreClassificationScore?: number;
    };

    const minConfidence = config.minConfidence || 0.7;

    const result: ModerationResult = {
      isApproved: true,
      isExplicit: false,
      isSuggestion: false,
      categories: {
        adult: data.AdultClassificationScore || 0,
        suggestive: data.RacyClassificationScore || 0,
        violence: 0,
        medical: 0,
        spoof: 0,
        racy: data.RacyClassificationScore || 0,
        gore: data.GoreClassificationScore || 0,
      },
      providerData: data,
    };

    // Check if any category exceeds the threshold
    result.isExplicit = Object.values(result.categories).some(score => score > minConfidence);

    result.isApproved = !result.isExplicit;

    return result;
  }

  /**
   * Moderate image using AWS Rekognition
   */
  private async moderateWithAWS(
    _file: MulterFile,
    _config: ModerationConfig
  ): Promise<ModerationResult> {
    // This is a placeholder - AWS SDK would be required for actual implementation
    throw new Error('AWS Rekognition moderation is not implemented');
  }

  /**
   * Moderate image using Google Cloud Vision
   */
  private async moderateWithGoogle(
    _file: MulterFile,
    _config: ModerationConfig
  ): Promise<ModerationResult> {
    // This is a placeholder - Google Cloud Vision SDK would be required
    throw new Error('Google Cloud Vision moderation is not implemented');
  }

  /**
   * Moderate image using Sightengine
   */
  private async moderateWithSightengine(
    file: MulterFile,
    config: ModerationConfig
  ): Promise<ModerationResult> {
    if (!config.apiSecret) {
      throw new Error('Sightengine API secret is required');
    }
    
    // We create a Blob from the buffer to ensure compatibility with FormData in some environments.
    const formData = new FormData();
    formData.append('media', new Blob([file.buffer]), file.originalname);
    formData.append('api_user', config.apiKey);
    formData.append('api_secret', config.apiSecret);
    formData.append('workflow', 'wfl_2uQ2ZnF2Xxnr0YoIwHrnxn'); // Default workflow

    // Make the request with the form data
    const response = await axios.post(
      'https://api.sightengine.com/1.0/check-workflow.json',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync(),
        },
      }
    );

    const data = response.data as {
      status: string;
      summary?: Record<string, unknown>;
      error?: {
        message: string;
      }
    };

    if (data.status === 'failure' && data.error) {
      throw new Error(`Sightengine API error: ${data.error.message}`);
    }

    const minConfidence = config.minConfidence || 0.7;

    const result: ModerationResult = {
      isApproved: true,
      isExplicit: false,
      isSuggestion: false,
      categories: {
        adult: 0,
        suggestive: 0,
        violence: 0,
        medical: 0,
        spoof: 0,
        racy: 0,
        gore: 0,
      },
      tags: [],
      providerData: data,
    };

    // Process Sightengine response
    if (data.status === 'success' && data.summary) {
      const summary = data.summary as Record<string, number>;

      // Map Sightengine categories to our standard categories
      if (summary.alcohol > minConfidence) result.categories.adult = summary.alcohol;
      if (summary.drugs > minConfidence) result.categories.adult = Math.max(result.categories.adult, summary.drugs);
      if (summary.offensive > minConfidence) result.categories.violence = summary.offensive;
      if (summary.weapon > minConfidence) result.categories.violence = Math.max(result.categories.violence, summary.weapon);

      // Check for explicit content
      result.isExplicit = Object.values(result.categories).some(score => score > minConfidence);
      result.isApproved = !result.isExplicit;

      // Add tags for each detected category
      result.tags = Object.entries(summary)
        .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && entry[1] > minConfidence)
        .map(([category]) => category);
    }

    return result;
  }
}

// Export a singleton instance
export const imageModerationService = new ImageModerationService();

export default imageModerationService;