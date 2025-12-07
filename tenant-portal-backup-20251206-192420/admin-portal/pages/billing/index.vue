<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Billing Management</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage subscriptions, plans, invoices, and billing settings
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              ${{ billingStore.stats?.monthlyRevenue?.toLocaleString() || '0' }}
            </p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </UCard>

      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Subscriptions</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ billingStore.stats?.activeSubscriptions || 0 }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </UCard>

      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Invoices</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ billingStore.stats?.totalInvoices || 0 }}
            </p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <UIcon name="i-heroicons-receipt-percent" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </UCard>

      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Invoices</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ billingStore.stats?.pendingInvoices || 0 }}
            </p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <UIcon name="i-heroicons-clock" class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Tabs -->
    <UCard>
      <UTabs v-model="activeTab" :items="tabs">
        <!-- Plans Tab -->
        <template #plans>
          <div class="mt-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Subscription Plans</h3>
              <UButton
                color="primary"
                icon="i-heroicons-plus"
                @click="showCreatePlanModal = true"
              >
                Create Plan
              </UButton>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <UCard
                v-for="plan in billingStore.activePlans"
                :key="plan.plan_id"
                class="relative"
              >
                <div v-if="plan.plan_id === 'enterprise'" class="absolute -top-3 -right-3">
                  <UBadge color="purple" label="Popular" />
                </div>

                <div class="text-center">
                  <h4 class="text-xl font-bold text-gray-900">{{ plan.name }}</h4>
                  <p class="text-sm text-gray-500 mt-2">{{ plan.description }}</p>
                  <div class="mt-4">
                    <span class="text-4xl font-bold text-gray-900">
                      ${{ plan.price_monthly }}
                    </span>
                    <span class="text-sm text-gray-500">/month</span>
                  </div>
                </div>

                <div class="mt-6 space-y-3">
                  <div
                    v-for="feature in plan.features"
                    :key="feature"
                    class="flex items-center text-sm"
                  >
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="w-5 h-5 text-green-500 mr-2"
                    />
                    {{ feature }}
                  </div>
                </div>

                <div class="mt-6 space-y-2">
                  <UButton
                    color="gray"
                    variant="outline"
                    block
                    @click="editPlan(plan)"
                  >
                    Edit
                  </UButton>
                  <UButton
                    color="red"
                    variant="ghost"
                    block
                    @click="deletePlan(plan.plan_id)"
                  >
                    Delete
                  </UButton>
                </div>
              </UCard>
            </div>
          </div>
        </template>

        <!-- Subscriptions Tab -->
        <template #subscriptions>
          <div class="mt-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Active Subscriptions</h3>
              <UButton
                color="gray"
                variant="outline"
                icon="i-heroicons-arrow-path"
                @click="refreshSubscriptions"
              >
                Refresh
              </UButton>
            </div>

            <UTable
              :rows="billingStore.activeSubscriptions"
              :columns="subscriptionColumns"
              :loading="billingStore.loading"
            >
              <template #subscription_id-data="{ row }">
                <div class="font-mono text-xs">{{ row.subscription_id }}</div>
              </template>

              <template #tenant_id-data="{ row }">
                <div class="text-sm">{{ row.tenant_id }}</div>
              </template>

              <template #plan_id-data="{ row }">
                <UBadge
                  :label="row.plan_id"
                  color="blue"
                  variant="subtle"
                />
              </template>

              <template #status-data="{ row }">
                <UBadge
                  :label="row.status"
                  :color="getSubscriptionStatusColor(row.status)"
                  variant="subtle"
                />
              </template>

              <template #current_period_end-data="{ row }">
                <div class="text-sm text-gray-500">
                  {{ formatDate(row.current_period_end) }}
                </div>
              </template>

              <template #actions-data="{ row }">
                <div class="flex space-x-2">
                  <UButton
                    color="gray"
                    variant="ghost"
                    size="sm"
                    @click="viewSubscription(row.subscription_id)"
                  >
                    View
                  </UButton>
                  <UButton
                    color="red"
                    variant="ghost"
                    size="sm"
                    @click="cancelSubscription(row.subscription_id)"
                  >
                    Cancel
                  </UButton>
                </div>
              </template>
            </UTable>
          </div>
        </template>

        <!-- Invoices Tab -->
        <template #invoices>
          <div class="mt-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Invoices</h3>
              <div class="flex space-x-2">
                <UButton
                  color="gray"
                  variant="outline"
                  icon="i-heroicons-arrow-down-tray"
                  @click="exportInvoices('csv')"
                >
                  Export CSV
                </UButton>
                <UButton
                  color="gray"
                  variant="outline"
                  icon="i-heroicons-plus"
                  @click="showGenerateInvoiceModal = true"
                >
                  Generate Invoice
                </UButton>
              </div>
            </div>

            <UTable
              :rows="billingStore.invoices"
              :columns="invoiceColumns"
              :loading="billingStore.loading"
            >
              <template #invoice_number-data="{ row }">
                <div class="font-mono text-sm">{{ row.invoice_number }}</div>
              </template>

              <template #tenant_id-data="{ row }">
                <div class="text-sm">{{ row.tenant_id }}</div>
              </template>

              <template #total-data="{ row }">
                <div class="font-medium">${{ row.total.toFixed(2) }}</div>
              </template>

              <template #status-data="{ row }">
                <UBadge
                  :label="row.status"
                  :color="getInvoiceStatusColor(row.status)"
                  variant="subtle"
                />
              </template>

              <template #invoice_date-data="{ row }">
                <div class="text-sm text-gray-500">
                  {{ formatDate(row.invoice_date) }}
                </div>
              </template>

              <template #actions-data="{ row }">
                <div class="flex space-x-2">
                  <UButton
                    v-if="row.pdf_url"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    icon="i-heroicons-document-arrow-down"
                    @click="downloadInvoice(row.pdf_url)"
                  >
                    PDF
                  </UButton>
                  <UButton
                    color="gray"
                    variant="ghost"
                    size="sm"
                    @click="viewInvoice(row.invoice_id)"
                  >
                    View
                  </UButton>
                </div>
              </template>
            </UTable>
          </div>
        </template>
      </UTabs>
    </UCard>

    <!-- Create Plan Modal -->
    <UModal v-model="showCreatePlanModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create New Plan</h3>
        </template>

        <UForm
          :schema="planSchema"
          :state="planForm"
          @submit="handleCreatePlan"
        >
          <div class="space-y-4">
            <UFormGroup label="Plan ID" name="plan_id" required>
              <UInput v-model="planForm.plan_id" placeholder="e.g., starter" />
            </UFormGroup>

            <UFormGroup label="Name" name="name" required>
              <UInput v-model="planForm.name" />
            </UFormGroup>

            <UFormGroup label="Description" name="description">
              <UTextarea v-model="planForm.description" />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Monthly Price" name="price_monthly" required>
                <UInput
                  v-model.number="planForm.price_monthly"
                  type="number"
                  step="0.01"
                />
              </UFormGroup>

              <UFormGroup label="Yearly Price" name="price_yearly">
                <UInput
                  v-model.number="planForm.price_yearly"
                  type="number"
                  step="0.01"
                />
              </UFormGroup>
            </div>

            <UFormGroup label="Features (one per line)" name="features">
              <UTextarea
                v-model="planForm.features"
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </UFormGroup>

            <UFormGroup label="Active" name="is_active">
              <UCheckbox v-model="planForm.is_active" />
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <UButton
                color="gray"
                variant="ghost"
                @click="showCreatePlanModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="billingStore.loading"
              >
                Create Plan
              </UButton>
            </div>
          </template>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useBillingStore } from '~/stores/billing'
