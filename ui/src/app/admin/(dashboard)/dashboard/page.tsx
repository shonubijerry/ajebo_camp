"use client";

import React from "react";
import { Grid, Typography, Box, Stack, Skeleton, List, ListItem, ListItemText, Divider, Card, CardContent } from "@mui/material";
import StatCard from "@/components/dashboard/StatCard";
import { HouseOutlined as CampIcon, Map as MapIcon, People as UsersIcon, Business as EntityIcon } from "@mui/icons-material";
import { useApi } from "@/lib/api/useApi";

export default function AdminDashboard() {
  const { $api } = useApi();

  const dashboardQuery = $api.useQuery("get", "/api/v1/analytics/dashboard");

  const overview = dashboardQuery.data?.data?.overview;
  const recentActivity = dashboardQuery.data?.data?.recent_activity || [];

  const statCards = [
    {
      label: "Total Camps",
      value: overview?.total_camps ?? 0,
      delta: "–",
      isPositive: true,
      icon: <CampIcon />,
    },
    {
      label: "Total Districts",
      value: overview?.total_districts ?? 0,
      delta: "–",
      isPositive: true,
      icon: <MapIcon />,
    },
    {
      label: "Total Users",
      value: overview?.total_users ?? 0,
      delta: "–",
      isPositive: true,
      icon: <UsersIcon />,
    },
    {
      label: "Total Entities",
      value: overview?.total_entities ?? 0,
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
          <Grid sx={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
            {dashboardQuery.isLoading ? (
              <Skeleton variant="rounded" height={134} />
            ) : (
              <StatCard {...card} />
            )}
          </Grid>
        ))}
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Latest registrations across all camps.
          </Typography>

          {dashboardQuery.isLoading ? (
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={50} />
              <Skeleton variant="rounded" height={50} />
              <Skeleton variant="rounded" height={50} />
            </Stack>
          ) : recentActivity.length ? (
            <List>
              {recentActivity.map((entry: any) => (
                <React.Fragment key={entry.id}>
                  <ListItem disableGutters>
                    <ListItemText
                      primary={`${entry.firstname} ${entry.lastname}`}
                      secondary={`${entry.camp_title} • ${new Date(entry.created_at).toLocaleString()}`}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recent activities yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
