import { z } from 'zod'
import { getYouTubeEmbedUrl } from '../beranda/youtubeUtils'

export interface ManagedPhotoItem {
  key: string
  existingId?: number
  previewUrl: string
  name: string
}

export const wargaFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(150, 'Full name must be at most 150 characters'),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters'),
  contact: z.string().trim().max(150, 'Contact must be at most 150 characters'),
  message_impression: z
    .string()
    .trim()
    .max(1000, 'Message & impression must be at most 1000 characters'),
})

export const albumFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Album title is required')
    .max(100, 'Album title must be at most 100 characters'),
})

export const videoFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Video title is required')
    .max(100, 'Video title must be at most 100 characters'),
  youtube_url: z
    .string()
    .trim()
    .min(1, 'YouTube link is required')
    .max(255, 'YouTube link must be at most 255 characters')
    .refine((val) => getYouTubeEmbedUrl(val) !== null, {
      message: 'Please enter a valid YouTube URL (youtube.com or youtu.be)',
    }),
})

export type WargaFormValues = z.infer<typeof wargaFormSchema>
export type AlbumFormValues = z.infer<typeof albumFormSchema>
export type VideoFormValues = z.infer<typeof videoFormSchema>
