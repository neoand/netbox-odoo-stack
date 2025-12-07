import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  tenant_id: string
  avatar?: string
}

interface Tenant {
  tenant_id: string
  name: string
  slug: string
  email: string
  status: string
}

interface AuthState {
  user: User | null
  tenant: Tenant | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    tenant: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    currentTenant: (state) => state.tenant,
    isAdmin: (state) => state.user?.role === 'admin',
    isTenantUser: (state) => state.user?.role === 'user',
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      try {
        const { data } = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })

        this.token = data.token
        this.user = data.user
        this.tenant = data.tenant
        this.isAuthenticated = true

        // Store token in localStorage
        if (process.client) {
          localStorage.setItem('auth_token', data.token)
        }

        return data
      } catch (error) {
        console.error('Login error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
      } catch (error) {
        console.error('Logout error:', error)
      }

      this.user = null
      this.tenant = null
      this.token = null
      this.isAuthenticated = false

      if (process.client) {
        localStorage.removeItem('auth_token')
      }

      await navigateTo('/auth/login')
    },

    async fetchUser() {
      if (!this.token) {
        return
      }

      try {
        const { data } = await $fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })

        this.user = data.user
        this.tenant = data.tenant
        this.isAuthenticated = true
      } catch (error) {
        console.error('Fetch user error:', error)
        await this.logout()
      }
    },

    async initAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        if (token) {
          this.token = token
          await this.fetchUser()
        }
      }
    },
  },
})
