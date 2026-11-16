import type { Role } from './auth.js'

export interface Photo {
  id: number
  photo_url: string
  sort_order: number
}

export interface WargaListItem {
  id: number
  full_name: string
  position: string
  domicile: string
  card_photo_url: string | null
}

export interface WargaDetail {
  id: number
  full_name: string
  position: string
  birth_date: string
  domicile: string
  whatsapp_number: string | null
  social_media: string | null
  contact: string | null
  message_impression: string | null
  photos: Photo[]
}

export interface Album {
  id: number
  title: string
  created_at: string
  photos: Photo[]
}

export interface Video {
  id: number
  title: string
  youtube_url: string
  created_at: string
}

export interface AdminUserRow {
  id: number
  name: string
  username: string
  role: Role
  created_at: string
}
