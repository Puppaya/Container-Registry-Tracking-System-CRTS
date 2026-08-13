export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)
  
  // Public API routes that don't require authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/hub-exchange',
    '/api/health'
  ]

  const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/api/public/')

  const isIntegrationRoute = path.startsWith('/api/integrations/')

  // Only protect /api routes
  if (path.startsWith('/api/') && !isPublicRoute && !isIntegrationRoute) {
    const session = await getUserSession(event)
    
    if (!session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Session expired or not found'
      })
    }
    
    // Optional: Role-based path protection example
    if (path.startsWith('/api/admin/') && (session.user as { role?: string })?.role !== 'Administrator') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Admin access required'
      })
    }
  }
})
