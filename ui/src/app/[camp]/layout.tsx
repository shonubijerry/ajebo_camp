'use client'

import AppTheme from '@/components/theme/AppTheme'
import QueryProviders from '../../providers/query'
import { CssBaseline } from '@mui/material'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProviders>
      <AppTheme>
        <CssBaseline enableColorScheme />
        <QueryProviders> {children}</QueryProviders>
      </AppTheme>
    </QueryProviders>
  )
}
