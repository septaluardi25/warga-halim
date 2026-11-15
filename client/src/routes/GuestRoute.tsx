import { Navigate, Outlet } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'

function GuestRoute() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth)

  if (isCheckingAuth) {
    return <Spinner fullPage label="Memeriksa sesi..." />
  }

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/members'} replace />
  }

  return <Outlet />
}

export default GuestRoute
