"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useApi } from "@/lib/api/useApi";
import { District } from "@/interfaces";

interface DistrictFormData {
  name: string;
  zonesString?: string;
}

interface DistrictFormProps {
  district?: District;
  mode: "create" | "edit" | "view";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DistrictForm({ district, mode, onSuccess, onCancel }: DistrictFormProps) {
  const { $api } = useApi();
  const [error, setError] = React.useState<string | null>(null);
  const isView = mode === "view";

  const createMutation = $api.useMutation("post", "/api/v1/districts");
  const updateMutation = $api.useMutation("patch", "/api/v1/districts/{id}");

  const { control, handleSubmit, formState: { errors } } = useForm<DistrictFormData>({
    defaultValues: {
      name: district?.name || "",
      zonesString: (district?.zones ?? []).join(", ") || "",
    },
  });

  const onSubmit = async (data: DistrictFormData) => {
    try {
      setError(null);
      const { zonesString, ...districtData } = data;
      const payload = {
        ...districtData,
        zones: zonesString ? zonesString.split(",").map((zone) => zone.trim()).filter(Boolean) : undefined,
      };

      if (mode === "create") {
        await createMutation.mutateAsync({ body: payload });
      } else if (mode === "edit" && district?.id) {
        await updateMutation.mutateAsync({
          params: { path: { id: district.id } },
          body: payload,
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
          name="name"
          control={control}
          rules={{ required: "District name is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="District Name"
              fullWidth
              disabled={isView}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />

        <Controller
          name="zonesString"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Zones (comma-separated)"
              placeholder="e.g., Zone 1, Zone 2, Zone 3"
              fullWidth
              disabled={isView}
              multiline
              rows={2}
              helperText="Optional: Enter zones separated by commas"
            />
          )}
        />

        {!isView && (
          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {mode === "create" ? "Create" : "Update"}
            </Button>
          </Stack>
        )}
      </Stack>
    </form>
  );
}
