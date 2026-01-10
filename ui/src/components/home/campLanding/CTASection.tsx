'use client'

import { Box, Button, Container, Typography } from '@mui/material'
import { RegistrationType, SetRegistrationType } from './types'
import { colors } from './utils'
import { RegistrationToggle } from './RegistrationToggle'

interface CTASectionProps {
  canRegister: boolean
  registrationType: RegistrationType
  setRegistrationType: SetRegistrationType
  onRegister: () => void
  ctaButtonLabel: string
}

export function CTASection({
  canRegister,
  registrationType,
  setRegistrationType,
  onRegister,
  ctaButtonLabel,
}: CTASectionProps) {
  if (!canRegister) return null

  return (
    <Box
      sx={{ bgcolor: 'blue.dark', color: 'white', py: 8, textAlign: 'center' }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
          Ready to Join Us?
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
          Don&apos;t miss this opportunity to be part of an amazing spiritual
          experience. Register now to secure your spot!
        </Typography>

        <RegistrationToggle
          registrationType={registrationType}
          setRegistrationType={setRegistrationType}
          background="dark"
        />

        <Button
          onClick={onRegister}
          variant="contained"
          size="large"
          color="secondary"
          sx={{
            px: 5,
            py: 2,
            bgcolor: colors.red,
            fontSize: '1.1rem',
            fontWeight: 700,
            '&:hover': { bgcolor: '#a70f29' },
          }}
        >
          {ctaButtonLabel}
        </Button>
      </Container>
    </Box>
  )
}
