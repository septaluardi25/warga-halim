import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteVideo, getHomeData, saveVideo } from '../../services/homeService'

/**
 * React Query hook untuk mengambil data beranda (daftar album kegiatan dan video unggulan).
 *
 * @returns Query result yang memuat objek data beranda, status loading, dan status error
 */
export function useHomeQuery() {
  return useQuery({
    queryKey: ['home'],
    queryFn: getHomeData,
  })
}

/**
 * React Query mutation hook untuk menyimpan atau mengganti video profil YouTube.
 * Otomatis menyegarkan data cache `'home'` saat mutasi berhasil.
 *
 * @returns Mutation instance untuk penyimpanan video
 */
export function useSaveVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveVideo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home'] }),
  })
}

/**
 * React Query mutation hook untuk menghapus video profil YouTube unggulan.
 *
 * @returns Mutation instance untuk penghapusan video
 */
export function useDeleteVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home'] }),
  })
}
