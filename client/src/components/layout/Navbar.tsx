import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import NavbarAuthActions from './NavbarAuthActions'

const publicAndMemberNavItems = [
  { to: '/', label: 'Home' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/members', label: 'Members' },
]

function getNavLinkClass(isActive: boolean): string {
  const base = 'rounded-lg px-3 py-2 text-sm font-medium transition-colors'
  return isActive
    ? `${base} bg-sky-light text-sky-dark`
    : `${base} text-ink hover:bg-sky-soft hover:text-sky-primary`
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const navItems =
    user?.role === 'admin'
      ? [...publicAndMemberNavItems, { to: '/admin', label: 'Admin' }]
      : publicAndMemberNavItems

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    toast.success('You have been signed out.')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sky-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-sky-primary"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-primary text-sm font-bold text-white">
            WH
          </span>
          <span>Warga Halim</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sky-border bg-sky-soft text-sky-dark hover:bg-sky-light md:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => getNavLinkClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <NavbarAuthActions user={user} onLogout={handleLogout} onCloseMenu={closeMenu} />
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-sky-border bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={closeMenu} className={({ isActive }) => getNavLinkClass(isActive)}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-3 flex flex-col gap-2 border-t border-sky-border pt-3">
            <NavbarAuthActions user={user} isMobile onLogout={handleLogout} onCloseMenu={closeMenu} />
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
