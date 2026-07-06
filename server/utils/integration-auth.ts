import type { H3Event } from 'h3'

export function requireIntegrationApiKey(event: H3Event): void {
  const configuredKey = process.env.CRTS_INTEGRATION_API_KEY?.trim()

  if (!configuredKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Integration API is not configured'
    })
  }

  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null

  if (!token || token !== configuredKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid integration API key'
    })
  }
}
