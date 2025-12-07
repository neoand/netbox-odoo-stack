<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">
        Welcome to NEO_STACK Admin Portal. Here's what's happening with your platform.
      </p>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <!-- Total Revenue -->
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              ${{ billingStore.stats?.totalRevenue?.toLocaleString() || '0' }}
            </p>
            <div class="flex items-center mt-2">
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-4 h-4 text-green-500 mr-1"
              />
              <span class="text-sm font-medium text-green-500">+12.5%</span>
              <span class="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <UIcon name="i-heroicons-currency-dollar" class="w-8 h-8 text-green-600" />
          </div>
        </div>
      </UCard>

      <!-- Active Subscriptions -->
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Subscriptions</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ billingStore.stats?.activeSubscriptions || 0 }}
            </p>
            <div class="flex items-center mt-2">
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-4 h-4 text-green-500 mr-1"
              />
              <span class="text-sm font-medium text-green-500">+8.2%</span>
              <span class="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </UCard>

      <!-- Active Tenants -->
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Tenants</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ tenantStore.activeTenants.length }}
            </p>
            <div class="flex items-center mt-2">
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-4 h-4 text-green-500 mr-1"
              />
              <span class="text-sm font-medium text-green-500">+5.4%</span>
              <span class="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <UIcon name="i-heroicons-building-office" class="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </UCard>

      <!-- Monthly Revenue -->
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Monthly Revenue</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              ${{ billingStore.stats?.monthlyRevenue?.toLocaleString() || '0' }}
            </p>
            <div class="flex items-center mt-2">
              <UIcon
                name="i-heroicons-arrow-trending-up"
                class="w-4 h-4 text-green-500 mr-1"
              />
              <span class="text-sm font-medium text-green-500">+15.3%</span>
              <span class="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Revenue Chart -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <USelectMenu
              v-model="revenuePeriod"
              :options="periodOptions"
              @change="fetchRevenueData"
            />
          </div>
        </template>
        <div class="h-80">
          <LineChart
            v-if="revenueChartData"
            :data="revenueChartData"
            :options="chartOptions"
          />
        </div>
      </UCard>

      <!-- Subscriptions Chart -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900">Subscription Status</h3>
        </template>
        <div class="h-80">
          <DoughnutChart
            v-if="subscriptionChartData"
            :data="subscriptionChartData"
            :options="doughnutOptions"
          />
        </div>
      </UCard>
    </div>

    <!-- Recent activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Tenants -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900">Recent Tenants</h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="tenant in recentTenants"
            :key="tenant.tenant_id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-4">
              <UAvatar
                :alt="tenant.name"
                size="sm"
              />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ tenant.name }}</p>
                <p class="text-xs text-gray-500">{{ tenant.email }}</p>
              </div>
            </div>
            <UBadge
              :label="tenant.status"
              :color="getStatusColor(tenant.status)"
              variant="subtle"
            />
          </div>
        </div>
        <template #footer>
          <NuxtLink
            to="/tenants"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all tenants →
          </NuxtLink>
        </template>
      </UCard>

      <!-- Recent Invoices -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900">Recent Invoices</h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="invoice in recentInvoices"
            :key="invoice.invoice_id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ invoice.invoice_number }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatDate(invoice.invoice_date) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">
                ${{ invoice.total.toFixed(2) }}
              </p>
              <UBadge
                :label="invoice.status"
                :color="getInvoiceStatusColor(invoice.status)"
                variant="subtle"
              />
            </div>
          </div>
        </div>
        <template #footer>
          <NuxtLink
            to="/invoices"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all invoices →
          </NuxtLink>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenants'
import { useBillingStore } from '~/stores/billing'
import { format } from 'date-fns'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const authStore = useAuthStore()
const tenantStore = useTenantStore()
const billingStore = useBillingStore()

const revenuePeriod = ref('30d')
const periodOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' },
]

const revenueChartData = ref(null)
const subscriptionChartData = ref(null)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => '$' + value,
      },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}

const recentTenants = computed(() => {
  return tenantStore.tenants.slice(0, 5)
})

const recentInvoices = computed(() => {
  return billingStore.invoices.slice(0, 5)
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'green',
    trial: 'blue',
    suspended: 'yellow',
    cancelled: 'red',
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

const fetchRevenueData = async () => {
  // This would fetch actual revenue data from API
  // For now, using mock data
  revenueChartData.value = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }
}

const fetchSubscriptionData = async () => {
  // This would fetch actual subscription data from API
  subscriptionChartData.value = {
    labels: ['Active', 'Trialing', 'Cancelled', 'Past Due'],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
      },
    ],
  }
}

onMounted(async () => {
  await Promise.all([
    tenantStore.fetchTenants(),
    billingStore.fetchStats(),
    billingStore.fetchInvoices(5),
    fetchRevenueData(),
    fetchSubscriptionData(),
  ])
})
</script>
