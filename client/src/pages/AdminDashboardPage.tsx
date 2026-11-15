import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import AdminNav from '../features/warga/AdminNav'
import ConfirmDeleteActions from '../features/warga/ConfirmDeleteActions'
import { useDeleteWargaMutation, useWargaListQuery } from '../features/warga/useWarga'
import type { WargaListItem } from '../types'

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const { data, isLoading, isError, error, refetch } = useWargaListQuery(search)
  const deleteMutation = useDeleteWargaMutation()
  const wargaList = data?.warga ?? []

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setConfirmDeleteId(null)
  }

  const handleDelete = async (item: WargaListItem) => {
    try {
      await deleteMutation.mutateAsync(item.id)
      setConfirmDeleteId(null)
      toast.success(`Profile "${item.full_name}" deleted successfully.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete member profile.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Manage member profiles, photo albums, home video, and registered user accounts.</p>
        </div>
        <Link to="/admin/members/new" className="inline-flex items-center justify-center rounded-lg bg-scarlet px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-scarlet-hover">
          + Add Member
        </Link>
      </div>

      <AdminNav />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Input label="Search Member Name" placeholder="Type member name..." value={search} onChange={(event) => handleSearchChange(event.target.value)} containerClassName="w-full sm:max-w-sm" />
          <p className="text-sm font-medium text-muted">Showing {wargaList.length} member profile(s)</p>
        </div>

        {isLoading ? (
          <Spinner label="Loading member profiles..." />
        ) : isError ? (
          <EmptyState variant="error" title="Failed to load member profiles" description={error instanceof Error ? error.message : 'An error occurred while loading data.'} actionLabel="Try Again" onAction={() => void refetch()} />
        ) : wargaList.length === 0 ? (
          search.trim() ? (
            <EmptyState title="No matching profile found" description={`No member profile matches "${search}".`} actionLabel="Reset Search" onAction={() => handleSearchChange('')} />
          ) : (
            <EmptyState title="No member profiles yet" description="Add the first member profile so it appears in the alumni directory." actionLabel="Add Member" onAction={() => navigate('/admin/members/new')} />
          )
        ) : (
          <div className="overflow-x-auto rounded-xl border border-sky-border">
            <table className="w-full min-w-[560px] divide-y divide-sky-border text-left text-sm">
              <thead className="bg-sky-soft text-xs font-semibold tracking-wide text-sky-dark uppercase">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Photo</th>
                  <th className="whitespace-nowrap px-4 py-3">Full Name</th>
                  <th className="whitespace-nowrap px-4 py-3">City</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-border bg-white">
                {wargaList.map((warga) => (
                  <tr key={warga.id} className="hover:bg-sky-soft/40">
                    <td className="whitespace-nowrap px-4 py-3">
                      {warga.card_photo_url ? (
                        <img src={warga.card_photo_url} alt={warga.full_name} className="h-12 w-12 rounded-lg border border-sky-border object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-soft text-xs text-muted">-</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{warga.full_name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{warga.city}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/members/${warga.id}`} className="rounded-lg border border-sky-border px-3 py-1.5 text-xs font-semibold text-sky-dark transition-colors hover:bg-sky-soft">View</Link>
                        <Link to={`/admin/members/${warga.id}/edit`} className="rounded-lg bg-sky-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-dark">Edit</Link>
                        <ConfirmDeleteActions isConfirming={confirmDeleteId === warga.id} onRequestDelete={() => setConfirmDeleteId(warga.id)} onConfirmDelete={() => void handleDelete(warga)} onCancelDelete={() => setConfirmDeleteId(null)} />
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

export default AdminDashboardPage
