# Workflows Shuffle - Ejemplos Prácticos

> **AI Context**: Catálogo de workflows Shuffle listos para automatización de respuesta a incidentes. Incluye JSON completo, diagramas y casos de uso. Stack: Wazuh → Shuffle → Odoo/NetBox. Keywords: Shuffle workflows, automation playbooks, incident response, Wazuh alerts, Odoo tickets, NetBox enrichment.

## Descripción General

Este documento contiene workflows listos para usar en **Shuffle SOAR**, cubriendo casos comunes de respuesta a incidentes de seguridad.

### Estructura de un Workflow

```
┌─────────────┐
│   TRIGGER   │  ← Webhook, Schedule, Manual
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ACTION 1  │  ← Parse data, API call
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CONDITION  │  ← If/else, filter
└──┬─────┬────┘
   │     │
   ▼     ▼
┌────┐ ┌────┐
│ A2 │ │ A3 │  ← Acciones paralelas
└────┘ └────┘
```

## Workflow 1: Alerta → Enriquecimiento → Ticket

### Caso de Uso
Recibir alerta de Wazuh, enriquecer con datos de NetBox y crear ticket en Odoo.

### Diagrama

```
┌─────────────────┐
│ Wazuh Webhook   │
│ (Trigger)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse Alert     │
│ (Python)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Host Info   │
│ (NetBox API)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Severity  │
│ (Condition)     │
└─────┬─────┬─────┘
      │     │
  ≥10 │     │ <10
      │     │
      ▼     ▼
  ┌────┐  ┌────┐
  │Crit│  │Warn│
  │    │  │    │
  └─┬──┘  └─┬──┘
    │       │
    ▼       ▼
┌────────────────┐
│ Create Ticket  │
│ (Odoo API)     │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Send Slack     │
│ Notification   │
└────────────────┘
```

### JSON Completo

