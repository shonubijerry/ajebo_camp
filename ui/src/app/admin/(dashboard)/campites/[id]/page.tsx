"use client";

import { useParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import CampitesBulkForm from "@/components/forms/CampitesBulkForm";
import { useApi } from "@/lib/api/useApi";
import React from "react";
import { Campite } from "@/interfaces";

export default function CampitePage() {
  const params = useParams();
  const campiteId = params?.id as string;
  const { $api } = useApi();
  const [campite, setCampite] = React.useState<Campite | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!campiteId) return;

    const fetchCampite = async () => {
      try {
        const result = $api.useQuery("get", "/api/v1/campites/{id}", {
          params: { path: { id: campiteId } },
        });

        setCampite(result?.data?.data ?? null);
      } catch (err) {
        console.error("Failed to fetch campite:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampite();
  }, [campiteId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleSuccess = () => {
    // Redirect or refresh
    window.location.href = "/admin/campites";
  };

  const handleCancel = () => {
    window.location.href = "/admin/campites";
  };

  return (
    <CampitesBulkForm
      mode="view"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
