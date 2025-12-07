/**
 * i18n Composables for Neo Stack
 * Internationalization using Composition API
 */

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

/**
 * Available locales
 */
export const availableLocales: Locale[] = [
  {
    code: 'pt-BR',
    name: 'Português',
    flag: '🇧🇷',
    direction: 'ltr',
  },
  {
    code: 'en-US',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
  },
  {
    code: 'es-ES',
    name: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
  },
]

/**
 * Default translations (fallback)
 */
const defaultTranslations: TranslationDict = {
  'pt-BR': {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      create: 'Criar',
      update: 'Atualizar',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
      yes: 'Sim',
      no: 'Não',
      ok: 'OK',
      close: 'Fechar',
    },
    auth: {
      login: 'Entrar',
      logout: 'Sair',
      register: 'Registrar',
      email: 'E-mail',
      password: 'Senha',
      forgotPassword: 'Esqueceu a senha?',
      rememberMe: 'Lembrar-me',
      loginSuccess: 'Login realizado com sucesso',
      loginError: 'Falha no login',
      logoutSuccess: 'Logout realizado com sucesso',
    },
    nav: {
      dashboard: 'Dashboard',
      users: 'Usuários',
      settings: 'Configurações',
      profile: 'Perfil',
      help: 'Ajuda',
      contact: 'Contato',
    },
    validation: {
      required: 'Campo obrigatório',
      email: 'E-mail inválido',
      minLength: 'Mínimo de {min} caracteres',
      maxLength: 'Máximo de {max} caracteres',
      passwordStrength: 'Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número',
    },
  },
  'en-US': {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      loginSuccess: 'Login successful',
      loginError: 'Login failed',
      logoutSuccess: 'Logout successful',
    },
    nav: {
      dashboard: 'Dashboard',
      users: 'Users',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      contact: 'Contact',
    },
    validation: {
      required: 'Field is required',
      email: 'Invalid email',
      minLength: 'Minimum {min} characters',
      maxLength: 'Maximum {max} characters',
      passwordStrength: 'Password must have at least 8 characters, 1 uppercase, 1 lowercase, 1 number',
    },
  },
  'es-ES': {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      update: 'Actualizar',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      yes: 'Sí',
      no: 'No',
      ok: 'OK',
      close: 'Cerrar',
    },
    auth: {
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      register: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      rememberMe: 'Recordarme',
      loginSuccess: 'Inicio de sesión exitoso',
      loginError: 'Error al iniciar sesión',
      logoutSuccess: 'Cierre de sesión exitoso',
    },
    nav: {
      dashboard: 'Panel',
      users: 'Usuarios',
      settings: 'Configuración',
      profile: 'Perfil',
      help: 'Ayuda',
      contact: 'Contacto',
    },
    validation: {
      required: 'Campo obligatorio',
      email: 'Correo electrónico inválido',
      minLength: 'Mínimo {min} caracteres',
      maxLength: 'Máximo {max} caracteres',
      passwordStrength: 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número',
    },
  },
}

/**
 * Main i18n composable
 */
