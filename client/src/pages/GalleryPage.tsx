import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import AlbumCard from '../features/galeri/AlbumCard'
import { useAlbumsQuery } from '../features/galeri/useAlbums'

function GalleryPage() {
  const { data, isLoading, isError, error, refetch } = useAlbumsQuery()
  const albums = data?.albums ?? []
  const totalPhotos = albums.reduce((acc, a) => acc + (a.photos?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted">
        <Link to="/" className="flex items-center gap-1 transition-colors hover:text-sky-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Beranda</span>
        </Link>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <span className="font-semibold text-sky-primary">Galeri Kenangan</span>
      </nav>

      {/* Hero Header & Bento Stats */}
      <Card padding="none" className="overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-soft px-3 py-1 text-xs font-bold tracking-wider text-sky-primary uppercase">
              <span className="h-2 w-2 rounded-full bg-sky-primary animate-pulse" />
              <span>Arsip Digital Alumni</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Galeri &amp; Arsip Kenangan Bersama
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Ruang kilas balik momen berharga, perayaan pencapaian, lembur santai, dan kebersamaan seluruh
              insan Warga Halim. Terbuka untuk umum sebagai jejak sejarah persaudaraan.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-sky-border bg-sky-soft/40 p-5 lg:col-span-4">
            <span className="text-xs font-bold tracking-wider text-sky-primary uppercase">
              Statistik Koleksi Galeri
            </span>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-sky-primary">{albums.length}</span>
                <span className="text-xs text-muted">Album</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-sky-primary">{totalPhotos}</span>
                <span className="text-xs text-muted">Foto Arsip</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sky-primary">2018–2026</span>
                <span className="text-xs text-muted">Periode</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-sky-border/60 pt-3 text-[11px] text-muted">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Terverifikasi Kurator
              </span>
              <span className="font-medium text-sky-primary">Halim Digital Archive</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Album List Content */}
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
