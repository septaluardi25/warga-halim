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
      toast.success(`Biodata "${item.full_name}" berhasil dihapus.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus biodata warga.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Kelola Data Warga</h1>
          <p className="mt-1 text-sm text-muted">Kelola biodata warga, album foto, video beranda, dan akun pengguna terdaftar.</p>
        </div>
        <Link to="/admin/members/new" className="inline-flex items-center justify-center rounded-lg bg-sky-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-dark">
          + Tambah Warga
        </Link>
      </div>

      <AdminNav />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Input label="Cari Nama Warga" placeholder="Ketik nama warga..." value={search} onChange={(event) => handleSearchChange(event.target.value)} containerClassName="w-full sm:max-w-sm" />
          <p className="text-sm font-medium text-muted">Menampilkan {wargaList.length} biodata warga</p>
        </div>

        {isLoading ? (
          <Spinner label="Memuat biodata warga..." />
        ) : isError ? (
          <EmptyState variant="error" title="Gagal memuat biodata warga" description={error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data.'} actionLabel="Coba Lagi" onAction={() => void refetch()} />
        ) : wargaList.length === 0 ? (
          search.trim() ? (
            <EmptyState title="Biodata tidak ditemukan" description={`Tidak ada biodata warga yang cocok dengan "${search}".`} actionLabel="Reset Pencarian" onAction={() => handleSearchChange('')} />
          ) : (
            <EmptyState title="Belum ada biodata warga" description="Tambahkan biodata warga pertama agar tampil di direktori." actionLabel="+ Tambah Warga" onAction={() => navigate('/admin/members/new')} />
          )
        ) : (
          <div className="overflow-x-auto rounded-xl border border-sky-border">
            <table className="w-full min-w-[560px] divide-y divide-sky-border text-left text-sm">
              <thead className="bg-sky-soft text-xs font-semibold tracking-wide text-sky-dark uppercase">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Foto</th>
                  <th className="whitespace-nowrap px-4 py-3">Nama Lengkap</th>
                  <th className="whitespace-nowrap px-4 py-3">Posisi</th>
                  <th className="whitespace-nowrap px-4 py-3">Domisili</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">Aksi</th>
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
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{warga.position}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{warga.domicile || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/members/${warga.id}`} className="rounded-lg border border-sky-border px-3 py-1.5 text-xs font-semibold text-sky-dark transition-colors hover:bg-sky-soft">Lihat</Link>
                        <Link to={`/admin/members/${warga.id}/edit`} className="rounded-lg bg-sky-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-dark">Ubah</Link>
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
