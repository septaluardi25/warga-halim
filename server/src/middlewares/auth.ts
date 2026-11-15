import type { NextFunction, Request, Response } from 'express'
import { getUserById, verifyAuthToken } from '../services/authService.js'
import { AppError } from '../utils/AppError.js'

/**
 * Verify Bearer JWT token and confirm the user still exists in the database.
 * Attaches the user to `req.user` or responds with 401 if missing/deleted.
 */
export async function auth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401)
    }

    const token = authHeader.slice('Bearer '.length).trim()
    if (!token) {
      throw new AppError('Authentication required', 401)
    }

    const payload = verifyAuthToken(token)
    const user = await getUserById(payload.id)
    if (!user) {
      throw new AppError('Session expired, please sign in again.', 401)
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
