import { Navigate, Outlet } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth)

  if (isCheckingAuth) {
    return <Spinner fullPage label="Checking session..." />
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
