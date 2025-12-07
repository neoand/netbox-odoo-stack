export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Allow access to login page
  if (to.path === '/auth/login') {
    return
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  // Check if user has tenant access
  if (!authStore.user?.tenant_id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Tenant access required.',
    })
  }
})
