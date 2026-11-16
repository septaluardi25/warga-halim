import { z } from 'zod'
import { AppError } from '../utils/AppError.js'

function normalizeOptionalText(maxLength: number, fieldLabel: string) {
  return z
    .string()
    .trim()
    .max(maxLength, `${fieldLabel} maksimal ${maxLength} karakter`)
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null))
}

export const wargaFieldsSchema = z.object({
  full_name: z
    .string({ error: 'Nama lengkap wajib diisi' })
    .trim()
    .min(1, 'Nama lengkap wajib diisi')
    .max(150, 'Nama lengkap maksimal 150 karakter'),
  position: z
    .string({ error: 'Posisi wajib diisi' })
    .trim()
    .min(1, 'Posisi wajib diisi')
    .max(100, 'Posisi maksimal 100 karakter'),
  contact: normalizeOptionalText(150, 'Kontak'),
  message_impression: normalizeOptionalText(1000, 'Pesan & kesan'),
})

const photoOrderArraySchema = z
  .array(
    z
      .string()
      .trim()
      .regex(/^(existing|new):\d+$/, 'Format item photo_order tidak valid'),
  )
  .min(3, 'Foto biodata warga harus berjumlah antara 3 sampai 10 foto')
  .max(10, 'Foto biodata warga harus berjumlah antara 3 sampai 10 foto')
  .refine(
    (items) => new Set(items).size === items.length,
    'Terdapat duplikasi item pada photo_order',
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
      throw new AppError('Format JSON photo_order tidak valid', 400)
    }
  }

  const result = photoOrderArraySchema.safeParse(parsedValue)
  if (!result.success) {
    throw new AppError(
      result.error.issues[0]?.message ?? 'Format photo_order tidak valid',
      400,
    )
  }
  return result.data
}

export type WargaFieldsInput = z.infer<typeof wargaFieldsSchema>
