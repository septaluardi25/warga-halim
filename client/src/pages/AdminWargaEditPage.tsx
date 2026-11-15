import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import AdminNav from '../features/warga/AdminNav'
import { useUpdateWargaMutation, useWargaDetailQuery } from '../features/warga/useWarga'
import WargaForm, { type WargaSubmitPayload } from '../features/warga/WargaForm'

function AdminWargaEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const wargaId = Number(id)
  const isValidId = Number.isInteger(wargaId) && wargaId > 0
  const { data, isLoading, isError, error } = useWargaDetailQuery(isValidId ? wargaId : 0)
  const updateMutation = useUpdateWargaMutation()

  const handleSubmit = async (payload: WargaSubmitPayload) => {
    if (!data?.warga) return
    await updateMutation.mutateAsync({ id: data.warga.id, payload })
    toast.success('Biodata warga berhasil diperbarui.')
    navigate('/admin')
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link
          to="/admin"
          className="inline-flex text-sm font-semibold text-sky-primary hover:text-sky-dark"
        >
          ← Kembali ke Kelola Warga
        </Link>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Ubah Biodata Warga</h1>
        <p className="text-sm text-muted">
          Perbarui informasi data warga, tambahkan foto baru, atau sesuaikan urutan tampil foto.
        </p>
      </div>

      <AdminNav />

      {isLoading && isValidId ? (
        <Spinner label="Memuat biodata warga..." />
      ) : !isValidId || isError || !data ? (
        <EmptyState
          variant="error"
          title="Biodata warga tidak ditemukan"
          description={
            error instanceof Error
              ? error.message
              : 'Biodata warga yang diminta tidak tersedia.'
          }
          actionLabel="Kembali ke Kelola Warga"
          onAction={() => navigate('/admin')}
        />
      ) : (
        <Card>
          <WargaForm
            key={data.warga.id}
            mode="edit"
            initialData={data.warga}
            onSubmitData={handleSubmit}
            onCancel={() => navigate('/admin')}
          />
        </Card>
      )}
    </section>
  )
}

export default AdminWargaEditPage
