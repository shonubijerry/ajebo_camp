export const ROLES = ['user', 'staff', 'admin'] as const
export type Role = (typeof ROLES)[number]
import { z } from 'zod'

export const PermissionsSchema = z.enum([
  'dashboard:view',
  'camp:view',
  'camp:create',
  'camp:update',
  'camp:delete',
  'campite:view',
  'campite:create',
  'campite:update',
  'campite:delete',
  'camp-allocation:view',
  'camp-allocation:create',
  'camp-allocation:update',
  'camp-allocation:delete',
  'district:view',
  'district:create',
  'district:update',
  'district:delete',
  'entity:view',
  'entity:create',
  'entity:update',
  'entity:delete',
  'payment:view',
  'analytics:view',
  'user:manage',
  'settings:manage',
])

export type Permission = z.infer<typeof PermissionsSchema>

export const rolePermissions: Record<Role, Permission[]> = {
  user: ['dashboard:view', 'campite:view', 'camp:view', 'campite:create',  'campite:update', 'district:view'],
  staff: [
    'dashboard:view',
    'camp:view',
    'camp:create',
    'camp:update',
    'campite:view',
    'campite:create',
    'campite:update',
    'camp-allocation:view',
    'camp-allocation:create',
    'camp-allocation:update',
    'district:view',
    'district:create',
    'district:update',
    'entity:view',
    'entity:create',
    'entity:update',
    'payment:view',
    'analytics:view',
  ],
  admin: [
    'dashboard:view',
    'camp:view',
    'camp:create',
    'camp:update',
    'camp:delete',
    'campite:view',
    'campite:create',
    'campite:update',
    'campite:delete',
    'camp-allocation:view',
    'camp-allocation:create',
    'camp-allocation:update',
    'camp-allocation:delete',
    'district:view',
    'district:create',
    'district:update',
    'district:delete',
    'entity:view',
    'entity:create',
    'entity:update',
    'entity:delete',
    'payment:view',
    'analytics:view',
    'user:manage',
    'settings:manage',
  ],
}

export function getPermissionsForRole(role: Role): Permission[] {
  return rolePermissions[role] || []
}

export function hasAllPermissions(
  userPermissions: Permission[],
  required: Permission | Permission[],
): boolean {
  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.every((perm) => userPermissions.includes(perm))
}
