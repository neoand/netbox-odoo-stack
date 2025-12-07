# 📚 Documentação Platform - NEO_STACK v3.0

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura](#estrutura)
3. [Serviços](#serviços)
4. [Portais](#portais)
5. [Recursos](#recursos)
6. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
7. [Contribuição](#contribuição)

---

## 🎯 Visão Geral

Este diretório contém a documentação completa da **NEO_STACK Platform v3.0**, uma plataforma SaaS multi-tenant que integra NetBox, Odoo, Wazuh, TheHive, MISP e Cortex em uma solução unificada.

### ✨ Características Principais

- **🏗️ Arquitetura Cloud-Native**: Construída para escalar
- **🔐 Multi-Tenant**: Isolamento completo de dados
- **💳 Billing Integrado**: Sistema completo de faturamento
- **📊 Analytics Avançado**: Dashboards e ML integrado
- **🌍 Bilíngue**: Documentação em PT-BR e ES-MX
- **🚀 Orquestração**: Provisionamento automático de stacks

---

## 📁 Estrutura

```
platform/
├── admin-portal/          # Portal administrativo (Vue 3 + Nuxt 3)
│   ├── docs/
│   │   ├── pt/README.md   # Documentação PT-BR
│   │   └── es/README.md   # Documentação ES-MX
├── analytics/             # Plataforma de analytics
│   └── README.md          # Documentação principal
├── billing-service/       # Serviço de faturamento (Stripe)
│   ├── docs/
│   │   ├── pt/README.md   # Documentação PT-BR
│   │   └── es/README.md   # Documentação ES-MX
├── certification/         # Programa de certificação
│   ├── docs/
│   │   ├── pt/README.md   # Documentação PT-BR
│   │   └── es/README.md   # Documentação ES-MX
└── tenant-portal/         # Portal do cliente (Vue 3 + Nuxt 3)
    ├── docs/
    │   ├── pt/README.md   # Documentação PT-BR
    │   └── es/README.md   # Documentação ES-MX
```

---

## 🛠️ Serviços

### **Core Services**

#### 1. **API Gateway**
- **Tecnologia**: Kong ou Traefik
- **Função**: Roteamento, autenticação, rate limiting
- **Porta**: 8000
- **Status**: ✅ Implementado

#### 2. **Auth Service**
- **Tecnologia**: Authentik
- **Função**: Autenticação centralizada (OAuth2/OIDC)
- **Porta**: 9000
- **Status**: ✅ Implementado

#### 3. **Billing Service**
- **Tecnologia**: FastAPI + Stripe
- **Função**: Faturamento e assinaturas
- **Porta**: 8001
- **Status**: ✅ Implementado
- **Docs**: [PT-BR](./billing-service/docs/pt/README.md) | [ES-MX](./billing-service/docs/es/README.md)

#### 4. **Tenant Manager**
- **Tecnologia**: FastAPI
- **Função**: Gerenciamento de tenants
- **Porta**: 8002
- **Status**: 🚧 Em desenvolvimento

#### 5. **Stack Deployer**
- **Tecnologia**: Docker Swarm/K8s
- **Função**: Provisionamento automático
- **Porta**: 8003
- **Status**: 🚧 Em desenvolvimento

#### 6. **Monitoring Service**
- **Tecnologia**: Prometheus + Grafana
- **Função**: Observabilidade completa
- **Porta**: 9090 (Prometheus), 3000 (Grafana)
- **Status**: ✅ Implementado

---

## 🖥️ Portais

### **Admin Portal**
- **Tecnologia**: Vue 3 + Nuxt 3 + Nuxt UI
- **Funcionalidades**:
  - Dashboard executivo
  - Gerenciamento de tenants
  - Billing e assinaturas
  - Configurações globais
  - Analytics avançado
- **Porta**: 3002
- **Credenciais**: admin / admin123
- **Status**: ✅ Implementado
- **Docs**: [PT-BR](./admin-portal/docs/pt/README.md) | [ES-MX](./admin-portal/docs/es/README.md)

### **Tenant Portal**
- **Tecnologia**: Vue 3 + Nuxt 3 + Nuxt UI
- **Funcionalidades**:
  - Dashboard do cliente
  - Gerenciamento de recursos
  - Billing e faturas
  - Suporte
  - Configurações da conta
- **Porta**: 3003
- **Status**: ✅ Implementado
- **Docs**: [PT-BR](./tenant-portal/docs/pt/README.md) | [ES-MX](./tenant-portal/docs/es/README.md)

---

## 📊 Analytics Platform

A **Analytics Platform** é uma solução completa de analytics em tempo real que processa dados de múltiplas fontes e fornece insights acionáveis.

### Características
- **⚡ Real-Time**: Pipeline ETL com latência < 5 min
- **🤖 3 ML Models**: Detecção de anomalias, previsão de capacidade, predição de incidentes
- **📊 6 Dashboards**: Executivo, Infraestrutura, Segurança, Tickets, Rede, Capacidade
- **🔄 Pipeline**: Apache Kafka + TimescaleDB
- **📈 Predições**: 80-95% de precisão

### Componentes
| Serviço | Tecnologia | Porta | Status |
|---------|-----------|-------|--------|
| Dashboard | Vue 3 + Chart.js | 3005 | ✅ |
| ML Models API | FastAPI + scikit-learn | 8001 | ✅ |
| Analytics API Gateway | FastAPI | 8002 | ✅ |
| Data Warehouse | TimescaleDB | 5434 | ✅ |
| Cache | Redis | 6381 | ✅ |
| Streaming | Apache Kafka | 9092 | ✅ |
| Jupyter | Jupyter Lab | 8888 | ✅ |
| Airflow | Apache Airflow | 8080 | ✅ |

**Documentação**: [Analytics README.md](../analytics/README.md)

---

## 🏆 Certification Program

O **NEO_STACK Certification Program** oferece certificação profissional em 4 níveis:

### Níveis
1. **Level 1 - Analytics Fundamentals**
2. **Level 2 - ML Models Practitioner**
3. **Level 3 - Analytics Architect**
4. **Level 4 - Analytics Master**

### Recursos
- Materiais de estudo bilíngues
- Exames práticos
- Laboratórios hands-on
- Certificados digitais

**Documentação**: [Certification README.md](../certification/README.md)
**Study Materials**: [PT-BR](../certification/study-materials/pt/README.md) | [ES-MX](../certification/study-materials/es/README.md)

---

## 📖 Guia de Desenvolvimento

### Pré-requisitos

- Node.js 18+
- Python 3.11+
- Docker 24+
- Docker Compose 2.0+
- Git

### Setup Inicial

```bash
# Clone o repositório
git clone https://github.com/your-org/neo_netbox_odoo_stack.git
cd neo_netbox_odoo_stack/platform

# Setup completo
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Executando Serviços

```bash
# Todos os serviços
docker-compose up -d

# Serviço específico
docker-compose up -d billing-service
docker-compose up -d admin-portal
docker-compose up -d tenant-portal
```

### Desenvolvimento

```bash
# Admin Portal
cd admin-portal
npm install
npm run dev

# Billing Service
cd billing-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload

# Analytics Platform
cd analytics
docker-compose up -d
# Acesse: http://localhost:3005
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Platform
PLATFORM_ENV=production
DOMAIN=platform.local

# Database
POSTGRES_PASSWORD=secure_password
DATABASE_URL=postgresql://...

# Redis
REDIS_PASSWORD=redis_password

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Auth
AUTH_SECRET=your-secret
JWT_SECRET=jwt-secret
```

### Configuração de Rede

```yaml
# docker-compose.yml
services:
  api-gateway:
    ports:
      - "8000:8000"
  admin-portal:
    ports:
      - "3002:3002"
  tenant-portal:
    ports:
      - "3003:3003"
```

---

## 🧪 Testes

```bash
# Todos os serviços
docker-compose -f docker-compose.test.yml up -d

# Testes específicos
docker-compose exec billing-service pytest
docker-compose exec admin-portal npm test

# Coverage
docker-compose exec billing-service pytest --cov=api
```

---

## 📊 Monitoramento

### Health Checks

```bash
# Todos os serviços
curl http://localhost/health

# Serviços específicos
curl http://localhost:8000/health  # API Gateway
curl http://localhost:8001/health  # Billing
curl http://localhost:3002/health  # Admin Portal
```

### Métricas

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Analytics Dashboards**: http://localhost:3005

---

## 🚀 Deployment

### Produção

```bash
# Build
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Verificar
docker-compose ps
```

### Kubernetes

```bash
# Deploy no K8s
kubectl apply -f k8s/

# Verificar status
kubectl get pods
kubectl get services
```

---

## 🔒 Segurança

### Headers de Segurança

```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000";
```

### Autenticação

- **JWT Tokens**: Para API
- **OAuth2/OIDC**: Para portais
- **RBAC**: Controle de acesso baseado em roles

### Criptografia

- **TLS 1.3**: Comunicação segura
- **AES-256**: Dados em repouso
- **bcrypt**: Hash de senhas

---

## 📚 Documentação Adicional

### Guias

- [Arquitetura da Plataforma](./docs/architecture.md)
- [Guia de Deployment](./docs/deployment.md)
- [Segurança](./docs/security.md)
- [Monitoramento](./docs/monitoring.md)
- [Troubleshooting](./docs/troubleshooting.md)

### APIs

- [API Gateway](./api-gateway/README.md)
- [Billing Service](./billing-service/README.md)
- [Analytics API](../analytics/docs/api-reference.md)

### Training

- [Materiais de Estudo](../certification/study-materials/)
- [Laboratórios](../labs/)
- [Tutoriais](../tutorials/)

---

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o repositório
2. **Criar branch**: `git checkout -b feature/nova-funcionalidade`
3. **Commit**: `git commit -m "feat: adicionar..."`
4. **Push**: `git push origin feature/nova-funcionalidade`
5. **PR**: Abrir Pull Request

### Convenções

- **Commits**: Conventional Commits
- **Branches**: `feature/`, `bugfix/`, `hotfix/`
- **Código**: ESLint + Prettier
- **Docs**: Bilíngue (PT-BR + ES-MX)

### Testes

```bash
# Executar todos os testes
make test

# Testes unitários
make test-unit

# Testes de integração
make test-integration

# Coverage
make test-coverage
```

---

## 📞 Suporte

- **Email**: support@neo-stack.com
- **Slack**: #platform-support
- **GitHub Issues**: [Issues](https://github.com/neo-stack/neo_netbox_odoo_stack/issues)
- **Documentação**: http://docs.platform.local

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](../../LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- NetBox pela gestão de recursos de rede
- Odoo pelo ERP integrado
- Wazuh pela segurança
- TheHive pela gestão de incidentes
- MISP pela threat intelligence
- Cortex pela análise de artefatos
- Stripe pela infraestrutura de pagamentos
- Vue.js e Nuxt pela interface moderna
- FastAPI pela API robusta

---

**Desenvolvido com ❤️ para o NEO_STACK Platform v3.0**

[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-orange.svg)](https://claude.ai)
