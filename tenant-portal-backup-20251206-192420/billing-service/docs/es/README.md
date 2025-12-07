# 💳 Billing Service - NEO_STACK Platform v3.0

## 📋 Índice

1. [Resumen General](#resumen-general)
2. [Funcionalidades](#funcionalidades)
3. [Arquitectura](#arquitectura)
4. [Instalación](#instalación)
5. [Configuración](#configuración)
6. [Referencia de API](#referencia-de-api)
7. [Integración con Stripe](#integración-con-stripe)
8. [Monitoreo](#monitoreo)
9. [Uso](#uso)
10. [Solución de Problemas](#solución-de-problemas)
11. [Contribución](#contribución)

---

## 🎯 Resumen General

El **Billing Service** es un servicio de facturación multi-tenant completo integrado con Stripe, desarrollado para NEO_STACK Platform v3.0. Proporciona funcionalidades integrales de gestión de suscripciones, facturación basada en uso, generación de facturas y procesamiento de pagos para plataformas SaaS multi-tenant.

### ✨ Características Principales

- **🔐 Multi-tenant**: Aislamiento completo de datos por tenant
- **💳 Integración Stripe**: Procesamiento de pagos vía Stripe
- **📊 Facturación basada en uso**: Seguimiento de recursos y límites
- **🧾 Generación de facturas**: Creación automática de PDFs
- **📧 Notificaciones**: Email, Slack, alertas personalizadas
- **📈 Métricas**: Prometheus + Grafana para observabilidad
- **⚡ Cache Redis**: Rendimiento optimizado
- **🔒 Seguridad**: JWT, RLS, encriptación

---

## 🚀 Funcionalidades

### 1. **Gestión de Suscripciones**
- Creación y cancelación de suscripciones
- Cambio de planes
- Períodos de prueba
- Cupones y descuentos
- Facturación recurrente

### 2. **Facturas y Pagos**
- Generación automática de facturas
- PDFs personalizados
- Múltiples métodos de pago (Tarjeta, PayPal, etc.)
- Intentos de pago automáticos
- Reembolsos y ajustes

### 3. **Seguimiento de Uso**
- Métricas por recurso (llamadas API, storage, usuarios)
- Integración con NetBox y Odoo
- Alertas de límite
- Reportes de uso

### 4. **Cupones y Descuentos**
- Cupones de porcentaje o valor fijo
- Múltiples canjes
- Períodos de validez
- Aplicación automática

### 5. **Alertas y Notificaciones**
- Pagos fallidos
- Límites de uso excedidos
- Facturas vencidas
- Prueba terminando

---

## 🏗️ Arquitectura

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

| Componente | Tecnología | Versión |
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

## 📦 Instalación

### Prerrequisitos

- Docker 24+
- Docker Compose 2.0+
- Python 3.11+
- 4GB RAM mínimo
- 10GB espacio en disco

### Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/your-org/neo_netbox_odoo_stack.git
cd neo_netbox_odoo_stack/platform/billing-service

# Ejecutar setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Instalación Manual

```bash
# 1. Crear directorios
mkdir -p data/{postgres,redis,prometheus,grafana,invoices}

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Iniciar servicios
cd docker
docker-compose up -d

# 4. Verificar estado
curl http://localhost:8000/health
```

---

## ⚙️ Configuración

### Variables de Entorno

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

### Configuración de Stripe

1. **Crear cuenta Stripe**: https://stripe.com
2. **Obtener API Keys**:
   - Publishable Key (pk_test_...)
   - Secret Key (sk_test_...)
3. **Configurar Webhooks**:
   - Endpoint: `https://your-domain.com/api/v1/webhooks/stripe`
   - Eventos:
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### Configuración de Planes

```sql
INSERT INTO plans (plan_id, name, price_monthly, features, limits) VALUES
('free', 'Free', 0.00, '["Basic features"]', '{"api_calls": 1000}'),
('starter', 'Starter', 29.00, '["All Free", "Email support"]', '{"api_calls": 10000}'),
('professional', 'Professional', 99.00, '["All Starter", "Priority support"]', '{"api_calls": 100000}'),
('enterprise', 'Enterprise', 299.00, '["All Professional", "24/7 support"]', '{"api_calls": 1000000}');
```

---

## 📚 Referencia de API

### Autenticación

```bash
# Obtener token JWT
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Planes

```bash
# Listar planes
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

### Suscripciones

```bash
# Crear suscripción
curl -X POST http://localhost:8000/api/v1/suscripciones \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price_id": "price_123",
    "plan_id": "starter",
    "trial_days": 14
  }'
```

```bash
# Cancelar suscripción
curl -X PUT http://localhost:8000/api/v1/suscripciones/current \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"cancel_at_period_end": true}'
```

### Facturas

```bash
# Listar facturas
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/facturas
```

```bash
# Detalles de factura
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/facturas/{factura_id}
```

### Pagos

```bash
# Agregar método de pago
curl -X POST http://localhost:8000/api/v1/métodos-pago \
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
curl -X POST http://localhost:8000/api/v1/uso \
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
# Resumen de uso
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/uso/resumen
```

### Cupones

```bash
# Aplicar cupón
curl -X POST http://localhost:8000/api/v1/cupones/aplicar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"code": "WELCOME20"}'
```

---

## 🔌 Integración con Stripe

### Flujo de Pago

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as Billing API
    participant S as Stripe
    participant DB as Database
    participant E as Email

    C->>API: Crear suscripción
    API->>S: Crear customer + subscription
    S->>API: Retornar client_secret
    API->>C: Retornar payment intent
    C->>S: Confirmar pago
    S->>API: Webhook - payment_succeeded
    API->>DB: Actualizar status
    API->>E: Enviar confirmación
```

### Configuración de Productos

```python
# Crear producto en Stripe
product = stripe.Product.create(
    name="Starter Plan",
    description="Perfect for small teams"
)

# Crear precio
price = stripe.Price.create(
    product=product.id,
    unit_amount=2900,  # $29.00
    currency="usd",
    recurring={"interval": "month"}
)
```

### Webhooks

```python
# Handler de webhook (implementado en el servicio)
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

## 📊 Monitoreo

### Métricas Prometheus

```
billing_subscriptions_total{status="active", plan_id="starter"} 45
billing_monthly_revenue_dollars 15420.50
billing_api_requests_total{method="POST", endpoint="/api/v1/suscripciones", status="200"} 1234
```

### Dashboards Grafana

Accede a http://localhost:3001 (admin/admin)

Dashboards disponibles:
- **Billing Overview**: Métricas generales de facturación
- **Subscriptions**: Status y métricas de suscripciones
- **Revenue**: Análisis de ingresos
- **Usage**: Seguimiento de uso por recurso

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

### Creando un Tenant

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

### Configurando Suscripción

```python
# 1. Obtener planes
response = requests.get(
    "http://localhost:8000/api/v1/planes",
    headers={"Authorization": f"Bearer {token}"}
)
planes = response.json()

# 2. Crear suscripción
response = requests.post(
    "http://localhost:8000/api/v1/suscripciones",
    json={
        "price_id": planes[1]["stripe_price_id"],
        "plan_id": "starter",
        "trial_days": 14
    },
    headers={"Authorization": f"Bearer {token}"}
)

suscripcion = response.json()
print(f"Suscripción: {suscripcion['status']}")
```

### Rastreando Uso

```python
import time
from datetime import datetime, timedelta

# Registrar uso de API
for i in range(100):
    requests.post(
        "http://localhost:8000/api/v1/uso",
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

### Consultando Facturas

```python
# Listar facturas
response = requests.get(
    "http://localhost:8000/api/v1/facturas",
    headers={"Authorization": f"Bearer {token}"}
)
facturas = response.json()

for factura in facturas:
    print(f"Factura {factura['invoice_number']}: ${factura['total']}")
```

---

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión con Stripe

```bash
# Verificar API key
curl https://api.stripe.com/v1/account \
  -u sk_test_your_key:

# Verificar logs
docker-compose -f docker/docker-compose.yml logs api | grep stripe
```

**Solución:**
- Verificar si STRIPE_API_KEY está correcta
- Confirmar si la clave es del entorno correcto (test/prod)
- Verificar permisos de la clave

#### 2. PostgreSQL no inicia

```bash
# Verificar logs
docker-compose -f docker/docker-compose.yml logs postgres

# Resetear database
docker-compose -f docker/docker-compose.yml down -v
docker volume rm billing-service_postgres-data
```

#### 3. Redis Connection Error

```bash
# Verificar Redis
docker-compose -f docker/docker-compose.yml exec redis redis-cli ping

# Verificar configuración
docker-compose -f docker/docker-compose.yml logs redis
```

#### 4. Webhook no funciona

```bash
# Probar webhook localmente
curl -X POST http://localhost:8001/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "data": {}}'

# Verificar logs
docker-compose -f docker/docker-compose.yml logs webhook-handler
```

#### 5. Factura no genera PDF

```bash
# Verificar wkhtmltopdf
docker-compose -f docker/docker-compose.yml exec invoice-generator \
  wkhtmltopdf --version

# Verificar permisos
docker-compose -f docker/docker-compose.yml exec invoice-generator \
  ls -la /app/data/invoices/
```

### Logs

```bash
# Logs de API
docker-compose -f docker/docker-compose.yml logs -f api

# Logs de Worker
docker-compose -f docker/docker-compose.yml logs -f worker

# Logs de Webhook
docker-compose -f docker/docker-compose.yml logs -f webhook-handler

# Logs de Nginx
docker-compose -f docker/docker-compose.yml logs -f nginx
```

### Health Checks

```bash
# Verificar todos los servicios
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

### Rendimiento

```bash
# Monitorear recursos
docker stats

# Verificar métricas
curl http://localhost:8000/metrics | grep billing_api_requests_total

# Verificar queries lentas
docker-compose -f docker/docker-compose.yml exec postgres \
  psql -U billing_user -d billing -c \
  "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

## 🤝 Contribución

### Desarrollo

```bash
# Setup ambiente dev
python3 -m venv venv
source venv/bin/activate
pip install -r api/requirements.txt

# Ejecutar tests
pytest api/tests/ -v

# Formateo
black api/
isort api/

# Type checking
mypy api/
```

### Estructura del Código

```
billing-service/
├── api/                    # Aplicación FastAPI
│   ├── main.py            # Punto de entrada
│   ├── database.py        # Config DB
│   ├── stripe_client.py   # Integración Stripe
│   ├── cache.py           # Cache Redis
│   ├── usage_tracker.py   # Seguimiento de uso
│   ├── invoice_generator.py # PDF de facturas
│   ├── security.py        # Auth/JWT
│   └── metrics.py         # Métricas Prometheus
├── models/                # Modelos Pydantic
│   ├── tenant.py
│   ├── subscription.py
│   ├── invoice.py
│   ├── payment.py
│   ├── usage.py
│   └── coupon.py
├── docker/                # Docker Compose
│   └── docker-compose.yml
├── config/                # Configuración
│   ├── database/
│   ├── prometheus/
│   ├── grafana/
│   └── nginx/
├── scripts/               # Scripts setup
│   └── setup.sh
└── docs/                  # Documentación
    ├── pt/
    └── es/
```

### Convención de Commits

```
feat: Agregar nuevo endpoint de cupón
fix: Corregir bug en generación de PDF
docs: Actualizar documentación de API
refactor: Refactorizar cache Redis
test: Agregar tests para webhook
chore: Actualizar dependencias
```

### Pull Request

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m "feat: agregar..."`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir PR con descripción detallada

---

## 📄 Licencia

Este proyecto está licenciado bajo la MIT License - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 📞 Soporte

- **Email**: billing-support@platform.local
- **Slack**: #billing-service
- **Documentación**: http://localhost:8000/docs
- **Issues**: https://github.com/your-org/neo_netbox_odoo_stack/issues

---

## 🙏 Agradecimientos

- Stripe por la API de pagos
- FastAPI por el framework web
- Prometheus por la observabilidad
- Grafana por los dashboards
- Comunidad open source

---

**Desarrollado con ❤️ para NEO_STACK Platform v3.0**
