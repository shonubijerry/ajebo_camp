"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";

import ColorModeSelect from "@/components/theme/ColorModeSelect";
import { SitemarkIcon } from "@/components/auth/CustomIcons";
import LoginForm from "@/components/auth/LoginForm";
import { useRouter } from "next/navigation";

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

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const router = useRouter();

  const handleSuccess = (token: string) => {
    router.push("/portal/dashboard");
  };

  return (
    <SignInContainer direction="column">
      <CssBaseline />
      <ColorModeSelect sx={{ position: "fixed", top: 16, right: 16 }} />

      <Card variant="outlined">
        <SitemarkIcon />
        <LoginForm onSuccess={handleSuccess} />
      </Card>
    </SignInContainer>
  );
}
