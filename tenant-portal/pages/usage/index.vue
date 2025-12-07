<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        Usage & Limits
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Monitor your resource usage and limits
      </p>
    </div>

    <!-- Usage overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- API Calls -->
      <UCard>
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600">
              API Calls
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ subscriptionStore.usage?.api_calls.current?.toLocaleString() || '0' }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <UIcon
              name="i-heroicons-bolt"
              class="w-8 h-8 text-blue-600"
            />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Used</span>
            <span class="text-gray-900">{{ subscriptionStore.usage?.api_calls.current?.toLocaleString() || '0' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Limit</span>
            <span class="text-gray-900">{{ subscriptionStore.usage?.api_calls.limit?.toLocaleString() || '0' }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="getUsageBarColor(subscriptionStore.usage?.api_calls.percentage || 0)"
              :style="{ width: `${Math.min(subscriptionStore.usage?.api_calls.percentage || 0, 100)}%` }"
            />
          </div>
          <p class="text-xs text-gray-500">
            {{ (subscriptionStore.usage?.api_calls.percentage || 0).toFixed(1) }}% of {{ subscriptionStore.usage?.api_calls.limit?.toLocaleString() || '0' }} used
          </p>
        </div>
      </UCard>

      <!-- Storage -->
      <UCard>
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600">
              Storage
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ subscriptionStore.usage?.storage_gb.current?.toFixed(1) || '0' }} GB
            </p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <UIcon
              name="i-heroicons-cloud"
              class="w-8 h-8 text-purple-600"
            />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Used</span>
            <span class="text-gray-900">{{ subscriptionStore.usage?.storage_gb.current?.toFixed(1) || '0' }} GB</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Limit</span>
            <span class="text-gray-900">{{ subscriptionStore.usage?.storage_gb.limit || '0' }} GB</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="getUsageBarColor(subscriptionStore.usage?.storage_gb.percentage || 0)"
              :style="{ width: `${Math.min(subscriptionStore.usage?.storage_gb.percentage || 0, 100)}%` }"
            />
          </div>
          <p class="text-xs text-gray-500">
            {{ (subscriptionStore.usage?.storage_gb.percentage || 0).toFixed(1) }}% of {{ subscriptionStore.usage?.storage_gb.limit || '0' }} GB used
          </p>
        </div>
      </UCard>

      <!-- Users -->
      <UCard>
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600">
              Users
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ subscriptionStore.usage?.users.current || '0' }}
            </p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <UIcon
              name="i-heroicons-users"
              class="w-8 h-8 text-yellow-600"
            />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Active</span>
            <span class="text-gray-900">{{ subscriptionStore.usage?.users.current || '0' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Limit</span>
            <span class="text-gray-900">{{ subscriptionStore.usage?.users.limit || '0' }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="getUsageBarColor(subscriptionStore.usage?.users.percentage || 0)"
              :style="{ width: `${Math.min(subscriptionStore.usage?.users.percentage || 0, 100)}%` }"
            />
          </div>
          <p class="text-xs text-gray-500">
            {{ (subscriptionStore.usage?.users.percentage || 0).toFixed(1) }}% of {{ subscriptionStore.usage?.users.limit || '0' }} used
          </p>
        </div>
      </UCard>

      <!-- Devices -->
      <UCard>
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-gray-600">
              Devices
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ subscriptionStore.usage?.devices.current || '0' }}
            </p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <UIcon
              name="i-heroicons-computer-desktop"
              class="w-8 h-8 text-green-600"
            />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Active</span>
            <span class="text-gray-900">{{ subscriptionStore.usage?.devices.current || '0' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Limit</span>
            <span class="text-gray-900">{{ subscriptionStore.usage?.devices.limit || '0' }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="getUsageBarColor(subscriptionStore.usage?.devices.percentage || 0)"
              :style="{ width: `${Math.min(subscriptionStore.usage?.devices.percentage || 0, 100)}%` }"
            />
          </div>
          <p class="text-xs text-gray-500">
            {{ (subscriptionStore.usage?.devices.percentage || 0).toFixed(1) }}% of {{ subscriptionStore.usage?.devices.limit || '0' }} used
          </p>
        </div>
      </UCard>
    </div>

    <!-- Usage warnings -->
    <div
      v-if="subscriptionStore.usageWarnings.length > 0"
      class="mb-8"
    >
      <UAlert
        v-for="warning in subscriptionStore.usageWarnings"
        :key="warning"
        icon="i-heroicons-exclamation-triangle"
        color="orange"
        variant="subtle"
        :title="`${warning} Usage High`"
        :description="`You're approaching your ${warning} limit. Consider upgrading your plan to avoid service interruption.`"
      >
        <template #actions>
          <UButton
            color="orange"
            variant="outline"
            @click="navigateTo('/subscription')"
          >
            Upgrade Plan
          </UButton>
        </template>
      </UAlert>
    </div>

    <!-- Usage history -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Usage History
          </h3>
          <USelectMenu
            v-model="timeRange"
            :options="timeRangeOptions"
            @change="fetchUsageHistory"
          />
        </div>
      </template>

      <div class="h-80">
        <LineChart
          v-if="usageHistoryData"
          :data="usageHistoryData"
          :options="chartOptions"
        />
      </div>
    </UCard>

    <!-- Usage by resource -->
    <UCard class="mt-8">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">
          Usage by Resource
        </h3>
      </template>

      <div class="space-y-6">
        <!-- API Calls breakdown -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">
              API Calls Breakdown
            </h4>
            <p class="text-sm text-gray-500">
              {{ subscriptionStore.usage?.api_calls.current?.toLocaleString() || '0' }} / {{ subscriptionStore.usage?.api_calls.limit?.toLocaleString() || '0' }}
            </p>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">GET Requests</span>
              <span class="text-gray-900">{{ (subscriptionStore.usage?.api_calls.current || 0) * 0.6 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">POST Requests</span>
              <span class="text-gray-900">{{ (subscriptionStore.usage?.api_calls.current || 0) * 0.3 }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">PUT Requests</span>
              <span class="text-gray-900">{{ (subscriptionStore.usage?.api_calls.current || 0) * 0.1 }}</span>
            </div>
          </div>
        </div>

        <!-- Storage breakdown -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">
              Storage Breakdown
            </h4>
            <p class="text-sm text-gray-500">
              {{ subscriptionStore.usage?.storage_gb.current?.toFixed(1) || '0' }} / {{ subscriptionStore.usage?.storage_gb.limit || '0' }} GB
            </p>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Database</span>
              <span class="text-gray-900">{{ ((subscriptionStore.usage?.storage_gb.current || 0) * 0.5).toFixed(1) }} GB</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Files</span>
              <span class="text-gray-900">{{ ((subscriptionStore.usage?.storage_gb.current || 0) * 0.3).toFixed(1) }} GB</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Backups</span>
              <span class="text-gray-900">{{ ((subscriptionStore.usage?.storage_gb.current || 0) * 0.2).toFixed(1) }} GB</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useSubscriptionStore } from '~/stores/subscription'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const subscriptionStore = useSubscriptionStore()

const timeRange = ref('30d')
const timeRangeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
]

const usageHistoryData = ref(null)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

const getUsageBarColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 80) return 'bg-yellow-500'
  if (percentage >= 60) return 'bg-blue-500'
  return 'bg-green-500'
}

const fetchUsageHistory = async () => {
  // This would fetch actual usage history from API
  // For now, using mock data
  usageHistoryData.value = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'API Calls',
        data: [1200, 1900, 1500, 2100],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Storage (GB)',
        data: [800, 1200, 1000, 1400],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }
}

onMounted(async () => {
  await Promise.all([
    subscriptionStore.fetchUsage(),
    fetchUsageHistory(),
  ])
})
</script>
