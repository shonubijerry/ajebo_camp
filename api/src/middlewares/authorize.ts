import {
  getPermissionsForRole,
  hasAllPermissions,
  Permission,
} from '../lib/permissions'
import { AppContext } from '../types'

export const requirePermissions = (
  c: AppContext,
  required?: Permission | Permission[],
) => {
  if (!required) {
    return
  }

  if (!c.user) {
    return c.json(
      { success: false, errors: [{ code: 4010, message: 'Unauthorized' }] },
      401,
    )
  }

  const permissions = getPermissionsForRole(c.user.role)
  if (!hasAllPermissions(permissions, required)) {
    return c.json(
      {
        success: false,
        errors: [
          { code: 4030, message: 'Forbidden: insufficient permissions' },
        ],
      },
      403,
    )
  }
}
