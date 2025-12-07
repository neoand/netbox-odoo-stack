import { defineStore } from 'pinia'

interface Invoice {
  invoice_id: string
  invoice_number: string
  status: string
  currency: string
  subtotal: number
  tax: number
  total: number
  amount_paid: number
  amount_due: number
  due_date: string | null
  paid_at: string | null
  invoice_date: string
  pdf_url: string | null
  created_at: string
}

interface PaymentMethod {
  method_id: string
  type: string
  last_four: string | null
  brand: string | null
  exp_month: number | null
  exp_year: number | null
  is_default: boolean
  is_verified: boolean
  created_at: string
}

interface BillingStats {
  monthlySpend: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
}

interface BillingState {
  invoices: Invoice[]
  paymentMethods: PaymentMethod[]
  stats: BillingStats | null
  loading: boolean
  error: string | null
}

export const useBillingStore = defineStore('billing', {
  state: (): BillingState => ({
    invoices: [],
    paymentMethods: [],
    stats: null,
    loading: false,
    error: null,
  }),

  getters: {
    unpaidInvoices: (state) => state.invoices.filter(i => i.status === 'open'),
    paidInvoices: (state) => state.invoices.filter(i => i.status === 'paid'),
    overdueInvoices: (state) => {
      const now = new Date()
      return state.invoices.filter(i => i.status === 'open' && i.due_date && new Date(i.due_date) < now)
    },
    totalAmountDue: (state) => {
      return state.invoices
        .filter(i => i.status === 'open')
        .reduce((sum, i) => sum + i.amount_due, 0)
    },
    defaultPaymentMethod: (state) => {
      return state.paymentMethods.find(pm => pm.is_default) || null
    },
  },

  actions: {
    async fetchStats() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/billing/stats')
        this.stats = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch billing stats'
        console.error('Fetch stats error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchInvoices(limit = 20) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch(`/api/v1/invoices?limit=${limit}`)
        this.invoices = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch invoices'
        console.error('Fetch invoices error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchInvoice(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch(`/api/v1/invoices/${id}`)
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch invoice'
        console.error('Fetch invoice error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPaymentMethods() {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/payment-methods')
        this.paymentMethods = data
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch payment methods'
        console.error('Fetch payment methods error:', error)
      } finally {
        this.loading = false
      }
    },

    async addPaymentMethod(paymentMethodData: {
      type: string
      token: string
    }) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch('/api/v1/payment-methods', {
          method: 'POST',
          body: paymentMethodData,
        })
        this.paymentMethods.push(data)
        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to add payment method'
        console.error('Add payment method error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deletePaymentMethod(id: string) {
      this.loading = true
      this.error = null
      try {
        await $fetch(`/api/v1/payment-methods/${id}`, {
          method: 'DELETE',
        })
        this.paymentMethods = this.paymentMethods.filter(pm => pm.method_id !== id)
      } catch (error: any) {
        this.error = error.message || 'Failed to delete payment method'
        console.error('Delete payment method error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async setDefaultPaymentMethod(id: string) {
      this.loading = true
      this.error = null
      try {
        await $fetch(`/api/v1/payment-methods/${id}/set-default`, {
          method: 'POST',
        })

        // Update local state
        this.paymentMethods = this.paymentMethods.map(pm => ({
          ...pm,
          is_default: pm.method_id === id
        }))
      } catch (error: any) {
        this.error = error.message || 'Failed to set default payment method'
        console.error('Set default payment method error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async downloadInvoicePDF(id: string) {
      try {
        const invoice = await this.fetchInvoice(id)
        if (invoice.pdf_url) {
          window.open(invoice.pdf_url, '_blank')
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to download invoice'
        console.error('Download invoice error:', error)
        throw error
      }
    },

    async exportInvoices(format: 'csv' | 'pdf' = 'csv') {
      try {
        const response = await $fetch(`/api/v1/invoices/export?format=${format}`, {
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

    async payInvoice(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await $fetch(`/api/v1/invoices/${id}/pay`, {
          method: 'POST',
        })

        // Update invoice in local state
        const index = this.invoices.findIndex(inv => inv.invoice_id === id)
        if (index !== -1) {
          this.invoices[index] = data
        }

        return data
      } catch (error: any) {
        this.error = error.message || 'Failed to pay invoice'
        console.error('Pay invoice error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
