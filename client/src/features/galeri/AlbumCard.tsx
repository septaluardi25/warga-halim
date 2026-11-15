import { useState } from 'react'
import Card from '../../components/ui/Card'
import type { Album } from '../../types'
import PhotoLightboxModal from './PhotoLightboxModal'

interface AlbumCardProps {
  album: Album
}

/**
 * Komponen kartu presentasi album kegiatan pada galeri publik.
 * Menampilkan judul album, badge total foto, grid foto responsif dengan efek zoom saat hover,
 * serta integrasi dengan modal lightbox ketika foto diklik untuk memperbesar gambar.
 *
 * @param props.album - Objek data album kegiatan beserta array foto-fotonya
 */
function AlbumCard({ album }: AlbumCardProps) {
  const sortedPhotos = [...album.photos].sort((a, b) => a.sort_order - b.sort_order)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sortedPhotos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-xl border border-sky-border bg-sky-soft text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-primary"
              aria-label={`Perbesar foto ${photo.sort_order} dari album ${album.title}`}
            >
              <img
                src={photo.photo_url}
                alt={`${album.title} - foto ${photo.sort_order}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-xs">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                    />
                  </svg>
                  Perbesar Foto
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <PhotoLightboxModal
          photos={sortedPhotos}
          initialIndex={lightboxIndex}
          albumTitle={album.title}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </Card>
  )
}

export default AlbumCard
