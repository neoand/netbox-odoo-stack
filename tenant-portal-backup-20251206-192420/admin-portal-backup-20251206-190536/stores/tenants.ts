import { defineStore } from 'pinia'

interface Tenant {
  tenant_id: string
  name: string
  slug: string
  email: string
  status: 'active' | 'suspended' | 'cancelled' | 'trial'
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

interface TenantState {
  tenants: Tenant[]
  currentTenant: Tenant | null
  loading: boolean
  error: string | null
}

export const useTenantStore = defineStore('tenants', {
  state: (): TenantState => ({
    tenants: [],
    currentTenant: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeTenants: (state) => state.tenants.filter(t => t.status === 'active'),
    trialTenants: (state) => state.tenants.filter(t => t.status === 'trial'),
    suspendedTenants: (state) => state.tenants.filter(t => t.status === 'suspended'),
  },

  actions: {
    async fetchTenants() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/admin/tenants')
        this.tenants = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch tenants'
        console.error('Fetch tenants error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTenant(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch(`/api/admin/tenants/${id}`)
        this.currentTenant = data
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch tenant'
        console.error('Fetch tenant error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTenant(tenantData: Partial<Tenant>) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/admin/tenants', {
          method: 'POST',
          body: tenantData,
        })
        this.tenants.push(data)
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to create tenant'
        console.error('Create tenant error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTenant(id: string, updates: Partial<Tenant>) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch(`/api/admin/tenants/${id}`, {
          method: 'PUT',
          body: updates,
        })

        const index = this.tenants.findIndex(t => t.tenant_id === id)
        if (index !== -1) {
          this.tenants[index] = data
        }

        if (this.currentTenant?.tenant_id === id) {
          this.currentTenant = data
        }

        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to update tenant'
        console.error('Update tenant error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTenant(id: string) {
      this.loading = true
      this.error = null
      try {
        await $fetch(`/api/admin/tenants/${id}`, {
          method: 'DELETE',
        })

        this.tenants = this.tenants.filter(t => t.tenant_id !== id)

        if (this.currentTenant?.tenant_id === id) {
          this.currentTenant = null
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to delete tenant'
        console.error('Delete tenant error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async suspendTenant(id: string) {
      return this.updateTenant(id, { status: 'suspended' })
    },

    async activateTenant(id: string) {
      return this.updateTenant(id, { status: 'active' })
    },

    async cancelTenant(id: string) {
      return this.updateTenant(id, { status: 'cancelled' })
    },
  },
})
