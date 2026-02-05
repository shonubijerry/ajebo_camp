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
  Typography,
} from '@mui/material'
import { useApi } from '@/lib/api/useApi'
import { useDistrictSearch } from '@/hooks/useDistrictSearch'
import { CommonCampDistrictFields } from './CommonCampDistrictFields'
import { Campite } from '@/interfaces'

interface CampitesFormProps {
  campite?: Campite & { id?: string }
  mode: 'create' | 'edit' | 'view'
  onSuccess: () => void
  onCancel: () => void
}

const AGE_GROUPS = ['11-20', '21-30', '31-40', '41-50', 'above 50']
const GENDERS = ['male', 'female']
const CAMPITE_TYPES = ['regular', 'premium']

export default function CampitesForm({
  campite,
  mode,
  onSuccess,
  onCancel,
}: CampitesFormProps) {
  const { $api } = useApi()
  const [error, setError] = React.useState<string | null>(null)
  const [allocationSelections, setAllocationSelections] = React.useState<
    Record<string, string>
  >({})
  const isView = mode === 'view'

  const {
    districtSearch,
    setDistrictSearch,
    filteredDistricts,
    isLoading: districtLoading,
    refreshDistricts,
  } = useDistrictSearch()

  const createMutation = $api.useMutation('post', '/api/v1/campites')
  const updateMutation = $api.useMutation('patch', '/api/v1/campites/{id}')

  const currentDate = React.useMemo(() => new Date().toISOString(), [])
  const campsQuery = $api.useQuery('get', '/api/v1/camps/list', {
    params: {
      query: {
        page: 0,
        per_page: 1000,
        filter: `[end_date][gt]=${currentDate}`,
      },
    },
  })

  const allocationsQuery = $api.useQuery(
    'get',
    '/api/v1/camp-allocations/list',
    {
      params: { query: { page: 0, per_page: 100 } },
    },
  )

  const camps = campsQuery.data?.data || []

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Campite>({
    defaultValues: {
      firstname: campite?.firstname || '',
      lastname: campite?.lastname || '',
      email: campite?.email ?? undefined,
      phone: campite?.phone || '',
      age_group: campite?.age_group || '',
      gender: campite?.gender || '',
      camp_id: campite?.camp_id || '',
      user_id: campite?.user_id || '',
      district_id: campite?.district_id || '',
      payment_ref: campite?.payment_ref || '',
      type: campite?.type || 'regular',
      amount: campite?.amount || undefined,
      allocated_items: campite?.allocated_items || '',
    },
  })

  const selectedCampId = watch('camp_id')

  const campAllocations = React.useMemo(() => {
    const all = allocationsQuery.data?.data || []
    return all.filter((a) => a.camp_id === selectedCampId)
  }, [allocationsQuery.data, selectedCampId])

  React.useEffect(() => {
    const allocationItems = campite?.allocated_items
      ? campite.allocated_items.split(',')
      : []

    const initialSelections: Record<string, string> = {}
    campAllocations.forEach((allocation, index: number) => {
      const itemsRaw = allocation.items
      const items = Array.isArray(itemsRaw)
        ? itemsRaw.filter((i): i is string => typeof i === 'string')
        : []
      const currentItem = allocationItems[index]
      const id = allocation.id
      initialSelections[id] =
        currentItem && items.includes(currentItem)
          ? currentItem
          : items[0] || ''
    })

    setAllocationSelections(initialSelections)
  }, [campAllocations, campite?.allocated_items])

  React.useEffect(() => {
    const orderedSelections = campAllocations.map((allocation) => {
      const id = allocation.id
      return allocationSelections[id] || ''
    })
    setValue('allocated_items', orderedSelections.join(','))
  }, [allocationSelections, campAllocations, setValue])

  const handleAllocationItemChange = (allocationId: string, value: string) => {
    setAllocationSelections((prev) => ({ ...prev, [allocationId]: value }))
  }

  const onSubmit = async (data: Campite) => {
    try {
      setError(null)
      const payload = {
        ...data,
        camp_id: data.camp_id,
        amount: data.amount,
        payment_ref: data.payment_ref,
      }
      if (mode === 'create') {
        await createMutation.mutateAsync({ body: payload })
      } else if (mode === 'edit' && campite?.id) {
        await updateMutation.mutateAsync({
          params: { path: { id: campite.id } },
          body: payload,
        })
      }
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    campsQuery.isLoading ||
    districtLoading ||
    allocationsQuery.isLoading

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
            pattern: {
              value: /^[A-Z0-9._%+-]*@?[A-Z0-9.-]*\.[A-Z]{2,}?$/i,
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
          rules={{ required: 'Phone number is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone Number"
              fullWidth
              disabled={isView}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          )}
        />

        <Controller
          name="age_group"
          control={control}
          rules={{ required: 'Age group is required' }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.age_group} disabled={isView}>
              <InputLabel>Age Group</InputLabel>
              <Select {...field} label="Age Group">
                {AGE_GROUPS.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
              {errors.age_group && (
                <FormHelperText>{errors.age_group.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="gender"
          control={control}
          rules={{ required: 'Gender is required' }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.gender} disabled={isView}>
              <InputLabel>Gender</InputLabel>
              <Select {...field} label="Gender">
                {GENDERS.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
              {errors.gender && (
                <FormHelperText>{errors.gender.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <CommonCampDistrictFields
          control={control}
          camps={camps}
          filteredDistricts={filteredDistricts}
          districtSearch={districtSearch}
          onDistrictSearchChange={setDistrictSearch}
          onDistrictCreated={(district) => {
            refreshDistricts()
            setValue('district_id', district.id)
          }}
          errors={errors}
          isLoading={districtLoading}
          showLabel={false}
          campDisabled={isView}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth disabled={isView}>
              <InputLabel>Type</InputLabel>
              <Select {...field} label="Type">
                {CAMPITE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Amount"
              fullWidth
              disabled
              InputProps={{ readOnly: true }}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />
          )}
        />

        <Controller
          name="payment_ref"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Payment Reference"
              fullWidth
              disabled
              InputProps={{ readOnly: true }}
              helperText={!field.value ? 'No payment reference' : undefined}
            />
          )}
        />

        <Stack spacing={1}>
          <Typography variant="subtitle2">Allocations</Typography>

          {campAllocations.length === 0 && (
            <FormHelperText>
              There are no allocations for this camp.
            </FormHelperText>
          )}

          {campAllocations.map((allocation) => {
            const items = allocation?.items ?? []

            return (
              <FormControl
                key={allocation.id}
                fullWidth
                disabled={isView || items.length === 0}
              >
                <InputLabel>{allocation.name}</InputLabel>
                <Select
                  value={allocationSelections[allocation.id] || ''}
                  label={allocation.name}
                  onChange={(e) =>
                    handleAllocationItemChange(
                      allocation.id,
                      e.target.value as string,
                    )
                  }
                >
                  {items.map((item: string) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {items.length === 0
                    ? 'No items available for this allocation'
                    : 'Select item for this allocation'}
                </FormHelperText>
              </FormControl>
            )
          })}
        </Stack>

        <Controller
          name="allocated_items"
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
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
