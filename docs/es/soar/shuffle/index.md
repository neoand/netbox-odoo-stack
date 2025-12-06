# Shuffle - Plataforma SOAR Oficial Wazuh

> **AI Context**: Introducción a Shuffle, plataforma SOAR oficialmente integrada con Wazuh. Enfocada en automatización de respuesta a incidentes de seguridad con interfaz drag-and-drop. Stack: Wazuh → Shuffle → Odoo/NetBox. Keywords: Shuffle, SOAR, Wazuh integration, security automation, workflows, SecOps.

## Visión General

**Shuffle** es una plataforma SOAR (Security Orchestration, Automation and Response) open-source con integración oficial a Wazuh. Diseñada para que equipos de seguridad automaticen la respuesta a incidentes mediante workflows visuales.

### Características Principales

- **Integración Oficial Wazuh**: App nativa para recibir alertas
- **400+ Apps Disponibles**: Odoo, NetBox, Slack, TheHive, MISP
- **Workflow Visual**: Drag-and-drop sin necesidad de código
- **Escalable**: Soporta miles de ejecuciones simultáneas
- **Cloud o On-premise**: Deploy flexible

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                 SHUFFLE COMPONENTS                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┐      ┌──────────────┐          │
│  │   Frontend    │◄────►│   Backend    │          │
│  │  (React UI)   │      │  (Golang)    │          │
│  └───────────────┘      └──────┬───────┘          │
│                                 │                   │
│  ┌───────────────┐      ┌──────▼───────┐          │
│  │   Database    │◄────►│   Orborus    │          │
│  │  (OpenSearch) │      │  (Executor)  │          │
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

#### 1. Frontend
- **Puerto**: 3001
- **Función**: Interfaz visual para crear workflows
- **Stack**: React.js, Material-UI
- **Acceso**: http://localhost:3001

#### 2. Backend
- **Puerto**: 3000 (API interna)
- **Función**: Gestionar workflows, autenticación, API
- **Stack**: Golang
- **API**: RESTful + WebSocket

#### 3. Orborus
- **Función**: Ejecutor de workflows (worker)
- **Escalable**: Múltiples instancias
- **Aislamiento**: Contenedores Docker para cada app

#### 4. Database
- **Tipo**: OpenSearch (fork de Elasticsearch)
- **Función**: Almacenar workflows, ejecuciones, logs
- **Persistencia**: Volumen Docker

## Conceptos Fundamentales

### Workflows
Conjunto de acciones automatizadas disparadas por un trigger.

```
Trigger → Action 1 → Action 2 → Action 3 → Result
```

**Ejemplo práctico**:
```
Wazuh Alert → Get Host Info (NetBox) → Create Ticket (Odoo) → Send Notification (Slack)
```

### Apps
Integraciones pre-construidas con servicios externos.

**Apps principales en nuestro stack**:
- **Wazuh**: Recibir alertas
- **Odoo**: Crear/actualizar tickets
- **NetBox**: Consultar assets
- **HTTP**: Peticiones personalizadas
- **Tools**: Manipulación de datos

### Actions
Operaciones individuales dentro de un workflow.

**Tipos de acciones**:
- **Trigger**: Inicia el workflow (webhook, schedule)
- **Apps**: Ejecutan integraciones
- **Conditions**: Decisiones lógicas (if/else)
- **Filters**: Transformación de datos
- **Loops**: Iteraciones

### Executions
Instancia de ejecución de un workflow.

**Estados**:
- `EXECUTING`: En ejecución
- `FINISHED`: Completado con éxito
- `FAILED`: Falló
- `ABORTED`: Cancelado manualmente

## Ventajas de Shuffle

### Para Equipos de Seguridad
✅ **Integración nativa Wazuh**: Menos configuración, más confiabilidad
✅ **Enfoque en SecOps**: Apps y plantillas enfocadas en seguridad
✅ **Comunidad activa**: 10k+ stars en GitHub
✅ **Documentación rica**: Ejemplos prácticos de SOC

### Para Desarrolladores
✅ **API completa**: Automatización vía código
✅ **Python/Bash**: Soporte a scripts personalizados
✅ **Webhooks bidireccionales**: Integración con cualquier servicio
✅ **Logs detallados**: Debug facilitado

