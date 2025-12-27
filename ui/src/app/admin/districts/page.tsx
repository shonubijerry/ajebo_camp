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

type District = paths["/api/v1/districts/list"]["get"]["responses"]["200"]["content"]["application/json"]['data'][number]

const columns: ColumnDef<District>[] = [
  {
    accessorKey: "name",
    header: "District Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
];

export default function DistrictsPage() {
  const router = useRouter();
  const { $api } = useApi();
  
  const result = $api.useQuery("get", "/api/v1/districts/list", {
    params: { query: { page: 1, per_page: 100 } },
  });

  const districts = result.data?.success ? result.data.data : [];
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
            Districts Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all districts
          </Typography>
        </Box>
        <DataTable
          data={districts}
          columns={columns}
          isLoading={isLoading}
          onEdit={(district) => console.log("Edit:", district)}
          onDelete={(district) => console.log("Delete:", district)}
        />
      </DashboardLayout>
    </AppTheme>
  );
}
