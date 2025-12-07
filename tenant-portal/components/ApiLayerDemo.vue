<script setup lang="ts">
/**
 * API Layer Demo Component
 * Demonstrates all features of the API layer
 */

import { ref } from 'vue'
import { useApiGet, useApiPost, usePaginatedApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useTheme } from '~/composables/useTheme'
import { formatDate, formatCurrency, debounce } from '~/utils/helpers'
import { validateForm, commonSchemas, createRule } from '~/utils/validators'

// Composables
const { t, tp } = useI18n()
const { success, error, loading, info } = useToast()
const { user, isAuthenticated, isAdmin } = useAuth()
const { mode, toggleMode, effectiveTheme } = useTheme()

// API Examples
const { data: users, loading: usersLoading, execute: fetchUsers } = useApiGet<any[]>('/api/users')

const {
  data: paginatedData,
  loading: paginatedLoading,
  page,
  perPage,
  total,
  fetch: fetchPaginated,
  nextPage,
  prevPage,
} = usePaginatedApi<any>('/api/products')

// Form validation example
const form = ref({
  name: '',
  email: '',
  password: '',
  age: '',
})

const formErrors = ref<Record<string, string[]>>({})

const validateFormData = () => {
  const schema = {
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.strongPassword,
    age: [
      createRule((value) => !!value, 'Age is required'),
      createRule((value) => Number(value) >= 18, 'Must be 18 or older'),
    ],
  }

  const result = validateForm(form.value, schema)
  formErrors.value = {}

  if (!result.valid) {
    result.errors.forEach((err) => {
      if (!formErrors.value[err.field]) {
        formErrors.value[err.field] = []
      }
      formErrors.value[err.field].push(err.message)
    })
    return false
  }

  return true
}

const submitForm = async () => {
  if (!validateFormData()) {
    error('Validation Failed', 'Please check your input')
    return
  }

  const { execute } = useToastAsync()
  await execute(
    () => $fetch('/api/users', { method: 'POST', body: form.value }),
    {
      loadingTitle: 'Creating user...',
      successTitle: 'Success!',
      successMessage: 'User created successfully',
      errorTitle: 'Error!',
      errorMessage: 'Failed to create user',
    }
  )

  form.value = { name: '', email: '', password: '', age: '' }
}

// Debounced search
const searchQuery = ref('')
const searchResults = ref<any[]>([])

const debouncedSearch = debounce(async (query: string) => {
  if (!query) {
    searchResults.value = []
    return
  }

  try {
    const { data } = await useApiGet<any[]>(`/api/search?q=${query}`)
    searchResults.value = data.value || []
  } catch (err) {
    error('Search Error', 'Failed to search')
  }
}, 300)

// Helpers examples
const currentDate = new Date()
const price = 1234.56

// Methods
const refreshUsers = async () => {
  await fetchUsers()
  success('Success', 'Users refreshed')
}

const createUser = async () => {
  const { execute } = useToastAsync()
  await execute(
    () => $fetch('/api/users', { method: 'POST', body: { name: 'John Doe' } }),
    {
      loadingTitle: 'Creating user...',
      successTitle: 'Success!',
    }
  )
}

// Watch search query
watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})
</script>

