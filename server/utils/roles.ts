export const ROLES = {
  ADMINISTRATOR: 'Administrator',
  REGISTRY_OFFICER: 'RegistryOfficer',
  SURVEY_TEAM: 'SurveyTeam',
  MANAGEMENT: 'Management'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ALL_ROLES: Role[] = Object.values(ROLES)

export const ROLE_LABELS: Record<Role, string> = {
  Administrator: 'Administrator',
  RegistryOfficer: 'Registry Officer',
  SurveyTeam: 'Survey Team',
  Management: 'Management'
}

/** Roles that can register and update containers */
export const REGISTRY_WRITE_ROLES: Role[] = [
  ROLES.ADMINISTRATOR,
  ROLES.REGISTRY_OFFICER
]

/** Roles that can view container registry */
export const REGISTRY_READ_ROLES: Role[] = [
  ROLES.ADMINISTRATOR,
  ROLES.REGISTRY_OFFICER,
  ROLES.SURVEY_TEAM,
  ROLES.MANAGEMENT
]

/** Roles that can access reports and analytics exports */
export const REPORT_ROLES: Role[] = [
  ROLES.ADMINISTRATOR,
  ROLES.MANAGEMENT
]
