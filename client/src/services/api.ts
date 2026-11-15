import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api'
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '')

/**
 * Kelas error khusus untuk memuat kode status HTTP dan pesan kesalahan dari API backend.
 */
export class ApiError extends Error {
  status: number

  /**
   * Menginisialisasi objek ApiError baru.
   *
   * @param message - Pesan galat dari respons API atau fallback
   * @param status - Kode status HTTP (misal 400, 401, 403, 404, 500)
   */
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  includeAuth?: boolean
  skipAuthRedirect?: boolean
  tokenOverride?: string | null
}

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/**
 * Melakukan pemanggilan HTTP (JSON atau FormData) ke backend API dengan penanganan otomatis token JWT,
 * parsing JSON, serta penanganan kedaluwarsa sesi (401 logout).
 *
 * @template T - Tipe data kembalian yang diharapkan
 * @param path - Jalur endpoint API (contoh: '/auth/login' atau 'warga')
 * @param options - Opsi konfigurasi fetch (metode HTTP, body, header auth)
 * @returns {Promise<T>} Payload data JSON dari server
 * @throws {ApiError} Jika respons HTTP berstatus selain 2xx
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = options.tokenOverride ?? useAuthStore.getState().token
  const headers: Record<string, string> = {}

  if (options.includeAuth !== false && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  let requestBody: BodyInit | undefined

  if (isFormData) {
    requestBody = options.body as FormData
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(options.body)
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method: options.method ?? 'GET',
    headers,
    body: requestBody,
  })

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' && payload.message.trim().length > 0
        ? payload.message
        : `Permintaan gagal (${response.status})`

    if (response.status === 401 && !options.skipAuthRedirect && Boolean(token)) {
      useAuthStore.getState().logout()
      toast.error('Sesi telah berakhir, silakan masuk kembali.', { id: 'session-expired' })
    }

    throw new ApiError(message, response.status)
  }

  return payload as T
}

/**
 * Mengonversi string Data URL berbasis Base64 menjadi objek `File` browser agar dapat dikirim melalui `FormData`.
 *
 * @param dataUrl - String Data URL base64 gambar (misal: 'data:image/jpeg;base64,...')
 * @param fallbackBaseName - Nama dasar berkas jika nama asli tidak tersedia
 * @returns {File} Objek File yang siap dilampirkan ke FormData
 * @throws {Error} Jika format Data URL tidak valid
 */
export function dataUrlToFile(dataUrl: string, fallbackBaseName: string): File {
  const commaIndex = dataUrl.indexOf(',')
  if (!dataUrl.startsWith('data:') || commaIndex === -1) {
    throw new Error('Format file gambar tidak valid')
  }

  const header = dataUrl.slice(5, commaIndex)
  const mimeType = (header.split(';')[0] || 'image/jpeg').trim()
  const base64 = dataUrl.slice(commaIndex + 1)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  const extension = MIME_TO_EXTENSION[mimeType] ?? 'jpg'
  return new File([bytes], `${fallbackBaseName}.${extension}`, { type: mimeType })
}

/**
 * Melampirkan array berkas (berupa instans `File` atau Data URL Base64) ke dalam objek `FormData` pada field `'photos'`.
 *
 * @param formData - Objek target FormData
 * @param photos - Array berkas File atau string Data URL gambar
 * @param prefix - Awalan penamaan berkas fallback untuk string Data URL
 */
export function appendPhotoFiles(
  formData: FormData,
  photos: (File | string)[],
  prefix: string,
): void {
  photos.forEach((item, index) => {
    if (typeof File !== 'undefined' && item instanceof File) {
      formData.append('photos', item, item.name)
    } else if (typeof item === 'string') {
      const file = dataUrlToFile(item, `${prefix}-${index + 1}`)
      formData.append('photos', file, file.name)
    }
  })
}
