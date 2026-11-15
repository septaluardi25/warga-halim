import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import LoginForm from '../features/auth/LoginForm'

function LoginPage() {
  return (
    <Card padding="none" className="mx-auto max-w-4xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="space-y-5 bg-white p-6 sm:p-8">
          <div>
            <h1 className="text-2xl font-bold text-sky-primary">Masuk ke Warga Halim</h1>
            <p className="mt-1 text-sm text-muted">
              Masuk dengan akun warga atau akun pengurus (admin).
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted">
            Belum memiliki akun?{' '}
            <Link to="/register" className="font-semibold text-sky-primary hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <aside className="flex flex-col justify-between gap-8 border-t border-sky-border bg-linear-to-br from-sky-primary via-sky-dark to-slate-900 p-6 text-white sm:p-8 md:border-t-0 md:border-l">
          <span className="inline-flex w-fit items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-xs">
            Warga Halim · Portal Silaturahmi
          </span>

          <div className="space-y-4">
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
              Setiap kenangan berharga pantas dirawat.
            </h2>
            <p className="text-sm leading-relaxed text-white/85 sm:text-base">
              Terhubung kembali dengan rekan-rekan seperjuangan, buka kembali album kebersamaan,
              dan baca pesan hangat dari keluarga besar Halim.
            </p>
          </div>

          <p className="border-t border-white/20 pt-4 text-xs font-medium tracking-wide text-white/75 uppercase">
            Halim Perdanakusuma · Kenangan &amp; Direktori Alumni
          </p>
        </aside>
      </div>
    </Card>
  )
}

export default LoginPage
