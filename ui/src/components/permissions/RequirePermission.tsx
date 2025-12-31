import React from "react"
import { useAuth } from "@/hooks/useAuth"
import { Permission } from "@/interfaces"

interface RequirePermissionProps {
  permission: Permission | Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * 
 * @param param0 
 * @returns 
 * @description A component that conditionally renders its children based on user permissions.
 * example usage:
 * <RequirePermission permission="user:manage" fallback={<div>You do not have permission to view this content.</div>}>
 *   <AdminPanel />
 * </RequirePermission>
 */
export function RequirePermission({ permission, fallback = null, children }: RequirePermissionProps) {
  const { hasPermission, isLoading } = useAuth()

  if (isLoading) return null
  if (!hasPermission(permission)) return <>{fallback}</>

  return <>{children}</>
}
