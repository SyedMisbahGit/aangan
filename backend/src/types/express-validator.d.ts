// Type definitions for express-validator

declare module 'express-validator' {
  import { RequestHandler, Request, Response, NextFunction } from 'express';

  export interface ValidationChain extends RequestHandler {
    (req: Request, res: Response, next: NextFunction): void;

    // Validation methods
    isEmail(): this;
    isLength(options: { min?: number; max?: number }): this;
    isString(): this;
    isNumeric(): this;
    isBoolean(): this;
    isObject(): this;
    isMongoId(): this;
    isIn(items: unknown[]): this;
    matches(pattern: RegExp | string, message?: string): this;
    custom(validator: (value: unknown, { req }: { req: Request }) => void | Promise<void>): this;
    withMessage(message: string): this;
    optional(options?: { nullable?: boolean; checkFalsy?: boolean }): this;

    // Sanitization methods
    trim(): this;
    escape(): this;
    normalizeEmail(options?: {
      all_lowercase?: boolean;
      gmail_remove_dots?: boolean;
      gmail_remove_subaddress?: boolean;
      gmail_remove_puncutation?: boolean;
      outlookdotcom_remove_dots?: boolean;
      outlookdotcom_remove_subaddress?: boolean;
      yahoo_remove_subaddress?: boolean;
      icloud_remove_subaddress?: boolean;
    }): this;
    toDate(): this;
    toInt(): this;
    toFloat(): this;
    toBoolean(): this;
    toArray(): this;
    toLowerCase(): this;
    toUpperCase(): this;
  }

  export function body(field?: string | string[], message?: string): ValidationChain;
  export function param(field?: string | string[], message?: string): ValidationChain;
  export function query(field?: string | string[], message?: string): ValidationChain;
  export function isArray(): ValidationChain;
  export function isObject(): ValidationChain;
  export function isMongoId(): ValidationChain;
  export function isIn(items: unknown[]): ValidationChain;
  export function matches(pattern: RegExp | string, message?: string): ValidationChain;
  export function custom(validator: (value: unknown) => Promise<void> | void): ValidationChain;
  export function withMessage(message: string): ValidationChain;
  export function optional(options?: { nullable?: boolean; checkFalsy?: boolean }): ValidationChain;

  // Result of validation
  export interface ValidationError {
    param: string;
    msg: unknown;
    value?: unknown;
    location?: 'body' | 'params' | 'query' | 'cookies' | 'headers';
    nestedErrors?: unknown[];
  }

  export interface Result<T = unknown> {
    isEmpty(): boolean;
    array(options?: { onlyFirstError?: boolean }): ValidationError[];
    mapped(): { [param: string]: ValidationError };
    formatWith(errorFormatter: (error: ValidationError) => T): Result<T>;
    throw(): void;
  }

  export function validationResult(req: Request): Result;

  // Sanitization
  export function sanitizeBody(field: string): ValidationChain;
  export function sanitizeParam(field: string): ValidationChain;
  export function sanitizeQuery(field: string): ValidationChain;
  export function sanitize(field: string): ValidationChain;

  // Sanitization methods
  export function trim(): ValidationChain;
  export function escape(): ValidationChain;
  export function normalizeEmail(options?: {
    all_lowercase?: boolean;
    gmail_remove_dots?: boolean;
    gmail_remove_subaddress?: boolean;
    gmail_remove_puncutation?: boolean;
    outlookdotcom_remove_dots?: boolean;
    outlookdotcom_remove_subaddress?: boolean;
    yahoo_remove_subaddress?: boolean;
    icloud_remove_subaddress?: boolean;
  }): ValidationChain;
  export function toDate(): ValidationChain;
  export function toInt(): ValidationChain;
  export function toFloat(): ValidationChain;
  export function toBoolean(): ValidationChain;
  export function toArray(): ValidationChain;
  export function toLowerCase(): ValidationChain;
  export function toUpperCase(): ValidationChain;

  // Validation middleware
  export function checkSchema(schema: unknown): RequestHandler[];

  // One-of validation
  export function oneOf(
    validations: (ValidationChain | ValidationChain[])[],
    message?: string
  ): RequestHandler;

  // Custom validators
  export function custom(validator: (value: unknown) => unknown): unknown; // This is an odd one, but this is how it's defined.

  // Validation options
  export interface ValidationChainBuilderOptions {
    location?: 'body' | 'cookies' | 'headers' | 'params' | 'query';
    onlyLocals?: boolean;
    message?: never;
    optional?: boolean | { checkFalsy?: boolean; nullable?: boolean };
  }

  export function buildCheckFunction(locations: string[]): (fields?: string | string[], message?: string) => ValidationChain;
}