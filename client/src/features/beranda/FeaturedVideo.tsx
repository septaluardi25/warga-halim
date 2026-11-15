import Card from '../../components/ui/Card'
import type { Video } from '../../types'
import { getYouTubeEmbedUrl } from './youtubeUtils'

interface FeaturedVideoProps {
  video: Video | null
}

function FeaturedVideo({ video }: FeaturedVideoProps) {
  if (!video) return null

  const embedUrl = getYouTubeEmbedUrl(video.youtube_url)
  if (!embedUrl) return null

  return (
    <Card padding="md" className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-sky-primary">Featured Documentary Video</h2>
        <p className="mt-1 text-base font-semibold text-ink">{video.title}</p>
      </div>
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-sky-border bg-sky-soft">
        <iframe
          src={embedUrl}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </Card>
  )
}

export default FeaturedVideo
