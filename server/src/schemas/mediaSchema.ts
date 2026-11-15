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
    .string({ error: 'Album title is required' })
    .trim()
    .min(1, 'Album title is required')
    .max(100, 'Album title must be at most 100 characters'),
})

export const saveVideoSchema = z.object({
  title: z
    .string({ error: 'Video title is required' })
    .trim()
    .min(1, 'Video title is required')
    .max(100, 'Video title must be at most 100 characters'),
  youtube_url: z
    .string({ error: 'YouTube URL is required' })
    .trim()
    .min(1, 'YouTube URL is required')
    .max(255, 'YouTube URL must be at most 255 characters')
    .pipe(z.url('Invalid YouTube URL'))
    .refine(
      (val) => extractYouTubeVideoId(val) !== null,
      'URL must be a valid YouTube video link (youtube.com or youtu.be)',
    ),
})

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>
export type SaveVideoInput = z.infer<typeof saveVideoSchema>
