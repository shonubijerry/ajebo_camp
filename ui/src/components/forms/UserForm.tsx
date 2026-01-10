'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useApi } from '@/lib/api/useApi'
import { User } from '@/interfaces'

interface UserFormProps {
  user?: User & { id?: string }
  mode: 'create' | 'edit' | 'view'
  onSuccess: () => void
  onCancel: () => void
}

export default function UserForm({
  user,
  mode,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const { $api } = useApi()
  const [error, setError] = React.useState<string | null>(null)
  const isView = mode === 'view'

  const createMutation = $api.useMutation('post', '/api/v1/users')
  const updateMutation = $api.useMutation('patch', '/api/v1/users/{id}')

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    defaultValues: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'user',
    },
  })

  const onSubmit = async (data: User) => {
    try {
      setError(null)
      if (mode === 'create') {
        await createMutation.mutateAsync({ body: data })
      } else if (mode === 'edit' && user?.id) {
        await updateMutation.mutateAsync({
          params: { path: { id: user.id } },
          body: data,
        })
      }
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Controller
          name="firstname"
          control={control}
          rules={{ required: 'First name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="First Name"
              fullWidth
              disabled={isView}
              error={!!errors.firstname}
              helperText={errors.firstname?.message}
            />
          )}
        />

        <Controller
          name="lastname"
          control={control}
          rules={{ required: 'Last name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Last Name"
              fullWidth
              disabled={isView}
              error={!!errors.lastname}
              helperText={errors.lastname?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              disabled={isView}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone Number"
              fullWidth
              disabled={isView}
              value={field.value || ''}
            />
          )}
        />

        <Controller
          name="role"
          control={control}
          rules={{ required: 'Role is required' }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.role} disabled={isView}>
              <InputLabel>Role</InputLabel>
              <Select {...field} label="Role">
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              {errors.role && (
                <FormHelperText>{errors.role.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {!isView && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </Stack>
        )}
      </Stack>
    </form>
  )
}
