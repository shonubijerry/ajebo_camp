"use client";

import CRUDPage from "@/components/admin/CRUDPage";
import CampitesForm from "@/components/forms/CampitesForm";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/api/useApi";
import { Campite } from "@/interfaces";
import CampitesBulkForm from "@/components/forms/CampitesBulkForm";

const CampCampitesPageContent = () => {
  const params = useParams();
  const campId = params?.id as string;
  const { $api } = useApi();
  const campResult = $api.useQuery("get", `/api/v1/camps/{id}`, {
    params: { path: { id: campId } },
  });
  const camp = campResult.data?.data;

  const columns: ColumnDef<Campite>[] = [
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
      title={`${camp?.title} Campites`}
      description={`Manage campites registered for the ${camp?.title} camp.`}
      entityName="campite"
      entityNamePlural="campites"
      listEndpoint="/api/v1/campites/list"
      deleteEndpoint="/api/v1/campites/{id}"
      columns={columns}
      FormComponent={CampitesForm}
      FormCreateComponent={CampitesBulkForm}
      getDeleteMessage={(campite) =>
        `Are you sure you want to delete ${campite?.firstname} ${campite?.lastname}?`
      }
      filter={`[camp_id][equals]=${campId}`}
    />
  );
};

export default CampCampitesPageContent;
