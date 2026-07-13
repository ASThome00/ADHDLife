import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { App } from './App'
import './index.css'

// Apply cached theme before first paint so nothing flashes in the wrong
// palette. localStorage holds 'light' | 'dark' | 'system' (see lib/theme.ts);
// the settings table is the real source of truth once the app loads.
{
  const saved = localStorage.getItem('adhd-theme')
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  const dark = saved === 'dark' || ((saved === 'system' || !saved) && prefersDark)
  const root = document.getElementById('root')
  if (dark && root) root.classList.add('dark')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           30 * 1000,
      gcTime:              10 * 60 * 1000,
      retry:               1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background:   '#1c1917',
              color:        '#fafaf9',
              fontSize:     '14px',
            },
          }}
        />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
)
