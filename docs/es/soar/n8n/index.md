# n8n - Plataforma de Automatización Low-Code

> **AI Context**: Introducción a n8n como alternativa flexible a Shuffle para automatización SOAR. Enfocado en facilidad de uso y prototipado rápido. Stack: Wazuh → n8n → Odoo/NetBox. Keywords: n8n, workflow automation, low-code, SOAR alternative, Wazuh webhooks, rapid prototyping.

## Descripción General

**n8n** (n-eight-n) es una plataforma de automatización low-code open-source que puede usarse como alternativa a Shuffle para orquestación de respuesta a incidentes.

### ¿Por Qué n8n?

- **Curva de aprendizaje suave**: Interfaz intuitiva, fácil para principiantes
- **Prototipado rápido**: Crear workflows en minutos, no horas
- **400+ integraciones nativas**: Odoo, HTTP, PostgreSQL, etc.
- **Comunidad activa**: 40k+ estrellas en GitHub
- **Self-hosted**: Control total de los datos

## Shuffle vs n8n

| Aspecto | Shuffle | n8n |
|---------|---------|-----|
| **Enfoque** | Operaciones de Seguridad | Automatización general |
| **Interfaz** | Específica SOAR | Drag-and-drop visual |
| **Curva aprendizaje** | Pronunciada (conceptos SOAR) | Suave (intuitivo) |
| **Wazuh** | Integración oficial | Vía webhook HTTP |
| **Debugging** | Medio (logs) | Excelente (UI visual) |
| **Performance** | Alta | Muy alta |
| **Comunidad** | 10k usuarios (SecOps) | 40k usuarios (general) |
| **Mejor para** | SOC enterprise | Prototipado rápido |

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  COMPONENTES N8N                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┐      ┌──────────────┐          │
│  │   Frontend    │◄────►│   Backend    │          │
│  │  (Vue.js UI)  │      │  (Node.js)   │          │
│  └───────────────┘      └──────┬───────┘          │
│                                 │                   │
│  ┌───────────────┐      ┌──────▼───────┐          │
│  │   Database    │◄────►│   Queue      │          │
│  │  (PostgreSQL) │      │   (Redis)    │          │
│  └───────────────┘      └──────────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘
         ▲                           │
         │                           ▼
    ┌────┴────┐              ┌──────────────┐
    │  Wazuh  │              │ Integraciones│
    │ Webhook │              │ Odoo/NetBox  │
    └─────────┘              └──────────────┘
