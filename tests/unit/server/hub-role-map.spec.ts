import { describe, expect, it } from 'vitest'
import { mapHubPermissionsToRole } from '../../../server/utils/hub-role-map'
import { ROLES } from '../../../server/utils/roles'

describe('hub-role-map', () => {
  it('should map admin permissions to Administrator', () => {
    expect(mapHubPermissionsToRole(['CRTS_ADMIN'], ROLES.SURVEY_TEAM)).toBe(ROLES.ADMINISTRATOR)
  })

  it('should map registry permissions to RegistryOfficer', () => {
    expect(mapHubPermissionsToRole(['CRTS_REGISTRY'], ROLES.SURVEY_TEAM)).toBe(ROLES.REGISTRY_OFFICER)
  })

  it('should fall back to default role when permissions are empty', () => {
    expect(mapHubPermissionsToRole([], ROLES.MANAGEMENT)).toBe(ROLES.MANAGEMENT)
    expect(mapHubPermissionsToRole(undefined, 'SurveyTeam')).toBe(ROLES.SURVEY_TEAM)
  })
})
