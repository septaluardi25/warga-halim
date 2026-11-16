import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(6, 'Nama lengkap minimal 6 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    username: z
      .string()
      .trim()
      .min(3, 'Username minimal 3 karakter')
      .max(100, 'Username maksimal 100 karakter'),
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
  username: z
    .string()
    .trim()
    .min(3, 'Username minimal 3 karakter')
    .max(100, 'Username maksimal 100 karakter'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .max(72, 'Password maksimal 72 karakter'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
