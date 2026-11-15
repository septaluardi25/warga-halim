import { z } from 'zod'
import { AppError } from '../utils/AppError.js'

function normalizeOptionalText(maxLength: number, fieldLabel: string) {
  return z
    .string()
    .trim()
    .max(maxLength, `${fieldLabel} must be at most ${maxLength} characters`)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null))
}

export const wargaFieldsSchema = z.object({
  full_name: z
    .string({ error: 'Full name is required' })
    .trim()
    .min(1, 'Full name is required')
    .max(150, 'Full name must be at most 150 characters'),
  city: z
    .string({ error: 'City is required' })
    .trim()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters'),
  contact: normalizeOptionalText(150, 'Contact'),
  message_impression: normalizeOptionalText(1000, 'Message & impression'),
})

const photoOrderArraySchema = z
  .array(
    z
      .string()
      .trim()
      .regex(/^(existing|new):\d+$/, 'Invalid photo_order item format'),
  )
  .min(3, 'A member profile must have between 3 and 10 photos')
  .max(10, 'A member profile must have between 3 and 10 photos')
  .refine(
    (items) => new Set(items).size === items.length,
    'Duplicate items are not allowed in photo_order',
  )

/**
 * Parse `photo_order` from `multipart/form-data` (JSON array string or string array)
 * and validate 3..10 unique `"existing:<id>"` or `"new:<index>"` tokens.
 */
export function parsePhotoOrder(raw: unknown): string[] {
  let parsedValue: unknown = raw
  if (typeof raw === 'string') {
    try {
      parsedValue = JSON.parse(raw)
    } catch {
      throw new AppError('Invalid photo_order JSON format', 400)
    }
  }

  const result = photoOrderArraySchema.safeParse(parsedValue)
  if (!result.success) {
    throw new AppError(
      result.error.issues[0]?.message ?? 'Invalid photo_order format',
      400,
    )
  }
  return result.data
}

export type WargaFieldsInput = z.infer<typeof wargaFieldsSchema>
