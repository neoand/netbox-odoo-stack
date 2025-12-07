import { defineStore } from 'pinia'

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

interface Subscription {
  subscription_id: string
  tenant_id: string
  stripe_subscription_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  created_at: string
}

interface Invoice {
  invoice_id: string
  tenant_id: string
  invoice_number: string
  status: string
  total: number
  amount_paid: number
  amount_due: number
  invoice_date: string
  due_date: string | null
  pdf_url: string | null
}

interface BillingStats {
  totalRevenue: number
  monthlyRevenue: number
  activeSubscriptions: number
  totalInvoices: number
  pendingInvoices: number
  paidInvoices: number
  overdueInvoices: number
}

interface BillingState {
  plans: Plan[]
  subscriptions: Subscription[]
  invoices: Invoice[]
  stats: BillingStats | null
  loading: boolean
  error: string | null
}

export const useBillingStore = defineStore('billing', {
  state: (): BillingState => ({
    plans: [],
    subscriptions: [],
    invoices: [],
    stats: null,
    loading: false,
    error: null,
  }),

  getters: {
    activePlans: (state) => state.plans.filter(p => p.is_active),
    activeSubscriptions: (state) => state.subscriptions.filter(s => s.status === 'active'),
    paidInvoices: (state) => state.invoices.filter(i => i.status === 'paid'),
    pendingInvoices: (state) => state.invoices.filter(i => i.status === 'open'),
    overdueInvoices: (state) => {
      const now = new Date()
      return state.invoices.filter(i => i.status === 'open' && i.due_date && new Date(i.due_date) < now)
    },
  },

  actions: {
    async fetchStats() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/admin/billing/stats')
        this.stats = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch billing stats'
        console.error('Fetch stats error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchPlans() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/admin/billing/plans')
        this.plans = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch plans'
        console.error('Fetch plans error:', error)
      } finally {
        this.loading = false
      }
    },

    async createPlan(planData: Partial<Plan>) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/admin/billing/plans', {
          method: 'POST',
          body: planData,
        })
        this.plans.push(data)
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to create plan'
        console.error('Create plan error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePlan(id: string, updates: Partial<Plan>) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch(`/api/admin/billing/plans/${id}`, {
          method: 'PUT',
          body: updates,
        })

        const index = this.plans.findIndex(p => p.plan_id === id)
        if (index !== -1) {
          this.plans[index] = data
        }

        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to update plan'
        console.error('Update plan error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deletePlan(id: string) {
      this.loading = true
      this.error = null
      try {
        await $fetch(`/api/admin/billing/plans/${id}`, {
          method: 'DELETE',
        })
        this.plans = this.plans.filter(p => p.plan_id !== id)
      } catch (error: any) {
        this.error = error.message || 'Failed to delete plan'
        console.error('Delete plan error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSubscriptions() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/admin/billing/subscriptions')
        this.subscriptions = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch subscriptions'
        console.error('Fetch subscriptions error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchInvoices(limit = 50) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch(`/api/admin/billing/invoices?limit=${limit}`)
        this.invoices = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch invoices'
        console.error('Fetch invoices error:', error)
      } finally {
        this.loading = false
      }
    },

    async generateInvoice(tenantId: string, subscriptionId?: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/admin/billing/invoices', {
          method: 'POST',
          body: { tenant_id: tenantId, subscription_id: subscriptionId },
        })
        this.invoices.unshift(data)
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to generate invoice'
        console.error('Generate invoice error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async cancelSubscription(subscriptionId: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch(`/api/admin/billing/subscriptions/${subscriptionId}/cancel`, {
          method: 'POST',
        })

        const index = this.subscriptions.findIndex(s => s.subscription_id === subscriptionId)
        if (index !== -1) {
          this.subscriptions[index] = data
        }

        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to cancel subscription'
        console.error('Cancel subscription error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async applyCoupon(subscriptionId: string, couponCode: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/admin/billing/coupons/apply', {
          method: 'POST',
          body: { subscription_id: subscriptionId, code: couponCode },
        })
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to apply coupon'
        console.error('Apply coupon error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async exportInvoices(format: 'csv' | 'pdf' = 'csv') {
      try {
        const response = await $fetch(`/api/admin/billing/invoices/export?format=${format}`, {
          responseType: 'blob',
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `invoices.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (error: any) {
        this.error = error.message || 'Failed to export invoices'
        console.error('Export invoices error:', error)
        throw error
      }
    },
  },
})
