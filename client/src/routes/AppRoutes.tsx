import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import AdminAlbumPage from '../pages/AdminAlbumPage'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import AdminUsersPage from '../pages/AdminUsersPage'
import AdminVideoPage from '../pages/AdminVideoPage'
import AdminWargaCreatePage from '../pages/AdminWargaCreatePage'
import AdminWargaEditPage from '../pages/AdminWargaEditPage'
import GalleryPage from '../pages/GalleryPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegisterPage from '../pages/RegisterPage'
import WargaDetailPage from '../pages/WargaDetailPage'
import WargaListPage from '../pages/WargaListPage'
import { getCurrentUser } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import AdminRoute from './AdminRoute'
import GuestRoute from './GuestRoute'
import ProtectedRoute from './ProtectedRoute'

function LegacyMemberDetailRedirect() {
  const { id } = useParams()
  return <Navigate to={`/members/${id ?? ''}`} replace />
}

function LegacyAdminMemberEditRedirect() {
  const { id } = useParams()
  return <Navigate to={`/admin/members/${id ?? ''}/edit`} replace />
}

function AppRoutes() {
  const navigate = useNavigate()

  useEffect(() => {
    const initialToken = useAuthStore.getState().token
    if (!initialToken) {
      useAuthStore.getState().setCheckingAuth(false)
      return
    }

    let cancelled = false
    const verifySession = async () => {
      useAuthStore.getState().setCheckingAuth(true)
      try {
        const { user: verifiedUser } = await getCurrentUser(initialToken)
        if (!cancelled) useAuthStore.getState().updateUser(verifiedUser)
      } catch {
        if (!cancelled) {
          useAuthStore.getState().logout()
          toast.error('Sesi telah berakhir, silakan masuk kembali.')
          navigate('/login', { replace: true })
        }
      } finally {
        if (!cancelled) useAuthStore.getState().setCheckingAuth(false)
      }
    }

    void verifySession()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/galeri" element={<Navigate to="/gallery" replace />} />

        <Route element={<GuestRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/daftar" element={<Navigate to="/register" replace />} />
          <Route path="/masuk" element={<Navigate to="/login" replace />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/members" element={<WargaListPage />} />
          <Route path="/members/:id" element={<WargaDetailPage />} />
          <Route path="/warga" element={<Navigate to="/members" replace />} />
          <Route path="/warga/:id" element={<LegacyMemberDetailRedirect />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/members/new" element={<AdminWargaCreatePage />} />
          <Route path="/admin/members/:id/edit" element={<AdminWargaEditPage />} />
          <Route path="/admin/albums" element={<AdminAlbumPage />} />
          <Route path="/admin/video" element={<AdminVideoPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/warga/baru" element={<Navigate to="/admin/members/new" replace />} />
          <Route path="/admin/warga/:id/ubah" element={<LegacyAdminMemberEditRedirect />} />
          <Route path="/admin/album" element={<Navigate to="/admin/albums" replace />} />
          <Route path="/admin/akun" element={<Navigate to="/admin/users" replace />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
