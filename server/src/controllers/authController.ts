import type { NextFunction, Request, Response } from 'express'
import { loginSchema, registerSchema } from '../schemas/authSchema.js'
import { loginUser, registerUser } from '../services/authService.js'
import { AppError } from '../utils/AppError.js'

/** Handle `POST /api/auth/register`. */
export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body ?? {})
    const user = await registerUser(input)
    res.status(201).json({
      message: 'Registration successful, please sign in.',
      user,
    })
  } catch (err) {
    next(err)
  }
}

/** Handle `POST /api/auth/login`. */
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

/** Handle `GET /api/auth/me`. */
export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401)
    }
    res.status(200).json({ user: req.user })
  } catch (err) {
    next(err)
  }
}
