'use client'

import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { RegistrationType } from './types'
import { colors, formatDateShort } from './utils'
import { RegistrationToggle } from './RegistrationToggle'
import { Camp } from '@/interfaces'

interface HeroSectionProps {
  camp: Camp
  campStatus: string
  canRegister: boolean
  registrationType: RegistrationType
  setRegistrationType: (value: RegistrationType) => void
  registrationButtonLabel: string
  heroPrimaryLabel: string
  onRegister: () => void
  onDonate: () => void
}

export function HeroSection({
  camp,
  campStatus,
  canRegister,
  registrationType,
  setRegistrationType,
  registrationButtonLabel,
  heroPrimaryLabel,
  onRegister,
  onDonate,
}: HeroSectionProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundImage: camp.banner
          ? `linear-gradient(rgba(11, 28, 63, 0.75), rgba(11, 28, 63, 0.85)), url(${camp.banner})`
          : `linear-gradient(135deg, ${colors.blue} 0%, ${colors.navy} 50%, ${colors.red} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        <Stack spacing={3} sx={{ maxWidth: 800 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label={campStatus}
              color={
                canRegister
                  ? 'success'
                  : camp.is_coming_soon
                    ? 'info'
                    : 'default'
              }
              sx={{ fontWeight: 700, fontSize: '0.9rem' }}
            />
            <Chip label={camp.year} color="secondary" />
          </Stack>

          <Typography
            variant="h2"
            fontWeight={900}
            lineHeight={1.1}
            sx={{
              textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            {camp.title}
          </Typography>

          {camp.theme && (
            <Typography
              variant="h4"
              fontWeight={600}
              sx={{
                textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
                fontSize: { xs: '1.5rem', md: '2rem' },
                opacity: 0.95,
              }}
            >
              {camp.theme}
            </Typography>
          )}

          {camp.verse && (
            <Paper
              sx={{
                p: 2.5,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontStyle: 'italic',
                  color: 'white',
                  fontSize: '1.1rem',
                }}
              >
                &ldquo;{camp.verse}&rdquo;
              </Typography>
            </Paper>
          )}

          <Stack direction="row" spacing={2} sx={{ pt: 2 }} flexWrap="wrap">
            {canRegister && (
              <Button
                onClick={onRegister}
                variant="contained"
                size="large"
                color="secondary"
                sx={{ px: 4, py: 1.8, fontSize: '1.1rem', fontWeight: 700 }}
              >
                {heroPrimaryLabel}
              </Button>
            )}

            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.8,
                borderColor: 'white',
                color: 'secondary',
                fontSize: '1.1rem',
                fontWeight: 700,
                '&:hover': {
                  borderColor: colors.yellow,
                  bgcolor: 'rgba(255, 255, 255, 0.274)',
                },
              }}
              href="#details"
            >
              Learn More
            </Button>

            {canRegister && (
              <Button
                onClick={onDonate}
                variant="outlined"
                size="large"
                startIcon={<FavoriteBorderIcon />}
                sx={{
                  px: 4,
                  py: 1.8,
                  borderColor: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: colors.yellow,
                    bgcolor: 'rgba(255, 255, 255, 0.274)',
                  },
                }}
              >
                Donate
              </Button>
            )}
          </Stack>

          {camp.registration_deadline && canRegister && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Registration closes: {formatDateShort(camp.registration_deadline)}
            </Typography>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
