import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import AlbumCard from '../features/galeri/AlbumCard'
import { useAlbumsQuery } from '../features/galeri/useAlbums'

function GalleryPage() {
  const { data, isLoading, isError, error, refetch } = useAlbumsQuery()
  const albums = data?.albums ?? []

  return (
    <div className="space-y-6">
      <Card padding="md">
        <h1 className="text-2xl font-bold text-sky-primary">Memory Photo Gallery</h1>
        <p className="mt-1 text-sm text-muted">
          A shared collection of group albums and memories open to all visitors without signing in.
        </p>
      </Card>

      {isLoading ? (
        <Spinner label="Loading photo albums..." />
      ) : isError ? (
        <EmptyState
          variant="error"
          title="Failed to load gallery"
          description={error instanceof Error ? error.message : 'An error occurred while loading albums.'}
          actionLabel="Try Again"
          onAction={() => void refetch()}
        />
      ) : albums.length === 0 ? (
        <EmptyState
          title="No albums yet"
          description="Shared photo albums are not available yet. Please check back later."
        />
      ) : (
        <div className="space-y-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  )
}

export default GalleryPage
