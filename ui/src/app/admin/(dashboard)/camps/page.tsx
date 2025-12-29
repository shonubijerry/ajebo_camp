"use client";

import CRUDPage from "@/components/admin/CRUDPage";
import CampForm from "@/components/forms/CampForm";
import { ColumnDef } from "@tanstack/react-table";
import { paths } from "@/lib/api/v1";

type Camp = paths["/api/v1/camps/list"]["get"]["responses"]["200"]["content"]["application/json"]['data'][number]

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
    accessorKey: "fee",
    header: "Fee",
    cell: ({ getValue }) => `₦${Number(getValue()).toLocaleString()}`,
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
];

export default function CampsPage() {
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
}
