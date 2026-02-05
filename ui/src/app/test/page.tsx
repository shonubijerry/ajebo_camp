'use client'

import React, { useRef, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
} from '@mui/material'
import {
  QrCodeScanner as QrScannerIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { IDetectedBarcode, Scanner, useDevices } from '@yudiel/react-qr-scanner'
import { Campite } from '@/interfaces'
import { fetchClient } from '@/lib/api/client'

export default function CheckinPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isPaused, setIsPaused] = useState(false)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [scannedCode, setScannedCode] = useState('')
  const [campites, setCampites] = useState<Campite[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
  const devices = useDevices()

  // Request camera permissions (mobile only)
  const requestCameraPermission = async () => {
    if (!isMobile) return false
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { backgroundBlur: false },
      })
      stream.getTracks().forEach((track) => track.stop())
      setCameraPermissionDenied(false)
      return true
    } catch (err) {
      console.error('Camera permission denied:', err)
      setCameraPermissionDenied(true)
      setError(
        'Camera permission denied. Please enable camera access in your browser settings.',
      )
      return false
    }
  }

  // Get available cameras on mount (mobile only)
  React.useEffect(() => {
    if (!isMobile) return

    console.log('devices', devices)
    const getCameras = async () => {
      try {
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        )
        setCameras(videoDevices)
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId)
        } else if (videoDevices.length === 0 && devices.length === 0) {
          // Devices list is empty, try to request permission
          await requestCameraPermission()
        }
      } catch (err) {
        console.error('Error getting cameras:', err)
        setError('Failed to access camera list')
      }
    }

    getCameras()
  }, [devices, isMobile])

  // Handle QR code scan
  const handleScan = async (result: string) => {
    if (!result) return

    setScannedCode(result)
    setError('')
    setCampites([])
    setIsLoading(true)

    try {
      let registrationNumber = result

      // Check if it's a bulk code format
      if (result.startsWith('BULK-')) {
        registrationNumber = result.split('-')[1] // Extract XXXXX from BULK-XXXXX
      }

      // First, find campite by registration number
      const campiteResponse = await fetchClient.GET('/api/v1/campites/list', {
        params: {
          query: {
            filter: `[registration_no][equals]='${registrationNumber}'`,
            page: 1,
            per_page: 1,
          },
        },
      })

      if (
        !campiteResponse.data?.data ||
        campiteResponse.data.data.length === 0
      ) {
        setError(
          `No campite found with registration number: ${registrationNumber}`,
        )
        setIsLoading(false)
        return
      }

      const foundCampite = campiteResponse.data.data[0] as Campite

      // If bulk code, fetch all campites for this user
      if (result.startsWith('BULK-')) {
        const userCampitesResponse = await fetchClient.GET(
          '/api/v1/campites/list',
          {
            params: {
              query: {
                filter: `[user_id][equals]='${foundCampite.user_id}'`,
                page: 1,
                per_page: 100,
              },
            },
          },
        )

        if (userCampitesResponse.data?.data) {
          const fetchedCampites = userCampitesResponse.data.data as Campite[]
          setCampites(fetchedCampites)
          // Select all campites by default that haven't been checked in
          const uncheckedIds = new Set(
            fetchedCampites
              .filter((c) => !c.checkin_at)
              .map((c) => c.id)
          )
          setSelectedIds(uncheckedIds)
        }
      } else {
        // Single registration number - show just this campite
        setCampites([foundCampite])
        // Select by default if not checked in
        if (!foundCampite.checkin_at) {
          setSelectedIds(new Set([foundCampite.id]))
        } else {
          setSelectedIds(new Set())
        }
      }
    } catch (err) {
      console.error('Error fetching campites:', err)
      setError('Failed to fetch campite information')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle check-in
  const handleCheckIn = async () => {
    if (selectedIds.size === 0) return

    setCheckInLoading(true)
    try {
      const idsArray = Array.from(selectedIds)
      
      await fetchClient.PATCH('/api/v1/campites/bulk-update', {
        body: {
          ids: idsArray,
          data: {
            checkin_at: new Date().toISOString(),
          },
        },
      })

      // Update local state
      setCampites(
        campites.map((c) =>
          selectedIds.has(c.id)
            ? { ...c, checkin_at: new Date().toISOString() }
            : c,
        ),
      )
      setCheckInDialogOpen(false)
      setSelectedIds(new Set())
      setError('')
    } catch (err) {
      console.error('Error checking in campites:', err)
      setError('Failed to check in campites')
    } finally {
      setCheckInLoading(false)
    }
  }

  // Handle select all toggle
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const uncheckedIds = new Set(
        campites.filter((c) => !c.checkin_at).map((c) => c.id)
      )
      setSelectedIds(uncheckedIds)
    } else {
      setSelectedIds(new Set())
    }
  }

  // Handle individual checkbox toggle
  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const uncheckedCount = campites.filter((c) => !c.checkin_at).length
  const allUncheckedSelected = uncheckedCount > 0 && selectedIds.size === uncheckedCount

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Camp Check-In
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Scan QR codes to check in campites
        </Typography>
      </Box>

      {/* Scanner Controls */}
      <Card sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* Mobile Only Message */}
          {!isMobile && (
            <Alert severity="info">
              QR code scanning is available on mobile devices only. Please use manual entry below
              or access this page from a mobile device.
            </Alert>
          )}

          {/* Camera Selection - Mobile Only */}
          {isMobile && cameras.length > 1 && (
            <FormControl fullWidth size="small">
              <InputLabel>Camera</InputLabel>
              <Select
                value={selectedCamera}
                label="Camera"
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {cameras.map((camera) => (
                  <MenuItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Scanner - Mobile Only */}
          {isMobile && selectedCamera && (
            <Box
              sx={{
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: '#000',
                width: '100%',
                maxWidth: '500px',
                mx: 'auto',
                aspectRatio: '1',
              }}
            >
              <Scanner
                onScan={(result) => {
                  handleScan(result?.[0]?.rawValue || '')
                }}
                onError={(error) => {
                  console.error('Scanner error:', error)
                }}
                constraints={{ deviceId: selectedCamera }}
                paused={isPaused}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
                components={{
                  onOff: true, // Show camera on/off button
                  torch: true, // Show torch/flashlight button (if supported)
                  zoom: true, // Show zoom control (if supported)
                  finder: true, // Show finder overlay
                }}
              />
              {isPaused && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <Typography color="white" variant="h6">
                    Scanner Paused
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Controls - Mobile Only */}
          {isMobile && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
                onClick={() => setIsPaused(!isPaused)}
                fullWidth
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setScannedCode('')
                  setCampites([])
                  setError('')
                }}
                fullWidth
              >
                Clear
              </Button>
            </Stack>
          )}

          {/* Manual Entry - Always Available */}
          <TextField
            label={isMobile ? "Or enter registration number manually" : "Enter registration number"}
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            size="small"
            fullWidth
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleScan(`${scannedCode}`)
              }
            }}
            placeholder="e.g., 12345678 or BULK-12345678"
          />
        </Stack>
      </Card>

      {/* Error Alert */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Permission Denied Alert */}
      {cameraPermissionDenied && (
        <Alert severity="warning">
          Camera permission is required to use the QR scanner. Please enable
          camera access in your browser settings and refresh the page.
          <Button
            onClick={requestCameraPermission}
            size="small"
            sx={{ mt: 1 }}
            variant="outlined"
          >
            Retry Permission
          </Button>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Results */}
      {campites.length > 0 && (
        <Card>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">
                  {campites.length === 1
                    ? 'Campite Found'
                    : `${campites.length} Campites Found`}
                </Typography>
                {scannedCode.startsWith('BULK-') && (
                  <Typography variant="caption" color="text.secondary">
                    Bulk check-in for user group
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                disabled={selectedIds.size === 0 || checkInLoading}
                onClick={() => setCheckInDialogOpen(true)}
              >
                {checkInLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  `Check In ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`
                )}
              </Button>
            </Stack>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedIds.size > 0 && !allUncheckedSelected}
                      checked={allUncheckedSelected}
                      onChange={handleSelectAll}
                      disabled={uncheckedCount === 0}
                    />
                  </TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Reg #</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Gender</strong></TableCell>
                  <TableCell><strong>Age Group</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campites.map((campite) => {
                  const isCheckedIn = !!campite.checkin_at
                  const isSelected = selectedIds.has(campite.id)
                  
                  return (
                    <TableRow
                      key={campite.id}
                      hover={!isCheckedIn}
                      selected={isSelected}
                      sx={{
                        cursor: isCheckedIn ? 'default' : 'pointer',
                        backgroundColor: isCheckedIn ? 'action.disabledBackground' : undefined,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                          },
                        },
                      }}
                      onClick={() => !isCheckedIn && handleToggle(campite.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          disabled={isCheckedIn}
                          onChange={() => handleToggle(campite.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>
                        {campite.firstname} {campite.lastname}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                        >
                          {campite.registration_no}
                        </Typography>
                      </TableCell>
                      <TableCell>{campite.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={campite.gender}
                          size="small"
                          color={campite.gender === 'Male' ? 'primary' : 'secondary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{campite.age_group}</TableCell>
                      <TableCell>
                        <Chip label={campite.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {isCheckedIn ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={`Checked in: ${new Date(campite.checkin_at as string).toLocaleString()}`}
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Chip label="Pending" size="small" color="warning" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Check-In Dialog */}
      <Dialog
        open={checkInDialogOpen}
        onClose={() => setCheckInDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Check-In</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>
              Check in <strong>{selectedIds.size}</strong>{' '}
              {selectedIds.size === 1 ? 'campite' : 'campites'}?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This action will mark the selected campites as checked in.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckInDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCheckIn}
            variant="contained"
            disabled={checkInLoading}
            startIcon={
              checkInLoading ? (
                <CircularProgress size={20} />
              ) : (
                <CheckCircleIcon />
              )
            }
          >
            Check In
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
