export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000',
      authUrl: process.env.AUTH_URL || 'http://localhost:8080',
      billingUrl: process.env.BILLING_URL || 'http://localhost:8000',
      netboxUrl: process.env.NETBOX_URL || 'http://localhost:8001',
      odooUrl: process.env.ODOO_URL || 'http://localhost:8069',
    }
  },

  nitro: {
    preset: 'node-server',
  },

  app: {
    head: {
      title: 'NEO_STACK Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'NEO_STACK Platform v3.0' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },

  ui: {
    global: true,
    icons: ['heroicons', 'lucide'],
  },

  compatibilityDate: '2024-01-01',
})
