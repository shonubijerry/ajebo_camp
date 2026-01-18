'use client'

import React from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import {
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Box,
  Paper,
  FormHelperText,
  TextareaAutosize,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useApi } from '@/lib/api/useApi'
import { CreateCampRequest } from '@/interfaces'
import { getMediaUrl } from '@/lib/media'

interface CampAllocation {
  id?: string
  name: string
  items: string
  allocation_type: 'random' | 'definite'
}

interface MinisterInput {
  id?: string
  name: string
  designation: string
}

interface CampFormData extends Omit<
  CreateCampRequest,
  'allocations' | 'highlights'
> {
  allocations: CampAllocation[]
  highlights_location?: string
  highlights_description?: string
  highlights_activities_input?: string
  highlights_ministers: MinisterInput[]
}

interface CampFormProps {
  camp?: CreateCampRequest & { id?: string }
  mode: 'create' | 'edit' | 'view'
  onSuccess: () => void
  onCancel: () => void
}

export default function CampForm({
  camp,
  mode,
  onSuccess,
  onCancel,
}: CampFormProps) {
  const { $api } = useApi()
  const [error, setError] = React.useState<string | null>(null)
  const [bannerFile, setBannerFile] = React.useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = React.useState<string | null>(
    getMediaUrl(camp?.banner),
  )
  const isView = mode === 'view'

  const createCampMutation = $api.useMutation('post', '/api/v1/camps')
  const updateCampMutation = $api.useMutation('patch', '/api/v1/camps/{id}')
  const createAllocationMutation = $api.useMutation(
    'post',
    '/api/v1/camp-allocations',
  )
  const updateAllocationMutation = $api.useMutation(
    'patch',
    '/api/v1/camp-allocations/{id}',
  )

  const entitiesResult = $api.useQuery('get', '/api/v1/entities/list', {
    params: { query: { page: 1, per_page: 100 } },
  })

  const allocationsResult = $api.useQuery(
    'get',
    '/api/v1/camp-allocations/list',
    {
      params: { query: { page: 1, per_page: 100, camp_id: camp?.id } },
      queryKey: ['camp-allocations', camp?.id],
    },
    { enabled: !!camp?.id && mode === 'edit' },
  )

  const entities = entitiesResult.data?.success ? entitiesResult.data.data : []
  const existingAllocations = React.useMemo(
    () => (allocationsResult.data?.success ? allocationsResult.data.data : []),
    [allocationsResult.data],
  )

  const token = localStorage.getItem('token')
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6001'

  // Helper to format date for display in input
  const formatDateForInput = (value: string | null | undefined): string => {
    return value ? new Date(value).toISOString().split('T')[0] : ''
  }

  // Helper to convert date input to ISO string
  const handleDateChange = (
    dateValue: string,
    onChange: (value: string) => void,
  ) => {
    if (dateValue) {
      onChange(new Date(dateValue).toISOString())
    } else {
      onChange('')
    }
  }

  const getCampDefaults = React.useCallback(
    (includeAllocations = false): Partial<CampFormData> => ({
      title: camp?.title || '',
      theme: camp?.theme || '',
      verse: camp?.verse || '',
      banner: camp?.banner || '',
      entity_id: camp?.entity_id || '',
      year: camp?.year || new Date().getFullYear(),
      fee: camp?.fee || 0,
      registration_deadline: camp?.registration_deadline || '',
      contact_email: camp?.contact_email || '',
      contact_phone: camp?.contact_phone || '',
      start_date: camp?.start_date || '',
      end_date: camp?.end_date || '',
      highlights_location: camp?.highlights?.location || '',
      highlights_description: camp?.highlights?.description || '',
      highlights_activities_input:
        camp?.highlights?.activities?.join(', ') || '',
      highlights_ministers:
        camp?.highlights?.ministers && camp.highlights.ministers.length > 0
          ? camp.highlights.ministers
          : [{ name: '', designation: '' }],
      allocations: includeAllocations
        ? existingAllocations.map((a) => ({
            id: a.id,
            name: a.name || '',
            items: Array.isArray(a.items) ? a.items.join(', ') : '',
            allocation_type:
              (a.allocation_type as 'random' | 'definite') || 'random',
          }))
        : [],
    }),
    [camp, existingAllocations],
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    register,
  } = useForm<CampFormData>({
    defaultValues: getCampDefaults(),
  })

  React.useEffect(() => {
    if (mode === 'edit' && existingAllocations.length > 0) {
      reset(getCampDefaults(true))
    }
  }, [mode, existingAllocations, reset, getCampDefaults])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'allocations',
  })

  const {
    fields: ministerFields,
    append: appendMinister,
    remove: removeMinister,
  } = useFieldArray({
    control,
    name: 'highlights_ministers',
  })

  const onSubmit = async (data: CampFormData) => {
    try {
      setError(null)
      const {
        allocations,
        highlights_location,
        highlights_description,
        highlights_activities_input,
        highlights_ministers,
        ...rest
      } = data

      const activities = highlights_activities_input
        ? highlights_activities_input
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter(Boolean)
        : []

      const ministers = (highlights_ministers || [])
        .filter((m) => m.name?.trim())
        .map((m) => ({
          name: m.name.trim(),
          designation: m.designation?.trim() || '',
        }))

      const campPayload: CreateCampRequest = {
        ...rest,
        highlights: {
          location: highlights_location || undefined,
          description: highlights_description || undefined,
          activities,
          ministers,
        },
      } as CreateCampRequest

      const buildFormData = (
        payload: CreateCampRequest,
        file: File | null,
      ): FormData => {
        const formData = new FormData()

        if (file) {
          formData.append('banner', file)
        }

        formData.append('title', payload.title)
        formData.append('entity_id', payload.entity_id)
        formData.append('year', payload.year.toString())
        formData.append('fee', payload.fee.toString())
        formData.append('start_date', payload.start_date)
        formData.append('end_date', payload.end_date)

        if (payload.theme) formData.append('theme', payload.theme)
        if (payload.verse) formData.append('verse', payload.verse)
        if (payload.registration_deadline)
          formData.append(
            'registration_deadline',
            payload.registration_deadline,
          )
        if (payload.contact_email)
          formData.append('contact_email', payload.contact_email)
        if (payload.contact_phone)
          formData.append('contact_phone', payload.contact_phone)
        if (payload.highlights) {
          formData.append('highlights', JSON.stringify(payload.highlights))
        }

        return formData
      }

      if (mode === 'create') {
        const requestBody = buildFormData(campPayload, bannerFile)

        const campResponse = await fetch(`${baseUrl}/api/v1/camps`, {
          method: 'POST',
          body: requestBody as any,
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }).then(async (res) => {
          const resp = await res.json() as { data: any; errors?: string; error?: string }

          if (!res.ok) {
            setError(JSON.stringify(resp.errors || resp.error || 'Failed to create camp'))
          }

          return resp.data
        })

        const campId = campResponse?.id

        if (campId && allocations.length > 0) {
          await Promise.all(
            allocations.map((allocation) =>
              createAllocationMutation.mutateAsync({
                body: {
                  camp_id: campId,
                  name: allocation.name,
                  items: allocation.items
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                  allocation_type: allocation.allocation_type,
                },
              }),
            ),
          )
        }
      } else if (mode === 'edit' && camp?.id) {
        const requestBody = buildFormData(campPayload, bannerFile)

        await fetch(`${baseUrl}/api/v1/camps/${camp.id}`, {
          method: 'PATCH',
          body: requestBody as any,
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (allocations.length > 0) {
          await Promise.all(
            allocations.map((allocation) => {
              const allocationBody = {
                camp_id: camp.id!,
                name: allocation.name,
                items: allocation.items
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
                allocation_type: allocation.allocation_type,
              }

              return allocation.id
                ? updateAllocationMutation.mutateAsync({
                    params: { path: { id: allocation.id } },
                    body: allocationBody,
                  })
                : createAllocationMutation.mutateAsync({
                    body: allocationBody,
                  })
            }),
          )
        }
      }
      onSuccess()
    } catch (err: unknown) {
      setError(
        (err as { errors: [{ message: string }] }).errors
          .map((e) => e?.message ?? e)
          .join(', ') || 'Operation failed',
      )
    }
  }

  const isLoading =
    createCampMutation.isPending ||
    updateCampMutation.isPending ||
    createAllocationMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Controller
          name="title"
          control={control}
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              fullWidth
              disabled={isView}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="theme"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Theme"
              fullWidth
              disabled={isView}
              value={field.value || ''}
            />
          )}
        />

        <Controller
          name="verse"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Verse"
              fullWidth
              disabled={isView}
              multiline
              rows={2}
              value={field.value || ''}
            />
          )}
        />

        {!isView && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Banner Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 1 }}
            >
              {bannerFile ? bannerFile.name : 'Choose Banner Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setBannerFile(file)
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setBannerPreview(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  } else {
                    setBannerPreview(getMediaUrl(camp?.banner))
                  }
                }}
              />
            </Button>
            {bannerPreview && (
              <Box sx={{ mt: 1 }}>
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {isView && camp?.banner && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Banner Image
            </Typography>
            <img
              src={getMediaUrl(camp.banner) || ''}
              alt="Camp banner"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        <Controller
          name="entity_id"
          control={control}
          rules={{ required: 'Entity is required' }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.entity_id} disabled={isView}>
              <InputLabel>Entity</InputLabel>
              <Select {...field} label="Entity">
                {entities.map((entity) => (
                  <MenuItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.entity_id && (
                <FormHelperText>{errors.entity_id.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="year"
          control={control}
          rules={{ required: 'Year is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              {...register('year', { valueAsNumber: true })}
              label="Year"
              type="number"
              fullWidth
              disabled={isView}
              error={!!errors.year}
              helperText={errors.year?.message}
            />
          )}
        />

        <Controller
          name="fee"
          control={control}
          rules={{ required: 'Fee is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              {...register('fee', { valueAsNumber: true })}
              label="Fee"
              type="number"
              fullWidth
              disabled={isView}
              error={!!errors.fee}
              helperText={errors.fee?.message}
            />
          )}
        />

        <Controller
          name="registration_deadline"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Registration Deadline"
              type={isView ? 'text' : 'date'}
              fullWidth
              disabled={isView}
              slotProps={{ inputLabel: { shrink: true } }}
              value={formatDateForInput(field.value)}
              onChange={(e) => handleDateChange(e.target.value, field.onChange)}
            />
          )}
        />

        <Controller
          name="contact_email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Contact Email"
              type="email"
              fullWidth
              disabled={isView}
              value={field.value || ''}
            />
          )}
        />

        <Controller
          name="contact_phone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Contact Phone"
              fullWidth
              disabled={isView}
              value={field.value || ''}
            />
          )}
        />

        <Controller
          name="start_date"
          control={control}
          rules={{ required: 'Start date is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Start Date"
              type={isView ? 'text' : 'date'}
              fullWidth
              disabled={isView}
              error={!!errors.start_date}
              helperText={errors.start_date?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              value={formatDateForInput(field.value)}
              onChange={(e) => handleDateChange(e.target.value, field.onChange)}
            />
          )}
        />

        <Controller
          name="end_date"
          control={control}
          rules={{ required: 'End date is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="End Date"
              type={isView ? 'text' : 'date'}
              fullWidth
              disabled={isView}
              error={!!errors.end_date}
              helperText={errors.end_date?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              value={formatDateForInput(field.value)}
              onChange={(e) => handleDateChange(e.target.value, field.onChange)}
            />
          )}
        />

        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Highlights
          </Typography>
          <Stack spacing={2}>
            <Controller
              name="highlights_description"
              control={control}
              render={({ field }) => (
                <TextareaAutosize
                  {...field}
                  placeholder="Description"
                  disabled={isView}
                  minRows={3}
                  value={field.value || ''}
                  style={{ width: '100%', padding: '8px' }}
                />
              )}
            />

            <Controller
              name="highlights_location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Highlights Location"
                  fullWidth
                  disabled={isView}
                  value={field.value || ''}
                />
              )}
            />

            <Controller
              name="highlights_activities_input"
              control={control}
              render={({ field }) => (
                <TextareaAutosize
                  {...field}
                  placeholder="Enter activities separated by commas or one per line. e.g. Worship Sessions, Workshops"
                  disabled={isView}
                  minRows={3}
                  value={field.value || ''}
                  style={{ width: '100%', padding: '8px' }}
                />
              )}
            />

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Ministers
                </Typography>
                {!isView && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      appendMinister({ name: '', designation: '' })
                    }
                    size="small"
                  >
                    Add Minister
                  </Button>
                )}
              </Box>
              <Stack spacing={1.5}>
                {ministerFields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, bgcolor: 'grey.500' }}>
                    <Stack spacing={1.5}>
                      <Controller
                        name={`highlights_ministers.${index}.name`}
                        control={control}
                        rules={{ required: 'Name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Name"
                            fullWidth
                            size="small"
                            disabled={isView}
                            error={!!errors.highlights_ministers?.[index]?.name}
                            helperText={
                              errors.highlights_ministers?.[index]?.name
                                ?.message
                            }
                          />
                        )}
                      />
                      <Controller
                        name={`highlights_ministers.${index}.designation`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Designation"
                            fullWidth
                            size="small"
                            disabled={isView}
                            value={field.value || ''}
                          />
                        )}
                      />
                      {!isView && (
                        <Box
                          sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeMinister(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {!isView && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Camp Allocations
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  append({ name: '', items: '', allocation_type: 'random' })
                }
                size="small"
              >
                Add Allocation
              </Button>
            </Box>

            <Stack spacing={2}>
              {fields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2, bgcolor: 'grey.500' }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        Allocation {index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Controller
                      name={`allocations.${index}.name`}
                      control={control}
                      rules={{ required: 'Name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Name"
                          placeholder="e.g., Prayer Boot"
                          fullWidth
                          size="small"
                          error={!!errors.allocations?.[index]?.name}
                          helperText={
                            errors.allocations?.[index]?.name?.message
                          }
                        />
                      )}
                    />

                    <Controller
                      name={`allocations.${index}.items`}
                      control={control}
                      rules={{ required: 'Items are required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Items (comma-separated)"
                          placeholder="e.g., Boot 1, Boot 2, Boot 3"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          error={!!errors.allocations?.[index]?.items}
                          helperText={
                            errors.allocations?.[index]?.items?.message
                          }
                        />
                      )}
                    />

                    <Controller
                      name={`allocations.${index}.allocation_type`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Allocation Type</InputLabel>
                          <Select {...field} label="Allocation Type">
                            <MenuItem value="random">Random</MenuItem>
                            <MenuItem value="definite">Definite</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {isView && existingAllocations.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Camp Allocations
            </Typography>
            <Stack spacing={2}>
              {existingAllocations.map((allocation) => (
                <Paper key={allocation.id} sx={{ p: 2, bgcolor: 'grey.500' }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {allocation.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Items
                      </Typography>
                      <Typography variant="body2">
                        {Array.isArray(allocation.items)
                          ? allocation.items.join(', ')
                          : allocation.items}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Allocation Type
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {allocation.allocation_type}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

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
