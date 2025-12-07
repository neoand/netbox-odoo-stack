/**
 * Global TypeScript types for API Layer
 */

declare module '#app' {
  interface NuxtApp {
    $api: import('~/utils/api').default
    $toast: ReturnType<typeof useToast>
    $i18n: ReturnType<typeof useI18n>
    $theme: ReturnType<typeof useTheme>
    $auth: ReturnType<typeof useAuth>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: import('~/utils/api').default
    $toast: ReturnType<typeof useToast>
    $i18n: ReturnType<typeof useI18n>
    $theme: ReturnType<typeof useTheme>
    $auth: ReturnType<typeof useAuth>
  }
}

export {}

// Utility type helpers
export type Nullable<T> = T | null
export type Undefinedable<T> = T | undefined
export type Optional<T> = T | null | undefined

// API Response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  status?: number
}

export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  tenant_id: string
  avatar?: string
  created_at?: string
  updated_at?: string
}

// Tenant types
export interface Tenant {
  tenant_id: string
  name: string
  slug: string
  email: string
  status: string
  created_at?: string
  updated_at?: string
}

// Validation types
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: ToastAction[]
  timestamp: number
}

export interface ToastAction {
  label: string
  handler: () => void
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

// i18n types
export interface Locale {
  code: string
  name: string
  flag: string
  direction: 'ltr' | 'rtl'
}

export interface Translation {
  [key: string]: string | Translation
}

export interface TranslationDict {
  [locale: string]: Translation
}
