import { Card, CardContent, Stack, Typography } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { colors } from './utils'

interface ContactCardProps {
  contactEmail?: string | null
  contactPhone?: string | null
  isActive: boolean
}

export function ContactCard({
  contactEmail,
  contactPhone,
  isActive,
}: ContactCardProps) {
  if (!contactEmail && !contactPhone) return null

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        border: `2px solid ${isActive ? colors.red : colors.light}`,
      }}
      style={{ background: 'transparent' }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight={800}
          color={colors.navy}
          sx={{ mb: 2 }}
        >
          Contact Us
        </Typography>
        <Stack spacing={2}>
          {contactEmail && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <EmailIcon sx={{ color: colors.red }} />
              <Typography
                variant="body2"
                sx={{ wordBreak: 'break-word', color: colors.navy }}
              >
                {contactEmail}
              </Typography>
            </Stack>
          )}
          {contactPhone && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PhoneIcon sx={{ color: colors.red }} />
              <Typography variant="body2" color={colors.navy}>
                {contactPhone}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
