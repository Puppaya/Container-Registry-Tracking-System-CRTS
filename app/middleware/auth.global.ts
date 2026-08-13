import { shouldRedirectLoggedInFromPublicPath, isPublicPath } from '~/utils/auth-routing'

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value && !isPublicPath(to.path)) {
    return navigateTo('/login')
  }

  if (loggedIn.value && shouldRedirectLoggedInFromPublicPath(to.path)) {
    return navigateTo('/dashboard')
  }

  if (loggedIn.value && to.meta.roles) {
    const allowedRoles = to.meta.roles as string[]
    const userRole = (user.value as { role?: string } | null)?.role || ''
    if (!allowedRoles.includes(userRole)) {
      return navigateTo('/dashboard')
    }
  }
})
