import { Link } from 'react-router-dom'
import homeHeroImage from '../../assets/home.jpg'

function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900 px-4 py-16 text-white sm:px-8 sm:py-24">
      <img
        src={homeHeroImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#001c37]/95 via-[#004275]/85 to-[#00668a]/50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#001c37]/80 via-transparent to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 shadow-xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-white">
              Ruang Temu &amp; Jejak Langkah Insan Halim
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-xs sm:text-5xl sm:leading-tight">
            Merawat Cerita, Merangkul Kenangan Bersama Warga Halim
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-slate-100 sm:text-base">
            Ruang arsip kenangan, silaturahmi, dan kabar terkini bagi seluruh mantan karyawan yang pernah
            berjuang dan bertumbuh bersama.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-sky-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-sky-dark active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Lihat Galeri Kenangan</span>
            </Link>
            <Link
              to="/members"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white shadow-xs backdrop-blur-sm transition-all duration-200 hover:bg-white/25 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Jelajahi Anggota</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeHero
