import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import AlbumCreateForm from '../features/galeri/AlbumCreateForm'
import { useAlbumsQuery, useDeleteAlbumMutation } from '../features/galeri/useAlbums'
import AdminNav from '../features/warga/AdminNav'
import ConfirmDeleteActions from '../features/warga/ConfirmDeleteActions'
import type { Album } from '../types'
import { formatDate } from '../utils/formatDate'

function AdminAlbumPage() {
  const { data, isLoading, isError, error, refetch } = useAlbumsQuery()
  const deleteMutation = useDeleteAlbumMutation()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const albums = data?.albums ?? []

  const handleDeleteAlbum = async (album: Album) => {
    try {
      await deleteMutation.mutateAsync(album.id)
      setConfirmDeleteId(null)
      toast.success(`Album "${album.title}" deleted successfully.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete album.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link to="/admin" className="inline-flex text-sm font-semibold text-sky-primary hover:text-sky-dark">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Manage Photo Albums</h1>
        <p className="text-sm text-muted">
          Create a shared memory album (1–20 photos) or remove an existing album.
        </p>
      </div>

      <AdminNav />

      <Card>
        <AlbumCreateForm />
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Album List ({albums.length})</h2>

        {isLoading ? (
          <Spinner label="Loading albums..." />
        ) : isError ? (
          <EmptyState
            variant="error"
            title="Failed to load albums"
            description={error instanceof Error ? error.message : 'An error occurred while loading albums.'}
            actionLabel="Try Again"
            onAction={() => void refetch()}
          />
        ) : albums.length === 0 ? (
          <EmptyState
            title="No albums yet"
            description="Create a new album above to display it on the Home slideshow and Gallery."
          />
        ) : (
          <div className="space-y-4">
            {albums.map((album) => (
              <Card key={album.id} className="space-y-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-bold text-ink">{album.title}</h3>
                    <p className="text-xs text-muted">
                      {album.photos.length} photo(s) · Created {formatDate(album.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ConfirmDeleteActions
                      isConfirming={confirmDeleteId === album.id}
                      label="Delete Album"
                      onRequestDelete={() => setConfirmDeleteId(album.id)}
                      onConfirmDelete={() => void handleDeleteAlbum(album)}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {album.photos.map((photo, index) => (
                    <img
                      key={photo.id}
                      src={photo.photo_url}
                      alt={`${album.title} - Photo ${index + 1}`}
                      loading="lazy"
                      className="aspect-4/3 w-full rounded-lg border border-sky-border object-cover"
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminAlbumPage
