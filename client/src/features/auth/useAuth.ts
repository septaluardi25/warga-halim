import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteAdminUser,
  getAdminUsers,
  loginUser,
  registerUser,
} from '../../services/authService'

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginUser,
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerUser,
  })
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  })
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}
