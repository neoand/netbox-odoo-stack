# 🏢 NEO_STACK Tenant Portal v3.0

**Self-Service SaaS Portal for Multi-Tenant Platform Management**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](./)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.0-blue.svg)](#-tech-stack)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.0-green.svg)](#-tech-stack)
[![Bilingual](https://img.shields.io/badge/bilingual-PT--BR%20%7C%20ES--MX-yellow.svg)](#)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture](#-architecture)
5. [User Interface](#-user-interface)
6. [Dashboard](#-dashboard)
7. [Subscription Management](#-subscription-management)
8. [Billing & Invoices](#-billing--invoices)
9. [Usage Tracking](#-usage-tracking)
10. [Quick Start](#-quick-start)
11. [Development](#-development)
12. [API Integration](#-api-integration)
13. [Customization](#-customization)

---

## 🎯 Overview

O **NEO_STACK Tenant Portal** é um portal self-service completo para gestão de assinaturas, billing, uso de recursos e configurações em um ambiente multi-tenant SaaS. Interface moderna e intuitiva construída com Vue 3 + Nuxt 3 + Nuxt UI.

### Key Capabilities

- 🏠 **Self-Service Portal**: Gestão completa pelo próprio tenant
- 📊 **Real-Time Dashboard**: Métricas e KPIs em tempo real
- 💳 **Subscription Management**: Upgrade/downgrade automático
- 📄 **Billing Portal**: Visualização e download de faturas
- 📈 **Usage Tracking**: Monitoramento de recursos em tempo real
- ⚙️ **Settings Management**: Configurações personalizáveis
- 🎫 **Support Tickets**: Integração com sistema de tickets
- 🌍 **Bilingual**: PT-BR + ES-MX completo
- 📱 **Responsive**: Mobile-first design
- 🔒 **Secure**: RBAC + SSO integration

---

## ✨ Features

### Dashboard Features

**Overview**:
- Account summary
- Service health status
- Recent activities
- Quick actions
- Notifications

**Metrics**:
- API usage
- Storage consumption
- Bandwidth usage
- Active users
- Performance metrics

**Alerts**:
- Usage thresholds
- Service issues
- Security alerts
- Billing notifications

### Subscription Management

**Current Plan**:
- View active subscription
- Plan details
- Usage limits
- Next billing date

**Upgrade/Downgrade**:
- Compare plans
- Instant plan changes
- Proration calculation
- Confirmation workflow

**Billing Cycle**:
- Monthly/annual billing
- Trial periods
- Pause/resume subscription
- Cancellation options

### Billing & Invoices

**Invoice History**:
- All invoices
- Status tracking
- PDF downloads
- Email receipts

**Payment Methods**:
- Add/remove cards
- Set default payment
- Billing address
- Auto-pay settings

**Usage Charges**:
- Overage fees
- Usage breakdown
- Cost allocation
- Budget alerts

### Usage Tracking

**Resource Usage**:
- API calls
- Storage (GB)
- Bandwidth (GB)
- User seats
- Custom metrics

**Usage Trends**:
- Historical data
- Peak usage
- Growth patterns
- Forecasting

**Alerts**:
- Threshold warnings
- Budget limits
- Anomaly detection
- Optimization tips

---

## 💻 Tech Stack

### Frontend

**Core Framework**:
- **Vue 3**: Composition API, reactivity
- **Nuxt 3**: Full-stack framework
- **TypeScript**: Type safety
- **Nuxt UI**: Component library

**State Management**:
- **Pinia**: State management
- **VueUse**: Composition utilities
- **LocalStorage**: Client-side persistence

**Styling**:
- **Tailwind CSS**: Utility-first CSS
- **Nuxt UI**: Pre-built components
- **Dark Mode**: Theme switching

**HTTP Client**:
- **$fetch**: Native Nuxt HTTP
- **Axios**: HTTP client (optional)
- **WebSocket**: Real-time updates

### Backend Integration

**API**:
- RESTful APIs
- GraphQL (optional)
- WebSocket for real-time

**Authentication**:
- JWT tokens
- OAuth 2.0
- SSO integration
- MFA support

**Real-time**:
- Server-Sent Events
- WebSocket
- Polling fallback

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  NEO_STACK Tenant Portal                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Vue 3 + Nuxt 3)                                     │
│  ├── Pages (Route-based views)                                │
│  ├── Components (Reusable UI)                                 │
│  ├── Composables (Logic reuse)                                │
│  ├── Stores (Pinia state)                                     │
│  └── Utils (Helper functions)                                 │
├─────────────────────────────────────────────────────────────────┤
│  API Integration Layer                                         │
│  ├── Authentication                                           │
│  ├── Data Fetching                                            │
│  ├── Error Handling                                           │
│  └── Cache Management                                         │
├─────────────────────────────────────────────────────────────────┤
│  External Services                                             │
│  ├── Billing Service                                          │
│  ├── Tenant Manager                                           │
│  ├── Monitoring Service                                       │
│  └── Auth Service (Authentik)                                │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
tenant-portal/
├── assets/                 # Static assets
│   ├── css/               # Global styles
│   └── images/            # Images
├── components/            # Vue components
│   ├── ui/                # UI components (Nuxt UI)
│   ├── billing/           # Billing components
│   ├── dashboard/         # Dashboard components
│   └── common/            # Shared components
├── composables/           # Composition functions
│   ├── useAuth.ts         # Authentication
│   ├── useApi.ts          # API calls
│   ├── useBilling.ts      # Billing logic
│   └── useSubscription.ts # Subscription logic
├── layouts/               # Layout templates
│   ├── default.vue        # Default layout
│   ├── auth.vue           # Auth layout
│   └── error.vue          # Error layout
├── pages/                 # Route pages
│   ├── index.vue          # Dashboard
│   ├── subscription/      # Subscription pages
│   ├── billing/           # Billing pages
│   ├── usage/             # Usage pages
│   └── settings/          # Settings pages
├── plugins/               # Nuxt plugins
│   ├── auth.client.ts     # Auth plugin
│   └── api.client.ts      # API plugin
├── server/                # Server-side (optional)
│   └── api/               # API routes
├── stores/                # Pinia stores
│   ├── auth.ts            # Auth store
│   ├── subscription.ts    # Subscription store
│   ├── billing.ts         # Billing store
│   └── usage.ts           # Usage store
├── types/                 # TypeScript types
│   ├── api.ts             # API types
│   ├── billing.ts         # Billing types
│   └── subscription.ts    # Subscription types
├── utils/                 # Utility functions
│   ├── api.ts             # API helpers
│   ├── format.ts          # Formatters
│   └── validate.ts        # Validators
├── app.vue                # Root component
├── nuxt.config.ts         # Nuxt configuration
└── package.json           # Dependencies
```

---

## 🎨 User Interface

### Design System

**Colors**:
```css
:root {
  --primary: #3b82f6;     /* Blue */
  --secondary: #64748b;   /* Slate */
  --success: #10b981;     /* Emerald */
  --warning: #f59e0b;     /* Amber */
  --danger: #ef4444;      /* Red */
  --info: #06b6d4;        /* Cyan */
}
```

**Typography**:
- Headings: Inter (bold)
- Body: Inter (regular)
- Monospace: JetBrains Mono

**Spacing**:
- Base unit: 4px
- Scale: 4, 8, 16, 24, 32, 48, 64px

**Breakpoints**:
- Mobile: 0px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

### Component Library

**Nuxt UI Components**:
- `UButton`: Action buttons
- `UInput`: Text inputs
- `UCard`: Content containers
- `UTable`: Data tables
- `UModal`: Dialogs
- `UDropdown`: Menus
- `UTabs`: Tab navigation
- `UProgress`: Progress bars
- `UAlert`: Notifications
- `UBadge`: Status labels

**Custom Components**:
- `UsageChart`: Resource usage visualization
- `BillingTable`: Invoice listing
- `SubscriptionCard`: Plan details
- `MetricCard`: KPI display
- `ActivityFeed`: Recent events

### Pages

#### Dashboard (`/`)

**Layout**:
```
┌─────────────────────────────────────────┐
│ Header (Logo + User Menu)               │
├─────────────────────────────────────────┤
│ Navigation (Sidebar)                    │
├─────────────────────────────────────────┤
│ Main Content                            │
│ ┌─────────────────┬─────────────────────┐ │
│ │ Account Summary │ Quick Actions       │ │
│ └─────────────────┴─────────────────────┘ │
│ ┌───────────────────────────────────────┐ │
│ │ Usage Metrics                         │ │
│ └───────────────────────────────────────┘ │
│ ┌─────────────────┬─────────────────────┐ │
│ │ Recent Activity │ Service Health      │ │
│ └─────────────────┴─────────────────────┘ │
└─────────────────────────────────────────┘
```

**Sections**:
1. **Account Summary**: Plan, status, next billing
2. **Usage Metrics**: Charts and KPIs
3. **Quick Actions**: Upgrade, download invoice, support
4. **Recent Activity**: Timeline of events
5. **Service Health**: Status indicators

#### Subscription (`/subscription`)

**Pages**:
- `/subscription` - Current plan
- `/subscription/upgrade` - Upgrade/downgrade
- `/subscription/billing` - Billing cycle
- `/subscription/cancel` - Cancellation

**Features**:
- Plan comparison table
- Proration calculator
- Change confirmation
- Cancellation flow

#### Billing (`/billing`)

**Pages**:
- `/billing` - Invoice list
- `/billing/invoice/[id]` - Invoice details
- `/billing/payment-methods` - Payment methods
- `/billing/address` - Billing address

**Features**:
- Invoice table with filters
- PDF download
- Payment method management
- Auto-pay settings

#### Usage (`/usage`)

**Pages**:
- `/usage` - Current usage
- `/usage/trends` - Historical trends
- `/usage/forecast` - Forecasting
- `/usage/alerts` - Alert settings

**Features**:
- Real-time usage tracking
- Interactive charts
- Usage forecasting
- Alert configuration

#### Settings (`/settings`)

**Pages**:
- `/settings/profile` - Profile settings
- `/settings/security` - Security settings
- `/settings/notifications` - Notifications
- `/settings/integrations` - API keys

**Features**:
- Profile editing
- Password change
- 2FA setup
- API key management

---

## 📊 Dashboard

### Layout Components

**Header**:
```vue
<template>
  <UHeader>
    <NuxtLink to="/" class="flex items-center">
      <img src="/logo.svg" alt="NEO_STACK" class="h-8" />
      <span class="ml-2 text-xl font-bold">Tenant Portal</span>
    </NuxtLink>

    <template #right>
      <UButton
        icon="i-heroicons-bell"
        variant="ghost"
        @click="showNotifications = true"
      />
      <UDropdown :items="userMenu">
        <UAvatar :src="user.avatar" :alt="user.name" />
      </UDropdown>
    </template>
  </UHeader>
</template>
```

**Sidebar**:
```vue
<template>
  <USidebar>
    <UNavigationMenu :items="navigation" />
  </USidebar>
</template>

<script setup lang="ts">
const navigation = [
  { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  { label: 'Subscription', icon: 'i-heroicons-cube', to: '/subscription' },
  { label: 'Billing', icon: 'i-heroicons-currency-dollar', to: '/billing' },
  { label: 'Usage', icon: 'i-heroicons-chart-bar', to: '/usage' },
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings' }
]
</script>
```

### Dashboard Widgets

**Account Summary Widget**:
```vue
<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Account Summary</h3>
    </template>

    <div class="space-y-4">
      <div class="flex justify-between">
        <span class="text-gray-600">Plan</span>
        <UBadge color="blue">{{ subscription.plan.name }}</UBadge>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Status</span>
        <UBadge :color="subscription.status === 'active' ? 'green' : 'red'">
          {{ subscription.status }}
        </UBadge>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Next Billing</span>
        <span>{{ formatDate(subscription.nextBillingDate) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Amount</span>
        <span class="font-semibold">${{ subscription.amount }}</span>
      </div>
    </div>
  </UCard>
</template>
```

**Usage Metrics Widget**:
```vue
<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Usage This Month</h3>
        <span class="text-sm text-gray-500">{{ period }}</span>
      </div>
    </template>

    <div class="space-y-6">
      <div v-for="metric in usage" :key="metric.name">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium">{{ metric.label }}</span>
          <span class="text-sm text-gray-500">
            {{ metric.used }} / {{ metric.limit }}
          </span>
        </div>
        <UProgress :value="(metric.used / metric.limit) * 100" />
      </div>
    </div>
  </UCard>
</template>
```

---

## 💳 Subscription Management

### Current Plan Page

```vue
<template>
  <div class="container mx-auto py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Current Plan -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <h2 class="text-2xl font-bold">Current Plan</h2>
          </template>

          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-semibold">{{ plan.name }}</h3>
                <p class="text-gray-600">{{ plan.description }}</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold">${{ plan.price }}</div>
                <div class="text-sm text-gray-500">per month</div>
              </div>
            </div>

            <UDivider />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-600">Next Billing Date</div>
                <div class="font-semibold">{{ formatDate(nextBilling) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Billing Cycle</div>
                <div class="font-semibold">{{ plan.interval }}</div>
              </div>
            </div>

            <UDivider />

            <div class="flex gap-3">
              <UButton to="/subscription/upgrade" color="blue">
                Change Plan
              </UButton>
              <UButton variant="outline" color="red" @click="showCancelModal = true">
                Cancel Subscription
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Quick Actions -->
      <div>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Quick Actions</h3>
          </template>

          <div class="space-y-3">
            <UButton block variant="outline" icon="i-heroicons-document-arrow-down">
              Download Invoice
            </UButton>
            <UButton block variant="outline" icon="i-heroicons-credit-card">
              Payment Methods
            </UButton>
            <UButton block variant="outline" icon="i-heroicons-bell">
              Billing Alerts
            </UButton>
            <UButton block variant="outline" icon="i-heroicons-question-mark-circle">
              Billing Support
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
```

### Plan Comparison

```vue
<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Compare Plans</h2>
        <UButton @click="showUpgradeModal = true">
          Upgrade Now
        </UButton>
      </div>
    </template>

    <UTable :rows="plans" :columns="columns">
      <template #name-data="{ row }">
        <div class="font-semibold">{{ row.name }}</div>
      </template>

      <template #price-data="{ row }">
        <div class="text-xl font-bold">${{ row.price }}</div>
        <div class="text-sm text-gray-500">/month</div>
      </template>

      <template #features-data="{ row }">
        <ul class="space-y-1">
          <li v-for="feature in row.features" :key="feature" class="flex items-center">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500 mr-2" />
            {{ feature }}
          </li>
        </ul>
      </template>

      <template #action-data="{ row }">
        <UButton
          :color="row.current ? 'gray' : 'blue'"
          :variant="row.current ? 'solid' : 'outline'"
          :disabled="row.current"
          @click="selectPlan(row)"
        >
          {{ row.current ? 'Current' : 'Select' }}
        </UButton>
      </template>
    </UTable>
  </UCard>
</template>
```

---

## 📄 Billing & Invoices

### Invoice List

```vue
<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Billing History</h2>
        <UButton icon="i-heroicons-funnel">
          Filter
        </UButton>
      </div>
    </template>

    <UTable :rows="invoices" :columns="columns">
      <template #invoice-number-data="{ row }">
        <NuxtLink :to="`/billing/invoice/${row.id}`" class="text-blue-600 hover:underline">
          {{ row.number }}
        </NuxtLink>
      </template>

      <template #date-data="{ row }">
        {{ formatDate(row.date) }}
      </template>

      <template #amount-data="{ row }">
        ${{ row.amount.toFixed(2) }}
      </template>

      <template #status-data="{ row }">
        <UBadge :color="getStatusColor(row.status)">
          {{ row.status }}
        </UBadge>
      </template>

      <template #action-data="{ row }">
        <UButton
          v-if="row.status === 'paid'"
          icon="i-heroicons-arrow-down-tray"
          variant="ghost"
          @click="downloadInvoice(row.id)"
        />
      </template>
    </UTable>

    <template #footer>
      <UPagination
        v-model="page"
        :page-count="totalPages"
        :total="totalInvoices"
      />
    </template>
  </UCard>
</template>
```

### Invoice Details

```vue
<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold">Invoice {{ invoice.number }}</h2>
          <p class="text-gray-600">Issued on {{ formatDate(invoice.date) }}</p>
        </div>
        <UButton icon="i-heroicons-arrow-down-tray" @click="downloadPDF">
          Download PDF
        </UButton>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Invoice Summary -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-600">Bill To</div>
          <div class="font-semibold">{{ invoice.customer.name }}</div>
          <div>{{ invoice.customer.email }}</div>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-600">Amount Due</div>
          <div class="text-3xl font-bold">${{ invoice.amount }}</div>
        </div>
      </div>

      <UDivider />

      <!-- Line Items -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Items</h3>
        <UTable :rows="invoice.items" :columns="itemColumns">
          <template #description-data="{ row }">
            {{ row.description }}
            <div v-if="row.period" class="text-sm text-gray-500">
              {{ row.period }}
            </div>
          </template>

          <template #amount-data="{ row }">
            ${{ row.amount.toFixed(2) }}
          </template>
        </UTable>
      </div>

      <UDivider />

      <!-- Total -->
      <div class="flex justify-end">
        <div class="w-64 space-y-2">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>${{ invoice.subtotal }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tax</span>
            <span>${{ invoice.tax }}</span>
          </div>
          <UDivider />
          <div class="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>${{ invoice.total }}</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
```

---

## 📈 Usage Tracking

### Usage Dashboard

```vue
<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Usage Overview</h2>
        <div class="flex gap-2">
          <USelectMenu v-model="period" :options="periodOptions" />
          <UButton icon="i-heroicons-arrow-path" @click="refresh">
            Refresh
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Usage Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          v-for="metric in metrics"
          :key="metric.name"
          :title="metric.label"
          :value="metric.used"
          :limit="metric.limit"
          :unit="metric.unit"
          :trend="metric.trend"
        />
      </div>

      <!-- Usage Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">API Calls</h3>
          </template>
          <UsageChart :data="apiUsageData" />
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Storage</h3>
          </template>
          <UsageChart :data="storageUsageData" />
        </UCard>
      </div>

      <!-- Usage Details -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Detailed Usage</h3>
        </template>
        <UTable :rows="usageDetails" :columns="detailColumns" />
      </UCard>
    </div>
  </UCard>
</template>
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Docker (for backend)
- API access

### Installation

```bash
# Clone repository
git clone https://github.com/neo-stack/neo_netbox_odoo_stack.git
cd neo_netbox_odoo_stack/platform/tenant-portal

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Environment Variables

```bash
# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
NUXT_PUBLIC_BILLING_API=http://localhost:8003/api

# Authentication
NUXT_PUBLIC_AUTH_URL=http://localhost:9000
NUXT_SESSION_SECRET=your-session-secret

# Feature Flags
NUXT_PUBLIC_ENABLE_BILLING=true
NUXT_PUBLIC_ENABLE_USAGE=true
NUXT_PUBLIC_ENABLE_SUPPORT=true
```

### Default Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      billingApi: process.env.NUXT_PUBLIC_BILLING_API,
      authUrl: process.env.NUXT_PUBLIC_AUTH_URL
    }
  },

  app: {
    head: {
      title: 'NEO_STACK Tenant Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true }
})
```

---

## 💻 Development

### Composables

**useAuth**:
```typescript
export const useAuth = () => {
  const user = useState('user', () => null)
  const token = useCookie('auth_token')

  const login = async (email: string, password: string) => {
    const response = await $fetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    token.value = response.token
    user.value = response.user
  }

  const logout = async () => {
    await $fetch('/auth/logout', { method: 'POST' })
    token.value = null
    user.value = null
  }

  const isAuthenticated = computed(() => !!token.value)

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    login,
    logout
  }
}
```

**useSubscription**:
```typescript
export const useSubscription = () => {
  const subscription = ref(null)
  const loading = ref(false)

  const fetchSubscription = async () => {
    loading.value = true
    try {
      subscription.value = await $fetch('/subscription')
    } finally {
      loading.value = false
    }
  }

  const upgrade = async (planId: string) => {
    loading.value = true
    try {
      const result = await $fetch('/subscription/upgrade', {
        method: 'POST',
        body: { planId }
      })
      subscription.value = result
    } finally {
      loading.value = false
    }
  }

  return {
    subscription: readonly(subscription),
    loading: readonly(loading),
    fetchSubscription,
    upgrade
  }
}
```

### Stores

**Auth Store**:
```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)

  const login = async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials)
    user.value = response.user
    token.value = response.token
  }

  const logout = () => {
    user.value = null
    token.value = null
  }

  const isAuthenticated = computed(() => !!token.value)

  return { user, token, isAuthenticated, login, logout }
})
```

### API Integration

**API Client**:
```typescript
// utils/api.ts
export const api = {
  async get<T>(url: string): Promise<T> {
    return await $fetch<T>(url, {
      headers: getAuthHeaders()
    })
  },

  async post<T>(url: string, body?: any): Promise<T> {
    return await $fetch<T>(url, {
      method: 'POST',
      body,
      headers: getAuthHeaders()
    })
  },

  async put<T>(url: string, body?: any): Promise<T> {
    return await $fetch<T>(url, {
      method: 'PUT',
      body,
      headers: getAuthHeaders()
    })
  },

  async delete<T>(url: string): Promise<T> {
    return await $fetch<T>(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
  }
}

function getAuthHeaders() {
  const token = useCookie('auth_token').value
  return token ? { Authorization: `Bearer ${token}` } : {}
}
```

---

## 🔗 API Integration

### Endpoints

**Authentication**:
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh
```

**Subscription**:
```
GET    /api/subscription
POST   /api/subscription/upgrade
POST   /api/subscription/downgrade
POST   /api/subscription/cancel
GET    /api/subscription/plans
```

**Billing**:
```
GET  /api/billing/invoices
GET  /api/billing/invoices/:id
GET  /api/billing/invoices/:id/pdf
GET  /api/billing/payment-methods
POST /api/billing/payment-methods
```

**Usage**:
```
GET /api/usage
GET /api/usage/:metric
GET /api/usage/forecast
POST /api/usage/alerts
```

### Data Fetching

```vue
<script setup lang="ts">
const { data: invoices, pending } = await useAsyncData(
  'invoices',
  () => $fetch('/api/billing/invoices'),
  { server: false }
)

const { data: subscription } = await useAsyncData(
  'subscription',
  () => $fetch('/api/subscription'),
  { server: false }
)

const { data: usage } = await useAsyncData(
  'usage',
  () => $fetch('/api/usage'),
  { server: false }
)
</script>
```

---

## 🎨 Customization

### Theming

```css
/* assets/css/theme.css */
:root {
  --color-primary: 59 130 246;
  --color-primary-foreground: 255 255 255;
}

.dark {
  --color-primary: 99 102 241;
  --color-primary-foreground: 255 255 255;
}
```

### Branding

```vue
<!-- components/BrandLogo.vue -->
<template>
  <NuxtLink to="/" class="flex items-center">
    <img :src="logoUrl" alt="Company Logo" class="h-8" />
    <span class="ml-2 text-xl font-bold text-primary">{{ companyName }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const logoUrl = computed(() => config.public.logoUrl || '/logo.svg')
const companyName = computed(() => config.public.companyName || 'NEO_STACK')
</script>
```

### Custom Components

```vue
<!-- components/custom/MetricCard.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm text-gray-600">{{ title }}</div>
        <div class="text-2xl font-bold">{{ formattedValue }}</div>
      </div>
      <UIcon :name="icon" class="w-10 h-10 text-primary" />
    </div>
    <UProgress :value="percentage" class="mt-4" />
    <div class="flex justify-between text-sm text-gray-600 mt-2">
      <span>{{ used }} {{ unit }}</span>
      <span>{{ limit }} {{ unit }}</span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  value: number
  limit: number
  unit: string
  icon: string
}>()

const percentage = computed(() => (props.value / props.limit) * 100)
const formattedValue = computed(() => props.value.toLocaleString())
</script>
```

---

## 📞 Support

### Resources

- **Documentation**: [Full docs](./docs/)
- **API Reference**: [Billing API](./docs/api.md)
- **Component Library**: [Nuxt UI](https://ui.nuxt.com/)
- **Vue 3 Docs**: [Vue.js](https://vuejs.org/)

### Development

```bash
# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run typecheck

# Build storybook
npm run storybook
```

### Contact

- **Email**: portal-support@neo-stack.com
- **GitHub**: Issues & discussions
- **Slack**: #tenant-portal

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - Progressive framework
- [Nuxt 3](https://nuxt.com/) - Full-stack framework
- [Nuxt UI](https://ui.nuxt.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Pinia](https://pinia.vuejs.org/) - State management

---

**Made with ❤️ by the NEO_STACK Team**

[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-orange.svg)](https://claude.ai)
