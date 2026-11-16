import { z } from 'zod'
import { getYouTubeEmbedUrl } from '../beranda/youtubeUtils'

export interface ManagedPhotoItem {
  key: string
  existingId?: number
  previewUrl: string
  name: string
  file?: File
}

export const wargaFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Nama lengkap wajib diisi')
    .max(150, 'Nama lengkap maksimal 150 karakter'),
  position: z
    .string()
    .trim()
    .min(1, 'Posisi wajib diisi')
    .max(100, 'Posisi maksimal 100 karakter'),
  birth_date: z
    .string()
    .trim()
    .min(1, 'Tanggal lahir wajib diisi')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir harus YYYY-MM-DD')
    .refine((val) => !Number.isNaN(new Date(val).getTime()), {
      message: 'Tanggal lahir tidak valid',
    })
    .refine(
      (val) => {
        const [year, month, day] = val.split('-').map(Number)
        const inputDate = new Date(year, month - 1, day)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return inputDate <= today
      },
      { message: 'Tanggal lahir tidak boleh di masa depan' },
    ),
  domicile: z
    .string()
    .trim()
    .min(1, 'Domisili tinggal wajib diisi')
    .max(150, 'Domisili tinggal maksimal 150 karakter'),
  whatsapp_number: z
    .string()
    .trim()
    .max(100, 'No. WhatsApp maksimal 100 karakter')
    .optional(),
  social_media: z
    .string()
    .trim()
    .max(255, 'Media sosial maksimal 255 karakter')
    .optional(),
  message_impression: z
    .string()
    .trim()
    .max(1000, 'Pesan & kesan maksimal 1000 karakter')
    .optional(),
})

export const albumFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul album wajib diisi')
    .max(100, 'Judul album maksimal 100 karakter'),
})

export const videoFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul video wajib diisi')
    .max(100, 'Judul video maksimal 100 karakter'),
  youtube_url: z
    .string()
    .trim()
    .min(1, 'Tautan YouTube wajib diisi')
    .max(255, 'Tautan YouTube maksimal 255 karakter')
    .refine((val) => getYouTubeEmbedUrl(val) !== null, {
      message: 'Masukkan tautan YouTube yang valid (youtube.com atau youtu.be)',
    }),
})

export type WargaFormValues = z.infer<typeof wargaFormSchema>
export type AlbumFormValues = z.infer<typeof albumFormSchema>
export type VideoFormValues = z.infer<typeof videoFormSchema>
