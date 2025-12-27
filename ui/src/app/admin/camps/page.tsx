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

type Camp = paths["/api/v1/camps/list"]["get"]["responses"]["200"]["content"]["application/json"]['data'][number]

const columns: ColumnDef<Camp>[] = [
  {
    accessorKey: "name",
    header: "Camp Name",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "district_id",
    header: "District ID",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
];

export default function CampsPage() {
  const router = useRouter();
  const { $api } = useApi();
  
  const result =  $api.useQuery("get", "/api/v1/camps/list", {
    params: { query: { page: 1, per_page: 100 } },
  });

  const camps = result.data?.success ? result.data.data : [];
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
            Camps Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all camps
          </Typography>
        </Box>
        <DataTable
          data={camps}
          columns={columns}
          isLoading={isLoading}
          onEdit={(camp) => console.log("Edit:", camp)}
          onDelete={(camp) => console.log("Delete:", camp)}
        />
      </DashboardLayout>
    </AppTheme>
  );
}
