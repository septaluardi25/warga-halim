import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addPhotosToAlbum,
  createAlbum,
  deleteAlbum,
  getAlbums,
  updateAlbum,
} from '../../services/homeService'

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
