import {
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { colors } from './utils'
import { Camp } from '@/interfaces'

interface HighlightsSectionProps {
  highlights?: Camp['highlights']
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function HighlightsSection({ highlights }: HighlightsSectionProps) {
  if (!highlights || Object.keys(highlights).length === 0) return null

  const renderContent = (
    content: NonNullable<Camp['highlights']>[keyof NonNullable<
      Camp['highlights']
    >],
  ) => {
    if (typeof content === 'string') {
      return (
        <Typography variant="body2" color={colors.navy}>
          {content}
        </Typography>
      )
    }

    if (Array.isArray(content)) {
      // Check if it's an array of objects (ministers) or strings (activities)
      const items =
        content.length > 0 && typeof content[0] === 'object'
          ? (content as { name: string; designation: string }[]).map((item) =>
              item.designation
                ? `${item.name} — ${item.designation}`
                : item.name,
            )
          : (content as string[])

      return (
        <List sx={{ listStyleType: 'disc', pl: 2 }}>
          {items.map((item, index) => (
            <ListItem key={index} sx={{ display: 'list-item', py: 0.5, px: 0 }}>
              <ListItemText
                primary={item}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: colors.navy,
                }}
              />
            </ListItem>
          ))}
        </List>
      )
    }

    return (
      <Typography variant="body2" color={colors.navy}>
        {String(content)}
      </Typography>
    )
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        border: `2px solid white`,
      }}
      style={{ background: 'transparent' }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          color={colors.navy}
          sx={{ mb: 2 }}
        >
          Camp Highlights
        </Typography>
        <Divider sx={{ mb: 3, borderColor: colors.yellow, borderWidth: 2 }} />
        <Stack spacing={3}>
          {Object.entries(highlights).map(([title, content]) => (
            <Stack key={title} spacing={1}>
              <Typography variant="h6" fontWeight={700} color={colors.red}>
                {capitalizeFirstLetter(title)}
              </Typography>
              {renderContent(content)}
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
