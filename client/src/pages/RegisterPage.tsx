import { Link } from 'react-router-dom'
import RegisterForm from '../features/auth/RegisterForm'

function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-sky-border bg-white shadow-xl">
      <div className="flex flex-col md:flex-row">
        {/* Left: Register Form Container */}
        <div className="flex w-full flex-col justify-between bg-white p-8 sm:p-10 md:w-7/12 lg:p-12">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-soft text-sky-primary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </span>
              <span className="text-xs font-bold tracking-wider text-sky-primary uppercase">
                Aktivasi Anggota Baru
              </span>
            </div>

            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Daftar Akun Baru
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-muted">
              Daftar untuk mengakses direktori alumni dan biodata warga Warga Halim.
            </p>

            <RegisterForm />
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-2 rounded-xl border border-sky-border/80 bg-sky-soft/40 p-4 sm:flex-row sm:items-center">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-ink">Sudah memiliki akun?</span>
              <span className="text-xs text-muted">Masuk langsung ke portal warga</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-bold text-sky-primary hover:underline"
            >
              <span>Masuk di sini</span>
              <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* Right: Corporate Heritage Panel */}
        <aside className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#004275] via-[#005a9c] to-[#002d50] p-8 text-white sm:p-10 md:w-5/12 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-sky-400/20 blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-sky-300/15 blur-xl" />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
                Registrasi Resmi
              </span>
              <svg className="h-5 w-5 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                Terhubung kembali dengan rekan-rekan alumni.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                Bergabunglah ke dalam direktori warga untuk melihat profil rekan kerja, menjalin
                silaturahmi, dan merayakan persahabatan yang abadi.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-8">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-3 backdrop-blur-md">
              <div>
                <p className="text-xl font-extrabold text-white">25+</p>
                <p className="text-xs text-white/70">Rekan Terdaftar</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">Aman</p>
                <p className="text-xs text-white/70">Data Terproteksi</p>
              </div>
            </div>

            <p className="border-t border-white/20 pt-3 text-xs text-white/75">
              Halim Perdanakusuma · Ruang Kenangan &amp; Silaturahmi
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default RegisterPage
