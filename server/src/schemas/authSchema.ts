import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string({ error: 'Nama minimal 6 karakter' })
    .trim()
    .min(6, 'Nama minimal 6 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  username: z
    .string({ error: 'Username minimal 3 karakter' })
    .trim()
    .min(3, 'Username minimal 3 karakter')
    .max(100, 'Username maksimal 100 karakter')
    .refine((val) => !val.includes('@'), {
      message: 'Username tidak valid',
    }),
  password: z
    .string({ error: 'Password minimal 8 karakter' })
    .min(8, 'Password minimal 8 karakter')
    .max(72, 'Password maksimal 72 karakter'),
})

export const loginSchema = z.object({
  username: z
    .string({ error: 'Username minimal 3 karakter' })
    .trim()
    .min(3, 'Username minimal 3 karakter')
    .max(100, 'Username maksimal 100 karakter')
    .refine((val) => !val.includes('@'), {
      message: 'Username tidak valid',
    }),
  password: z
    .string({ error: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi')
    .max(72, 'Username atau password salah'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
