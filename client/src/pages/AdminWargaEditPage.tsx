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
    toast.success('Member profile updated successfully.')
    navigate('/admin')
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link
          to="/admin"
          className="inline-flex text-sm font-semibold text-sky-primary hover:text-sky-dark"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Edit Member Profile</h1>
        <p className="text-sm text-muted">
          Update profile details, add new photos, or adjust photo display order.
        </p>
      </div>

      <AdminNav />

      {isLoading && isValidId ? (
        <Spinner label="Loading member profile..." />
      ) : !isValidId || isError || !data ? (
        <EmptyState
          variant="error"
          title="Member profile not found"
          description={
            error instanceof Error
              ? error.message
              : 'The member profile you requested is unavailable.'
          }
          actionLabel="Back to Dashboard"
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
