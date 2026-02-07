import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Pause as PauseIcon, PlayArrow as PlayIcon } from '@mui/icons-material'
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'

interface ScannerControlsProps {
  enabled: boolean
  cameras: MediaDeviceInfo[]
  selectedCamera: string
  onSelectCamera: (value: string) => void
  isPaused: boolean
  onTogglePause: () => void
  scannedCode: string
  onScannedCodeChange: (value: string) => void
  onScan: (value: string) => void
  onClear: () => void
}

export function ScannerControls({
  enabled,
  cameras,
  selectedCamera,
  onSelectCamera,
  isPaused,
  onTogglePause,
  scannedCode,
  onScannedCodeChange,
  onScan,
  onClear,
}: ScannerControlsProps) {
  if (!enabled) {
    return (
      <Card sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Ready to check in?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start checking to cache campites for offline use. The camera and
            manual entry will appear after caching is complete.
          </Typography>
        </Stack>
      </Card>
    )
  }

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        {cameras.length > 1 && (
          <FormControl fullWidth size="small">
            <InputLabel>Camera</InputLabel>
            <Select
              value={selectedCamera}
              label="Camera"
              onChange={(e) => onSelectCamera(e.target.value)}
            >
              {cameras.map((camera) => (
                <MenuItem key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedCamera && (
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
              onScan={(result: IDetectedBarcode[]) => {
                onScan(result?.[0]?.rawValue || '')
              }}
              onError={(error) => {
                console.error('Scanner error:', error)
              }}
              constraints={{
                deviceId: selectedCamera,
              }}
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
                onOff: true,
                torch: true,
                zoom: true,
                finder: true,
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

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={isPaused ? <PlayIcon /> : <PauseIcon />}
            onClick={onTogglePause}
            fullWidth
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outlined" onClick={onClear} fullWidth>
            Clear
          </Button>
        </Stack>

        <TextField
          label="Or Enter registration number"
          value={scannedCode}
          onChange={(e) => onScannedCodeChange(e.target.value)}
          size="small"
          fullWidth
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onScan(scannedCode)
            }
          }}
          placeholder="e.g., 12345678 or BULK-12345678"
        />
      </Stack>
    </Card>
  )
}