### Para Gestión
✅ **Open-source**: Sin costos de licencia
✅ **On-premise**: Datos sensibles no salen del ambiente
✅ **Métricas**: Dashboards de automatización
✅ **Compliance**: Auditoría de acciones automatizadas

## Limitaciones y Consideraciones

### Curva de Aprendizaje
- La interfaz puede parecer compleja inicialmente
- Los conceptos de workflows requieren familiarización
- El debugging puede ser laborioso

### Rendimiento
- OpenSearch consume RAM (~2GB mínimo)
- Ejecuciones paralelas limitadas por recursos
- Cold start en apps puede causar delay

### Mantenimiento
- Las actualizaciones pueden romper workflows
- Apps de terceros no siempre son estables
- Backup de workflows es manual (exportar JSON)

## Casos de Uso Recomendados

### 1. SOC Automation
```
Alertas Wazuh → Enrichment → Ticket → Respuesta
```
**Complejidad**: Media
**ROI**: Alto
**Setup**: 2-4 horas

### 2. Threat Hunting
```
IOC Feed → Búsqueda en logs → Correlación → Reporte
```
**Complejidad**: Alta
**ROI**: Medio
**Setup**: 1-2 días

### 3. Compliance Reporting
```
Schedule → Recolección de evidencias → Validación → PDF
```
**Complejidad**: Baja
**ROI**: Alto
**Setup**: 4-8 horas

## Alternativas

| Plataforma | Cuándo Elegir |
|-----------|-----------------|
| **Shuffle** | Integración oficial Wazuh, ambiente enterprise |
| **[n8n](../n8n/index.md)** | Prototipado rápido, fácil aprendizaje |
| **TheHive/Cortex** | Gestión de casos más compleja |
| **Demisto (Palo Alto)** | Presupuesto disponible, soporte comercial |

## Estructura de la Documentación

1. **[Instalación y Configuración](setup.md)**
   - Docker Compose completo
   - Configuración inicial
   - Creación de API keys

2. **[Integración con Wazuh](wazuh-integration.md)**
   - Configuración en ossec.conf
   - Formato de URL webhook
   - Filtros y alertas

3. **[Workflows de Ejemplo](workflows.md)**
   - Alerta → Enrichment → Ticket
   - Auto-bloqueo de IP maliciosa
   - Reporte de compliance

## Quick Start

### Instalación Rápida
```bash
# Clonar el repositorio del proyecto
cd /opt/neoand-netbox-odoo-stack

# Iniciar Shuffle
docker-compose -f docker-compose.soar.yml up -d shuffle

# Esperar ~30 segundos
docker logs -f shuffle-backend
```

### Primer Acceso
1. Abrir http://localhost:3001
2. Crear cuenta admin (primer usuario)
3. Configurar API key en Settings
4. Importar workflow de ejemplo

### Prueba Básica
```bash
# Enviar webhook de prueba a Shuffle
curl -X POST http://localhost:3001/api/v1/hooks/webhook_EXAMPLE \
  -H "Content-Type: application/json" \
  -d '{
    "rule_id": "554",
    "rule_level": 12,
    "description": "Malware detectado - PRUEBA"
  }'

# Verificar ejecución en la UI
# Workflows → Executions
```

## Recursos Adicionales

### Documentación Oficial
- [Shuffle Docs](https://shuffler.io/docs)
- [Wazuh + Shuffle Guide](https://documentation.wazuh.com/current/proof-of-concept-guide/poc-integrate-shuffle-soar.html)
- [API Reference](https://shuffler.io/docs/API)

### Comunidad
- [GitHub](https://github.com/Shuffle/Shuffle)
- [Discord](https://discord.gg/B2CBzUm)
- [YouTube Tutorials](https://www.youtube.com/@shuffleautomation)

### Plantillas Disponibles
- [Wazuh Response Workflows](https://github.com/Shuffle/workflows)
- [Security Operations](https://shuffler.io/workflows?tags=security)

## Próximos Pasos

1. **[Instalar Shuffle](setup.md)**: Configurar el ambiente completo
2. **[Conectar Wazuh](wazuh-integration.md)**: Recibir alertas automáticamente
3. **[Crear Workflows](workflows.md)**: Automatizar respuestas a incidentes

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Compatibilidad**: Shuffle 1.3.0+, Wazuh 4.5+
