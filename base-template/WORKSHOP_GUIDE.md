# 🎓 Guia do Workshop - Base Template

## 📋 Agenda do Workshop

### **Duração**: 2 horas
### **Participantes**: Equipe de Frontend
### **Objetivo**: Capacitar a equipe no uso do base template

---

## ⏰ Cronograma

### **Bloco 1: Introdução** (20 min)
- [ ] Apresentação do projeto
- [ ] Objetivos do base template
- [ ] Benefícios alcançados
- [ ] Demonstração rápida

### **Bloco 2: Arquitetura** (30 min)
- [ ] Estrutura do base template
- [ ] Composables explicados
- [ ] Utils e helpers
- [ ] Stores Pinia
- [ ] Sistema de design

### **Bloco 3: Hands-On** (45 min)
- [ ] Setup de um novo projeto
- [ ] Uso dos composables
- [ ] Criação de componentes
- [ ] Aplicação do tema

### **Bloco 4: Migração** (20 min)
- [ ] Processo de migração
- [ ] Scripts disponíveis
- [ ] Resolução de problemas
- [ ] Q&A

### **Bloco 5: Próximos Passos** (5 min)
- [ ] Roadmap
- [ ] Dúvidas finais
- [ ] Feedback

---

## 📝 Notas para o Instrutor

### **Slides de Apoio**

#### Slide 1: Visão Geral
```markdown
# Base Template - NEO_STACK v3.0

## O que é?
- Template base para frontends
- Baseado no base-nuxtjs (Eduardo Leandro)
- Nuxt 3 + Vue 3 + Nuxt UI + Pinia

## Por que usar?
- Setup rápido (30 min vs 2-4h)
- Código padronizado
- Componentes reutilizáveis
- Documentação completa
```

#### Slide 2: Estrutura
```markdown
# Estrutura do Projeto

base-template/
├── composables/      # useApi, useAuth, useTheme, etc.
├── utils/            # helpers, validators, api
├── components/ui/    # BaseButton, BaseCard, BaseInput
├── stores/           # Pinia stores
├── layouts/          # Layouts padrão
├── pages/            # Páginas base
└── scripts/          # setup, dev, build, deploy
```

#### Slide 3: Composables
```markdown
# Composables Principais

## useApi()
- Cliente HTTP com interceptors
- GET, POST, PUT, DELETE
- Paginação automática
- Error handling

## useAuth()
- Login, logout, registro
- Gerenciamento de token
- Guards de rota

## useTheme()
- Light/Dark mode
- Cores customizáveis
- Persistência
```

#### Slide 4: Componentes
```markdown
# Componentes UI

## BaseButton
- Variantes: solid, outline, ghost, link
- Tamanhos: xs, sm, md, lg, xl
- Estados: loading, disabled, icon

## BaseCard
- Variantes: default, soft, outline, solid
- Slots: header, default, footer
- Responsive e dark mode

## BaseInput
- Formulários com validação
- Estados: error, hint, loading
- Tipos: text, email, password, etc.
```

### **Demonstração Prática**

#### Demo 1: Setup Rápido
```bash
# 1. Clone o template
git clone base-template my-project
cd my-project

# 2. Setup automático
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Iniciar desenvolvimento
npm run dev
```

#### Demo 2: Usar Composables
```vue
<script setup lang="ts">
// API call
const { data, loading, error } = await useApiGet('/api/users')

// Auth
const { user, login } = useAuth()
await login({ email, password })

// Theme
const { isDark, toggleMode } = useDarkMode()
toggleMode()
</script>
```

#### Demo 3: Componentes
```vue
<template>
  <BaseCard variant="soft" rounded="lg">
    <template #header>
      <h3>Novo Usuário</h3>
    </template>

    <UForm :state="form" @submit="handleSubmit">
      <BaseInput v-model="form.name" label="Nome" required />
      <BaseInput v-model="form.email" label="Email" type="email" required />
      <BaseButton type="submit" :loading="loading">
        Salvar
      </BaseButton>
    </UForm>
  </BaseCard>
</template>
```

---

## 🎯 Exercícios Práticos

### **Exercício 1: Setup**
**Tempo**: 10 minutos
**Objetivo**: Criar um novo projeto usando o base template

**Passos**:
1. Clone o base-template
2. Execute o script de setup
3. Inicie o servidor de desenvolvimento
4. Verifique se está rodando em http://localhost:3000

**Solução**:
```bash
git clone base-template my-demo-app
cd my-demo-app
chmod +x scripts/setup.sh
./scripts/setup.sh
npm run dev
```

### **Exercício 2: Composables**
**Tempo**: 15 minutos
**Objetivo**: Usar os composables em uma página

**Tarefa**: Modifique `pages/index.vue` para:
1. Fazer uma chamada de API (mock)
2. Exibir o estado de loading
3. Implementar um toggle de tema
4. Mostrar notificação de sucesso

