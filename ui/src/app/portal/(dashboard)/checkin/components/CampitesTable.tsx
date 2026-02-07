import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material'
import { Campite } from '@/interfaces'

interface CampitesTableProps {
  campites: Campite[]
  scannedCode: string
  selectedIds: Set<string>
  checkInLoading: boolean
  allUncheckedSelected: boolean
  uncheckedCount: number
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void
  onToggle: (id: string) => void
  onOpenCheckIn: () => void
}

export function CampitesTable({
  campites,
  scannedCode,
  selectedIds,
  checkInLoading,
  allUncheckedSelected,
  uncheckedCount,
  onSelectAll,
  onToggle,
  onOpenCheckIn,
}: CampitesTableProps) {
  if (campites.length === 0) return null

  return (
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
            onClick={onOpenCheckIn}
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
                  onChange={onSelectAll}
                  disabled={uncheckedCount === 0}
                />
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Reg #</strong>
              </TableCell>
              <TableCell>
                <strong>Phone</strong>
              </TableCell>
              <TableCell>
                <strong>Gender</strong>
              </TableCell>
              <TableCell>
                <strong>Age Group</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
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
                    backgroundColor: isCheckedIn
                      ? 'action.disabledBackground'
                      : undefined,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                  onClick={() => !isCheckedIn && onToggle(campite.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      disabled={isCheckedIn}
                      onChange={() => onToggle(campite.id)}
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
                      <Chip
                        label="Pending"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
