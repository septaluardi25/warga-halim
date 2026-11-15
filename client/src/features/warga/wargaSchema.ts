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
    .min(1, 'Jabatan wajib diisi')
    .max(100, 'Jabatan maksimal 100 karakter'),
  contact: z.string().trim().max(150, 'Kontak maksimal 150 karakter'),
  message_impression: z
    .string()
    .trim()
    .max(1000, 'Pesan & kesan maksimal 1000 karakter'),
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