```

### Componentes

#### 1. Frontend (UI)
- **Puerto**: 5678
- **Función**: Interfaz visual para crear workflows
- **Stack**: Vue.js 3
- **Acceso**: http://localhost:5678

#### 2. Backend (Engine)
- **Función**: Ejecución de workflows, gestión de credenciales
- **Stack**: Node.js + TypeScript
- **API**: RESTful

#### 3. Database
- **Tipo**: PostgreSQL (o SQLite para dev)
- **Función**: Almacenar workflows, ejecuciones, credenciales
- **Persistencia**: Volumen Docker

#### 4. Queue (Opcional)
- **Tipo**: Redis o BullMQ
- **Función**: Cola de ejecuciones para alta carga
- **Uso**: Producción con >100 ejecuciones/min

## Conceptos Fundamentales

### Workflows
Automatización visual con nodos conectados.

```
Trigger → Node 1 → Node 2 → Node 3
```

**Ejemplo práctico**:
```
Webhook (Wazuh) → HTTP Request (NetBox) → HTTP Request (Odoo) → Send Email
```

### Nodes
Bloques de construcción de workflows.

**Tipos principales**:
- **Trigger Nodes**: Inician workflow (Webhook, Schedule, Manual)
- **Regular Nodes**: Acciones intermedias (HTTP, Function, IF)
- **Output Nodes**: Envían resultados (Email, Slack, Database)

### Executions
Historial de ejecuciones de workflows.

**Características**:
- Inspección visual de datos en cada nodo
- Retry automático en caso de falla
- Logs detallados

### Credentials
Almacenamiento seguro de API keys y tokens.

**Tipos**:
- HTTP Basic Auth
- OAuth2
- API Key
- Custom credentials

## Ventajas de n8n

### Para Analistas de Seguridad
✅ **Interfaz visual**: Ver flujo de datos entre sistemas
✅ **Debugging fácil**: Inspección de cada nodo en tiempo real
✅ **Templates listos**: Biblioteca con 1000+ workflows
✅ **Documentación rica**: Ejemplos prácticos para cada node

### Para Desarrolladores
✅ **JavaScript nativo**: Function nodes con sintaxis familiar
✅ **Extensible**: Crear custom nodes fácilmente
✅ **API completa**: Automatización vía código
✅ **Webhooks flexibles**: Múltiples webhooks por workflow

### Para Gestión
✅ **Open-source**: Licencia Sustainable Use (gratuito para self-hosted)
✅ **ROI rápido**: Prototipado en horas, no días
✅ **Métricas**: Dashboards de ejecuciones y performance
✅ **Escalable**: Queue Redis para alta carga

## Limitaciones y Consideraciones

### Seguridad
- Credenciales en PostgreSQL (cifradas, pero atención)
- Webhooks públicos por defecto (configurar autenticación)
- Logs pueden contener datos sensibles

### Performance
- Node.js single-threaded (usar queue para paralelismo)
- Workflows largos pueden trabar UI
- PostgreSQL puede ser cuello de botella (>10k ejecuciones/día)

### Mantenimiento
- Actualizaciones pueden romper custom nodes
- Community nodes no siempre mantenidos
- Backup manual de workflows (export JSON)

## Casos de Uso Recomendados

### 1. Prototipado de SOAR
```
Prueba rápida de integraciones antes de implementar en Shuffle
```
**Complejidad**: Baja
**ROI**: Alto
**Setup**: 30 minutos

### 2. Automatizaciones Simples
```
Wazuh → Check IP → Create Ticket → Notify
```
**Complejidad**: Baja
**ROI**: Muy alto
**Setup**: 1-2 horas

### 3. Integraciones Personalizadas
```
Múltiples fuentes de datos → Enriquecimiento → Decisión → Acción
```
**Complejidad**: Media
**ROI**: Alto
**Setup**: 4-8 horas

## Cuándo Elegir n8n

### Use n8n si:
- ✅ Necesita prototipar rápidamente
- ✅ Equipo prefiere interfaces visuales
- ✅ Presupuesto limitado (menos recursos de hardware)
- ✅ Integraciones más allá de seguridad (marketing, ventas)
- ✅ Facilidad de uso > funciones avanzadas

### Use Shuffle si:
- ✅ Enfoque exclusivo en SecOps
- ✅ Integración oficial Wazuh importante
- ✅ Equipo experimentado en SOAR
- ✅ Complejidad de workflows alta
- ✅ Enterprise con presupuesto para infraestructura

## Estructura de la Documentación

1. **[Instalación y Configuración](setup.md)**
   - Docker Compose completo
   - Configuración de credenciales
   - Webhook setup

2. **[Integración con Wazuh](wazuh-integration.md)**
   - Configuración en ossec.conf
   - Webhook authentication
   - Filtros y parsing

3. **[Workflows de Ejemplo](workflows.md)**
   - Alerta → Enriquecimiento → Ticket
   - Auto-remediación
   - Compliance checks

## Quick Start

### Instalación Rápida
```bash
# Clonar el repositorio del proyecto
cd /opt/neoand-netbox-odoo-stack

# Iniciar n8n
docker-compose -f docker-compose.soar.yml up -d n8n

# Esperar ~10 segundos
docker logs -f n8n
```

### Primer Acceso
1. Abrir http://localhost:5678
2. Crear cuenta owner (primer usuario)
3. Crear workflow "Test Wazuh"
4. Agregar node **Webhook**
5. Copiar URL del webhook

### Prueba Básica
```bash
# Enviar webhook de prueba a n8n
curl -X POST http://localhost:5678/webhook-test/wazuh \
  -H "Content-Type: application/json" \
  -d '{
    "rule": {
      "id": "554",
      "level": 12,
      "description": "Malware detectado - PRUEBA"
    },
    "agent": {
      "name": "test-server",
      "ip": "192.168.1.99"
    }
  }'

# Verificar ejecución en la UI
# Executions → Ver detalles
```

## Diferencial: Debugging Visual

### Shuffle
```
Logs textuales:
[2025-12-05 15:00:00] Workflow started
[2025-12-05 15:00:01] Action 1 executed
[2025-12-05 15:00:02] Error in Action 2: Connection timeout
```

### n8n
```
Interfaz visual muestra:
┌──────────┐   ✓   ┌──────────┐   ✗   ┌──────────┐
│ Webhook  │──────►│ NetBox   │──────►│  Odoo    │
└──────────┘       └──────────┘       └──────────┘
    200 OK         {device: {...}}    Connection timeout

# Clic en cada nodo para ver datos JSON completos
```

## Recursos Adicionales

### Documentación Oficial
- [n8n Docs](https://docs.n8n.io/)
- [Workflow Templates](https://n8n.io/workflows/)
- [API Reference](https://docs.n8n.io/api/)

### Comunidad
- [GitHub](https://github.com/n8n-io/n8n)
- [Forum](https://community.n8n.io/)
- [Discord](https://discord.gg/n8n)

### Templates de Seguridad
- [Security Automation](https://n8n.io/workflows/?categories=Security)
- [Incident Response](https://n8n.io/workflows/?search=incident)

## Próximos Pasos

1. **[Instalar n8n](setup.md)**: Configure el entorno completo
2. **[Conectar Wazuh](wazuh-integration.md)**: Reciba alertas automáticamente
3. **[Crear Workflows](workflows.md)**: Automatice respuestas a incidentes

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Compatibilidad**: n8n 1.19.0+, Wazuh 4.5+
