# Integraciones - NEO_NETBOX_ODOO_STACK v2.0

> **AI Context**: Este índice presenta todas las integraciones entre NetBox (CMDB), Wazuh (SIEM/XDR) y Odoo (ERP/ITSM), con flujos de datos bidireccionales, casos de uso prácticos y referencias a documentación detallada.

## Visión General

El **NEO_NETBOX_ODOO_STACK v2.0** es una plataforma integrada que conecta tres sistemas principales:

- **NetBox 4.2**: Source of Truth para infraestructura (CMDB, IPAM, DCIM)
- **Wazuh 4.12**: Monitoreo de seguridad (SIEM, XDR, Compliance)
- **Odoo 19 Community**: Gestión operacional (ERP, Helpdesk, Mantenimiento)

Las integraciones crean un **ecosistema unificado** donde los datos fluyen automáticamente entre sistemas, eliminando silos y automatizando procesos operacionales.

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INTEGRACIONES                              │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────────────────────────────────────┐
          │         NetBox 4.2 (CMDB/IPAM)               │
          │   - Devices, Sites, Racks                    │
          │   - IP addresses, VLANs, Prefixes            │
          │   - Custom Fields: criticality, owner        │
          └────┬─────────────────────┬────────────────────┘
               │                     │
               │ ① NetBox→Odoo       │ ② NetBox→Wazuh
               │   (Asset Sync)      │   (Enrichment)
               │                     │
               ▼                     ▼
┌──────────────────────────┐    ┌────────────────────────────┐
│  Odoo 19 + OCA Modules   │    │    Wazuh 4.12 SIEM/XDR     │
│  - maintenance.equipment │    │    - Alerts + Context      │
│  - helpdesk.ticket       │    │    - Rules & Compliance    │
│  - FastAPI endpoints     │◄───┤    - Active Response       │
└──────────────────────────┘    └────────────────────────────┘
               │                     │
               └─────────────────────┘
                         │
                  ③ Wazuh→Odoo
                  (Auto-Ticketing)
```

## Integraciones Disponibles

### 1. NetBox ↔ Odoo: Sincronización de Assets

**Documento**: [netbox-odoo.md](./netbox-odoo.md)

**Objetivo**: Mantener el inventario técnico (NetBox) alineado con la gestión de activos y mantenimiento (Odoo).

**Flujo de Datos**:

```
NetBox Device → Webhook → Odoo Worker → maintenance.equipment
                    ↓
            FastAPI endpoint (OCA rest-framework)
                    ↓
            Queue Job (OCA queue_job)
                    ↓
            Create/Update equipment record
```

**Casos de Uso**:

| Caso de Uso | Descripción | Beneficio |
|-------------|-----------|-----------|
| **Asset Onboarding** | Device creado en NetBox → automáticamente crea equipment en Odoo | Reduce entrada manual, garantiza consistencia |
| **Status Sync** | Device offline en NetBox → marca equipment en mantenimiento en Odoo | Visibilidad operacional unificada |
| **Warranty Tracking** | Custom field warranty_end sincronizado → alertas de renovación | Gestión proactiva de contratos |
| **Location Mapping** | Site/Rack de NetBox → stock.location en Odoo | Rastreo físico de activos |

**Tecnologías**:
- Webhooks NetBox (outbound)
- Odoo FastAPI (OCA module)
- queue_job (procesamiento asíncrono)
- pynetbox (biblioteca Python)

**Frecuencia**: Real-time (webhook) + reconciliación diaria (cron)

---

### 2. NetBox ↔ Wazuh: Enrichment de Alertas

**Documento**: [netbox-wazuh.md](./netbox-wazuh.md)

**Objetivo**: Enriquecer alertas de seguridad con contexto de negocio (criticidad, owner, ubicación).

**Flujo de Datos**:

```
Wazuh Alert (IP: 10.20.30.40)
        ↓
Custom Integration Script
        ↓
Query NetBox API: GET /api/ipam/ip-addresses/?address=10.20.30.40
        ↓
Response: device_name, site, criticality, owner_team
        ↓
Enriched Alert: "SSH brute force on srv-db-prod-01 (CRITICAL, DBA Team, DC-SP)"
```

**Casos de Uso**:

| Caso de Uso | Descripción | Beneficio |
|-------------|-----------|-----------|
| **Alert Prioritization** | Alertas en assets críticos reciben nivel elevado | Respuesta más rápida para activos importantes |
| **Auto-Assignment** | Alert en device con owner_team → notifica equipo correcto | Reduce MTTR (Mean Time to Respond) |
| **Context for Investigation** | Alerta incluye site, rack, función del device | Analista tiene contexto completo inmediatamente |
| **False Positive Reduction** | Filtrar alertas de ambientes dev/test | Reduce ruido, enfoque en producción |

**Tecnologías**:
- Wazuh Custom Integration Script (Python)
- NetBox REST API
- Redis (cache de assets, 30min TTL)
- Custom Wazuh Rules

**Frecuencia**: Real-time (por alerta)

---

### 3. Wazuh ↔ Odoo: Auto-Ticketing de Incidentes

**Documento**: [wazuh-odoo.md](./wazuh-odoo.md)

**Objetivo**: Crear tickets automáticamente en Odoo Helpdesk a partir de alertas críticas de Wazuh.

**Flujo de Datos**:

```
Wazuh Alert (rule_level >= 10)
        ↓
