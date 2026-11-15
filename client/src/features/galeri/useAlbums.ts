import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addPhotosToAlbum,
  createAlbum,
  deleteAlbum,
  getAlbums,
  updateAlbum,
} from '../../services/homeService'

/**
 * React Query hook untuk mengambil daftar seluruh album kegiatan masyarakat.
 *
 * @returns Query result yang memuat array album, status loading, dan error
 */
export function useAlbumsQuery() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: getAlbums,
  })
}

/**
 * React Query mutation hook untuk membuat album baru.
 * Otomatis meng-invalidate cache query `'albums'` dan `'home'` saat berhasil.
 *
 * @returns Mutation instance untuk mengeksekusi pembuatan album
 */
export function useCreateAlbumMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAlbum,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['albums'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })
}

/**
 * React Query mutation hook untuk memperbarui data album (judul, urutan, foto baru).
 * Otomatis menyegarkan cache query `'albums'` dan `'home'` setelah mutasi sukses.
 *
 * @returns Mutation instance untuk memperbarui album
 */
export function useUpdateAlbumMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      albumId,
      input,
    }: {
      albumId: number
      input: {
        title: string
        photoOrder?: string[]
        photos?: (File | string)[]
      }
    }) => updateAlbum(albumId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['albums'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })
}

/**
 * React Query mutation hook untuk menambahkan berkas foto baru ke album yang sudah ada.
 *
 * @returns Mutation instance untuk penambahan foto album
 */
export function useAddAlbumPhotosMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      albumId,
      photos,
    }: {
      albumId: number
      photos: (File | string)[]
    }) => addPhotosToAlbum(albumId, photos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['albums'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })
}

/**
 * React Query mutation hook untuk menghapus album beserta seluruh fotonya.
 *
 * @returns Mutation instance untuk penghapusan album
 */
export function useDeleteAlbumMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['albums'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })
}
