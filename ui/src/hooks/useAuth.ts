import { useMemo } from 'react'
import { useApi } from '@/lib/api/useApi'
import { hasAllPermissions } from '@/lib/permissions'
import { Permission } from '@/interfaces'

export function useAuth() {
  const { $api } = useApi()

  const query = $api.useQuery('get', '/api/v1/users/me', {
    retry: false,
  })

  const permissions = useMemo(
    () => query.data?.data.permissions ?? [],
    [query.data],
  )

  const role = query.data?.data?.role ?? 'user'

  const hasPermission = useMemo(
    () => (required: Permission | Permission[]) =>
      hasAllPermissions(permissions, required),
    [permissions],
  )

  return {
    user: query.data,
    role,
    permissions,
    hasPermission,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
  }
}
