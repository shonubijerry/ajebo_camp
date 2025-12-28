"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CssBaseline,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AppTheme from "@/components/theme/AppTheme";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DataTable from "@/components/dashboard/DataTable";
import SlideInDrawer from "@/components/dashboard/SlideInDrawer";
import { useApi } from "@/lib/api/useApi";
import { ColumnDef } from "@tanstack/react-table";

interface CRUDPageProps<T extends { id?: string }> {
  title: string;
  description: string;
  entityName: string; // singular, e.g., "user", "camp"
  entityNamePlural?: string; // plural, e.g., "users", "camps" (defaults to entityName + 's')
  listEndpoint: any;
  deleteEndpoint: any;
  columns: ColumnDef<T>[];
  FormComponent: React.ComponentType<{
    [key: string]: any;
    mode: "create" | "edit" | "view";
    onSuccess: () => void;
    onCancel: () => void;
  }>;
  formPropName?: string; // name of the prop to pass entity to form, defaults to entityName
  getDeleteMessage?: (entity: T) => string;
}

export default function CRUDPage<T extends { id?: string; name?: string; title?: string }>({
  title,
  description,
  entityName,
  entityNamePlural,
  listEndpoint,
  deleteEndpoint,
  columns,
  FormComponent,
  formPropName,
  getDeleteMessage,
}: CRUDPageProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { $api } = useApi();

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerMode, setDrawerMode] = React.useState<"create" | "edit" | "view">("view");
  const [selectedEntity, setSelectedEntity] = React.useState<T | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [entityToDelete, setEntityToDelete] = React.useState<T | null>(null);

  const plural = entityNamePlural || `${entityName}s`;
  const propName = formPropName || entityName;

  const deleteMutation = $api.useMutation("delete", deleteEndpoint);
  const result = $api.useQuery("get", listEndpoint, {
    params: { query: { page: 1, per_page: 100 } },
  });

  const entities = result.data?.success ? result.data.data : [];
  const isLoading = result.isLoading;

  // Handle URL params for direct access
  React.useEffect(() => {
    const id = searchParams.get("id");
    if (id && entities.length > 0) {
      const entity = entities.find((e: any) => e.id === id);
      if (entity) {
        setSelectedEntity(entity);
        setDrawerMode("view");
        setDrawerOpen(true);
      }
    }
  }, [searchParams, entities]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin");
  };

  const handleCreateNew = () => {
    setSelectedEntity(undefined);
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  const handleView = (entity: T) => {
    router.push(`/admin/${plural}?id=${entity.id}`);
  };

  const handleEdit = (entity: T) => {
    setSelectedEntity(entity);
    setDrawerMode("edit");
    setDrawerOpen(true);
  };

  const handleDelete = (entity: T) => {
    setEntityToDelete(entity);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!entityToDelete?.id) return;

    try {
      await deleteMutation.mutateAsync({
        params: { path: { id: entityToDelete.id } },
      });
      setDeleteDialogOpen(false);
      setEntityToDelete(null);
      result.refetch();
    } catch (error) {
      console.error(`Failed to delete ${entityName}:`, error);
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    if (searchParams.get("id")) {
      router.push(`/admin/${plural}`);
    }
  };

  const handleFormSuccess = () => {
    setDrawerOpen(false);
    if (searchParams.get("id")) {
      router.push(`/admin/${plural}`);
    }
    result.refetch();
  };

  const getDrawerTitle = () => {
    const capitalizedName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
    if (drawerMode === "create") return `Create New ${capitalizedName}`;
    if (drawerMode === "edit") return `Edit ${capitalizedName}`;
    return `View ${capitalizedName}`;
  };

  const getDefaultDeleteMessage = () => {
    const name = (entityToDelete as any)?.name || (entityToDelete as any)?.title || "this item";
    return `Are you sure you want to delete ${name}? This action cannot be undone.`;
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <DashboardLayout onLogout={handleLogout}>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create New
          </Button>
        </Box>

        <DataTable
          data={entities}
          columns={columns}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <SlideInDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={getDrawerTitle()}
        >
          <FormComponent
            {...{ [propName]: selectedEntity }}
            mode={drawerMode}
            onSuccess={handleFormSuccess}
            onCancel={handleDrawerClose}
          />
        </SlideInDrawer>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {getDeleteMessage ? getDeleteMessage(entityToDelete!) : getDefaultDeleteMessage()}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </AppTheme>
  );
}
