import type { NextFunction, Request, Response } from 'express'
import { loginSchema, registerSchema } from '../schemas/authSchema.js'
import { loginUser, registerUser } from '../services/authService.js'
import { AppError } from '../utils/AppError.js'

/**
 * Menangani pendaftaran pengguna baru (`POST /api/auth/register`).
 * Memvalidasi payload registrasi melalui Zod schema, mendaftarkan akun dengan peran default `user`,
 * dan mengembalikan data pengguna terdaftar dengan kode HTTP 201.
 *
 * @param req - Objek request Express yang memuat field `name`, `username`, dan `password`
 * @param res - Objek response Express untuk mengirimkan respons status 201
 * @param next - Fungsi callback Express untuk meneruskan error ke middleware errorHandler
 */
export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body ?? {})
    const user = await registerUser(input)
    res.status(201).json({
      message: 'Pendaftaran berhasil, silakan masuk.',
      user,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani proses masuk pengguna (`POST /api/auth/login`).
 * Memvalidasi kredensial (username & kata sandi), menghasilkan token JWT,
 * dan mengembalikan token beserta data profil pengguna dengan kode HTTP 200.
 *
 * @param req - Objek request Express yang memuat `username` dan `password`
 * @param res - Objek response Express untuk mengirimkan token dan data user
 * @param next - Fungsi callback Express untuk meneruskan error ke errorHandler
 */
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body ?? {})
    const result = await loginUser(input)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani verifikasi sesi pengguna saat ini (`GET /api/auth/me`).
 * Mengembalikan objek profil pengguna yang telah diverifikasi dan ditempelkan pada `req.user` oleh middleware autentikasi.
 *
 * @param req - Objek request Express terautentikasi (memiliki properti `req.user`)
 * @param res - Objek response Express untuk mengembalikan data user aktif
 * @param next - Fungsi callback Express untuk meneruskan error jika belum terautentikasi
 */
export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Autentikasi diperlukan', 401)
    }
    res.status(200).json({ user: req.user })
  } catch (err) {
    next(err)
  }
}
