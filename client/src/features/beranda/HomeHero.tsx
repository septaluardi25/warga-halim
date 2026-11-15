import { Link } from 'react-router-dom'
import homeHeroImage from '../../assets/home.jpg'

function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900 px-4 py-12 text-white sm:px-8 sm:py-16">
      <img
        src={homeHeroImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-900/70 to-[#005A9C]/60"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-xs sm:text-6xl">
            Kenangan yang
            <br />
            terbang lebih jauh.
          </h1>

          <p className="max-w-lg text-sm leading-relaxed text-white/95 sm:text-base">
            Portal silaturahmi dan arsip kenangan seluruh mantan karyawan Halim. Terhubung kembali
            dan rawat cerita perjalanan berharga kita bersama.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1 text-xs font-bold text-sky-primary shadow-sm">
              Keluarga Besar Warga Halim · Jejak Langkah
            </span>
            <Link
              to="/gallery"
              className="inline-flex items-center rounded-full border border-white/80 bg-white/15 px-3.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-xs transition-colors hover:bg-white hover:text-sky-primary"
            >
              Lihat Galeri Foto →
            </Link>
            <Link
              to="/members"
              className="inline-flex items-center rounded-full bg-sky-primary px-3.5 py-1 text-xs font-bold text-white shadow-sm transition-colors hover:bg-sky-dark"
            >
              Jelajahi Warga →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeHero
