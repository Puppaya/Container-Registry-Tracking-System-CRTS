import { resolveHubFrameAncestors } from '../utils/hub-frame-ancestors'

export default defineEventHandler(() => ({
  frame_ancestors: resolveHubFrameAncestors(),
  hub_public_url: process.env.HUB_PUBLIC_URL || null,
  hub_module_id: process.env.HUB_MODULE_ID || 'crts',
  hub_secret_configured: Boolean(process.env.HUB_INTEGRATION_SECRET?.trim()),
  identity_jwt_configured: Boolean(process.env.ONEX_IDENTITY_JWT_KEY?.trim())
}))
