import type { WargaDetail, WargaListItem } from '../types'
import { apiRequest, appendPhotoFiles } from './api'

export interface CreateWargaInput {
  full_name: string
  position: string
  contact: string | null
  message_impression: string | null
  photoUrls: string[]
}

export interface UpdateWargaInput {
  full_name: string
  position: string
  contact: string | null
  message_impression: string | null
  photo_order: string[]
  newPhotoUrls: string[]
}

function buildWargaFormData(fields: {
  full_name: string
  position: string
  contact: string | null
  message_impression: string | null
}): FormData {
  const formData = new FormData()
  formData.append('full_name', fields.full_name)
  formData.append('position', fields.position)
  formData.append('contact', fields.contact ?? '')
  formData.append('message_impression', fields.message_impression ?? '')
  return formData
}

/** Fetch all member profiles, optionally filtered by `search` (`GET /api/warga`). */
export function getWargaList(search = ''): Promise<{ warga: WargaListItem[] }> {
  const trimmed = search.trim()
  const query = trimmed.length > 0 ? `?search=${encodeURIComponent(trimmed)}` : ''
  return apiRequest<{ warga: WargaListItem[] }>(`/warga${query}`)
}

/** Fetch a single member profile detail with ordered photos (`GET /api/warga/:id`). */
export function getWargaById(id: number): Promise<{ warga: WargaDetail }> {
  return apiRequest<{ warga: WargaDetail }>(`/warga/${id}`)
}

/** Create a new member profile with 3 to 10 uploaded photos (`POST /api/admin/warga`). */
export function createWarga(input: CreateWargaInput): Promise<{ warga: WargaDetail }> {
  const formData = buildWargaFormData(input)
  appendPhotoFiles(formData, input.photoUrls, 'warga-photo')

  return apiRequest<{ warga: WargaDetail }>('/admin/warga', {
    method: 'POST',
    body: formData,
  })
}

/** Update a member profile, photo ordering, and newly added photos (`PUT /api/admin/warga/:id`). */
export function updateWarga(
  id: number,
  input: UpdateWargaInput,
): Promise<{ warga: WargaDetail }> {
  const formData = buildWargaFormData(input)
  formData.append('photo_order', JSON.stringify(input.photo_order))
  appendPhotoFiles(formData, input.newPhotoUrls, 'warga-photo')

  return apiRequest<{ warga: WargaDetail }>(`/admin/warga/${id}`, {
    method: 'PUT',
    body: formData,
  })
}

/** Delete a member profile and its Cloudinary photos (`DELETE /api/admin/warga/:id`). */
export function deleteWarga(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/admin/warga/${id}`, {
    method: 'DELETE',
  })
}
