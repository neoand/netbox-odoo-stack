/**
 * Centralized HTTP Client for Neo Stack
 * Inspired by base-vuejs architecture, adapted for Nuxt 3
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

// Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  status?: number
}

export interface ApiError {
  message: string
  status?: number
  code?: string | number
  details?: any
}

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  showToast?: boolean
  toastMessage?: string
}

export interface ApiClientOptions {
  baseURL: string
  timeout?: number
  withCredentials?: boolean
  defaultHeaders?: Record<string, string>
}

/**
 * Create and configure axios instance
 */
const createApiClient = (options: ApiClientOptions): AxiosInstance => {
  const client = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout || 30000,
    withCredentials: options.withCredentials || true,
    headers: {
      'Content-Type': 'application/json',
      ...options.defaultHeaders,
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      if (!config.skipAuth && process.client) {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }

      // Add request timestamp
      config.metadata = { startTime: new Date() }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Calculate request duration
      const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime()
      console.debug(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)

      return response
    },
    (error: AxiosError) => {
      const status = error.response?.status
      const message = error.response?.data?.message || error.message || 'An error occurred'

      // Handle specific error cases
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        if (process.client) {
          localStorage.removeItem('auth_token')
          navigateTo('/auth/login')
        }
      } else if (status === 403) {
        // Forbidden
        console.error('[API] Forbidden:', message)
      } else if (status === 404) {
        // Not found
        console.error('[API] Not found:', message)
      } else if (status === 500) {
        // Server error
        console.error('[API] Server error:', message)
      }

      return Promise.reject({
        message,
        status,
        code: error.code,
        details: error.response?.data,
      } as ApiError)
    }
  )

  return client
}

/**
 * Initialize API client with runtime config
 */
const initApiClient = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8000'

  return createApiClient({
    baseURL: apiBase,
    timeout: 30000,
    withCredentials: true,
  })
}

// Create singleton instance
let apiClient: AxiosInstance | null = null

/**
 * Get API client instance (singleton)
 */
export const getApiClient = (): AxiosInstance => {
  if (!apiClient) {
    apiClient = initApiClient()
  }
  return apiClient
}

/**
 * Generic request method
 */
export const request = async <T = any>(config: RequestConfig): Promise<ApiResponse<T>> => {
  try {
    const client = getApiClient()
    const response = await client.request<ApiResponse<T>>(config)
    return response.data
  } catch (error) {
    throw error as ApiError
  }
}

/**
 * GET request
 */
export const get = async <T = any>(
  url: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({
    method: 'GET',
    url,
    ...config,
  })
}

/**
 * POST request
 */
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({
    method: 'POST',
    url,
    data,
    ...config,
  })
}

/**
 * PUT request
 */
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({
    method: 'PUT',
    url,
    data,
    ...config,
  })
}

/**
 * PATCH request
 */
export const patch = async <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({
    method: 'PATCH',
    url,
    data,
    ...config,
  })
}

/**
 * DELETE request
 */
export const del = async <T = any>(
  url: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({
    method: 'DELETE',
    url,
    ...config,
  })
}

/**
 * Upload file
 */
export const upload = async <T = any>(
  url: string,
  formData: FormData,
  config?: RequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
    ...config,
  })
}

/**
 * Download file
 */
export const download = async (
  url: string,
  filename?: string,
  config?: RequestConfig
): Promise<void> => {
  try {
    const client = getApiClient()
    const response = await client.get(url, {
      ...config,
      responseType: 'blob',
    })

    // Create blob link to download
    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename || 'download'
    link.click()
    window.URL.revokeObjectURL(link.href)
  } catch (error) {
    throw error as ApiError
  }
}

// Export default client instance
export default getApiClient()