```json
{
  "name": "Wazuh Alert to Odoo Ticket",
  "description": "Recibe alerta Wazuh, enriquece con NetBox y crea ticket en Odoo",
  "start": "webhook_1",
  "actions": [
    {
      "id": "webhook_1",
      "app_name": "Webhook",
      "app_version": "1.0.0",
      "label": "Wazuh Alert",
      "name": "webhook",
      "parameters": [],
      "position": {
        "x": 400,
        "y": 100
      }
    },
    {
      "id": "parse_alert_2",
      "app_name": "Shuffle Tools",
      "app_version": "1.2.0",
      "label": "Parse Wazuh Alert",
      "name": "execute_python",
      "parameters": [
        {
          "name": "code",
          "value": "import json\nimport sys\n\n# Parsear webhook body\ntry:\n    if isinstance($webhook_1.#.body$, str):\n        alert = json.loads($webhook_1.#.body$)\n    else:\n        alert = $webhook_1.#.body$\n    \n    # Extraer campos clave\n    result = {\n        'rule_id': alert['rule']['id'],\n        'rule_level': int(alert['rule']['level']),\n        'description': alert['rule']['description'],\n        'agent_id': alert['agent']['id'],\n        'agent_name': alert['agent']['name'],\n        'agent_ip': alert['agent']['ip'],\n        'timestamp': alert['timestamp'],\n        'full_log': alert.get('full_log', 'N/A'),\n        'groups': ','.join(alert['rule'].get('groups', [])),\n        'location': alert.get('location', 'unknown')\n    }\n    \n    print(json.dumps(result))\nexcept Exception as e:\n    print(json.dumps({'error': str(e)}))\n    sys.exit(1)"
        }
      ],
      "position": {
        "x": 400,
        "y": 250
      }
    },
    {
      "id": "netbox_enrichment_3",
      "app_name": "HTTP",
      "app_version": "1.3.0",
      "label": "Get Host from NetBox",
      "name": "request",
      "authentication": [
        {
          "key": "Authorization",
          "value": "Token YOUR_NETBOX_TOKEN"
        },
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ],
      "parameters": [
        {
          "name": "url",
          "value": "https://netbox.neoand.local/api/dcim/devices/?name=$parse_alert_2.agent_name$"
        },
        {
          "name": "method",
          "value": "GET"
        }
      ],
      "position": {
        "x": 400,
        "y": 400
      }
    },
    {
      "id": "condition_severity_4",
      "app_name": "Shuffle Tools",
      "app_version": "1.2.0",
      "label": "Check Severity",
      "name": "filter_list",
      "parameters": [
        {
          "name": "item",
          "value": "$parse_alert_2.rule_level$"
        },
        {
          "name": "check",
          "value": ">="
        },
        {
          "name": "value",
          "value": "10"
        }
      ],
      "position": {
        "x": 400,
        "y": 550
      },
      "branches": [
        {
          "condition": "true",
          "destination_id": "create_critical_ticket_5"
        },
        {
          "condition": "false",
          "destination_id": "create_warning_ticket_6"
        }
      ]
    },
    {
      "id": "create_critical_ticket_5",
      "app_name": "HTTP",
      "app_version": "1.3.0",
      "label": "Create Critical Ticket (Odoo)",
      "name": "request",
      "authentication": [
        {
          "key": "X-Odoo-Database",
          "value": "neoand_prod"
        },
        {
          "key": "X-Odoo-API-Key",
          "value": "YOUR_ODOO_API_KEY"
        },
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ],
      "parameters": [
        {
          "name": "url",
          "value": "https://odoo.neoand.local/api/helpdesk.ticket"
        },
        {
          "name": "method",
          "value": "POST"
        },
        {
          "name": "body",
          "value": "{\n  \"name\": \"[CRÍTICO] $parse_alert_2.description$\",\n  \"description\": \"**Alerta Wazuh**\\n\\n**Rule ID**: $parse_alert_2.rule_id$\\n**Severidad**: $parse_alert_2.rule_level$/15\\n**Agente**: $parse_alert_2.agent_name$ ($parse_alert_2.agent_ip$)\\n**Timestamp**: $parse_alert_2.timestamp$\\n\\n**Log Completo**:\\n```\\n$parse_alert_2.full_log$\\n```\\n\\n**Datos NetBox**:\\n$netbox_enrichment_3.body$\",\n  \"priority\": \"3\",\n  \"team_id\": 1,\n  \"partner_id\": false,\n  \"tag_ids\": [[6, 0, [1, 2]]]\n}"
        }
      ],
      "position": {
        "x": 250,
        "y": 700
      }
    },
    {
      "id": "create_warning_ticket_6",
      "app_name": "HTTP",
      "app_version": "1.3.0",
      "label": "Create Warning Ticket (Odoo)",
      "name": "request",
      "authentication": [
        {
          "key": "X-Odoo-Database",
          "value": "neoand_prod"
        },
        {
          "key": "X-Odoo-API-Key",
          "value": "YOUR_ODOO_API_KEY"
        },
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ],
      "parameters": [
        {
          "name": "url",
          "value": "https://odoo.neoand.local/api/helpdesk.ticket"
        },
        {
          "name": "method",
          "value": "POST"
        },
        {
          "name": "body",
          "value": "{\n  \"name\": \"[AVISO] $parse_alert_2.description$\",\n  \"description\": \"**Alerta Wazuh**\\n\\n**Rule ID**: $parse_alert_2.rule_id$\\n**Severidad**: $parse_alert_2.rule_level$/15\\n**Agente**: $parse_alert_2.agent_name$ ($parse_alert_2.agent_ip$)\\n**Timestamp**: $parse_alert_2.timestamp$\\n\\n**Log Completo**:\\n```\\n$parse_alert_2.full_log$\\n```\",\n  \"priority\": \"1\",\n  \"team_id\": 1,\n  \"partner_id\": false,\n  \"tag_ids\": [[6, 0, [3]]]\n}"
        }
      ],
      "position": {
        "x": 550,
        "y": 700
      }
    },
    {
      "id": "notify_slack_7",
      "app_name": "Slack",
      "app_version": "1.5.0",
      "label": "Send Slack Notification",
      "name": "send_message",
      "authentication": [
        {
          "key": "token",
          "value": "xoxb-YOUR-SLACK-BOT-TOKEN"
        }
      ],
      "parameters": [
        {
          "name": "channel",
          "value": "#security-alerts"
        },
        {
          "name": "text",
          "value": ":warning: **Nueva Alerta Wazuh**\\n\\n*Rule*: $parse_alert_2.rule_id$ - $parse_alert_2.description$\\n*Severidad*: $parse_alert_2.rule_level$/15\\n*Host*: $parse_alert_2.agent_name$ ($parse_alert_2.agent_ip$)\\n*Ticket Odoo*: Creado"
        }
      ],
      "position": {
        "x": 400,
        "y": 850
      }
    }
  ],
  "branches": [
    {
      "source_id": "webhook_1",
      "destination_id": "parse_alert_2"
    },
    {
      "source_id": "parse_alert_2",
      "destination_id": "netbox_enrichment_3"
    },
    {
      "source_id": "netbox_enrichment_3",
      "destination_id": "condition_severity_4"
    },
    {
      "source_id": "create_critical_ticket_5",
      "destination_id": "notify_slack_7"
    },
    {
      "source_id": "create_warning_ticket_6",
      "destination_id": "notify_slack_7"
    }
  ],
  "triggers": ["webhook_1"],
  "configuration": {
    "exit_on_error": false,
    "start_from_top": true,
    "skip_notifications": false
  }
}
```

