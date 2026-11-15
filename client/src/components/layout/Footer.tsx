import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-sky-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
        <p className="text-center sm:text-left">
          <span className="font-semibold text-sky-primary">Warga Halim</span> — Portal kenangan dan silaturahmi mantan karyawan.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-sky-primary">
            Beranda
          </Link>
          <Link to="/gallery" className="hover:text-sky-primary">
            Galeri
          </Link>
          <Link to="/members" className="hover:text-sky-primary">
            Warga
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
