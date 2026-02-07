import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material'

interface CheckinConfirmDialogProps {
  open: boolean
  selectedCount: number
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function CheckinConfirmDialog({
  open,
  selectedCount,
  onClose,
  onConfirm,
  isLoading,
}: CheckinConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Check-In</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography>
            Check in <strong>{selectedCount}</strong>{' '}
            {selectedCount === 1 ? 'campite' : 'campites'}?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This action will mark the selected campites as checked in.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />
          }
        >
          Check In
        </Button>
      </DialogActions>
    </Dialog>
  )
}
