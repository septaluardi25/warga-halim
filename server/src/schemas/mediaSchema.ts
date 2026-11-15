import { z } from 'zod'

const ALLOWED_YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
])

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{6,20}$/

/** Extract and validate a YouTube video ID from standard, short, embed, or shorts URLs. */
export function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim())
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null
    }

    const host = parsed.hostname.toLowerCase()
    if (!ALLOWED_YOUTUBE_HOSTS.has(host)) {
      return null
    }

    let videoId = ''
    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? ''
    } else if (parsed.pathname === '/watch') {
      videoId = parsed.searchParams.get('v') ?? ''
    } else if (
      parsed.pathname.startsWith('/embed/') ||
      parsed.pathname.startsWith('/shorts/')
    ) {
      videoId = parsed.pathname.split('/').filter(Boolean)[1] ?? ''
    }

    return VIDEO_ID_REGEX.test(videoId) ? videoId : null
  } catch {
    return null
  }
}

export const createAlbumSchema = z.object({
  title: z
    .string({ error: 'Judul album wajib diisi' })
    .trim()
    .min(1, 'Judul album wajib diisi')
    .max(100, 'Judul album maksimal 100 karakter'),
})

export const updateAlbumSchema = z.object({
  title: z
    .string({ error: 'Judul album wajib diisi' })
    .trim()
    .min(1, 'Judul album wajib diisi')
    .max(100, 'Judul album maksimal 100 karakter'),
})

const albumPhotoOrderArraySchema = z
  .array(
    z
      .string()
      .trim()
      .regex(/^(existing|new):\d+$/, 'Format item photo_order tidak valid'),
  )
  .min(1, 'Foto album harus berjumlah antara 1 sampai 50 foto')
  .max(50, 'Foto album harus berjumlah antara 1 sampai 50 foto')
  .refine(
    (items) => new Set(items).size === items.length,
    'Terdapat duplikasi item pada photo_order',
  )

/**
 * Parse `photo_order` for albums from multipart body or JSON string.
 * Normalizes numeric IDs to `existing:<id>`.
 */
export function parseAlbumPhotoOrder(raw: unknown): string[] | undefined {
  if (raw === undefined || raw === null || raw === '') {
    return undefined
  }
  let parsedValue: unknown = raw
  if (typeof raw === 'string') {
    try {
      parsedValue = JSON.parse(raw)
    } catch {
      throw new Error('Format JSON photo_order tidak valid')
    }
  }
  if (Array.isArray(parsedValue)) {
    parsedValue = parsedValue.map((item) => {
      if (typeof item === 'number') {
        return `existing:${item}`
      }
      return item
    })
  }
  const result = albumPhotoOrderArraySchema.safeParse(parsedValue)
  if (!result.success) {
    throw new Error(
      result.error.issues[0]?.message ?? 'Format photo_order tidak valid',
    )
  }
  return result.data
}

export const saveVideoSchema = z.object({
  title: z
    .string({ error: 'Judul video wajib diisi' })
    .trim()
    .min(1, 'Judul video wajib diisi')
    .max(100, 'Judul video maksimal 100 karakter'),
  youtube_url: z
    .string({ error: 'URL YouTube wajib diisi' })
    .trim()
    .min(1, 'URL YouTube wajib diisi')
    .max(255, 'URL YouTube maksimal 255 karakter')
    .pipe(z.url('Format URL YouTube tidak valid'))
    .refine(
      (val) => extractYouTubeVideoId(val) !== null,
      'URL harus berupa tautan video YouTube yang valid (youtube.com atau youtu.be)',
    ),
})

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>
export type SaveVideoInput = z.infer<typeof saveVideoSchema>