### Importar en Shuffle

```bash
# Vía API
curl -X POST http://localhost:3001/api/v1/workflows \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflow-alert-enrichment-ticket.json

# Vía UI
# 1. Workflows → Import
# 2. Pegar el JSON anterior
# 3. Click en "Import"
```

### Prueba

```bash
curl -X POST http://localhost:3001/api/v1/hooks/webhook_XXXXXX \
  -H "Content-Type: application/json" \
  -d '{
  "timestamp": "2025-12-05T15:00:00-0300",
  "rule": {
    "level": 12,
    "description": "Malware detected",
    "id": "554",
    "groups": ["malware"]
  },
  "agent": {
    "id": "001",
    "name": "web-server-01",
    "ip": "192.168.1.50"
  },
  "full_log": "Malware /var/www/malware.php detected"
}'
```

---

## Workflow 2: Bloqueo Automático de IP Maliciosa

### Caso de Uso
Detectar IP maliciosa atacando servidor y bloquearla automáticamente en el firewall.

### Diagrama

```
┌─────────────────┐
│ Wazuh Alert     │
│ (Brute Force)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Source  │
│ IP Address      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check IP in     │
│ Whitelist       │
└─────┬─────┬─────┘
      │     │
  NO  │     │ YES
      │     │
      ▼     ▼
  ┌────┐  ┌────────┐
  │    │  │ Skip   │
  │    │  │ (Safe) │
  │    │  └────────┘
  │    │
  │    ▼
  │ ┌─────────────┐
  │ │ Check Threat│
  │ │ Intel (MISP)│
  │ └──────┬──────┘
  │        │
  │        ▼
  │ ┌─────────────┐
  │ │ Block IP    │
  │ │ (iptables)  │
  │ └──────┬──────┘
  │        │
  │        ▼
  │ ┌─────────────┐
  │ │ Log Action  │
  │ │ (Odoo)      │
  │ └──────┬──────┘
  │        │
  └────────┴───────►
           │
           ▼
    ┌────────────┐
    │ Notify SOC │
    └────────────┘
```

### JSON Completo

