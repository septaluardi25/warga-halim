import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWarga,
  deleteWarga,
  getWargaById,
  getWargaList,
  updateWarga,
  type UpdateWargaInput,
} from '../../services/wargaService'

export function useWargaListQuery(search: string) {
  return useQuery({
    queryKey: ['warga', 'list', search.trim()],
    queryFn: () => getWargaList(search),
  })
}

export function useWargaDetailQuery(id: number) {
  return useQuery({
    queryKey: ['warga', 'detail', id],
    queryFn: () => getWargaById(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useCreateWargaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWarga,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warga'] }),
  })
}

export function useUpdateWargaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateWargaInput }) =>
      updateWarga(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warga'] }),
  })
}

export function useDeleteWargaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWarga,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warga'] }),
  })
}
