import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAlbum, deleteAlbum, getAlbums } from '../../services/homeService'

export function useAlbumsQuery() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: getAlbums,
  })
}

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
