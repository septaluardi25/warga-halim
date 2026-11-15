import type { Album, Video } from '../types/models.js'
import { createAlbum, deleteAlbum, listAlbums } from './albumService.js'
import { deleteVideo, getActiveVideo, saveVideo } from './videoService.js'

export {
  createAlbum,
  deleteAlbum,
  deleteVideo,
  getActiveVideo,
  listAlbums,
  saveVideo,
}

/** Return home page data containing all albums and the optional single video. */
export async function getHomeData(): Promise<{
  albums: Album[]
  video: Video | null
}> {
  const [albums, video] = await Promise.all([listAlbums(), getActiveVideo()])
  return { albums, video }
}
