import type { NextFunction, Request, Response } from 'express'
import { MulterError } from 'multer'
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Endpoint not found' })
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Each photo must be at most 2 MB' })
      return
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({ message: 'Too many photos uploaded' })
      return
    }
    res.status(400).json({ message: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({ message: err.issues[0]?.message ?? 'Invalid request data' })
    return
  }

  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    res.status(400).json({ message: 'Invalid JSON payload' })
    return
  }

  console.error('[Unhandled Error]:', err)
  res.status(500).json({ message: 'Internal server error' })
}
