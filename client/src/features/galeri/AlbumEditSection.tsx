import { useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import type { Album, Photo } from '../../types'
import { validateImageFile } from '../warga/fileUtils'
import { useUpdateAlbumMutation } from './useAlbums'

interface AlbumEditSectionProps {
  album: Album
  onSuccess?: () => void
  onCancel?: () => void
}

const MAX_TOTAL_PHOTOS = 50

interface NewPhotoItem {
  id: string
  name: string
  url: string
  file: File
}

function AlbumEditSection({ album, onSuccess, onCancel }: AlbumEditSectionProps) {
  const updateMutation = useUpdateAlbumMutation()
  const [title, setTitle] = useState(album.title)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>(album.photos)
  const [newPhotos, setNewPhotos] = useState<NewPhotoItem[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)

  const totalPhotosCount = existingPhotos.length + newPhotos.length
  const remainingSlots = Math.max(0, MAX_TOTAL_PHOTOS - totalPhotosCount)

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
    if (totalPhotosCount <= 1) {
      const msg = 'Album harus memiliki minimal 1 foto.'
      setPhotoError(msg)
      toast.error(msg)
      return
    }
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId))
    setPhotoError(null)
  }

  const handleNewFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (fileList.length === 0) return

    if (remainingSlots <= 0) {
      const msg = `Maksimal ${MAX_TOTAL_PHOTOS} foto per album. Tidak ada slot tersisa.`
      setPhotoError(msg)
      toast.error(msg)
      return
    }

    const candidates = fileList.slice(0, remainingSlots)
    const validationErrors: string[] =
      fileList.length > remainingSlots
        ? [
            `Hanya ${remainingSlots} foto yang dapat ditambahkan (batas maksimal ${MAX_TOTAL_PHOTOS} foto per album).`,
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

    const added: NewPhotoItem[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }))

    setNewPhotos((prev) => [...prev, ...added])
    setPhotoError(validationErrors[0] ?? null)
    if (validationErrors[0]) toast.error(validationErrors[0])
    toast.success(`${added.length} foto baru ditambahkan ke antrean edit.`)
  }

  const handleRemoveNewPhoto = (id: string) => {
    setNewPhotos((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url)
      }
      return prev.filter((item) => item.id !== id)
    })
    setPhotoError(null)
  }

  const handleCancel = () => {
    newPhotos.forEach((p) => {
      if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url)
    })
    onCancel?.()
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
    if (totalPhotosCount < 1 || totalPhotosCount > MAX_TOTAL_PHOTOS) {
      const msg = `Foto album harus berjumlah antara 1 sampai ${MAX_TOTAL_PHOTOS} foto.`
      setPhotoError(msg)
      toast.error(msg)
      return
    }

    const photoOrder = [
      ...existingPhotos.map((p) => `existing:${p.id}`),
      ...newPhotos.map((_, idx) => `new:${idx}`),
    ]

    try {
      await updateMutation.mutateAsync({
        albumId: album.id,
        input: {
          title: trimmedTitle,
          photoOrder,
          photos: newPhotos.map((p) => p.file),
        },
      })

      newPhotos.forEach((p) => {
        if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url)
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
            Ubah judul album, kelola/urutkan foto, atau hapus dan tambah foto (1–50 foto).
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-primary border border-sky-border shadow-xs">
          Total: {totalPhotosCount} / {MAX_TOTAL_PHOTOS} foto
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
            Foto Saat Ini ({existingPhotos.length} foto)
          </h5>
          <span className="text-[11px] text-muted">
            Gunakan tombol panah untuk mengubah urutan foto, atau tombol hapus.
          </span>
        </div>

        {existingPhotos.length === 0 ? (
          <p className="text-xs italic text-muted">
            Semua foto lama dihapus. Pastikan Anda mengunggah minimal 1 foto baru di bawah.
          </p>
        ) : (
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
                    disabled={totalPhotosCount <= 1 || updateMutation.isPending}
                    onClick={() => handleRemoveExistingPhoto(photo.id)}
                    title={
                      totalPhotosCount <= 1
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
        )}
      </div>

      {/* Tambah Foto Baru */}
      <div className="space-y-2 border-t border-sky-border/70 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={`edit-album-new-photos-${album.id}`}
            className="text-xs font-semibold text-ink"
          >
            Unggah Foto Tambahan (Opsional)
          </label>
          <span className="text-xs text-muted">
            Tersisa {remainingSlots} slot · Maks 2 MB/foto
          </span>
        </div>

        <input
          id={`edit-album-new-photos-${album.id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={updateMutation.isPending || remainingSlots <= 0}
          onChange={handleNewFilesChange}
          className="block w-full cursor-pointer rounded-lg border border-sky-border bg-white p-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-sky-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-sky-dark disabled:cursor-not-allowed disabled:opacity-60"
        />

        {newPhotos.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[11px] font-semibold text-sky-primary">
              Foto Baru yang Akan Ditambahkan ({newPhotos.length}):
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {newPhotos.map((photo, index) => (
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
                      disabled={updateMutation.isPending}
                      onClick={() => handleRemoveNewPhoto(photo.id)}
                      aria-label={`Hapus foto ${photo.name}`}
                      className="rounded px-1 text-[11px] font-bold text-scarlet hover:bg-scarlet/10"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
          onClick={handleCancel}
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
            totalPhotosCount < 1 ||
            totalPhotosCount > MAX_TOTAL_PHOTOS ||
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
