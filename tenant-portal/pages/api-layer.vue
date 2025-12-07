<script setup lang="ts">
/**
 * API Layer Demo Page
 * Demonstrates all features of the API layer in a real application
 */

definePageMeta({
  title: 'API Layer Demo',
  requiresAuth: true,
  roles: ['admin'],
})

// Import the demo component
import ApiLayerDemo from '~/components/ApiLayerDemo.vue'
</script>

<template>
  <div>
    <ApiLayerDemo />
  </div>
</template>
