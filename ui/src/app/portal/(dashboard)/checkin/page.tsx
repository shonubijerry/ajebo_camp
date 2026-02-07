'use client'

import React, { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useDevices } from '@yudiel/react-qr-scanner'
import { Camp, OfflineCampite } from '@/interfaces'
import { fetchClient } from '@/lib/api/client'
import { OfflineControls } from './components/OfflineControls'
import { ScannerControls } from './components/ScannerControls'
import { CampitesTable } from './components/CampitesTable'
import { CheckinConfirmDialog } from './components/CheckinConfirmDialog'
import { useCheckinCache } from './hooks/useCheckinCache'
import { useOnlineStatus } from './hooks/useOnlineStatus'

export default function CheckinPage() {
  const [isPaused, setIsPaused] = useState(false)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [scannedCode, setScannedCode] = useState('')
  const [campites, setCampites] = useState<OfflineCampite[]>([])
  const [camps, setCamps] = useState<Camp[]>([])
  const [isLoadingCamps, setIsLoadingCamps] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
  const devices = useDevices()
  const isOnline = useOnlineStatus()
  const nowIso = useMemo(() => new Date().toISOString(), [])

  const {
    cacheReady,
    cachedCount,
    queueCount,
    isCaching,
    isSyncing,
    isClearing,
    campId,
    setCampId,
    startCaching,
    syncQueue,
    clearCache,
    lookupFromCache,
    queueCheckins,
  } = useCheckinCache()

  React.useEffect(() => {
    let isMounted = true

    const loadCamps = async () => {
      if (!isOnline) return
      setIsLoadingCamps(true)
      try {
        const response = await fetchClient.GET('/api/v1/camps/list', {
          params: {
            query: {
              page: 1,
              per_page: 1000,
              filter: `[end_date][gt]=${nowIso}`,
            },
          },
        })
        if (!isMounted) return
        setCamps((response.data?.data ?? []) as Camp[])
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load camps:', err)
        setError('Failed to load active camps. Please try again.')
      } finally {
        if (isMounted) setIsLoadingCamps(false)
      }
    }

    loadCamps()
    return () => {
      isMounted = false
    }
  }, [isOnline, nowIso])

  const handleStartCaching = useCallback(async () => {
    setError('')
    try {
      await startCaching()
    } catch (err) {
      console.error('Cache error:', err)
      setError('Failed to cache campites for offline use.')
    }
  }, [startCaching])

  const handleSyncQueue = useCallback(async () => {
    setError('')
    try {
      await syncQueue()
    } catch (err) {
      console.error('Sync error:', err)
      setError('Failed to sync check-ins. Please try again.')
    }
  }, [syncQueue])

  const handleClearCache = useCallback(async () => {
    setError('')
    try {
      await clearCache()
      setCampites([])
      setSelectedIds(new Set())
      setScannedCode('')
    } catch (err) {
      console.error('Clear cache error:', err)
      setError('Failed to clear cache. Please try again.')
    }
  }, [clearCache])

  // Request camera permissions (mobile only)
  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
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
  }, [setCameraPermissionDenied, setError])

  // Get available cameras after cache is ready
  React.useEffect(() => {
    if (!cacheReady) return

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
  }, [cacheReady, devices, requestCameraPermission])

  // Handle QR code scan
  const handleScan = async (result: string) => {
    if (!result) return

    setScannedCode(result)
    setError('')
    setCampites([])
    setIsLoading(true)

    try {
      if (cacheReady) {
        const cached = lookupFromCache(result)
        if (cached.length > 0) {
          setCampites(cached)
          const uncheckedIds = new Set(
            cached.filter((c) => !c.checkin_at).map((c) => c.id),
          )
          setSelectedIds(uncheckedIds)
          setIsLoading(false)
          return
        }

        if (!isOnline) {
          setError(`No campite found for: ${result}`)
          setIsLoading(false)
          return
        }
      }

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

      const foundCampite = campiteResponse.data.data[0]

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
          const fetchedCampites = userCampitesResponse.data.data
          setCampites(fetchedCampites)
          // Select all campites by default that haven't been checked in
          const uncheckedIds = new Set(
            fetchedCampites.filter((c) => !c.checkin_at).map((c) => c.id),
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
      const now = new Date().toISOString()

      if (cacheReady) {
        const updated = campites.map((c) =>
          selectedIds.has(c.id) ? { ...c, checkin_at: now } : c,
        )
        setCampites(updated)
        await queueCheckins(idsArray, updated, now)
        setCheckInDialogOpen(false)
        setSelectedIds(new Set())
        setError('')
        return
      }

      await fetchClient.PATCH('/api/v1/campites/bulk-update', {
        body: {
          ids: idsArray,
          data: {
            checkin_at: now,
          },
        },
      })

      setCampites(
        campites.map((c) =>
          selectedIds.has(c.id) ? { ...c, checkin_at: now } : c,
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
        campites.filter((c) => !c.checkin_at).map((c) => c.id),
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
  const allUncheckedSelected =
    uncheckedCount > 0 && selectedIds.size === uncheckedCount

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Camp Check-In
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Scan QR codes to check in campites
        </Typography>
      </Box>

      <OfflineControls
        camps={camps}
        isLoadingCamps={isLoadingCamps}
        campId={campId}
        onCampIdChange={setCampId}
        onStartCaching={handleStartCaching}
        onSync={handleSyncQueue}
        onClearCache={handleClearCache}
        isCaching={isCaching}
        isSyncing={isSyncing}
        isClearing={isClearing}
        cachedCount={cachedCount}
        queueCount={queueCount}
        cacheReady={cacheReady}
        isOnline={isOnline}
      />

      <ScannerControls
        enabled={cacheReady}
        cameras={cameras}
        selectedCamera={selectedCamera}
        onSelectCamera={setSelectedCamera}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        scannedCode={scannedCode}
        onScannedCodeChange={setScannedCode}
        onScan={handleScan}
        onClear={() => {
          setScannedCode('')
          setCampites([])
          setError('')
        }}
      />

      {error && <Alert severity="error">{error}</Alert>}

      {cameraPermissionDenied && cacheReady && (
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

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      )}

      <CampitesTable
        campites={campites}
        scannedCode={scannedCode}
        selectedIds={selectedIds}
        checkInLoading={checkInLoading}
        allUncheckedSelected={allUncheckedSelected}
        uncheckedCount={uncheckedCount}
        onSelectAll={handleSelectAll}
        onToggle={handleToggle}
        onOpenCheckIn={() => setCheckInDialogOpen(true)}
      />

      <CheckinConfirmDialog
        open={checkInDialogOpen}
        selectedCount={selectedIds.size}
        onClose={() => setCheckInDialogOpen(false)}
        onConfirm={handleCheckIn}
        isLoading={checkInLoading}
      />
    </Stack>
  )
}
