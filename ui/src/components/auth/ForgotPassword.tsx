"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useApi } from "@/lib/api/useApi";

type Step = "request" | "change";

interface RequestPayload {
  email: string;
}

interface ChangePayload {
  code: string;
  password: string;
  confirmPassword: string;
}

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const { $api } = useApi();

  const [step, setStep] = React.useState<Step>("request");
  const [banner, setBanner] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const requestForm = useForm<RequestPayload>({ defaultValues: { email: "" } });
  const changeForm = useForm<ChangePayload>({
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });

  const requestMutation = $api.useMutation("post", "/api/v1/forgot");
  const changeMutation = $api.useMutation("post", "/api/v1/forgot/change-password/{code}");

  const resetState = React.useCallback(() => {
    setStep("request");
    setBanner(null);
    setError(null);
    requestForm.reset({ email: "" });
    changeForm.reset({ code: "", password: "", confirmPassword: "" });
  }, [changeForm, requestForm]);

  React.useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const handleRequestSubmit = async (data: RequestPayload) => {
    try {
      setError(null);
      setBanner(null);
      await requestMutation.mutateAsync({ body: data });
      setStep("change");
      setBanner("A reset code has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    }
  };

  const handleChangeSubmit = async (data: ChangePayload) => {
    try {
      setError(null);
      setBanner(null);

      if (data.password !== data.confirmPassword) {
        changeForm.setError("confirmPassword", { type: "validate", message: "Passwords do not match" });
        return;
      }

      await changeMutation.mutateAsync({
        params: { path: { code: data.code } },
        body: { password: data.password },
      });

      setBanner("Password updated. You can now sign in.");
      handleClose();
      resetState();
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    }
  };

  const isLoading = step === "request" ? requestMutation.isPending : changeMutation.isPending;

  const onSubmit = step === "request"
    ? requestForm.handleSubmit(handleRequestSubmit)
    : changeForm.handleSubmit(handleChangeSubmit);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: "form",
          onSubmit,
          sx: { backgroundImage: "none" },
        },
      }}
    >
      <DialogTitle>{step === "request" ? "Reset password" : "Change password"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        <DialogContentText>
          {step === "request"
            ? "Enter your account's email address to receive a reset code."
            : "Enter the reset code sent to your email and choose a new password."}
        </DialogContentText>

        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {banner && <Alert severity="success">{banner}</Alert>}

          {step === "request" ? (
            <TextField
              label="Email address"
              type="email"
              fullWidth
              autoFocus
              disabled={isLoading}
              {...requestForm.register("email", { required: "Email is required" })}
              error={!!requestForm.formState.errors.email}
              helperText={requestForm.formState.errors.email?.message}
            />
          ) : (
            <>
              <TextField
                label="Reset code"
                fullWidth
                autoFocus
                disabled={isLoading}
                {...changeForm.register("code", { required: "Reset code is required" })}
                error={!!changeForm.formState.errors.code}
                helperText={changeForm.formState.errors.code?.message}
              />
              <TextField
                label="New password"
                type="password"
                fullWidth
                disabled={isLoading}
                {...changeForm.register("password", { required: "Password is required" })}
                error={!!changeForm.formState.errors.password}
                helperText={changeForm.formState.errors.password?.message}
              />
              <TextField
                label="Confirm password"
                type="password"
                fullWidth
                disabled={isLoading}
                {...changeForm.register("confirmPassword", { required: "Confirm your password" })}
                error={!!changeForm.formState.errors.confirmPassword}
                helperText={changeForm.formState.errors.confirmPassword?.message}
              />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={18} /> : null}
        >
          {step === "request" ? "Send reset code" : "Change password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
