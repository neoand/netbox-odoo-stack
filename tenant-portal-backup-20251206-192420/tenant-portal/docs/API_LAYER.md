# API Layer Documentation

## Overview

A comprehensive API layer for Neo Stack applications, inspired by base-vuejs architecture and adapted for Nuxt 3. This layer provides a centralized, type-safe, and reusable set of utilities and composables for building robust front-end applications.

## Architecture

The API layer consists of three main components:

1. **Utils** - Low-level utilities and helpers
2. **Composables** - Reactive Composition API functions
3. **Stores** - Pinia state management (existing)

## Directory Structure

```
├── utils/
│   ├── api.ts          # HTTP client and API methods
│   ├── helpers.ts      # Utility functions
│   ├── validators.ts   # Form and data validators
│   └── index.ts        # Centralized exports
├── composables/
│   ├── useApi.ts       # API composables
│   ├── useAuth.ts      # Authentication composables
│   ├── useTheme.ts     # Theme management
│   ├── useI18n.ts      # Internationalization
│   ├── useToast.ts     # Notification system
│   └── index.ts        # Centralized exports
└── stores/
    ├── auth.ts         # Authentication store (existing)
    ├── billing.ts      # Billing store (existing)
    └── subscription.ts # Subscription store (existing)
```

## Utils

### API Client (`utils/api.ts`)

Centralized HTTP client built on top of Axios with automatic token injection, error handling, and response interceptors.

#### Features

- ✅ Singleton axios instance
- ✅ Automatic token injection from localStorage
- ✅ Response interceptors for error handling
- ✅ Request/response logging
- ✅ Automatic 401 handling (redirect to login)
- ✅ Type-safe responses
- ✅ File upload/download support

#### Usage

```typescript
import { get, post, put, del, upload } from '~/utils/api'

// GET request
const { data } = await get('/api/users')

// POST request
const { data } = await post('/api/users', { name: 'John' })

// PUT request
const { data } = await put('/api/users/1', { name: 'John Updated' })

// DELETE request
const { data } = await del('/api/users/1')

// Upload file
const formData = new FormData()
formData.append('file', file)
const { data } = await upload('/api/upload', formData)

// Download file
await download('/api/download/file.pdf', 'my-file.pdf')
```

#### Configuration

The API client automatically reads configuration from `runtimeConfig.public.apiBase`.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000',
    }
  }
})
```

### Helpers (`utils/helpers.ts`)

Collection of utility functions for common tasks.

#### Available Functions

```typescript
// Date formatting
formatDate(new Date(), 'pt-BR', { year: 'numeric', month: 'long' })
formatRelativeTime(new Date()) // "2 hours ago"

// Currency formatting
formatCurrency(1000, 'BRL', 'pt-BR') // "R$ 1.000,00"

// Number formatting
formatNumber(1000000, 'pt-BR') // "1.000.000"

// String manipulation
truncate('Long text...', 10) // "Long text..."
capitalize('hello') // "Hello"
slugify('Hello World') // "hello-world"

// Async utilities
await sleep(1000) // Wait 1 second
debounce(fn, 300) // Debounce function
throttle(fn, 1000) // Throttle function

// Object utilities
deepClone(obj) // Deep clone object
deepEqual(a, b) // Deep equality check
isEmpty(value) // Check if value is empty

// JWT utilities
parseJwtToken(token) // Parse JWT payload
isTokenExpired(token) // Check if token is expired

// File utilities
formatFileSize(1024) // "1 KB"
bytesToBase64(bytes) // Convert bytes to base64

// Domain utilities
extractDomain('https://example.com/path') // "example.com"
```

#### Usage

```typescript
import { formatDate, formatCurrency, debounce } from '~/utils/helpers'

// Format date
const formattedDate = formatDate(new Date())

// Format currency
const price = formatCurrency(1000)

