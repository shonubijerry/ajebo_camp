"use client";

import React from "react";
import { Grid, Typography, Box, Stack, Skeleton } from "@mui/material";
import StatCard from "@/components/dashboard/StatCard";
import {
  HouseOutlined as CampIcon,
  Map as MapIcon,
  People as UsersIcon,
  Business as EntityIcon,
} from "@mui/icons-material";
import { useApi } from "@/lib/api/useApi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartCard, pieColors, renderCustomizedLabel } from "@/lib/chart";

export default function AdminDashboard() {
  const { $api } = useApi();

  const dashboardQuery = $api.useQuery("get", "/api/v1/analytics/dashboard");

  const overview = dashboardQuery.data?.data;

  const genderData = React.useMemo(
    () =>
      (overview?.by_gender ?? []).map((g) => ({
        name: g.gender || "Unknown",
        value: (g as any).count ?? (g as any)._count?.id ?? 0,
      })),
    [overview?.by_gender],
  );

  const ageGroupData = React.useMemo(
    () =>
      (overview?.by_age_group ?? []).map((a) => ({
        name: a.age_group || "Unknown",
        value: (a as any).count ?? (a as any)._count?.id ?? 0,
      })),
    [overview?.by_age_group],
  );

  const statCards = [
    {
      label: "Total Campites",
      value: overview?.total_campites ?? 0,
      delta: "–",
      isPositive: true,
      icon: <EntityIcon />,
    },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your camp management system.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.label}>
            {dashboardQuery.isLoading ? (
              <Skeleton variant="rounded" height={134} />
            ) : (
              <StatCard {...card} />
            )}
          </Grid>
        ))}
      </Grid>


      
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <ChartCard
                  title="Campites by Gender"
                  loading={dashboardQuery.isLoading}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {genderData.map((_, idx) => (
                          <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
      
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <ChartCard
                  title="Campites by Age Group"
                  loading={dashboardQuery.isLoading}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={ageGroupData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {ageGroupData.map((_, idx) => (
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
    </Stack>
  );
}
