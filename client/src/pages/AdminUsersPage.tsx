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
      toast.success(`Account "${user.name}" deleted successfully.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user account.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link to="/admin" className="inline-flex text-sm font-semibold text-sky-primary hover:text-sky-dark">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Manage User Accounts</h1>
        <p className="text-sm text-muted">
          Registered member accounts (non-admin). Administrator accounts are protected and hidden from this table.
        </p>
      </div>

      <AdminNav />

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Registered Member Accounts</h2>
          <p className="text-sm font-medium text-muted">Total {users.length} account(s)</p>
        </div>

        {isLoading ? (
          <Spinner label="Loading user accounts..." />
        ) : isError ? (
          <EmptyState
            variant="error"
            title="Failed to load user accounts"
            description={error instanceof Error ? error.message : 'An error occurred while loading accounts.'}
            actionLabel="Try Again"
            onAction={() => void refetch()}
          />
        ) : users.length === 0 ? (
          <EmptyState
            title="No registered member accounts"
            description="There are currently no standard member accounts in the system."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-sky-border">
            <table className="w-full min-w-[560px] divide-y divide-sky-border text-left text-sm">
              <thead className="bg-sky-soft text-xs font-semibold tracking-wide text-sky-dark uppercase">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Name</th>
                  <th className="whitespace-nowrap px-4 py-3">Email</th>
                  <th className="whitespace-nowrap px-4 py-3">Registered Date</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
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
                          label="Delete Account"
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