Custom Integration Script
        ↓
POST /fastapi/wazuh/alerts (Odoo)
        ↓
Deduplication Check (Redis)
        ↓
Queue Job: create_from_wazuh_alert()
        ↓
helpdesk.ticket created
        ↓
Notifications: Email, Slack, PagerDuty
```

**Casos de Uso**:

| Caso de Uso | Descripción | Beneficio |
|-------------|-----------|-----------|
| **Critical Alerts → Tickets** | Rule level 11-15 → crea ticket urgente | Garantiza que ninguna alerta crítica sea ignorada |
| **Deduplication** | Múltiples alertas idénticas → 1 ticket | Evita spam, consolida contexto |
| **SLA Tracking** | Ticket con prioridad → SLA automático | Cumplimiento con plazos de respuesta |
| **Team Assignment** | Rule group "attack" → Security Team | Enrutamiento automático a especialistas |
| **SOAR Trigger** | Ticket creado → dispara playbook Shuffle | Respuesta automatizada (block IP, isolate host) |

**Tecnologías**:
- Wazuh Custom Integration
- Odoo FastAPI (webhook receiver)
- Odoo helpdesk_mgmt (OCA module)
- Redis (deduplicación)
- Slack/PagerDuty webhooks

**Frecuencia**: Real-time (alertas críticas únicamente)

---

### 4. NetBox ↔ neo_stack: IaC/DevOps

**Documento**: [netbox-neo_stack.md](./netbox-neo_stack.md)

**Objetivo**: Usar NetBox como fuente de datos para pipelines de Infrastructure as Code.

**Status**: Documentación existente, fuera del alcance de la integración Wazuh/Odoo.

**Casos de Uso**:
- Generar configuraciones Terraform a partir de datos NetBox
- Validar compliance de infraestructura
- Drift detection (estado real vs. modelo)

---

## Matriz de Integraciones

| De → Para | Método | Trigger | Latencia | Status |
|-----------|--------|---------|----------|--------|
| NetBox → Odoo | Webhook + FastAPI | create/update/delete device | < 5s | ✅ Implementado |
| Odoo → NetBox | API call (queue_job) | equipment status change | < 10s | ✅ Implementado |
| NetBox → Wazuh | API query (pull) | Wazuh alert fired | < 2s (cached) | ✅ Implementado |
| Wazuh → Odoo | Webhook + FastAPI | rule_level >= 10 | < 3s | ✅ Implementado |
| Odoo → Wazuh | N/A | - | - | ⚠️ Planeado (ticket → active response) |
| Wazuh → NetBox | N/A | - | - | ⚠️ Planeado (mark device as compromised) |

## Datos Mapeados

### NetBox Custom Fields Requeridos

| Campo | Tipo | Usado Por | Descripción |
|-------|------|-----------|-----------|
| `criticality` | Select | Wazuh, Odoo | low/medium/high/critical |
| `owner_team` | Text | Wazuh, Odoo | Equipo responsable (e.g., "DBA Team") |
| `sla_tier` | Select | Odoo | Tier de SLA (1=más crítico) |
| `warranty_end` | Date | Odoo | Fecha de fin de garantía |
| `odoo_equipment_id` | Integer | Odoo | ID del equipment en Odoo |
| `security_zone` | Select | Wazuh | dmz/internal/management/external |

### Odoo Models Extendidos

| Model | Campos Adicionales | Integración |
|-------|-------------------|------------|
| `maintenance.equipment` | netbox_id, netbox_url, netbox_status, criticality, primary_ip | NetBox |
| `helpdesk.ticket` | wazuh_alert_id, wazuh_rule_id, wazuh_rule_level, wazuh_agent_*, is_wazuh_alert | Wazuh |

## Configuración Rápida

### Requisitos Previos

```bash
# Docker Compose con todos los servicios
cd /Users/andersongoliveira/neo_netbox_odoo_stack/neoand-netbox-odoo-stack/lab
docker-compose up -d

# Verificar servicios en ejecución
docker ps | grep -E "netbox|wazuh|odoo|redis"
```

### 1. Configurar NetBox

```bash
# Crear custom fields vía script Python
cd /path/to/scripts
python3 create_netbox_custom_fields.py

# Configurar webhooks (UI o API)
# NetBox Admin → System → Webhooks → Add
```

### 2. Configurar Odoo

```bash
# Instalar módulos OCA
docker exec -it odoo19 odoo -d odoo -i fastapi,queue_job,helpdesk_mgmt --stop-after-init

# Instalar módulo custom (si fue desarrollado)
docker exec -it odoo19 odoo -d odoo -i wazuh_integration,netbox_sync --stop-after-init

