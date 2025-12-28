import React from "react";
import {
  Box,
  Drawer,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Terrain as CampingIcon,
  Map as MapIcon,
  ReceiptLong as ReceiptLongIcon,
  Logout as LogoutIcon,
  Groups3 as Groups3Icon
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";

const drawerWidth = 260;

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onLogout?: () => void;
  image?: { src: string; width: number; height: number };
}

const defaultNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon /> },
  { label: "Users", href: "/admin/users", icon: <PeopleIcon /> },
  { label: "Entities", href: "/admin/entities", icon: <Groups3Icon /> },
  { label: "Camps", href: "/admin/camps", icon: <CampingIcon /> },
  { label: "Districts", href: "/admin/districts", icon: <MapIcon /> },
  { label: "Camp Allocations", href: "/admin/camp-allocations", icon: <ReceiptLongIcon /> },
];

function DrawerContent({ onLogout, image }: Pick<SidebarProps, "onLogout" | "image">) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ px: 2, py: 3, gap: 1.5, minHeight: "auto" }}>
        {image ? (
          <Image
            src={image.src}
            alt="Admin Panel"
            width={image.width}
            height={image.height}
            style={{ height: 40, width: "auto" }}
          />
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
              A
            </Typography>
          </Box>
        )}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
            Admin
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Panel
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ my: 1 }} />
      <List sx={{ flex: 1, px: 1 }}>
        {defaultNavItems.map((item) => (
          <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              href={item.href}
              sx={{
                borderRadius: 1,
                "&.active": {
                  bgcolor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2", fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{ borderRadius: 1 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
  onLogout,
  image,
}: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const drawer = <DrawerContent onLogout={onLogout} image={image} />;

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="sidebar navigation"
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
}

export { drawerWidth };