export const useI18n = () => {
  // State
  const currentLocale = useState<string>('i18n-locale', () => 'pt-BR')
  const translations = useState<TranslationDict>('i18n-translations', () => ({ ...defaultTranslations }))
  const fallbackLocale = 'pt-BR'

  // Initialize locale
  if (process.client) {
    const savedLocale = localStorage.getItem('i18n-locale')
    if (savedLocale && availableLocales.find((l) => l.code === savedLocale)) {
      currentLocale.value = savedLocale
    } else {
      // Detect browser locale
      const browserLocale = navigator.language
      const matched = availableLocales.find((l) => l.code === browserLocale)
      if (matched) {
        currentLocale.value = matched.code
      }
    }
  }

  /**
   * Set locale
   */
  const setLocale = (locale: string) => {
    const exists = availableLocales.find((l) => l.code === locale)
    if (exists) {
      currentLocale.value = locale
      if (process.client) {
        localStorage.setItem('i18n-locale', locale)
        // Update document direction
        document.documentElement.dir = exists.direction
        document.documentElement.lang = locale
      }
    }
  }

  /**
   * Get nested translation value
   */
  const getNestedValue = (obj: Translation, path: string): string => {
    return path.split('.').reduce((acc, key) => {
      return acc && acc[key] !== undefined ? acc[key] : null
    }, obj) as string
  }

  /**
   * Translate key with interpolation
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const locale = currentLocale.value
    const dict = translations.value[locale] || translations.value[fallbackLocale]
    let translation = getNestedValue(dict, key)

    // Fallback to fallback locale
    if (!translation && locale !== fallbackLocale) {
      const fallbackDict = translations.value[fallbackLocale]
      translation = getNestedValue(fallbackDict, key)
    }

    // If still not found, return the key
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`)
      return key
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(value))
      })
    }

    return translation
  }

  /**
   * Translate to plural form
   */
  const tp = (key: string, count: number, params?: Record<string, string | number>): string => {
    const locale = currentLocale.value
    const dict = translations.value[locale] || translations.value[fallbackLocale]
    let translation = getNestedValue(dict, `${key}.${count === 1 ? 'one' : 'other'}`)

    // Fallback to simple key
    if (!translation) {
      translation = getNestedValue(dict, key)
    }

    // Fallback to key if not found
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`)
      return key
    }

    // Add count to params
    const paramsWithCount = { ...params, count }

    // Replace parameters
    Object.entries(paramsWithCount).forEach(([param, value]) => {
      translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(value))
    })

    return translation
  }

  /**
   * Check if translation exists
   */
  const exists = (key: string): boolean => {
    const locale = currentLocale.value
    const dict = translations.value[locale] || translations.value[fallbackLocale]
    return !!getNestedValue(dict, key)
  }

  /**
   * Get current locale info
   */
  const localeInfo = computed(() => {
    return availableLocales.find((l) => l.code === currentLocale.value) || availableLocales[0]
  })

  /**
   * Check if locale is RTL
   */
  const isRTL = computed(() => localeInfo.value.direction === 'rtl')

  /**
   * Add translation
   */
  const addTranslation = (locale: string, translation: Translation) => {
    translations.value[locale] = {
      ...translations.value[locale],
      ...translation,
    }
  }

  /**
   * Load translations from API
   */
  const loadTranslations = async (locale: string) => {
    try {
      const { data } = await $fetch<{ translations: Translation }>(`/api/i18n/${locale}`)
      translations.value[locale] = data.translations
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error)
    }
  }

  return {
    currentLocale,
    translations,
    setLocale,
    t,
    tp,
    exists,
    localeInfo,
    isRTL,
    addTranslation,
    loadTranslations,
  }
}

/**
 * Shorthand composable for translation
 */
export const useTranslation = () => {
  const { t, tp } = useI18n()
  return { t, tp }
}

/**
 * Locale selector composable
 */
export const useLocaleSelector = () => {
  const { currentLocale, setLocale, localeInfo } = useI18n()
  const { locales } = { locales: availableLocales }

  const selectLocale = (localeCode: string) => {
    setLocale(localeCode)
  }

  return {
    currentLocale,
    locales,
    localeInfo,
    selectLocale,
  }
}

/**
 * Date formatting composable
 */
export const useDateFormat = () => {
  const { currentLocale } = useI18n()

  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const locale = currentLocale.value

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj)
  }

  const formatTime = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const locale = currentLocale.value

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    }

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj)
  }

  const formatDateTime = (
    date: Date | string | number,
    dateOptions?: Intl.DateTimeFormatOptions,
    timeOptions?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const locale = currentLocale.value

    const defaultDateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    const defaultTimeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    }

    const dateStr = new Intl.DateTimeFormat(locale, { ...defaultDateOptions, ...dateOptions }).format(dateObj)
    const timeStr = new Intl.DateTimeFormat(locale, { ...defaultTimeOptions, ...timeOptions }).format(dateObj)

    return `${dateStr} ${timeStr}`
  }

  return {
    formatDate,
    formatTime,
    formatDateTime,
  }
}

/**
 * Number formatting composable
 */
export const useNumberFormat = () => {
  const { currentLocale } = useI18n()

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(currentLocale.value, options).format(value)
  }

  const formatCurrency = (
    value: number,
    currency: string = 'BRL',
    options?: Intl.NumberFormatOptions
  ): string => {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
    }

    return new Intl.NumberFormat(currentLocale.value, { ...defaultOptions, ...options }).format(value)
  }

  const formatPercent = (value: number, options?: Intl.NumberFormatOptions): string => {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'percent',
    }

    return new Intl.NumberFormat(currentLocale.value, { ...defaultOptions, ...options }).format(value)
  }

  return {
    formatNumber,
    formatCurrency,
    formatPercent,
  }
}
