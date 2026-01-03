"use client";

import CRUDPage from "@/components/portal/CRUDPage";
import UserForm from "@/components/forms/UserForm";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/interfaces";

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
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
  },
];

export default function UsersPage() {
  return (
    <CRUDPage<User>
      title="Users Management"
      description="View and manage all users"
      entityName="user"
      listEndpoint="/api/v1/users/list"
      deleteEndpoint="/api/v1/users/{id}"
      columns={columns}
      FormComponent={UserForm}
      getDeleteMessage={(user) =>
        `Are you sure you want to delete ${user?.firstname} ${user?.lastname}? This action cannot be undone.`
      }
      orderBy='[created_at]=desc'
    />
  );
}
