"use client";

import CRUDPage from "@/components/portal/CRUDPage";
import CampitesForm from "@/components/forms/CampitesForm";
import { ColumnDef } from "@tanstack/react-table";
import React, { useCallback } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/api/useApi";
import { Campite } from "@/interfaces";
import CampitesBulkForm from "@/components/forms/CampitesBulkForm";
import { Box, Button } from "@mui/material";

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

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:6001";

  const handleExport = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const url = `${apiBaseUrl}/api/v1/campites/export?camp_id=${campId}`;

      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download campites");
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `camp-${campId.split('-')[4]}-${Date.now()}-campites.xlsx`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error(error);
      alert("Unable to download campites export.");
    }
  }, [apiBaseUrl, campId]);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" size="small" onClick={handleExport}>
          Download Excel
        </Button>
      </Box>

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
        orderBy='[created_at]=desc'
      />
    </>
  );
};

export default CampCampitesPageContent;
