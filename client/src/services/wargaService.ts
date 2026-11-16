import type { WargaDetail, WargaListItem } from '../types'
import { apiRequest, appendPhotoFiles } from './api'

export interface CreateWargaInput {
  full_name: string
  position: string
  birth_date: string
  domicile: string
  whatsapp_number: string | null
  social_media: string | null
  contact?: string | null
  message_impression: string | null
  photos?: (File | string)[]
  photoUrls?: string[]
}

export interface UpdateWargaInput {
  full_name: string
  position: string
  birth_date: string
  domicile: string
  whatsapp_number: string | null
  social_media: string | null
  contact?: string | null
  message_impression: string | null
  photo_order: string[]
  newPhotos?: (File | string)[]
  newPhotoUrls?: string[]
}

/**
 * Mengonversi field teks data warga menjadi instans `FormData` yang siap dikirim.
 *
 * @param fields - Objek berisi properti teks biodata warga
 * @returns {FormData} Objek FormData dengan nilai field terisi
 */
function buildWargaFormData(fields: {
  full_name: string
  position: string
  birth_date: string
  domicile: string
  whatsapp_number: string | null
  social_media: string | null
  contact?: string | null
  message_impression: string | null
}): FormData {
  const formData = new FormData()
  formData.append('full_name', fields.full_name)
  formData.append('position', fields.position)
  formData.append('birth_date', fields.birth_date)
  formData.append('domicile', fields.domicile)
  const wa = fields.whatsapp_number ?? fields.contact ?? ''
  formData.append('whatsapp_number', wa)
  formData.append('contact', wa)
  formData.append('social_media', fields.social_media ?? '')
  formData.append('message_impression', fields.message_impression ?? '')
  return formData
}

/**
 * Mengambil daftar seluruh ringkasan data warga, opsional disaring berdasarkan kata kunci pencarian (`GET /api/warga`).
 *
 * @param search - Kata kunci pencarian nama (opsional)
 * @returns {Promise<{ warga: WargaListItem[] }>} Daftar kartu ringkas warga
 */
export function getWargaList(search = ''): Promise<{ warga: WargaListItem[] }> {
  const trimmed = search.trim()
  const query = trimmed.length > 0 ? `?search=${encodeURIComponent(trimmed)}` : ''
  return apiRequest<{ warga: WargaListItem[] }>(`/warga${query}`)
}

/**
 * Mengambil rincian lengkap biodata satu warga beserta seluruh fotonya yang terurut (`GET /api/warga/:id`).
 *
 * @param id - ID integer warga
 * @returns {Promise<{ warga: WargaDetail }>} Data rincian warga
 */
export function getWargaById(id: number): Promise<{ warga: WargaDetail }> {
  return apiRequest<{ warga: WargaDetail }>(`/warga/${id}`)
}

/**
 * Membuat data biodata warga baru dan mengunggah 3 hingga 10 berkas foto (`POST /api/admin/warga`).
 *
 * @param input - Data biodata lengkap dan berkas foto yang akan diunggah
 * @returns {Promise<{ warga: WargaDetail }>} Data profil warga baru yang telah dibuat
 */
export function createWarga(input: CreateWargaInput): Promise<{ warga: WargaDetail }> {
  const formData = buildWargaFormData(input)
  appendPhotoFiles(formData, input.photos ?? input.photoUrls ?? [], 'warga-photo')

  return apiRequest<{ warga: WargaDetail }>('/admin/warga', {
    method: 'POST',
    body: formData,
  })
}

/**
 * Memperbarui data teks profil warga, token urutan foto, dan mengunggah foto baru (`PUT /api/admin/warga/:id`).
 *
 * @param id - ID integer warga yang diperbarui
 * @param input - Data field teks, array token urutan foto, dan berkas foto baru
 * @returns {Promise<{ warga: WargaDetail }>} Data profil warga yang telah diperbarui
 */
export function updateWarga(
  id: number,
  input: UpdateWargaInput,
): Promise<{ warga: WargaDetail }> {
  const formData = buildWargaFormData(input)
  formData.append('photo_order', JSON.stringify(input.photo_order))
  appendPhotoFiles(formData, input.newPhotos ?? input.newPhotoUrls ?? [], 'warga-photo')

  return apiRequest<{ warga: WargaDetail }>(`/admin/warga/${id}`, {
    method: 'PUT',
    body: formData,
  })
}

/**
 * Menghapus data profil warga beserta seluruh fotonya (`DELETE /api/admin/warga/:id`).
 *
 * @param id - ID unik warga yang akan dihapus
 * @returns {Promise<{ message: string }>} Pesan konfirmasi keberhasilan
 */
export function deleteWarga(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/admin/warga/${id}`, {
    method: 'DELETE',
  })
}
