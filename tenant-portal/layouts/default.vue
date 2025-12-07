<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="sidebarOpen = false"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
    </div>

    <!-- Desktop sidebar -->
    <div
      class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col"
    >
      <div class="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
        <!-- Logo & Tenant -->
        <div class="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
          <div>
            <h1 class="text-xl font-bold text-gray-900">
              NEO_STACK
            </h1>
            <p class="text-xs text-gray-500">
              {{ authStore.currentTenant?.name }}
            </p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4">
          <ul class="space-y-1 px-2">
            <li>
              <NuxtLink
                to="/"
                class="sidebar-nav-link"
                :class="{ 'active': $route.path === '/' }"
              >
                <UIcon
                  name="i-heroicons-home"
                  class="w-5 h-5 mr-3"
                />
                Dashboard
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/subscription"
                class="sidebar-nav-link"
                :class="{ 'active': $route.path.startsWith('/subscription') }"
              >
                <UIcon
                  name="i-heroicons-credit-card"
                  class="w-5 h-5 mr-3"
                />
                Subscription
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/billing"
                class="sidebar-nav-link"
                :class="{ 'active': $route.path.startsWith('/billing') }"
              >
                <UIcon
                  name="i-heroicons-banknotes"
                  class="w-5 h-5 mr-3"
                />
                Billing
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/usage"
                class="sidebar-nav-link"
                :class="{ 'active': $route.path.startsWith('/usage') }"
              >
                <UIcon
                  name="i-heroicons-chart-bar-square"
                  class="w-5 h-5 mr-3"
                />
                Usage
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/users"
                class="sidebar-nav-link"
                :class="{ 'active': $route.path.startsWith('/users') }"
              >
                <UIcon
                  name="i-heroicons-users"
                  class="w-5 h-5 mr-3"
                />
                Users
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/resources"
                class="sidebar-nav-link"
                :class="{ 'active': $route.path.startsWith('/resources') }"
              >
                <UIcon
                  name="i-heroicons-squares-plus"
                  class="w-5 h-5 mr-3"
                />
                Resources
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/settings"
                class="sidebar-nav-link"
                :class="{ 'active': $route.path.startsWith('/settings') }"
              >
                <UIcon
                  name="i-heroicons-cog-6-tooth"
                  class="w-5 h-5 mr-3"
                />
                Settings
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- User menu -->
        <div class="flex-shrink-0 border-t border-gray-200 p-4">
          <UDropdown :items="userMenuItems">
            <div class="flex items-center">
              <UAvatar
                :alt="authStore.currentUser?.name"
                size="sm"
                class="mr-3"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ authStore.currentUser?.name }}
                </p>
                <p class="text-xs text-gray-500 truncate">
                  {{ authStore.currentUser?.email }}
                </p>
              </div>
              <UIcon
                name="i-heroicons-chevron-up-down"
                class="w-5 h-5 text-gray-400"
              />
            </div>
          </UDropdown>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar -->
      <div class="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200">
        <button
          type="button"
          class="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <UIcon
            name="i-heroicons-bars-3"
            class="h-6 w-6"
          />
        </button>

        <div class="flex flex-1 justify-between px-4">
          <div class="flex flex-1">
            <div class="flex w-full md:ml-0">
              <div class="flex items-center">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ pageTitle }}
                </h2>
              </div>
            </div>
          </div>

          <div class="ml-4 flex items-center md:ml-6 space-x-4">
            <!-- Usage warnings -->
            <div
              v-if="subscriptionStore.usageWarnings.length > 0"
              class="flex items-center"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-5 h-5 text-yellow-500 mr-1"
              />
              <span class="text-sm text-yellow-600">
                {{ subscriptionStore.usageWarnings.length }} resource(s) near limit
              </span>
            </div>

            <!-- Trial warning -->
            <UBadge
              v-if="subscriptionStore.isTrialExpiringSoon"
              color="yellow"
              variant="subtle"
              class="flex items-center"
            >
              <UIcon
                name="i-heroicons-clock"
                class="w-4 h-4 mr-1"
              />
              Trial expires in {{ subscriptionStore.daysUntilRenewal }} days
            </UBadge>

            <!-- Notifications -->
            <UButton
              variant="ghost"
              color="gray"
              icon="i-heroicons-bell"
              :badge="notificationCount"
            />

            <!-- Profile dropdown -->
            <UDropdown :items="userMenuItems">
              <UAvatar
                :alt="authStore.currentUser?.name"
                size="sm"
              />
            </UDropdown>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="flex-1">
        <div class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useSubscriptionStore } from '~/stores/subscription'

const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const notificationCount = ref(2)

const userMenuItems = computed(() => [
  [{
    label: 'Profile',
    icon: 'i-heroicons-user',
    click: () => router.push('/profile')
  }],
  [{
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => router.push('/settings')
  }],
  [{
    label: 'Sign out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => authStore.logout()
  }]
])

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard'
  if (path.startsWith('/subscription')) return 'Subscription'
  if (path.startsWith('/billing')) return 'Billing'
  if (path.startsWith('/usage')) return 'Usage'
  if (path.startsWith('/users')) return 'Users'
  if (path.startsWith('/resources')) return 'Resources'
  if (path.startsWith('/settings')) return 'Settings'
  return 'Tenant Portal'
})

onMounted(() => {
  authStore.initAuth()
})
</script>

<style scoped>
.sidebar-nav-link {
  @apply flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors;
}

.sidebar-nav-link:hover {
  @apply bg-gray-100 text-gray-900;
}

.sidebar-nav-link.active {
  @apply bg-primary-100 text-primary-700;
}
</style>
