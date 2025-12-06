# SOAR - Security Orchestration, Automation and Response

> **AI Context**: Documentación principal del módulo SOAR de NEO_NETBOX_ODOO_STACK v2.0. Compara Shuffle (integración oficial Wazuh) vs n8n (alternativa flexible) para automatización de respuesta a incidentes. Stack: Wazuh → SOAR → Odoo (tickets) + NetBox (enrichment). Keywords: SOAR, Shuffle, n8n, automatización seguridad, orquestación, playbooks.

## Visión General

El módulo SOAR de **NEO_NETBOX_ODOO_STACK** automatiza la respuesta a incidentes de seguridad detectados por Wazuh, creando tickets en Odoo y enriqueciendo datos con información de NetBox.

### Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    WAZUH MANAGER                        │
│  - Detecta alertas de seguridad                         │
│  - Filtra por rule_level, rule_groups                   │
│  - Envía webhook a SOAR                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├───► Shuffle (Oficial)
                 │     └─► Workflows visuales
                 │
                 └───► n8n (Alternativa)
                       └─► Low-code automation
                 │
    ┌────────────┴────────────────┐
    │                             │
    ▼                             ▼
┌─────────┐                  ┌──────────┐
│  ODOO   │                  │  NETBOX  │
│ Tickets │                  │ Enrich   │
└─────────┘                  └──────────┘
```

## Comparativo: Shuffle vs n8n

| Característica | Shuffle | n8n |
|---------------|---------|-----|
| **Integración Wazuh** | Oficial, nativa | Vía webhook HTTP |
| **Interfaz** | Drag-and-drop simple | Low-code avanzado |
| **Comunidad** | Enfocada en SecOps | General (automatización) |
| **Complejidad** | Media | Baja |
| **Apps disponibles** | 400+ (enfoque seguridad) | 400+ (general) |
| **Curva de aprendizaje** | Pronunciada | Suave |
| **Rendimiento** | Alto | Muy alto |
| **Licencia** | AGPL-3.0 | Fair-code (Sustainable Use) |
| **Recomendado para** | Ambientes enterprise | Prototipado rápido |

## Casos de Uso

### 1. Respuesta Automática a Malware
**Trigger**: Wazuh detecta malware (rule_id 554)
- Enriquecer datos del host vía NetBox
- Crear ticket crítico en Odoo
- Aislar host en la red (opcional)
- Notificar equipo vía Slack/email

### 2. Protección Contra Brute Force
**Trigger**: Múltiples intentos SSH fallidos (rule_id 5712)
- Bloquear IP vía firewall (iptables/pfSense)
- Crear ticket en Odoo
- Agregar IP a watchlist de Wazuh
- Generar reporte de IOCs

### 3. Compliance Automation
**Trigger**: Cambio de configuración detectado
- Validar contra baseline (CIS, PCI-DSS)
- Crear evidencia en Odoo
- Generar reporte de cumplimiento
- Programar revisión trimestral

### 4. Gestión de Vulnerabilidades
**Trigger**: CVE crítico detectado
- Consultar NetBox para assets afectados
- Crear tickets de patching en Odoo
- Priorizar por criticidad de negocio
- Rastrear SLA de corrección

## Flujo Típico de Respuesta

```
1. DETECCIÓN (Wazuh)
   └─► Alert generado (JSON)
       ├─ rule_id
       ├─ rule_level (gravedad)
       ├─ rule_groups (categoría)
       └─ data (contexto)

2. ORQUESTACIÓN (SOAR)
   └─► Workflow ejecutado
       ├─ Enrichment (NetBox)
       ├─ Decisión (rule engine)
       └─ Acciones paralelas

3. RESPUESTA (Integrada)
   ├─► Odoo: Ticket creado
   ├─► NetBox: Contexto obtenido
   ├─► Firewall: IP bloqueada
   └─► Slack: Equipo notificado

4. RASTREO
   └─► Métricas recolectadas
       ├─ MTTD (Mean Time To Detect)
       ├─ MTTR (Mean Time To Respond)
       └─ Tasa de automatización
