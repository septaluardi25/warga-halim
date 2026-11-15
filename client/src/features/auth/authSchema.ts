import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(6, 'Nama lengkap minimal 6 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    email: z
      .string()
      .trim()
      .pipe(z.email('Format email tidak valid').max(150, 'Email maksimal 150 karakter')),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .max(72, 'Password maksimal 72 karakter'),
    confirmPassword: z.string().min(1, 'Silakan masukkan ulang password Anda'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email('Format email tidak valid').max(150, 'Email maksimal 150 karakter')),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(72, 'Password maksimal 72 karakter'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
