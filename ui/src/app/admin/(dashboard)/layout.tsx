"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useRouter } from "next/navigation";

export default function DashboardRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin");
  };

  return <DashboardLayout onLogout={handleLogout}>{children}</DashboardLayout>;
}
