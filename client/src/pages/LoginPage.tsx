import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import LoginForm from '../features/auth/LoginForm'

function LoginPage() {
  return (
    <Card padding="none" className="mx-auto max-w-4xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="space-y-5 bg-white p-6 sm:p-8">
          <div>
            <h1 className="text-2xl font-bold text-sky-primary">Sign In to Warga Halim</h1>
            <p className="mt-1 text-sm text-muted">
              Sign in with your alumni member account or administrator account.
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-semibold text-scarlet hover:underline">
              Register now
            </Link>
          </p>
        </div>

        <aside className="flex flex-col justify-between gap-8 border-t border-sky-border bg-linear-to-br from-sky-primary via-sky-dark to-slate-900 p-6 text-white sm:p-8 md:border-t-0 md:border-l">
          <span className="inline-flex w-fit items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-xs">
            Warga Halim · Alumni Archive
          </span>

          <div className="space-y-4">
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
              Every shared memory deserves a home.
            </h2>
            <p className="text-sm leading-relaxed text-white/85 sm:text-base">
              Reconnect with former colleagues, revisit milestone albums, and read heartfelt
              messages preserved across every chapter we built together.
            </p>
          </div>

          <p className="border-t border-white/20 pt-4 text-xs font-medium tracking-wide text-white/75 uppercase">
            Halim Perdanakusuma · Shared Memories &amp; Directory
          </p>
        </aside>
      </div>
    </Card>
  )
}

export default LoginPage
