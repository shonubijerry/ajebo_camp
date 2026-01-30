'use client'

import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import {
  Paid as PaidIcon,
  Groups as GroupsIcon,
  Map as MapIcon,
  HourglassEmpty as PendingIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import StatCard from '@/components/dashboard/StatCard'
import { useApi } from '@/lib/api/useApi'
import { DetailedAnalytics } from '@/interfaces'
import { useAuth } from '@/hooks/useAuth'
import { ForbiddenPage } from '@/components/permissions/ForbiddenPage'
import { formatter, PERIODS } from '@/lib/chart'
import {
  ChartCard,
  pieColors,
  renderCustomizedLabel,
  currency,
} from '@/lib/chart'
import { downloadAsXlsx } from './download'

type Props = { campId: string }

export default function CampAnalyticsPageContent({ campId }: Props) {
  const { $api } = useApi()
  const { hasPermission, isLoading: isAuthLoading } = useAuth()
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['value']>('all')

  const analyticsQuery = $api.useQuery('get', '/api/v1/analytics/detailed', {
    params: { query: { period, camp_id: campId } },
  })

  const campQuery = $api.useQuery('get', '/api/v1/camps/{id}', {
    params: { path: { id: campId } },
  })

  const analytics = analyticsQuery.data?.data as DetailedAnalytics | undefined
  const camp = campQuery.data?.data
  const overview = analytics?.overview

  const statCards = useMemo(
    () => [
      {
        label: 'Total Campites',
        value: overview?.total_campites ?? 0,
        delta: 'in this camp',
        icon: <GroupsIcon />,
        isPositive: true,
      },
      {
        label: 'Total Revenue',
        value: currency.format(overview?.total_revenue ?? 0),
        delta: 'from registrations',
        icon: <PaidIcon />,
        isPositive: true,
      },
      {
        label: 'Total Districts',
        value: overview?.total_districts ?? 0,
        delta: 'covered',
        icon: <MapIcon />,
        isPositive: true,
      },
      {
        label: 'Pending Payments',
        value: overview?.pending_payments ?? 0,
        delta: 'awaiting confirmation',
        icon: <PendingIcon />,
        isPositive: false,
      },
    ],
    [overview],
  )

  const genderBreakdown = analytics?.campites?.by_gender ?? []
  const ageBreakdown = analytics?.campites?.by_age_group ?? []
  const typeBreakdown = analytics?.campites?.by_type ?? []
  const districtBreakdown = analytics?.campites?.by_district ?? []
  const timelineDaily = analytics?.timeline?.daily ?? []
  const recentRegs = analytics?.recent_activity?.recent_registrations ?? []

  if (isAuthLoading) {
    return <Skeleton variant="rounded" height={320} />
  }

  if (!hasPermission(['analytics:view'])) {
    return (
      <ForbiddenPage message="You do not have permission to view analytics." />
    )
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {camp?.title} Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed breakdown for this camp
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => downloadAsXlsx(camp?.title || '', period, analytics)}
            disabled={analyticsQuery.isLoading}
            size="small"
          >
            Download
          </Button>
          <Stack direction="row" spacing={1}>
            {PERIODS.map((p) => (
              <Chip
                key={p.value}
                label={p.label}
                color={period === p.value ? 'primary' : 'default'}
                variant={period === p.value ? 'filled' : 'outlined'}
                onClick={() => setPeriod(p.value)}
              />
            ))}
          </Stack>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
            {analyticsQuery.isLoading ? (
              <Skeleton variant="rounded" height={134} />
            ) : (
              <StatCard {...card} />
            )}
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ChartCard
            title="Campites by Gender"
            loading={analyticsQuery.isLoading}
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={genderBreakdown.map((g) => ({
                    name: g.gender || 'Unknown',
                    value: g.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {genderBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ChartCard
            title="Campites by Type"
            loading={analyticsQuery.isLoading}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={typeBreakdown.map((t) => ({
                    name: `${t.type} revenue` || 'Unknown',
                    value: t.revenue,
                    currency: currency.format(t.revenue),
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius="50%"
                  labelLine={false}
                >
                  {typeBreakdown.map((_, idx) => (
                    <>
                      <Cell
                        key={idx}
                        fill={pieColors[(idx + 3) % pieColors.length]}
                      ></Cell>
                    </>
                  ))}
                </Pie>
                <Pie
                  dataKey="value"
                  data={typeBreakdown.map((t) => ({
                    name: `${t.type} count` || 'Unknown',
                    value: t.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  labelLine={false}
                >
                  {typeBreakdown.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={pieColors[(idx + 1) % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Legend formatter={formatter} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ChartCard
            title="Campites by Age Group"
            loading={analyticsQuery.isLoading}
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={ageBreakdown.map((a) => ({
                    name: a.age_group || 'Unknown',
                    value: a.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                >
                  {ageBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Legend formatter={formatter} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 12 }}>
          <ChartCard
            title="Campites by District"
            loading={analyticsQuery.isLoading}
          >
            <ResponsiveContainer width="100%" height={600}>
              <BarChart
                data={districtBreakdown.map((d) => ({
                  name: d.district_name,
                  value: d.count,
                }))}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="category" dataKey="name" width={120} />
                <YAxis type="number" />
                <Tooltip
                  contentStyle={{
                    color: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Campites" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Daily Registrations & Revenue"
            loading={analyticsQuery.isLoading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineDaily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Registrations"
                  stroke="#1976d2"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2e7d32"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Recent Registrations"
            loading={analyticsQuery.isLoading}
          >
            {recentRegs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recent registrations.
              </Typography>
            ) : (
              <List dense>
                {recentRegs.map((reg) => (
                  <React.Fragment key={reg.id}>
                    <ListItem disableGutters>
                      <ListItemText
                        primary={`${reg.firstname} ${reg.lastname}`}
                        secondary={new Date(reg.created_at).toLocaleString()}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </ChartCard>
        </Grid>
      </Grid>
    </Stack>
  )
}
