# Integrações - NEO_NETBOX_ODOO_STACK v2.0

> **AI Context**: Este índice apresenta todas as integrações entre NetBox (CMDB), Wazuh (SIEM/XDR), e Odoo (ERP/ITSM), com fluxos de dados bidirecionais, casos de uso práticos, e referências para documentação detalhada.

## Visão Geral

O **NEO_NETBOX_ODOO_STACK v2.0** é uma plataforma integrada que conecta três sistemas principais:

- **NetBox 4.2**: Source of Truth para infraestrutura (CMDB, IPAM, DCIM)
- **Wazuh 4.12**: Monitoramento de segurança (SIEM, XDR, Compliance)
- **Odoo 19 Community**: Gestão operacional (ERP, Helpdesk, Manutenção)

As integrações criam um **ecossistema unificado** onde dados fluem automaticamente entre sistemas, eliminando silos e automatizando processos operacionais.

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INTEGRAÇÕES                                │
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

## Integrações Disponíveis

### 1. NetBox ↔ Odoo: Sincronização de Assets

**Documento**: [netbox-odoo.md](./netbox-odoo.md)

**Objetivo**: Manter inventário técnico (NetBox) alinhado com gestão de ativos e manutenção (Odoo).

**Fluxo de Dados**:

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

| Caso de Uso | Descrição | Benefício |
|-------------|-----------|-----------|
| **Asset Onboarding** | Device criado no NetBox → automaticamente cria equipment no Odoo | Reduz entrada manual, garante consistência |
| **Status Sync** | Device offline no NetBox → marca equipment em manutenção no Odoo | Visibilidade operacional unificada |
| **Warranty Tracking** | Custom field warranty_end sincronizado → alertas de renovação | Gestão proativa de contratos |
| **Location Mapping** | Site/Rack do NetBox → stock.location no Odoo | Rastreamento físico de ativos |

**Tecnologias**:
- Webhooks NetBox (outbound)
- Odoo FastAPI (OCA module)
- queue_job (processamento assíncrono)
- pynetbox (biblioteca Python)

**Frequência**: Real-time (webhook) + reconciliação diária (cron)

---

### 2. NetBox ↔ Wazuh: Enrichment de Alertas

**Documento**: [netbox-wazuh.md](./netbox-wazuh.md)

**Objetivo**: Enriquecer alertas de segurança com contexto de negócio (criticidade, owner, localização).

**Fluxo de Dados**:

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

| Caso de Uso | Descrição | Benefício |
|-------------|-----------|-----------|
| **Alert Prioritization** | Alertas em assets críticos recebem level elevado | Resposta mais rápida para ativos importantes |
| **Auto-Assignment** | Alert em device com owner_team → notifica time correto | Reduz MTTR (Mean Time to Respond) |
| **Context for Investigation** | Alerta inclui site, rack, função do device | Analista tem contexto completo imediatamente |
| **False Positive Reduction** | Filtrar alertas de ambientes dev/test | Reduz ruído, foco em produção |

**Tecnologias**:
- Wazuh Custom Integration Script (Python)
- NetBox REST API
- Redis (cache de assets, 30min TTL)
- Custom Wazuh Rules

**Frequência**: Real-time (por alerta)

---

### 3. Wazuh ↔ Odoo: Auto-Ticketing de Incidentes

**Documento**: [wazuh-odoo.md](./wazuh-odoo.md)

**Objetivo**: Criar tickets automaticamente no Odoo Helpdesk a partir de alertas críticos do Wazuh.

**Fluxo de Dados**:

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

| Caso de Uso | Descrição | Benefício |
|-------------|-----------|-----------|
| **Critical Alerts → Tickets** | Rule level 11-15 → cria ticket urgente | Garante que nenhum alerta crítico seja ignorado |
| **Deduplication** | Múltiplos alertas idênticos → 1 ticket | Evita spam, consolida contexto |
| **SLA Tracking** | Ticket com prioridade → SLA automático | Compliance com prazos de resposta |
| **Team Assignment** | Rule group "attack" → Security Team | Encaminhamento automático para especialistas |
| **SOAR Trigger** | Ticket criado → dispara playbook Shuffle | Resposta automatizada (block IP, isolate host) |

