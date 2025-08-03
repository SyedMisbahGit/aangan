import { RequestHandler } from 'express';
import { Result } from 'express-validator';

declare module '../middleware/validateRequest' {
  const validateRequest: (req: unknown, res: unknown, next: (error?: unknown) => void) => Result;
  export default validateRequest;
}