# Configurar parámetros
# Settings → Technical → System Parameters
# - netbox.url = https://netbox.example.com
# - netbox.token = tu-token
# - wazuh.dashboard_url = https://wazuh.example.com
```

### 3. Configurar Wazuh

```bash
# Copiar scripts de integración
sudo cp custom-netbox-enrichment.py /var/ossec/integrations/
sudo cp custom-odoo-ticket.py /var/ossec/integrations/
sudo chmod 750 /var/ossec/integrations/custom-*.py
sudo chown root:wazuh /var/ossec/integrations/custom-*.py

# Instalar dependencias
sudo /var/ossec/framework/python/bin/pip3 install requests pynetbox redis

# Editar ossec.conf
sudo vim /var/ossec/etc/ossec.conf
# Agregar integraciones (ver docs específicas)

# Reiniciar
sudo systemctl restart wazuh-manager
```

## Monitoreo de las Integraciones

### Logs

```bash
# NetBox webhooks
docker logs netbox | grep webhook

# Odoo FastAPI
docker exec -it odoo19 tail -f /var/log/odoo/odoo.log | grep fastapi

# Odoo queue_job
docker exec -it odoo19 tail -f /var/log/odoo/odoo.log | grep queue_job

# Wazuh integraciones
sudo tail -f /var/ossec/logs/integrations.log

# Redis cache
redis-cli INFO stats
redis-cli KEYS "netbox:*"
```

### Métricas Recomendadas

| Métrica | Fuente | Alertar Si |
|---------|-------|-----------|
| Webhook success rate | NetBox logs | < 95% |
| Queue job failures | Odoo database | > 10/hora |
| Integration script errors | Wazuh logs | > 5/hora |
| Cache hit ratio | Redis INFO | < 70% |
| Alert → Ticket latency | Timestamp diff | > 30s |

### Dashboards

**Grafana/Prometheus**:
- Webhook delivery time (p50, p95, p99)
- Queue job backlog size
- Integration errors per hour
- Cache hit/miss ratio

**Odoo Internal**:
- Tickets creados por integración (por día)
- Equipment sync status (synced vs. pending)
- Failed sync attempts

**Wazuh/OpenSearch**:
- Alertas enriquecidas vs. no enriquecidas
- Tickets creados por rule_id
- Mean time from alert to ticket creation

## Troubleshooting General

### La integración no está funcionando

```bash
# 1. Verificar conectividad
curl -I https://netbox.example.com
curl -I https://odoo.example.com
curl -I https://wazuh.example.com

# 2. Verificar tokens/autenticación
# NetBox
curl -H "Authorization: Token $NETBOX_TOKEN" https://netbox.example.com/api/dcim/devices/?limit=1

# Odoo
curl -H "Authorization: Bearer $ODOO_API_KEY" https://odoo.example.com/fastapi/wazuh/alerts

# 3. Verificar logs de todos los componentes
docker-compose logs --tail=100 -f netbox wazuh-manager odoo19

# 4. Probar manualmente
# Disparar webhook NetBox
# Crear alerta de prueba en Wazuh
# Verificar queue jobs en Odoo
```

### Rendimiento degradado

```bash
# Verificar Redis
redis-cli INFO memory
redis-cli SLOWLOG GET 10

# Verificar Odoo queue_job
# Jobs pendientes > 100?
docker exec -it odoo19 odoo shell -d odoo
>>> env['queue.job'].search_count([('state', '=', 'pending')])

# Verificar NetBox API
time curl -H "Authorization: Token $TOKEN" https://netbox.example.com/api/dcim/devices/

# Optimizaciones:
# - Aumentar workers queue_job
# - Aumentar TTL del cache Redis
# - Agregar índices en PostgreSQL
```

## Roadmap

### Q1 2026

- [ ] Integración Odoo → Wazuh (active response vía ticket)
- [ ] Wazuh → NetBox (marcar devices comprometidos)
- [ ] Dashboard unificado (Grafana)
- [ ] Machine learning para deduplicación inteligente

### Q2 2026

- [ ] Integración con ServiceNow/iTop (opcional)
- [ ] Auto-remediation vía SOAR (Shuffle/n8n)
- [ ] Compliance reporting automatizado
- [ ] Mobile app para aprobación de tickets críticos

## Recursos Adicionales

### Documentación Oficial

- [NetBox REST API](https://netboxlabs.com/docs/netbox/en/stable/integrations/rest-api/)
- [Wazuh Integrations](https://documentation.wazuh.com/current/user-manual/manager/manual-integration.html)
- [Odoo OCA REST Framework](https://github.com/OCA/rest-framework)
- [Odoo OCA Queue Job](https://github.com/OCA/queue)

### Scripts y Herramientas

- [pynetbox](https://github.com/netbox-community/pynetbox): Cliente Python para NetBox
- [wazuh-api](https://github.com/wazuh/wazuh/tree/master/api): API oficial Wazuh
- [odoo-rpc](https://github.com/OCA/odoo-rpc): Cliente RPC para Odoo

### Comunidad

- [NetBox Discussions](https://github.com/netbox-community/netbox/discussions)
- [Wazuh Slack](https://wazuh.com/community/)
- [Odoo Community Association](https://odoo-community.org/)

---

**Última Actualización**: 2025-12-05
**Versión**: 2.0
**Responsable**: NEO Stack Team
