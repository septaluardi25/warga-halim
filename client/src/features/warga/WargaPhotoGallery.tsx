import { useState } from 'react'
import type { Photo } from '../../types'

interface WargaPhotoGalleryProps {
  photos: Photo[]
  fullName: string
}

function WargaPhotoGallery({ photos, fullName }: WargaPhotoGalleryProps) {
  const sortedPhotos = [...photos].sort((a, b) => a.sort_order - b.sort_order)
  const [activeIndex, setActiveIndex] = useState(0)

  if (sortedPhotos.length === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-2xl border border-sky-border bg-sky-soft text-sm text-muted">
        No photos available
      </div>
    )
  }

  const safeIndex = activeIndex < sortedPhotos.length ? activeIndex : 0
  const activePhoto = sortedPhotos[safeIndex]

  const handleNextPhoto = () => {
    setActiveIndex((prev) => (prev + 1) % sortedPhotos.length)
  }

  return (
    <button
      type="button"
      onClick={handleNextPhoto}
      aria-label="Click photo to view next photo"
      className="group relative block w-full overflow-hidden rounded-2xl border border-sky-border bg-sky-soft text-left shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-primary"
    >
      <img
        src={activePhoto.photo_url}
        alt={`${fullName} - photo ${safeIndex + 1}`}
        className="aspect-4/3 w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
      />
      <span className="absolute right-3 bottom-3 left-3 rounded-full bg-ink/75 px-3.5 py-1.5 text-center text-xs font-semibold text-white backdrop-blur-xs sm:left-auto sm:text-left">
        Photo {safeIndex + 1} of {sortedPhotos.length} · Click photo for next
      </span>
    </button>
  )
}

export default WargaPhotoGallery
