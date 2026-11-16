import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface AdminNavItem {
  to: string
  label: string
  end: boolean
  icon: (className: string) => ReactNode
}

const adminLinks: AdminNavItem[] = [
  {
    to: '/admin',
    label: 'Kelola Biodata Warga',
    end: true,
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
  },
  {
    to: '/admin/members/new',
    label: 'Tambah Warga',
    end: false,
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    to: '/admin/albums',
    label: 'Kelola Album Kenangan',
    end: false,
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/video',
    label: 'Kelola Video YouTube',
    end: false,
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Kelola Akun Pengguna',
    end: false,
    icon: (cls) => (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

function AdminNav() {
  return (
    <nav
      aria-label="Admin navigation"
      className="flex gap-2 overflow-x-auto rounded-2xl border border-sky-border bg-white p-2.5 shadow-xs sm:flex-wrap sm:p-3"
    >
      {adminLinks.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              'inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-sky-primary text-white shadow-xs'
                : 'border border-transparent text-slate-600 hover:border-sky-border hover:bg-sky-soft/60 hover:text-sky-primary',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              {item.icon(isActive ? 'h-4 w-4 text-white' : 'h-4 w-4 text-slate-400')}
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default AdminNav
