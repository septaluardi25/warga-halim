import path from 'node:path'
import multer, { type FileFilterCallback } from 'multer'
import type { Request } from 'express'
import { AppError } from '../utils/AppError.js'

export const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

/** Validate uploaded file MIME type and extension (JPG, PNG, WEBP only). */
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

/** Middleware for general album photo uploads (up to 20 photos in field `photos`). */
export const uploadAlbumPhotos = upload.array('photos', 20)

/** Safely extract uploaded Multer files array from `req.files`. */
export function getUploadedFiles(req: Request): Express.Multer.File[] {
  return Array.isArray(req.files) ? req.files : []
}
