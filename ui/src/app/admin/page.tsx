"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";

import ForgotPassword from "@/components/auth/ForgotPassword";
import AppTheme from "@/components/theme/AppTheme";
import ColorModeSelect from "@/components/theme/ColorModeSelect";
import { SitemarkIcon } from "@/components/auth/CustomIcons";
import { useApi } from "@/lib/api/useApi";
import { useRouter } from 'next/navigation'

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "100dvh",
  padding: theme.spacing(2),
}));

type FormValues = {
  email: string;
  password: string;
};

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const { $api } = useApi();
  const router = useRouter(); 

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = $api.useMutation("post", "/api/v1/auth/login", {
    onError(error: any) {
      setError("root", {
        type: "server",
        message: error?.message ?? "Login failed",
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await loginMutation.mutateAsync({
        body: values,
      });

      localStorage.setItem("token", result.token);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError("root", {
        type: "server",
        message: (err as Error)?.message ?? "Login failed",
      })
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <SignInContainer direction="column">
        <ColorModeSelect sx={{ position: "fixed", top: 16, right: 16 }} />

        <Card variant="outlined">
          <SitemarkIcon />

          <Typography component="h1" variant="h4">
            Sign in
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {errors.root && (
              <Typography color="error" align="center">
                {errors.root.message}
              </Typography>
            )}

            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email",
                  },
                })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <TextField
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                })}
              />
            </FormControl>

            <FormControlLabel control={<Checkbox />} label="Remember me" />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <Link
              component="button"
              type="button"
              onClick={() => setOpen(true)}
              align="center"
            >
              Forgot your password?
            </Link>
          </Box>

          <Divider>or</Divider>

          <Typography align="center">
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </Typography>

          <ForgotPassword open={open} handleClose={() => setOpen(false)} />
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
