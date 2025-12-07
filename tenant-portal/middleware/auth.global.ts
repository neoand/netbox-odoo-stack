/**
 * Global Authentication Middleware
 * Protects routes that require authentication
 */

export default defineNuxtRouteMiddleware((to) => {
  const { isAuth } = useAuth()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuth.value) {
    return navigateTo('/auth/login')
  }

  // Check role requirements
  if (to.meta.roles && to.meta.roles.length > 0) {
    const { hasRole } = useAuth()
    const hasRequiredRole = to.meta.roles.some((role: string) => hasRole(role))

    if (!hasRequiredRole) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Insufficient permissions',
      })
    }
  }
})
