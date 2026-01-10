'use client'

import QueryProviders from '../../providers/query'
import AdminAuthProvider from './providers/auth'
import AppTheme from '@/components/theme/AppTheme'
import CssBaseline from '@mui/material/CssBaseline'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProviders>
      <AdminAuthProvider>
        <AppTheme>
          <CssBaseline enableColorScheme />
          <QueryProviders> {children}</QueryProviders>
        </AppTheme>
      </AdminAuthProvider>
    </QueryProviders>
  )
}
