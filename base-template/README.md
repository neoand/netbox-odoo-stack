# 🚀 NEO_STACK Base Template

> Template base para projetos NEO_STACK Platform v3.0 - Nuxt 3 + Vue 3 + Nuxt UI

## ✨ Características

- ⚡ **Nuxt 3** - Full-stack framework
- 🎨 **Nuxt UI** - Componentes reutilizáveis
- 🎯 **TypeScript** - Type safety completo
- 📦 **Pinia** - State management
- 🔧 **Tailwind CSS** - Utility-first CSS
- 🌙 **Dark Mode** - Suporte a temas
- 🌍 **i18n** - Internacionalização (PT-BR, ES-MX)
- 🧪 **Vitest** - Testes unitários
- 🔒 **ESLint + Prettier** - Code quality

## 🚀 Quick Start

### Instalação

```bash
# 1. Clone este template
git clone https://github.com/your-org/neo-stack-base-template.git my-project
cd my-project

# 2. Setup automático
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Iniciar desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Start dev server
npm run build        # Build produção
npm run preview      # Preview build

# Qualidade
npm run lint         # ESLint
npm run lint:fix     # Fix linting
npm run type-check   # TypeScript check

# Testes
npm run test         # Run tests
npm run test:ui      # UI test runner
```

## 📁 Estrutura

```
base-template/
├── assets/              # Assets estáticos
├── components/          # Componentes Vue
├── composables/         # Composables reutilizáveis
│   ├── useApi.ts        # API layer
│   ├── useAuth.ts       # Autenticação
│   ├── useTheme.ts      # Tema
│   ├── useI18n.ts       # i18n
│   └── useToast.ts      # Notificações
├── layouts/             # Layouts de página
├── middleware/          # Middleware Nuxt
├── pages/               # Páginas (rotas automáticas)
├── stores/              # Pinia stores
├── types/               # TypeScript types
├── utils/               # Utilitários
│   ├── api.ts           # Cliente HTTP
│   ├── helpers.ts       # Funções auxiliares
│   └── validators.ts    # Validadores
├── .editorconfig        # Configuração editor
├── .eslintrc.cjs        # ESLint
├── .prettierrc          # Prettier
├── app.vue              # Componente raiz
├── nuxt.config.ts       # Configuração Nuxt
├── package.json         # Dependências
└── tailwind.config.js   # Tailwind CSS
```

## 🔌 API Layer

### Uso Básico

```typescript
// GET request
const { data, loading } = await useApiGet('/api/users')

// POST request
const { data } = await useApiPost('/api/users', {
  name: 'João',
  email: 'joao@example.com'
})

// Com autenticação automática
const { data } = await useApiGet('/api/profile', {
  auth: true
})
```

### Composables Disponíveis

| Composables | Descrição |
|-------------|-----------|
| `useApi` | Cliente HTTP com interceptors |
| `useAuth` | Autenticação completa |
| `useTheme` | Gerenciamento de tema |
| `useI18n` | Internacionalização |
| `useToast` | Notificações |

## 🎨 Sistema de Design

### Componentes Base

- Layout com sidebar
- Formulários com validação
- Tabelas responsivas
- Modais e drawers
- Notificações

### Tema

```typescript
// Toggle dark mode
const { toggleMode } = useDarkMode()
toggleMode()

// Aplicar tema customizado
const { setTheme } = useTheme()
setTheme('purple')
```

## 🔒 Autenticação

```typescript
const { user, login, logout, isAuthenticated } = useAuth()

// Login
await login({
  email: 'admin@platform.local',
  password: 'password123'
})

// Verificar auth
if (!isAuthenticated.value) {
  await navigateTo('/auth/login')
}
```

## 🌍 Internacionalização

```typescript
const { t, locale } = useI18n()

// Tradução
t('auth.login') // "Login"

// Mudar idioma
locale.value = 'es'
```

## 🧪 Testes

```bash
# Run tests
npm run test

# Coverage
npm run test:coverage

# UI
npm run test:ui
```

## 📦 Deploy

### Docker

```bash
# Build
docker build -t neo-stack-app .

# Run
docker run -p 3000:3000 neo-stack-app
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adicionar...'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um PR

## 📄 Licença

MIT License

## 🙏 Agradecimentos

- [Nuxt](https://nuxt.com)
- [Nuxt UI](https://ui.nuxt.com)
- [Vue.js](https://vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Pinia](https://pinia.vuejs.org)
- [@eduardolecdt](https://github.com/eduardolecdt/base-nuxtjs) pelo template base

---

**Desenvolvido com ❤️ para NEO_STACK Platform**
