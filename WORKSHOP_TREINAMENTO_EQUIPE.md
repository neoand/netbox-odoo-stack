# 🎓 WORKSHOP - TREINAMENTO DA EQUIPE
**NEO_STACK Platform v3.0 - Base Template & Migrações**

---

## 📋 INFORMAÇÕES GERAIS

**Público-Alvo**: Equipe de Desenvolvimento
**Duração**: 4 horas
**Modalidade**: Hands-on + Apresentação
**Pré-requisitos**: Conhecimento básico de Vue.js/Nuxt.js
**Data**: 06 de Dezembro de 2025

### Objetivos do Workshop
- ✅ Compreender a nova arquitetura baseada no Base Template
- ✅ Aprender a usar os Composables e Stores
- ✅ Dominar o sistema de migração automatizada
- ✅ Conhecer as melhores práticas e padrões
- ✅ Saber como fazer deploy e troubleshooting

---

## 📚 AGENDA

### Módulo 1: Visão Geral (30 min)
1. **Histórico e Contexto** (10 min)
2. **Base Template - Visão Geral** (10 min)
3. **Estrutura de Diretórios** (10 min)

### Módulo 2: Arquitetura Técnica (45 min)
1. **Composables - Reutilização de Lógica** (15 min)
2. **Stores - Gerenciamento de Estado** (15 min)
3. **API Layer - Integrações** (15 min)

### Módulo 3: Desenvolvimento Prático (90 min)
1. **Criando um Novo Portal** (30 min)
2. **Migrando um Portal Existente** (30 min)
3. **Adicionando Funcionalidades** (30 min)

### Módulo 4: Deploy & Operação (45 min)
1. **Build & Deploy para Staging** (15 min)
2. **Monitoramento e Logs** (15 min)
3. **Troubleshooting** (15 min)

### Módulo 5: Boas Práticas (30 min)
1. **Padrões de Código** (10 min)
2. **TypeScript & Tipos** (10 min)
3. **Performance & Otimização** (10 min)

---

## 🎯 MÓDULO 1: VISÃO GERAL

### 1.1 Histórico e Contexto

#### Antes (分散 e Inconsistente)
```
❌ Cada portal com sua estrutura
❌ Código duplicado
❌ Configurações diferentes
❌ Setup: 2-4 horas por portal
❌ Difícil manutenção
```

#### Depois (Padronizado e Eficiente)
```
✅ Todos os portais baseados no mesmo template
✅ Código centralizado e reutilizável
✅ Configurações padronizadas
✅ Setup: 30 minutos por portal
✅ Fácil manutenção
```

### 1.2 Base Template - Visão Geral

**Localização**: `/platform/base-template/`

**Características**:
- **29 arquivos** base
- **Nuxt 3** + **Vue 3** + **TypeScript**
- **Nuxt UI** para componentes
- **Tailwind CSS** para estilização
- **Pinia** para estado global
- **Bilingue** (PT-BR + ES-MX)

#### Stack Tecnológico
```yaml
Framework: Nuxt 3.20.1
UI Library: Nuxt UI 2.22.3
Styling: Tailwind CSS
Language: TypeScript 5.3.3
State: Pinia
Icons: Heroicons
API: Axios
Linting: ESLint 8.56.0
```

### 1.3 Estrutura de Diretórios

