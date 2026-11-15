import { randomUUID } from 'node:crypto'
import type { UploadApiResponse } from 'cloudinary'
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'
import { AppError } from '../utils/AppError.js'

export interface UploadedPhotoResult {
  photo_url: string
  public_id: string
}

/** Upload a single in-memory Multer file buffer to Cloudinary with a randomized public_id. */
export async function uploadPhotoBuffer(
  file: Express.Multer.File,
  folder = 'warga-halim',
): Promise<UploadedPhotoResult> {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Kredensial Cloudinary belum dikonfigurasi pada server', 500)
  }

  return new Promise<UploadedPhotoResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: randomUUID(),
        resource_type: 'image',
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(new AppError('Gagal mengunggah foto ke penyimpanan', 500))
          return
        }
        resolve({
          photo_url: result.secure_url,
          public_id: result.public_id,
        })
      },
    )

    uploadStream.end(file.buffer)
  })
}

/**
 * Upload multiple in-memory Multer file buffers to Cloudinary.
 * Rolls back already-uploaded photos if any file upload fails partway through.
 */
export async function uploadMultiplePhotos(
  files: Express.Multer.File[],
  folder = 'warga-halim',
): Promise<UploadedPhotoResult[]> {
  const uploaded: UploadedPhotoResult[] = []
  try {
    for (const file of files) {
      const item = await uploadPhotoBuffer(file, folder)
      uploaded.push(item)
    }
    return uploaded
  } catch (err) {
    if (uploaded.length > 0) {
      await deletePhotosByPublicIds(uploaded.map((item) => item.public_id))
    }
    throw err
  }
}

/** Delete a single photo from Cloudinary by its `public_id`. */
export async function deletePhotoByPublicId(publicId: string): Promise<void> {
  if (!publicId || !isCloudinaryConfigured()) {
    return
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

/** Delete multiple photos from Cloudinary by their `public_id` values without throwing on partial cleanup errors. */
export async function deletePhotosByPublicIds(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0 || !isCloudinaryConfigured()) {
    return
  }
  await Promise.allSettled(publicIds.map((id) => deletePhotoByPublicId(id)))
}
