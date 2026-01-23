import React from 'react'
import { Controller, Control } from 'react-hook-form'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Stack,
  Autocomplete,
} from '@mui/material'
import { useApi } from '@/lib/api/useApi'

type CampDistrictFormValues = { camp_id: string; district_id?: string }
type DistrictOption = { id: string; name: string; inputValue?: string }

interface CommonCampDistrictFieldsProps {
  // @eslint-disable-next-line no-any
  control: Control<any>
  camps: { id: string; title: string; year?: number }[]
  filteredDistricts: DistrictOption[]
  districtSearch: string
  onDistrictSearchChange: (value: string) => void
  onDistrictCreated?: (district: { id: string; name: string }) => void
  errors: {
    camp_id?: { message?: string }
    district_id?: { message?: string }
  }
  isLoading: boolean
  showLabel?: boolean
  campDisabled?: boolean
}

export function CommonCampDistrictFields({
  control,
  camps,
  filteredDistricts,
  districtSearch,
  onDistrictSearchChange,
  onDistrictCreated,
  errors,
  isLoading,
  showLabel = true,
  campDisabled = false,
}: CommonCampDistrictFieldsProps) {
  const { $api } = useApi()
  const [isCreatingDistrict, setIsCreatingDistrict] = React.useState(false)
  const createDistrictMutation = $api.useMutation('post', '/api/v1/districts')

  const handleCreateDistrict = async (name: string) => {
    try {
      setIsCreatingDistrict(true)
      const response = await createDistrictMutation.mutateAsync({
        body: { name, zones: [] },
      })
      const newDistrict = { id: response.data.id, name: response.data.name }
      if (onDistrictCreated) {
        onDistrictCreated(newDistrict)
      }
      return newDistrict
    } catch (error) {
      console.error('Failed to create district:', error)
      return null
    } finally {
      setIsCreatingDistrict(false)
    }
  }
  return (
    <Box sx={showLabel ? { p: 2, bgcolor: 'grey.50', borderRadius: 1 } : {}}>
      {showLabel && (
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Common Details
        </Typography>
      )}
      <Stack spacing={2}>
        <Controller<CampDistrictFormValues>
          name="camp_id"
          control={control as Control<CampDistrictFormValues>}
          rules={{ required: 'Camp is required' }}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={!!errors.camp_id}
              disabled={campDisabled}
            >
              <InputLabel>Camp {!campDisabled ? '*' : ''}</InputLabel>
              <Select {...field} label={`Camp ${!campDisabled ? '*' : ''}`}>
                {!campDisabled && <MenuItem value="">Select Camp</MenuItem>}
                {camps.map((camp) => (
                  <MenuItem key={camp.id} value={camp.id}>
                    {camp.title} {camp.year && `(${camp.year})`}
                  </MenuItem>
                ))}
              </Select>
              {errors.camp_id && (
                <Typography variant="caption" color="error">
                  {errors.camp_id.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
        <Controller<CampDistrictFormValues>
          name="district_id"
          control={control as Control<CampDistrictFormValues>}
          rules={showLabel ? { required: 'District is required' } : {}}
          render={({ field }) => (
            <Autocomplete
              options={filteredDistricts}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option
                return option.name || ''
              }}
              value={
                filteredDistricts.find((d) => d.id === field.value) || null
              }
              onChange={async (_, value) => {
                if (typeof value !== 'object') {
                  field.onChange(value)
                  return
                }

                if (
                  value?.id?.startsWith('create-') &&
                  value?.name?.length > 0
                ) {
                  // User entered a new district name
                  const newDistrict = await handleCreateDistrict(value.name)
                  if (newDistrict) {
                    field.onChange(newDistrict.id)
                  }
                } else {
                  field.onChange(value?.id || '')
                }
              }}
              inputValue={districtSearch}
              onInputChange={(_, value) => onDistrictSearchChange(value)}
              loading={isLoading || isCreatingDistrict}
              disabled={isLoading || campDisabled || isCreatingDistrict}
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              filterOptions={(options, params) => {
                const filtered = options.filter((option) =>
                  option.name
                    .toLowerCase()
                    .includes(params.inputValue.toLowerCase()),
                )

                const { inputValue } = params
                const isExisting = options.some(
                  (option) =>
                    inputValue.toLowerCase() === option.name.toLowerCase(),
                )

                if (inputValue !== '' && inputValue.length > 1 && !isExisting) {
                  filtered.push({
                    id: `create-${inputValue}`,
                    name: inputValue,
                    inputValue,
                  })
                }

                return filtered
              }}
              renderOption={(props, option: DistrictOption) => {
                if (option.id?.startsWith('create-')) {
                  return (
                    <li {...props} key={option.id}>
                      <Typography color="primary" fontWeight={600}>
                        {option.name}
                      </Typography>
                    </li>
                  )
                }
                return (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`District ${showLabel ? '*' : ''}`}
                  error={!!errors.district_id}
                  helperText={
                    errors.district_id?.message ||
                    (isCreatingDistrict ? 'Creating new district...' : '')
                  }
                />
              )}
            />
          )}
        />
      </Stack>
    </Box>
  )
}