```json
{
  "name": "Auto-Block Malicious IP",
  "description": "Bloquea automáticamente IPs maliciosas detectadas por Wazuh",
  "start": "webhook_1",
  "actions": [
    {
      "id": "webhook_1",
      "app_name": "Webhook",
      "app_version": "1.0.0",
      "label": "Wazuh Brute Force Alert",
      "name": "webhook"
    },
    {
      "id": "extract_ip_2",
      "app_name": "Shuffle Tools",
      "app_version": "1.2.0",
      "label": "Extract Source IP",
      "name": "execute_python",
      "parameters": [
        {
          "name": "code",
          "value": "import json\nimport re\n\nalert = json.loads($webhook_1.#.body$)\nfull_log = alert.get('full_log', '')\n\n# Extraer IP del log\nip_pattern = r'\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b'\nips = re.findall(ip_pattern, full_log)\n\nresult = {\n    'source_ip': ips[0] if ips else 'unknown',\n    'rule_id': alert['rule']['id'],\n    'agent_name': alert['agent']['name']\n}\n\nprint(json.dumps(result))"
        }
      ]
    },
    {
      "id": "check_whitelist_3",
      "app_name": "Shuffle Tools",
      "app_version": "1.2.0",
      "label": "Check IP Whitelist",
      "name": "execute_python",
      "parameters": [
        {
          "name": "code",
          "value": "import json\n\nWHITELIST = [\n    '192.168.1.0/24',\n    '10.0.0.0/8',\n    '172.16.0.0/12'\n]\n\nsource_ip = '$extract_ip_2.source_ip$'\n\n# Simplificado - en producción usar módulo ipaddress\nis_whitelisted = any(source_ip.startswith(net.split('/')[0][:7]) for net in WHITELIST)\n\nresult = {\n    'ip': source_ip,\n    'is_whitelisted': is_whitelisted\n}\n\nprint(json.dumps(result))"
        }
      ],
      "branches": [
        {
          "condition": "$check_whitelist_3.is_whitelisted$ == false",
          "destination_id": "block_ip_4"
        },
        {
          "condition": "$check_whitelist_3.is_whitelisted$ == true",
          "destination_id": "skip_action_5"
        }
      ]
    },
    {
      "id": "block_ip_4",
      "app_name": "SSH",
      "app_version": "1.1.0",
      "label": "Block IP via iptables",
      "name": "execute_command",
      "authentication": [
        {
          "key": "host",
          "value": "$extract_ip_2.agent_name$"
        },
        {
          "key": "username",
          "value": "ansible"
        },
        {
          "key": "private_key",
          "value": "$SSH_PRIVATE_KEY$"
        }
      ],
      "parameters": [
        {
          "name": "command",
          "value": "sudo iptables -A INPUT -s $extract_ip_2.source_ip$ -j DROP && sudo iptables-save > /etc/iptables/rules.v4"
        }
      ]
    },
    {
      "id": "skip_action_5",
      "app_name": "Shuffle Tools",
      "app_version": "1.2.0",
      "label": "Skip (Whitelisted)",
      "name": "execute_python",
      "parameters": [
        {
          "name": "code",
          "value": "print(json.dumps({'action': 'skipped', 'reason': 'IP whitelisted'}))"
        }
      ]
    },
    {
      "id": "log_odoo_6",
      "app_name": "HTTP",
      "app_version": "1.3.0",
      "label": "Log Action in Odoo",
      "name": "request",
      "parameters": [
        {
          "name": "url",
          "value": "https://odoo.neoand.local/api/helpdesk.ticket"
        },
        {
          "name": "method",
          "value": "POST"
        },
        {
          "name": "body",
          "value": "{\n  \"name\": \"IP Bloqueada Automáticamente: $extract_ip_2.source_ip$\",\n  \"description\": \"**Acción Automática SOAR**\\n\\n**IP**: $extract_ip_2.source_ip$\\n**Host**: $extract_ip_2.agent_name$\\n**Razón**: Brute force detectado (rule $extract_ip_2.rule_id$)\\n**Acción**: Bloqueada vía iptables\\n**Timestamp**: $webhook_1.timestamp$\",\n  \"priority\": \"2\",\n  \"team_id\": 1,\n  \"tag_ids\": [[6, 0, [4, 5]]]\n}"
        }
      ]
    },
    {
      "id": "notify_7",
      "app_name": "Slack",
      "app_version": "1.5.0",
      "label": "Notify SOC",
      "name": "send_message",
      "parameters": [
        {
          "name": "channel",
          "value": "#soc-alerts"
        },
        {
          "name": "text",
          "value": ":no_entry: **IP Bloqueada Automáticamente**\\n\\n*IP*: `$extract_ip_2.source_ip$`\\n*Host*: $extract_ip_2.agent_name$\\n*Razón*: Brute force attack\\n*Acción*: Bloqueada vía iptables"
        }
      ]
    }
  ]
}
```

