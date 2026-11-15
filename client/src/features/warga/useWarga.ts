import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWarga,
  deleteWarga,
  getWargaById,
  getWargaList,
  updateWarga,
  type UpdateWargaInput,
} from '../../services/wargaService'

/**
 * React Query hook untuk mengambil daftar ringkasan warga dengan filter pencarian nama.
 *
 * @param search - Kata kunci pencarian nama warga
 * @returns Query result yang memuat daftar warga, status loading, dan error
 */
export function useWargaListQuery(search: string) {
  return useQuery({
    queryKey: ['warga', 'list', search.trim()],
    queryFn: () => getWargaList(search),
  })
}

/**
 * React Query hook untuk mengambil detail lengkap profil warga berdasarkan ID.
 * Query hanya aktif (`enabled`) jika ID merupakan bilangan bulat positif yang valid.
 *
 * @param id - ID integer warga
 * @returns Query result dengan data profil lengkap warga
 */
export function useWargaDetailQuery(id: number) {
  return useQuery({
    queryKey: ['warga', 'detail', id],
    queryFn: () => getWargaById(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

/**
 * React Query mutation hook untuk menambahkan biodata warga baru.
 * Otomatis meng-invalidate cache query `'warga'` saat berhasil.
 *
 * @returns Mutation instance untuk membuat data warga
 */
export function useCreateWargaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWarga,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warga'] }),
  })
}

/**
 * React Query mutation hook untuk memperbarui data biodata warga.
 *
 * @returns Mutation instance untuk memperbarui data warga
 */
export function useUpdateWargaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateWargaInput }) =>
      updateWarga(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warga'] }),
  })
}

/**
 * React Query mutation hook untuk menghapus data biodata warga beserta fotonya.
 *
 * @returns Mutation instance untuk menghapus warga
 */
export function useDeleteWargaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWarga,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warga'] }),
  })
}
