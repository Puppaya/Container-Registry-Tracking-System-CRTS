import { createSecretKey } from 'node:crypto'
import { jwtVerify } from 'jose'

export interface OnexIdentityJwtConfig {
  jwtKey: string
  issuer: string
  audience: string
}

export interface OnexIdentityClaims {
  email: string
  sub?: string
}

export async function verifyOnexIdentityToken(
  accessToken: string,
  config: OnexIdentityJwtConfig
): Promise<OnexIdentityClaims> {
  if (!config.jwtKey.trim()) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Onex Identity JWT key is not configured'
    })
  }

  try {
    const key = createSecretKey(Buffer.from(config.jwtKey, 'utf8'))
    const { payload } = await jwtVerify(accessToken, key, {
      issuer: config.issuer,
      audience: config.audience,
      clockTolerance: 120
    })

    const email = String(payload.email ?? payload.sub ?? '').trim().toLowerCase()
    if (!email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Identity token is missing email claim'
      })
    }

    return {
      email,
      sub: typeof payload.sub === 'string' ? payload.sub : undefined
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Identity access token'
    })
  }
}