import { useTenantStore } from '~/stores/tenants'
import { format } from 'date-fns'
import { z } from 'zod'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const billingStore = useBillingStore()
const tenantStore = useTenantStore()
const toast = useToast()

const activeTab = ref(0)
const showCreatePlanModal = ref(false)
const showGenerateInvoiceModal = ref(false)

const tabs = [
  { key: 'plans', label: 'Plans', icon: 'i-heroicons-squares-2x2' },
  { key: 'subscriptions', label: 'Subscriptions', icon: 'i-heroicons-document-text' },
  { key: 'invoices', label: 'Invoices', icon: 'i-heroicons-receipt-percent' },
]

const subscriptionColumns = [
  { key: 'subscription_id', label: 'ID' },
  { key: 'tenant_id', label: 'Tenant' },
  { key: 'plan_id', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'current_period_end', label: 'Renews' },
  { key: 'actions', label: 'Actions' },
]

const invoiceColumns = [
  { key: 'invoice_number', label: 'Invoice #' },
  { key: 'tenant_id', label: 'Tenant' },
  { key: 'total', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'invoice_date', label: 'Date' },
  { key: 'actions', label: 'Actions' },
]

const planSchema = z.object({
  plan_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price_monthly: z.number().min(0),
  price_yearly: z.number().optional(),
  features: z.string().optional(),
  is_active: z.boolean(),
})

