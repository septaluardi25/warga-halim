import { useCallback, useEffect, useState } from 'react'
import type { Photo } from '../../types'

interface PhotoLightboxModalProps {
  photos: Photo[]
  initialIndex: number
  albumTitle: string
  onClose: () => void
}

/**
 * Komponen modal dialog lightbox untuk menampilkan foto dalam ukuran besar.
 * Mendukung navigasi sebelumnya/berikutnya, tombol pintasan keyboard (Escape, panah kiri/kanan),
 * penguncian gulir latar belakang (body overflow), dan pratinjau thumbnail strip.
 *
 * @param props.photos - Array foto dalam album
 * @param props.initialIndex - Indeks foto awal yang diklik oleh pengguna
 * @param props.albumTitle - Judul album foto
 * @param props.onClose - Callback saat modal ditutup
 */
function PhotoLightboxModal({
  photos,
  initialIndex,
  albumTitle,
  onClose,
}: PhotoLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 && initialIndex < photos.length ? initialIndex : 0,
  )

  const currentPhoto = photos[currentIndex]

  /**
   * Berpindah ke foto sebelumnya dengan perputaran sirkular.
   */
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  /**
   * Berpindah ke foto berikutnya dengan perputaran sirkular.
   */
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }, [photos.length])

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft' && photos.length > 1) {
        handlePrev()
      } else if (event.key === 'ArrowRight' && photos.length > 1) {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, handlePrev, handleNext, photos.length])

  if (!currentPhoto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau foto diperbesar dari album ${albumTitle}`}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/90 p-4 backdrop-blur-xs sm:p-6"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-white sm:text-base">{albumTitle}</h3>
          <p className="text-xs text-white/70">
            Foto {currentIndex + 1} dari {photos.length}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup tampilan perbesar foto"
          className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Image Container with Prev / Next Navigation */}
      <div
        className="relative flex flex-1 items-center justify-center py-2"
        onClick={(e) => e.stopPropagation()}
      >
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Foto sebelumnya"
            className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white/90 shadow-lg backdrop-blur-xs transition-colors hover:bg-black/90 hover:text-white sm:left-4"
          >
            ←
          </button>
        )}

        <img
          key={currentPhoto.id}
          src={currentPhoto.photo_url}
          alt={`${albumTitle} - foto ${currentIndex + 1}`}
          className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl sm:max-h-[78vh]"
        />

        {photos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Foto berikutnya"
            className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white/90 shadow-lg backdrop-blur-xs transition-colors hover:bg-black/90 hover:text-white sm:right-4"
          >
            →
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {photos.length > 1 && (
        <div
          className="flex justify-center overflow-x-auto py-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex max-w-full gap-2 px-2">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Buka foto ke-${idx + 1}`}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border transition-all ${
                  idx === currentIndex
                    ? 'border-sky-primary ring-2 ring-sky-primary scale-105 opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={photo.photo_url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoLightboxModal
