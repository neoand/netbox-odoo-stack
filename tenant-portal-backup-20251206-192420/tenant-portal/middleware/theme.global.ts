/**
 * Global Theme Middleware
 * Applies theme class to document based on current theme
 */

export default defineNuxtRouteMiddleware(() => {
  if (!process.client) return

  const { effectiveTheme } = useTheme()

  // Apply theme class to document
  const updateTheme = () => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(effectiveTheme.value)
  }

  // Watch for theme changes
  watchEffect(updateTheme)

  // Initial application
  updateTheme()
})
