import { Box, IconButton, Stack, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import { colors } from './utils'

export function FooterSection() {
  return (
    <Box
      sx={{
        py: 4,
        textAlign: 'center',
        bgcolor: 'white',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="body2" color={colors.navy} sx={{ opacity: 0.75 }}>
          Powered by{' '}
          <span style={{ color: '#f00' }}>
            Foursquare Gospel Church Nigeria
          </span>{' '}
          • Ajebo Camp Management
        </Typography>
        <IconButton
          href="/"
          size="small"
          style={{ background: 'white' }}
          sx={{
            color: colors.navy,
            opacity: 0.7,
            border: '1px solid rgba(0,0,0,0.08)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            '&:hover': { opacity: 1, transform: 'translateY(-1px)' },
          }}
        >
          <HomeIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  )
}
