import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-sky-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
        <p className="text-center sm:text-left">
          <span className="font-semibold text-sky-primary">Warga Halim</span> — Alumni memory portal for former colleagues.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-sky-primary">
            Home
          </Link>
          <Link to="/gallery" className="hover:text-sky-primary">
            Gallery
          </Link>
          <Link to="/members" className="hover:text-sky-primary">
            Members
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
