# 💳 Billing Service - NEO_STACK Platform v3.0

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Arquitetura](#arquitetura)
4. [Instalação](#instalação)
5. [Configuração](#configuração)
6. [API Reference](#api-reference)
7. [Integração com Stripe](#integração-com-stripe)
8. [Monitoramento](#monitoramento)
9. [Uso](#uso)
10. [Troubleshooting](#troubleshooting)
11. [Contribuição](#contribuição)

---

## 🎯 Visão Geral

O **Billing Service** é um serviço de faturamento multi-tenant completo integrado ao Stripe, desenvolvido para o NEO_STACK Platform v3.0. Ele fornece funcionalidades abrangentes de gerenciamento de assinaturas, cobrança baseada em uso, geração de faturas e processamento de pagamentos para plataformas SaaS multi-tenant.

### ✨ Características Principais

- **🔐 Multi-tenant**: Isolamento completo de dados por tenant
- **💳 Integração Stripe**: Processamento de pagamentos via Stripe
- **📊 Billing baseado em uso**: Rastreamento de recursos e limites
- **🧾 Geração de faturas**: Criação automática de PDFs
- **📧 Notificações**: Email, Slack, alertas personalizados
- **📈 Métricas**: Prometheus + Grafana para observabilidade
- **⚡ Cache Redis**: Performance otimizada
- **🔒 Segurança**: JWT, RLS, criptografia

---

## 🚀 Funcionalidades

### 1. **Gerenciamento de Assinaturas**
- Criação e cancelamento de assinaturas
- Alteração de planos
- Períodos de teste
- Coupons e descontos
- Faturamento recorrente

### 2. **Faturas e Pagamentos**
- Geração automática de faturas
- PDFs personalizados
- Métodos de pagamento múltiplos (Cartão, PayPal, etc.)
- Tentativas de pagamento automáticas
- Reembolsos e ajustes

### 3. **Rastreamento de Uso**
- Métricas por recurso (API calls, storage, usuários)
- Integração com NetBox e Odoo
- Alertas de limite
- Relatórios de uso

### 4. **Coupons e Descontos**
- Coupons de percentual ou valor fixo
- Múltiplos redemptions
- Períodos de validade
- Aplicação automática

### 5. **Alertas e Notificações**
- Pagamentos falharam
- Limites de uso excedidos
- Faturas em atraso
- Trial ending

---

## 🏗️ Arquitetura

### Diagrama de Componentes

```mermaid
graph TB
    subgraph "Billing Service"
        API[Billing API]
        Worker[Billing Worker]
        Invoice[Invoice Generator]
        Usage[Usage Tracker]
        Webhook[Webhook Handler]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    subgraph "External"
        Stripe[Stripe API]
        SMTP[Email Service]
        Slack[Slack Webhook]
    end

    subgraph "Monitoring"
        Prometheus[Prometheus]
        Grafana[Grafana]
    end

    API --> PG
    API --> Redis
    API --> Stripe
    Worker --> PG
    Worker --> Redis
    Invoice --> PG
    Usage --> PG
    Webhook --> Stripe
    API --> Prometheus
    Worker --> Prometheus
```

### Stack Tecnológico

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| API | FastAPI | 0.104+ |
| Database | PostgreSQL | 16+ |
| Cache | Redis | 7+ |
| Payments | Stripe | 7+ |
| API Docs | Swagger/OpenAPI | 3.0 |
| Metrics | Prometheus | Latest |
| Dashboard | Grafana | Latest |
| Web Server | Nginx | Alpine |
| Container | Docker | 24+ |

---

## 📦 Instalação

### Pré-requisitos

- Docker 24+
- Docker Compose 2.0+
- Python 3.11+
- 4GB RAM mínimo
- 10GB espaço em disco

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/your-org/neo_netbox_odoo_stack.git
cd neo_netbox_odoo_stack/platform/billing-service

# Execute o setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Instalação Manual

```bash
# 1. Criar diretórios
mkdir -p data/{postgres,redis,prometheus,grafana,invoices}

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Iniciar serviços
cd docker
docker-compose up -d

# 4. Verificar status
curl http://localhost:8000/health
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

#### Database
```env
DATABASE_URL=postgresql+asyncpg://billing_user:password@postgres:5432/billing
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=30
POSTGRES_PASSWORD=secure_password
```

#### Redis
```env
REDIS_URL=redis://:password@redis:6379/0
REDIS_PASSWORD=redis_password
```

#### Stripe
```env
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...
```

#### SMTP
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=billing@platform.local
SMTP_PASSWORD=smtp_password
SMTP_FROM_EMAIL=billing@platform.local
```

#### Externo
```env
NETBOX_API_URL=https://netbox.example.com
NETBOX_API_TOKEN=netbox_token
ODOO_API_URL=https://odoo.example.com
ODOO_API_KEY=odoo_key
```

### Configuração do Stripe

1. **Criar conta Stripe**: https://stripe.com
2. **Obter API Keys**:
   - Publishable Key (pk_test_...)
   - Secret Key (sk_test_...)
3. **Configurar Webhooks**:
   - Endpoint: `https://your-domain.com/api/v1/webhooks/stripe`
   - Eventos:
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### Configuração de Planos

```sql
INSERT INTO plans (plan_id, name, price_monthly, features, limits) VALUES
('free', 'Free', 0.00, '["Basic features"]', '{"api_calls": 1000}'),
('starter', 'Starter', 29.00, '["All Free", "Email support"]', '{"api_calls": 10000}'),
('professional', 'Professional', 99.00, '["All Starter", "Priority support"]', '{"api_calls": 100000}'),
('enterprise', 'Enterprise', 299.00, '["All Professional", "24/7 support"]', '{"api_calls": 1000000}');
```

---

## 📚 API Reference

### Autenticação

```bash
# Obter token JWT
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Planos

```bash
# Listar planos
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/plans
```

**Response:**
```json
[
  {
    "plan_id": "starter",
    "name": "Starter",
    "price_monthly": 29.00,
    "price_yearly": 290.00,
    "features": ["All Free", "Email support"],
    "limits": {
      "api_calls": 10000,
      "storage_gb": 50
    }
  }
]
```

### Assinaturas

```bash
# Criar assinatura
curl -X POST http://localhost:8000/api/v1/subscriptions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price_id": "price_123",
    "plan_id": "starter",
    "trial_days": 14
  }'
```

```bash
# Cancelar assinatura
curl -X PUT http://localhost:8000/api/v1/subscriptions/current \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"cancel_at_period_end": true}'
```

### Faturas

```bash
# Listar faturas
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/invoices
```

```bash
# Detalhes da fatura
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/invoices/{invoice_id}
```

### Pagamentos

```bash
# Adicionar método de pagamento
curl -X POST http://localhost:8000/api/v1/payment-methods \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "card",
    "token": "pm_123"
  }'
```

### Uso

```bash
# Registrar uso
curl -X POST http://localhost:8000/api/v1/usage \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resource_type": "api_calls",
    "quantity": 100,
    "unit": "requests",
    "period_start": "2024-01-01T00:00:00Z",
    "period_end": "2024-01-31T23:59:59Z",
    "source": "api"
  }'
```

```bash
# Resumo de uso
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/usage/summary
```

### Coupons

```bash
# Aplicar coupon
curl -X POST http://localhost:8000/api/v1/coupons/apply \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "WELCOME20"}'
```

---

## 🔌 Integração com Stripe

### Fluxo de Pagamento

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as Billing API
    participant S as Stripe
    participant DB as Database
    participant E as Email

    C->>API: Criar assinatura
    API->>S: Criar customer + subscription
    S->>API: Retornar client_secret
    API->>C: Retornar payment intent
    C->>S: Confirmar pagamento
    S->>API: Webhook - payment_succeeded
    API->>DB: Atualizar status
    API->>E: Enviar confirmação
```

### Configuração de Produtos

```python
# Criar produto no Stripe
product = stripe.Product.create(
    name="Starter Plan",
    description="Perfect for small teams"
)

# Criar preço
price = stripe.Price.create(
    product=product.id,
    unit_amount=2900,  # $29.00
    currency="usd",
    recurring={"interval": "month"}
)
```

### Webhooks

```python
# Handler de webhook (implementado no serviço)
@app.post("/api/v1/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    event = stripe_client.verify_webhook(payload, sig_header)

    if event["type"] == "invoice.payment_succeeded":
        await handle_payment_success(event["data"]["object"])
    elif event["type"] == "invoice.payment_failed":
        await handle_payment_failure(event["data"]["object"])
```

---

## 📊 Monitoramento

### Métricas Prometheus

```
billing_subscriptions_total{status="active", plan_id="starter"} 45
billing_monthly_revenue_dollars 15420.50
billing_api_requests_total{method="POST", endpoint="/api/v1/subscriptions", status="200"} 1234
```

### Dashboards Grafana

Acesse http://localhost:3001 (admin/admin)

Dashboards disponíveis:
- **Billing Overview**: Métricas gerais de faturamento
- **Subscriptions**: Status e métricas de assinaturas
- **Revenue**: Análise de receita
- **Usage**: Rastreamento de uso por recurso

### Alertas

```yaml
# alertmanager.yml
- alert: HighFailedPayments
  expr: rate(billing_payments_total{status="failed"}[5m]) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High rate of failed payments"
```

---

## 📖 Uso

### Criando um Tenant

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/tenants",
    json={
        "name": "Acme Corp",
        "slug": "acme",
        "email": "billing@acme.com"
    },
    headers={"X-Tenant-ID": "admin"}
)

tenant = response.json()
print(f"Tenant ID: {tenant['tenant_id']}")
```

### Configurando Assinatura

```python
# 1. Obter planos
response = requests.get(
    "http://localhost:8000/api/v1/plans",
    headers={"Authorization": f"Bearer {token}"}
)
plans = response.json()

# 2. Criar assinatura
response = requests.post(
    "http://localhost:8000/api/v1/subscriptions",
    json={
        "price_id": plans[1]["stripe_price_id"],
        "plan_id": "starter",
        "trial_days": 14
    },
    headers={"Authorization": f"Bearer {token}"}
)

subscription = response.json()
print(f"Subscription: {subscription['status']}")
```

### Rastreando Uso

```python
import time
from datetime import datetime, timedelta

# Registrar uso de API
for i in range(100):
    requests.post(
        "http://localhost:8000/api/v1/usage",
        json={
            "resource_type": "api_calls",
            "quantity": 1,
            "unit": "requests",
            "period_start": datetime.utcnow().isoformat(),
            "period_end": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "source": "api"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
```

### Consultando Faturas

```python
# Listar faturas
response = requests.get(
    "http://localhost:8000/api/v1/invoices",
    headers={"Authorization": f"Bearer {token}"}
)
invoices = response.json()

for invoice in invoices:
    print(f"Fatura {invoice['invoice_number']}: ${invoice['total']}")
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Stripe

```bash
# Verificar API key
curl https://api.stripe.com/v1/account \
  -u sk_test_your_key:

# Verificar logs
docker-compose -f docker/docker-compose.yml logs api | grep stripe
```

**Solução:**
- Verificar se STRIPE_API_KEY está correta
- Confirmar se a chave é do ambiente correto (test/prod)
- Verificar permissões da chave

#### 2. PostgreSQL não inicia

```bash
# Verificar logs
docker-compose -f docker/docker-compose.yml logs postgres

# Resetar database
docker-compose -f docker/docker-compose.yml down -v
docker volume rm billing-service_postgres-data
```

#### 3. Redis Connection Error

```bash
# Verificar Redis
docker-compose -f docker/docker-compose.yml exec redis redis-cli ping

# Verificar configuração
docker-compose -f docker/docker-compose.yml logs redis
```

#### 4. Webhook não funciona

```bash
# Testar webhook localmente
curl -X POST http://localhost:8001/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "data": {}}'

# Verificar logs
docker-compose -f docker/docker-compose.yml logs webhook-handler
```

#### 5. Fatura não gera PDF

```bash
# Verificar wkhtmltopdf
docker-compose -f docker/docker-compose.yml exec invoice-generator \
  wkhtmltopdf --version

# Verificar permissões
docker-compose -f docker/docker-compose.yml exec invoice-generator \
  ls -la /app/data/invoices/
```

### Logs

```bash
# API logs
docker-compose -f docker/docker-compose.yml logs -f api

# Worker logs
docker-compose -f docker/docker-compose.yml logs -f worker

# Webhook logs
docker-compose -f docker/docker-compose.yml logs -f webhook-handler

# Nginx logs
docker-compose -f docker/docker-compose.yml logs -f nginx
```

### Health Checks

```bash
# Verificar todos os serviços
curl http://localhost/health

# Verificar API
curl http://localhost:8000/health

# Verificar Prometheus
curl http://localhost:9091/-/ready

# Verificar Grafana
curl http://localhost:3001/api/health

# Verificar database
docker-compose -f docker/docker-compose.yml exec postgres \
  pg_isready -U billing_user -d billing

# Verificar Redis
docker-compose -f docker/docker-compose.yml exec redis \
  redis-cli ping
```

### Performance

```bash
# Monitorar recursos
docker stats

# Verificar métricas
curl http://localhost:8000/metrics | grep billing_api_requests_total

# Verificar queries lentas
docker-compose -f docker/docker-compose.yml exec postgres \
  psql -U billing_user -d billing -c \
  "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

## 🤝 Contribuição

### Desenvolvimento

```bash
# Setup ambiente dev
python3 -m venv venv
source venv/bin/activate
pip install -r api/requirements.txt

# Executar testes
pytest api/tests/ -v

# Formatação
black api/
isort api/

# Type checking
mypy api/
```

### Estrutura do Código

```
billing-service/
├── api/                    # FastAPI application
│   ├── main.py            # Entry point
│   ├── database.py        # Database config
│   ├── stripe_client.py   # Stripe integration
│   ├── cache.py           # Redis cache
│   ├── usage_tracker.py   # Usage tracking
│   ├── invoice_generator.py # Invoice PDF
│   ├── security.py        # Auth/JWT
│   └── metrics.py         # Prometheus metrics
├── models/                # Pydantic models
│   ├── tenant.py
│   ├── subscription.py
│   ├── invoice.py
│   ├── payment.py
│   ├── usage.py
│   └── coupon.py
├── docker/                # Docker Compose
│   └── docker-compose.yml
├── config/                # Configuration
│   ├── database/
│   ├── prometheus/
│   ├── grafana/
│   └── nginx/
├── scripts/               # Setup scripts
│   └── setup.sh
└── docs/                  # Documentation
    ├── pt/
    └── es/
```

### Commit Convention

```
feat: Adicionar novo endpoint de coupon
fix: Corrigir bug na geração de PDF
docs: Atualizar documentação da API
refactor: Refatorar cache Redis
test: Adicionar testes para webhook
chore: Atualizar dependências
```

### Pull Request

1. Fork o repositório
2. Criar branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m "feat: adicionar..."`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abrir PR com descrição detalhada

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

- **Email**: billing-support@platform.local
- **Slack**: #billing-service
- **Documentação**: http://localhost:8000/docs
- **Issues**: https://github.com/your-org/neo_netbox_odoo_stack/issues

---

## 🙏 Agradecimentos

- Stripe pela API de pagamentos
- FastAPI pela framework web
- Prometheus pela observability
- Grafana pelos dashboards
- Comunidade open source

---

**Desenvolvido com ❤️ para o NEO_STACK Platform v3.0**