---

## Workflow 3: Reporte de Compliance

### Caso de Uso
Generar reporte diario de conformidad (CIS, PCI-DSS) y enviar a stakeholders.

### Diagrama

```
┌─────────────────┐
│ Schedule Daily  │
│ (06:00 AM)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Wazuh     │
│ Last 24h        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aggregate       │
│ by Rule Group   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check PCI-DSS   │
│ Compliance      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate PDF    │
│ Report          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload to Odoo  │
│ (Document)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email Report    │
│ to Management   │
└─────────────────┘
```

### JSON Simplificado

```json
{
  "name": "Daily Compliance Report",
  "description": "Genera reporte diario de compliance PCI-DSS",
  "start": "schedule_1",
  "actions": [
    {
      "id": "schedule_1",
      "app_name": "Schedule",
      "app_version": "1.0.0",
      "label": "Trigger Daily (6 AM)",
      "name": "cron",
      "parameters": [
        {
          "name": "cron",
          "value": "0 6 * * *"
        }
      ]
    },
    {
      "id": "query_wazuh_2",
      "app_name": "HTTP",
      "app_version": "1.3.0",
      "label": "Query Wazuh API (24h)",
      "name": "request",
      "parameters": [
        {
          "name": "url",
          "value": "https://wazuh.neoand.local:55000/security/alerts?q=timestamp>now-24h;pci_dss=exists(true)"
        },
        {
          "name": "method",
          "value": "GET"
        },
        {
          "name": "headers",
          "value": "Authorization: Bearer $WAZUH_API_TOKEN$"
        }
      ]
    },
    {
      "id": "aggregate_3",
      "app_name": "Shuffle Tools",
      "app_version": "1.2.0",
      "label": "Aggregate Compliance Data",
      "name": "execute_python",
      "parameters": [
        {
          "name": "code",
          "value": "import json\nfrom collections import Counter\n\nalerts = json.loads($query_wazuh_2.body$)['data']['affected_items']\n\n# Agregar por requisito PCI-DSS\npci_counts = Counter()\nfor alert in alerts:\n    for pci in alert.get('rule', {}).get('pci_dss', []):\n        pci_counts[pci] += 1\n\nresult = {\n    'total_alerts': len(alerts),\n    'pci_dss_breakdown': dict(pci_counts),\n    'critical_alerts': len([a for a in alerts if a['rule']['level'] >= 12]),\n    'timestamp': '$schedule_1.timestamp$'\n}\n\nprint(json.dumps(result))"
        }
      ]
    },
    {
      "id": "generate_pdf_4",
      "app_name": "HTTP",
      "app_version": "1.3.0",
      "label": "Generate PDF Report",
      "name": "request",
      "parameters": [
        {
          "name": "url",
          "value": "http://pdf-generator:5000/generate"
        },
        {
          "name": "method",
          "value": "POST"
        },
        {
          "name": "body",
          "value": "{\n  \"template\": \"pci_dss_report\",\n  \"data\": $aggregate_3.#$\n}"
        }
      ]
    },
    {
      "id": "upload_odoo_5",
      "app_name": "HTTP",
      "app_version": "1.3.0",
      "label": "Upload to Odoo Documents",
      "name": "request",
      "parameters": [
        {
          "name": "url",
          "value": "https://odoo.neoand.local/api/documents.document"
        },
        {
          "name": "method",
          "value": "POST"
        },
        {
          "name": "body",
          "value": "{\n  \"name\": \"Compliance Report - $schedule_1.timestamp$\",\n  \"datas\": \"$generate_pdf_4.body_base64$\",\n  \"folder_id\": 5,\n  \"tag_ids\": [[6, 0, [10, 11]]]\n}"
        }
      ]
    },
    {
      "id": "email_6",
      "app_name": "Email",
      "app_version": "1.2.0",
      "label": "Email to Management",
      "name": "send_email",
      "parameters": [
        {
          "name": "to",
          "value": "compliance@neoand.com"
        },
        {
          "name": "subject",
          "value": "Reporte Diario de Compliance PCI-DSS - $schedule_1.timestamp$"
        },
        {
          "name": "body",
          "value": "Estimados,\\n\\nAdjunto reporte automático de compliance PCI-DSS de las últimas 24 horas:\\n\\n- Total de alertas: $aggregate_3.total_alerts$\\n- Alertas críticas: $aggregate_3.critical_alerts$\\n\\nEl reporte completo está disponible en Odoo Documents.\\n\\nSaludos,\\nSistema SOAR"
        },
        {
          "name": "attachments",
          "value": "$generate_pdf_4.body$"
        }
      ]
    }
  ]
}
```

