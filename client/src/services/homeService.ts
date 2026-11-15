import type { Album, Video } from '../types'
import { apiRequest, appendPhotoFiles } from './api'

/**
 * Mengambil data agregat untuk halaman beranda: album-album kegiatan dan video unggulan (`GET /api/home`).
 *
 * @returns {Promise<{ albums: Album[]; video: Video | null }>} Data album dan video aktif
 */
export function getHomeData(): Promise<{ albums: Album[]; video: Video | null }> {
  return apiRequest<{ albums: Album[]; video: Video | null }>('/home', {
    includeAuth: false,
    skipAuthRedirect: true,
  })
}

/**
 * Mengambil daftar seluruh album kegiatan masyarakat untuk galeri publik (`GET /api/albums`).
 *
 * @returns {Promise<{ albums: Album[] }>} Daftar album kegiatan beserta foto-fotonya
 */
export function getAlbums(): Promise<{ albums: Album[] }> {
  return apiRequest<{ albums: Album[] }>('/albums', {
    includeAuth: false,
    skipAuthRedirect: true,
  })
}

/**
 * Mengunggah dan membuat album kegiatan baru di panel admin (`POST /api/admin/albums`).
 *
 * @param input - Judul album dan array berkas foto (1 sampai 50 foto)
 * @returns {Promise<{ album: Album }>} Data album yang berhasil dibuat
 */
export function createAlbum(input: {
  title: string
  photos?: (File | string)[]
  photoUrls?: (File | string)[]
}): Promise<{ album: Album }> {
  const formData = new FormData()
  formData.append('title', input.title)
  appendPhotoFiles(formData, input.photos ?? input.photoUrls ?? [], 'album-photo')

  return apiRequest<{ album: Album }>('/admin/albums', {
    method: 'POST',
    body: formData,
  })
}

/**
 * Memperbarui data album kegiatan: judul, susunan urutan foto, dan berkas foto baru (`PUT /api/admin/albums/:id`).
 *
 * @param albumId - ID unik album yang diperbarui
 * @param input - Judul baru, susunan urutan token foto, dan berkas foto baru opsional
 * @returns {Promise<{ message: string; album: Album }>} Pesan status dan data album terupdate
 */
export function updateAlbum(
  albumId: number,
  input: {
    title: string
    photoOrder?: string[]
    photos?: (File | string)[]
  },
): Promise<{ message: string; album: Album }> {
  const formData = new FormData()
  formData.append('title', input.title)
  if (input.photoOrder) {
    formData.append('photo_order', JSON.stringify(input.photoOrder))
  }
  if (input.photos && input.photos.length > 0) {
    appendPhotoFiles(formData, input.photos, 'album-photo')
  }

  return apiRequest<{ message: string; album: Album }>(`/admin/albums/${albumId}`, {
    method: 'PUT',
    body: formData,
  })
}

/**
 * Menambahkan foto-foto baru ke album yang sudah ada (`POST /api/admin/albums/:id/photos`).
 *
 * @param albumId - ID unik album target
 * @param photos - Array berkas foto tambahan yang hendak diunggah
 * @returns {Promise<{ message: string; album: Album }>} Pesan status dan data album terupdate
 */
export function addPhotosToAlbum(
  albumId: number,
  photos: (File | string)[],
): Promise<{ message: string; album: Album }> {
  const formData = new FormData()
  appendPhotoFiles(formData, photos, 'album-photo')

  return apiRequest<{ message: string; album: Album }>(`/admin/albums/${albumId}/photos`, {
    method: 'POST',
    body: formData,
  })
}

/**
 * Menghapus album kegiatan beserta seluruh foto terkait (`DELETE /api/admin/albums/:id`).
 *
 * @param id - ID integer album yang hendak dihapus
 * @returns {Promise<{ message: string }>} Pesan konfirmasi penghapusan
 */
export function deleteAlbum(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/admin/albums/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Menyimpan atau mengganti video profil YouTube unggulan (`POST /api/admin/videos`).
 *
 * @param input - Judul dan URL video YouTube
 * @returns {Promise<{ message: string; video: Video }>} Pesan status dan data video tersimpan
 */
export function saveVideo(input: {
  title: string
  youtube_url: string
}): Promise<{ message: string; video: Video }> {
  return apiRequest<{ message: string; video: Video }>('/admin/videos', {
    method: 'POST',
    body: input,
  })
}

/**
 * Menghapus video profil YouTube unggulan berdasarkan ID (`DELETE /api/admin/videos/:id`).
 *
 * @param id - ID unik video yang hendak dihapus
 * @returns {Promise<{ message: string }>} Pesan konfirmasi penghapusan
 */
export function deleteVideo(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/admin/videos/${id}`, {
    method: 'DELETE',
  })
}