<template>
  <div class="api-layer-demo p-6 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">
        API Layer Demo
      </h1>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">
          {{ t('common.theme') }}: {{ effectiveTheme }}
        </span>
        <UButton
          variant="outline"
          size="sm"
          @click="toggleMode()"
        >
          {{ t('common.toggle') }} {{ effectiveTheme === 'dark' ? 'Light' : 'Dark' }}
        </UButton>
      </div>
    </div>

    <!-- Authentication Status -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          {{ t('auth.login') }} Status
        </h2>
      </template>

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="font-medium">{{ t('auth.loggedIn') }}:</span>
          <UBadge :color="isAuthenticated ? 'green' : 'red'">
            {{ isAuthenticated ? t('common.yes') : t('common.no') }}
          </UBadge>
        </div>

        <div
          v-if="user"
          class="flex items-center gap-2"
        >
          <span class="font-medium">{{ t('auth.user') }}:</span>
          <span>{{ user.name }} ({{ user.email }})</span>
        </div>

        <div
          v-if="user"
          class="flex items-center gap-2"
        >
          <span class="font-medium">{{ t('auth.role') }}:</span>
          <UBadge :color="isAdmin ? 'blue' : 'gray'">
            {{ user.role }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- API Calls Demo -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {{ t('nav.users') }}
          </h2>
          <UButton
            :loading="usersLoading"
            size="sm"
            @click="refreshUsers"
          >
            {{ t('common.refresh') }}
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-if="usersLoading"
          class="space-y-2"
        >
          <USkeleton
            v-for="i in 3"
            :key="i"
            class="h-12 w-full"
          />
        </div>

        <div
          v-else-if="users"
          class="space-y-2"
        >
          <div
            v-for="user in users"
            :key="user.id"
            class="p-3 border rounded-lg flex items-center justify-between"
          >
            <div>
              <div class="font-medium">
                {{ user.name }}
              </div>
              <div class="text-sm text-gray-500">
                {{ user.email }}
              </div>
            </div>
            <UBadge>{{ user.role }}</UBadge>
          </div>
        </div>

        <UButton
          class="w-full"
          @click="createUser"
        >
          {{ t('common.create') }} {{ t('nav.user') }}
        </UButton>
      </div>
    </UCard>

    <!-- Search Demo -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          {{ t('common.search') }}
        </h2>
      </template>

      <div class="space-y-4">
        <UInput
          v-model="searchQuery"
          :placeholder="t('common.search') + '...'"
          icon="i-heroicons-magnifying-glass"
        />

        <div
          v-if="searchResults.length > 0"
          class="space-y-2"
        >
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="p-3 border rounded-lg"
          >
            {{ result.name || result.title }}
          </div>
        </div>

        <div
          v-else-if="searchQuery"
          class="text-center text-gray-500 py-4"
        >
          {{ t('common.noResults') }}
        </div>
      </div>
    </UCard>

    <!-- Form Validation Demo -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          {{ t('validation.title') }}
        </h2>
      </template>

      <form
        class="space-y-4"
        @submit.prevent="submitForm"
      >
        <UFormGroup
          :label="t('auth.name')"
          :error="formErrors.name?.[0]"
        >
          <UInput v-model="form.name" />
        </UFormGroup>

        <UFormGroup
          :label="t('auth.email')"
          :error="formErrors.email?.[0]"
        >
          <UInput
            v-model="form.email"
            type="email"
          />
        </UFormGroup>

        <UFormGroup
          :label="t('auth.password')"
          :error="formErrors.password?.[0]"
        >
          <UInput
            v-model="form.password"
            type="password"
          />
        </UFormGroup>

        <UFormGroup
          :label="t('validation.age')"
          :error="formErrors.age?.[0]"
        >
          <UInput
            v-model="form.age"
            type="number"
            min="18"
          />
        </UFormGroup>

        <UButton
          type="submit"
          class="w-full"
        >
          {{ t('common.submit') }}
        </UButton>
      </form>
    </UCard>

    <!-- Helpers Demo -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          {{ t('common.helpers') }}
        </h2>
      </template>

      <div class="space-y-4">
        <div>
          <span class="font-medium">{{ t('common.date') }}:</span>
          <span class="ml-2">{{ formatDate(currentDate) }}</span>
        </div>

        <div>
          <span class="font-medium">{{ t('common.relativeTime') }}:</span>
          <span class="ml-2">{{ formatDate(currentDate) }}</span>
        </div>

        <div>
          <span class="font-medium">{{ t('common.currency') }}:</span>
          <span class="ml-2">{{ formatCurrency(price, 'BRL') }}</span>
        </div>

        <div>
          <span class="font-medium">{{ t('common.truncate') }}:</span>
          <span class="ml-2">{{ 'This is a very long text that should be truncated'.substring(0, 20) }}...</span>
        </div>
      </div>
    </UCard>

    <!-- Toast Demo -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          {{ t('common.toasts') }}
        </h2>
      </template>

      <div class="grid grid-cols-2 gap-2">
        <UButton
          color="green"
          @click="success('Success!', 'This is a success message')"
        >
          {{ t('common.success') }}
        </UButton>

        <UButton
          color="red"
          @click="error('Error!', 'This is an error message')"
        >
          {{ t('common.error') }}
        </UButton>

        <UButton
          color="yellow"
          @click="warning('Warning!', 'This is a warning message')"
        >
          {{ t('common.warning') }}
        </UButton>

        <UButton
          color="blue"
          @click="info('Info!', 'This is an info message')"
        >
          {{ t('common.info') }}
        </UButton>

        <UButton
          color="gray"
          class="col-span-2"
          @click="loading('Loading...', 'Please wait')"
        >
          {{ t('common.loading') }}
        </UButton>
      </div>
    </UCard>

    <!-- Pagination Demo -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {{ t('common.pagination') }}
          </h2>
          <div class="text-sm text-gray-500">
            {{ t('common.page') }} {{ page }} / {{ Math.ceil(total / perPage) }}
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-if="paginatedLoading"
          class="space-y-2"
        >
          <USkeleton
            v-for="i in 5"
            :key="i"
            class="h-12 w-full"
          />
        </div>

        <div
          v-else-if="paginatedData"
          class="space-y-2"
        >
          <div
            v-for="item in paginatedData.items"
            :key="item.id"
            class="p-3 border rounded-lg"
          >
            {{ item.name || item.title }}
          </div>
        </div>

        <div class="flex items-center justify-between">
          <UButton
            :disabled="page <= 1"
            variant="outline"
            size="sm"
            @click="prevPage"
          >
            {{ t('common.previous') }}
          </UButton>

          <UButton
            :disabled="page >= Math.ceil(total / perPage)"
            variant="outline"
            size="sm"
            @click="nextPage"
          >
            {{ t('common.next') }}
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
.api-layer-demo {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
