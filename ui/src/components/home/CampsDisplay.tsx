"use client";

import { Camp } from "@/interfaces";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

const colors = {
  red: "#c8102e",
  blue: "#0033a0",
  yellow: "#ffd100",
  navy: "#0b1c3f",
  light: "#f8fafc",
};

function getCampStatus(camp: Camp) {
  if (camp.is_active)
    return { label: "Active", color: "success", isActive: true };

  if (camp.is_coming_soon)
    return { label: "Upcoming", color: "info", isActive: false };

  return { label: "Active", color: "success", isActive: true };
}

function formatMoney(amount: number) {
  return amount <= 0 ? "Free" : `₦${amount.toLocaleString()}`;
}

export default function CampsDisplay({ camps }: { camps: Camp[] }) {
  const activeCamps = camps.filter((c) => getCampStatus(c).isActive);
  const upcomingCamps = camps.filter(
    (c) => getCampStatus(c).label === "Upcoming"
  );
  const primaryCta = activeCamps?.[0] || upcomingCamps?.[0];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.light }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${colors.blue} 0%, ${colors.blue} 50%, ${colors.red} 100%)`,
          color: "#0b1c3f",
          pb: 8,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.65))",
            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{ pt: 10, position: "relative", zIndex: 1 }}
        >
          <Stack spacing={3} sx={{ maxWidth: 900 }}>
            <Chip
              label="Foursquare Ajebo Camp Central"
              sx={{
                width: "fit-content",
                bgcolor: colors.light,
                color: colors.red,
                fontWeight: 700,
              }}
            />
            <Typography
              variant="h3"
              fontWeight={800}
              lineHeight={1.2}
              color={colors.navy}
            >
              Discover, register, and stay ready for every camp.
            </Typography>
            <Typography variant="h6" color={colors.navy} sx={{ opacity: 0.85 }}>
              Explore active and upcoming camps, register seamlessly, and keep
              track of dates, themes, and fees in one place.
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              {primaryCta ? (
                <Button
                  href={`/${primaryCta.id}`}
                  variant="contained"
                  size="large"
                  sx={{
                    px: 3,
                    py: 1.4,
                    bgcolor: colors.red,
                    "&:hover": { bgcolor: "#a70f29" },
                  }}
                >
                  View {primaryCta.title}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  sx={{ px: 3, py: 1.4 }}
                  disabled
                >
                  No Active Camps
                </Button>
              )}

              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 3,
                  py: 1.4,
                  borderColor: colors.navy,
                  color: colors.navy,
                  "&:hover": { borderColor: colors.red, color: colors.red },
                }}
                href="#camps"
              >
                Browse Camps
              </Button>
            </Stack>

            <Grid container spacing={3} sx={{ pt: 2 }}>
              {[
                {
                  label: "Total Camps",
                  value: camps.length,
                  color: colors.blue,
                },
                {
                  label: "Active",
                  value: activeCamps.length,
                  color: colors.red,
                },
                {
                  label: "Upcoming",
                  value: upcomingCamps.length,
                  color: colors.yellow,
                },
              ].map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: "white",
                      border: `1px solid ${item.color}`,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color={colors.navy}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.navy}
                      sx={{ opacity: 0.8 }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }} id="camps">
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800} color={colors.navy}>
            Camps
          </Typography>
          <Typography
            variant="body1"
            color={colors.navy}
            sx={{ opacity: 0.75 }}
          >
            Browse active, upcoming, and completed camps. Registration opens
            automatically for active camps.
          </Typography>
        </Stack>

        {camps.length === 0 ? (
          <Box
            sx={{
              p: 4,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
              bgcolor: "white",
            }}
          >
            <Typography
              variant="body1"
              color={colors.navy}
              sx={{ opacity: 0.7 }}
            >
              No camps available yet. Please check back soon.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {camps.map((camp) => {
              const status = getCampStatus(camp);
              const feeLabel = formatMoney(camp.fee);

              return (
                <Grid key={camp.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      border: `1px solid ${colors.light}`,
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 180,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        bgcolor: colors.light,
                        backgroundImage: camp.banner
                          ? `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.55)), url(${camp.banner})`
                          : `linear-gradient(135deg, ${colors.blue}, ${colors.red})`,
                      }}
                    />
                    <CardContent
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Chip
                          label={status.label}
                          color={
                            status.isActive
                              ? "success"
                              : status.label === "Upcoming"
                                ? "info"
                                : "default"
                          }
                          size="small"
                        />
                        <Chip
                          label={feeLabel}
                          variant="outlined"
                          size="small"
                        />
                      </Stack>

                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color={colors.navy}
                      >
                        {camp.title}
                      </Typography>
                      {camp.theme && (
                        <Typography
                          variant="body2"
                          color={colors.navy}
                          sx={{ opacity: 0.7 }}
                        >
                          Theme: {camp.theme}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        color={colors.navy}
                        sx={{ opacity: 0.7 }}
                      >
                        {new Date(camp.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(camp.end_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>

                      <Box sx={{ mt: "auto" }}>
                        <Button
                          href={`/${camp.id}`}
                          variant="contained"
                          fullWidth
                          sx={{
                            bgcolor: status.isActive ? colors.red : colors.blue,
                            color: "white",
                            "&:hover": {
                              bgcolor: status.isActive ? "#a70f29" : "#002a80",
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      <Box
        sx={{
          py: 4,
          textAlign: "center",
          bgcolor: "white",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <Typography variant="body2" color={colors.navy} sx={{ opacity: 0.75 }}>
          Powered by Foursquare Gospel Church Nigeria • Ajebo Camp Management
        </Typography>
      </Box>
    </Box>
  );
}
