<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <Icon name="heroicons:academic-cap" class="h-8 w-8 text-primary-600" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                NEO_STACK Certification Platform
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Your certification journey starts here
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <UButton
              color="gray"
              variant="ghost"
              icon="heroicons:bell"
              :badge="notificationsCount"
            />
            <UDropdown :items="userMenuItems">
              <UAvatar
                :src="user?.avatar_url"
                :alt="user?.name"
                size="sm"
              />
            </UDropdown>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="heroicons:trophy" class="h-8 w-8 text-yellow-500" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Active Certificates
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ stats.activeCertificates }}
                </dd>
              </dl>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="heroicons:clock" class="h-8 w-8 text-blue-500" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Study Hours
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ stats.totalStudyHours }}
                </dd>
              </dl>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="heroicons:chart-bar" class="h-8 w-8 text-green-500" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Completion Rate
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ stats.completionRate }}%
                </dd>
              </dl>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="heroicons:fire" class="h-8 w-8 text-red-500" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Current Streak
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ stats.currentStreak }} days
                </dd>
              </dl>
            </div>
          </div>
        </UCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Available Certifications -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Available Certifications
                </h2>
                <UButton
                  color="primary"
                  variant="ghost"
                  size="sm"
                  @click="$router.push('/certifications')"
                >
                  View All
                  <Icon name="heroicons:arrow-right" class="ml-2 h-4 w-4" />
                </UButton>
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="cert in availableCertifications"
                :key="cert.id"
                class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <h3 class="text-base font-medium text-gray-900 dark:text-white">
                        {{ cert.name }}
                      </h3>
                      <UBadge
                        :label="cert.level"
                        :color="getLevelColor(cert.level)"
                        size="xs"
                      />
                    </div>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {{ cert.description }}
                    </p>
                    <div class="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <span class="flex items-center">
                        <Icon name="heroicons:clock" class="h-4 w-4 mr-1" />
                        {{ cert.duration_minutes }} minutes
                      </span>
                      <span class="flex items-center">
                        <Icon name="heroicons:check-circle" class="h-4 w-4 mr-1" />
                        {{ cert.passing_score }}% to pass
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <UButton
                      color="primary"
                      @click="startCertification(cert.id)"
                    >
                      Start
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Recent Activity -->
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </template>

            <div class="flow-root">
              <ul class="-mb-8">
                <li
                  v-for="(activity, activityIdx) in recentActivities"
                  :key="activity.id"
                  class="relative pb-8"
                >
                  <span
                    v-if="activityIdx !== recentActivities.length - 1"
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
                    </div>
                    <div class="text-right text-sm text-gray-500">
                      {{ formatDate(activity.timestamp) }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Progress Chart -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Study Progress
              </h3>
            </template>

            <div class="h-64">
              <canvas ref="progressChartCanvas" />
            </div>
          </UCard>

          <!-- Upcoming Exams -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Exams
              </h3>
            </template>

            <div class="space-y-3">
              <div
                v-for="exam in upcomingExams"
                :key="exam.id"
                class="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ exam.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(exam.scheduledDate) }}
                    </p>
                  </div>
                  <UButton
                    color="primary"
                    size="xs"
                    @click="resumeExam(exam.id)"
                  >
                    Resume
                  </UButton>
                </div>
              </div>

              <div
                v-if="upcomingExams.length === 0"
                class="text-center py-4 text-gray-500"
              >
                No upcoming exams
              </div>
            </div>
          </UCard>

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
                icon="heroicons:book-open"
                @click="$router.push('/study-materials')"
              >
                Browse Study Materials
              </UButton>
              <UButton
                block
                color="gray"
                variant="ghost"
                icon="heroicons:chart-pie"
                @click="$router.push('/analytics')"
              >
                View Analytics
              </UButton>
              <UButton
                block
                color="gray"
                variant="ghost"
                icon="heroicons:document-text"
                @click="$router.push('/certificates')"
              >
                My Certificates
              </UButton>
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
import { useCertificationStore } from '~/stores/certification'
import { useAuthStore } from '~/stores/auth'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()
const certificationStore = useCertificationStore()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const notificationsCount = ref(3)

const stats = ref({
  activeCertificates: 0,
  totalStudyHours: 0,
  completionRate: 0,
  currentStreak: 0
})

const availableCertifications = ref([])
const recentActivities = ref([])
const upcomingExams = ref([])

const userMenuItems = computed(() => [
  [{
    label: 'Profile',
    icon: 'heroicons:user',
    click: () => router.push('/profile')
  }, {
    label: 'Settings',
    icon: 'heroicons:cog-6-tooth',
    click: () => router.push('/settings')
  }],
  [{
    label: 'Sign out',
    icon: 'heroicons:arrow-right-on-rectangle',
    click: () => authStore.logout()
  }]
])

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    fundamental: 'green',
    professional: 'blue',
    expert: 'purple',
    master: 'yellow'
  }
  return colors[level] || 'gray'
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const startCertification = (certificationId: string) => {
  router.push(`/certifications/${certificationId}`)
}

const resumeExam = (examId: string) => {
  router.push(`/exams/${examId}`)
}

const progressChartCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  // Load dashboard data
  await Promise.all([
    certificationStore.loadCertifications(),
    certificationStore.loadUserStats(),
    certificationStore.loadRecentActivity(),
    certificationStore.loadUpcomingExams()
  ])

  availableCertifications.value = certificationStore.availableCertifications
  stats.value = certificationStore.stats
  recentActivities.value = certificationStore.recentActivities
  upcomingExams.value = certificationStore.upcomingExams

  // Initialize progress chart
  if (progressChartCanvas.value) {
    const ctx = progressChartCanvas.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'In Progress', 'Not Started'],
          datasets: [{
            data: [35, 25, 40],
            backgroundColor: [
              '#10B981',
              '#3B82F6',
              '#E5E7EB'
            ]
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
  layout: 'default',
  middleware: 'auth'
})
</script>
