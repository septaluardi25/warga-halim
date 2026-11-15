import { randomUUID } from 'node:crypto'
import type { UploadApiResponse } from 'cloudinary'
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'
import { AppError } from '../utils/AppError.js'

export interface UploadedPhotoResult {
  photo_url: string
  public_id: string
}

/**
 * Mengunggah satu berkas foto in-memory dari buffer Multer ke Cloudinary menggunakan streaming.
 * Menghasilkan UUID acak untuk `public_id` guna mencegah tabrakan nama dan potensi kebocoran path.
 *
 * @param file - Objek file Express.Multer.File yang memiliki buffer memori
 * @param folder - Nama folder tujuan di Cloudinary (default: `'warga-halim'`)
 * @returns {Promise<UploadedPhotoResult>} URL foto aman (`https`) dan ID publik aset di Cloudinary
 * @throws {AppError} 500 jika Cloudinary belum terkonfigurasi atau proses upload gagal
 */
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
 * Mengunggah sekumpulan berkas foto secara berurutan ke Cloudinary.
 * Menerapkan mekanisme rollback: jika salah satu berkas gagal diunggah di tengah proses,
 * semua foto yang sudah terlanjur terunggah sebelumnya akan otomatis dihapus kembali.
 *
 * @param files - Array berkas Express.Multer.File
 * @param folder - Folder target di Cloudinary (default: `'warga-halim'`)
 * @returns {Promise<UploadedPhotoResult[]>} Array hasil unggahan foto (URL dan public_id)
 * @throws Teruskan error dari `uploadPhotoBuffer` setelah pembersihan rollback selesai
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

/**
 * Menghapus satu aset foto dari Cloudinary berdasarkan string `public_id`.
 * Jika kredensial Cloudinary belum dikonfigurasi atau `publicId` kosong, fungsi akan selesai tanpa melempar error.
 *
 * @param publicId - String ID unik aset di Cloudinary
 * @returns {Promise<void>}
 */
export async function deletePhotoByPublicId(publicId: string): Promise<void> {
  if (!publicId || !isCloudinaryConfigured()) {
    return
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

/**
 * Menghapus banyak aset foto dari Cloudinary secara paralel berdasarkan array `public_id`.
 * Menggunakan `Promise.allSettled` agar kegagalan parsial pada satu foto tidak menghentikan pembersihan foto lainnya.
 *
 * @param publicIds - Array string public_id foto yang hendak dihapus
 * @returns {Promise<void>}
 */
export async function deletePhotosByPublicIds(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0 || !isCloudinaryConfigured()) {
    return
  }
  await Promise.allSettled(publicIds.map((id) => deletePhotoByPublicId(id)))
}
