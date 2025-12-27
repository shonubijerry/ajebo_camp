"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CssBaseline, Box, Typography } from "@mui/material";
import AppTheme from "@/components/theme/AppTheme";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DataTable from "@/components/dashboard/DataTable";
import { useApi } from "@/lib/api/useApi";
import { ColumnDef } from "@tanstack/react-table";
import { paths } from "@/lib/api/v1";

type User =
  paths["/api/v1/users/list"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "firstname",
    header: "First Name",
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
];

export default function UsersPage() {
  const router = useRouter();
  const { $api } = useApi();
  
  const result = $api.useQuery("get", "/api/v1/users/list", {
    params: { query: { page: 1, per_page: 100 } },
  });

  const users = result.data?.success ? result.data.data : [];
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
            Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all users
          </Typography>
        </Box>
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          onEdit={(user) => console.log("Edit:", user)}
          onDelete={(user) => console.log("Delete:", user)}
        />
      </DashboardLayout>
    </AppTheme>
  );
}
