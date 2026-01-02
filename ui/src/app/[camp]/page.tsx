"use client";

import CampLandingPage from "@/components/home/CampLandingPage";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/api/useApi";

export default function CampPage() {
  const params = useParams();
  const campId = params?.camp as string | undefined;
  const { $api } = useApi();

  const campQuery = $api.useQuery("get", "/api/v1/camps/{id}", {
    params: { path: { id: campId || "" } },
    enabled: Boolean(campId),
  });

  if (!campId) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <Typography>Camp id is missing.</Typography>
      </Box>
    );
  }

  if (campQuery.isLoading || typeof window === "undefined") {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (campQuery.error || !campQuery.data?.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <Typography>Camp not found.</Typography>
      </Box>
    );
  }

  return <CampLandingPage camp={campQuery.data.data} />;
}
