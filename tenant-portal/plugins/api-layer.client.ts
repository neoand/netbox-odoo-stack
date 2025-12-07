/**
 * API Layer Plugin
 * Initializes global configurations and settings
 */

export default defineNuxtPlugin(async () => {
  // Initialize theme
  const theme = useTheme()
  theme.setMode(theme.mode.value)

  // Initialize authentication
  const auth = useAuth()
  await auth.initAuth()

  // Set up global error handler
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)

      // Show toast notification for unhandled errors
      const { error } = useToast()
      error('Erro não tratado', event.reason?.message || 'Um erro inesperado ocorreu')
    })

    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
    })
  }
})
