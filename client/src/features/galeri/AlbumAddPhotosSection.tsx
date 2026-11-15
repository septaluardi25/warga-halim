import { useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import type { Album } from '../../types'
import { validateImageFile } from '../warga/fileUtils'
import { useAddAlbumPhotosMutation } from './useAlbums'

interface AlbumAddPhotosSectionProps {
  album: Album
  onSuccess?: () => void
  onCancel?: () => void
}

const MAX_TOTAL_PHOTOS = 50

interface SelectedPhotoItem {
  id: string
  name: string
  url: string
  file: File
}

function AlbumAddPhotosSection({
  album,
  onSuccess,
  onCancel,
}: AlbumAddPhotosSectionProps) {
  const addMutation = useAddAlbumPhotosMutation()
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhotoItem[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)

  const currentCount = album.photos.length
  const remainingSlots = Math.max(0, MAX_TOTAL_PHOTOS - currentCount)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (fileList.length === 0) return

    const availableSlots = remainingSlots - selectedPhotos.length
    if (availableSlots <= 0) {
      const msg = `Maksimal 50 foto per album. Sisa slot untuk album ini: ${remainingSlots} foto.`
      setPhotoError(msg)
      toast.error(msg)
      return
    }

    const candidates = fileList.slice(0, availableSlots)
    const validationErrors: string[] =
      fileList.length > availableSlots
        ? [
            `Hanya ${availableSlots} foto yang dapat ditambahkan (batas maksimal ${MAX_TOTAL_PHOTOS} foto per album).`,
          ]
        : []

    const validFiles = candidates.filter((file) => {
      const err = validateImageFile(file)
      if (err) validationErrors.push(err)
      return !err
    })

    if (validFiles.length === 0) {
      const msg = validationErrors[0] ?? 'Tidak ada berkas gambar valid yang dipilih.'
      setPhotoError(msg)
      toast.error(msg)
      return
    }

    const added = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }))

    setSelectedPhotos((prev) => [...prev, ...added])
    setPhotoError(validationErrors[0] ?? null)
    if (validationErrors[0]) toast.error(validationErrors[0])
    toast.success(`${added.length} foto siap diunggah ke album "${album.title}".`)
  }

  const handleRemovePhoto = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const target = prev.find((item) => item.id === photoId)
      if (target?.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url)
      }
      return prev.filter((item) => item.id !== photoId)
    })
    setPhotoError(null)
  }

  const handleSubmit = async () => {
    if (selectedPhotos.length === 0) {
      const msg = 'Pilih minimal 1 foto untuk ditambahkan ke album.'
      setPhotoError(msg)
      toast.error(msg)
      return
    }

    try {
      await addMutation.mutateAsync({
        albumId: album.id,
        photos: selectedPhotos.map((p) => p.file),
      })

      selectedPhotos.forEach((p) => {
        if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url)
      })
      setSelectedPhotos([])
      setPhotoError(null)
      toast.success(
        `${selectedPhotos.length} foto berhasil ditambahkan ke album "${album.title}".`,
      )
      onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan foto ke album.'
      setPhotoError(msg)
      toast.error(msg)
    }
  }

  if (remainingSlots <= 0) {
    return (
      <div className="rounded-xl border border-sky-border bg-sky-soft/60 p-4 text-sm text-muted">
        <p className="font-semibold text-ink">Album Sudah Penuh</p>
        <p className="mt-1">
          Album ini sudah memiliki {currentCount} foto (batas maksimal {MAX_TOTAL_PHOTOS} foto per album).
        </p>
        {onCancel && (
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Tutup
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-sky-primary/30 bg-sky-soft/50 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-border/70 pb-3">
        <div>
          <h4 className="text-sm font-bold text-sky-primary">
            Tambah Foto ke Album &quot;{album.title}&quot;
          </h4>
          <p className="text-xs text-muted">
            Saat ini {currentCount} foto · Tersisa {remainingSlots} slot (maksimal {MAX_TOTAL_PHOTOS} foto/album).
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-primary border border-sky-border shadow-xs">
          Dipilih: {selectedPhotos.length} / {remainingSlots} slot
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={`album-add-photos-${album.id}`}
            className="text-xs font-semibold text-ink"
          >
            Pilih Berkas Foto
          </label>
          <span className="text-xs text-muted">jpg, png, webp · Maks 2 MB/foto</span>
        </div>

        <input
          id={`album-add-photos-${album.id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={addMutation.isPending || selectedPhotos.length >= remainingSlots}
          onChange={handleFileChange}
          className="block w-full cursor-pointer rounded-lg border border-sky-border bg-white p-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-sky-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-sky-dark disabled:cursor-not-allowed disabled:opacity-60"
        />

        {photoError && (
          <p role="alert" className="text-xs font-medium text-scarlet">
            {photoError}
          </p>
        )}
      </div>

      {selectedPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {selectedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative overflow-hidden rounded-lg border border-sky-border bg-white p-1.5 shadow-xs"
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="aspect-4/3 w-full rounded object-cover"
              />
              <div className="mt-1 flex items-center justify-between gap-1">
                <span className="truncate text-[11px] text-muted">
                  +{index + 1} {photo.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  aria-label={`Hapus foto ${photo.name}`}
                  className="rounded px-1 text-[11px] font-bold text-scarlet hover:bg-scarlet/10"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-sky-border/70">
        {onCancel && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={addMutation.isPending}
          >
            Batal
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={() => void handleSubmit()}
          disabled={selectedPhotos.length === 0 || addMutation.isPending}
          isLoading={addMutation.isPending}
          loadingText="Mengunggah foto..."
        >
          Unggah {selectedPhotos.length > 0 ? `${selectedPhotos.length} Foto` : 'Foto'}
        </Button>
      </div>
    </div>
  )
}

export default AlbumAddPhotosSection
