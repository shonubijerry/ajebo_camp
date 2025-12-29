"use client";

import React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
  IconButton,
  Typography,
  Box,
  Paper,
  FormHelperText,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useApi } from "@/lib/api/useApi";
import { CreateCampRequest } from "@/interfaces";

interface CampAllocation {
  id?: string;
  name: string;
  items: string;
  allocation_type: "random" | "definite";
}

interface CampFormData extends Omit<CreateCampRequest, "allocations"> {
  allocations: CampAllocation[];
}

interface CampFormProps {
  camp?: CreateCampRequest & { id?: string };
  mode: "create" | "edit" | "view";
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CampForm({
  camp,
  mode,
  onSuccess,
  onCancel,
}: CampFormProps) {
  const { $api } = useApi();
  const [error, setError] = React.useState<string | null>(null);
  const isView = mode === "view";

  const createCampMutation = $api.useMutation("post", "/api/v1/camps");
  const updateCampMutation = $api.useMutation("patch", "/api/v1/camps/{id}");
  const createAllocationMutation = $api.useMutation(
    "post",
    "/api/v1/camp-allocations"
  );
  const updateAllocationMutation = $api.useMutation(
    "patch",
    "/api/v1/camp-allocations/{id}"
  );

  const entitiesResult = $api.useQuery("get", "/api/v1/entities/list", {
    params: { query: { page: 1, per_page: 100 } },
  });

  const allocationsResult = $api.useQuery(
    "get",
    "/api/v1/camp-allocations/list",
    {
      params: { query: { page: 1, per_page: 100, camp_id: camp?.id } },
      queryKey: ["camp-allocations", camp?.id],
    },
    { enabled: !!camp?.id && mode === "edit" }
  );

  const entities = entitiesResult.data?.success ? entitiesResult.data.data : [];
  const existingAllocations = allocationsResult.data?.success
    ? allocationsResult.data.data
    : [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CampFormData>({
    defaultValues: {
      title: camp?.title || "",
      theme: camp?.theme || "",
      verse: camp?.verse || "",
      entity_id: camp?.entity_id || "",
      year: camp?.year || new Date().getFullYear(),
      fee: camp?.fee || 0,
      start_date: camp?.start_date || "",
      end_date: camp?.end_date || "",
      allocations: [],
    },
  });

  React.useEffect(() => {
    if (mode === "edit" && existingAllocations.length > 0) {
      reset({
        title: camp?.title || "",
        theme: camp?.theme || "",
        verse: camp?.verse || "",
        entity_id: camp?.entity_id || "",
        year: camp?.year || new Date().getFullYear(),
        fee: camp?.fee || 0,
        start_date: camp?.start_date || "",
        end_date: camp?.end_date || "",
        allocations: existingAllocations.map((a) => ({
          id: a.id,
          name: a.name || "",
          items: Array.isArray(a.items) ? a.items.join(", ") : "",
          allocation_type:
            (a.allocation_type as "random" | "definite") || "random",
        })),
      });
    }
  }, [mode, existingAllocations, camp, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allocations",
  });

  const onSubmit = async (data: CampFormData) => {
    try {
      setError(null);
      const { allocations, ...campData } = data;

      if (mode === "create") {
        const campResponse = await createCampMutation.mutateAsync({
          body: campData,
        });
        const campId = campResponse.data?.id;

        if (campId && allocations.length > 0) {
          await Promise.all(
            allocations.map((allocation) =>
              createAllocationMutation.mutateAsync({
                body: {
                  camp_id: campId,
                  name: allocation.name,
                  items: allocation.items
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                  allocation_type: allocation.allocation_type,
                },
              })
            )
          );
        }
      } else if (mode === "edit" && camp?.id) {
        await updateCampMutation.mutateAsync({
          params: { path: { id: camp.id } },
          body: campData as CreateCampRequest,
        });

        if (allocations.length > 0) {
          await Promise.all(
            allocations.map((allocation) => {
              const allocationBody = {
                camp_id: camp.id!,
                name: allocation.name,
                items: allocation.items
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                allocation_type: allocation.allocation_type,
              };

              return allocation.id
                ? updateAllocationMutation.mutateAsync({
                    params: { path: { id: allocation.id } },
                    body: allocationBody,
                  })
                : createAllocationMutation.mutateAsync({
                    body: allocationBody,
                  });
            })
          );
        }
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Operation failed");
    }
  };

  const isLoading =
    createCampMutation.isPending ||
    updateCampMutation.isPending ||
    createAllocationMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Controller
          name="title"
          control={control}
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              fullWidth
              disabled={isView}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="theme"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Theme"
              fullWidth
              disabled={isView}
              value={field.value || ""}
            />
          )}
        />

        <Controller
          name="verse"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Verse"
              fullWidth
              disabled={isView}
              multiline
              rows={2}
              value={field.value || ""}
            />
          )}
        />

        <Controller
          name="entity_id"
          control={control}
          rules={{ required: "Entity is required" }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.entity_id} disabled={isView}>
              <InputLabel>Entity</InputLabel>
              <Select {...field} label="Entity">
                {entities.map((entity) => (
                  <MenuItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.entity_id && (
                <FormHelperText>{errors.entity_id.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="year"
          control={control}
          rules={{ required: "Year is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Year"
              type="number"
              fullWidth
              disabled={isView}
              error={!!errors.year}
              helperText={errors.year?.message}
            />
          )}
        />

        <Controller
          name="fee"
          control={control}
          rules={{ required: "Fee is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Fee"
              type="number"
              fullWidth
              disabled={isView}
              error={!!errors.fee}
              helperText={errors.fee?.message}
            />
          )}
        />

        <Controller
          name="start_date"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Start Date"
              type={isView ? "text" : "date"}
              fullWidth
              disabled={isView}
              error={!!errors.start_date}
              helperText={errors.start_date?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              value={isView && field.value ? new Date(field.value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : field.value}
            />
          )}
        />

        <Controller
          name="end_date"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="End Date"
              type={isView ? "text" : "date"}
              fullWidth
              disabled={isView}
              error={!!errors.end_date}
              helperText={errors.end_date?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              value={isView && field.value ? new Date(field.value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : field.value}
            />
          )}
        />

        {!isView && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Camp Allocations
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  append({ name: "", items: "", allocation_type: "random" })
                }
                size="small"
              >
                Add Allocation
              </Button>
            </Box>

            <Stack spacing={2}>
              {fields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        Allocation {index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Controller
                      name={`allocations.${index}.name`}
                      control={control}
                      rules={{ required: "Name is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Name"
                          placeholder="e.g., Prayer Boot"
                          fullWidth
                          size="small"
                          error={!!errors.allocations?.[index]?.name}
                          helperText={
                            errors.allocations?.[index]?.name?.message
                          }
                        />
                      )}
                    />

                    <Controller
                      name={`allocations.${index}.items`}
                      control={control}
                      rules={{ required: "Items are required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Items (comma-separated)"
                          placeholder="e.g., Boot 1, Boot 2, Boot 3"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          error={!!errors.allocations?.[index]?.items}
                          helperText={
                            errors.allocations?.[index]?.items?.message
                          }
                        />
                      )}
                    />

                    <Controller
                      name={`allocations.${index}.allocation_type`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Allocation Type</InputLabel>
                          <Select {...field} label="Allocation Type">
                            <MenuItem value="random">Random</MenuItem>
                            <MenuItem value="definite">Definite</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {isView && existingAllocations.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Camp Allocations
            </Typography>
            <Stack spacing={2}>
              {existingAllocations.map((allocation, index) => (
                <Paper key={allocation.id} sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {allocation.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Items
                      </Typography>
                      <Typography variant="body2">
                        {Array.isArray(allocation.items)
                          ? allocation.items.join(", ")
                          : allocation.items}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Allocation Type
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                        {allocation.allocation_type}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {!isView && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "flex-end" }}
          >
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
