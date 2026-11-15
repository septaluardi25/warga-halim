import path from 'node:path'
import multer, { type FileFilterCallback } from 'multer'
import type { Request } from 'express'
import { AppError } from '../utils/AppError.js'

export const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

/**
 * Memvalidasi tipe MIME dan ekstensi berkas yang diunggah oleh klien.
 * Hanya berkas gambar berformat JPG, PNG, dan WEBP yang diizinkan masuk ke memori.
 *
 * @param _req - Objek request Express
 * @param file - Objek file Multer yang sedang dievaluasi
 * @param cb - Fungsi callback Multer untuk meneruskan status kelolosan berkas atau galat
 */
function photoFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    cb(new AppError('Hanya gambar dengan format JPG, PNG, dan WEBP yang diperbolehkan', 400))
    return
  }
  cb(null, true)
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PHOTO_SIZE_BYTES,
  },
  fileFilter: photoFileFilter,
})

/** Middleware for member biodata photo uploads (up to 10 photos in field `photos`). */
export const uploadWargaPhotos = upload.array('photos', 10)

/** Middleware for general album photo uploads (up to 50 photos in field `photos`). */
export const uploadAlbumPhotos = upload.array('photos', 50)

/**
 * Mengambil array berkas Multer dari properti `req.files` secara aman.
 * Menjamin nilai balik berupa array `Express.Multer.File[]` meskipun tidak ada berkas yang diunggah.
 *
 * @param req - Objek request Express yang memproses multipart/form-data
 * @returns Array berisi berkas-berkas yang diunggah
 */
export function getUploadedFiles(req: Request): Express.Multer.File[] {
  return Array.isArray(req.files) ? req.files : []
}
