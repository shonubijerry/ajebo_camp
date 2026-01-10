'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import { usePaystackPayment } from '@/hooks/usePaystackPayment'

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

interface DonationFormProps {
  campTitle: string
  onSuccess: () => void
  onClose: () => void
}

interface DonationFormData {
  fullname: string
  email: string
  amount: number
  isAnonymous: boolean
}

export default function DonationForm({
  campTitle,
  onSuccess,
}: DonationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DonationFormData>({
    defaultValues: {
      fullname: '',
      email: '',
      amount: 1000,
      isAnonymous: false,
    },
  })

  const isAnonymous = watch('isAnonymous')
  const amount = watch('amount')
  const { paystackReady, processPayment } = usePaystackPayment()
  const [showThankYou, setShowThankYou] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: DonationFormData) => {
    setError(null)

    if (!paystackReady) {
      setError('Payment service is not ready. Please try again.')
      return
    }

    if (amount <= 100) {
      setError('Please enter a valid donation amount.')
      return
    }

    const emailToUse = data.email?.trim()
      ? data.email.trim()
      : `kc@foursquareyouth.org.ng`

    processPayment({
      email: emailToUse,
      amount: amount,
      onSuccess: () => {
        setShowThankYou(true)
        // Auto-close after 3 seconds
        setTimeout(() => {
          onSuccess()
        }, 5000)
      },
      onCancel: () => {
        setError('Payment cancelled. Please try again.')
      },
      onError: (err: unknown) => {
        setError((err as Error)?.message || 'Payment failed. Please try again.')
      },
    })
  }

  if (showThankYou) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#2e7d32' }}>
          Thank You! 🙏
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Your donation to {campTitle} has been received.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Closing in a moment...
        </Typography>
        <CircularProgress sx={{ mt: 3 }} />
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Donate to {campTitle}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Donation Amount (₦)"
          type="number"
          inputProps={{ step: '100', min: '100' }}
          fullWidth
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 100, message: 'Minimum donation is ₦100' },
          })}
          error={!!errors.amount}
          helperText={errors.amount?.message}
        />

        <FormControlLabel
          control={<Checkbox {...register('isAnonymous')} color="primary" />}
          label="Make this donation anonymous"
        />

        {!isAnonymous && (
          <>
            <TextField
              label="Full Name"
              fullWidth
              {...register('fullname', {
                required: !isAnonymous ? 'Full name is required' : false,
              })}
              error={!!errors.fullname}
              helperText={errors.fullname?.message}
            />
          </>
        )}

        <TextField
          label="Email Address (optional)"
          type="email"
          fullWidth
          {...register('email', {
            validate: (value) =>
              !value || EMAIL_REGEX.test(value) || 'Invalid email address',
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={isSubmitting || !paystackReady}
          sx={{ py: 1.5 }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            'Donate Now'
          )}
        </Button>
      </Stack>
    </Box>
  )
}
