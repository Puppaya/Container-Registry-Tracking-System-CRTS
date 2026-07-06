import type { H3Event } from 'h3'
import {
  ALL_ROLES,
  REGISTRY_READ_ROLES,
  REGISTRY_WRITE_ROLES,
  REPORT_ROLES,
  ROLES,
  type Role
} from './roles'

/** * checkRole: Middleware to verify user role in API handlers
 */
export const checkRole = async (event: H3Event, allowedRoles: Role[]) => {
  const { user } = await getUserSession(event)

  if (!user) {
    return sendApiError('Unauthorized', 401)
  }

  const userRole = (user as { role?: string }).role as Role

  if (!userRole || !allowedRoles.includes(userRole)) {
    return sendApiError('Forbidden: You do not have permission', 403)
  }

  return true
}

export const requireAdministrator = (event: H3Event) =>
  checkRole(event, [ROLES.ADMINISTRATOR])

/** @deprecated Use requireAdministrator */
export const requireAdmin = requireAdministrator

export const requireRegistryOfficer = (event: H3Event) =>
  checkRole(event, REGISTRY_WRITE_ROLES)

export const requireRegistryRead = (event: H3Event) =>
  checkRole(event, REGISTRY_READ_ROLES)

export const requireReportAccess = (event: H3Event) =>
  checkRole(event, REPORT_ROLES)

export const requireManagement = (event: H3Event) =>
  checkRole(event, [ROLES.ADMINISTRATOR, ROLES.MANAGEMENT])

export const requireAnyRole = (event: H3Event) =>
  checkRole(event, ALL_ROLES)
