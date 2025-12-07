/**
 * Toast Composables for Neo Stack
 * Notification system using Composition API
 */

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

export interface ToastOptions {
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: ToastAction[]
}

/**
 * Default toast durations (in milliseconds)
 */
const DEFAULT_DURATIONS = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
  loading: Infinity,
} as const

/**
 * Main toast composable
 */
export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  /**
   * Show toast notification
   */
  const show = (type: ToastType, options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const duration = options.duration ?? DEFAULT_DURATIONS[type]

    const toast: Toast = {
      id,
      type,
      title: options.title,
      message: options.message,
      duration,
      persistent: options.persistent ?? false,
      actions: options.actions,
      timestamp: Date.now(),
    }

    toasts.value.push(toast)

    // Auto dismiss if not persistent and has duration
    if (!toast.persistent && duration !== Infinity) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }

  /**
   * Show success toast
   */
  const success = (title: string, message?: string, options?: Partial<ToastOptions>): string => {
    return show('success', {
      title,
      message,
      ...options,
    })
  }

  /**
   * Show error toast
   */
  const error = (title: string, message?: string, options?: Partial<ToastOptions>): string => {
    return show('error', {
      title,
      message,
      duration: options?.duration ?? DEFAULT_DURATIONS.error,
      ...options,
    })
  }

  /**
   * Show warning toast
   */
  const warning = (title: string, message?: string, options?: Partial<ToastOptions>): string => {
    return show('warning', {
      title,
      message,
      ...options,
    })
  }

  /**
   * Show info toast
   */
  const info = (title: string, message?: string, options?: Partial<ToastOptions>): string => {
    return show('info', {
      title,
      message,
      ...options,
    })
  }

  /**
   * Show loading toast (persistent until manually dismissed)
   */
  const loading = (title: string, message?: string, options?: Partial<ToastOptions>): string => {
    return show('loading', {
      title,
      message,
      persistent: true,
      duration: Infinity,
      ...options,
    })
  }

  /**
   * Dismiss toast by ID
   */
  const dismiss = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  /**
   * Clear all toasts
   */
  const clear = () => {
    toasts.value = []
  }

  /**
   * Update existing toast
   */
  const update = (id: string, updates: Partial<ToastOptions> & { type?: ToastType }) => {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index !== -1) {
      toasts.value[index] = {
        ...toasts.value[index],
        ...updates,
      }
    }
  }

  /**
   * Convert loading toast to success
   */
  const resolve = (id: string, title?: string, message?: string) => {
    update(id, {
      type: 'success',
      title: title || 'Sucesso',
      message,
      persistent: false,
    })

    // Auto dismiss after delay
    setTimeout(() => {
      dismiss(id)
    }, DEFAULT_DURATIONS.success)
  }

  /**
   * Convert loading toast to error
   */
  const reject = (id: string, title?: string, message?: string) => {
    update(id, {
      type: 'error',
      title: title || 'Erro',
      message,
      persistent: false,
    })

    // Auto dismiss after delay
    setTimeout(() => {
      dismiss(id)
    }, DEFAULT_DURATIONS.error)
  }

  /**
   * Get toast by ID
   */
  const getToast = (id: string): Toast | undefined => {
    return toasts.value.find((toast) => toast.id === id)
  }

  /**
   * Get toasts by type
   */
  const getToastsByType = (type: ToastType): Toast[] => {
    return toasts.value.filter((toast) => toast.type === type)
  }

  /**
   * Check if there are active toasts
   */
  const hasToasts = computed(() => toasts.value.length > 0)

  /**
   * Get latest toast
   */
  const latest = computed(() => {
    return toasts.value.length > 0 ? toasts.value[toasts.value.length - 1] : null
  })

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    clear,
    update,
    resolve,
    reject,
    getToast,
    getToastsByType,
    hasToasts,
    latest,
  }
}

/**
 * Shorthand composables for common toast types
 */
export const useToastSuccess = () => {
  const { success } = useToast()
  return success
}

export const useToastError = () => {
  const { error } = useToast()
  return error
}

export const useToastWarning = () => {
  const { warning } = useToast()
  return warning
}

