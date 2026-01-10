import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import { RegistrationType, SetRegistrationType } from './types'
import { colors, formatDateShort, formatMoney } from './utils'
import { RegistrationToggle } from './RegistrationToggle'
import { Camp } from '@/interfaces'

interface RegistrationCardProps {
  camp: Camp
  canRegister: boolean
  registrationType: RegistrationType
  setRegistrationType: SetRegistrationType
  registrationButtonLabel: string
  onRegister: () => void
}

export function RegistrationCard({
  camp,
  canRegister,
  registrationType,
  setRegistrationType,
  registrationButtonLabel,
  onRegister,
}: RegistrationCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        border: `2px solid ${canRegister ? colors.red : colors.light}`,
        position: 'sticky',
        top: 20,
        paddingBottom: 4,
      }}
      style={{ background: 'transparent' }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography
          variant="h6"
          fontWeight={800}
          color={colors.navy}
          sx={{ mb: 2 }}
        >
          Registration Fee
        </Typography>
        <Typography
          variant="h3"
          fontWeight={900}
          color={colors.red}
          sx={{ mb: 1 }}
        >
          {formatMoney(camp.fee)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          per participant
        </Typography>

        {camp.premium_fees && camp.premium_fees.length > 0 && (
          <Box sx={{ mb: 3, p: 2, bgcolor: colors.light, borderRadius: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1 }}
              style={{ color: colors.navy }}
            >
              Premium Options Available
            </Typography>
            <Stack spacing={0.5}>
              {camp.premium_fees.map((fee, index) => (
                <Typography key={index} variant="body2" color={colors.navy}>
                  • {formatMoney(fee)}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}

        <RegistrationToggle
          registrationType={registrationType}
          setRegistrationType={setRegistrationType}
        />

        <Button
          onClick={onRegister}
          variant="contained"
          fullWidth
          size="large"
          disabled={!canRegister}
          color="secondary"
          sx={{ py: 1.5, fontWeight: 700 }}
        >
          {canRegister ? registrationButtonLabel : 'Registration Closed'}
        </Button>

        {camp.registration_deadline && canRegister && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: 'block', textAlign: 'center' }}
          >
            Registration closes: {formatDateShort(camp.registration_deadline)}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
