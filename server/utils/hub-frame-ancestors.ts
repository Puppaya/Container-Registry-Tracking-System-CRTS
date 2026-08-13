const DEFAULT_HUB_FRAME_ANCESTORS = [
  "'self'",
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://10.0.99.108:3000',
  'http://192.168.100.233:3000',
  'http://laoxone.sdplao.com:5500',
  'https://laoxone.sdplao.com:5500',
  'https://presoak-petal-bruising.ngrok-free.dev',
  'https://*.ngrok-free.dev',
  'https://*.ngrok-free.app'
]

export function resolveHubFrameAncestors(envValue = process.env.NUXT_PUBLIC_HUB_FRAME_ANCESTORS): string {
  const raw = envValue?.trim()
  if (raw) return raw
  return DEFAULT_HUB_FRAME_ANCESTORS.join(' ')
}

export function buildHubEmbedCsp(frameAncestors = resolveHubFrameAncestors()): string {
  return `default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data: blob:; font-src 'self' https: data:; frame-ancestors ${frameAncestors};`
}
