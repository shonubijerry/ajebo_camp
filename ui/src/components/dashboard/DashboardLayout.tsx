import React from "react";
import { Box, Toolbar } from "@mui/material";
import Sidebar, { drawerWidth } from "./Sidebar";
import DashboardAppBar from "./DashboardAppBar";

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
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
        onLogout={onLogout}
        image={sidebarImage}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