// Debounce search input
const debouncedSearch = debounce((query) => {
  performSearch(query)
}, 300)
```

### Validators (`utils/validators.ts`)

Form and data validation utilities with Brazilian-specific validators.

#### Features

- ✅ Built-in validators (email, required, length, etc.)
- ✅ Brazilian validators (CPF, CNPJ, CEP, phone)
- ✅ Credit card validation (Luhn algorithm)
- ✅ Strong password validation
- ✅ Date and date range validation
- ✅ Async validators support
- ✅ Schema-based validation

#### Available Validators

```typescript
// Basic validators
isEmail(value)
isRequired(value)
minLength(value, min)
maxLength(value, max)
minValue(value, min)
maxValue(value, max)
isUrl(value)
isDate(value)

// Brazilian validators
isCpf(value)
isCnpj(value)
isPhoneBR(value)
isCep(value)

// Advanced validators
isStrongPassword(value)
isCreditCard(value)
matches(value, pattern)

// Formatting
formatCpf(value)
formatCnpj(value)
formatCep(value)
formatPhone(value)
```

#### Usage

```typescript
import { validateForm, commonSchemas } from '~/utils/validators'

// Using predefined schemas
const result = validateForm(formData, {
  email: commonSchemas.email,
  password: commonSchemas.strongPassword,
  name: commonSchemas.name,
})

if (!result.valid) {
  console.log(result.errors)
}

// Custom validation
const validateUser = (data: any) => {
  const schema = {
    email: [
      createRule(isRequired, 'Email is required'),
      createRule(isEmail, 'Invalid email format'),
    ],
    age: [
      createRule(isRequired, 'Age is required'),
      createRule((value) => minValue(value, 18), 'Must be 18 or older'),
    ],
  }

  return validateForm(data, schema)
}
```

## Composables

### API Composables (`composables/useApi.ts`)

Reactive API calls with loading states, error handling, and caching.

#### Features

- ✅ Automatic loading states
- ✅ Error handling
- ✅ Type-safe responses
- ✅ Pagination support
- ✅ Auto-refresh capability
- ✅ Request caching
- ✅ Optimistic updates

#### Usage

```typescript
import { useApiGet, useApiPost, usePaginatedApi } from '~/composables'

// Simple GET request
const { data, error, loading, execute } = useApiGet<User[]>('/api/users')

// POST request
const { data, error, loading, execute } = useApiPost<User>('/api/users', {
  name: 'John',
  email: 'john@example.com',
})

// Pagination
const {
  data,
  loading,
  page,
  perPage,
  total,
  fetch,
  nextPage,
  prevPage,
} = usePaginatedApi<User>('/api/users')

// Auto-refresh
const { data, loading, start, stop, isActive } = useAutoRefresh(
  () => $fetch('/api/dashboard'),
  30000 // Refresh every 30 seconds
)

// Cache
const { data, execute, invalidate } = useCachedApi(
  'users',
  () => get<User[]>('/api/users'),
  60000 // 1 minute cache
)
```

### Auth Composables (`composables/useAuth.ts`)

Authentication management with Pinia store integration.

#### Features

- ✅ Login/logout
- ✅ Token management
- ✅ User state
- ✅ Role-based access
- ✅ Password reset
- ✅ Two-factor authentication
- ✅ Auth guards
- ✅ Middleware integration

#### Usage

```typescript
import { useAuth, useLogin, useAuthGuard } from '~/composables'

// Main auth composable
const {
  user,
  tenant,
  isAuthenticated,
  login,
  logout,
  fetchUser,
  hasRole,
  isAdmin,
} = useAuth()

// Login
const { execute, error, loading } = useLogin()
const success = await execute({ email: 'user@example.com', password: 'password' })

// Auth guard
const { check } = useAuthGuard('admin')
if (!check()) {
  // Redirect or show error
}

// Password reset
const { requestReset, resetPassword } = usePasswordReset()
await requestReset('user@example.com')
await resetPassword(token, 'newPassword', 'newPassword')

