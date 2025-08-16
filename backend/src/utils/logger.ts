// backend/src/utils/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Import types for winston
import type { Logform } from 'winston';
// Import types for winston-daily-rotate-file
import type { DailyRotateFileTransportOptions } from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Define log format with proper typing
const logFormat = printf((info: Logform.TransformableInfo) => {
  const { level, message, timestamp, ...meta } = info;
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Create logs directory
const logsDir = path.join(process.cwd(), 'logs');

// Define a new type that extends the Winston logger with the 'stream' property
type LoggerWithStream = winston.Logger & {
  stream: {
    write: (message: string) => void;
  };
};

// Create logger instance with proper typing
const logger: LoggerWithStream = winston.createLogger({
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
      handleRejections: true,
    }),
    
    // Daily rotate file transport for errors
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), json())
    } as DailyRotateFileTransportOptions),
    
    // Daily rotate file transport for all logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: combine(timestamp(), json())
    } as DailyRotateFileTransportOptions)
  ],
  exitOnError: false
}) as LoggerWithStream;

// Create the stream object with proper typing
const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  }
};

// Add the stream to the logger
(logger as any).stream = stream;

export default logger;
