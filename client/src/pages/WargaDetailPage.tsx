import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { useWargaDetailQuery } from '../features/warga/useWarga'
import WargaPhotoGallery from '../features/warga/WargaPhotoGallery'
import { formatBirthDate } from '../utils/formatDate'

/**
 * Menghasilkan URL tautan langsung ke WhatsApp jika nomor valid.
 *
 * @param phone - Nomor WhatsApp (misal: '08123456789' atau '+628123456789')
 * @returns {string | null} URL wa.me atau null
 */
function getWhatsAppUrl(phone?: string | null): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/[^0-9]/g, '')
  if (!cleaned) return null
  const formatted = cleaned.startsWith('0') ? `62${cleaned.slice(1)}` : cleaned
  return `https://wa.me/${formatted}`
}

/**
 * Halaman rincian biodata warga (/members/:id, alias /warga/:id).
 * Mengusung tata letak 2 kolom terstruktur sesuai Stitch Design System:
 * - Kolom kiri: Galeri foto interaktif sticky (klik untuk berganti, tanpa thumbnail).
 * - Kolom kanan: Header identitas alumni, informasi kontak berikon, dan Pesan & Kesan murni tipografi (flat design tanpa card).
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
  const waUrl = getWhatsAppUrl(warga.whatsapp_number ?? warga.contact)
  const isSocialUrl = Boolean(
    warga.social_media && (warga.social_media.startsWith('http://') || warga.social_media.startsWith('https://'))
  )

  return (
    <div className="space-y-6">
      {/* Top Bar: Navigasi Breadcrumbs & Badge Verifikasi (Sesuai Stitch Design) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/members"
          className="inline-flex items-center gap-2 rounded-lg border border-sky-border bg-white px-3.5 py-1.5 text-xs font-semibold text-sky-dark shadow-none transition-colors hover:bg-sky-light sm:text-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali ke Direktori Warga</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-light px-3 py-1 text-xs font-semibold text-sky-dark">
            <svg className="h-3.5 w-3.5 text-sky-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Data Terverifikasi
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-3 py-1 text-xs font-medium text-muted">
            Arsip {warga.photos.length} Foto
          </span>
        </div>
      </div>

      {/* Main 2-Column Split: Kiri Galeri Foto (Sticky) & Kanan Biodata Flex Column */}
      <Card padding="lg" className="shadow-none">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Kolom Kiri: Galeri Foto Warga (Sticky di Desktop) */}
          <div className="w-full lg:col-span-5 lg:sticky lg:top-24">
            <WargaPhotoGallery photos={warga.photos} fullName={warga.full_name} />
          </div>

          {/* Kolom Kanan: Data Biodata Flex ke Bawah */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* Header Identitas Alumni */}
            <div className="flex flex-col gap-1 border-b border-sky-border pb-4">
              <span className="inline-block w-fit rounded-md bg-sky-light px-2.5 py-0.5 text-xs font-semibold text-sky-dark">
                Alumni Warga Halim
              </span>
              <h1 className="mt-2 text-2xl font-bold text-sky-primary sm:text-3xl">
                {warga.full_name}
              </h1>
              <p className="text-base font-semibold text-ink sm:text-lg">
                {warga.position}
              </p>
            </div>

            {/* Informasi Pribadi & Kontak (Flat Structured Rows) */}
            <div className="space-y-4 rounded-xl border border-sky-border bg-sky-soft/40 p-4 sm:p-5">
              <h2 className="text-xs font-bold tracking-wider text-sky-dark uppercase">
                Informasi Pribadi & Kontak
              </h2>

              {/* Tanggal Lahir */}
              <div className="flex items-start gap-3 border-b border-sky-border/60 pb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-primary shadow-2xs">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted">Tanggal Lahir</span>
                  <span className="text-sm font-semibold text-ink sm:text-base">
                    {formatBirthDate(warga.birth_date)}
                  </span>
                </div>
              </div>

              {/* Domisili Tinggal */}
              <div className="flex items-start gap-3 border-b border-sky-border/60 pb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-primary shadow-2xs">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted">Domisili Tinggal</span>
                  <span className="text-sm font-semibold text-ink sm:text-base">
                    {warga.domicile}
                  </span>
                </div>
              </div>

              {/* No. WhatsApp */}
              {(warga.whatsapp_number || warga.contact) && (
                <div className="flex items-start gap-3 border-b border-sky-border/60 pb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shadow-2xs">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted">Nomor WhatsApp</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink sm:text-base">
                        {warga.whatsapp_number ?? warga.contact}
                      </span>
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                        >
                          Chat WhatsApp →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Media Sosial */}
              {warga.social_media && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-primary shadow-2xs">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted">Media Sosial & Portofolio</span>
                    {isSocialUrl ? (
                      <a
                        href={warga.social_media}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-sky-primary hover:underline sm:text-base"
                      >
                        {warga.social_media} ↗
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-ink sm:text-base">
                        {warga.social_media}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pesan & Kesan: Pure Typography Tanpa Card (Sesuai Stitch Design & Flat Design) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink sm:text-xl">
                  Pesan & Kesan
                </h2>
                <span className="inline-flex items-center gap-1 rounded bg-sky-soft px-2 py-0.5 text-[11px] font-medium text-sky-dark">
                  Resmi Terverifikasi Admin
                </span>
              </div>
              <p className="text-xs text-muted">
                Dituliskan untuk keluarga besar Warga Halim
              </p>

              {warga.message_impression ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/90 sm:text-base">
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
