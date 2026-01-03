"use client";

import CRUDPage from "@/components/portal/CRUDPage";
import EntityForm from "@/components/forms/EntityForm";
import { ColumnDef } from "@tanstack/react-table";
import { Entity } from "@/interfaces";

const columns: ColumnDef<Entity>[] = [
  {
    accessorKey: "name",
    header: "Entity Name",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
];

export default function EntitiesPage() {
  return (
    <CRUDPage<Entity>
      title="Entities Management"
      description="View and manage all entities"
      entityName="entity"
      entityNamePlural="entities"
      listEndpoint="/api/v1/entities/list"
      deleteEndpoint="/api/v1/entities/{id}"
      columns={columns}
      FormComponent={EntityForm}
      getDeleteMessage={(entity) =>
        `Are you sure you want to delete ${entity?.name}? This action cannot be undone.`
      }
    />
  );
}
