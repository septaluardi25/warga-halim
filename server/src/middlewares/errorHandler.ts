import type { NextFunction, Request, Response } from 'express'
import { MulterError } from 'multer'
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'

/**
 * Middleware penanganan rute tidak ditemukan (404 Not Found).
 * Dipanggil sebagai fallback ketika tidak ada route handler Express lain yang cocok.
 *
 * @param _req - Objek request Express
 * @param res - Objek response Express untuk mengembalikan status 404
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' })
}

/**
 * Middleware penanganan galat sentral (Global Error Handler).
 * Menerjemahkan berbagai jenis error (`AppError`, `MulterError`, `ZodError`, `SyntaxError`)
 * ke dalam respons JSON terstandarisasi dengan status HTTP yang sesuai.
 *
 * @param err - Objek error yang ditangkap oleh Express
 * @param _req - Objek request Express
 * @param res - Objek response Express untuk mengirim status dan pesan kesalahan
 * @param _next - Fungsi NextFunction Express
 */
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
      res.status(400).json({ message: 'Ukuran setiap foto maksimal 2 MB' })
      return
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({ message: 'Jumlah foto yang diunggah melebihi batas' })
      return
    }
    res.status(400).json({ message: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({ message: err.issues[0]?.message ?? 'Data permintaan tidak valid' })
    return
  }

  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    res.status(400).json({ message: 'Format JSON tidak valid' })
    return
  }

  console.error('[Unhandled Error]:', err)
  res.status(500).json({ message: 'Terjadi kesalahan pada server' })
}
