import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import Link from 'next/link'

export function ForbiddenPage({
  message = 'You do not have permission to view this page.',
}) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ py: 6, textAlign: 'center' }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        403 - Forbidden
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          component={Link}
          href="/portal/dashboard"
          variant="contained"
          color="primary"
        >
          Go to Dashboard
        </Button>
        <Button
          component={Link}
          href="/portal/"
          variant="outlined"
          color="primary"
        >
          Admin Home
        </Button>
      </Box>
    </Stack>
  )
}
