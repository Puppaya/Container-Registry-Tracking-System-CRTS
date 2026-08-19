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
  // Only bounce authenticated users off the staff login page.
  // Keep /public and /hub/entry reachable while logged in.
  return path === '/login' || path.startsWith('/login/')
}

export function resolveHubEntryRedirect(path?: string | null): string {
  if (!path || !path.startsWith('/')) return '/dashboard'
  return path
}
