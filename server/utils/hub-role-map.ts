import type { Role } from './roles'
import { ROLES } from './roles'

const VALID_ROLES = new Set<string>(Object.values(ROLES))

export function mapHubPermissionsToRole(
  permissions: string[] | undefined,
  defaultRole: string
): Role {
  const fallback = VALID_ROLES.has(defaultRole) ? (defaultRole as Role) : ROLES.SURVEY_TEAM
  if (!permissions?.length) return fallback

  const normalized = permissions.map(p => p.trim().toUpperCase())

  if (normalized.some(p => p.includes('ADMIN') || p === 'CRTS_ADMIN')) {
    return ROLES.ADMINISTRATOR
  }
  if (normalized.some(p => p.includes('MANAGEMENT') || p === 'CRTS_MANAGEMENT')) {
    return ROLES.MANAGEMENT
  }
  if (normalized.some(p => p.includes('REGISTRY') || p === 'CRTS_REGISTRY')) {
    return ROLES.REGISTRY_OFFICER
  }

  return fallback
}