**Tecnologias**:
- Wazuh Custom Integration
- Odoo FastAPI (webhook receiver)
- Odoo helpdesk_mgmt (OCA module)
- Redis (deduplicação)
- Slack/PagerDuty webhooks

**Frequência**: Real-time (alertas críticos apenas)

---

### 4. NetBox ↔ neo_stack: IaC/DevOps

**Documento**: [netbox-neo_stack.md](./netbox-neo_stack.md)

**Objetivo**: Usar NetBox como fonte de dados para pipelines de Infrastructure as Code.

**Status**: Documentação existente, fora do escopo da integração Wazuh/Odoo.

**Casos de Uso**:
- Gerar configurações Terraform a partir de dados NetBox
- Validar compliance de infraestrutura
- Drift detection (estado real vs. modelo)

---

## Matriz de Integrações

| De → Para | Método | Trigger | Latência | Status |
|-----------|--------|---------|----------|--------|
| NetBox → Odoo | Webhook + FastAPI | create/update/delete device | < 5s | ✅ Implementado |
| Odoo → NetBox | API call (queue_job) | equipment status change | < 10s | ✅ Implementado |
| NetBox → Wazuh | API query (pull) | Wazuh alert fired | < 2s (cached) | ✅ Implementado |
| Wazuh → Odoo | Webhook + FastAPI | rule_level >= 10 | < 3s | ✅ Implementado |
| Odoo → Wazuh | N/A | - | - | ⚠️ Planejado (ticket → active response) |
| Wazuh → NetBox | N/A | - | - | ⚠️ Planejado (mark device as compromised) |

## Dados Mapeados

### NetBox Custom Fields Requeridos

| Campo | Tipo | Usado Por | Descrição |
|-------|------|-----------|-----------|
| `criticality` | Select | Wazuh, Odoo | low/medium/high/critical |
| `owner_team` | Text | Wazuh, Odoo | Time responsável (e.g., "DBA Team") |
| `sla_tier` | Select | Odoo | Tier de SLA (1=mais crítico) |
| `warranty_end` | Date | Odoo | Data de fim de garantia |
| `odoo_equipment_id` | Integer | Odoo | ID do equipment no Odoo |
| `security_zone` | Select | Wazuh | dmz/internal/management/external |

### Odoo Models Estendidos

| Model | Campos Adicionados | Integração |
|-------|-------------------|------------|
| `maintenance.equipment` | netbox_id, netbox_url, netbox_status, criticality, primary_ip | NetBox |
| `helpdesk.ticket` | wazuh_alert_id, wazuh_rule_id, wazuh_rule_level, wazuh_agent_*, is_wazuh_alert | Wazuh |

## Configuração Rápida

### Pré-requisitos

```bash
# Docker Compose com todos os serviços
cd /Users/andersongoliveira/neo_netbox_odoo_stack/neoand-netbox-odoo-stack/lab
docker-compose up -d

# Verificar serviços rodando
docker ps | grep -E "netbox|wazuh|odoo|redis"
```

### 1. Configurar NetBox

```bash
# Criar custom fields via script Python
cd /path/to/scripts
python3 create_netbox_custom_fields.py

# Configurar webhooks (UI ou API)
# NetBox Admin → System → Webhooks → Add
```

### 2. Configurar Odoo

```bash
# Instalar módulos OCA
docker exec -it odoo19 odoo -d odoo -i fastapi,queue_job,helpdesk_mgmt --stop-after-init

# Instalar módulo custom (se desenvolvido)
docker exec -it odoo19 odoo -d odoo -i wazuh_integration,netbox_sync --stop-after-init

# Configurar parâmetros
# Settings → Technical → System Parameters
# - netbox.url = https://netbox.example.com
# - netbox.token = seu-token
# - wazuh.dashboard_url = https://wazuh.example.com
```

### 3. Configurar Wazuh

```bash
# Copiar scripts de integração
sudo cp custom-netbox-enrichment.py /var/ossec/integrations/
sudo cp custom-odoo-ticket.py /var/ossec/integrations/
sudo chmod 750 /var/ossec/integrations/custom-*.py
sudo chown root:wazuh /var/ossec/integrations/custom-*.py

# Instalar dependências
sudo /var/ossec/framework/python/bin/pip3 install requests pynetbox redis

# Editar ossec.conf
sudo vim /var/ossec/etc/ossec.conf
# Adicionar integrações (ver docs específicas)

# Reiniciar
sudo systemctl restart wazuh-manager
```