```
base-template/
├── 📁 composables/          # Lógica reutilizável
│   ├── useApi.ts           # Cliente API
│   ├── useAuth.ts          # Autenticação
│   ├── useTheme.ts         # Tema/Dark mode
│   ├── useToast.ts         # Notificações
│   └── useI18n.ts          # Internacionalização
│
├── 📁 utils/               # Funções utilitárias
│   ├── api.ts              # Configuração API
│   ├── helpers.ts          # Funções auxiliares
│   └── validators.ts       # Validadores (CPF, CNPJ)
│
├── 📁 stores/              # Estado global (Pinia)
│   ├── auth.ts             # Store de autenticação
│   ├── theme.ts            # Store de tema
│   └── toast.ts            # Store de notificações
│
├── 📁 components/          # Componentes reutilizáveis
│   ├── BaseButton.vue      # Botão base
│   ├── BaseCard.vue        # Card base
│   ├── BaseInput.vue       # Input base
│   ├── BaseModal.vue       # Modal base
│   └── BaseTable.vue       # Tabela base
│
├── 📁 layouts/             # Layouts de página
│   ├── default.vue         # Layout padrão
│   ├── auth.vue            # Layout de autenticação
│   └── blank.vue           # Layout vazio
│
├── 📁 pages/               # Páginas da aplicação
│   ├── index.vue           # Página inicial
│   └── auth/
│       ├── login.vue       # Login
│       └── register.vue    # Registro
│
├── 📁 middleware/          # Middlewares
│   ├── auth.ts             # Proteção de rotas
│   └── theme.ts            # Alternância de tema
│
├── 📁 types/               # Tipos TypeScript
│   └── index.ts            # Tipos globais
│
├── 📁 assets/              # Assets estáticos
│   └── css/
│       └── main.css        # Estilos globais
│
└── 📁 scripts/             # Scripts de automação
    ├── setup.sh            # Setup inicial
    ├── dev.sh              # Desenvolvimento
    ├── build.sh            # Build produção
    └── deploy.sh           # Deploy
```

---

## 🎯 MÓDULO 2: ARQUITETURA TÉCNICA

### 2.1 Composables - Reutilização de Lógica

**Conceito**: Composables são funções que encapsulam lógica reativa usando Vue 3 Composition API.

#### useApi - Cliente API
```typescript
// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()

  const get = async <T>(url: string) => {
    const { data } = await $fetch<T>(url, {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`
      }
    })
    return data
  }

  const post = async <T>(url: string, body: any) => {
    const { data } = await $fetch<T>(url, {
      method: 'POST',
      baseURL: config.public.apiBase,
      body,
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`
      }
    })
    return data
  }

  return { get, post }
}
```

**Uso**:
```vue
<script setup lang="ts">
const { get } = useApi()
const users = await get<User[]>('/api/users')
</script>
```

#### useAuth - Autenticação
```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    authStore.setUser(response.user)
    authStore.setToken(response.token)

    await router.push('/')
  }

  const logout = () => {
    authStore.clear()
    router.push('/auth/login')
  }

  return { login, logout, user: computed(() => authStore.user) }
}
```

**Uso**:
```vue
<script setup lang="ts">
const { login, user } = useAuth()

const handleLogin = async () => {
  await login('user@example.com', 'password')
}
</script>
```

#### useTheme - Tema/Dark Mode
```typescript
// composables/useTheme.ts
export const useTheme = () => {
  const themeStore = useThemeStore()

  const isDark = computed(() => themeStore.isDark)

  const toggleTheme = () => {
    themeStore.toggle()
  }

  return { isDark, toggleTheme }
}
```

**Uso**:
```vue
<template>
  <UButton @click="toggleTheme">
    {{ isDark ? 'Light' : 'Dark' }}
  </UButton>
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useTheme()
</script>
```

### 2.2 Stores - Gerenciamento de Estado

**Conceito**: Stores Pinia para gerenciamento de estado global.

#### Auth Store
```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (tokenData: string) => {
    token.value = tokenData
  }

  const clear = () => {
    user.value = null
    token.value = null
  }

  return { user, token, isAuthenticated, setUser, setToken, clear }
})
```

**Uso**:
```typescript
// Em qualquer componente
const authStore = useAuthStore()

// Ler estado
console.log(authStore.user)

// Alterar estado
authStore.setUser(newUser)

// Reativo
const isLoggedIn = computed(() => authStore.isAuthenticated)
```

#### Theme Store
```typescript
// stores/theme.ts
export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  const toggle = () => {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
})
```

### 2.3 API Layer - Integrações

**Conceito**: Camada de abstração para APIs externas.

#### Configuração
```typescript
// utils/api.ts
export const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore().clear()
      navigateTo('/auth/login')
    }
    return Promise.reject(error)
  }
)
```

---

## 🎯 MÓDULO 3: DESENVOLVIMENTO PRÁTICO

### 3.1 Criando um Novo Portal

#### Passo 1: Usar Base Template
```bash
# Copiar base template
cp -r base-template meu-novo-portal
cd meu-novo-portal

# Instalar dependências
npm install

# Executar
npm run dev
```

#### Passo 2: Personalizar
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Meu Novo Portal',
      meta: [
        { name: 'description', content: 'Descrição do portal' }
      ]
    }
  }
})
```

#### Passo 3: Adicionar Funcionalidades
```vue
<!-- pages/dashboard.vue -->
<template>
  <UCard>
    <template #header>
      <h1>Dashboard</h1>
    </template>

    <div class="space-y-4">
      <UStat label="Usuários" :value="usersCount" />
      <UStat label="Vendas" :value="salesCount" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { get } = useApi()
