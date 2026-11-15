import { NavLink } from 'react-router-dom'

const adminLinks = [
  { to: '/admin', label: 'Kelola Warga', end: true },
  { to: '/admin/members/new', label: 'Tambah Warga', end: false },
  { to: '/admin/albums', label: 'Kelola Album', end: false },
  { to: '/admin/video', label: 'Kelola Video', end: false },
  { to: '/admin/users', label: 'Kelola Akun', end: false },
]

function AdminNav() {
  return (
    <nav
      aria-label="Admin navigation"
      className="flex gap-2 overflow-x-auto rounded-2xl border border-sky-border bg-white p-2.5 shadow-sm sm:flex-wrap sm:p-3"
    >
      {adminLinks.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              'shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-sky-primary text-white'
                : 'border border-sky-border bg-sky-soft text-sky-dark hover:bg-sky-light',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default AdminNav
