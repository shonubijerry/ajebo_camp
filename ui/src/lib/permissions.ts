import { Permission } from "@/interfaces"

export function hasAllPermissions(
  permissions: Permission[] = [],
  required: Permission | Permission[],
): boolean {
  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.every((perm) => permissions.includes(perm))
}
