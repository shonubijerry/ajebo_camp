'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CircularProgress, Box } from '@mui/material'

interface EntityRedirectProps {
  entityPath: string // e.g., "users", "camps", "districts"
}

export default function EntityRedirect({ entityPath }: EntityRedirectProps) {
  const router = useRouter()
  const params = useParams()
  const entityId = params.id as string

  useEffect(() => {
    if (entityId) {
      router.push(`/portal/${entityPath}?id=${entityId}`)
    }
  }, [entityId, router, entityPath])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  )
}