## Monitoramento das Integrações

### Logs

```bash
# NetBox webhooks
docker logs netbox | grep webhook

# Odoo FastAPI
docker exec -it odoo19 tail -f /var/log/odoo/odoo.log | grep fastapi

# Odoo queue_job
docker exec -it odoo19 tail -f /var/log/odoo/odoo.log | grep queue_job

# Wazuh integrações
sudo tail -f /var/ossec/logs/integrations.log

# Redis cache
redis-cli INFO stats
redis-cli KEYS "netbox:*"
```

### Métricas Recomendadas

| Métrica | Fonte | Alerta Se |
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
- Tickets criados por integração (por dia)
- Equipment sync status (synced vs. pending)
- Failed sync attempts

**Wazuh/OpenSearch**:
- Alertas enriquecidos vs. não enriquecidos
- Tickets criados por rule_id
- Mean time from alert to ticket creation

## Troubleshooting Geral

### Integração não está funcionando

```bash
# 1. Verificar conectividade
curl -I https://netbox.example.com
curl -I https://odoo.example.com
curl -I https://wazuh.example.com

# 2. Verificar tokens/autenticação
# NetBox
curl -H "Authorization: Token $NETBOX_TOKEN" https://netbox.example.com/api/dcim/devices/?limit=1

# Odoo
curl -H "Authorization: Bearer $ODOO_API_KEY" https://odoo.example.com/fastapi/wazuh/alerts

# 3. Verificar logs de todos os componentes
docker-compose logs --tail=100 -f netbox wazuh-manager odoo19

# 4. Testar manualmente
# Disparar webhook NetBox
# Criar alerta de teste no Wazuh
# Verificar queue jobs no Odoo
```

### Performance degradada

```bash
# Verificar Redis
redis-cli INFO memory
redis-cli SLOWLOG GET 10

# Verificar Odoo queue_job
# Jobs pendentes > 100?
docker exec -it odoo19 odoo shell -d odoo
>>> env['queue.job'].search_count([('state', '=', 'pending')])

# Verificar NetBox API
time curl -H "Authorization: Token $TOKEN" https://netbox.example.com/api/dcim/devices/

# Otimizações:
# - Aumentar workers queue_job
# - Aumentar TTL do cache Redis
# - Adicionar índices no PostgreSQL
```

## Roadmap

### Q1 2026

- [ ] Integração Odoo → Wazuh (active response via ticket)
- [ ] Wazuh → NetBox (marcar devices comprometidos)
- [ ] Dashboard unificado (Grafana)
- [ ] Machine learning para deduplicação inteligente

### Q2 2026

- [ ] Integração com ServiceNow/iTop (opcional)
- [ ] Auto-remediation via SOAR (Shuffle/n8n)
- [ ] Compliance reporting automatizado
- [ ] Mobile app para aprovação de tickets críticos

## Recursos Adicionais

### Documentação Oficial

- [NetBox REST API](https://netboxlabs.com/docs/netbox/en/stable/integrations/rest-api/)
- [Wazuh Integrations](https://documentation.wazuh.com/current/user-manual/manager/manual-integration.html)
- [Odoo OCA REST Framework](https://github.com/OCA/rest-framework)
- [Odoo OCA Queue Job](https://github.com/OCA/queue)

### Scripts e Ferramentas

- [pynetbox](https://github.com/netbox-community/pynetbox): Cliente Python para NetBox
- [wazuh-api](https://github.com/wazuh/wazuh/tree/master/api): API oficial Wazuh
- [odoo-rpc](https://github.com/OCA/odoo-rpc): Cliente RPC para Odoo

### Comunidade

- [NetBox Discussions](https://github.com/netbox-community/netbox/discussions)
- [Wazuh Slack](https://wazuh.com/community/)
- [Odoo Community Association](https://odoo-community.org/)

---

**Última Atualização**: 2025-12-05
**Versão**: 2.0
**Mantenedor**: NEO Stack Team
