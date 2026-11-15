import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import type { WargaDetail } from '../../types'
import WargaPhotoManager from './WargaPhotoManager'
import { wargaFormSchema, type ManagedPhotoItem, type WargaFormValues } from './wargaSchema'

export interface WargaSubmitPayload {
  full_name: string
  position: string
  contact: string | null
  message_impression: string | null
  photo_order: string[]
  newPhotos: (File | string)[]
  newPhotoUrls: string[]
}

interface WargaFormProps {
  mode: 'create' | 'edit'
  initialData?: WargaDetail
  onSubmitData: (payload: WargaSubmitPayload) => Promise<void> | void
  onCancel: () => void
}

/**
 * Mengonversi array foto lama dari `initialData` menjadi format `ManagedPhotoItem` untuk manajer foto.
 *
 * @param initialData - Objek rincian warga awal (pada mode edit)
 * @returns {ManagedPhotoItem[]} Array item foto terkelola
 */
function toInitialManagedPhotos(initialData?: WargaDetail): ManagedPhotoItem[] {
  if (!initialData) return []
  return [...initialData.photos]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((photo, index) => ({
      key: `existing-${photo.id}`,
      existingId: photo.id,
      previewUrl: photo.photo_url,
      name: `Foto ${index + 1}`,
    }))
}

/**
 * Formulir terpadu pembuatan dan pengeditan biodata warga Halim.
 * Memadukan validasi teks React Hook Form (Zod) dengan komponen pengelola foto 3–10 item.
 *
 * @param props.mode - Mode form (`'create'` atau `'edit'`)
 * @param props.initialData - Data awal warga jika dalam mode edit
 * @param props.onSubmitData - Handler pengiriman payload formulir
 * @param props.onCancel - Callback pembatalan pengisian form
 */
function WargaForm({ mode, initialData, onSubmitData, onCancel }: WargaFormProps) {
  const [photos, setPhotos] = useState<ManagedPhotoItem[]>(() => toInitialManagedPhotos(initialData))
  const [photoError, setPhotoError] = useState<string | undefined>(undefined)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [messageLength, setMessageLength] = useState(initialData?.message_impression?.length ?? 0)

  const photosRef = useRef(photos)
  photosRef.current = photos

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => {
        if (p.previewUrl.startsWith('blob:')) URL.revokeObjectURL(p.previewUrl)
      })
    }
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WargaFormValues>({
    resolver: zodResolver(wargaFormSchema),
    defaultValues: {
      full_name: initialData?.full_name ?? '',
      position: initialData?.position ?? '',
      contact: initialData?.contact ?? '',
      message_impression: initialData?.message_impression ?? '',
    },
  })

  const messageField = register('message_impression')

  /**
   * Menangani perubahan daftar foto dari manajer foto terkelola dan memperbarui status validasi batas 3-10 foto.
   *
   * @param nextPhotos - Daftar foto terkelola terbaru
   */
  const handlePhotosChange = (nextPhotos: ManagedPhotoItem[]) => {
    setPhotos(nextPhotos)
    if (nextPhotos.length >= 3 && nextPhotos.length <= 10) setPhotoError(undefined)
  }

  /**
   * Menangani pengiriman form: memvalidasi batasan 3–10 foto, merangkai token urutan foto (`photo_order`),
   * dan memicu fungsi `onSubmitData`.
   *
   * @param values - Nilai isian form yang divalidasi
   */
  const onSubmit = async (values: WargaFormValues) => {
    setSubmitError(null)
    if (photos.length < 3 || photos.length > 10) {
      const msg = 'Foto biodata warga harus berjumlah antara 3 sampai 10 foto.'
      setPhotoError(msg)
      toast.error(msg)
      return
    }

    const photoOrder: string[] = []
    const newPhotos: (File | string)[] = []
    const newPhotoUrls: string[] = []
    for (const photo of photos) {
      if (photo.existingId !== undefined) {
        photoOrder.push(`existing:${photo.existingId}`)
      } else {
        photoOrder.push(`new:${newPhotos.length}`)
        newPhotos.push(photo.file ?? photo.previewUrl)
        newPhotoUrls.push(photo.previewUrl)
      }
    }

    try {
      await onSubmitData({
        full_name: values.full_name.trim(),
        position: values.position.trim(),
        contact: values.contact.trim() || null,
        message_impression: values.message_impression.trim() || null,
        photo_order: photoOrder,
        newPhotos,
        newPhotoUrls,
      })
      photos.forEach((p) => {
        if (p.previewUrl.startsWith('blob:')) URL.revokeObjectURL(p.previewUrl)
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan biodata warga'
      setSubmitError(msg)
      toast.error(msg)
    }
  }

  /**
   * Menangani pembatalan pengisian form dan membersihkan memori Object URL pratinjau foto.
   */
  const handleCancel = () => {
    photos.forEach((p) => {
      if (p.previewUrl.startsWith('blob:')) URL.revokeObjectURL(p.previewUrl)
    })
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {submitError && <div role="alert" className="rounded-lg border border-scarlet/40 bg-scarlet/10 px-3.5 py-2.5 text-sm font-medium text-scarlet">{submitError}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Nama Lengkap *" placeholder="Contoh: Siti Rahma" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Jabatan *" placeholder="Contoh: Finance Manager" error={errors.position?.message} {...register('position')} />
      </div>

      <Input label="Kontak (Opsional)" placeholder="Contoh: IG: @sitirahma atau WA: 0812..." error={errors.contact?.message} {...register('contact')} />

      <div>
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-1">
          <label htmlFor="message_impression" className="text-sm font-medium text-ink">Pesan & Kesan (Opsional, diisi oleh admin)</label>
          <span className="shrink-0 text-xs text-muted">{messageLength} / 1000</span>
        </div>
        <textarea
          id="message_impression" rows={4} maxLength={1000} placeholder="Tuliskan kenangan indah, pesan, atau kesan..."
          className={[
            'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-ink transition-colors placeholder:text-muted/70 focus:outline-none focus:ring-2',
            errors.message_impression ? 'border-scarlet focus:border-scarlet focus:ring-scarlet/20' : 'border-sky-border focus:border-sky-primary focus:ring-sky-primary/20',
          ].join(' ')}
          {...messageField}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setMessageLength(event.target.value.length)
            void messageField.onChange(event)
          }}
        />
        {errors.message_impression && <p role="alert" className="mt-1 text-xs font-medium text-scarlet">{errors.message_impression.message}</p>}
      </div>

      <WargaPhotoManager photos={photos} onChange={handlePhotosChange} error={photoError} />

      <div className="flex flex-col-reverse gap-2.5 border-t border-sky-border pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <Button variant="secondary" className="w-full sm:w-auto" onClick={handleCancel}>Batal</Button>
        <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting} loadingText="Menyimpan...">{mode === 'create' ? 'Simpan Biodata' : 'Perbarui Biodata'}</Button>
      </div>
    </form>
  )
}

export default WargaForm
