'use client'

import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { RegistrationType, SetRegistrationType } from './types'

interface RegistrationToggleProps {
  registrationType: RegistrationType
  setRegistrationType: SetRegistrationType
  background?: 'light' | 'dark'
}

export function RegistrationToggle({
  registrationType,
  setRegistrationType,
  background = 'light',
}: RegistrationToggleProps) {
  return (
    <Stack spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
      <ToggleButtonGroup
        value={registrationType}
        exclusive
        onChange={(_, value) => value && setRegistrationType(value)}
        color="primary"
        sx={{
          background: '#ffffffda',
        }}
      >
        <ToggleButton
          value="individual"
          sx={{ fontWeight: 700 }}
          style={{
            color: registrationType === 'individual' ? 'red' : 'grey',
          }}
        >
          Individual
        </ToggleButton>
        <ToggleButton
          value="group"
          sx={{ fontWeight: 700 }}
          style={{
            color: registrationType === 'group' ? 'red' : 'grey',
          }}
        >
          Group
        </ToggleButton>
      </ToggleButtonGroup>
      <Typography
        variant="caption"
        sx={{ opacity: 0.85, pt: 2 }}
        style={{ color: background === 'light' ? 'black' : 'inherit' }}
      >
        Group registration continues in the portal.
      </Typography>
    </Stack>
  )
}
