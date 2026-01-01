import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import ColorModeSelect from "@/components/theme/ColorModeSelect";
import { drawerWidth } from "./Sidebar";
import { useRouter } from "next/navigation";

interface DashboardAppBarProps {
  onMenuClick?: () => void;
  onLogout?: () => void;
  initials?: string;
}

export default function DashboardAppBar({
  onMenuClick,
  onLogout,
  initials = "Admin User",
}: DashboardAppBarProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push("/admin/profile");
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout?.();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundImage: "none",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        borderBottom: "1px solid",
        borderColor: "divider",
        "@media print": {
          display: "none",
        },
      }}
      color="inherit"
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
          Dashboard
        </Typography>
        <ColorModeSelect size="small" sx={{ mr: 2 }} />
        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={{
            ml: 1,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <Avatar
            alt={initials}
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: "0.875rem",
            }}
          >
            {initials}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleProfile}>
            <AccountCircleIcon fontSize="small" sx={{ mr: 1.5 }} />
            <Typography variant="body2">Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon
              fontSize="small"
              sx={{ mr: 1.5, color: "error.main" }}
            />
            <Typography variant="body2" color="error">
              Logout
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
