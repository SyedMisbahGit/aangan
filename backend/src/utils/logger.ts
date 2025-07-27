// backend/src/utils/logger.ts
import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Create logs directory
const logsDir = path.join(process.cwd(), 'logs');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',  
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json(),
    winston.format.errors({ stack: true })
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        logFormat
      ),
      handleExceptions: true,
      handleRejections: true
    }),
    
    // Daily rotate file transport for errors
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), json())
    }),
    
    // Daily rotate file transport for all logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: combine(timestamp(), json())
    })
  ],
  exitOnError: false
});

// Create a stream object with a 'write' function that will be used by `morgan`
interface LoggerStream {
  write: (message: string) => void;
}

const stream: LoggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

logger.stream = stream;

export default logger;
