"use client";

import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const profile = user?.data;

  const initials = React.useMemo(() => {
    const first = profile?.firstname?.[0] || "";
    const last = profile?.lastname?.[0] || "";
    return (first + last || "A").toUpperCase();
  }, [profile?.firstname, profile?.lastname]);

  const infoRows = [
    { label: "Email", value: profile?.email },
    { label: "Phone", value: profile?.phone || "Not provided" },
    { label: "Role", value: profile?.role },
    { label: "User ID", value: profile?.id },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your account details and permissions.
        </Typography>
      </Box>

      <Card
        sx={{
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)",
            color: "white",
            px: { xs: 3, sm: 4 },
            py: { xs: 3, sm: 4 },
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {isLoading ? (
            <Skeleton
              variant="circular"
              width={72}
              height={72}
              sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
            />
          ) : (
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "white",
                color: "primary.main",
                fontWeight: 800,
              }}
            >
              {initials}
            </Avatar>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
              {isLoading ? (
                <Skeleton
                  width={180}
                  sx={{ bgcolor: "rgba(255,255,255,0.4)" }}
                />
              ) : (
                `${profile?.firstname ?? ""} ${profile?.lastname ?? ""}`.trim() ||
                "User"
              )}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }} noWrap>
              {isLoading ? (
                <Skeleton
                  width={220}
                  sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
                />
              ) : (
                (profile?.email ?? "")
              )}
            </Typography>
          </Box>
        </Box>

        <CardContent>
          <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
            {infoRows.map((row) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={row.label}>
                <Typography variant="overline" color="text.secondary">
                  {row.label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {isLoading ? <Skeleton width={140} /> : row.value || "—"}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Permissions
          </Typography>
          {isLoading ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} width={90} height={28} />
              ))}
            </Stack>
          ) : profile?.permissions?.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
              {profile.permissions.map((perm) => (
                <Chip
                  key={perm}
                  label={perm}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No permissions assigned.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
