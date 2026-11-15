import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-sky-border bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Page Not Found</h1>
      <p className="mt-2 text-sm text-muted">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-scarlet px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-scarlet-hover"
      >
        Back to Home
      </Link>
    </section>
  )
}

export default NotFoundPage
