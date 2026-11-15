import type { Album, Video } from '../types'

const ALBUMS_STORAGE_KEY = 'warga-halim-mock-albums-v2'
const VIDEO_STORAGE_KEY = 'warga-halim-mock-video-v2'

function createMockPhotoUrl(title: string, subtitle: string, accentHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#f0f9ff"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#bg)"/>
    <circle cx="1050" cy="120" r="140" fill="${accentHex}" opacity="0.14"/>
    <circle cx="160" cy="560" r="180" fill="#005A9C" opacity="0.12"/>
    <rect x="80" y="90" width="1040" height="495" rx="28" fill="#ffffff" stroke="#bae6fd" stroke-width="4"/>
    <text x="600" y="315" text-anchor="middle" font-family="sans-serif" font-size="44" font-weight="700" fill="#005A9C">${title}</text>
    <text x="600" y="375" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#475569">${subtitle}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const DEFAULT_ALBUMS: Album[] = [
  {
    id: 1,
    title: 'Annual Bandung Outing 2019',
    created_at: '2026-11-10T08:00:00.000Z',
    photos: [
      {
        id: 101,
        photo_url: createMockPhotoUrl('Bandung Outing 2019', 'Group Photo in Lembang', '#0284c7'),
        sort_order: 1,
      },
      {
        id: 102,
        photo_url: createMockPhotoUrl('Bandung Outing 2019', 'Team Dinner & Sharing', '#dc2626'),
        sort_order: 2,
      },
      {
        id: 103,
        photo_url: createMockPhotoUrl('Bandung Outing 2019', 'Morning Team Building', '#0284c7'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 2,
    title: '10th Office Anniversary Celebration',
    created_at: '2026-11-11T09:30:00.000Z',
    photos: [
      {
        id: 201,
        photo_url: createMockPhotoUrl('10th Anniversary', 'Celebration with Leadership', '#dc2626'),
        sort_order: 1,
      },
      {
        id: 202,
        photo_url: createMockPhotoUrl('10th Anniversary', 'Service Award Ceremony', '#0284c7'),
        sort_order: 2,
      },
      {
        id: 203,
        photo_url: createMockPhotoUrl('10th Anniversary', 'All-Division Group Portrait', '#dc2626'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 3,
    title: 'Iftar & Farewell Gathering 2024',
    created_at: '2026-11-12T17:15:00.000Z',
    photos: [
      {
        id: 301,
        photo_url: createMockPhotoUrl('Iftar & Farewell', 'Last Gathering Under One Roof', '#0284c7'),
        sort_order: 1,
      },
      {
        id: 302,
        photo_url: createMockPhotoUrl('Iftar & Farewell', 'Keepsake Gift Exchange', '#dc2626'),
        sort_order: 2,
      },
      {
        id: 303,
        photo_url: createMockPhotoUrl('Iftar & Farewell', 'Warm Wishes for Next Chapter', '#0284c7'),
        sort_order: 3,
      },
    ],
  },
]

const DEFAULT_VIDEO: Video = {
  id: 1,
  title: 'Warga Halim Journey Documentary',
  youtube_url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
  created_at: '2026-11-12T10:00:00.000Z',
}

function saveMockAlbums(albums: Album[]): void {
  try {
    localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(albums))
  } catch {
    throw new Error(
      'Penyimpanan browser penuh. Harap gunakan file gambar yang lebih kecil.',
    )
  }
}

export function getMockAlbums(): Album[] {
  try {
    const raw = localStorage.getItem(ALBUMS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(DEFAULT_ALBUMS))
      return [...DEFAULT_ALBUMS]
    }
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as Album[]
    }
  } catch {
    // Fall back to default albums if storage parsing fails
  }
  localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(DEFAULT_ALBUMS))
  return [...DEFAULT_ALBUMS]
}

export function createMockAlbum(input: { title: string; photoUrls: string[] }): Album {
  if (input.photoUrls.length < 1 || input.photoUrls.length > 20) {
    throw new Error('Foto album harus berjumlah antara 1 sampai 20 foto')
  }

  const albums = getMockAlbums()
  const nextAlbumId = albums.reduce((maxId, album) => Math.max(maxId, album.id), 0) + 1
  const maxPhotoId = albums.reduce(
    (maxId, album) => Math.max(maxId, ...album.photos.map((photo) => photo.id)),
    0,
  )

  const created: Album = {
    id: nextAlbumId,
    title: input.title.trim(),
    created_at: new Date().toISOString(),
    photos: input.photoUrls.map((url, index) => ({
      id: maxPhotoId + index + 1,
      photo_url: url,
      sort_order: index + 1,
    })),
  }

  saveMockAlbums([created, ...albums])
  return created
}

export function deleteMockAlbum(id: number): void {
  const albums = getMockAlbums()
  if (!albums.some((album) => album.id === id)) {
    throw new Error('Album tidak ditemukan')
  }
  saveMockAlbums(albums.filter((album) => album.id !== id))
}

export function getMockVideo(): Video | null {
  try {
    const raw = localStorage.getItem(VIDEO_STORAGE_KEY)
    if (raw === null) {
      localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(DEFAULT_VIDEO))
      return DEFAULT_VIDEO
    }
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null) return null
    if (typeof parsed === 'object' && 'youtube_url' in parsed) {
      return parsed as Video
    }
  } catch {
    // Fall back to default video if storage parsing fails
  }
  localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(DEFAULT_VIDEO))
  return DEFAULT_VIDEO
}

export function saveMockVideo(input: { title: string; youtube_url: string }): Video {
  const current = getMockVideo()
  const nextVideo: Video = {
    id: (current?.id ?? 0) + 1,
    title: input.title.trim(),
    youtube_url: input.youtube_url.trim(),
    created_at: new Date().toISOString(),
  }
  localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(nextVideo))
  return nextVideo
}

export function deleteMockVideo(id: number): void {
  const current = getMockVideo()
  if (!current || current.id !== id) {
    throw new Error('Video tidak ditemukan')
  }
  localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(null))
}

export function getMockHomeData(): { albums: Album[]; video: Video | null } {
  return {
    albums: getMockAlbums(),
    video: getMockVideo(),
  }
}