// 2FA
const { enable, verify, disable } = useTwoFactor()
await enable('totp')
```

### Theme Composables (`composables/useTheme.ts`)

Dark/light theme management with custom colors.

#### Features

- ✅ Light/dark mode
- ✅ System preference detection
- ✅ Custom color themes
- ✅ Preset themes
- ✅ Theme persistence
- ✅ Smooth transitions
- ✅ CSS custom properties

#### Usage

```typescript
import { useTheme, useDarkMode, usePresetThemes } from '~/composables'

// Main theme composable
const {
  mode,
  colors,
  effectiveTheme,
  isDark,
  setMode,
  setColors,
  toggleMode,
} = useTheme()

// Dark mode toggle
const { enabled, toggle } = useDarkMode()

// Preset themes
const { presets, applyPreset } = usePresetThemes()
applyPreset(presets[1]) // Apply dark theme

// Custom colors
setColors({
  primary: '#3b82f6',
  secondary: '#8b5cf6',
})
```

### i18n Composables (`composables/useI18n.ts`)

Internationalization with translation support and locale formatting.

#### Features

- ✅ Multi-language support
- ✅ Nested translations
- ✅ Parameter interpolation
- ✅ Pluralization
- ✅ Locale detection
- ✅ Date/number formatting
- ✅ RTL support

#### Usage

```typescript
import { useI18n, useTranslation } from '~/composables'

// Main i18n composable
const {
  currentLocale,
  setLocale,
  t,
  tp,
  localeInfo,
  isRTL,
} = useI18n()

// Translation
t('auth.login') // "Login"
t('validation.minLength', { min: 8 }) // "Minimum 8 characters"

// Pluralization
tp('item.count', 1) // "1 item"
tp('item.count', 5) // "5 items"

// Date formatting
const { formatDate, formatTime, formatDateTime } = useDateFormat()
formatDate(new Date()) // "6 de dezembro de 2025"

// Number formatting
const { formatNumber, formatCurrency, formatPercent } = useNumberFormat()
formatCurrency(1000, 'BRL') // "R$ 1.000,00"
```

### Toast Composables (`composables/useToast.ts`)

Notification system with various types and features.

#### Features

- ✅ Multiple toast types (success, error, warning, info, loading)
- ✅ Persistent toasts
- ✅ Action buttons
- ✅ Auto-dismiss
- ✅ Queue management
- ✅ Batch notifications
- ✅ Promise wrappers

#### Usage

```typescript
import { useToast, useToastAsync } from '~/composables'

// Basic toasts
const { success, error, warning, info, loading } = useToast()

success('Success!', 'Operation completed successfully')
error('Error!', 'Something went wrong')
warning('Warning!', 'Check your input')
info('Info', 'New message')

// Loading toast
const toastId = loading('Loading...', 'Please wait')
// Later...
resolve(toastId, 'Success!', 'Done!')
// Or...
reject(toastId, 'Error!', 'Failed!')

// Async wrapper
const { execute } = useToastAsync()
await execute(
  () => $fetch('/api/users'),
  {
    loadingTitle: 'Creating user...',
    successTitle: 'Success!',
    errorTitle: 'Error!',
  }
)

// Batch notifications
const { batch } = useToastBatch()
batch([
  { type: 'success', title: 'User created' },
  { type: 'error', title: 'Email failed' },
])
```

## Integration Examples

### Complete Page Example

```typescript
<script setup lang="ts">
import { useApiGet } from '~/composables'
import { useAuth } from '~/composables'
import { useToast } from '~/composables'
import { useI18n } from '~/composables'
import { formatDate } from '~/utils/helpers'
import { commonSchemas } from '~/utils/validators'

// Composables
const { t } = useI18n()
const { user, isAdmin } = useAuth()
const { success, error } = useToast()

// API call
const { data: users, loading, execute } = useApiGet<User[]>('/api/users')

// Methods
const refreshUsers = async () => {
  await execute()
}

