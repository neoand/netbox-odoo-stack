# Quick Start Guide

## Installation

The API layer is already installed in your Nuxt 3 project. If you need to set it up from scratch:

```bash
# Install dependencies
npm install axios @pinia/nuxt @vueuse/nuxt

# Install dev dependencies
npm install -D typescript vitest @typescript-eslint/eslint-plugin
```

## Usage

### 1. API Calls

```typescript
// Get data
const { data, loading, error, execute } = useApiGet<User[]>('/api/users')
execute()

// Post data
const { data, execute } = useApiPost<User>('/api/users', { name: 'John' })
execute()
```

### 2. Authentication

```typescript
// In your component
const { user, isAuthenticated, login, logout } = useAuth()

// Login
await login({ email: 'user@example.com', password: 'password' })

// Logout
await logout()
```

### 3. Toast Notifications

```typescript
const { success, error, warning, info } = useToast()

success('Success!', 'Operation completed')
error('Error!', 'Something went wrong')
```

### 4. Form Validation

```typescript
import { validateForm, commonSchemas } from '~/utils/validators'

const result = validateForm(formData, {
  email: commonSchemas.email,
  password: commonSchemas.strongPassword,
})
```

### 5. Theme Switching

```typescript
const { toggleMode } = useDarkMode()
toggleMode()
```

### 6. Internationalization

```typescript
const { t } = useI18n()
t('auth.login') // "Login"
t('common.save') // "Save"
```

## Common Patterns

### Page with API Call

```vue
<script setup lang="ts">
const { data, loading, execute } = useApiGet<User[]>('/api/users')

onMounted(() => {
  execute()
})
</script>

<template>
  <div>
    <UCard v-if="loading">
      <USkeleton class="h-4 w-full" />
    </UCard>

    <UCard v-else>
      <UTable :data="data" />
    </UCard>
  </div>
</template>
```

### Form with Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validateForm, commonSchemas } from '~/utils/validators'

const form = ref({
  email: '',
  password: '',
})

const errors = ref<Record<string, string[]>>({})
const { success, error } = useToast()

const submit = async () => {
  const result = validateForm(form.value, {
    email: commonSchemas.email,
    password: commonSchemas.strongPassword,
  })

  if (!result.valid) {
    errors.value = result.errors.reduce((acc, err) => {
      if (!acc[err.field]) acc[err.field] = []
      acc[err.field].push(err.message)
      return acc
    }, {} as Record<string, string[]>)
    return
  }

  try {
    await $fetch('/api/login', { method: 'POST', body: form.value })
    success('Success!', 'Logged in')
  } catch (err) {
    error('Error!', 'Login failed')
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <UFormGroup label="Email" :error="errors.email?.[0]">
      <UInput v-model="form.email" type="email" />
    </UFormGroup>

    <UFormGroup label="Password" :error="errors.password?.[0]">
      <UInput v-model="form.password" type="password" />
    </UFormGroup>

    <UButton type="submit">Login</UButton>
  </form>
</template>
```

### Protected Route

```vue
<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  roles: ['admin'],
})
</script>
```

## API Reference

### Composables

| Composable | Purpose | Key Methods |
|------------|---------|-------------|
| `useApi` | Generic API calls | `get`, `post`, `put`, `del`, `upload` |
| `useAuth` | Authentication | `login`, `logout`, `fetchUser`, `hasRole` |
| `useTheme` | Theme management | `setMode`, `setColors`, `toggleMode` |
| `useI18n` | Internationalization | `t`, `tp`, `setLocale` |
| `useToast` | Notifications | `success`, `error`, `warning`, `info` |

### Utils

| Utility | Purpose | Example |
|---------|---------|---------|
| `helpers` | Helper functions | `formatDate()`, `formatCurrency()` |
| `validators` | Form validation | `validateForm()`, `isEmail()` |
| `api` | HTTP client | `get()`, `post()`, `upload()` |

## Tips

1. **Always handle errors** - Use try/catch or error states
2. **Use loading states** - Show spinners during API calls
3. **Validate early** - Client-side validation improves UX
4. **Use TypeScript** - All types are provided
5. **Follow patterns** - Use the provided composables
6. **Check documentation** - See `docs/API_LAYER.md` for details

## Troubleshooting

### Token not being sent

Check if the token exists in localStorage:
```javascript
localStorage.getItem('auth_token')
```

### Type errors

Make sure to import types:
```typescript
import type { User } from '~/types/api-layer'
```

### Composables not reactive

Use `ref()` or `reactive()`:
```typescript
const data = ref<any[]>([])
```

## Support

- 📚 Documentation: `docs/API_LAYER.md`
- 🤝 Contributing: `docs/CONTRIBUTING.md`
- 📝 Examples: `components/ApiLayerDemo.vue`
- 🧪 Tests: `tests/`

## Next Steps

1. Read the full documentation: `docs/API_LAYER.md`
2. Check out the demo: `/api-layer`
3. Start building your app!