**Solução**:
```vue
<script setup lang="ts">
const { data, loading } = await useApiGet('/api/stats')
const { isDark, toggleMode } = useDarkMode()
const { success } = useToast()

const handleAction = () => {
  success('Sucesso!', 'Ação realizada com sucesso')
}
</script>
```

### **Exercício 3: Componentes**
**Tempo**: 15 minutos
**Objetivo**: Criar um formulário usando os componentes base

**Tarefa**: Crie uma página `/pages/user.vue` com:
1. Formulário de usuário (nome, email, senha)
2. Validação dos campos
3. Botão de envio com loading
4. Card com layout responsivo

**Solução**:
```vue
<template>
  <BaseCard variant="default" rounded="lg" class="max-w-md mx-auto">
    <template #header>
      <h3>Novo Usuário</h3>
    </template>

    <UForm :state="form" @submit="handleSubmit">
      <BaseInput v-model="form.name" label="Nome" required />
      <BaseInput v-model="form.email" label="Email" type="email" required />
      <BaseInput v-model="form.password" label="Senha" type="password" required />
      <BaseButton type="submit" block :loading="loading">
        Criar Usuário
      </BaseButton>
    </UForm>
  </BaseCard>
</template>
```

### **Exercício 4: Migração**
**Tempo**: 5 minutos
**Objetivo**: Entender o processo de migração

**Tarefa**: Identifique os arquivos que seriam migrados do admin-portal atual

**Resposta**:
- package.json (dependências)
- nuxt.config.ts (configuração)
- composables/ (API, auth, theme, etc.)
- utils/ (helpers, validators)
- stores/ (auth store)
- middleware/ (auth middleware)
- layouts/ (layouts padrão)
- pages/ (páginas base)
- components/ui/ (componentes base)
- assets/css/ (estilos)

---

## ❓ FAQ - Perguntas Frequentes

### **P: O base-template substitui nosso código atual?**
R: Não. O base-template é uma **base** que você usa para criar novos projetos ou migrar existentes. Seu código customizado será preservado.

### **P: Posso modificar o base-template?**
R: Sim, mas é recomendado criar um fork ou branch para não perder as atualizações do template base.

### **P: Como atualizo o base-template em projetos existentes?**
R: Compare seu projeto com o base-template e aplique as mudanças manualmente ou use os scripts de migração.

### **P: Preciso usar todos os composables?**
R: Não. Use apenas os que precisar. O base-template é modular.

### **P: Como contribution back para o base-template?**
R: Crie uma branch, faça as mudanças, teste e abra um PR com descrição detalhada.

---

## 📚 Recursos Adicionais

### **Documentação**
- README.md - Visão geral
- DESIGN_SYSTEM.md - Sistema de design
- COMPONENTS.md - Catálogo de componentes
- MIGRATION_GUIDE.md - Guia de migração

### **Links Úteis**
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Nuxt UI](https://ui.nuxt.com)
- [Vue 3](https://vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Pinia](https://pinia.vuejs.org)
- [Eduardo's base-nuxtjs](https://github.com/eduardolecdt/base-nuxtjs)

### **Comunidade**
- Slack: #frontend-team
- GitHub: Issues e Discussions
- Email: frontend@neo-stack.com

---

## ✅ Checklist do Workshop

### **Antes do Workshop**
- [ ] Preparar ambiente (Node 18+, npm/yarn/pnpm)
- [ ] Clonar base-template
- [ ] Testar scripts de setup
- [ ] Preparar slides
- [ ] Configurar tela/câmera

### **Durante o Workshop**
- [ ] Apresentar objetivos
- [ ] Demonstrar estrutura
- [ ] Executar exercícios
- [ ] Responder perguntas
- [ ] Coletar feedback

### **Após o Workshop**
- [ ] Enviar gravação (se houver)
- [ ] Compartilhar materiais
- [ ] Criar issues para melhorias
- [ ] Planejar próximo workshop
- [ ] Atualizar documentação

---

## 🎓 Certificado de Participação

```markdown
# Certificado de Participação

Certificamos que ___________________ participated do workshop
"Base Template - NEO_STACK v3.0" em ___/___/2025.

Duração: 2 horas
Tópicos: Base template, Composables, Componentes, Migração

Instrutor: Claude Opus 4.5
```

---

## 📝 Feedback do Workshop

### **Avaliação (1-5)**
- [ ] Conteúdo foi útil?
- [ ] Duração adequada?
- [ ] Exercícios práticos?
- [ ] Clareza das explicações?
- [ ] Material de apoio?

### **Comentários**
```
Suas sugestões para melhorar o workshop:

_________________________________

_________________________________

_________________________________
```

### **Próximos Workshops**
- [ ] Workshop Avançado (Customização)
- [ ] Workshop de Testes
- [ ] Workshop de Performance
- [ ] Workshop de Deploy

---

**Preparado por**: Claude Opus 4.5
**Data**: 06 de Dezembro de 2025
**Versão**: 1.0.0
