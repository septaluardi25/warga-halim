import { Link } from 'react-router-dom'
import LoginForm from '../features/auth/LoginForm'

function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-sky-border bg-white shadow-xl">
      <div className="flex flex-col md:flex-row">
        {/* Left: Login Form Container */}
        <div className="flex w-full flex-col justify-between bg-white p-8 sm:p-10 md:w-7/12 lg:p-12">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-soft text-sky-primary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </span>
              <span className="text-xs font-bold tracking-wider text-sky-primary uppercase">
                Ruang Temu Eksklusif
              </span>
            </div>

            <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Masuk ke Akun Anda
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-muted">
              Portal silaturahmi terkurasi bagi mantan karyawan dan pengurus paguyuban Warga Halim.
            </p>

            <LoginForm />
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-2 rounded-xl border border-sky-border/80 bg-sky-soft/40 p-4 sm:flex-row sm:items-center">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-ink">Belum memiliki akun Warga Halim?</span>
              <span className="text-xs text-muted">Aktivasi akun khusus mantan pegawai terdaftar</span>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center text-sm font-bold text-sky-primary hover:underline"
            >
              <span>Daftar di sini</span>
              <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* Right: Corporate Heritage & Quote Panel */}
        <aside className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#004275] via-[#005a9c] to-[#002d50] p-8 text-white sm:p-10 md:w-5/12 lg:p-12">
          {/* Subtle Ambient Decorative Circles */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-sky-400/20 blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-sky-300/15 blur-xl" />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
                Komunitas Terverifikasi
              </span>
              <svg className="h-5 w-5 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>

            <div className="pt-2">
              <span className="text-3xl leading-none text-sky-200">“</span>
              <p className="mt-1 text-base leading-relaxed text-white/95 italic">
                Masa bakti boleh selesai di atas kertas, namun kisah, tawa, dan ikatan kekeluargaan
                kita tetap abadi di Warga Halim.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-sky-100">
                  WH
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Paguyuban Rekan Halim</p>
                  <p className="text-xs text-white/70">Arsip &amp; Silaturahmi Lintas Angkatan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-8">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-3 backdrop-blur-md">
              <div>
                <p className="text-xl font-extrabold text-white">25+</p>
                <p className="text-xs text-white/70">Rekan Terhubung</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">100%</p>
                <p className="text-xs text-white/70">Arsip Terverifikasi</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <svg className="h-4 w-4 text-sky-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Akses Khusus Internal Warga Halim</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default LoginPage
