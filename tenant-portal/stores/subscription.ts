import { defineStore } from 'pinia'

interface Subscription {
  subscription_id: string
  tenant_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancelled_at?: string
  created_at: string
  metadata: Record<string, any>
}

interface Plan {
  plan_id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number | null
  currency: string
  interval_type: string
  features: string[]
  limits: Record<string, any>
  is_active: boolean
}

interface UsageData {
  api_calls: { current: number; limit: number; percentage: number }
  storage_gb: { current: number; limit: number; percentage: number }
  users: { current: number; limit: number; percentage: number }
  devices: { current: number; limit: number; percentage: number }
}

interface SubscriptionState {
  currentSubscription: Subscription | null
  availablePlans: Plan[]
  usage: UsageData | null
  loading: boolean
  error: string | null
}

export const useSubscriptionStore = defineStore('subscription', {
  state: (): SubscriptionState => ({
    currentSubscription: null,
    availablePlans: [],
    usage: null,
    loading: false,
    error: null,
  }),

  getters: {
    isActive: (state) => state.currentSubscription?.status === 'active',
    isTrialing: (state) => state.currentSubscription?.status === 'trialing',
    isTrialExpiringSoon: (state) => {
      if (!state.currentSubscription?.trial_end) return false
      const trialEnd = new Date(state.currentSubscription.trial_end)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 3
    },
    daysUntilRenewal: (state) => {
      if (!state.currentSubscription?.current_period_end) return 0
      const renewalDate = new Date(state.currentSubscription.current_period_end)
      const now = new Date()
      return Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    },
    usageWarnings: (state) => {
      if (!state.usage) return []
      const warnings = []
      if (state.usage.api_calls.percentage >= 80) {
        warnings.push('API calls')
      }
      if (state.usage.storage_gb.percentage >= 80) {
        warnings.push('Storage')
      }
      if (state.usage.users.percentage >= 80) {
        warnings.push('Users')
      }
      if (state.usage.devices.percentage >= 80) {
        warnings.push('Devices')
      }
      return warnings
    },
  },

  actions: {
    async fetchCurrentSubscription() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/subscriptions/current')
        this.currentSubscription = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch subscription'
        console.error('Fetch subscription error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchAvailablePlans() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/plans')
        this.availablePlans = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch plans'
        console.error('Fetch plans error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchUsage() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/usage/summary')
        this.usage = data.usage
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch usage'
        console.error('Fetch usage error:', error)
      } finally {
        this.loading = false
      }
    },

    async changePlan(newPlanId: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/subscriptions/current', {
          method: 'PUT',
          body: { new_plan_id: newPlanId },
        })
        this.currentSubscription = data
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to change plan'
        console.error('Change plan error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async cancelSubscription(atPeriodEnd = true) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/subscriptions/current', {
          method: 'PUT',
          body: { cancel_at_period_end: atPeriodEnd },
        })
        this.currentSubscription = data
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to cancel subscription'
        console.error('Cancel subscription error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async resumeSubscription() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/subscriptions/current/resume', {
          method: 'POST',
        })
        this.currentSubscription = data
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to resume subscription'
        console.error('Resume subscription error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async recordUsage(resourceType: string, quantity: number) {
      try {
        await $fetch('/api/v1/usage', {
          method: 'POST',
          body: {
            resource_type: resourceType,
            quantity,
            unit: 'requests',
            period_start: new Date().toISOString(),
            period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            source: 'api',
          },
        })
        // Refresh usage data
        await this.fetchUsage()
      } catch (error: any) {
        console.error('Record usage error:', error)
      }
    },
  },
})