const planForm = reactive({
  plan_id: '',
  name: '',
  description: '',
  price_monthly: 0,
  price_yearly: 0,
  features: '',
  is_active: true,
})

const getSubscriptionStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'green',
    trialing: 'blue',
    cancelled: 'red',
    past_due: 'yellow',
  }
  return colors[status] || 'gray'
}

const getInvoiceStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    paid: 'green',
    open: 'yellow',
    void: 'gray',
    uncollectible: 'red',
  }
  return colors[status] || 'gray'
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const handleCreatePlan = async () => {
  try {
    const featuresArray = planForm.features
      ? planForm.features.split('\n').filter(f => f.trim())
      : []

    await billingStore.createPlan({
      ...planForm,
      features: featuresArray,
    })

    toast.add({
      title: 'Success',
      description: 'Plan created successfully',
      color: 'green',
    })

    showCreatePlanModal.value = false
    resetPlanForm()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to create plan',
      color: 'red',
    })
  }
}

const editPlan = (plan: any) => {
  // Navigate to plan edit page
  navigateTo(`/plans/${plan.plan_id}/edit`)
}

const deletePlan = async (planId: string) => {
  if (!confirm('Are you sure you want to delete this plan?')) return

  try {
    await billingStore.deletePlan(planId)
    toast.add({
      title: 'Success',
      description: 'Plan deleted successfully',
      color: 'green',
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete plan',
      color: 'red',
    })
  }
}

const viewSubscription = (id: string) => {
  navigateTo(`/subscriptions/${id}`)
}

const cancelSubscription = async (id: string) => {
  if (!confirm('Are you sure you want to cancel this subscription?')) return

  try {
    await billingStore.cancelSubscription(id)
    toast.add({
      title: 'Success',
      description: 'Subscription cancelled successfully',
      color: 'green',
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to cancel subscription',
      color: 'red',
    })
  }
}

const refreshSubscriptions = () => {
  billingStore.fetchSubscriptions()
}

const viewInvoice = (id: string) => {
  navigateTo(`/invoices/${id}`)
}

const downloadInvoice = (url: string) => {
  window.open(url, '_blank')
}

const exportInvoices = async (format: string) => {
  try {
    await billingStore.exportInvoices(format as 'csv' | 'pdf')
    toast.add({
      title: 'Success',
      description: 'Invoices exported successfully',
      color: 'green',
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to export invoices',
      color: 'red',
    })
  }
}

const resetPlanForm = () => {
  planForm.plan_id = ''
  planForm.name = ''
  planForm.description = ''
  planForm.price_monthly = 0
  planForm.price_yearly = 0
  planForm.features = ''
  planForm.is_active = true
}

onMounted(async () => {
  await Promise.all([
    billingStore.fetchStats(),
    billingStore.fetchPlans(),
    billingStore.fetchSubscriptions(),
    billingStore.fetchInvoices(),
    tenantStore.fetchTenants(),
  ])
})
</script>
