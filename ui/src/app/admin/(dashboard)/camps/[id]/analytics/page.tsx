"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Paid as PaidIcon,
  Groups as GroupsIcon,
  Map as MapIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
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
  PieLabelRenderProps,
  TooltipContentProps,
} from "recharts";
import StatCard from "@/components/dashboard/StatCard";
import { useApi } from "@/lib/api/useApi";
import { DetailedAnalytics } from "@/interfaces";
import { useAuth } from "@/hooks/useAuth";
import { ForbiddenPage } from "@/components/permissions/ForbiddenPage";

const PERIODS: {
  label: string;
  value: "today" | "week" | "month" | "year" | "all";
}[] = [
  { label: "Today", value: "today" },
  { label: "7d", value: "week" },
  { label: "30d", value: "month" },
  { label: "1y", value: "year" },
  { label: "All", value: "all" },
];

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const pieColors = [
  "#1976d2",
  "#2e7d32",
  "#ed6c02",
  "#9c27b0",
  "#0288d1",
  "#c2185b",
  "#00796b",
];
const RADIAN = Math.PI / 180;

type ChartCardProps = {
  title: string;
  loading?: boolean;
  children: React.ReactNode;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
}: PieLabelRenderProps) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }
  // For donut charts, position label slightly toward the outer edge for better centering
  const isDonut = innerRadius > 0;
  const radius = isDonut
    ? innerRadius + (outerRadius - innerRadius) * 0.55
    : innerRadius + (outerRadius - innerRadius) * 0.5;

  const ncx = Number(cx);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const ncy = Number(cy);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

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
  );
};

const ChartCard = ({ title, loading, children }: ChartCardProps) => (
  <Card variant="outlined" sx={{ width: "100%", height: "100%" }}>
    <CardContent>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
        {title}
      </Typography>
      {loading ? <Skeleton variant="rounded" height={180} /> : children}
    </CardContent>
  </Card>
);

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipContentProps<string | number, string>) => {
  if (!active || !payload[0]?.payload?.currency) {
    return null;
  }

  const isVisible = active && payload && payload.length;
  console.log({ active, payload, label });

  return (
    <div
      className="custom-tooltip"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      {isVisible && (
        <span
          className="label"
          style={{ background: "white", padding: "10px" }}
        >{`${payload[0].name} : ${payload[0]?.payload?.currency ?? payload[0].value}`}</span>
      )}
    </div>
  );
};

export default function CampAnalyticsPage() {
  const params = useParams();
  const campId = params?.id as string;
  const { $api } = useApi();
  const { hasPermission, isLoading: isAuthLoading } = useAuth();
  const [period, setPeriod] =
    useState<(typeof PERIODS)[number]["value"]>("month");

  const analyticsQuery = $api.useQuery("get", "/api/v1/analytics/detailed", {
    params: { query: { period, camp_id: campId } },
  });

  const analytics = analyticsQuery.data?.data as DetailedAnalytics | undefined;
  const overview = analytics?.overview;

  const statCards = useMemo(
    () => [
      {
        label: "Total Campites",
        value: overview?.total_campites ?? 0,
        delta: "in this camp",
        icon: <GroupsIcon />,
        isPositive: true,
      },
      {
        label: "Total Revenue",
        value: currency.format(overview?.total_revenue ?? 0),
        delta: "from registrations",
        icon: <PaidIcon />,
        isPositive: true,
      },
      {
        label: "Total Districts",
        value: overview?.total_districts ?? 0,
        delta: "covered",
        icon: <MapIcon />,
        isPositive: true,
      },
      {
        label: "Pending Payments",
        value: overview?.pending_payments ?? 0,
        delta: "awaiting confirmation",
        icon: <PendingIcon />,
        isPositive: false,
      },
    ],
    [overview]
  );

  const genderBreakdown = analytics?.campites?.by_gender ?? [];
  const ageBreakdown = analytics?.campites?.by_age_group ?? [];
  const typeBreakdown = analytics?.campites?.by_type ?? [];
  const districtBreakdown = analytics?.campites?.by_district ?? [];
  const timelineDaily = analytics?.timeline?.daily ?? [];
  const recentRegs = analytics?.recent_activity?.recent_registrations ?? [];

  if (isAuthLoading) {
    return <Skeleton variant="rounded" height={320} />;
  }

  if (!hasPermission(["analytics:view"])) {
    return <ForbiddenPage message="You do not have permission to view analytics." />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Camp Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed breakdown for this camp.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {PERIODS.map((p) => (
            <Chip
              key={p.value}
              label={p.label}
              color={period === p.value ? "primary" : "default"}
              variant={period === p.value ? "filled" : "outlined"}
              onClick={() => setPeriod(p.value)}
            />
          ))}
        </Stack>
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
                    name: g.gender || "Unknown",
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
                <Tooltip />
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
                    name: `${t.type} count` || "Unknown",
                    value: t.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {typeBreakdown.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={pieColors[(idx + 1) % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Pie
                  dataKey="value"
                  data={typeBreakdown.map((t) => ({
                    name: `${t.type} revenue` || "Unknown",
                    value: t.revenue,
                    currency: currency.format(t.revenue),
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  tooltipType="none"
                >
                  {typeBreakdown.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={pieColors[(idx + 3) % pieColors.length]}
                    >
                      <Tooltip
                        key={`tooltip-${idx}`}
                        content={CustomTooltip}
                        defaultIndex={idx}
                      />
                    </Cell>
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
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
                    name: a.age_group || "Unknown",
                    value: a.count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {ageBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard
            title="Campites by District"
            loading={analyticsQuery.isLoading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={districtBreakdown.map((d) => ({
                  name: d.district_name,
                  value: d.count,
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Campites" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

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
      </Grid>

      <Grid container spacing={3}>
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
  );
}
