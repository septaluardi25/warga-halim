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
              border: '1px solid #b8d5ec',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#005A9C', secondary: '#ffffff' },
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
