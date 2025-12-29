"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  FormLabel,
  TextareaAutosize,
} from "@mui/material";
import { useApi } from "@/lib/api/useApi";
import {
  CreateCampAllocationRequest,
  UpdateCampAllocationRequest,
  CampAllocation,
} from "@/interfaces";

interface CampAllocationFormData {
  camp_id: string;
  name: string;
  items: string;
  allocation_type: "random" | "definite";
}

interface CampAllocationFormProps {
  campAllocation?: CampAllocation;
  mode: "create" | "edit" | "view";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CampAllocationForm({
  campAllocation,
  mode,
  onSuccess,
  onCancel,
}: CampAllocationFormProps) {
  const { $api } = useApi();
  const [error, setError] = React.useState<string | null>(null);
  const isView = mode === "view";

  const createMutation = $api.useMutation("post", "/api/v1/camp-allocations");
  const updateMutation = $api.useMutation(
    "patch",
    "/api/v1/camp-allocations/{id}"
  );

  const campsResult = $api.useQuery("get", "/api/v1/camps/list", {
    params: { query: { page: 1, per_page: 100 } },
  });

  const camps = campsResult.data?.success ? campsResult.data.data : [];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CampAllocationFormData>({
    defaultValues: {
      camp_id: campAllocation?.camp_id || "",
      name: campAllocation?.name || "",
      items: Array.isArray(campAllocation?.items)
        ? campAllocation.items.join(", ")
        : "",
      allocation_type:
        (campAllocation?.allocation_type as "random" | "definite") || "random",
    },
  });

  const onSubmit = async (data: CampAllocationFormData) => {
    try {
      setError(null);

      const requestBody: CreateCampAllocationRequest = {
        camp_id: data.camp_id,
        name: data.name,
        items: data.items
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        allocation_type: data.allocation_type,
      };

      if (mode === "create") {
        await createMutation.mutateAsync({
          body: requestBody,
        });
      } else if (mode === "edit" && campAllocation?.id) {
        await updateMutation.mutateAsync({
          params: { path: { id: campAllocation.id } },
          body: requestBody as UpdateCampAllocationRequest,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Operation failed");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Controller
          name="camp_id"
          control={control}
          rules={{ required: "Camp is required" }}
          render={({ field }) => (
            <FormControl
              fullWidth
              disabled={isView || mode === "edit"}
              error={!!errors.camp_id}
            >
              <InputLabel>Camp</InputLabel>
              <Select {...field} label="Camp">
                <MenuItem value="">
                  <em>Select a camp</em>
                </MenuItem>
                {camps.map((camp) => (
                  <MenuItem key={camp.id} value={camp.id}>
                    {camp.title} ({camp.year})
                  </MenuItem>
                ))}
              </Select>
              {errors.camp_id && (
                <FormHelperText>{errors.camp_id.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="name"
          control={control}
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Allocation Name"
              fullWidth
              disabled={isView}
              error={!!errors.name}
              helperText={errors.name?.message}
              placeholder="e.g., Group A, Team 1, etc."
            />
          )}
        />

        <Controller
          name="allocation_type"
          control={control}
          rules={{ required: "Allocation type is required" }}
          render={({ field }) => (
            <FormControl fullWidth disabled={isView} error={!!errors.allocation_type}>
              <InputLabel>Allocation Type</InputLabel>
              <Select {...field} label="Allocation Type">
                <MenuItem value="random">Random</MenuItem>
                <MenuItem value="definite">Definite</MenuItem>
              </Select>
              {errors.allocation_type && (
                <FormHelperText>{errors.allocation_type.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="items"
          control={control}
          rules={{
            required: "Items are required",
            validate: (value) => {
              const items = value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
              if (items.length === 0) {
                return "At least one item is required";
              }
              return true;
            },
          }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.items} disabled={isView}>
              <FormLabel>Items</FormLabel>
              <TextareaAutosize
                {...field}
                minRows={4}
                maxRows={8}
                placeholder="Item 1, Item 2, Item 3"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  border: errors.items ? "1px solid #d32f2f" : "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                  backgroundColor: isView ? "#f8fafc" : "white",
                  resize: "vertical",
                }}
              />
              <FormHelperText>
                {errors.items?.message ||
                  "Enter items separated by commas (e.g., Item 1, Item 2, Item 3)"}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} variant="outlined" disabled={isLoading}>
            {isView ? "Close" : "Cancel"}
          </Button>
          {!isView && (
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {mode === "create" ? "Create" : "Update"}
            </Button>
          )}
        </Stack>
      </Stack>
    </form>
  );
}