---

## Mejores Prácticas

### 1. Manejo de Errores

```python
# En todas las actions Python
import json
import sys

try:
    # Código principal
    result = {'status': 'success', 'data': data}
    print(json.dumps(result))
except Exception as e:
    error = {'status': 'error', 'message': str(e)}
    print(json.dumps(error))
    sys.exit(1)  # Fallar workflow
```

### 2. Logging

```python
# Log detallado para debug
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug(f"Processing alert: {alert['rule']['id']}")
logger.info(f"Created ticket: {ticket_id}")
logger.error(f"Failed to connect: {error}")
```

### 3. Variables de Entorno

```bash
# En Shuffle backend
docker exec -it shuffle-backend bash

# Agregar secrets
export ODOO_API_KEY="secret123"
export NETBOX_TOKEN="token456"

# Usar en workflows: $ODOO_API_KEY$
```

### 4. Rate Limiting

```python
# Evitar sobrecarga de APIs
import time

def rate_limit_api_call(url):
    time.sleep(1)  # 1 segundo entre llamadas
    response = requests.get(url)
    return response
```

### 5. Idempotencia

```python
# Verificar si acción ya fue ejecutada
def create_ticket_idempotent(alert_id):
    # Verificar si ticket ya existe
    existing = check_existing_ticket(alert_id)
    if existing:
        return existing
    else:
        return create_new_ticket(alert_id)
```

## Próximos Pasos

1. **[Playbooks Avanzados](../playbooks/index.md)**: Respuesta a malware, ransomware
2. **[Integración n8n](../n8n/workflows.md)**: Compare alternativa más simple
3. **[Troubleshooting](setup.md#troubleshooting)**: Resolver problemas comunes

## Recursos Adicionales

- [Shuffle Workflow Examples](https://github.com/Shuffle/workflows)
- [Wazuh Use Cases](https://documentation.wazuh.com/current/user-manual/capabilities/index.html)
- [Odoo API Docs](https://www.odoo.com/documentation/17.0/developer/reference/backend/orm.html)

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Workflows probados**: Shuffle 1.3.0, Wazuh 4.5.4, Odoo 17.0
