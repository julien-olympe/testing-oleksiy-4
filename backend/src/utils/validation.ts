import { z } from 'zod';
import { ValidationError } from './errors';

export const emailSchema = z
  .string()
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be at most 255 characters')
  .email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export function validateEmail(email: string): void {
  try {
    emailSchema.parse(email);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid email format', {
        field: 'email',
        validationErrors: error.errors.map((e) => ({
          field: 'email',
          message: e.message,
        })),
      });
    }
    throw error;
  }
}

export function validatePassword(password: string): void {
  try {
    passwordSchema.parse(password);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Password does not meet requirements', {
        field: 'password',
        validationErrors: error.errors.map((e) => ({
          field: 'password',
          message: e.message,
        })),
      });
    }
    throw error;
  }
}

export function validateUUID(id: string, fieldName: string = 'id'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`, {
      field: fieldName,
      validationErrors: [
        {
          field: fieldName,
          message: `Invalid UUID format`,
        },
      ],
    });
  }
}
