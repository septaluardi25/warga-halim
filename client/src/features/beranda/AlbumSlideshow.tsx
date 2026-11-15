import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import type { Album } from '../../types'

interface AlbumSlideshowProps {
  albums: Album[]
}

interface SlideItem {
  id: number
  albumTitle: string
  photoUrl: string
  sortOrder: number
}

function flattenAlbumSlides(albums: Album[]): SlideItem[] {
  return albums.flatMap((album) =>
    [...album.photos]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((photo) => ({
        id: photo.id,
        albumTitle: album.title,
        photoUrl: photo.photo_url,
        sortOrder: photo.sort_order,
      })),
  )
}

function AlbumSlideshow({ albums }: AlbumSlideshowProps) {
  const slides = flattenAlbumSlides(albums)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [plugins] = useState(() => [
    Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false }),
  ])

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 }, plugins)

  useEffect(() => {
    if (!emblaApi) return

    const handleSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    handleSelect()
    emblaApi.on('select', handleSelect)
    return () => {
      emblaApi.off('select', handleSelect)
    }
  }, [emblaApi])

  if (slides.length === 0) {
    return (
      <EmptyState
        title="Belum ada foto album"
        description="Foto kenangan akan tampil di slideshow ini setelah diunggah oleh pengurus."
      />
    )
  }

  const activeSlide = slides[selectedIndex] ?? slides[0]

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-sky-primary">Slideshow Album Kenangan</h2>
          <p className="text-sm text-muted">
            Foto berganti otomatis setiap 5 detik dan berhenti sementara saat disentuh atau diarahkan kursor.
          </p>
        </div>
        <span className="rounded-full bg-sky-light px-3 py-1 text-xs font-semibold text-sky-dark">
          {selectedIndex + 1} / {slides.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-sky-border bg-sky-soft" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
              <img
                src={slide.photoUrl}
                alt={`${slide.albumTitle} - foto ${slide.sortOrder}`}
                className="aspect-video w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-base font-semibold text-ink">{activeSlide.albumTitle}</p>
        {slides.length > 1 && (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Foto sebelumnya"
            >
              Sebelumnya
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Foto berikutnya"
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default AlbumSlideshow
