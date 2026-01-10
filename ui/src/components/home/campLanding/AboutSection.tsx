import { Card, CardContent, Divider, Typography } from '@mui/material'
import { colors } from './utils'

interface AboutSectionProps {
  description?: string | null
}

export function AboutSection({ description }: AboutSectionProps) {
  if (!description) return null

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          color={colors.navy}
          sx={{ mb: 2 }}
        >
          About This Camp
        </Typography>
        <Divider sx={{ mb: 3, borderColor: colors.yellow, borderWidth: 2 }} />
        <Typography
          variant="body1"
          sx={{ lineHeight: 1.8, color: colors.navy }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}
