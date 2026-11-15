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
        <h1 className="text-2xl font-bold text-sky-primary">Galeri Foto Kenangan</h1>
        <p className="mt-1 text-sm text-muted">
          Koleksi album foto kenangan bersama yang dapat diakses oleh seluruh pengunjung tanpa perlu login.
        </p>
      </Card>

      {isLoading ? (
        <Spinner label="Memuat album foto..." />
      ) : isError ? (
        <EmptyState
          variant="error"
          title="Gagal memuat galeri"
          description={error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat album.'}
          actionLabel="Coba Lagi"
          onAction={() => void refetch()}
        />
      ) : albums.length === 0 ? (
        <EmptyState
          title="Belum ada album foto"
          description="Album foto kenangan belum tersedia saat ini. Silakan kunjungi kembali nanti."
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
