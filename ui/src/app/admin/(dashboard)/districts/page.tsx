"use client";

import CRUDPage from "@/components/admin/CRUDPage";
import DistrictForm from "@/components/forms/DistrictForm";
import { ColumnDef } from "@tanstack/react-table";
import { District } from "@/interfaces";

const columns: ColumnDef<District>[] = [
  {
    accessorKey: "name",
    header: "District Name",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
];

export default function DistrictsPage() {
  return (
    <CRUDPage<District>
      title="Districts Management"
      description="View and manage all districts"
      entityName="district"
      listEndpoint="/api/v1/districts/list"
      deleteEndpoint="/api/v1/districts/{id}"
      columns={columns}
      FormComponent={DistrictForm}
      getDeleteMessage={(district) =>
        `Are you sure you want to delete ${district?.name}? This action cannot be undone.`
      }
      orderBy='[created_at]=desc'
    />
  );
}
