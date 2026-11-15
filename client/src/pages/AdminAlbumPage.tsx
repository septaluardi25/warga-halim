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
      toast.success(`Album "${album.title}" berhasil dihapus.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus album.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link to="/admin" className="inline-flex text-sm font-semibold text-sky-primary hover:text-sky-dark">
          ← Kembali ke Kelola Warga
        </Link>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Kelola Album Foto</h1>
        <p className="text-sm text-muted">
          Buat album kenangan bersama (1–20 foto) atau hapus album yang sudah ada.
        </p>
      </div>

      <AdminNav />

      <Card>
        <AlbumCreateForm />
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink">Daftar Album ({albums.length})</h2>

        {isLoading ? (
          <Spinner label="Memuat daftar album..." />
        ) : isError ? (
          <EmptyState
            variant="error"
            title="Gagal memuat album"
            description={error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat album.'}
            actionLabel="Coba Lagi"
            onAction={() => void refetch()}
          />
        ) : albums.length === 0 ? (
          <EmptyState
            title="Belum ada album foto"
            description="Tambahkan album baru di atas agar tampil pada slideshow beranda dan halaman galeri."
          />
        ) : (
          <div className="space-y-4">
            {albums.map((album) => (
              <Card key={album.id} className="space-y-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-bold text-ink">{album.title}</h3>
                    <p className="text-xs text-muted">
                      {album.photos.length} foto · Dibuat pada {formatDate(album.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ConfirmDeleteActions
                      isConfirming={confirmDeleteId === album.id}
                      label="Hapus Album"
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
                      alt={`${album.title} - Foto ${index + 1}`}
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
