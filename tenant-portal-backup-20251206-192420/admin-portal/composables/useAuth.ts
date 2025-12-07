/**
 * Authentication Composables for Neo Stack
 * Reactive authentication using Composition API
 */

import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { isTokenExpired } from '~/utils/helpers'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  user: any
  tenant: any
  token: string
}

/**
 * Use authentication composable
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  const { user, tenant, token, isAuthenticated, loading } = storeToRefs(authStore)

  /**
   * Login with email and password
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      await authStore.login(credentials.email, credentials.password)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    await authStore.logout()
  }

  /**
   * Fetch current user
   */
  const fetchUser = async (): Promise<void> => {
    await authStore.fetchUser()
  }

  /**
   * Initialize authentication (check for existing token)
   */
  const initAuth = async (): Promise<void> => {
    await authStore.initAuth()
  }

  /**
   * Check if user is authenticated
   */
  const isAuth = computed(() => isAuthenticated.value)

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string): boolean => {
    return user.value?.role === role
  }

  /**
   * Check if user is admin
   */
  const isAdmin = computed(() => hasRole('admin'))

  /**
   * Check if user is tenant user
   */
  const isTenantUser = computed(() => hasRole('user'))

  /**
   * Get current user
   */
  const currentUser = computed(() => user.value)

  /**
   * Get current tenant
   */
  const currentTenant = computed(() => tenant.value)

  /**
   * Check if token is valid (not expired)
   */
  const isTokenValid = (): boolean => {
    if (!token.value) return false
    return !isTokenExpired(token.value)
  }

  /**
   * Refresh token (if needed)
   */
  const refreshToken = async (): Promise<boolean> => {
    if (!isTokenValid()) {
      await logout()
      return false
    }
    return true
  }

  return {
    // State
    user,
    tenant,
    token,
    isAuthenticated,
    loading,

    // Methods
    login,
    logout,
    fetchUser,
    initAuth,
    refreshToken,

    // Computed
    isAuth,
    isAdmin,
    isTenantUser,
    currentUser,
    currentTenant,

    // Utilities
    hasRole,
    isTokenValid,
  }
}

/**
 * Shorthand composables for common auth operations
 */

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { isAuth } = useAuth()
  return isAuth
}

/**
 * Get current user
 */
export const useCurrentUser = () => {
  const { currentUser } = useAuth()
  return currentUser
}

/**
 * Login composable
 */
export const useLogin = () => {
  const { login } = useAuth()
  const error = ref<string | null>(null)
  const loading = ref<boolean>(false)

  const execute = async (credentials: LoginCredentials): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const success = await login(credentials)
      return success
    } catch (err) {
      error.value = (err as Error).message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    execute,
    error,
    loading,
  }
}

/**
 * Logout composable
 */
export const useLogout = () => {
  const { logout } = useAuth()
  const loading = ref<boolean>(false)

  const execute = async (): Promise<void> => {
    loading.value = true
    try {
      await logout()
    } finally {
      loading.value = false
    }
  }

  return {
    execute,
    loading,
  }
}

/**
 * Auth guard composable for route protection
 */
export const useAuthGuard = (requiredRole?: string) => {
  const { isAuth, hasRole } = useAuth()
  const router = useRouter()
  const route = useRoute()

  const check = (): boolean => {
    if (!isAuth.value) {
      router.push('/auth/login')
      return false
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/403')
      return false
    }

    return true
  }

  return {
    check,
  }
}

/**
 * Middleware for authentication
 */
export const useAuthMiddleware = () => {
  const { initAuth, isAuth } = useAuth()
  const router = useRouter()
  const route = useRoute()

  const middleware = async (to: any, from: any) => {
    // Initialize auth if not already done
    if (!isAuth.value) {
      await initAuth()
    }

    // Check if authentication is required
    if (to.meta.requiresAuth && !isAuth.value) {
      return navigateTo('/auth/login')
    }

    // Check role requirements
    if (to.meta.roles && to.meta.roles.length > 0) {
      const { hasRole } = useAuth()
      const hasRequiredRole = to.meta.roles.some((role: string) => hasRole(role))

      if (!hasRequiredRole) {
        return navigateTo('/403')
      }
    }
  }

  return {
    middleware,
  }
}

/**
 * Password reset composable
 */
export const usePasswordReset = () => {
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const success = ref<boolean>(false)

  const requestReset = async (email: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    success.value = false

    try {
      // Implementation would depend on your backend API
      await $fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      })

      success.value = true
      return true
    } catch (err) {
      error.value = (err as Error).message || 'Failed to request password reset'
      return false
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (
    token: string,
    password: string,
    passwordConfirm: string
  ): Promise<boolean> => {
    loading.value = true
    error.value = null
    success.value = false

    try {
      await $fetch('/api/auth/reset-password', {
        method: 'POST',
        body: {
          token,
          password,
          password_confirmation: passwordConfirm,
        },
      })

      success.value = true
      return true
    } catch (err) {
      error.value = (err as Error).message || 'Failed to reset password'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    success,
    requestReset,
    resetPassword,
  }
}

/**
 * Two-factor authentication composable
 */
export const useTwoFactor = () => {
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const enable = async (method: 'sms' | 'email' | 'totp'): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      // Implementation would depend on your backend API
      await $fetch('/api/auth/2fa/enable', {
        method: 'POST',
        body: { method },
      })
      return true
    } catch (err) {
      error.value = (err as Error).message || 'Failed to enable 2FA'
      return false
    } finally {
      loading.value = false
    }
  }

  const verify = async (code: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await $fetch('/api/auth/2fa/verify', {
        method: 'POST',
        body: { code },
      })
      return true
    } catch (err) {
      error.value = (err as Error).message || 'Invalid verification code'
      return false
    } finally {
      loading.value = false
    }
  }

  const disable = async (password: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await $fetch('/api/auth/2fa/disable', {
        method: 'POST',
        body: { password },
      })
      return true
    } catch (err) {
      error.value = (err as Error).message || 'Failed to disable 2FA'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    enable,
    verify,
    disable,
  }
}
