import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { useAdminUsersQuery, useDeleteAdminUserMutation } from '../features/auth/useAuth'
import AdminNav from '../features/warga/AdminNav'
import ConfirmDeleteActions from '../features/warga/ConfirmDeleteActions'
import type { AdminUserRow } from '../types'
import { formatDate } from '../utils/formatDate'

function AdminUsersPage() {
  const { data, isLoading, isError, error, refetch } = useAdminUsersQuery()
  const deleteUserMutation = useDeleteAdminUserMutation()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const users = data?.users ?? []

  const handleDeleteUser = async (user: AdminUserRow) => {
    try {
      await deleteUserMutation.mutateAsync(user.id)
      setConfirmDeleteId(null)
      toast.success(`Akun "${user.name}" berhasil dihapus.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus akun pengguna.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link to="/admin" className="inline-flex text-sm font-semibold text-sky-primary hover:text-sky-dark">
          ← Kembali ke Kelola Warga
        </Link>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Kelola Akun Pengguna</h1>
        <p className="text-sm text-muted">
          Daftar akun warga terdaftar (non-admin). Akun administrator dilindungi dan disembunyikan dari tabel ini.
        </p>
      </div>

      <AdminNav />

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Akun Pengguna Terdaftar</h2>
          <p className="text-sm font-medium text-muted">Total {users.length} akun</p>
        </div>

        {isLoading ? (
          <Spinner label="Memuat data akun pengguna..." />
        ) : isError ? (
          <EmptyState
            variant="error"
            title="Gagal memuat akun pengguna"
            description={error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat akun.'}
            actionLabel="Coba Lagi"
            onAction={() => void refetch()}
          />
        ) : users.length === 0 ? (
          <EmptyState
            title="Belum ada akun pengguna"
            description="Saat ini belum ada akun warga biasa yang terdaftar di dalam sistem."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-sky-border">
            <table className="w-full min-w-[560px] divide-y divide-sky-border text-left text-sm">
              <thead className="bg-sky-soft text-xs font-semibold tracking-wide text-sky-dark uppercase">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Nama</th>
                  <th className="whitespace-nowrap px-4 py-3">Email</th>
                  <th className="whitespace-nowrap px-4 py-3">Tanggal Terdaftar</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-border bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-sky-soft/40">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">{user.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{user.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(user.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <ConfirmDeleteActions
                          isConfirming={confirmDeleteId === user.id}
                          label="Hapus Akun"
                          onRequestDelete={() => setConfirmDeleteId(user.id)}
                          onConfirmDelete={() => void handleDeleteUser(user)}
                          onCancelDelete={() => setConfirmDeleteId(null)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  )
}

export default AdminUsersPage
