import { AppContext } from '..'
import { AuthenticatedUser } from './auth'
import {
  getPermissionsForRole,
  hasAllPermissions,
  Permission,
  Role,
} from '../lib/permissions'

export const requirePermissions = (
  c: AppContext & { user?: AuthenticatedUser },
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

  const permissions = getPermissionsForRole(c.user.role as Role)
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
