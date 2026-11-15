import type { Album, Video } from '../types'
import { apiRequest, appendPhotoFiles } from './api'

/** Fetch latest albums and featured video for the homepage (`GET /api/home`). */
export function getHomeData(): Promise<{ albums: Album[]; video: Video | null }> {
  return apiRequest<{ albums: Album[]; video: Video | null }>('/home', {
    includeAuth: false,
    skipAuthRedirect: true,
  })
}

/** Fetch all public activity albums (`GET /api/albums`). */
export function getAlbums(): Promise<{ albums: Album[] }> {
  return apiRequest<{ albums: Album[] }>('/albums', {
    includeAuth: false,
    skipAuthRedirect: true,
  })
}

/** Upload and create a new activity album (`POST /api/admin/albums`). */
export function createAlbum(input: {
  title: string
  photoUrls: string[]
}): Promise<{ album: Album }> {
  const formData = new FormData()
  formData.append('title', input.title)
  appendPhotoFiles(formData, input.photoUrls, 'album-photo')

  return apiRequest<{ album: Album }>('/admin/albums', {
    method: 'POST',
    body: formData,
  })
}

/** Delete an activity album and its Cloudinary assets (`DELETE /api/admin/albums/:id`). */
export function deleteAlbum(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/admin/albums/${id}`, {
    method: 'DELETE',
  })
}

/** Create or replace the single featured YouTube video (`POST /api/admin/videos`). */
export function saveVideo(input: {
  title: string
  youtube_url: string
}): Promise<{ message: string; video: Video }> {
  return apiRequest<{ message: string; video: Video }>('/admin/videos', {
    method: 'POST',
    body: input,
  })
}

/** Delete the featured YouTube video by ID (`DELETE /api/admin/videos/:id`). */
export function deleteVideo(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/admin/videos/${id}`, {
    method: 'DELETE',
  })
}
