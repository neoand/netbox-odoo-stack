<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <Icon name="heroicons:chart-bar-square" class="h-8 w-8 text-primary-600" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                NEO_STACK Analytics Dashboard
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Real-time insights and metrics
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <UDropdown :items="timeRangeItems">
              <UButton
                color="gray"
                variant="ghost"
                :label="selectedTimeRange.label"
                trailing-icon="heroicons:chevron-down"
              />
            </UDropdown>
            <UButton
              color="primary"
              icon="heroicons:arrow-path"
              :loading="refreshing"
              @click="refreshData"
            >
              Refresh
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UCard v-for="kpi in kpiCards" :key="kpi.title">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon
                :name="kpi.icon"
                :class="['h-8 w-8', kpi.iconColor]"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {{ kpi.title }}
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ kpi.value }}
                  </div>
                  <div
                    v-if="kpi.change"
                    :class="[
                      'ml-2 flex items-baseline text-sm font-semibold',
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    ]"
                  >
                    <Icon
                      :name="kpi.changeType === 'positive' ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'"
                      class="self-center flex-shrink-0 h-4 w-4"
                    />
                    <span class="ml-1">{{ kpi.change }}%</span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div v-if="kpi.subtitle" class="mt-2 text-xs text-gray-500">
            {{ kpi.subtitle }}
          </div>
        </UCard>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Infrastructure Health -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Infrastructure Health
                </h2>
                <UButton
                  color="gray"
                  variant="ghost"
                  size="sm"
                  @click="$router.push('/dashboards/infrastructure')"
                >
                  View Details
                  <Icon name="heroicons:arrow-right" class="ml-2 h-4 w-4" />
                </UButton>
              </div>
            </template>

            <div class="space-y-4">
              <!-- Health Score Chart -->
              <div class="h-64">
                <canvas ref="healthChartCanvas" />
              </div>

              <!-- Site Status -->
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="site in siteHealth"
                  :key="site.name"
                  class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium">{{ site.name }}</span>
                    <UBadge
                      :label="site.status"
                      :color="getStatusColor(site.status)"
                      size="xs"
                    />
                  </div>
                  <div class="text-2xl font-bold" :class="getScoreColor(site.score)">
                    {{ site.score }}%
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ site.activeDevices }}/{{ site.totalDevices }} devices active
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Security Events -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Security Events (24h)
                </h2>
                <UButton
                  color="gray"
                  variant="ghost"
                  size="sm"
                  @click="$router.push('/dashboards/security')"
                >
                  View Details
                  <Icon name="heroicons:arrow-right" class="ml-2 h-4 w-4" />
                </UButton>
              </div>
            </template>

            <div class="space-y-4">
              <!-- Security Events Chart -->
              <div class="h-64">
                <canvas ref="securityChartCanvas" />
              </div>

              <!-- Top Threats -->
              <div class="space-y-2">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  Top Threats
                </h4>
                <div
                  v-for="threat in topThreats"
                  :key="threat.type"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div class="flex items-center space-x-2">
                    <div
                      :class="[
                        'w-2 h-2 rounded-full',
                        getThreatColor(threat.severity)
                      ]"
                    />
                    <span class="text-sm">{{ threat.type }}</span>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span class="text-sm font-medium">{{ threat.count }}</span>
                    <span class="text-xs text-gray-500">{{ threat.severity }}</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Ticket Performance -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Ticket Performance
                </h2>
                <UButton
                  color="gray"
                  variant="ghost"
                  size="sm"
                  @click="$router.push('/dashboards/tickets')"
                >
                  View Details
                  <Icon name="heroicons:arrow-right" class="ml-2 h-4 w-4" />
                </UButton>
              </div>
            </template>

            <div class="space-y-4">
              <!-- Ticket Metrics -->
              <div class="grid grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">
                    {{ ticketMetrics.open }}
                  </div>
                  <div class="text-xs text-gray-500">Open</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">
                    {{ ticketMetrics.resolved }}
                  </div>
                  <div class="text-xs text-gray-500">Resolved</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-yellow-600">
                    {{ ticketMetrics.avgResolution }}h
                  </div>
                  <div class="text-xs text-gray-500">Avg Resolution</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-red-600">
                    {{ ticketMetrics.slaBreaches }}
                  </div>
                  <div class="text-xs text-gray-500">SLA Breaches</div>
                </div>
              </div>

              <!-- Ticket Trend Chart -->
              <div class="h-48">
                <canvas ref="ticketChartCanvas" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
            </template>

            <div class="space-y-2">
              <UButton
                block
                color="gray"
                variant="ghost"
                icon="heroicons:chart-pie"
                @click="$router.push('/dashboards/infrastructure')"
              >
                Infrastructure Dashboard
              </UButton>
              <UButton
                block
                color="gray"
                variant="ghost"
                icon="heroicons:shield-check"
                @click="$router.push('/dashboards/security')"
              >
                Security Dashboard
              </UButton>
              <UButton
                block
                color="gray"
                variant="ghost"
                icon="heroicons:ticket"
                @click="$router.push('/dashboards/tickets')"
              >
                Ticket Performance
              </UButton>
              <UButton
                block
                color="gray"
                variant="ghost"
                icon="heroicons:cloud"
                @click="$router.push('/dashboards/network')"
              >
                Network Analytics
              </UButton>
              <UButton
                block
                color="gray"
                variant="ghost"
                icon="heroicons:chart-bar"
                @click="$router.push('/dashboards/capacity')"
              >
                Capacity Planning
              </UButton>
              <UButton
                block
                color="gray"
                variant="ghost"
                icon="heroicons:document-chart-bar"
                @click="$router.push('/dashboards/executive')"
              >
                Executive Summary
              </UButton>
            </div>
          </UCard>

          <!-- Alerts -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Active Alerts
                </h3>
                <UBadge :label="alerts.length.toString()" color="red" />
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="alert in alerts"
                :key="alert.id"
                class="p-3 border-l-4"
                :class="getAlertBorderColor(alert.severity)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ alert.title }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ alert.description }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ formatTime(alert.timestamp) }}
                    </p>
                  </div>
                  <UBadge
                    :label="alert.severity"
                    :color="getSeverityColor(alert.severity)"
                    size="xs"
                  />
                </div>
              </div>

              <div v-if="alerts.length === 0" class="text-center py-4 text-gray-500">
                No active alerts
              </div>
            </div>
          </UCard>

          <!-- Recent Activity -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </template>

            <div class="flow-root">
              <ul class="-mb-8">
                <li
                  v-for="(activity, idx) in recentActivity"
                  :key="activity.id"
                  class="relative pb-8"
                >
                  <span
                    v-if="idx !== recentActivity.length - 1"
                    class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  />
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        :class="[
                          activity.iconBackground,
                          'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900'
                        ]"
                      >
                        <Icon
                          :name="activity.icon"
                          class="h-5 w-5 text-white"
                        />
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div>
                        <div class="text-sm">
                          <span class="font-medium text-gray-900 dark:text-white">
                            {{ activity.title }}
                          </span>
                        </div>
                        <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                          {{ activity.description }}
                        </p>
                      </div>
                      <div class="mt-2 text-xs text-gray-400">
                        {{ formatTime(activity.timestamp) }}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </UCard>

          <!-- Capacity Forecast -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Capacity Forecast
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  size="sm"
                  icon="heroicons:arrow-right"
                  @click="$router.push('/dashboards/capacity')"
                />
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="resource in capacityForecast"
                :key="resource.name"
                class="space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ resource.name }}</span>
                  <span class="text-sm text-gray-500">
                    {{ resource.current }}% / {{ resource.limit }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getCapacityBarColor(resource.current)"
                    :style="{ width: `${Math.min(resource.current, 100)}%` }"
                  />
                </div>
                <div class="text-xs text-gray-500">
                  Predicted full in {{ resource.predictedDays }} days
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()

const refreshing = ref(false)
const selectedTimeRange = ref({
  label: 'Last 24 Hours',
  value: '24h'
})

const timeRangeItems = [
  [{
    label: 'Last 24 Hours',
    click: () => selectedTimeRange.value = { label: 'Last 24 Hours', value: '24h' }
  }, {
    label: 'Last 7 Days',
    click: () => selectedTimeRange.value = { label: 'Last 7 Days', value: '7d' }
  }, {
    label: 'Last 30 Days',
    click: () => selectedTimeRange.value = { label: 'Last 30 Days', value: '30d' }
  }, {
    label: 'Last 90 Days',
    click: () => selectedTimeRange.value = { label: 'Last 90 Days', value: '90d' }
  }]
]

// KPI Cards Data
const kpiCards = ref([
  {
    title: 'Total Devices',
    value: '2,847',
    change: '12',
    changeType: 'positive',
    icon: 'heroicons:computer-desktop',
    iconColor: 'text-blue-600',
    subtitle: '+156 this month'
  },
  {
    title: 'Active Alerts',
    value: '23',
    change: '8',
    changeType: 'negative',
    icon: 'heroicons:exclamation-triangle',
    iconColor: 'text-red-600',
    subtitle: '5 Critical, 18 Warning'
  },
  {
    title: 'Avg Response Time',
    value: '2.4h',
    change: '15',
    changeType: 'positive',
    icon: 'heroicons:clock',
    iconColor: 'text-green-600',
    subtitle: 'SLA: 4h'
  },
  {
    title: 'System Uptime',
    value: '99.9%',
    change: '0.1',
    changeType: 'positive',
    icon: 'heroicons:arrow-trending-up',
    iconColor: 'text-green-600',
    subtitle: 'Last 30 days'
  }
])

// Site Health Data
const siteHealth = ref([
  { name: 'São Paulo DC', status: 'Healthy', score: 95, activeDevices: 1,423, totalDevices: 1,450 },
  { name: 'Rio de Janeiro', status: 'Warning', score: 87, activeDevices: 892, totalDevices: 950 },
  { name: 'Brasília', status: 'Healthy', score: 98, activeDevices: 445, totalDevices: 447 }
])

// Security Data
const topThreats = ref([
  { type: 'Failed Login Attempts', count: 1,247, severity: 'High' },
  { type: 'Malware Detected', count: 23, severity: 'Critical' },
  { type: 'Port Scan', count: 156, severity: 'Medium' },
  { type: 'Suspicious Traffic', count: 89, severity: 'Low' }
])

// Ticket Metrics
const ticketMetrics = ref({
  open: 147,
  resolved: 892,
  avgResolution: 2.4,
  slaBreaches: 12
})

// Active Alerts
const alerts = ref([
  {
    id: 1,
    title: 'High CPU Usage',
    description: 'Server DB-PROD-01',
    severity: 'Critical',
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: 2,
    title: 'Disk Space Warning',
    description: 'Server WEB-01',
    severity: 'Warning',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 3,
    title: 'Network Latency',
    description: 'WAN Link SP-RJ',
    severity: 'Warning',
    timestamp: new Date(Date.now() - 7200000)
  }
])

// Recent Activity
const recentActivity = ref([
  {
    id: 1,
    title: 'Ticket Resolved',
    description: 'Issue #TICK-0085',
    icon: 'heroicons:check-circle',
    iconBackground: 'bg-green-500',
    timestamp: new Date(Date.now() - 900000)
  },
  {
    id: 2,
    title: 'Security Alert',
    description: 'Failed login attempts detected',
    icon: 'heroicons:shield-exclamation',
    iconBackground: 'bg-red-500',
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: 3,
    title: 'Infrastructure Update',
    description: 'Patch applied to 45 servers',
    icon: 'heroicons:server',
    iconBackground: 'bg-blue-500',
    timestamp: new Date(Date.now() - 3600000)
  }
])

// Capacity Forecast
const capacityForecast = ref([
  { name: 'CPU', current: 68, limit: 100, predictedDays: 45 },
  { name: 'Memory', current: 72, limit: 100, predictedDays: 38 },
  { name: 'Storage', current: 65, limit: 100, predictedDays: 60 },
  { name: 'Network', current: 45, limit: 100, predictedDays: 90 }
])

// Chart refs
const healthChartCanvas = ref<HTMLCanvasElement | null>(null)
const securityChartCanvas = ref<HTMLCanvasElement | null>(null)
const ticketChartCanvas = ref<HTMLCanvasElement | null>(null)

// Utility functions
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Healthy': 'green',
    'Warning': 'yellow',
    'Critical': 'red'
  }
  return colors[status] || 'gray'
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

