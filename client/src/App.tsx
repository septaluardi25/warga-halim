import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import ScrollToTop from './components/layout/ScrollToTop'
import AppRoutes from './routes/AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
        <Toaster
          position="top-center"
          containerStyle={{ top: 16 }}
          toastOptions={{
            duration: 3500,
            style: {
              maxWidth: '92vw',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#0284c7', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
