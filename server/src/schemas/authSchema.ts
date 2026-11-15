import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string({ error: 'Nama minimal 6 karakter' })
    .trim()
    .min(6, 'Nama minimal 6 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z
    .string({ error: 'Format email tidak valid' })
    .trim()
    .max(150, 'Email maksimal 150 karakter')
    .pipe(z.email('Format email tidak valid'))
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ error: 'Password minimal 8 karakter' })
    .min(8, 'Password minimal 8 karakter')
    .max(72, 'Password maksimal 72 karakter'),
})

export const loginSchema = z.object({
  email: z
    .string({ error: 'Format email tidak valid' })
    .trim()
    .max(150, 'Format email tidak valid')
    .pipe(z.email('Format email tidak valid'))
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ error: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi')
    .max(72, 'Email atau password salah'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
