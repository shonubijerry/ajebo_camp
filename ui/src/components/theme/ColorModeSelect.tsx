import { useColorScheme } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectProps } from '@mui/material/Select'
// removed unused IconButton import

export default function ColorModeSelect(props: SelectProps) {
  const { mode, setMode } = useColorScheme()
  if (!mode) {
    return null
  }
  return (
    <Select
      value={mode}
      onChange={(event) =>
        setMode(event.target.value as 'system' | 'light' | 'dark')
      }
      SelectDisplayProps={{
        // @ts-expect-error css data attribute
        'data-screenshot': 'toggle-mode',
      }}
      {...props}
    >
      <MenuItem value="light">Light</MenuItem>
      <MenuItem value="system">System</MenuItem>
      <MenuItem value="dark">Dark</MenuItem>
    </Select>
  )
}
