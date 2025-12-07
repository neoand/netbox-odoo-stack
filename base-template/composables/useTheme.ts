/**
 * Theme Composables for Neo Stack
 * Dark/light theme management using Composition API
 */

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

export interface ThemeConfig {
  mode: Theme
  colors: ThemeColors
}

/**
 * Default theme colors
 */
const defaultLightColors: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  background: '#ffffff',
  surface: '#f9fafb',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

const defaultDarkColors: ThemeColors = {
  primary: '#60a5fa',
  secondary: '#a78bfa',
  accent: '#f472b6',
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
}

/**
 * Get effective theme (resolves system preference if mode is 'system')
 */
const getEffectiveTheme = (mode: Theme): 'light' | 'dark' => {
  if (mode === 'system') {
    if (process.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }
  return mode
}

/**
 * Apply theme to document
 */
const applyTheme = (mode: Theme, colors: ThemeColors) => {
  if (!process.client) return

  const effectiveTheme = getEffectiveTheme(mode)
  const root = document.documentElement

  // Apply theme mode class
  root.classList.remove('light', 'dark')
  root.classList.add(effectiveTheme)

  // Apply CSS custom properties
  const cssVars = {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-background': colors.background,
    '--color-surface': colors.surface,
    '--color-text': colors.text,
    '--color-text-secondary': colors.textSecondary,
    '--color-border': colors.border,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-info': colors.info,
  }

  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * Main theme composable
 */
export const useTheme = () => {
  // State
  const mode = useState<Theme>('theme-mode', () => 'system')
  const colors = useState<ThemeColors>('theme-colors', () => defaultLightColors)

  // Initialize theme on client
  if (process.client) {
    // Load theme from localStorage
    const savedMode = localStorage.getItem('theme-mode') as Theme
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      mode.value = savedMode
    }

    const savedColors = localStorage.getItem('theme-colors')
    if (savedColors) {
      try {
        colors.value = JSON.parse(savedColors)
      } catch (error) {
        console.error('Failed to parse saved theme colors:', error)
      }
    }

    // Apply theme on init and when mode changes
    watchEffect(() => {
      applyTheme(mode.value, colors.value)
    })

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (mode.value === 'system') {
        applyTheme(mode.value, colors.value)
      }
    })
  }

  /**
   * Set theme mode
   */
  const setMode = (newMode: Theme) => {
    mode.value = newMode
    if (process.client) {
      localStorage.setItem('theme-mode', newMode)
    }
  }

  /**
   * Set custom colors
   */
  const setColors = (newColors: Partial<ThemeColors>) => {
    colors.value = { ...colors.value, ...newColors }
    if (process.client) {
      localStorage.setItem('theme-colors', JSON.stringify(colors.value))
    }
  }

  /**
   * Reset to default colors
   */
  const resetColors = () => {
    const effectiveTheme = getEffectiveTheme(mode.value)
    colors.value = effectiveTheme === 'dark' ? defaultDarkColors : defaultLightColors
    if (process.client) {
      localStorage.setItem('theme-colors', JSON.stringify(colors.value))
    }
  }

  /**
   * Toggle between light and dark
   */
  const toggleMode = () => {
    const effectiveTheme = getEffectiveTheme(mode.value)
    const newMode = effectiveTheme === 'light' ? 'dark' : 'light'
    setMode(newMode)
  }

  /**
   * Get effective theme (resolves 'system' to actual theme)
   */
  const effectiveTheme = computed(() => getEffectiveTheme(mode.value))

  /**
   * Check if dark mode is active
   */
  const isDark = computed(() => effectiveTheme.value === 'dark')

  /**
   * Check if light mode is active
   */
  const isLight = computed(() => effectiveTheme.value === 'light')

  return {
    mode,
    colors,
    effectiveTheme,
    isDark,
    isLight,
    setMode,
    setColors,
    resetColors,
    toggleMode,
  }
}

/**
 * Dark mode composable (shorthand)
 */
export const useDarkMode = () => {
  const { mode, toggleMode, isDark } = useTheme()

  const enabled = computed({
    get: () => isDark.value,
    set: (value: boolean) => {
      mode.value = value ? 'dark' : 'light'
    },
  })

  const toggle = () => toggleMode()

  return {
    enabled,
    toggle,
  }
}

/**
 * Custom theme builder composable
 */
export const useThemeBuilder = () => {
  const { setColors, resetColors } = useTheme()
  const colors = ref<ThemeColors>({ ...defaultLightColors })

  /**
   * Update specific color
   */
  const updateColor = (key: keyof ThemeColors, value: string) => {
    colors.value[key] = value
  }

  /**
   * Apply changes
   */
  const apply = () => {
    setColors({ ...colors.value })
  }

  /**
   * Reset to defaults
   */
  const reset = () => {
    colors.value = { ...defaultLightColors }
    resetColors()
  }

  /**
   * Export theme as JSON
   */
  const exportTheme = (): string => {
    return JSON.stringify(colors.value, null, 2)
  }

  /**
   * Import theme from JSON
   */
  const importTheme = (json: string) => {
    try {
      const imported = JSON.parse(json) as ThemeColors
      colors.value = { ...defaultLightColors, ...imported }
      apply()
      return true
    } catch (error) {
      console.error('Failed to import theme:', error)
      return false
    }
  }

  return {
    colors,
    updateColor,
    apply,
    reset,
    exportTheme,
    importTheme,
  }
}

/**
 * Preset themes composable
 */
export const usePresetThemes = () => {
  const { setColors, setMode } = useTheme()

  const presets = [
    {
      name: 'Default Light',
      mode: 'light' as Theme,
      colors: defaultLightColors,
    },
    {
      name: 'Default Dark',
      mode: 'dark' as Theme,
      colors: defaultDarkColors,
    },
    {
      name: 'Blue',
      mode: 'light' as Theme,
      colors: {
        ...defaultLightColors,
        primary: '#3b82f6',
        secondary: '#6366f1',
      },
    },
    {
      name: 'Purple',
      mode: 'light' as Theme,
      colors: {
        ...defaultLightColors,
        primary: '#8b5cf6',
        secondary: '#a78bfa',
      },
    },
    {
      name: 'Green',
      mode: 'light' as Theme,
      colors: {
        ...defaultLightColors,
        primary: '#10b981',
        secondary: '#34d399',
      },
    },
    {
      name: 'Orange',
      mode: 'light' as Theme,
      colors: {
        ...defaultLightColors,
        primary: '#f59e0b',
        secondary: '#fbbf24',
      },
    },
    {
      name: 'Rose',
      mode: 'light' as Theme,
      colors: {
        ...defaultLightColors,
        primary: '#f43f5e',
        secondary: '#fb7185',
      },
    },
  ]

  /**
   * Apply preset
   */
  const applyPreset = (preset: typeof presets[0]) => {
    setMode(preset.mode)
    setColors(preset.colors)
  }

  return {
    presets,
    applyPreset,
  }
}

/**
 * Theme transition composable
 */
export const useThemeTransition = () => {
  const { isDark } = useTheme()
  const transitioning = ref<boolean>(false)

  const toggleWithTransition = async () => {
    transitioning.value = true
    try {
      // Add a small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 50))
      isDark.value = !isDark.value
      await new Promise((resolve) => setTimeout(resolve, 300))
    } finally {
      transitioning.value = false
    }
  }

  return {
    transitioning,
    toggleWithTransition,
  }
}