const { data: users } = await useAsyncData('users', () => get<User[]>('/api/users'))
const usersCount = computed(() => users.value?.length || 0)
</script>
```

### 3.2 Migrando um Portal Existente

#### Passo 1: Backup
```bash
# Criar backup
tar -czf backup-$(date +%Y%m%d).tar.gz meu-portal/
```

#### Passo 2: Executar Script de Migração
```bash
# Para Admin Portal
./scripts/migrate-admin-portal.sh

# Para Tenant Portal
./scripts/migrate-tenant-portal.sh

# Para Certification Portal
./scripts/migrate-certification.sh

# Para todos os portais
./scripts/migrate-all.sh
```

#### Passo 3: Verificar Migração
```bash
# Instalar dependências
npm install

# Build
npm run build

# Preview
npm run preview
```

#### Passo 4: Validar Funcionalidades
```bash
# Executar em desenvolvimento
npm run dev

# Verificar logs
tail -f .nuxt/nuxt.log
```

### 3.3 Adicionando Funcionalidades

#### Criando um Novo Composable
```typescript
// composables/useProducts.ts
export const useProducts = () => {
  const { get } = useApi()

  const products = ref<Product[]>([])
  const loading = ref(false)

  const fetchProducts = async () => {
    loading.value = true
    try {
      products.value = await get<Product[]>('/api/products')
    } finally {
      loading.value = false
    }
  }

  const getProduct = async (id: string) => {
    return await get<Product>(`/api/products/${id}`)
  }

  return { products, loading, fetchProducts, getProduct }
}
```

#### Criando um Novo Store
```typescript
// stores/products.ts
export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([])
  const selected = ref<Product | null>(null)

  const setItems = (products: Product[]) => {
    items.value = products
  }

  const setSelected = (product: Product | null) => {
    selected.value = product
  }

  const addItem = (product: Product) => {
    items.value.push(product)
  }

  return { items, selected, setItems, setSelected, addItem }
})
```

#### Criando um Novo Componente
```vue
<!-- components/ProductCard.vue -->
<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ product.name }}</h3>
        <UBadge :color="product.status === 'active' ? 'green' : 'red'">
          {{ product.status }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-2">
      <p class="text-gray-600">{{ product.description }}</p>
      <div class="flex items-center justify-between">
        <span class="text-2xl font-bold">R$ {{ product.price }}</span>
        <UButton @click="$emit('select', product)">
          Selecionar
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Product {
  id: string
  name: string
  description: string
  price: number
  status: 'active' | 'inactive'
}

defineProps<{
  product: Product
}>()

defineEmits<{
  select: [product: Product]
}>()
</script>
```

---

## 🎯 MÓDULO 4: DEPLOY & OPERAÇÃO

### 4.1 Build & Deploy para Staging

#### Build Manual
```bash
# Em cada portal
cd admin-portal
npm run build

cd ../tenant-portal
npm run build
```

#### Deploy com Script
```bash
# Executar script de deploy
./deploy-staging.sh

# Verificar logs
tail -f deploy-staging-*.log
```

#### Deploy com Docker
```bash
# Build das imagens
docker-compose -f docker-compose.staging.yml build

# Deploy
docker-compose -f docker-compose.staging.yml up -d

# Verificar status
docker-compose -f docker-compose.staging.yml ps
```

#### URLs de Acesso (Staging)
- **Admin Portal**: http://localhost:3001
- **Tenant Portal**: http://localhost:3002
- **Certification Portal**: http://localhost:3003
- **Traefik Dashboard**: http://localhost:8080

### 4.2 Monitoramento e Logs

#### Verificar Logs
```bash
# Docker logs
docker-compose -f docker-compose.staging.yml logs -f

# Portal específico
docker-compose -f docker-compose.staging.yml logs -f admin-portal

# Últimas 100 linhas
docker-compose -f docker-compose.staging.yml logs --tail=100
```

#### Verificar Status
```bash
# Containers rodando
docker-compose -f docker-compose.staging.yml ps

# Health checks
curl -I http://localhost:3001
curl -I http://localhost:3002
curl -I http://localhost:3003
```

#### Métricas
```bash
# Uso de recursos
docker stats

# Espaço em disco
docker system df
```

### 4.3 Troubleshooting

#### Problema: Build Falha
```bash
# Limpar cache
rm -rf .nuxt node_modules
rm package-lock.json yarn.lock

# Reinstalar
npm install

# Rebuild
npm run build
```

#### Problema: Erro de Permissões
```bash
# Verificar permissões
ls -la

# Corrigir
chmod +x scripts/*.sh
```

#### Problema: Porta em Uso
```bash
# Verificar portas
lsof -i :3001
lsof -i :3002
lsof -i :3003

# Matar processo
kill -9 <PID>
```

#### Problema: Memory Limit
```bash
# Verificar uso
docker stats

# Ajustar limites no docker-compose.yml
# services:
#   admin-portal:
#     mem_limit: 1g
```

---

## 🎯 MÓDULO 5: BOAS PRÁTICAS

### 5.1 Padrões de Código

#### Estrutura de Componentes
```vue
<!-- ✅ BOM -->
<template>
  <UCard>
    <template #header>
      <h2>{{ title }}</h2>
    </template>

    <div class="content">
      <slot />
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Props tipadas
interface Props {
  title: string
  variant?: 'default' | 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

// Emits tipados
const emit = defineEmits<{
  submit: [data: any]
}>()

// Lógica
const handleSubmit = () => {
  emit('submit', { ...props })
}
</script>
```

#### Nomenclatura
```typescript
// ✅ Componentes: PascalCase
ProductCard.vue
UserProfile.vue
BillingDashboard.vue

// ✅ Composables: camelCase + use prefix
useApi.ts
useAuth.ts
useProducts.ts

// ✅ Stores: camelCase
auth.ts
products.ts
billing.ts

// ✅ Utils: camelCase
api.ts
helpers.ts
validators.ts
```

#### TypeScript
```typescript
// ✅ Definir interfaces
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'manager'
}

// ✅ Usar tipos específicos
const users = ref<User[]>([])

// ✅ Tipar props e emits
const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  update: [user: User]
  delete: [id: string]
}>()
```

### 5.2 TypeScript & Tipos

#### Tipos Globais
```typescript
// types/index.ts
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'manager'
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

#### Utility Types
```typescript
// ✅ Partial
type UserUpdate = Partial<User>

// ✅ Pick
type UserSummary = Pick<User, 'id' | 'name' | 'email'>

// ✅ Omit
type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

// ✅ Record
type UserMap = Record<string, User>
```

### 5.3 Performance & Otimização

#### Lazy Loading
```typescript
// ✅ Componentes
const ProductList = defineAsyncComponent(() => import('~/components/ProductList.vue'))

// ✅ Rotas
const routes = [
  {
    path: '/products',
    component: () => import('~/pages/products/index.vue')
  }
]
```

#### useAsyncData
```typescript
// ✅ Cache e revalidação
const { data: users } = await useAsyncData('users', () => $fetch('/api/users'), {
  server: true,
  lazy: false,
  immediate: true,
  transform: (data) => data.map(transformUser)
})
```

#### Composables Otimizados
```typescript
// ✅ Memoização com computed
const expensiveValue = computed(() => {
  return heavyCalculation(baseValue.value)
})

// ✅ Evitar effects desnecessários
watch(baseValue, () => {
  // Lógica apenas quando necessário
})
```

---

## 📖 RECURSOS ADICIONAIS

### Documentação
- **Base Template**: `/platform/base-template/README.md`
- **Migração Admin**: `/platform/admin-portal/MIGRATION_REPORT.md`
- **Migração Tenant**: `/platform/tenant-portal/MIGRATION_REPORT_TENANT.md`
- **Deploy Staging**: `/platform/DEPLOYMENT_GUIDE_STAGING.md`
- **Testes E2E**: `/platform/END_TO_END_TEST_REPORT.md`

### Scripts
- **Migrate Admin**: `/platform/scripts/migrate-admin-portal.sh`
- **Migrate Tenant**: `/platform/scripts/migrate-tenant-portal.sh`
- **Deploy**: `/platform/deploy-staging.sh`
- **Docker Compose**: `/platform/docker-compose.staging.yml`

### Links Úteis
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Nuxt UI](https://ui.nuxt.com)
- [Vue 3 Docs](https://vuejs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Pinia](https://pinia.vuejs.org)

---

## ✅ CHECKLIST PÓS-WORKSHOP

### Conhecimentos Adquiridos
- [ ] Compreendo a estrutura do Base Template
- [ ] Sei usar os Composables (useApi, useAuth, etc.)
- [ ] Entendo como funcionam os Stores (Pinia)
- [ ] Consigo criar um novo portal
- [ ] Consigo migrar um portal existente
- [ ] Sei fazer deploy para staging
- [ ] Consigo fazer troubleshooting básico
- [ ] Conheço as boas práticas

### Próximos Passos
- [ ] Praticar criando um portal teste
- [ ] Migrar um portal real
- [ ] Configurar ambiente de desenvolvimento
- [ ] Participar de um deploy real
- [ ] Contribuir para documentação

---

## 🎯 EXERCÍCIOS PRÁTICOS

### Exercício 1: Criar Portal Simples
1. Copiar base template
2. Personalizar título e cores
3. Adicionar uma página com dados da API
4. Fazer build e deploy

### Exercício 2: Migrar Portal
1. Criar backup
2. Executar script de migração
3. Verificar funcionalidades
4. Corrigir problemas encontrados

### Exercício 3: Adicionar Funcionalidade
1. Criar um novo composable
2. Criar um store
3. Criar um componente
4. Integrar em uma página
5. Testar funcionamento

---

## 📞 SUPORTE

### Canais de Comunicação
- **Slack**: #neo-stack-dev
- **Email**: dev@neo-stack.com
- **Issues**: GitHub Issues

### Horário de Suporte
- **Segunda a Sexta**: 9h às 18h
- **Resposta**: < 4 horas
- **Emergências**: 24/7

### Mentoria
- **Pair Programming**: Agendar via Slack
- **Code Review**: Sempre antes de merge
- **Dúvidas**: #neo-stack-dev

---

## ✅ CONCLUSÃO

Este workshop forneceu uma base sólida para trabalhar com o **NEO_STACK Platform v3.0** e o **Base Template** baseado no repositório do Eduardo Leandro.

### Principais Conquistas:
- ✅ **Visão clara** da nova arquitetura
- ✅ **Conhecimento prático** de Composables e Stores
- ✅ **Habilidade** de criar e migrar portais
- ✅ **Capacidade** de fazer deploy e troubleshooting
- ✅ **Entendimento** das boas práticas

### Próximo Passo:
**Aplicar o conhecimento** em um projeto real e contribuir para a evolução da plataforma!

---

**Desenvolvido por**: Claude Code
**Data**: 06 de Dezembro de 2025
**Versão**: 1.0
**Status**: ✅ Pronto para Treinamento
