'use client'

import { Box, Container, Grid, Stack, Typography } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import InfoIcon from '@mui/icons-material/Info'
import { getCampDuration, formatDateShort } from './utils'
import { Camp } from '@/interfaces'

interface QuickInfoBarProps {
  camp: Camp
  formatMoney: (amount: number) => string
}

export function QuickInfoBar({ camp, formatMoney }: QuickInfoBarProps) {
  return (
    <Box
      sx={{
        bgcolor: 'blue.main',
        color: 'white',
        py: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        flexShrink: 0,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
            >
              <CalendarTodayIcon />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Dates
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatDateShort(camp.start_date)} -{' '}
                  {formatDateShort(camp.end_date)}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
            >
              <EventAvailableIcon />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Duration
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {getCampDuration(camp.start_date, camp.end_date)}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {camp.highlights.location && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="center"
              >
                <LocationOnIcon />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Location
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {camp.highlights.location}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
            >
              <InfoIcon />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Fee
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatMoney(camp.fee)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
