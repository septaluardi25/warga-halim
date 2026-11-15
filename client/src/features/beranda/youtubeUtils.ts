const ALLOWED_YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
])

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{6,20}$/

export function getYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim())
    const host = parsed.hostname.toLowerCase()
    if (!ALLOWED_YOUTUBE_HOSTS.has(host)) return null

    let videoId = ''
    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? ''
    } else if (parsed.pathname === '/watch') {
      videoId = parsed.searchParams.get('v') ?? ''
    } else if (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/')) {
      videoId = parsed.pathname.split('/').filter(Boolean)[1] ?? ''
    }

    if (!VIDEO_ID_REGEX.test(videoId)) return null
    return `https://www.youtube-nocookie.com/embed/${videoId}`
  } catch {
    return null
  }
}
