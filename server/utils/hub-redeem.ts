export interface HubRedeemUser {
  user_id: string
  email: string
  company_id?: string | null
  permissions?: string[]
}

export interface HubRedeemData {
  access_token: string
  expires_in?: number
  user?: HubRedeemUser
  inner_path?: string | null
}

interface HubApiEnvelope<T> {
  success?: boolean
  data?: T
}

export async function redeemHubLaunchCode(input: {
  hubPublicUrl: string
  integrationSecret: string
  moduleId: string
  launchCode: string
}): Promise<HubRedeemData> {
  const secret = input.integrationSecret.trim()
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Hub integration secret is not configured'
    })
  }

  const baseUrl = input.hubPublicUrl.replace(/\/$/, '')
  const headers: Record<string, string> = {
    'X-Module-Key': secret,
    'Content-Type': 'application/json'
  }
  if (baseUrl.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true'
  }

  let response: HubApiEnvelope<HubRedeemData>
  try {
    response = await $fetch<HubApiEnvelope<HubRedeemData>>(
      `${baseUrl}/api/integrations/redeem-launch`,
      {
        method: 'POST',
        headers,
        body: {
          launch_code: input.launchCode,
          module_id: input.moduleId
        }
      }
    )
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode ?? 502
    const message = (error as { statusMessage?: string })?.statusMessage ?? 'Hub redeem failed'
    throw createError({ statusCode, statusMessage: message })
  }

  const data = response?.data
  if (!data?.access_token?.trim()) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Hub redeem returned an invalid access token'
    })
  }

  const email = data.user?.email?.trim().toLowerCase()
  if (!email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Hub redeem response is missing user email'
    })
  }

  return data
}
