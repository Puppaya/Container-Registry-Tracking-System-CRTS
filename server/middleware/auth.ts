export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)
  
  // Public API routes that don't require authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health'
  ]

  // Only protect /api routes
  if (path.startsWith('/api/') && !publicRoutes.includes(path)) {
    const session = await getUserSession(event)
    
    if (!session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Session expired or not found'
      })
    }
    
    // Optional: Role-based path protection example
    if (path.startsWith('/api/admin/') && (session.user as any)?.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Admin access required'
      })
    }
  }
})
