import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Skeleton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import Sidebar, { drawerWidth } from "./Sidebar";
import DashboardAppBar from "./DashboardAppBar";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
  sidebarImage?: { src: string; width: number; height: number };
}

export default function DashboardLayout({
  children,
  userName,
  onLogout,
  sidebarImage,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const pathname = usePathname();

  const showProfileSummary = pathname?.startsWith("/admin/profile") || pathname?.startsWith("/admin/dashboard");

  const profile = user?.data;

  const initials = React.useMemo(() => {
    const first = profile?.firstname?.[0] || "";
    const last = profile?.lastname?.[0] || "";
    return (first + last || "A").toUpperCase();
  }, [profile?.firstname, profile?.lastname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      <DashboardAppBar
        onMenuClick={handleDrawerToggle}
        onLogout={onLogout}
        userName={userName}
      />
      <Box
        sx={{
          "@media print": {
            display: "none",
          },
        }}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
          onLogout={onLogout}
          image={sidebarImage}
        />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 3, sm: 4, md: 5 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          "@media print": {
            width: "100%",
            padding: 2,
            marginLeft: 0,
          },
        }}
      >
        <Toolbar sx={{ "@media print": { display: "none" } }} />

        {showProfileSummary && (<Box
          sx={{
            position: "sticky",
            top: 12,
            zIndex: 8,
            mb: 3,
            "@media print": { display: "none" }
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            {authLoading ? (
              <Skeleton variant="circular" width={48} height={48} />
            ) : (
              <Avatar
                sx={{ width: 48, height: 48, bgcolor: "primary.main", fontWeight: 700 }}
                src={undefined}
              >
                {initials}
              </Avatar>
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                {authLoading ? <Skeleton width={160} /> : `${profile?.firstname ?? ""} ${profile?.lastname ?? ""}`.trim() || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {authLoading ? <Skeleton width={200} /> : profile?.email ?? ""}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {authLoading ? (
                  <Skeleton width={60} height={24} />
                ) : (
                  <Chip
                    size="small"
                    label={profile?.role ?? "user"}
                    sx={{ textTransform: "capitalize", fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Box>

            <Button
              component={Link}
              href="/admin/profile"
              variant="contained"
              size="small"
              sx={{ borderRadius: 2, px: 2.5, whiteSpace: "nowrap" }}
              disabled={authLoading}
            >
              View profile
            </Button>
          </Stack>
        </Box>)}

        {children}
      </Box>
    </Box>
  );
}
