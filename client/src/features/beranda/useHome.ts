import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteVideo, getHomeData, saveVideo } from '../../services/homeService'

export function useHomeQuery() {
  return useQuery({
    queryKey: ['home'],
    queryFn: getHomeData,
  })
}

export function useSaveVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveVideo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home'] }),
  })
}

export function useDeleteVideoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home'] }),
  })
}
