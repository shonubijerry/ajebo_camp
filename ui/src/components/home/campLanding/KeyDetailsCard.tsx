import {
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Box,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import { colors, formatDate } from './utils'
import { Camp } from '@/interfaces'

interface KeyDetailsCardProps {
  camp: Camp
}

export function KeyDetailsCard({ camp }: KeyDetailsCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        border: `2px solid ${camp.is_active ? colors.red : colors.light}`,
        paddingBottom: 4,
      }}
      style={{ background: 'transparent' }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography
          variant="h6"
          fontWeight={800}
          color={colors.navy}
          sx={{ mb: 2 }}
        >
          Key Details
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Start Date
            </Typography>
            <Typography variant="body2" color={colors.navy} fontWeight={600}>
              {formatDate(camp.start_date)}
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              End Date
            </Typography>
            <Typography variant="body2" color={colors.navy} fontWeight={600}>
              {formatDate(camp.end_date)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
