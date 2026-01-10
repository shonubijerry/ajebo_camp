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
import ForgotPassword from './ForgotPassword'
import { useApi } from '@/lib/api/useApi'

type FormValues = {
  email: string
  password: string
}

interface LoginFormProps {
  onSuccess?: (token: string) => void
  onSignupClick?: () => void
  showDivider?: boolean
}

export default function LoginForm({
  onSuccess,
  onSignupClick,
  showDivider = true,
}: LoginFormProps) {
  const [open, setOpen] = React.useState(false)
  const { $api } = useApi()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = $api.useMutation('post', '/api/v1/auth/login', {
    onError(error: unknown) {
      setError('root', {
        type: 'server',
        message: (error as Error)?.message ?? 'Login failed',
      })
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await loginMutation.mutateAsync({
        body: values,
      })

      if (result.data?.token) {
        localStorage.setItem('token', result.data.token)
        onSuccess?.(result.data.token)
      }
    } catch (err: unknown) {
      setError('root', {
        type: 'server',
        message: (err as Error)?.message ?? 'Login failed',
      })
    }
  }

  return (
    <>
      <Typography component="h1" variant="h4">
        Sign in
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
            })}
          />
        </FormControl>

        <Button
          type="submit"
          color="secondary"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>

        <Link
          component="button"
          type="button"
          onClick={() => setOpen(true)}
          align="center"
        >
          Forgot your password?
        </Link>
      </Box>

      {showDivider && (
        <>
          <Divider>or</Divider>

          <Typography align="center">
            Don&apos;t have an account?{' '}
            {onSignupClick ? (
              <Link component="button" type="button" onClick={onSignupClick}>
                Sign up
              </Link>
            ) : (
              <Link href="/portal/signup">Sign up</Link>
            )}
          </Typography>
        </>
      )}

      <ForgotPassword open={open} handleClose={() => setOpen(false)} />
    </>
  )
}