const getThreatColor = (severity: string) => {
  const colors: Record<string, string> = {
    'Critical': 'bg-red-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-green-500'
  }
  return colors[severity] || 'bg-gray-500'
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'Critical': 'red',
    'Warning': 'yellow',
    'Info': 'blue'
  }
  return colors[severity] || 'gray'
}

const getAlertBorderColor = (severity: string) => {
  const colors: Record<string, string> = {
    'Critical': 'border-red-500 bg-red-50 dark:bg-red-900/20',
    'Warning': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    'Info': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
  }
  return colors[severity] || 'border-gray-500 bg-gray-50 dark:bg-gray-800'
}

const getCapacityBarColor = (current: number) => {
  if (current >= 90) return 'bg-red-500'
  if (current >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

const refreshData = async () => {
  refreshing.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  refreshing.value = false
}

// Initialize charts
onMounted(() => {
  // Health Chart
  if (healthChartCanvas.value) {
    const ctx = healthChartCanvas.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [{
            label: 'Health Score',
            data: [92, 94, 91, 95, 93, 96],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 85,
              max: 100
            }
          }
        }
      })
    }
  }

  // Security Chart
  if (securityChartCanvas.value) {
    const ctx = securityChartCanvas.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Critical', 'High', 'Medium', 'Low'],
          datasets: [{
            label: 'Alerts',
            data: [23, 89, 245, 456],
            backgroundColor: [
              '#EF4444',
              '#F97316',
              '#EAB308',
              '#10B981'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
  }

  // Ticket Chart
  if (ticketChartCanvas.value) {
    const ctx = ticketChartCanvas.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Created',
            data: [45, 52, 38, 65, 58, 42, 35],
            borderColor: '#3B82F6',
            tension: 0.4
          }, {
            label: 'Resolved',
            data: [38, 48, 42, 58, 62, 38, 32],
            borderColor: '#10B981',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  }
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>
