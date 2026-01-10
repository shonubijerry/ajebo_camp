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
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Select,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import Script from 'next/script'
import { useApi } from '@/lib/api/useApi'
import { generateRandomPaymentRef } from '@/lib/payments'
import { useDistrictSearch } from '@/hooks/useDistrictSearch'
import { usePaystackPayment } from '@/hooks/usePaystackPayment'
import { CommonCampDistrictFields } from './CommonCampDistrictFields'
import { useParams } from 'next/navigation'

interface CampiteData {
  firstname: string
  lastname: string
  phone: string
  age_group: string
  gender: string
}

interface CampitesBulkFormProps {
  mode: 'create' | 'edit' | 'view'
  onSuccess: () => void
  onCancel: () => void
}

interface FormData {
  camp_id: string
  district_id: string
  campites: CampiteData[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const AGE_GROUPS = ['11-20', '21-30', '31-40', '41-50', 'above 50']
const GENDERS = ['male', 'female']

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

// Common fields component to reduce duplication
// Removed unused CommonFieldsProps interface

export default function CampitesBulkForm({
  mode,
  onSuccess,
  onCancel,
}: CampitesBulkFormProps) {
  const { $api } = useApi()
  const [error, setError] = React.useState<string | null>(null)
  const [tabValue, setTabValue] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)
  const [csvPreview, setCsvPreview] = React.useState<CampiteData[]>([])
  const [showCsvPreview, setShowCsvPreview] = React.useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false)
  const [pendingFormData, setPendingFormData] = React.useState<FormData | null>(
    null,
  )
  const params = useParams()

  const isView = mode === 'view'

  // Use custom hooks
  const {
    districtSearch,
    setDistrictSearch,
    filteredDistricts,
    isLoading: districtLoading,
    refreshDistricts,
  } = useDistrictSearch()
  const { paystackReady, setPaystackReady, processPayment } =
    usePaystackPayment()

  // Fetch data
  const campiteMutation = $api.useMutation('post', '/api/v1/campites/bulk')
  const currentUserQuery = $api.useQuery('get', '/api/v1/users/me')
  const campsQuery = $api.useQuery('get', '/api/v1/camps/list', {
    params: { query: { page: 0, per_page: 100 } },
  })

  const currentUser = currentUserQuery.data?.data
  const camps = campsQuery.data?.data || []
  const loading =
    currentUserQuery.isLoading || campsQuery.isLoading || districtLoading

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      camp_id: params.id ? camps.find((c) => c.id === params.id)?.id || '' : '',
      district_id: '',
      campites: [
        {
          firstname: '',
          lastname: '',
          phone: '',
          age_group: '',
          gender: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'campites',
  })

