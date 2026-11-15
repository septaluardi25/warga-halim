import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteAdminUser,
  getAdminUsers,
  loginUser,
  registerUser,
} from '../../services/authService'

/**
 * React Query mutation hook untuk proses autentikasi masuk pengguna.
 *
 * @returns Mutation instance untuk mengeksekusi login
 */
export function useLoginMutation() {
  return useMutation({
    mutationFn: loginUser,
  })
}

/**
 * React Query mutation hook untuk pendaftaran akun anggota baru.
 *
 * @returns Mutation instance untuk mengeksekusi registrasi
 */
export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerUser,
  })
}

/**
 * React Query hook untuk mengambil daftar akun anggota di halaman kelola pengguna admin.
 *
 * @returns Query result yang memuat daftar pengguna, status loading, dan status error
 */
export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  })
}

/**
 * React Query mutation hook untuk menghapus akun anggota non-admin.
 * Otomatis menyegarkan data cache `'admin-users'` setelah penghapusan berhasil.
 *
 * @returns Mutation instance untuk mengeksekusi penghapusan akun
 */
export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}
