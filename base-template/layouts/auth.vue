<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">NEO_STACK</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ subtitle }}</p>
      </div>

      <!-- Content -->
      <div class="mt-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  subtitle?: string
}>()
</script>
