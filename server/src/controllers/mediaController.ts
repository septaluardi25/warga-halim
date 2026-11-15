import type { NextFunction, Request, Response } from 'express'
import { getUploadedFiles } from '../middlewares/upload.js'
import { parsePositiveIntParam } from '../schemas/commonSchema.js'
import {
  createAlbumSchema,
  parseAlbumPhotoOrder,
  saveVideoSchema,
  updateAlbumSchema,
} from '../schemas/mediaSchema.js'
import {
  addPhotosToAlbum,
  createAlbum,
  deleteAlbum,
  deleteVideo,
  getHomeData,
  listAlbums,
  saveVideo,
  updateAlbum,
} from '../services/mediaService.js'

/**
 * Menangani pengambilan data agregasi beranda (`GET /api/home`).
 * Mengembalikan seluruh album publik dan satu video unggulan aktif (bila tersedia).
 *
 * @param _req - Objek request Express (tidak memerlukan autentikasi/parameter)
 * @param res - Objek response Express untuk mengembalikan data beranda (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function getHomeHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getHomeData()
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani pengambilan daftar seluruh album galeri (`GET /api/albums`).
 * Mengembalikan array album publik lengkap beserta foto-fotonya yang sudah terurut.
 *
 * @param _req - Objek request Express
 * @param res - Objek response Express untuk mengirim daftar album (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function getAlbumsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const albums = await listAlbums()
    res.status(200).json({ albums })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani pembuatan album galeri baru oleh admin (`POST /api/admin/albums`).
 * Memvalidasi judul album dan memeriksa berkas foto yang diunggah (1–50 foto),
 * kemudian menyimpannya ke Cloudinary dan database MySQL dalam transaksi atomik.
 *
 * @param req - Objek request Express yang memuat field teks `title` dan multipart files `photos`
 * @param res - Objek response Express untuk mengembalikan album yang baru dibuat (HTTP 201)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function createAlbumHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { title } = createAlbumSchema.parse(req.body ?? {})
    const files = getUploadedFiles(req)
    const album = await createAlbum(title, files)
    res.status(201).json({ album })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani pembaruan data album oleh admin (`PUT /api/admin/albums/:id`).
 * Memperbarui judul album, sinkronisasi urutan foto (`photo_order`), menghapus foto lama yang dibuang,
 * dan mengunggah foto-foto baru tambahan (total foto maksimum 50).
 *
 * @param req - Objek request Express dengan parameter `:id`, teks `title`, `photo_order`, dan multipart files
 * @param res - Objek response Express untuk mengembalikan hasil album terupdate (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function updateAlbumHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID album tidak valid')
    const { title } = updateAlbumSchema.parse(req.body ?? {})
    const bodyRecord = (req.body ?? {}) as Record<string, unknown>
    const photoOrder = parseAlbumPhotoOrder(bodyRecord.photo_order)
    const files = getUploadedFiles(req)
    const album = await updateAlbum(id, title, photoOrder, files)
    res.status(200).json({ message: 'Album berhasil diperbarui', album })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani penghapusan album galeri beserta seluruh fotonya (`DELETE /api/admin/albums/:id`).
 * Menghapus data album di database dan membersihkan seluruh aset gambar terkait di Cloudinary.
 *
 * @param req - Objek request Express dengan parameter `:id` album
 * @param res - Objek response Express yang mengirim pesan konfirmasi penghapusan (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function deleteAlbumHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID album tidak valid')
    await deleteAlbum(id)
    res.status(200).json({ message: 'Album berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani penambahan foto baru ke album yang sudah ada (`POST /api/admin/albums/:id/photos`).
 * Memvalidasi batas total foto album tidak melebihi 50 foto setelah penambahan.
 *
 * @param req - Objek request Express dengan parameter `:id` album dan multipart files `photos`
 * @param res - Objek response Express yang mengembalikan album terupdate (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function addAlbumPhotosHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID album tidak valid')
    const files = getUploadedFiles(req)
    const album = await addPhotosToAlbum(id, files)
    res.status(200).json({ message: 'Foto berhasil ditambahkan ke album', album })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani pembuatan atau penggantian video unggulan YouTube (`POST /api/admin/videos`).
 * Menyimpan judul dan URL video YouTube yang valid, menggantikan video unggulan sebelumnya.
 *
 * @param req - Objek request Express dengan body `title` dan `youtube_url`
 * @param res - Objek response Express yang mengembalikan objek video tersimpan (HTTP 201)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function saveVideoHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = saveVideoSchema.parse(req.body ?? {})
    const video = await saveVideo(input)
    res.status(201).json({ message: 'Video berhasil disimpan', video })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani penghapusan video unggulan YouTube berdasarkan ID (`DELETE /api/admin/videos/:id`).
 *
 * @param req - Objek request Express dengan parameter `:id` video
 * @param res - Objek response Express yang mengirim pesan konfirmasi penghapusan (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function deleteVideoHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID video tidak valid')
    await deleteVideo(id)
    res.status(200).json({ message: 'Video berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}
