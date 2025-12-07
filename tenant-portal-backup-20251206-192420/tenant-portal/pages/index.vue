<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">
        Welcome back, {{ authStore.currentUser?.name }}. Here's what's happening with your account.
      </p>
    </div>

    <!-- Alerts -->
    <div class="mb-6 space-y-3">
      <!-- Trial warning -->
      <UAlert
        v-if="subscriptionStore.isTrialExpiringSoon"
        icon="i-heroicons-clock"
        color="yellow"
        variant="subtle"
        title="Trial Period Ending Soon"
        description="Your trial will expire in {{ subscriptionStore.daysUntilRenewal }} days. Upgrade now to continue using the service."
      >
        <template #actions>
          <UButton
            color="yellow"
            variant="solid"
            @click="navigateTo('/subscription')"
          >
            Upgrade Now
          </UButton>
        </template>
      </UAlert>

      <!-- Usage warnings -->
      <UAlert
        v-for="warning in subscriptionStore.usageWarnings"
        :key="warning"
        icon="i-heroicons-exclamation-triangle"
        color="orange"
        variant="subtle"
        :title="`${warning} Usage High`"
        description="You're approaching your {{ warning }} limit. Consider upgrading your plan."
      >
        <template #actions>
          <UButton
            color="orange"
            variant="outline"
            @click="navigateTo('/subscription')"
          >
            View Plans
          </UButton>
        </template>
      </UAlert>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <!-- Subscription Status -->
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Plan</p>
            <p class="text-3xl font-bold text-gray-900 mt-2 capitalize">
              {{ subscriptionStore.currentSubscription?.plan_id || 'Free' }}
            </p>
            <div class="flex items-center mt-2">
              <UBadge
                :label="subscriptionStore.currentSubscription?.status || 'inactive'"
                :color="getStatusColor(subscriptionStore.currentSubscription?.status)"
                variant="subtle"
              />
            </div>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <UIcon name="i-heroicons-credit-card" class="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </UCard>

      <!-- Usage -->
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">API Calls</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ subscriptionStore.usage?.api_calls.current?.toLocaleString() || '0' }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              of {{ subscriptionStore.usage?.api_calls.limit?.toLocaleString() || '0' }}
            </p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <UIcon name="i-heroicons-bolt" class="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: `${subscriptionStore.usage?.api_calls.percentage || 0}%` }"
            ></div>
          </div>
        </div>
      </UCard>

      <!-- Storage -->
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Storage</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ subscriptionStore.usage?.storage_gb.current?.toFixed(1) || '0' }} GB
            </p>
            <p class="text-sm text-gray-500 mt-1">
              of {{ subscriptionStore.usage?.storage_gb.limit || '0' }} GB
            </p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <UIcon name="i-heroicons-cloud" class="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: `${subscriptionStore.usage?.storage_gb.percentage || 0}%` }"
            ></div>
          </div>
        </div>
      </UCard>

      <!-- Users -->
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Users</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ subscriptionStore.usage?.users.current || '0' }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              of {{ subscriptionStore.usage?.users.limit || '0' }}
            </p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <UIcon name="i-heroicons-users" class="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: `${subscriptionStore.usage?.users.percentage || 0}%` }"
            ></div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Charts and activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Usage chart -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Usage Overview</h3>
            <USelectMenu
              v-model="usagePeriod"
              :options="periodOptions"
              @change="fetchUsageData"
            />
          </div>
        </template>
        <div class="h-80">
          <BarChart
            v-if="usageChartData"
            :data="usageChartData"
            :options="chartOptions"
          />
        </div>
      </UCard>

      <!-- Recent activity -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <div class="p-2 bg-white rounded-full">
              <UIcon
                :name="activity.icon"
                class="w-5 h-5"
                :class="activity.color"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
              <p class="text-xs text-gray-500">{{ activity.description }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatDate(activity.timestamp) }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/users')">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-full">
            <UIcon name="i-heroicons-user-plus" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <h4 class="text-lg font-semibold text-gray-900">Add User</h4>
            <p class="text-sm text-gray-500">Invite team members</p>
          </div>
        </div>
      </UCard>

      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/resources')">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-full">
            <UIcon name="i-heroicons-plus-circle" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <h4 class="text-lg font-semibold text-gray-900">Add Resource</h4>
            <p class="text-sm text-gray-500">Create new resources</p>
          </div>
        </div>
      </UCard>

      <UCard class="cursor-pointer hover:shadow-md transition-shadow" @click="navigateTo('/billing')">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 rounded-full">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <h4 class="text-lg font-semibold text-gray-900">View Invoices</h4>
            <p class="text-sm text-gray-500">Billing history</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useSubscriptionStore } from '~/stores/subscription'
import { format, formatDistanceToNow } from 'date-fns'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const usagePeriod = ref('30d')
const periodOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
]

const usageChartData = ref(null)
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
    },
  },
}

const recentActivity = ref([
  {
    id: 1,
    title: 'New user added',
    description: 'john.doe@example.com joined the team',
    icon: 'i-heroicons-user-plus',
    color: 'text-green-600',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: 'API usage spike',
    description: '15,000 API calls in the last hour',
    icon: 'i-heroicons-bolt',
    color: 'text-yellow-600',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: 'Invoice paid',
    description: 'Invoice #INV-001234 has been paid',
    icon: 'i-heroicons-check-circle',
    color: 'text-blue-600',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'green',
    trialing: 'blue',
    cancelled: 'red',
    past_due: 'yellow',
  }
  return colors[status] || 'gray'
}

const formatDate = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true })
}

const fetchUsageData = async () => {
  // This would fetch actual usage data from API
  // For now, using mock data
  usageChartData.value = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'API Calls',
        data: [1200, 1900, 1500, 2100],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Storage (GB)',
        data: [800, 1200, 1000, 1400],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
    ],
  }
}

onMounted(async () => {
  await Promise.all([
    subscriptionStore.fetchCurrentSubscription(),
    subscriptionStore.fetchUsage(),
    fetchUsageData(),
  ])
})
</script>
