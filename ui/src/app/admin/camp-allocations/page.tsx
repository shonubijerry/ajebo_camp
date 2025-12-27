"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CssBaseline, Box, Typography } from "@mui/material";
import AppTheme from "@/components/theme/AppTheme";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DataTable from "@/components/dashboard/DataTable";
import { useApi } from "@/lib/api/useApi";
import { ColumnDef } from "@tanstack/react-table";
import { paths } from "@/lib/api/v1";

type CampAllocation = paths["/api/v1/camp-allocations/list"]["get"]["responses"]["200"]["content"]["application/json"]['data'][number]

const columns: ColumnDef<CampAllocation>[] = [
  {
    accessorKey: "id",
    header: "Allocation ID",
  },
  {
    accessorKey: "camp_id",
    header: "Camp ID",
  },
  {
    accessorKey: "user_id",
    header: "User ID",
  },
  {
    accessorKey: "allocation_date",
    header: "Allocation Date",
    cell: ({ getValue }) => {
      const date = getValue();
      return date ? new Date(String(date)).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <Box
        sx={{
          display: "inline-block",
          px: 1.5,
          py: 0.5,
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: 600,
          bgcolor: getValue() === "active" ? "success.light" : "warning.light",
          color: getValue() === "active" ? "success.dark" : "warning.dark",
        }}
      >
        {String(getValue() || "pending").toUpperCase()}
      </Box>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
];

export default function CampAllocationsPage() {
  const router = useRouter();
  const { $api } = useApi();
  
  const result = $api.useQuery("get", "/api/v1/camp-allocations/list", {
    params: { query: { page: 1, per_page: 100 } },
  });

  const allocations = result.data?.success ? result.data.data : [];
  const isLoading = result.isLoading;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin");
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <DashboardLayout onLogout={handleLogout}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Camp Allocations Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage camp allocations
          </Typography>
        </Box>
        <DataTable
          data={allocations}
          columns={columns}
          isLoading={isLoading}
          onEdit={(allocation) => console.log("Edit:", allocation)}
          onDelete={(allocation) => console.log("Delete:", allocation)}
        />
      </DashboardLayout>
    </AppTheme>
  );
}
