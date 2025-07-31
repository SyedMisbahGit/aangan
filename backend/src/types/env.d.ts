declare namespace NodeJS {
  export interface ProcessEnv {
    // Server Configuration
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    HOST?: string;
    
    // Database
    DATABASE_URL: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_SSL?: string;
    
    // JWT
    JWT_SECRET: string;
    JWT_ACCESS_EXPIRATION_MINUTES: string;
    JWT_REFRESH_EXPIRATION_DAYS: string;
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: string;
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: string;
    
    // Email
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USERNAME?: string;
    SMTP_PASSWORD?: string;
    EMAIL_FROM: string;
    
    // Frontend URLs
    FRONTEND_URL: string;
    
    // API
    API_PREFIX: string;
    
    // Redis
    REDIS_URL?: string;
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    REDIS_PASSWORD?: string;
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS?: string;
    RATE_LIMIT_MAX?: string;
    
    // CORS
    CORS_ORIGIN?: string;
    
    // Logging
    LOG_LEVEL?: 'error' | 'warn' | 'info' | 'http' | 'debug';
    LOG_FORMAT?: 'combined' | 'common' | 'dev' | 'short' | 'tiny';
    
    // AI/ML Services
    OPENAI_API_KEY?: string;
    
    // Feature Flags
    ENABLE_SWAGGER?: string;
    ENABLE_RATE_LIMIT?: string;
    ENABLE_LOGGING?: string;
    
    // Version
    APP_VERSION?: string;
    
    // Monitoring
    SENTRY_DSN?: string;
    
    // WebSocket
    WS_PATH?: string;
    WS_SERVE_CLIENT?: string;
    
    // File Uploads
    UPLOAD_DIR?: string;
    MAX_FILE_SIZE?: string;
    MAX_FILES?: string;
    
    // Security
    SECURE_COOKIES?: string;
    TRUST_PROXY?: string;
    
    // Development
    DEBUG?: string;
  }
}
