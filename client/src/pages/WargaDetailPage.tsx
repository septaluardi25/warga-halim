import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { useWargaDetailQuery } from '../features/warga/useWarga'
import WargaPhotoGallery from '../features/warga/WargaPhotoGallery'

/**
 * Halaman rincian biodata warga (/members/:id, alias /warga/:id).
 * Mengusung tata letak 2 kolom (gambar di sebelah kiri, biodata di sebelah kanan),
 * dengan seluruh item data biodata tersusun flex ke bawah (vertikal) serta estetika flat design yang bersih.
 */
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
          className="inline-flex items-center rounded-lg border border-sky-border bg-white px-4 py-2 text-sm font-semibold text-sky-dark shadow-none transition-colors hover:bg-sky-light"
        >
          ← Kembali ke Direktori Warga
        </Link>
      </div>

      <Card padding="lg" className="shadow-none">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          {/* Kolom Kiri: Galeri Foto Warga */}
          <div className="w-full">
            <WargaPhotoGallery photos={warga.photos} fullName={warga.full_name} />
          </div>

          {/* Kolom Kanan: Data Biodata Flex ke Bawah */}
          <div className="flex flex-col gap-4">
            {/* Nama Lengkap */}
            <div className="border-b border-sky-border pb-3">
              <span className="text-xs font-semibold tracking-wider text-sky-dark uppercase">Nama Lengkap</span>
              <h1 className="mt-1 text-2xl font-bold text-sky-primary sm:text-3xl">
                {warga.full_name}
              </h1>
            </div>

            {/* Posisi */}
            <div className="border-b border-sky-border pb-3">
              <span className="text-xs font-semibold tracking-wider text-sky-dark uppercase">Posisi</span>
              <p className="mt-1 text-base font-semibold text-ink">
                {warga.position}
              </p>
            </div>

            {/* Kontak */}
            {warga.contact && (
              <div className="border-b border-sky-border pb-3">
                <span className="text-xs font-semibold tracking-wider text-sky-dark uppercase">Kontak</span>
                <p className="mt-1 text-base font-medium text-ink">
                  {warga.contact}
                </p>
              </div>
            )}

            {/* Pesan & Kesan */}
            <div>
              <span className="text-xs font-semibold tracking-wider text-sky-dark uppercase">
                Pesan & Kesan
              </span>
              {warga.message_impression ? (
                <p className="mt-1 whitespace-pre-line text-base leading-relaxed text-ink">
                  {warga.message_impression}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted italic">
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
