"use client";

import CRUDPage from "@/components/admin/CRUDPage";
import CampForm from "@/components/forms/CampForm";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Button, Box } from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Group as CampitesIcon,
} from "@mui/icons-material";
import { Camp } from "@/interfaces";
import { useAuth } from "@/hooks/useAuth";
import { TableCellGetter } from "@/components/dashboard/DataTable";

const CampsPageContent = () => {
  const router = useRouter();
  const { hasPermission } = useAuth();

  const columns: ColumnDef<Camp>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "theme",
      header: "Theme",
    },
    ...((hasPermission("camp:update") && [
      {
        accessorKey: "fee",
        header: "Fee",
        cell: ({ getValue }: TableCellGetter) =>
          `₦${Number(getValue()).toLocaleString()}`,
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ getValue }: TableCellGetter) =>
          new Date(String(getValue())).toLocaleDateString(),
      },
      {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ getValue }: TableCellGetter) =>
          new Date(String(getValue())).toLocaleDateString(),
      },
    ]) ||
      []),
    {
      enableSorting: false,
      accessorKey: " ",
      header: " ",
      cell: ({ getValue, row }) => {
        const campId = row.original.id;
        return (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <span>{getValue<string>()}</span>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {hasPermission("analytics:view") && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  onClick={() =>
                    router.push(`/admin/camps/${campId}/analytics`)
                  }
                >
                  Analytics
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                startIcon={<CampitesIcon />}
                onClick={() => router.push(`/admin/camps/${campId}/campites`)}
              >
                Campites
              </Button>
            </Box>
          </Box>
        );
      },
    },
  ];

  return (
    <CRUDPage<Camp>
      title="Camps Management"
      description="View and manage all camps"
      entityName="camp"
      listEndpoint="/api/v1/camps/list"
      deleteEndpoint="/api/v1/camps/{id}"
      columns={columns}
      FormComponent={CampForm}
      getDeleteMessage={(camp) =>
        `Are you sure you want to delete ${camp?.title}? This action cannot be undone.`
      }
    />
  );
};

export default CampsPageContent;