// Lifecycle
onMounted(() => {
  refreshUsers()
})
</script>

<template>
  <div>
    <h1>{{ t('nav.users') }}</h1>

    <UCard v-if="loading">
      <USkeleton class="h-4 w-full" />
    </UCard>

    <UCard v-else>
      <UTable :data="users" />

      <UButton @click="refreshUsers">
        {{ t('common.refresh') }}
      </UButton>
    </UCard>
  </div>
</template>
```

### Form Validation Example

```typescript
<script setup lang="ts">
import { ref } from 'vue'
import { validateForm, commonSchemas, createRule } from '~/utils/validators'
import { useToast } from '~/composables'

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = ref<Record<string, string[]>>({})
const { success, error } = useToast()

const validateFormData = () => {
  const schema = {
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.strongPassword,
    confirmPassword: [
      createRule((value) => value === form.value.password, 'Passwords do not match'),
    ],
  }

  const result = validateForm(form.value, schema)
  errors.value = {}

  if (!result.valid) {
    result.errors.forEach((err) => {
      if (!errors.value[err.field]) {
        errors.value[err.field] = []
      }
      errors.value[err.field].push(err.message)
    })
    return false
  }

  return true
}

const submit = async () => {
  if (!validateFormData()) {
    error('Validation failed', 'Please check your input')
    return
  }

  try {
    await $fetch('/api/register', {
      method: 'POST',
      body: form.value,
    })
    success('Success!', 'Account created')
  } catch (err) {
    error('Error!', (err as Error).message)
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <UFormGroup label="Name" :error="errors.name?.[0]">
      <UInput v-model="form.name" />
    </UFormGroup>

    <UFormGroup label="Email" :error="errors.email?.[0]">
      <UInput v-model="form.email" type="email" />
    </UFormGroup>

    <UFormGroup label="Password" :error="errors.password?.[0]">
      <UInput v-model="form.password" type="password" />
    </UFormGroup>

    <UButton type="submit">Register</UButton>
  </form>
</template>
```

## Best Practices

1. **Always use composables** - They provide reactive state and automatic cleanup
2. **Handle errors** - Always handle errors in try/catch blocks or use error states
3. **Use TypeScript** - All utilities are fully typed for better developer experience
4. **Cache wisely** - Use caching for data that doesn't change frequently
5. **Validate early** - Use validators on the client side for better UX
6. **Use toast notifications** - Provide feedback for all user actions
7. **Follow naming conventions** - Use descriptive names for keys and variables

## Migration from Vue 2

If you're migrating from a Vue 2 base-vuejs setup:

1. Replace Vuex stores with Pinia stores (already done)
2. Replace mixins with composables (provided in this layer)
3. Use `script setup` syntax for better performance
4. Replace `this.$http` with composables from `useApi`
5. Replace global filters with helper functions

## Performance Tips

1. **Lazy load composables** - Only load composables when needed
2. **Use shallowRef** - For large data sets, use shallowRef for better performance
3. **Debounce user input** - Use debounce for search inputs
4. **Cache API responses** - Use the caching composable for frequently accessed data
5. **Use Suspense** - For better loading states with async components

## Troubleshooting

### Common Issues

1. **Token not being sent**
   - Check if `localStorage` has the token
   - Verify the request interceptor is working
   - Ensure the token is not expired

2. **Type errors**
   - Make sure to import types from the correct files
   - Check that your TypeScript configuration is correct

3. **Composables not reactive**
   - Ensure you're using `ref()` or `reactive()` for state
   - Use `useState()` for SSR-compatible reactive state

4. **Theme not persisting**
   - Check if `localStorage` is available (only on client side)
   - Verify the watchEffect is set up correctly

## Contributing

When adding new utilities or composables:

1. Add TypeScript types
2. Include JSDoc documentation
3. Add error handling
4. Follow the existing patterns
5. Add tests if applicable
6. Update this documentation

## License

This API layer is part of the Neo Stack platform.
