import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import AdminNav from '../features/warga/AdminNav'
import { useCreateWargaMutation } from '../features/warga/useWarga'
import WargaForm, { type WargaSubmitPayload } from '../features/warga/WargaForm'

function AdminWargaCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateWargaMutation()

  const handleSubmit = async (payload: WargaSubmitPayload) => {
    await createMutation.mutateAsync({
      full_name: payload.full_name,
      position: payload.position,
      contact: payload.contact,
      message_impression: payload.message_impression,
      photoUrls: payload.newPhotoUrls,
    })
    toast.success('Biodata warga berhasil ditambahkan.')
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
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Tambah Biodata Warga</h1>
        <p className="text-sm text-muted">
          Masukkan informasi warga dan unggah 3 sampai 10 foto profil/kenangan.
        </p>
      </div>

      <AdminNav />

      <Card>
        <WargaForm mode="create" onSubmitData={handleSubmit} onCancel={() => navigate('/admin')} />
      </Card>
    </section>
  )
}

export default AdminWargaCreatePage
