"use client"

import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AppTheme from "@/components/theme/AppTheme";

export default function HomePage(props: { disableCustomTheme?: boolean }) {
  return (
      <AppTheme {...props}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={1}
          sx={{ bgcolor: "#fff", color: "#000" }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {/* Logo Placeholder */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "grey.300",
                  borderRadius: 1,
                }}
              />
              <Typography variant="subtitle1" fontWeight={600}>
                Foursquare Youth
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                startIcon={<PersonAddIcon />}
                color="primary"
                variant="text"
              >
                Create Account
              </Button>
              <Button startIcon={<LoginIcon />} color="primary" variant="text">
                Login
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Grid container spacing={6} alignItems="flex-start">
            {/* Left: Poster Placeholder */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  height: 600,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "grey.300",
                  bgcolor: "grey.100",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Camp Poster Placeholder
                </Typography>
              </Box>
            </Grid>

            {/* Right: Text Content */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ maxWidth: 520 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "red", mb: 1, fontWeight: 600 }}
                >
                  Welcome!!!
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  to <br />
                  KC 2025 Youth Camp Registration Portal (Free Registration)
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  ONLINE REGISTRATION IS CLOSED!!!
                </Typography>

                <List dense>
                  <ListItem disablePadding>
                    <ListItemText primary="• Click on create account" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText primary="• If you already have an account, click login" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText primary="• Fill in your details to register/login" />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText primary="• On regular form, fill in your details and click on add list for other members" />
                  </ListItem>
                </List>

                {/* Buttons */}
                <Box sx={{ display: "flex", gap: 3, mt: 4 }}>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "red",
                      px: 4,
                      py: 1.5,
                      "&:hover": { bgcolor: "#c40000" },
                    }}
                  >
                    Register Now
                  </Button>

                  <Button
                    variant="outlined"
                    sx={{
                      color: "green",
                      borderColor: "green",
                      px: 4,
                      py: 1.5,
                      "&:hover": {
                        borderColor: "darkgreen",
                        bgcolor: "rgba(0,128,0,0.04)",
                      },
                    }}
                  >
                    Donate to KC 2025
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Footer */}
        <Box sx={{ mt: 10, py: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Powered By{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              FOURSQUARE YOUTH NIGERIA
            </Box>
          </Typography>
        </Box>
      </Box>
    </AppTheme>
  );
}
