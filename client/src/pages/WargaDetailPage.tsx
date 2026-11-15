import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { useWargaDetailQuery } from '../features/warga/useWarga'
import WargaPhotoGallery from '../features/warga/WargaPhotoGallery'

function WargaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const parsedId = Number(id)
  const isValidId = Number.isInteger(parsedId) && parsedId > 0
  const { data, isLoading, isError, error } = useWargaDetailQuery(isValidId ? parsedId : 0)

  if (isLoading && isValidId) {
    return <Spinner fullPage label="Memuat profil warga..." />
  }

  if (!isValidId || isError || !data) {
    return (
      <EmptyState
        variant="error"
        title="Biodata warga tidak ditemukan"
        description={
          error instanceof Error
            ? error.message
            : 'Biodata warga yang Anda cari tidak tersedia atau telah dihapus.'
        }
        actionLabel="Kembali ke Direktori Warga"
        onAction={() => navigate('/members')}
      />
    )
  }

  const { warga } = data

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/members"
          className="inline-flex items-center rounded-lg border border-sky-border bg-white px-4 py-2 text-sm font-semibold text-sky-dark transition-colors hover:bg-sky-light"
        >
          ← Kembali ke Direktori Warga
        </Link>
      </div>

      <Card padding="lg">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <WargaPhotoGallery photos={warga.photos} fullName={warga.full_name} />

          <div className="space-y-6">
            <div className="space-y-3 border-b border-sky-border pb-5">
              <h1 className="text-2xl font-bold text-sky-primary sm:text-3xl">
                {warga.full_name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-sky-border bg-sky-soft px-3 py-1 text-xs font-semibold text-sky-dark">
                  Jabatan: {warga.position}
                </span>
                {warga.contact && (
                  <span className="inline-flex items-center rounded-full border border-sky-border bg-white px-3 py-1 text-xs font-medium text-ink">
                    Kontak: {warga.contact}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-border border-l-4 border-l-sky-primary bg-linear-to-br from-sky-soft/80 via-white to-sky-soft/40 p-5 shadow-xs sm:p-6">
              <div className="flex items-center gap-2 text-sky-primary">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0 opacity-80">
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                </svg>
                <h2 className="text-xs font-bold tracking-wider text-sky-dark uppercase">
                  Pesan & Kesan
                </h2>
              </div>

              {warga.message_impression ? (
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink">
                  {warga.message_impression}
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted italic">
                  Belum ada pesan atau kesan yang ditambahkan.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default WargaDetailPage
