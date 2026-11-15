import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../types/auth.js'
import { AppError } from '../utils/AppError.js'

/** Restrict route access to users whose role is in `allowedRoles` (returns 403 otherwise). */
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