  const selectedCampId = watch('camp_id')
  const downloadCsvTemplate = () => {
    const headers = ['firstname', 'lastname', 'phone', 'age_group', 'gender']
    const sampleRow = ['John', 'Doe', '08012345678', '21-30', 'male']

    const csvContent = [headers, sampleRow]
      .map((row) => row.join(','))
      .join('\n')
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent),
    )
    element.setAttribute('download', 'campites_template.csv')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const parseCsv = (csvText: string): CampiteData[] => {
    const lines = csvText
      .trim()
      .split('\n')
      .filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const data: CampiteData[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      const row: Record<string, string> = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      if (row.firstname && row.lastname && row.phone) {
        data.push({
          firstname: row.firstname,
          lastname: row.lastname,
          phone: row.phone,
          age_group: row.age_group || '',
          gender: row.gender || '',
        })
      }
    }

    return data
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        const parsed = parseCsv(csvText)
        if (parsed.length > 0) {
          setCsvPreview(parsed)
          setShowCsvPreview(true)
        } else {
          setError('No valid campite data found in CSV')
        }
      } catch {
        setError('Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  const importCsvData = () => {
    reset({
      ...watch(),
      campites: csvPreview,
    })
    setShowCsvPreview(false)
    setTabValue(0)
  }

  // Calculate total amount for all campites
  const calculateTotalAmount = (campites: CampiteData[]): number => {
    // This assumes a standard fee per campite, adjust as needed
    const pricePerCampite = camps.find((c) => c.id === selectedCampId)?.fee ?? 0
    return campites.length * pricePerCampite
  }

  const submitWithPayment = async (data: FormData) => {
    try {
      setSubmitting(true)
      setError(null)

      // Validate
      if (!data.camp_id) {
        setError('Please select a camp')
        setSubmitting(false)
        return
      }

      if (!data.district_id) {
        setError('Please select a district')
        setSubmitting(false)
        return
      }

      if (!data.campites || data.campites.length === 0) {
        setError('Please add at least one campite')
        setSubmitting(false)
        return
      }

      for (const c of data.campites) {
        if (
          !c.firstname ||
          !c.lastname ||
          !c.phone ||
          !c.age_group ||
          !c.gender
        ) {
          setError(
            'All campites must have firstname, lastname, phone, age_group, and gender',
          )
          setSubmitting(false)
          return
        }
      }

      if (!currentUser?.id) {
        setError('User not authenticated')
        setSubmitting(false)
        return
      }

      // Calculate total amount
      const totalAmount = calculateTotalAmount(data.campites)

      // If amount is 0, skip payment
      if (totalAmount === 0) {
        await createCampites(data, generateRandomPaymentRef())
        return
      }

      // Store form data and show payment dialog
      setPendingFormData(data)
      setShowPaymentDialog(true)
      setSubmitting(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process request')
      setSubmitting(false)
    }
  }

  const createCampites = async (data: FormData, paymentRef?: string) => {
    try {
      const result = await campiteMutation.mutateAsync({
        body: {
          user_id: currentUser!.id,
          camp_id: data.camp_id,
          district_id: data.district_id,
          payment_ref: paymentRef || null,
          campites: data.campites,
        },
      })

      if (result.success) {
        onSuccess()
      } else {
        setError('Failed to create campites')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create campites')
    } finally {
      setSubmitting(false)
      setShowPaymentDialog(false)
    }
  }

  const handlePaymentSuccess = async (transaction: unknown) => {
    if (pendingFormData) {
      const ref = (transaction as { reference?: string }).reference ?? ''
      await createCampites(pendingFormData, ref)
    }
  }

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false)
    setSubmitting(false)
    setError('Payment was cancelled')
  }

  const handlePaymentError = (error: unknown) => {
    setShowPaymentDialog(false)
    setSubmitting(false)
    setError(error instanceof Error ? error.message : 'Payment failed')
  }

  const initiatePayment = () => {
    if (!pendingFormData || !currentUser) {
      setError('Invalid form state')
      return
    }

    const totalAmount = calculateTotalAmount(pendingFormData.campites)
    setSubmitting(true)

    processPayment({
      email: currentUser.email,
      amount: totalAmount,
      onSuccess: handlePaymentSuccess,
      onCancel: handlePaymentCancel,
      onError: handlePaymentError,
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        onLoad={() => setPaystackReady(true)}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
        >
          <Tab label="Manual Entry" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="CSV Upload" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>
      </Box>

      <form onSubmit={handleSubmit(submitWithPayment)}>
        {/* Manual Entry Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            {/* Current User Info */}
            {currentUser && (
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Creating campites for: {currentUser.firstname}{' '}
                  {currentUser.lastname} ({currentUser.email})
                </Typography>
              </Box>
            )}

            {/* Common Fields */}
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
              showLabel={true}
            />

            {/* Campites List */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Campites ({fields.length})
              </Typography>

              <Stack spacing={2}>
                {fields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 2,
                        }}
                      >
                        <Controller
                          name={`campites.${index}.firstname`}
                          control={control}
                          rules={{ required: 'Required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="First Name"
                              size="small"
                              error={!!errors.campites?.[index]?.firstname}
                            />
                          )}
                        />
                        <Controller
                          name={`campites.${index}.lastname`}
                          control={control}
                          rules={{ required: 'Required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Last Name"
                              size="small"
                              error={!!errors.campites?.[index]?.lastname}
                            />
                          )}
                        />
                        <Controller
                          name={`campites.${index}.phone`}
                          control={control}
                          rules={{ required: 'Required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Phone *"
                              size="small"
                              error={!!errors.campites?.[index]?.phone}
                            />
                          )}
                        />
                        <Controller
                          name={`campites.${index}.age_group`}
                          control={control}
                          rules={{ required: 'Required' }}
                          render={({ field }) => (
                            <FormControl
                              size="small"
                              error={!!errors.campites?.[index]?.age_group}
                            >
                              <InputLabel>Age Group *</InputLabel>
                              <Select {...field} label="Age Group *">
                                <MenuItem value="">Select Age Group</MenuItem>
                                {AGE_GROUPS.map((ag) => (
                                  <MenuItem key={ag} value={ag}>
                                    {ag}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                        <Controller
                          name={`campites.${index}.gender`}
                          control={control}
                          rules={{ required: 'Required' }}
                          render={({ field }) => (
                            <FormControl
                              size="small"
                              error={!!errors.campites?.[index]?.gender}
                            >
                              <InputLabel>Gender *</InputLabel>
                              <Select {...field} label="Gender *">
                                <MenuItem value="">Select Gender</MenuItem>
                                {GENDERS.map((g) => (
                                  <MenuItem key={g} value={g}>
                                    {g}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  append({
                    firstname: '',
                    lastname: '',
                    phone: '',
                    age_group: '',
                    gender: '',
                  })
                }
                sx={{ mt: 2 }}
              >
                Add Campite
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* CSV Upload Tab */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            {/* Current User Info */}
            {currentUser && (
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Creating campites for: {currentUser.firstname}{' '}
                  {currentUser.lastname} ({currentUser.email})
                </Typography>
              </Box>
            )}

            {/* Common Fields */}
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
              showLabel={true}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Download a sample CSV template, fill it with campite data, and
                upload it here.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadCsvTemplate}
              >
                Download CSV Template
              </Button>
            </Box>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                style={{ display: 'none' }}
                id="csv-input"
              />
              <label
                htmlFor="csv-input"
                style={{ cursor: 'pointer', display: 'block' }}
              >
                <Typography>Click to upload CSV or drag and drop</Typography>
                <Typography variant="caption" color="text.secondary">
                  CSV files only
                </Typography>
              </label>
            </Box>
          </Stack>
        </TabPanel>

        {/* CSV Preview Dialog */}
        <Dialog
          open={showCsvPreview}
          onClose={() => setShowCsvPreview(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>CSV Preview</DialogTitle>
          <DialogContent>
            <Box sx={{ overflow: 'auto', mt: 2 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>
                      First Name
                    </th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>
                      Last Name
                    </th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>
                      Age Group
                    </th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>
                      Gender
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px' }}>{row.firstname}</td>
                      <td style={{ padding: '8px' }}>{row.lastname}</td>
                      <td style={{ padding: '8px' }}>{row.phone}</td>
                      <td style={{ padding: '8px' }}>{row.age_group}</td>
                      <td style={{ padding: '8px' }}>{row.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCsvPreview(false)}>Cancel</Button>
            <Button onClick={importCsvData} variant="contained">
              Import Data
            </Button>
          </DialogActions>
        </Dialog>

        {/* Submit Button */}
        <Box
          sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}
        >
          <Button onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || isView}
          >
            {submitting ? (
              <CircularProgress size={24} />
            ) : (
              `Create Campites (Payment Required)`
            )}
          </Button>
        </Box>
      </form>

      {/* Payment Confirmation Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={() => !submitting && setShowPaymentDialog(false)}
      >
        <DialogTitle>Payment Information</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You are about to register{' '}
              <strong>
                {pendingFormData?.campites.length || 0} campite(s)
              </strong>
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Total Amount: ₦
              {pendingFormData
                ? calculateTotalAmount(
                    pendingFormData.campites,
                  ).toLocaleString()
                : 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click the button below to proceed with payment via Paystack
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowPaymentDialog(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={initiatePayment}
            variant="contained"
            disabled={submitting || !paystackReady}
            startIcon={submitting && <CircularProgress size={20} />}
          >
            {submitting ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
