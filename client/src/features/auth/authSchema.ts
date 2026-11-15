import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(6, 'Full name must be at least 6 characters')
      .max(100, 'Full name must be at most 100 characters'),
    email: z
      .string()
      .trim()
      .pipe(z.email('Invalid email address').max(150, 'Email must be at most 150 characters')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    confirmPassword: z.string().min(1, 'Please re-enter your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email('Invalid email address').max(150, 'Email must be at most 150 characters')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
