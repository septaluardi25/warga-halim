import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import type { Album, Photo } from '../../types'
import { useUpdateAlbumMutation } from './useAlbums'

interface AlbumEditSectionProps {
  album: Album
  onSuccess?: () => void
  onCancel?: () => void
}

function AlbumEditSection({ album, onSuccess, onCancel }: AlbumEditSectionProps) {
  const updateMutation = useUpdateAlbumMutation()
  const [title, setTitle] = useState(album.title)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>(album.photos)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!val.trim()) {
      setTitleError('Judul album wajib diisi')
    } else if (val.trim().length > 100) {
      setTitleError('Judul album maksimal 100 karakter')
    } else {
      setTitleError(null)
    }
  }

  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= existingPhotos.length) return
    setExistingPhotos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      if (moved) {
        next.splice(toIndex, 0, moved)
      }
      return next
    })
    setPhotoError(null)
  }

  const handleRemoveExistingPhoto = (photoId: number) => {
    if (existingPhotos.length <= 1) {
      const msg = 'Album harus memiliki minimal 1 foto.'
      setPhotoError(msg)
      toast.error(msg)
      return
    }
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId))
    setPhotoError(null)
  }

  const handleSubmit = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('Judul album wajib diisi')
      toast.error('Judul album wajib diisi')
      return
    }
    if (trimmedTitle.length > 100) {
      setTitleError('Judul album maksimal 100 karakter')
      toast.error('Judul album maksimal 100 karakter')
      return
    }
    if (existingPhotos.length < 1 || existingPhotos.length > 50) {
      const msg = 'Foto album harus berjumlah antara 1 sampai 50 foto.'
      setPhotoError(msg)
      toast.error(msg)
      return
    }

    const photoOrder = existingPhotos.map((p) => `existing:${p.id}`)

    try {
      await updateMutation.mutateAsync({
        albumId: album.id,
        input: {
          title: trimmedTitle,
          photoOrder,
        },
      })

      toast.success(`Album "${trimmedTitle}" berhasil diperbarui.`)
      onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui album.'
      setPhotoError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="rounded-xl border border-sky-primary/30 bg-sky-soft/40 p-4 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-border/70 pb-3">
        <div>
          <h4 className="text-sm font-bold text-sky-primary">
            Ubah Album &quot;{album.title}&quot;
          </h4>
          <p className="text-xs text-muted">
            Ubah judul album, kelola urutan foto, atau hapus foto tertentu dari album.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-primary border border-sky-border shadow-xs">
          Jumlah: {existingPhotos.length} / 50 foto
        </span>
      </div>

      {/* Input Judul */}
      <div className="space-y-1">
        <label htmlFor={`edit-album-title-${album.id}`} className="text-xs font-semibold text-ink">
          Judul Album <span className="text-scarlet">*</span>
        </label>
        <Input
          id={`edit-album-title-${album.id}`}
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Masukkan judul album"
          maxLength={100}
          error={titleError ?? undefined}
          disabled={updateMutation.isPending}
        />
        <div className="flex justify-end text-[11px] text-muted">
          <span>{title.length} / 100 karakter</span>
        </div>
      </div>

      {/* Foto Album Saat Ini */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-xs font-semibold text-ink">
            Kelola Foto Album ({existingPhotos.length} foto)
          </h5>
          <span className="text-[11px] text-muted">
            Gunakan tombol panah untuk mengubah urutan foto, atau tombol hapus.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {existingPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border border-sky-border bg-white p-1.5 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded bg-slate-100">
                <img
                  src={photo.photo_url}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  #{index + 1}
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0 || updateMutation.isPending}
                    onClick={() => handleMovePhoto(index, index - 1)}
                    title="Geser ke kiri / urutan sebelumnya"
                    className="rounded border border-sky-border px-1.5 py-0.5 text-[11px] font-bold text-ink transition-colors hover:bg-sky-soft disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={index === existingPhotos.length - 1 || updateMutation.isPending}
                    onClick={() => handleMovePhoto(index, index + 1)}
                    title="Geser ke kanan / urutan berikutnya"
                    className="rounded border border-sky-border px-1.5 py-0.5 text-[11px] font-bold text-ink transition-colors hover:bg-sky-soft disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    →
                  </button>
                </div>

                <button
                  type="button"
                  disabled={existingPhotos.length <= 1 || updateMutation.isPending}
                  onClick={() => handleRemoveExistingPhoto(photo.id)}
                  title={
                    existingPhotos.length <= 1
                      ? 'Album harus memiliki minimal 1 foto'
                      : 'Hapus foto ini dari album'
                  }
                  className="rounded border border-scarlet/30 px-1.5 py-0.5 text-[11px] font-semibold text-scarlet transition-colors hover:bg-scarlet/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {photoError && (
        <p role="alert" className="text-xs font-medium text-scarlet">
          {photoError}
        </p>
      )}

      {/* Aksi Tombol */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-sky-border/70 pt-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={updateMutation.isPending}
        >
          Batal
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => void handleSubmit()}
          disabled={
            !title.trim() ||
            existingPhotos.length < 1 ||
            existingPhotos.length > 50 ||
            updateMutation.isPending
          }
          isLoading={updateMutation.isPending}
          loadingText="Menyimpan perubahan..."
        >
          Simpan Perubahan
        </Button>
      </div>
    </div>
  )
}

export default AlbumEditSection
