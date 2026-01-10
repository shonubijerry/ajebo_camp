'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useApi } from '@/lib/api/useApi'
import { Entity } from '@/interfaces'

interface EntityFormProps {
  entity?: Entity & { id?: string }
  mode: 'create' | 'edit' | 'view'
  onSuccess: () => void
  onCancel: () => void
}

export default function EntityForm({
  entity,
  mode,
  onSuccess,
  onCancel,
}: EntityFormProps) {
  const { $api } = useApi()
  const [error, setError] = React.useState<string | null>(null)
  const isView = mode === 'view'

  const createMutation = $api.useMutation('post', '/api/v1/entities')
  const updateMutation = $api.useMutation('patch', '/api/v1/entities/{id}')

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Entity>({
    defaultValues: {
      name: entity?.name || '',
    },
  })

  const onSubmit = async (data: Entity) => {
    try {
      setError(null)
      if (mode === 'create') {
        await createMutation.mutateAsync({ body: data })
      } else if (mode === 'edit' && entity?.id) {
        await updateMutation.mutateAsync({
          params: { path: { id: entity.id } },
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
          name="name"
          control={control}
          rules={{ required: 'Entity name is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Entity Name"
              fullWidth
              disabled={isView}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
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
