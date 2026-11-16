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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Panel Administrator</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-3 py-1 text-xs font-semibold text-sky-primary">
              <svg className="h-3.5 w-3.5 text-sky-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Super Admin Warga Halim
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">Pusat kendali kurasi arsip kenangan, biodata lengkap rekan alumni, dan pengaturan akses.</p>
        </div>
        <Link to="/admin/members/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-sky-dark active:scale-[0.98]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Tambah Biodata Baru</span>
        </Link>
      </div>

      <AdminNav />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Input label="Cari Nama Warga" placeholder="Ketik nama warga atau posisi..." value={search} onChange={(event) => handleSearchChange(event.target.value)} containerClassName="w-full sm:max-w-sm" />
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
                  <th className="whitespace-nowrap px-4 py-3.5">Foto &amp; Nama Lengkap</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Posisi / Jabatan</th>
                  <th className="whitespace-nowrap px-4 py-3.5">Domisili</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-border bg-white">
                {wargaList.map((warga) => (
                  <tr key={warga.id} className="transition-colors hover:bg-sky-soft/40">
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {warga.card_photo_url ? (
                          <img src={warga.card_photo_url} alt={warga.full_name} className="h-11 w-11 rounded-xl border border-sky-border object-cover shadow-xs" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-soft text-xs font-semibold text-muted">-</div>
                        )}
                        <span className="font-semibold text-ink">{warga.full_name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-sky-primary">{warga.position}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-muted">{warga.domicile || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
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
