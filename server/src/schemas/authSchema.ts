import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string({ error: 'Name must be at least 6 characters' })
    .trim()
    .min(6, 'Name must be at least 6 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string({ error: 'Invalid email address' })
    .trim()
    .max(150, 'Email must be at most 150 characters')
    .pipe(z.email('Invalid email address'))
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ error: 'Password must be at least 8 characters' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
})

export const loginSchema = z.object({
  email: z
    .string({ error: 'Invalid email address' })
    .trim()
    .max(150, 'Invalid email address')
    .pipe(z.email('Invalid email address'))
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required')
    .max(72, 'Invalid email or password'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
