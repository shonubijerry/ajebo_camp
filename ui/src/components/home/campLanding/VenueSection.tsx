import {
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Box,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { colors } from './utils'

interface VenueSectionProps {
  venue?: string | null
  location?: string | null
}

export function VenueSection({ venue, location }: VenueSectionProps) {
  if (!venue) return null

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          color={colors.navy}
          sx={{ mb: 2 }}
        >
          Venue Information
        </Typography>
        <Divider sx={{ mb: 3, borderColor: colors.yellow, borderWidth: 2 }} />
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <LocationOnIcon sx={{ color: colors.red, mt: 0.5 }} />
            <Box>
              <Typography variant="body1" fontWeight={600} color={colors.navy}>
                {venue}
              </Typography>
              {location && (
                <Typography variant="body2" color="text.secondary">
                  {location}
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
