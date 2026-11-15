import type { Album, Video } from '../types/models.js'
import {
  addPhotosToAlbum,
  createAlbum,
  deleteAlbum,
  listAlbums,
  updateAlbum,
} from './albumService.js'
import { deleteVideo, getActiveVideo, saveVideo } from './videoService.js'

export {
  addPhotosToAlbum,
  createAlbum,
  deleteAlbum,
  deleteVideo,
  getActiveVideo,
  listAlbums,
  saveVideo,
  updateAlbum,
}

/**
 * Mengambil data agregasi untuk tampilan halaman beranda.
 * Menggabungkan daftar seluruh album galeri dan satu video YouTube unggulan secara paralel menggunakan `Promise.all`.
 *
 * @returns {Promise<{ albums: Album[]; video: Video | null }>} Objek berisi array album dan data video aktif
 */
export async function getHomeData(): Promise<{
  albums: Album[]
  video: Video | null
}> {
  const [albums, video] = await Promise.all([listAlbums(), getActiveVideo()])
  return { albums, video }
}
