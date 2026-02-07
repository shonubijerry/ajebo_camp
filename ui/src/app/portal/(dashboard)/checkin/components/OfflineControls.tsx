import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { QrCodeScanner as QrScannerIcon } from '@mui/icons-material'
import { Camp } from '@/interfaces'

interface OfflineControlsProps {
  camps: Camp[]
  isLoadingCamps: boolean
  campId: string
  onCampIdChange: (value: string) => void
  onStartCaching: () => void
  onSync: () => void
  isCaching: boolean
  isSyncing: boolean
  cachedCount: number
  queueCount: number
  cacheReady: boolean
  isOnline: boolean
}

export function OfflineControls({
  camps,
  isLoadingCamps,
  campId,
  onCampIdChange,
  onStartCaching,
  onSync,
  isCaching,
  isSyncing,
  cachedCount,
  queueCount,
  cacheReady,
  isOnline,
}: OfflineControlsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isLocked = queueCount > 0 || isCaching || isSyncing
  const canStart = !isCaching && !!campId && queueCount === 0

  const selectedCampLabel =
    camps.find((c) => c.id === campId)?.title ?? 'Selected camp'

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth size="small" disabled={isLocked}>
            <InputLabel>Active Camp</InputLabel>
            <Select
              label="Active Camp"
              value={campId}
              onChange={(e) => onCampIdChange(e.target.value)}
            >
              <MenuItem value="" disabled>
                {isLoadingCamps ? 'Loading camps...' : 'Select a camp'}
              </MenuItem>
              {camps.map((camp) => (
                <MenuItem key={camp.id} value={camp.id}>
                  {camp.title ?? camp.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<QrScannerIcon />}
            onClick={() => setConfirmOpen(true)}
            disabled={!canStart}
            sx={{ minWidth: 180 }}
          >
            {isCaching ? <CircularProgress size={20} /> : 'Start Checking'}
          </Button>
          <Button
            variant="outlined"
            onClick={onSync}
            disabled={isSyncing || queueCount === 0}
            sx={{ minWidth: 160 }}
          >
            {isSyncing ? <CircularProgress size={20} /> : 'Sync to Server'}
          </Button>
        </Stack>

        <Box>
          <Stack direction="row" spacing={2}>
            <Chip
              label={`Cached: ${cachedCount}`}
              color={cacheReady ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              label={`Queued: ${queueCount}`}
              color={queueCount > 0 ? 'warning' : 'default'}
              variant="outlined"
            />
            <Chip
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'warning'}
              variant="outlined"
            />
            {queueCount > 0 && (
              <Chip
                label="Sync required before changing camp"
                color="warning"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Start checking for {selectedCampLabel}?</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="body2">
              This will download campites for offline use and clear any previous
              cache/queue for check-ins.
            </Typography>
            <Typography variant="body2">
              Make sure you have a stable connection before starting.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false)
              onStartCaching()
            }}
            variant="contained"
          >
            Start Checking
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
