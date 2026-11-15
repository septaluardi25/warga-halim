import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api'
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '')

export class ApiError extends Error {
  status: number

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

/** Perform an HTTP JSON or FormData request against the backend API. */
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
        : `Request failed (${response.status})`

    if (response.status === 401 && !options.skipAuthRedirect && Boolean(token)) {
      useAuthStore.getState().logout()
      toast.error('Session expired, please sign in again.', { id: 'session-expired' })
    }

    throw new ApiError(message, response.status)
  }

  return payload as T
}

/** Convert a base64 image Data URL into a browser `File` instance for `FormData` uploads. */
export function dataUrlToFile(dataUrl: string, fallbackBaseName: string): File {
  const commaIndex = dataUrl.indexOf(',')
  if (!dataUrl.startsWith('data:') || commaIndex === -1) {
    throw new Error('Invalid image file format')
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

/** Append an array of Data URLs to a `FormData` object under the `'photos'` field. */
export function appendPhotoFiles(formData: FormData, photoUrls: string[], prefix: string): void {
  photoUrls.forEach((url, index) => {
    const file = dataUrlToFile(url, `${prefix}-${index + 1}`)
    formData.append('photos', file)
  })
}
