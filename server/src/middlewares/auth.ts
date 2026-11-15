import type { NextFunction, Request, Response } from 'express'
import { getUserById, verifyAuthToken } from '../services/authService.js'
import { AppError } from '../utils/AppError.js'

/**
 * Middleware untuk memverifikasi token JWT Bearer dari header Authorization.
 * Memastikan token valid dan akun pengguna masih aktif tercatat di database,
 * lalu menempelkan objek data user ke `req.user`. Jika token tidak ada atau tidak valid,
 * melempar `AppError` dengan status 401.
 *
 * @param req - Objek request Express yang memuat header `authorization`
 * @param _res - Objek response Express (tidak digunakan langsung)
 * @param next - Fungsi callback Express untuk melanjutkan ke handler berikutnya atau error handler
 * @throws {AppError} 401 jika header Authorization tidak ada, format salah, token invalid, atau user tidak ditemukan
 */
export async function auth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Autentikasi diperlukan', 401)
    }

    const token = authHeader.slice('Bearer '.length).trim()
    if (!token) {
      throw new AppError('Autentikasi diperlukan', 401)
    }

    const payload = verifyAuthToken(token)
    const user = await getUserById(payload.id)
    if (!user) {
      throw new AppError('Sesi berakhir, silakan masuk kembali', 401)
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
