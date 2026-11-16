import type { NextFunction, Request, Response } from 'express'
import { getUploadedFiles } from '../middlewares/upload.js'
import { parsePositiveIntParam } from '../schemas/commonSchema.js'
import { parsePhotoOrder, wargaFieldsSchema } from '../schemas/wargaSchema.js'
import {
  createWarga,
  deleteWarga,
  getWargaById,
  listWarga,
  updateWarga,
} from '../services/wargaService.js'

/**
 * Menangani pencarian dan penampilan daftar ringkas biodata warga (`GET /api/warga?search=`).
 * Mendukung pencarian berbasis query string nama dan hanya memuat foto utama pertama (`sort_order = 1`).
 *
 * @param req - Objek request Express yang dapat memuat query param `search`
 * @param res - Objek response Express untuk mengembalikan array warga (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function listWargaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : ''
    const warga = await listWarga(search)
    res.status(200).json({ warga })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani pengambilan rincian biodata warga beserta seluruh fotonya (`GET /api/warga/:id`).
 * Mengembalikan data lengkap seperti nama, posisi, kontak, pesan/kesan, serta seluruh foto yang diurutkan.
 *
 * @param req - Objek request Express dengan parameter `:id` warga
 * @param res - Objek response Express untuk mengembalikan rincian data warga (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function getWargaDetailHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID warga tidak valid')
    const warga = await getWargaById(id)
    res.status(200).json({ warga })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani pembuatan data warga baru oleh admin (`POST /api/admin/warga`).
 * Memvalidasi input field (nama, posisi, kontak, pesan/kesan) dan mewajibkan unggahan 3 hingga 10 berkas foto.
 *
 * @param req - Objek request Express dengan multipart field teks dan berkas `photos`
 * @param res - Objek response Express untuk mengembalikan data warga yang baru dibuat (HTTP 201)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function createWargaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = wargaFieldsSchema.parse(req.body ?? {})
    const files = getUploadedFiles(req)
    const warga = await createWarga(input, files)
    res.status(201).json({ warga })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani pembaruan data biodata warga oleh admin (`PUT /api/admin/warga/:id`).
 * Memperbarui field teks, melakukan sinkronisasi urutan foto (`photo_order`), menghapus foto yang dicopot,
 * dan menambahkan foto baru dengan total foto akhir tetap berada pada rentang 3–10 foto.
 *
 * @param req - Objek request Express dengan parameter `:id`, field teks, `photo_order`, dan multipart files
 * @param res - Objek response Express untuk mengembalikan data warga yang telah diperbarui (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function updateWargaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID warga tidak valid')
    const input = wargaFieldsSchema.parse(req.body ?? {})
    const bodyRecord = (req.body ?? {}) as Record<string, unknown>
    const photoOrder = parsePhotoOrder(bodyRecord.photo_order)
    const files = getUploadedFiles(req)
    const warga = await updateWarga(id, input, photoOrder, files)
    res.status(200).json({ warga })
  } catch (err) {
    next(err)
  }
}

/**
 * Menangani penghapusan data biodata warga beserta seluruh fotonya (`DELETE /api/admin/warga/:id`).
 * Menghapus baris pada tabel `warga` (cascade delete ke `warga_photos`) dan membersihkan aset di Cloudinary.
 *
 * @param req - Objek request Express dengan parameter `:id` warga
 * @param res - Objek response Express yang mengirim pesan konfirmasi penghapusan (HTTP 200)
 * @param next - Fungsi callback Express untuk penanganan error
 */
export async function deleteWargaHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parsePositiveIntParam(req.params.id, 'ID warga tidak valid')
    await deleteWarga(id)
    res.status(200).json({ message: 'Data warga berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}
