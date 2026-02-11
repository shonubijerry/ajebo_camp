import React from 'react'
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
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  PersonOutline as PersonIcon,
  People as PeopleIcon,
  Terrain as CampingIcon,
  Map as MapIcon,
  ReceiptLong as ReceiptLongIcon,
  Logout as LogoutIcon,
  Groups3 as Groups3Icon,
  Groups2 as Groups2Icon,
  QrCodeScanner,
} from '@mui/icons-material'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Permission } from '@/interfaces'
import { usePathname } from 'next/navigation'

const drawerWidth = 260

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  requiredPermissions?: Permission[]
}

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  onLogout?: () => void
  image?: { src: string; width: number; height: number }
}

const defaultNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/portal/dashboard',
    icon: <DashboardIcon />,
    requiredPermissions: ['dashboard:view'],
  },
  {
    label: 'Camps',
    href: '/portal/camps',
    icon: <CampingIcon />,
    requiredPermissions: ['camp:view'],
  },
  {
    label: 'Campites',
    href: '/portal/campites',
    icon: <Groups3Icon />,
    requiredPermissions: ['campite:view'],
  },
  {
    label: 'Camp Allocations',
    href: '/portal/camp-allocations',
    icon: <ReceiptLongIcon />,
    requiredPermissions: ['camp-allocation:view'],
  },
  {
    label: 'Users',
    href: '/portal/users',
    icon: <PeopleIcon />,
    requiredPermissions: ['user:manage'],
  },
  {
    label: 'Entities',
    href: '/portal/entities',
    icon: <Groups2Icon />,
    requiredPermissions: ['entity:view'],
  },
  {
    label: 'Districts',
    href: '/portal/districts',
    icon: <MapIcon />,
    requiredPermissions: ['district:view'],
  },
  {
    label: 'Checkin',
    href: '/portal/checkin',
    icon: <QrCodeScanner />,
    requiredPermissions: ['campite:view', 'campite:update', 'camp:update'],
  },
  {
    label: 'Profile',
    href: '/portal/profile',
    icon: <PersonIcon />,
  },
]

function DrawerContent({
  onLogout,
  image,
}: Pick<SidebarProps, 'onLogout' | 'image'>) {
  const { hasPermission, isLoading } = useAuth()
  const pathname = usePathname()
  const navItems = defaultNavItems.filter(
    (item) =>
      !item.requiredPermissions ||
      (hasPermission && hasPermission(item.requiredPermissions)),
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2, py: 3, gap: 1.5, minHeight: 'auto' }}>
        {image ? (
          <Image
            src={image.src}
            alt="Admin Panel"
            width={image.width}
            height={image.height}
            style={{ height: 40, width: 'auto' }}
          />
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              A
            </Typography>
          </Box>
        )}
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: -0.5 }}
          >
            Ajebo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Portal
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ my: 1 }} />
      <List sx={{ flex: 1, px: 1 }}>
        {isLoading && navItems.length === 0 && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton disabled sx={{ borderRadius: 1 }}>
              <ListItemText primary="Loading..." />
            </ListItemButton>
          </ListItem>
        )}
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: 1,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'inherit',
                  '&.MuiSvgIcon-root': {
                    color: isActive ? 'white' : 'inherit',
                  },
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'inherit',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
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
  )
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
  onLogout,
  image,
}: SidebarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const drawer = <DrawerContent onLogout={onLogout} image={image} />

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
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
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
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  )
}

export { drawerWidth }
