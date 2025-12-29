"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export default function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isLoginPage = pathname === "/admin" || pathname === "/admin/signup";

    if (!token && !isLoginPage) {
      // No token and not on login/signup page - redirect to login
      router.push("/admin");
    } else if (token && pathname === "/admin") {
      // Has token and on login page - redirect to dashboard
      router.push("/admin/dashboard");
    }
    
    // Always stop checking after initial check
    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
