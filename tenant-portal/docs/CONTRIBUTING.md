# Contributing to API Layer

## Overview

Thank you for your interest in contributing to the Neo Stack API Layer! This document provides guidelines and best practices for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- TypeScript knowledge
- Nuxt 3 experience
- Vue 3 Composition API

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run type checking: `npm run type-check`
5. Run linter: `npm run lint`

## Code Style Guidelines

### TypeScript

- **Always use TypeScript** - No plain JavaScript files
- **Define proper types** - Use interfaces and types for all data structures
- **Avoid `any`** - Use `unknown` or proper types instead
- **Use strict mode** - Enable all TypeScript strict checks

```typescript
// Good
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

const getUser = (id: string): Promise<User> => {
  // implementation
}

// Bad
const getUser = (id: any): Promise<any> => {
  // implementation
}
```

### Naming Conventions

- **Files**: Use kebab-case for file names
  - `use-api.ts` ✓
  - `use_api.ts` ✗

- **Functions**: Use camelCase
  - `getUser` ✓
  - `get_user` ✗

- **Constants**: Use SCREAMING_SNAKE_CASE
  - `DEFAULT_DURATION` ✓
  - `defaultDuration` ✗

- **Types/Interfaces**: Use PascalCase
  - `ApiResponse` ✓
  - `api_response` ✗

- **Composables**: Prefix with `use`
  - `useApi` ✓
  - `api` ✗

### Code Organization

#### File Structure

```
utils/
├── api.ts          # Main API client
├── helpers.ts      # Utility functions
├── validators.ts   # Validation functions
└── index.ts        # Barrel exports

composables/
├── useApi.ts       # API composables
├── useAuth.ts      # Auth composables
├── useTheme.ts     # Theme composables
├── useI18n.ts      # i18n composables
├── useToast.ts     # Toast composables
└── index.ts        # Barrel exports
```

#### Export Patterns

Use named exports and create barrel exports in `index.ts`:

```typescript
// utils/api.ts
export const get = () => { }
export const post = () => { }

// utils/index.ts
export * from './api'
export * from './helpers'
export * from './validators'
```

### Documentation

#### JSDoc Requirements

All public functions must have JSDoc documentation:

```typescript
/**
 * Format a date to locale string
 *
 * @param date - Date to format
 * @param locale - Locale code (default: 'pt-BR')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate(new Date(), 'pt-BR', { year: 'numeric', month: 'long' })
 * // => "6 de dezembro de 2025"
 * ```
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = 'pt-BR',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
): string => {
  // implementation
}
```

#### README Updates

- Update `API_LAYER.md` when adding new features
- Include usage examples
- Document all new functions
- Update type definitions if needed

## Composables Guidelines

### Composition API Best Practices

#### Return Consistent Pattern

All composables should return a consistent object structure:

```typescript
export const useApi = <T = any>(url: string) => {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref<boolean>(false)

  const execute = async () => {
    // implementation
  }

  return {
    data,
    error,
    loading,
    execute,
  }
}
```

#### Reactive State

- Use `ref()` for primitive values
- Use `reactive()` or `ref()` with objects/arrays
- Use `computed()` for derived state
- Use `useState()` for SSR-compatible state

```typescript
// Good
const loading = ref<boolean>(false)
const user = ref<User | null>(null)

// Bad
let loading = false
let user: User | null = null
```

#### Cleanup

Always clean up timers, listeners, etc.:

```typescript
export const useAutoRefresh = (callback: () => Promise<any>, interval: number) => {
  let timer: NodeJS.Timeout | null = null

  const start = () => {
    if (timer) return
    timer = setInterval(callback, interval)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onBeforeUnmount(() => {
    stop()
  })

  return { start, stop }
}
```

## Testing Guidelines

### Test Structure

- Use Vitest for testing
- Place tests in `tests/` directory
- Name test files with `.test.ts` suffix
- Group tests with `describe` blocks

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate } from '~/utils/helpers'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-12-06')
    const result = formatDate(date, 'pt-BR')
    expect(result).toBe('06/12/2025')
  })
})
```

### Test Coverage

Aim for high test coverage, especially for:
- Utility functions
- Validators
- Helpers
- API client logic

## Error Handling

### API Errors

- Always handle API errors gracefully
- Provide meaningful error messages
- Log errors for debugging
- Show user-friendly notifications

```typescript
try {
  const { data } = await get('/api/users')
  return data
} catch (error) {
  console.error('Failed to fetch users:', error)
  throw new Error('Unable to load users. Please try again.')
}
```

### Validation Errors

- Return structured error objects
- Include field names and messages
- Use consistent error format

```typescript
interface ValidationError {
  field: string
  message: string
}

const errors: ValidationError[] = []
errors.push({
  field: 'email',
  message: 'Email is required',
})
```

## Performance Guidelines

### Optimization

- Use `shallowRef` for large data sets
- Implement debouncing for user input
- Cache API responses when appropriate
- Use `useMemo` for expensive computations

```typescript
// Debounced search
const debouncedSearch = debounce(async (query: string) => {
  // search implementation
}, 300)

// Shallow ref for large lists
const users = shallowRef<User[]>([])
```

### Lazy Loading

- Lazy load composables when needed
- Use dynamic imports for heavy components
- Implement code splitting

```typescript
// Lazy load component
const ApiLayerDemo = defineAsyncComponent(() => import('~/components/ApiLayerDemo.vue'))
```

## Accessibility

- Ensure all UI components are accessible
- Provide ARIA labels where needed
- Support keyboard navigation
- Test with screen readers

## Security

### Data Validation

- Validate all user input
- Sanitize data before sending to API
- Use proper TypeScript types

```typescript
const email = form.email.trim().toLowerCase()
if (!isEmail(email)) {
  throw new Error('Invalid email format')
}
```

### Token Handling

- Store tokens securely
- Clear tokens on logout
- Handle token expiration

```typescript
// Store token
localStorage.setItem('auth_token', token)

// Clear token
localStorage.removeItem('auth_token')

// Check expiration
if (isTokenExpired(token)) {
  await logout()
}
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow code style guidelines
   - Add/update tests
   - Update documentation

3. **Run checks**
   ```bash
   npm run type-check
   npm run lint
   npm run test
   ```

4. **Create PR**
   - Use clear title and description
   - Include screenshots for UI changes
   - Link to related issues

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console errors
```

## Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Changelog

Update `CHANGELOG.md` with:
- Version number
- Release date
- List of changes
- Breaking changes (if any)

## Common Patterns

### API Response Handling

```typescript
export const useApi = <T>(url: string) => {
  const { data, error, loading } = useState<ApiResponse<T> | null>(null)

  const execute = async () => {
    try {
      const response = await $fetch<ApiResponse<T>>(url)
      data.value = response
    } catch (err) {
      error.value = err as Error
    }
  }

  return { data, error, loading, execute }
}
```

### Form Validation

```typescript
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validators: Record<keyof T, ValidationRule[]>
) => {
  const values = ref<T>({ ...initialValues })
  const errors = ref<Record<keyof T, string[]>>({} as any)

  const validate = () => {
    const result = validateForm(values.value, validators)
    errors.value = {} as any
    // handle errors
  }

  return { values, errors, validate }
}
```

## Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Composition API Guide](https://vuejs.org/guide/extras/composition-api-faq.html)

## Questions?

If you have questions about contributing, please:
- Open an issue
- Check existing documentation
- Ask in discussions

Thank you for contributing! 🚀
