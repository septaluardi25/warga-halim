import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../types/auth.js'
import { AppError } from '../utils/AppError.js'

/**
 * Factory middleware otorisasi berbasis peran (Role-Based Access Control).
 * Membatasi akses rute hanya untuk pengguna yang memiliki salah satu peran yang terdaftar dalam `allowedRoles`.
 * Mengembalikan HTTP 401 jika belum terautentikasi dan HTTP 403 jika peran tidak mencukupi.
 *
 * @param allowedRoles - Daftar peran yang diizinkan mengakses rute (misalnya: `'admin'`, `'user'`)
 * @returns Express middleware handler untuk pengecekan otorisasi peran
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Autentikasi diperlukan', 401))
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('Akses ditolak: izin tidak mencukupi', 403))
      return
    }

    next()
  }
}

/** Convenience middleware restricting access to `admin` users only. */
export const requireAdmin = requireRole('admin')
