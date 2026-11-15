import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError.js'

interface RateLimitRecord {
  count: number
  resetTime: number
}

/**
 * Membuat fungsi middleware rate limiting berbasis in-memory untuk membatasi frekuensi request per IP.
 * Berfungsi memitigasi serangan brute force credential stuffing maupun spam pendaftaran tanpa dependensi eksternal.
 *
 * @param options - Konfigurasi pembatasan laju request
 * @param options.windowMs - Durasi jendela waktu pembatasan dalam milidetik
 * @param options.maxRequests - Jumlah maksimal request yang diizinkan dalam jendela waktu
 * @param options.message - Pesan galat kustom saat kuota request terlampaui (HTTP 429)
 * @returns {Function} Express middleware yang menegakkan batasan kuota per alamat IP klien
 */
export function createRateLimiter(options: {
  windowMs: number
  maxRequests: number
  message?: string
}) {
  const {
    windowMs,
    maxRequests,
    message = 'Terlalu banyak permintaan, silakan coba lagi dalam beberapa menit.',
  } = options

  const records = new Map<string, RateLimitRecord>()

  // Cleanup expired entries periodically every window interval
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of records.entries()) {
      if (record.resetTime <= now) {
        records.delete(key)
      }
    }
  }, windowMs).unref()

  return (req: Request, _res: Response, next: NextFunction): void => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown-ip'

    const now = Date.now()
    const record = records.get(clientIp)

    if (!record || record.resetTime <= now) {
      records.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      })
      next()
      return
    }

    if (record.count >= maxRequests) {
      next(new AppError(message, 429))
      return
    }

    record.count += 1
    next()
  }
}

/** Rate limiter for login endpoint: max 10 attempts per 5 minutes per IP. */
export const loginRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  message: 'Terlalu banyak percobaan masuk, silakan coba lagi setelah 5 menit.',
})

/** Rate limiter for registration endpoint: max 10 registrations per hour per IP. */
export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  message: 'Terlalu banyak pendaftaran akun dari perangkat ini, silakan coba lagi setelah 1 jam.',
})
