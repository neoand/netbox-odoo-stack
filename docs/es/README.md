# 📚 Documentación Platform - NEO_STACK v3.0

## 📋 Índice

1. [Resumen General](#resumen-general)
2. [Estructura](#estructura)
3. [Servicios](#servicios)
4. [Portales](#portales)
5. [Recursos](#recursos)
6. [Guía de Desarrollo](#guía-de-desarrollo)
7. [Contribución](#contribución)

---

## 🎯 Resumen General

Este directorio contiene la documentación completa de **NEO_STACK Platform v3.0**, una plataforma SaaS multi-tenant que integra NetBox, Odoo, Wazuh, TheHive, MISP y Cortex en una solución unificada.

### ✨ Características Principales

- **🏗️ Arquitectura Cloud-Native**: Construida para escalar
- **🔐 Multi-Tenant**: Aislamiento completo de datos
- **💳 Facturación Integrada**: Sistema completo de facturación
- **📊 Analytics Avanzado**: Dashboards y ML integrado
- **🌍 Bilingüe**: Documentación en PT-BR y ES-MX
- **🚀 Orquestación**: Aprovisionamiento automático de stacks

---

## 📁 Estructura

```
platform/
├── admin-portal/          # Portal administrativo (Vue 3 + Nuxt 3)
│   ├── docs/
│   │   ├── pt/README.md   # Documentación PT-BR
│   │   └── es/README.md   # Documentación ES-MX
├── analytics/             # Plataforma de analytics
│   └── README.md          # Documentación principal
├── billing-service/       # Servicio de facturación (Stripe)
│   ├── docs/
│   │   ├── pt/README.md   # Documentación PT-BR
│   │   └── es/README.md   # Documentación ES-MX
├── certification/         # Programa de certificación
│   ├── docs/
│   │   ├── pt/README.md   # Documentación PT-BR
│   │   └── es/README.md   # Documentación ES-MX
└── tenant-portal/         # Portal del cliente (Vue 3 + Nuxt 3)
    ├── docs/
    │   ├── pt/README.md   # Documentación PT-BR
    │   └── es/README.md   # Documentación ES-MX
```

---

## 🛠️ Servicios

### **Servicios Core**

#### 1. **API Gateway**
- **Tecnología**: Kong o Traefik
- **Función**: Enrutamiento, autenticación, rate limiting
- **Puerto**: 8000
- **Estado**: ✅ Implementado

#### 2. **Auth Service**
- **Tecnología**: Authentik
- **Función**: Autenticación centralizada (OAuth2/OIDC)
- **Puerto**: 9000
- **Estado**: ✅ Implementado

#### 3. **Billing Service**
- **Tecnología**: FastAPI + Stripe
- **Función**: Facturación y suscripciones
- **Puerto**: 8001
- **Estado**: ✅ Implementado
- **Docs**: [PT-BR](./billing-service/docs/pt/README.md) | [ES-MX](./billing-service/docs/es/README.md)

#### 4. **Tenant Manager**
- **Tecnología**: FastAPI
- **Función**: Gestión de tenants
- **Puerto**: 8002
- **Estado**: 🚧 En desarrollo

#### 5. **Stack Deployer**
- **Tecnología**: Docker Swarm/K8s
- **Función**: Aprovisionamiento automático
- **Puerto**: 8003
- **Estado**: 🚧 En desarrollo

#### 6. **Monitoring Service**
- **Tecnología**: Prometheus + Grafana
- **Función**: Observabilidad completa
- **Puerto**: 9090 (Prometheus), 3000 (Grafana)
- **Estado**: ✅ Implementado

---

## 🖥️ Portales

### **Admin Portal**
- **Tecnología**: Vue 3 + Nuxt 3 + Nuxt UI
- **Funcionalidades**:
  - Dashboard ejecutivo
  - Gestión de tenants
  - Facturación y suscripciones
  - Configuraciones globales
  - Analytics avanzado
- **Puerto**: 3002
- **Credenciales**: admin / admin123
- **Estado**: ✅ Implementado
- **Docs**: [PT-BR](./admin-portal/docs/pt/README.md) | [ES-MX](./admin-portal/docs/es/README.md)

### **Tenant Portal**
- **Tecnología**: Vue 3 + Nuxt 3 + Nuxt UI
- **Funcionalidades**:
  - Dashboard del cliente
  - Gestión de recursos
  - Facturación y facturas
  - Soporte
  - Configuraciones de cuenta
- **Puerto**: 3003
- **Estado**: ✅ Implementado
- **Docs**: [PT-BR](./tenant-portal/docs/pt/README.md) | [ES-MX](./tenant-portal/docs/es/README.md)

---

## 📊 Analytics Platform

La **Analytics Platform** es una solución completa de analytics en tiempo real que procesa datos de múltiples fuentes y proporciona insights accionables.

### Características
- **⚡ Real-Time**: Pipeline ETL con latencia < 5 min
- **🤖 3 ML Models**: Detección de anomalías, predicción de capacidad, predicción de incidentes
- **📊 6 Dashboards**: Ejecutivo, Infraestructura, Seguridad, Tickets, Red, Capacidad
- **🔄 Pipeline**: Apache Kafka + TimescaleDB
- **📈 Predicciones**: 80-95% de precisión

### Componentes
| Servicio | Tecnología | Puerto | Estado |
|---------|-----------|--------|--------|
| Dashboard | Vue 3 + Chart.js | 3005 | ✅ |
| ML Models API | FastAPI + scikit-learn | 8001 | ✅ |
| Analytics API Gateway | FastAPI | 8002 | ✅ |
| Data Warehouse | TimescaleDB | 5434 | ✅ |
| Cache | Redis | 6381 | ✅ |
| Streaming | Apache Kafka | 9092 | ✅ |
| Jupyter | Jupyter Lab | 8888 | ✅ |
| Airflow | Apache Airflow | 8080 | ✅ |

**Documentación**: [Analytics README.md](../analytics/README.md)

---

## 🏆 Certification Program

El **NEO_STACK Certification Program** ofrece certificación profesional en 4 niveles:

### Niveles
1. **Level 1 - Analytics Fundamentals**
2. **Level 2 - ML Models Practitioner**
3. **Level 3 - Analytics Architect**
4. **Level 4 - Analytics Master**

### Recursos
- Materiales de estudio bilingües
- Exámenes prácticos
- Laboratorios hands-on
- Certificados digitales

**Documentación**: [Certification README.md](../certification/README.md)
**Study Materials**: [PT-BR](../certification/study-materials/pt/README.md) | [ES-MX](../certification/study-materials/es/README.md)

---

## 📖 Guía de Desarrollo

### Prerrequisitos

- Node.js 18+
- Python 3.11+
- Docker 24+
- Docker Compose 2.0+
- Git

### Setup Inicial

```bash
# Clonar el repositorio
git clone https://github.com/your-org/neo_netbox_odoo_stack.git
cd neo_netbox_odoo_stack/platform

# Setup completo
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Ejecutando Servicios

```bash
# Todos los servicios
docker-compose up -d

# Servicio específico
docker-compose up -d billing-service
docker-compose up -d admin-portal
docker-compose up -d tenant-portal
```

### Desarrollo

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
# Accede a: http://localhost:3005
```

---

## 🔧 Configuración

### Variables de Entorno

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

### Configuración de Red

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

## 🧪 Tests

```bash
# Todos los servicios
docker-compose -f docker-compose.test.yml up -d

# Tests específicos
docker-compose exec billing-service pytest
docker-compose exec admin-portal npm test

# Coverage
docker-compose exec billing-service pytest --cov=api
```

---

## 📊 Monitoreo

### Health Checks

```bash
# Todos los servicios
curl http://localhost/health

# Servicios específicos
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

### Producción

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
# Deploy en K8s
kubectl apply -f k8s/

# Verificar estado
kubectl get pods
kubectl get services
```

---

## 🔒 Seguridad

### Headers de Seguridad

```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000";
```

### Autenticación

- **JWT Tokens**: Para API
- **OAuth2/OIDC**: Para portales
- **RBAC**: Control de acceso basado en roles

### Criptografía

- **TLS 1.3**: Comunicación segura
- **AES-256**: Datos en reposo
- **bcrypt**: Hash de contraseñas

---

## 📚 Documentación Adicional

### Guías

- [Arquitectura de la Plataforma](./docs/architecture.md)
- [Guía de Deployment](./docs/deployment.md)
- [Seguridad](./docs/security.md)
- [Monitoreo](./docs/monitoring.md)
- [Troubleshooting](./docs/troubleshooting.md)

### APIs

- [API Gateway](./api-gateway/README.md)
- [Billing Service](./billing-service/README.md)
- [Analytics API](../analytics/docs/api-reference.md)

### Training

- [Materiales de Estudio](../certification/study-materials/)
- [Laboratorios](../labs/)
- [Tutoriales](../tutorials/)

---

## 🤝 Contribución

### Cómo Contribuir

1. **Fork** el repositorio
2. **Crear branch**: `git checkout -b feature/nueva-funcionalidad`
3. **Commit**: `git commit -m "feat: agregar..."`
4. **Push**: `git push origin feature/nueva-funcionalidad`
5. **PR**: Abrir Pull Request

### Convenciones

- **Commits**: Conventional Commits
- **Branches**: `feature/`, `bugfix/`, `hotfix/`
- **Código**: ESLint + Prettier
- **Docs**: Bilingüe (PT-BR + ES-MX)

### Tests

```bash
# Ejecutar todos los tests
make test

# Tests unitarios
make test-unit

# Tests de integración
make test-integration

# Coverage
make test-coverage
```

---

## 📞 Soporte

- **Email**: support@neo-stack.com
- **Slack**: #platform-support
- **GitHub Issues**: [Issues](https://github.com/neo-stack/neo_netbox_odoo_stack/issues)
- **Documentación**: http://docs.platform.local

---

## 📄 Licencia

Este proyecto está licenciado bajo la MIT License - ver el archivo [LICENSE](../../LICENSE) para detalles.

---

## 🙏 Agradecimientos

- NetBox por la gestión de recursos de red
- Odoo por el ERP integrado
- Wazuh por la seguridad
- TheHive por la gestión de incidentes
- MISP por la threat intelligence
- Cortex por el análisis de artefactos
- Stripe por la infraestructura de pagos
- Vue.js y Nuxt por la interfaz moderna
- FastAPI por la API robusta

---

**Desarrollado con ❤️ para NEO_STACK Platform v3.0**

[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-orange.svg)](https://claude.ai)
