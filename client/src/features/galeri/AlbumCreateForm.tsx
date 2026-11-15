import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { readFileAsDataUrl, validateImageFile } from '../warga/fileUtils'
import { albumFormSchema, type AlbumFormValues } from '../warga/wargaSchema'
import { useCreateAlbumMutation } from './useAlbums'

interface SelectedAlbumPhoto {
  id: string
  name: string
  url: string
}

const MAX_ALBUM_PHOTOS = 20

function AlbumCreateForm({ onCreated }: { onCreated?: () => void }) {
  const createAlbumMutation = useCreateAlbumMutation()
  const [photos, setPhotos] = useState<SelectedAlbumPhoto[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isReadingFiles, setIsReadingFiles] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema), defaultValues: { title: '' },
  })
  const notifyPhotoError = (msg: string) => { setPhotoError(msg); toast.error(msg) }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (selectedFiles.length === 0) return

    const remainingSlots = MAX_ALBUM_PHOTOS - photos.length
    if (remainingSlots <= 0) return notifyPhotoError(`Maximum ${MAX_ALBUM_PHOTOS} photos allowed per album.`)

    const candidates = selectedFiles.slice(0, remainingSlots)
    const validationErrors: string[] = selectedFiles.length > remainingSlots
      ? [`Only ${remainingSlots} photo(s) can be added (max ${MAX_ALBUM_PHOTOS} per album).`]
      : []
    const validFiles = candidates.filter((file) => {
      const err = validateImageFile(file)
      if (err) validationErrors.push(err)
      return !err
    })
    if (validFiles.length === 0) return notifyPhotoError(validationErrors[0] ?? 'No valid image files selected.')

    setIsReadingFiles(true)
    try {
      const urls = await Promise.all(validFiles.map((file) => readFileAsDataUrl(file)))
      const added = validFiles.map((file, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`, name: file.name, url: urls[index] ?? '',
      }))
      setPhotos((prev) => [...prev, ...added])
      setPhotoError(validationErrors[0] ?? null)
      if (validationErrors[0]) toast.error(validationErrors[0])
      toast.success(`${added.length} photo(s) ready to upload.`)
    } catch (error) {
      notifyPhotoError(error instanceof Error ? error.message : 'Failed to read image files.')
    } finally {
      setIsReadingFiles(false)
    }
  }

  const handleRemovePhoto = (photoId: string) => { setPhotos((prev) => prev.filter((item) => item.id !== photoId)); setPhotoError(null) }

  const onSubmit = async (values: AlbumFormValues) => {
    if (photos.length < 1 || photos.length > MAX_ALBUM_PHOTOS) return notifyPhotoError(`Album requires between 1 and ${MAX_ALBUM_PHOTOS} photos.`)
    try {
      await createAlbumMutation.mutateAsync({ title: values.title, photoUrls: photos.map((item) => item.url) })
      reset({ title: '' }); setPhotos([]); setPhotoError(null)
      toast.success(`Album "${values.title.trim()}" added successfully.`)
      onCreated?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save album.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h2 className="text-lg font-bold text-ink">Add New Album</h2>
      <Input label="Album Title *" placeholder="Example: Warga Halim Annual Reunion 2026" error={errors.title?.message} {...register('title')} />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="album-photos-input" className="text-sm font-medium text-ink">
            Album Photos * ({photos.length} / {MAX_ALBUM_PHOTOS} photos)
          </label>
          <span className="text-xs text-muted">jpg, png, or webp · Max 2 MB/photo</span>
        </div>

        <input
          id="album-photos-input" type="file" accept="image/jpeg,image/png,image/webp" multiple
          disabled={isReadingFiles || photos.length >= MAX_ALBUM_PHOTOS} onChange={handleFileChange}
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
                  <button type="button" onClick={() => handleRemovePhoto(photo.id)} aria-label={`Remove photo ${photo.name}`} className="rounded px-1.5 py-0.5 text-xs font-bold text-scarlet hover:bg-scarlet/10">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting || isReadingFiles} loadingText="Saving...">Save Album</Button>
      </div>
    </form>
  )
}

export default AlbumCreateForm
