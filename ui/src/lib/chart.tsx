import { Card, CardContent, Skeleton, Typography } from '@mui/material'
import { PieLabelRenderProps, TooltipContentProps } from 'recharts'

export const PERIODS: {
  label: string
  value: 'today' | 'week' | 'month' | 'year' | 'all'
}[] = [
  { label: 'Today', value: 'today' },
  { label: '7d', value: 'week' },
  { label: '30d', value: 'month' },
  { label: '1y', value: 'year' },
  { label: 'All', value: 'all' },
]

export const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

export const pieColors = [
  '#1976d2',
  '#2e7d32',
  '#ed6c02',
  '#9c27b0',
  '#0288d1',
  '#c2185b',
  '#00796b',
]
const RADIAN = Math.PI / 180

type ChartCardProps = {
  title: string
  loading?: boolean
  children: React.ReactNode
}

export const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null
  }
  // For donut charts, position label slightly toward the outer edge for better centering
  const isDonut = innerRadius > 0
  const radius = isDonut
    ? innerRadius + (outerRadius - innerRadius) * 0.55
    : innerRadius + (outerRadius - innerRadius) * 0.5

  const ncx = Number(cx)
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN)
  const ncy = Number(cy)
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  )
}

export const ChartCard = ({ title, loading, children }: ChartCardProps) => (
  <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
    <CardContent>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
        {title}
      </Typography>
      {loading ? <Skeleton variant="rounded" height={180} /> : children}
    </CardContent>
  </Card>
)

export const CustomTooltip = ({
  active,
  payload,
}: TooltipContentProps<string | number, string>) => {
  if (!active || !payload[0]?.payload?.currency) {
    return null
  }

  const isVisible = active && payload && payload.length

  return (
    <div
      className="custom-tooltip"
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      {isVisible && (
        <span
          className="label"
          style={{ background: 'white', padding: '10px' }}
        >{`${payload[0].name} : ${payload[0]?.payload?.currency ?? payload[0].value}`}</span>
      )}
    </div>
  )
}