export const useToastInfo = () => {
  const { info } = useToast()
  return info
}

export const useToastLoading = () => {
  const { loading } = useToast()
  return loading
}

/**
 * Async operation wrapper with toast
 */
export const useToastAsync = () => {
  const { loading, resolve, error } = useToast()

  const execute = async <T>(
    asyncFn: () => Promise<T>,
    options: {
      loadingTitle?: string
      loadingMessage?: string
      successTitle?: string
      successMessage?: string
      errorTitle?: string
      errorMessage?: string
      showSuccessToast?: boolean
      showErrorToast?: boolean
    }
  ): Promise<T | null> => {
    const toastId = loading(options.loadingTitle || 'Carregando...', options.loadingMessage)

    try {
      const result = await asyncFn()

      if (options.showSuccessToast !== false) {
        resolve(toastId, options.successTitle || 'Sucesso', options.successMessage)
      } else {
        dismiss(toastId)
      }

      return result
    } catch (err) {
      if (options.showErrorToast !== false) {
        reject(
          toastId,
          options.errorTitle || 'Erro',
          options.errorMessage || (err as Error).message
        )
      } else {
        dismiss(toastId)
      }

      throw err
    }
  }

  return {
    execute,
  }
}

/**
 * Global toast configuration
 */
export const useToastConfig = () => {
  const maxToasts = useState<number>('toast-max', () => 5)
  const position = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'>('toast-position', () => 'top-right')
  const enableTransitions = useState<boolean>('toast-transitions', () => true)

  const setMaxToasts = (max: number) => {
    maxToasts.value = Math.max(1, max)
  }

  const setPosition = (pos: typeof position.value) => {
    position.value = pos
  }

  const toggleTransitions = (enabled: boolean) => {
    enableTransitions.value = enabled
  }

  return {
    maxToasts,
    position,
    enableTransitions,
    setMaxToasts,
    setPosition,
    toggleTransitions,
  }
}

/**
 * Toast queue management
 */
export const useToastQueue = () => {
  const { toasts, dismiss, clear } = useToast()
  const { maxToasts } = useToastConfig()

  /**
   * Process queue (remove old toasts if exceeding max)
   */
  const processQueue = () => {
    if (toasts.value.length > maxToasts.value) {
      const toRemove = toasts.value.length - maxToasts.value
      for (let i = 0; i < toRemove; i++) {
        const toast = toasts.value[i]
        if (toast) {
          dismiss(toast.id)
        }
      }
    }
  }

  // Watch for toasts changes and process queue
  watch(
    toasts,
    () => {
      processQueue()
    },
    { deep: true }
  )

  return {
    processQueue,
  }
}

/**
 * Promise-based toast helpers
 */
export const withToast = <T extends any[], R>(
  promiseFn: (...args: T) => Promise<R>,
  options: {
    loadingTitle?: string
    loadingMessage?: string
    successTitle?: string
    successMessage?: string
    errorTitle?: string
    errorMessage?: string
  }
) => {
  return async (...args: T): Promise<R> => {
    const { loading, resolve, error } = useToast()
    const toastId = loading(options.loadingTitle || 'Carregando...', options.loadingMessage)

    try {
      const result = await promiseFn(...args)
      resolve(toastId, options.successTitle || 'Sucesso', options.successMessage)
      return result
    } catch (err) {
      error(toastId, options.errorTitle || 'Erro', options.errorMessage || (err as Error).message)
      throw err
    }
  }
}

/**
 * Batch toast notifications
 */
export const useToastBatch = () => {
  const { success, error, warning, info } = useToast()

  const batch = (notifications: Array<{ type: ToastType; title: string; message?: string }>) => {
    notifications.forEach((notif, index) => {
      setTimeout(() => {
        switch (notif.type) {
          case 'success':
            success(notif.title, notif.message)
            break
          case 'error':
            error(notif.title, notif.message)
            break
          case 'warning':
            warning(notif.title, notif.message)
            break
          case 'info':
            info(notif.title, notif.message)
            break
        }
      }, index * 100)
    })
  }

  return {
    batch,
  }
}
