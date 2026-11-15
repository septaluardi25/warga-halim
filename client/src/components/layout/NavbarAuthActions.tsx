import { Link } from 'react-router-dom'
import type { User } from '../../types'
import Button from '../ui/Button'

interface NavbarAuthActionsProps {
  user: User | null
  isMobile?: boolean
  onLogout: () => void
  onCloseMenu: () => void
}

function NavbarAuthActions({
  user,
  isMobile = false,
  onLogout,
  onCloseMenu,
}: NavbarAuthActionsProps) {
  if (user) {
    return (
      <>
        <div
          className={[
            'flex items-center gap-2 text-sm',
            isMobile ? 'justify-between rounded-lg bg-sky-soft px-3 py-2' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="max-w-[140px] truncate font-medium text-ink sm:max-w-[200px]">
            {user.name}
          </span>
          <span className="shrink-0 rounded-full bg-sky-light px-2.5 py-0.5 text-xs font-semibold text-sky-dark">
            {user.role === 'admin' ? 'Admin' : 'Warga'}
          </span>
        </div>
        <Button
          variant="primary"
          size={isMobile ? 'md' : 'sm'}
          fullWidth={isMobile}
          onClick={onLogout}
        >
          Keluar
        </Button>
      </>
    )
  }

  return (
    <>
      <Link
        to="/register"
        onClick={isMobile ? onCloseMenu : undefined}
        className={[
          'rounded-lg border border-sky-primary px-3.5 py-2 text-center text-sm font-semibold text-sky-primary transition-colors hover:bg-sky-primary hover:text-white',
          isMobile ? 'w-full' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        Daftar
      </Link>
      <Link
        to="/login"
        onClick={isMobile ? onCloseMenu : undefined}
        className={[
          'rounded-lg bg-sky-primary px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-sky-dark',
          isMobile ? 'w-full' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        Masuk
      </Link>
    </>
  )
}

export default NavbarAuthActions
