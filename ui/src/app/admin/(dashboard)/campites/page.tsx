"use client";

import CRUDPage from "@/components/admin/CRUDPage";
import CampitesForm from "@/components/forms/CampitesForm";
import CampitesBulkForm from "@/components/forms/CampitesBulkForm";
import { ColumnDef } from "@tanstack/react-table";
import { Campite } from "@/interfaces";

const CampitesPageContent = () => {
  const columns: ColumnDef<Campite>[] = [
    {
      accessorKey: "camp",
      header: "Camp",
      cell: ({ getValue, row }) => {
        const camp = getValue<{ id: string; title: string }>();
        return camp.title;
      },
    },
    {
      accessorKey: "firstname",
      header: "First Name",
    },
    {
      accessorKey: "lastname",
      header: "Last Name",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "gender",
      header: "Gender",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ getValue }) => {
        const amount = getValue() as number;
        return amount ? `₦${Number(amount).toLocaleString()}` : "-";
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
    },
  ];

  return (
    <CRUDPage<Campite>
      title="Campites Management"
      description="Manage camp registrations. Use bulk creation for multiple registrations at once."
      entityName="campite"
      entityNamePlural="campites"
      listEndpoint="/api/v1/campites/list"
      deleteEndpoint="/api/v1/campites/{id}"
      columns={columns}
      FormComponent={CampitesForm}
      FormCreateComponent={CampitesBulkForm}
      getDeleteMessage={(campite) =>
        `Are you sure you want to delete ${campite?.firstname} ${campite?.lastname}? This action cannot be undone.`
      }
    />
  );
};

export default CampitesPageContent;
