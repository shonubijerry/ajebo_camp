'use client'

import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Stack from '@mui/material/Stack'
import MuiCard from '@mui/material/Card'
import { styled } from '@mui/material/styles'

import ColorModeSelect from '@/components/theme/ColorModeSelect'
import { SitemarkIcon } from '@/components/auth/CustomIcons'
import SignupForm from '@/components/auth/SignupForm'
import { useRouter } from 'next/navigation'

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
}))

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: '100dvh',
  padding: theme.spacing(2),
}))

export default function SignUp() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/portal/dashboard')
  }

  return (
    <SignUpContainer direction="column">
      <CssBaseline />
      <ColorModeSelect sx={{ position: 'fixed', top: 16, right: 16 }} />

      <Card variant="outlined">
        <SitemarkIcon />
        <SignupForm onSuccess={handleSuccess} />
      </Card>
    </SignUpContainer>
  )
}
