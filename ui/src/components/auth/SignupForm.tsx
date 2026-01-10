import * as React from 'react'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { useApi } from '@/lib/api/useApi'

type FormValues = {
  firstname: string
  lastname: string
  email: string
  password: string
}

interface SignupFormProps {
  onSuccess?: (token: string) => void
  onLoginClick?: () => void
  showDivider?: boolean
}

export default function SignupForm({
  onSuccess,
  onLoginClick,
  showDivider = true,
}: SignupFormProps) {
  const { $api } = useApi()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
    },
  })

  const signupMutation = $api.useMutation('post', '/api/v1/auth/signup', {
    onError(error: unknown) {
      setError('root', {
        type: 'server',
        message: (error as Error)?.message ?? 'Signup failed',
      })
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await signupMutation.mutateAsync({
        body: values,
      })

      if (result.data?.token) {
        localStorage.setItem('token', result.data.token)
        onSuccess?.(result.data.token)
      }
    } catch (err: unknown) {
      setError('root', {
        type: 'server',
        message: (err as Error)?.message ?? 'Signup failed',
      })
    }
  }

  return (
    <>
      <Typography component="h1" variant="h4">
        Create your account
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {errors.root && (
          <Typography color="error" align="center">
            {errors.root.message}
          </Typography>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <FormLabel>First name</FormLabel>
            <TextField
              error={!!errors.firstname}
              helperText={errors.firstname?.message}
              {...register('firstname', {
                required: 'First name is required',
              })}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Last name</FormLabel>
            <TextField
              error={!!errors.lastname}
              helperText={errors.lastname?.message}
              {...register('lastname', {
                required: 'Last name is required',
              })}
            />
          </FormControl>
        </Stack>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <TextField
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Invalid email',
              },
            })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Password</FormLabel>
          <TextField
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Minimum 6 characters',
              },
            })}
          />
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Sign up'}
        </Button>
      </Box>

      {showDivider && (
        <>
          <Divider>or</Divider>

          <Typography align="center">
            Already have an account?{' '}
            {onLoginClick ? (
              <Link component="button" type="button" onClick={onLoginClick}>
                Sign in
              </Link>
            ) : (
              <Link href="/admin">Sign in</Link>
            )}
          </Typography>
        </>
      )}
    </>
  )
}
