const PUBLIC_PATHS = ['/login', '/hub/entry', '/public'] as const

export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some(
    publicPath => path === publicPath || path.startsWith(`${publicPath}/`)
  )
}

export function isHubEntryPath(path: string): boolean {
  return path === '/hub/entry' || path.startsWith('/hub/entry/')
}

export function shouldRedirectLoggedInFromPublicPath(path: string): boolean {
  return isPublicPath(path) && !isHubEntryPath(path)
}

export function resolveHubEntryRedirect(path?: string | null): string {
  if (!path || !path.startsWith('/')) return '/dashboard'
  return path
}