```

## Estructura de la Documentación

### Shuffle (Integración Oficial Wazuh)
- [Introducción a Shuffle](shuffle/index.md)
- [Instalación y Configuración](shuffle/setup.md)
- [Integración con Wazuh](shuffle/wazuh-integration.md)
- [Workflows de Ejemplo](shuffle/workflows.md)

### n8n (Alternativa Flexible)
- [Introducción a n8n](n8n/index.md)
- [Instalación y Configuración](n8n/setup.md)
- [Integración con Wazuh](n8n/wazuh-integration.md)
- [Workflows de Ejemplo](n8n/workflows.md)

### Playbooks
- [Catálogo de Playbooks](playbooks/index.md)
- [Respuesta a Malware](playbooks/malware-response.md)
- [Respuesta a Brute Force](playbooks/brute-force.md)
- [Automatización de Compliance](playbooks/compliance.md)

## Prerrequisitos

### Infraestructura
- Docker Engine 24.0+
- Docker Compose 2.20+
- 4GB RAM disponible
- 20GB storage SSD

### Servicios
- ✅ Wazuh Manager operacional
- ✅ Odoo con módulo Helpdesk instalado
- ✅ NetBox configurado con API token
- ✅ Redis (cache para SOAR)
- ✅ PostgreSQL (persistencia)

### Red
```yaml
# docker-compose.yml (fragmento)
networks:
  soar_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

## Métricas de Éxito

### KPIs Operacionales
| Métrica | Meta | Medición |
|---------|------|---------|
| MTTD (Detección) | < 5 min | Timestamp alerta Wazuh |
| MTTR (Respuesta) | < 30 min | Timestamp acción SOAR |
| Tasa automatización | > 70% | Workflows ejecutados/alertas |
| Falsos positivos | < 10% | Tickets cerrados como "no-incidente" |

### Monitoreo
```bash
# Verificar workflows activos
curl http://localhost:3001/api/v1/workflows

# Métricas Shuffle
docker logs shuffle-backend | grep "Workflow executed"

# Métricas n8n
docker logs n8n | grep "Workflow execution"
```

## Comenzando

### Opción 1: Shuffle (Recomendado para Enterprise)
```bash
cd shuffle/
docker-compose up -d
# Accede: http://localhost:3001
```

### Opción 2: n8n (Recomendado para Prototipado)
```bash
cd n8n/
docker-compose up -d
# Accede: http://localhost:5678
```

## Roadmap

### Fase 1 (Actual)
- ✅ Integración Wazuh → Shuffle
- ✅ Integración Wazuh → n8n
- ✅ Creación de tickets en Odoo
- ✅ Enrichment vía NetBox

### Fase 2 (Q1 2026)
- 🔄 Integración con TheHive (SIRP)
- 🔄 Machine Learning para priorización
- 🔄 Playbooks avanzados (ransomware)

### Fase 3 (Q2 2026)
- 📅 Integración MISP (threat intel)
- 📅 Automatización de patching
- 📅 Red team automation

## Soporte y Comunidad

### Documentación
- [Shuffle Docs](https://shuffler.io/docs)
- [n8n Docs](https://docs.n8n.io/)
- [Wazuh SOAR Integration](https://documentation.wazuh.com/current/proof-of-concept-guide/poc-integrate-soar-tools.html)

### Troubleshooting
- Logs: `docker-compose logs -f`
- Health check: `curl http://localhost:3001/api/v1/health`
- Comunidad: GitHub Issues del proyecto

## Próximos Pasos

1. **Elige tu plataforma**: [Shuffle](shuffle/index.md) o [n8n](n8n/index.md)
2. **Instala el ambiente**: Sigue la guía de setup
3. **Configura la integración**: Conecta con Wazuh
4. **Importa playbooks**: Usa las plantillas listas
5. **Prueba y ajusta**: Adapta a tu realidad

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Mantenedor**: Equipo NEO_NETBOX_ODOO_STACK
