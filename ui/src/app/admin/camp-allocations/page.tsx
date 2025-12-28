"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CssBaseline, Box, Typography } from "@mui/material";
import AppTheme from "@/components/theme/AppTheme";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DataTable from "@/components/dashboard/DataTable";
import { useApi } from "@/lib/api/useApi";
import { ColumnDef } from "@tanstack/react-table";
import { CampAllocation } from "@/interfaces";

const columns: ColumnDef<CampAllocation>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ getValue }) => {
      const items = getValue() as string[];
      return items?.join(", ") || "-";
    },
  },
  {
    accessorKey: "allocation_type",
    header: "Type",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return type ? type.charAt(0).toUpperCase() + type.slice(1) : "-";
    },
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
            Camp Allocations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all camp allocations. Create allocations through the Camps form.
          </Typography>
        </Box>

        <DataTable
          data={allocations}
          columns={columns}
          isLoading={isLoading}
        />
      </DashboardLayout>
    </AppTheme>
  );
}
