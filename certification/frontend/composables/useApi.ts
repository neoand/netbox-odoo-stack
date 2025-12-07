/**
 * API Composables for Neo Stack
 * Reactive API calls using Composition API
 */

import { get, post, put, patch, del, upload, download, type ApiResponse, type ApiError, type RequestConfig } from '~/utils/api'

export interface UseApiReturn<T> {
  data: Ref<T | null>
  error: Ref<ApiError | null>
  loading: Ref<boolean>
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

/**
 * Generic API composable with loading and error states
 */
export const useApi = <T = any>(
  requestFn: () => Promise<ApiResponse<T>>,
  options?: {
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: ApiError) => void
  }
): UseApiReturn<T> => {
  const data = ref<T | null>(null)
  const error = ref<ApiError | null>(null)
  const loading = ref<boolean>(options?.immediate ?? false)

  const execute = async (): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await requestFn()
      data.value = response.data
      options?.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError
      options?.onError?.(apiError)
      console.error('API Error:', apiError)
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    error.value = null
    loading.value = false
  }

  // Execute immediately if configured
  if (options?.immediate) {
    execute()
  }

  return {
    data,
    error,
    loading,
    execute,
    reset,
  }
}

/**
 * GET request composable
 */
export const useApiGet = <T = any>(
  url: string,
  config?: RequestConfig
): UseApiReturn<T> => {
  const requestFn = () => get<T>(url, config)

  return useApi<T>(requestFn, {
    immediate: true,
  })
}

/**
 * POST request composable
 */
export const useApiPost = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): UseApiReturn<T> => {
  const requestFn = () => post<T>(url, data, config)

  return useApi<T>(requestFn, {
    immediate: false,
  })
}

/**
 * PUT request composable
 */
export const useApiPut = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): UseApiReturn<T> => {
  const requestFn = () => put<T>(url, data, config)

  return useApi<T>(requestFn, {
    immediate: false,
  })
}

/**
 * PATCH request composable
 */
export const useApiPatch = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): UseApiReturn<T> => {
  const requestFn = () => patch<T>(url, data, config)

  return useApi<T>(requestFn, {
    immediate: false,
  })
}

/**
 * DELETE request composable
 */
export const useApiDelete = <T = any>(
  url: string,
  config?: RequestConfig
): UseApiReturn<T> => {
  const requestFn = () => del<T>(url, config)

  return useApi<T>(requestFn, {
    immediate: false,
  })
}

/**
 * Upload file composable
 */
export const useApiUpload = <T = any>(
  url: string,
  formData: FormData,
  config?: RequestConfig
): UseApiReturn<T> => {
  const requestFn = () => upload<T>(url, formData, config)

  return useApi<T>(requestFn, {
    immediate: false,
  })
}

/**
 * Download file composable
 */
export const useApiDownload = (
  url: string,
  filename?: string,
  config?: RequestConfig
): {
  loading: Ref<boolean>
  error: Ref<ApiError | null>
  execute: () => Promise<void>
  reset: () => void
} => {
  const loading = ref<boolean>(false)
  const error = ref<ApiError | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      await download(url, filename, config)
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError
      console.error('Download Error:', apiError)
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
  }

  return {
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * Paginated API composable
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export const usePaginatedApi = <T = any>(
  url: string,
  params?: Record<string, any>
): {
  data: Ref<PaginatedResponse<T> | null>
  error: Ref<ApiError | null>
  loading: Ref<boolean>
  page: Ref<number>
  perPage: Ref<number>
  total: Ref<number>
  fetch: () => Promise<void>
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  reset: () => void
} => {
  const data = ref<PaginatedResponse<T> | null>(null)
  const error = ref<ApiError | null>(null)
  const loading = ref<boolean>(false)
  const page = ref<number>(1)
  const perPage = ref<number>(10)
  const total = ref<number>(0)

  const fetch = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await get<PaginatedResponse<T>>(url, {
        params: {
          ...params,
          page: page.value,
          per_page: perPage.value,
        },
      })
      data.value = response.data
      total.value = response.data.total
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError
      console.error('Paginated API Error:', apiError)
    } finally {
      loading.value = false
    }
  }

  const nextPage = () => {
    if (data.value && page.value < data.value.totalPages) {
      page.value++
      fetch()
    }
  }

  const prevPage = () => {
    if (page.value > 1) {
      page.value--
      fetch()
    }
  }

  const goToPage = (pageNum: number) => {
    if (data.value && pageNum >= 1 && pageNum <= data.value.totalPages) {
      page.value = pageNum
      fetch()
    }
  }

  const reset = () => {
    data.value = null
    error.value = null
    loading.value = false
    page.value = 1
    total.value = 0
  }

  return {
    data,
    error,
    loading,
    page,
    perPage,
    total,
    fetch,
    nextPage,
    prevPage,
    goToPage,
    reset,
  }
}

/**
 * Auto-refresh composable
 */
export const useAutoRefresh = <T>(
  callback: () => Promise<T>,
  interval: number = 30000
): {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  refresh: () => Promise<void>
  start: () => void
  stop: () => void
  isActive: Ref<boolean>
} => {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref<boolean>(false)
  const isActive = ref<boolean>(false)
  let timer: NodeJS.Timeout | null = null

  const refresh = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await callback()
    } catch (err) {
      error.value = err as Error
      console.error('Auto-refresh error:', err)
    } finally {
      loading.value = false
    }
  }

  const start = () => {
    if (timer) return
    isActive.value = true
    refresh()
    timer = setInterval(refresh, interval)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isActive.value = false
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    stop()
  })

  return {
    data,
    error,
    loading,
    refresh,
    start,
    stop,
    isActive,
  }
}

/**
 * Cache composable
 */
export const useCachedApi = <T = any>(
  key: string,
  requestFn: () => Promise<ApiResponse<T>>,
  ttl: number = 60000
): UseApiReturn<T> & { invalidate: () => void } => {
  const cache = useState<{ data: T; timestamp: number } | null>(`cache:${key}`, () => null)

  const api = useApi<T>(requestFn, {
    immediate: false,
  })

  const execute = async (): Promise<T | null> => {
    const now = Date.now()

    // Return cached data if valid
    if (cache.value && now - cache.value.timestamp < ttl) {
      api.data.value = cache.value.data
      return cache.value.data
    }

    // Fetch fresh data
    const result = await api.execute()

    // Update cache
    if (result) {
      cache.value = {
        data: result,
        timestamp: now,
      }
    }

    return result
  }

  const invalidate = () => {
    cache.value = null
  }

  return {
    ...api,
    execute,
    invalidate,
  }
}
