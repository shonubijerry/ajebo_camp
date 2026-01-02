"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import SlideInDrawer from "@/components/dashboard/SlideInDrawer";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import IndividualRegistrationForm from "@/components/registration/IndividualRegistrationForm";
import DonationForm from "@/components/donations/DonationForm";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const colors = {
  red: "#c8102e",
  blue: "#0033a0",
  yellow: "#ffd100",
  navy: "#0b1c3f",
  light: "#f8fafc",
};

interface CampLandingPageProps {
  camp: {
    id: string;
    title: string;
    theme?: string | null;
    verse?: string | null;
    banner?: string | null;
    fee: number;
    premium_fees?: number[];
    start_date: string;
    end_date: string;
    description?: string | null;
    location?: string | null;
    venue?: string | null;
    highlights?: string[];
    registration_deadline?: string | null;
    capacity?: number | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    is_active: boolean;
    is_coming_soon: boolean;
    year: number;
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(amount: number) {
  return amount <= 0 ? "Free" : `₦${amount.toLocaleString()}`;
}

function getCampDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return `${days} ${days === 1 ? 'Day' : 'Days'}`;
}

export default function CampLandingPage({ camp }: CampLandingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campStatus = camp.is_active ? "Active" : camp.is_coming_soon ? "Upcoming" : "Closed";
  const canRegister = camp.is_active;
  const [registrationType, setRegistrationType] = useState<"individual" | "group">("individual");
  const [openDrawer, setOpenDrawer] = useState<"login" | "signup" | "register" | "donate" | null>(null);

  // Handle URL parameters for opening drawers
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "login" || action === "signup" || action === "register" || action === "donate") {
      setOpenDrawer(action);
    }
  }, [searchParams]);

  const handleDrawerClose = () => {
    setOpenDrawer(null);
    // Remove the action parameter from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleOpenDrawer = (type: "login" | "signup" | "register" | "donate") => {
    setOpenDrawer(type);
    // Add action parameter to URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("action", type);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleRegistrationClick = () => {
    if (registrationType === "individual") {
      handleOpenDrawer("register");
    } else {
      handleOpenDrawer("login");
    }
  };

  const handleAuthSuccess = (token: string) => {
    handleDrawerClose();
    router.push("/admin/dashboard");
  };

  const handleRegistrationSuccess = () => {
    handleDrawerClose();
    // Optionally show a success message or redirect
  };

  const registrationButtonLabel = registrationType === "group" ? "Login to Group Portal" : "Register Now";
  const ctaButtonLabel =
    registrationType === "group" ? "Login for Group Registration" : `Register for ${camp.title}`;
  const heroPrimaryLabel = canRegister
    ? registrationButtonLabel
    : campStatus === "Upcoming"
      ? "Registration Opens Soon"
      : "Registration Closed";

  return (
    <Box sx={{ bgcolor: colors.light }}>
      {/* Hero + Quick Info occupy full viewport height */}
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Hero Section */}
        <Box
          sx={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            backgroundImage: camp.banner
              ? `linear-gradient(rgba(11, 28, 63, 0.75), rgba(11, 28, 63, 0.85)), url(${camp.banner})`
              : `linear-gradient(135deg, ${colors.blue} 0%, ${colors.navy} 50%, ${colors.red} 100%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
          }}
        >
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 8 }}>
            <Stack spacing={3} sx={{ maxWidth: 800 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                label={campStatus}
                color={canRegister ? "success" : camp.is_coming_soon ? "info" : "default"}
                sx={{ fontWeight: 700, fontSize: "0.9rem" }}
              />
              <Chip
                label={camp.year}
                color="secondary"
              />
            </Stack>

            <Typography
              variant="h2"
              fontWeight={900}
              lineHeight={1.1}
              sx={{
                textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              {camp.title}
            </Typography>

            {camp.theme && (
              <Typography
                variant="h4"
                fontWeight={600}
                sx={{
                  textShadow: "1px 1px 4px rgba(0,0,0,0.3)",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  opacity: 0.95,
                }}
              >
                {camp.theme}
              </Typography>
            )}

            {camp.verse && (
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontStyle: "italic",
                    color: "white",
                    fontSize: "1.1rem",
                  }}
                >
                  "{camp.verse}"
                </Typography>
              </Paper>
            )}

            <Stack direction="row" spacing={2} sx={{ pt: 2 }} flexWrap="wrap">
              <Button
                onClick={handleRegistrationClick}
                variant="contained"
                size="large"
                disabled={!canRegister}
                color="secondary"
                sx={{
                  px: 4,
                  py: 1.8,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                }}
              >
                {heroPrimaryLabel}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.8,
                  borderColor: "white",
                  color: "white",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  "&:hover": { 
                    borderColor: colors.yellow, 
                    bgcolor: "rgba(255,255,255,0.1)" 
                  },
                }}
                href="#details"
              >
                Learn More
              </Button>

              <Button
                onClick={() => handleOpenDrawer("donate")}
                variant="outlined"
                size="large"
                startIcon={<FavoriteBorderIcon />}
                sx={{
                  px: 4,
                  py: 1.8,
                  borderColor: "white",
                  color: "white",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  "&:hover": { 
                    borderColor: colors.yellow, 
                    bgcolor: "rgba(255,255,255,0.1)" 
                  },
                }}
              >
                Donate
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

        {/* Quick Info Bar */}
        <Box
          sx={{
            bgcolor: 'blue.main',
            color: "white",
            py: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            flexShrink: 0,
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={3} justifyContent="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <CalendarTodayIcon />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Dates
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatDateShort(camp.start_date)} - {formatDateShort(camp.end_date)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <EventAvailableIcon />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Duration
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {getCampDuration(camp.start_date, camp.end_date)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {camp.location && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                    <LocationOnIcon />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Location
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {camp.location}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <InfoIcon />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Fee
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatMoney(camp.fee)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="details">
        <Grid container spacing={4}>
          {/* Left Column - Main Info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              {/* About Section */}
              {camp.description && (
                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color={colors.navy}
                      sx={{ mb: 2 }}
                    >
                      About This Camp
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: colors.yellow, borderWidth: 2 }} />
                    <Typography
                      variant="body1"
                      sx={{ lineHeight: 1.8, color: colors.navy }}
                    >
                      {camp.description}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Highlights Section */}
              {camp.highlights && camp.highlights.length > 0 && (
                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color={colors.navy}
                      sx={{ mb: 2 }}
                    >
                      Camp Highlights
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: colors.yellow, borderWidth: 2 }} />
                    <List>
                      {camp.highlights.map((highlight, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <CheckCircleIcon sx={{ color: colors.red }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={highlight}
                            primaryTypographyProps={{
                              fontSize: "1.05rem",
                              color: colors.navy,
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Venue Details */}
              {camp.venue && (
                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color={colors.navy}
                      sx={{ mb: 2 }}
                    >
                      Venue Information
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: colors.yellow, borderWidth: 2 }} />
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <LocationOnIcon sx={{ color: colors.red, mt: 0.5 }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600} color={colors.navy}>
                            {camp.venue}
                          </Typography>
                          {camp.location && (
                            <Typography variant="body2" color="text.secondary">
                              {camp.location}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Registration Card */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  border: `2px solid ${canRegister ? colors.red : colors.light}`,
                  position: "sticky",
                  top: 20,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={800} color={colors.navy} sx={{ mb: 2 }}>
                    Registration Fee
                  </Typography>
                  <Typography variant="h3" fontWeight={900} color={colors.red} sx={{ mb: 1 }}>
                    {formatMoney(camp.fee)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    per participant
                  </Typography>

                  {camp.premium_fees && camp.premium_fees.length > 0 && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: colors.light, borderRadius: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Premium Options Available
                      </Typography>
                      <Stack spacing={0.5}>
                        {camp.premium_fees.map((fee, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            • {formatMoney(fee)}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} color={colors.navy}>
                      Choose Registration Type
                    </Typography>
                    <ToggleButtonGroup
                      value={registrationType}
                      exclusive
                      onChange={(_, value) => value && setRegistrationType(value as "individual" | "group")}
                      fullWidth
                      color="primary"
                    >
                      <ToggleButton value="individual" sx={{ fontWeight: 700 }}>
                        Individual
                      </ToggleButton>
                      <ToggleButton value="group" sx={{ fontWeight: 700 }}>
                        Group
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant="caption" color="text.secondary">
                      Individual is prioritized. Group registration continues in the admin portal.
                    </Typography>
                  </Stack>

                  <Button
                    onClick={handleRegistrationClick}
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!canRegister}
                    color="secondary"
                    sx={{
                      py: 1.5,
                      fontWeight: 700,
                    }}
                  >
                    {canRegister ? registrationButtonLabel : "Registration Closed"}
                  </Button>

                  {camp.registration_deadline && canRegister && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block", textAlign: "center" }}>
                      Registration closes: {formatDateShort(camp.registration_deadline)}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Key Details */}
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={800} color={colors.navy} sx={{ mb: 2 }}>
                    Key Details
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Start Date
                      </Typography>
                      <Typography variant="body2" color={colors.navy} fontWeight={600}>
                        {formatDate(camp.start_date)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        End Date
                      </Typography>
                      <Typography variant="body2" color={colors.navy} fontWeight={600}>
                        {formatDate(camp.end_date)}
                      </Typography>
                    </Box>
                    {camp.capacity && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Capacity
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PeopleIcon sx={{ color: colors.red, fontSize: "1.2rem" }} />
                            <Typography variant="body2" color={colors.navy} fontWeight={600}>
                              {camp.capacity} participants
                            </Typography>
                          </Stack>
                        </Box>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Contact Information */}
              {(camp.contact_email || camp.contact_phone) && (
                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800} color={colors.navy} sx={{ mb: 2 }}>
                      Contact Us
                    </Typography>
                    <Stack spacing={2}>
                      {camp.contact_email && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <EmailIcon sx={{ color: colors.red }} />
                          <Typography
                            variant="body2"
                            sx={{
                              wordBreak: "break-word",
                              color: colors.navy,
                            }}
                          >
                            {camp.contact_email}
                          </Typography>
                        </Stack>
                      )}
                      {camp.contact_phone && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <PhoneIcon sx={{ color: colors.red }} />
                          <Typography variant="body2" color={colors.navy}>
                            {camp.contact_phone}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      {canRegister && (
        <Box
          sx={{
            bgcolor: 'blue.dark',
            color: "white",
            py: 8,
            textAlign: "center",
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
              Ready to Join Us?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Don't miss this opportunity to be part of an amazing spiritual experience.
              Register now to secure your spot!
            </Typography>
            <Stack spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <ToggleButtonGroup
                value={registrationType}
                exclusive
                onChange={(_, value) => value && setRegistrationType(value as "individual" | "group")}
                color="primary"
                sx={{
                  background: '#ffffffda'
                }}
              >
                <ToggleButton value="individual" sx={{ fontWeight: 700 }}>
                  Individual
                </ToggleButton>
                <ToggleButton value="group" sx={{ fontWeight: 700 }}>
                  Group
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Individual is the default; group registration continues in the admin portal.
              </Typography>
            </Stack>
            <Button
              onClick={handleRegistrationClick}
              variant="contained"
              size="large"
              color="secondary"
              sx={{
                px: 5,
                py: 2,
                bgcolor: colors.red,
                fontSize: "1.1rem",
                fontWeight: 700,
                "&:hover": { bgcolor: "#a70f29" },
              }}
            >
              {ctaButtonLabel}
            </Button>
          </Container>
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          textAlign: "center",
          bgcolor: "white",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
          <Typography variant="body2" color={colors.navy} sx={{ opacity: 0.75 }}>
            Powered by <span style={{ color: "#f00" }}>Foursquare Gospel Church Nigeria</span> • Ajebo Camp Management
          </Typography>
          <IconButton
            href="/"
            size="small"
            sx={{
              color: colors.navy,
              opacity: 0.7,
              border: "1px solid rgba(0,0,0,0.08)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              "&:hover": { opacity: 1, transform: "translateY(-1px)" },
            }}
          >
            <HomeIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Slide-in Drawers */}
      <SlideInDrawer
        open={openDrawer === "register"}
        onClose={handleDrawerClose}
        title="Individual Registration"
        width={700}
      >
        <IndividualRegistrationForm
          campId={camp.id}
          onSuccess={handleRegistrationSuccess}
        />
      </SlideInDrawer>

      <SlideInDrawer
        open={openDrawer === "login"}
        onClose={handleDrawerClose}
        title="Group Portal Login"
        width={500}
      >
        <LoginForm
          onSuccess={handleAuthSuccess}
          onSignupClick={() => handleOpenDrawer("signup")}
        />
      </SlideInDrawer>

      <SlideInDrawer
        open={openDrawer === "signup"}
        onClose={handleDrawerClose}
        title="Create Group Account"
        width={500}
      >
        <SignupForm
          onSuccess={handleAuthSuccess}
          onLoginClick={() => handleOpenDrawer("login")}
        />
      </SlideInDrawer>

      <SlideInDrawer
        open={openDrawer === "donate"}
        onClose={handleDrawerClose}
        title="Make a Donation"
        width={500}
      >
        <DonationForm
          campTitle={camp.title}
          onSuccess={handleDrawerClose}
          onClose={handleDrawerClose}
        />
      </SlideInDrawer>
    </Box>
  );
}
