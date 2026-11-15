import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { validateImageFile } from '../warga/fileUtils'
import { albumFormSchema, type AlbumFormValues } from '../warga/wargaSchema'
import { useCreateAlbumMutation } from './useAlbums'

interface SelectedAlbumPhoto {
  id: string
  name: string
  url: string
  file: File
}

const MAX_ALBUM_PHOTOS = 50

/**
 * Formulir pembuatan album kegiatan baru untuk panel admin.
 * Memungkinkan pengisian judul serta pemilihan 1 hingga 50 foto dengan pratinjau lokal dan validasi berkas.
 *
 * @param props.onCreated - Callback opsional yang dipanggil setelah album sukses dibuat
 */
function AlbumCreateForm({ onCreated }: { onCreated?: () => void }) {
  const createAlbumMutation = useCreateAlbumMutation()
  const [photos, setPhotos] = useState<SelectedAlbumPhoto[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)

  const photosRef = useRef(photos)
  photosRef.current = photos

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => {
        if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url)
      })
    }
  }, [])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema), defaultValues: { title: '' },
  })

  /**
   * Menampilkan pesan kesalahan terkait foto melalui state lokal dan toast notifikasi.
   *
   * @param msg - Pesan galat
   */
  const notifyPhotoError = (msg: string) => { setPhotoError(msg); toast.error(msg) }

  /**
   * Menangani pemilihan berkas gambar dari elemen input file browser.
   * Memvalidasi format, ukuran berkas (maks 2MB), serta batas kapasitas album (maksimal 50 foto).
   *
   * @param event - Event perubahan input berkas
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (selectedFiles.length === 0) return

    const remainingSlots = MAX_ALBUM_PHOTOS - photos.length
    if (remainingSlots <= 0) return notifyPhotoError(`Maksimal ${MAX_ALBUM_PHOTOS} foto untuk setiap album.`)

    const candidates = selectedFiles.slice(0, remainingSlots)
    const validationErrors: string[] = selectedFiles.length > remainingSlots
      ? [`Hanya ${remainingSlots} foto yang dapat ditambahkan (maksimal ${MAX_ALBUM_PHOTOS} per album).`]
      : []
    const validFiles = candidates.filter((file) => {
      const err = validateImageFile(file)
      if (err) validationErrors.push(err)
      return !err
    })
    if (validFiles.length === 0) return notifyPhotoError(validationErrors[0] ?? 'Tidak ada berkas gambar valid yang dipilih.')

    const added = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }))
    setPhotos((prev) => [...prev, ...added])
    setPhotoError(validationErrors[0] ?? null)
    if (validationErrors[0]) toast.error(validationErrors[0])
    toast.success(`${added.length} foto siap diunggah.`)
  }

  /**
   * Menghapus salah satu foto dari daftar pratinjau sebelum diunggah dan mencabut Object URL-nya.
   *
   * @param photoId - ID lokal foto pratinjau yang hendak dihapus
   */
  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const target = prev.find((item) => item.id === photoId)
      if (target?.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url)
      }
      return prev.filter((item) => item.id !== photoId)
    })
    setPhotoError(null)
  }

  /**
   * Menangani pengiriman form: memvalidasi jumlah foto (1-50), mengeksekusi mutasi pembuatan album,
   * membersihkan state form dan Object URL blob, serta memicu callback `onCreated`.
   *
   * @param values - Nilai isian form yang telah divalidasi Zod
   */
  const onSubmit = async (values: AlbumFormValues) => {
    if (photos.length < 1 || photos.length > MAX_ALBUM_PHOTOS) return notifyPhotoError(`Album wajib memiliki antara 1 sampai ${MAX_ALBUM_PHOTOS} foto.`)
    try {
      await createAlbumMutation.mutateAsync({
        title: values.title,
        photoUrls: photos.map((item) => item.file),
      })
      photos.forEach((p) => {
        if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url)
      })
      reset({ title: '' }); setPhotos([]); setPhotoError(null)
      toast.success(`Album "${values.title.trim()}" berhasil ditambahkan.`)
      onCreated?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan album.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h2 className="text-lg font-bold text-ink">Tambah Album Baru</h2>
      <Input label="Judul Album *" placeholder="Contoh: Reuni Akbar Warga Halim 2026" error={errors.title?.message} {...register('title')} />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="album-photos-input" className="text-sm font-medium text-ink">
            Foto Album * ({photos.length} / {MAX_ALBUM_PHOTOS} foto)
          </label>
          <span className="text-xs text-muted">jpg, png, atau webp · Maks 2 MB/foto</span>
        </div>

        <input
          id="album-photos-input" type="file" accept="image/jpeg,image/png,image/webp" multiple
          disabled={photos.length >= MAX_ALBUM_PHOTOS} onChange={handleFileChange}
          className="block w-full cursor-pointer rounded-lg border border-sky-border bg-sky-soft/40 p-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-sky-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-sky-dark disabled:cursor-not-allowed disabled:opacity-60"
        />

        {photoError && <p role="alert" className="text-xs font-medium text-scarlet">{photoError}</p>}

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 md:grid-cols-5">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative overflow-hidden rounded-lg border border-sky-border bg-white p-1.5">
                <img src={photo.url} alt={photo.name} className="aspect-4/3 w-full rounded object-cover" />
                <div className="mt-1 flex items-center justify-between gap-1">
                  <span className="truncate text-xs text-muted">#{index + 1} {photo.name}</span>
                  <button type="button" onClick={() => handleRemovePhoto(photo.id)} aria-label={`Hapus foto ${photo.name}`} className="rounded px-1.5 py-0.5 text-xs font-bold text-scarlet hover:bg-scarlet/10">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting} loadingText="Menyimpan...">Simpan Album</Button>
      </div>
    </form>
  )
}

export default AlbumCreateForm
