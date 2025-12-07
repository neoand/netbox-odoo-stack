# 🖥️ Admin Portal - NEO_STACK Platform v3.0

[![Nuxt](https://img.shields.io/badge/Nuxt-3.10+-00DC82?style=flat-square&logo=nuxt.js)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-2.14+-2D3748?style=flat-square)](https://ui.nuxt.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

> Administrative portal for NEO_STACK Platform v3.0 - Built with Vue 3, Nuxt 3, and Nuxt UI

## ✨ Features

- 🎨 **Modern UI** - Built with Nuxt UI and Tailwind CSS
- ⚡ **Performance** - Server-side rendering with Nuxt 3
- 📱 **Responsive** - Mobile-first design
- 🔐 **Secure** - JWT authentication and role-based authorization
- 📊 **Real-time Dashboards** - Interactive charts and metrics
- 🌍 **Bilingual** - PT-BR and ES-MX support
- 🎯 **Type-Safe** - Full TypeScript support
- 📦 **State Management** - Pinia for reactive state

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/neo_netbox_odoo_stack.git
cd neo_netbox_odoo_stack/platform/admin-portal

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
npm run preview
```

### Docker Setup

```bash
cd docker
docker-compose up -d
```

## 📚 Documentation

- **Portuguese**: [docs/pt/README.md](docs/pt/README.md)
- **Spanish**: [docs/es/README.md](docs/es/README.md)

## 🎯 Core Functionality

### Dashboard
- Revenue metrics in real-time
- Growth charts
- Subscription status
- Recent tenant activity
- Alerts and notifications

### Tenant Management
- Complete tenant listing
- Create/edit tenants
- Status filters (active, trial, suspended, cancelled)
- Bulk actions
- Detailed tenant views

### Billing Management
- **Plans**: Create, edit, delete subscription plans
- **Subscriptions**: View and manage active subscriptions
- **Invoices**: Generate, view, and export invoices
- **Payments**: Track payment status
- **Coupons**: Manage discount coupons
- **Reports**: Revenue analysis and metrics

### User Management
- List administrative users
- Create/edit users
- Manage permissions and roles
- Account activation/deactivation

### Settings
- Platform configurations
- External service integrations
- Email and notification settings
- Billing parameters
- Security settings

### Analytics
- Detailed usage metrics
- Revenue reports
- Churn analysis
- Growth trends
- Data export

## 🏗️ Architecture

```
admin-portal/
├── assets/              # Static assets (CSS, images)
├── components/          # Reusable Vue components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── tenants/         # Tenant management
│   ├── billing/         # Billing management
│   └── layout/          # Layout components
├── composables/         # Vue composables
├── layouts/             # Page layouts
├── middleware/          # Authentication middleware
├── pages/               # Application pages
├── plugins/             # Nuxt plugins
├── public/              # Public files
├── server/              # API routes (SSR)
├── stores/              # Pinia stores
├── types/               # TypeScript definitions
├── utils/               # Utilities
└── docs/                # Documentation
```

## 🔌 API Integration

### Authentication

```typescript
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Tenants

```
GET    /api/admin/tenants
GET    /api/admin/tenants/:id
POST   /api/admin/tenants
PUT    /api/admin/tenants/:id
DELETE /api/admin/tenants/:id
```

### Billing

```
GET  /api/admin/billing/stats
GET  /api/admin/billing/plans
POST /api/admin/billing/plans
GET  /api/admin/billing/subscriptions
GET  /api/admin/billing/invoices
POST /api/admin/billing/invoices
```

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Nuxt** | 3.10+ | Full-stack framework |
| **Vue** | 3.4+ | Reactive framework |
| **Nuxt UI** | 2.14+ | UI component library |
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **TypeScript** | 5.3+ | Type safety |
| **Pinia** | 2.1+ | State management |
| **VueUse** | 10.7+ | Composition utilities |

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access** - Admin/user permissions
- **CSRF Protection** - Token validation
- **Security Headers** - XSS, CSRF protection
- **Input Validation** - Zod schema validation

## 📊 State Management

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(email: string, password: string) {
      // Login implementation
    },
  },
})
```

## 🎨 UI Components

Built with **Nuxt UI** - Beautiful and accessible components

```vue
<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">{{ title }}</h3>
    </template>

    <UForm :state="form" @submit="handleSubmit">
      <UFormGroup label="Email">
        <UInput v-model="form.email" />
      </UFormGroup>
    </UForm>
  </UCard>
</template>
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t neo-stack-admin-portal .

# Run container
docker run -p 3002:3002 neo-stack-admin-portal
```

### Docker Compose

```bash
cd docker
docker-compose up -d
```

### Production

```bash
# Optimized build
npm run build

# Serve with PM2
pm2 start .output/server/index.mjs --name admin-portal
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## 📦 Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build

# Quality
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript checking

# Testing
npm run test         # Run tests
npm run test:ui      # UI test runner
```

## 🌐 Environment Variables

```env
# API Configuration
API_BASE_URL=http://localhost:8000
AUTH_URL=http://localhost:8080
BILLING_URL=http://localhost:8000
NETBOX_URL=http://localhost:8001
ODOO_URL=http://localhost:8069

# Application
NODE_ENV=production
NUXT_PORT=3002

# Security
SESSION_SECRET=your-session-secret-change-me
```

## 📖 Usage Examples

### Authentication

```typescript
const authStore = useAuthStore()

await authStore.login('admin@platform.local', 'password')
```

### Fetching Data

```typescript
const { data } = await useFetch('/api/admin/tenants', {
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
})
```

### State Management

```typescript
const tenantStore = useTenantStore()
await tenantStore.fetchTenants()
```

## 🔧 Troubleshooting

### Connection Issues

```bash
# Check API status
curl http://localhost:8000/health

# Verify configuration
cat .env | grep API_BASE_URL
```

### Build Failures

```bash
# Clear cache
rm -rf .nuxt .output node_modules
npm install
npm run build
```

### Authentication Problems

```bash
# Clear stored auth data
localStorage.clear()
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "feat: add new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Workflow

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm run test

# Fix linting
npm run lint:fix

# Type check
npm run type-check
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: admin-support@platform.local
- **Slack**: #admin-portal
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/neo_netbox_odoo_stack/issues)

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org) - The progressive JavaScript framework
- [Nuxt](https://nuxt.com) - The intuitive Vue framework
- [Nuxt UI](https://ui.nuxt.com) - UI library for Nuxt
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Pinia](https://pinia.vuejs.org) - The intuitive state management
- Open source community

---

**Built with ❤️ for NEO_STACK Platform v3.0**

[![Powered by Nuxt](https://img.shields.io/badge/Powered%20by-Nuxt-00DC82?style=flat-square&logo=nuxt.js)](https://nuxt.com)
