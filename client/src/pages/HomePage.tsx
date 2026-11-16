import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { companyProfile } from '../content/profilPerusahaan'
import AlbumSlideshow from '../features/beranda/AlbumSlideshow'
import FeaturedVideo from '../features/beranda/FeaturedVideo'
import HomeHero from '../features/beranda/HomeHero'
import { useHomeQuery } from '../features/beranda/useHome'

function HomePage() {
  const { data, isLoading, isError, error, refetch } = useHomeQuery()

  return (
    <div className="w-full">
      <div className="w-full border-b border-sky-border bg-white shadow-xs">
        <HomeHero />

        <section className="w-full bg-white px-4 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
              {/* Left Column: Heading & Archival Badge */}
              <div className="flex flex-col items-start lg:col-span-4">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-3 py-1 text-xs font-bold tracking-wider text-sky-primary uppercase">
                  <svg className="h-3.5 w-3.5 text-sky-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm4 0h2v2h-2V5zM7 9h2v2H7V9zm4 0h2v2h-2V9zm-4 4h2v2H7v-2zm4 0h2v2h-2v-2z" clipRule="evenodd" />
                  </svg>
                  <span>Profil Komunitas</span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {companyProfile.title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {companyProfile.subtitle}
                </p>

                <div className="mt-6 flex w-full items-center gap-3.5 rounded-2xl border border-sky-border bg-sky-soft/40 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-soft text-sky-primary">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Ikatan Kekeluargaan</h3>
                    <p className="text-xs text-muted">Resmi didokumentasikan sejak 2024</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative & Metrics Grid */}
              <div className="flex flex-col justify-between space-y-6 lg:col-span-8">
                <div className="space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                  {companyProfile.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-sky-border bg-sky-soft/50 p-4 transition-transform hover:-translate-y-0.5">
                    <div className="text-2xl font-extrabold text-sky-primary sm:text-3xl">25+</div>
                    <div className="mt-1 text-sm font-semibold text-ink">Rekan Seperjuangan</div>
                    <div className="text-xs text-muted">Terdaftar di berbagai divisi</div>
                  </div>
                  <div className="rounded-2xl border border-sky-border bg-sky-soft/50 p-4 transition-transform hover:-translate-y-0.5">
                    <div className="text-2xl font-extrabold text-sky-primary sm:text-3xl">50+</div>
                    <div className="mt-1 text-sm font-semibold text-ink">Momen Terabadikan</div>
                    <div className="text-xs text-muted">Arsip foto &amp; video dokumenter</div>
                  </div>
                  <div className="rounded-2xl border border-sky-border bg-sky-soft/50 p-4 transition-transform hover:-translate-y-0.5">
                    <div className="text-2xl font-extrabold text-sky-primary sm:text-3xl">1</div>
                    <div className="mt-1 text-sm font-semibold text-ink">Ikatan Abadi</div>
                    <div className="text-xs text-muted">Keluarga besar selamanya</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/gallery"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-sky-dark active:scale-[0.98]"
                  >
                    <span>Jelajahi Galeri Foto</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    to="/members"
                    className="inline-flex items-center gap-2 rounded-xl border border-sky-border bg-sky-soft px-5 py-2.5 text-sm font-semibold text-sky-dark transition-all hover:bg-sky-light active:scale-[0.98]"
                  >
                    <span>Buka Direktori Warga</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto w-full space-y-8 rounded-3xl border border-sky-border bg-linear-to-b from-sky-light via-white to-sky-soft p-5 shadow-md sm:p-8 md:w-[80%]">
          {isLoading ? (
            <Spinner label="Memuat album dan video beranda..." />
          ) : isError ? (
            <EmptyState
              variant="error"
              title="Gagal memuat konten beranda"
              description={
                error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data.'
              }
              actionLabel="Coba Lagi"
              onAction={() => void refetch()}
            />
          ) : (
            data && (
              <>
                <AlbumSlideshow albums={data.albums} />
                <FeaturedVideo video={data.video} />
              </>
            )
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage
