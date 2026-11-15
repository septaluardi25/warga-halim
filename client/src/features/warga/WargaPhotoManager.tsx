import { useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import { readFileAsDataUrl, validateImageFile } from './fileUtils'
import type { ManagedPhotoItem } from './wargaSchema'

interface WargaPhotoManagerProps {
  photos: ManagedPhotoItem[]
  onChange: (nextPhotos: ManagedPhotoItem[]) => void
  error?: string
}

function WargaPhotoManager({ photos, onChange, error }: WargaPhotoManagerProps) {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isReading, setIsReading] = useState(false)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    setUploadError(null)
    const files = Array.from(fileList)
    event.target.value = ''

    if (photos.length + files.length > 10) {
      const msg = 'Maksimal 10 foto per biodata warga.'
      setUploadError(msg)
      toast.error(msg)
      return
    }

    for (const file of files) {
      const validationError = validateImageFile(file)
      if (validationError) {
        setUploadError(validationError)
        toast.error(validationError)
        return
      }
    }

    setIsReading(true)
    try {
      const added = await Promise.all(
        files.map(async (file, index) => ({
          key: `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          previewUrl: await readFileAsDataUrl(file),
          name: file.name,
        })),
      )
      onChange([...photos, ...added])
      toast.success(`${added.length} foto berhasil ditambahkan.`)
    } catch (readErr) {
      const msg = readErr instanceof Error ? readErr.message : 'Gagal membaca berkas gambar'
      setUploadError(msg)
      toast.error(msg)
    } finally {
      setIsReading(false)
    }
  }

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length) return
    const next = [...photos]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onChange(next)
  }

  const removePhoto = (index: number) => onChange(photos.filter((_, idx) => idx !== index))
  const displayError = uploadError ?? error

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">Foto Biodata (Wajib 3–10 foto)</p>
          <p className="text-xs text-muted">
            Format jpg/png/webp, maks 2 MB per foto. Foto #1 dijadikan foto utama kartu direktori.
          </p>
        </div>
        <span className="rounded-full bg-sky-light px-3 py-1 text-xs font-semibold text-sky-dark">
          {photos.length} / 10 foto
        </span>
      </div>

      <label className="inline-flex cursor-pointer items-center rounded-lg border border-sky-border bg-sky-soft px-4 py-2 text-sm font-semibold text-sky-dark transition-colors hover:bg-sky-light">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isReading || photos.length >= 10}
          onChange={handleFileChange}
          className="sr-only"
        />
        {isReading ? 'Membaca foto...' : 'Pilih Foto'}
      </label>

      {displayError && (
        <p role="alert" className="text-xs font-medium text-scarlet">
          {displayError}
        </p>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div key={photo.key} className="flex flex-col overflow-hidden rounded-xl border border-sky-border bg-white">
              <div className="relative aspect-4/3 bg-sky-soft">
                <img src={photo.previewUrl} alt={`${photo.name} urutan ${index + 1}`} className="h-full w-full object-cover" />
                <span
                  className={[
                    'absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    index === 0 ? 'bg-sky-primary text-white shadow-xs' : 'bg-slate-700 text-white',
                  ].join(' ')}
                >
                  {index === 0 ? 'Foto Utama (#1)' : `Urutan #${index + 1}`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1.5 border-t border-sky-border p-2.5">
                <div className="flex gap-1">
                  <Button variant="secondary" size="sm" disabled={index === 0} onClick={() => movePhoto(index, index - 1)} aria-label={`Geser foto ${index + 1} ke kiri`}>
                    ←
                  </Button>
                  <Button variant="secondary" size="sm" disabled={index === photos.length - 1} onClick={() => movePhoto(index, index + 1)} aria-label={`Geser foto ${index + 1} ke kanan`}>
                    →
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => removePhoto(index)} aria-label={`Hapus foto ${index + 1}`}>
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WargaPhotoManager
