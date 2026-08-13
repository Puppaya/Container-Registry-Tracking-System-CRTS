import { randomBytes } from 'node:crypto'
import { hashPassword } from '../utils/crypto'
import { mapHubPermissionsToRole } from '../utils/hub-role-map'
import { redeemHubLaunchCode } from '../utils/hub-redeem'
import { verifyOnexIdentityToken } from '../utils/onex-identity-jwt'
import { userRepository } from '../utils/repositories'
import type { Role } from '../utils/roles'

export class HubAuthService {
  async exchangeLaunchCode(launchCode: string) {
    const config = useRuntimeConfig()

    const redeem = await redeemHubLaunchCode({
      hubPublicUrl: config.hubPublicUrl,
      integrationSecret: config.hubIntegrationSecret,
      moduleId: config.hubModuleId,
      launchCode: launchCode.trim()
    })

    const claims = await verifyOnexIdentityToken(redeem.access_token, {
      jwtKey: config.onexIdentityJwtKey,
      issuer: config.onexIdentityIssuer,
      audience: config.onexIdentityAudience
    })

    const redeemEmail = redeem.user!.email.trim().toLowerCase()
    if (claims.email !== redeemEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Hub redeem email does not match Identity token'
      })
    }

    const role = mapHubPermissionsToRole(
      redeem.user?.permissions,
      config.hubDefaultProvisionRole
    )

    const user = await this.findOrProvisionUser(redeemEmail, role)
    return user
  }

  private async findOrProvisionUser(email: string, role: Role) {
    const existing = await userRepository.findByEmail(email)
    if (existing) return existing

    const localPart = email.split('@')[0] || 'hubuser'
    let username = localPart.slice(0, 50)
    let suffix = 0
    while (await userRepository.findByUsername(username)) {
      suffix += 1
      username = `${localPart}${suffix}`.slice(0, 50)
    }

    const randomPassword = randomBytes(24).toString('base64url')
    return userRepository.create({
      username,
      email,
      name: localPart,
      role,
      password: await hashPassword(randomPassword)
    })
  }
}

export const hubAuthService = new HubAuthService()
