<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <!-- Logo -->
      <div class="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">NEO_STACK</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-2">
          <li>
            <NuxtLink to="/" class="nav-link">
              <UIcon name="i-heroicons-home" class="w-5 h-5 mr-3" />
              Dashboard
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- User menu -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4">
        <UDropdown :items="userMenuItems">
          <div class="flex items-center">
            <UAvatar size="sm" class="mr-3" />
            <div class="flex-1">
              <p class="text-sm font-medium">Usuário</p>
            </div>
          </div>
        </UDropdown>
      </div>
    </aside>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar -->
      <div class="sticky top-0 z-40 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-1 justify-between px-4">
          <div class="flex items-center">
            <h2 class="text-lg font-semibold">{{ pageTitle }}</h2>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Theme toggle -->
            <UButton variant="ghost" @click="toggleDark()">
              <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" />
            </UButton>

            <!-- Notifications -->
            <UButton variant="ghost" icon="i-heroicons-bell" />
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
const route = useRoute()
const { isDark, toggleDark } = useDarkMode()

const userMenuItems = computed(() => [
  [{ label: 'Profile', icon: 'i-heroicons-user' }],
  [{ label: 'Settings', icon: 'i-heroicons-cog-6-tooth' }],
  [{ label: 'Sign out', icon: 'i-heroicons-arrow-right-on-rectangle' }]
])

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard'
  return 'NEO_STACK'
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors;
}

.nav-link:hover {
  @apply bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white;
}

.nav-link.active {
  @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
}
</style>
