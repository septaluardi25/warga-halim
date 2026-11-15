import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

function PageLayout() {
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col bg-sky-soft text-ink">
      <Navbar />
      <main
        className={
          isHomePage
            ? 'w-full flex-1'
            : 'mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8'
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PageLayout
