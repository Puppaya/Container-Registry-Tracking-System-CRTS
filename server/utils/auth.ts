import { H3Event } from 'h3'

/**
 * Ensures the user is logged in.
 */
export const ensureAuthenticated = async (event: H3Event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Authentication required'
    })
  }
  return session
}

/**
 * Ensures the user has one of the required roles.
 * Example roles: 'ADMIN', 'USER'
 */
export const ensureRole = async (event: H3Event, allowedRoles: string[]) => {
  const session = await ensureAuthenticated(event)
  const userRole = (session.user as any)?.role
  
  if (!allowedRoles.includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Insufficient permissions'
    })
  }
  return session
}

/**
 * IDOR Protection Helper: Checks if the user owns the resource or is an admin.
 */
export const ensureResourceOwner = async (event: H3Event, resourceOwnerId: string | number) => {
  const session = await ensureAuthenticated(event)
  const user = session.user as any
  
  if (user.role === 'ADMIN') return true
  
  if (String(user.id) !== String(resourceOwnerId)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: You do not have access to this resource'
    })
  }
  return true
}
