import Card from '../../components/ui/Card'
import type { Album } from '../../types'

interface AlbumCardProps {
  album: Album
}

function AlbumCard({ album }: AlbumCardProps) {
  const sortedPhotos = [...album.photos].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-border pb-3">
        <h2 className="text-lg font-bold text-sky-primary">{album.title}</h2>
        <span className="rounded-full bg-sky-light px-3 py-1 text-xs font-semibold text-sky-dark">
          {sortedPhotos.length} foto
        </span>
      </div>

      {sortedPhotos.length === 0 ? (
        <p className="text-sm text-muted">Belum ada foto di album ini.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {sortedPhotos.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-xl border border-sky-border bg-sky-soft"
            >
              <img
                src={photo.photo_url}
                alt={`${album.title} - foto ${photo.sort_order}`}
                loading="lazy"
                className="aspect-video w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default AlbumCard
