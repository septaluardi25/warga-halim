import { z } from 'zod'
import { AppError } from '../utils/AppError.js'

const positiveIntSchema = z
  .union([
    z.number().int().positive(),
    z
      .string()
      .trim()
      .regex(/^\d+$/)
      .transform((val) => Number(val)),
  ])
  .refine((val) => Number.isSafeInteger(val) && val > 0)

/** Parse a route `:id` parameter into a positive integer or throw HTTP 400 `AppError`. */
export function parsePositiveIntParam(
  raw: unknown,
  errorMessage = 'Parameter ID tidak valid',
): number {
  const result = positiveIntSchema.safeParse(raw)
  if (!result.success) {
    throw new AppError(errorMessage, 400)
  }
  return result.data
}
