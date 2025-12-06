# 🔗 Integração Wazuh + n8n Workflow Automation

> **AI Context**: Guia completo de integração entre Wazuh 4.12+ e n8n (workflow automation platform). n8n é uma alternativa ao Zapier/Make, totalmente open source, com 400+ integrações nativas. Este documento mostra como automatizar incident response, ticketing, e enriquecimento de alertas usando n8n.

---

## 🎯 **Visão Geral**

### **O que é n8n?**

**n8n** (nodemation) é uma plataforma de automação de workflows open source com:

- 400+ integrações nativas (Odoo, NetBox, Slack, etc.)
- Editor visual drag-and-drop
- Execução local (self-hosted) ou cloud
- JavaScript personalizado em cada node
- Webhooks ilimitados
- Totalmente gratuito (licença Fair-Code)

### **Wazuh + n8n: Casos de Uso**

```
AUTOMAÇÕES:
├─ Auto-ticketing em Odoo/Jira/ServiceNow
├─ Enriquecimento de alertas com NetBox
├─ Notificações multi-canal (Slack/Teams/Email)
├─ Atualização de status de ativos
├─ Geração de relatórios agendados
├─ Integração com CTI feeds (MISP, OTX)
└─ Orquestração de resposta a incidentes
```

---

## 🏗️ **Arquitetura**

### **Fluxo de Dados**

```
┌─────────────────────────────────────────────────────────────────┐
│                     WAZUH + N8N INTEGRATION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                    ┌──────────────┐          │
│  │   Wazuh      │   Webhook          │     n8n      │          │
│  │   Manager    ├───────────────────►│   Webhook    │          │
│  │   (4.12+)    │   JSON Alert       │   Trigger    │          │
│  └──────────────┘                    └──────┬───────┘          │
│                                             │                   │
│                                             │                   │
│                                             ▼                   │
│                                    ┌────────────────┐          │
│                                    │   Workflow     │          │
│                                    │   Nodes        │          │
│                                    └───────┬────────┘          │
│                                            │                   │
│            ┌───────────────────────────────┼───────────┐       │
│            │                               │           │       │
│            ▼                               ▼           ▼       │
│     ┌────────────┐                 ┌────────────┐  ┌─────────┐│
│     │  NetBox    │                 │   Odoo 19  │  │  Slack  ││
│     │  Node      │                 │   Node     │  │  Node   ││
│     │            │                 │            │  │         ││
│     │ Enrich     │                 │  Create    │  │ Notify  ││
│     │ Asset Data │                 │  Ticket    │  │  Team   ││
│     └────────────┘                 └────────────┘  └─────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Instalação**

### **1. Instalar n8n (Docker)**

```bash
# Criar diretório
mkdir -p ~/n8n-docker
cd ~/n8n-docker

# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      # Basic Config
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=CHANGE_ME_STRONG_PASSWORD

      # External URL (para webhooks)
      - WEBHOOK_URL=https://n8n.empresa.com
      - N8N_HOST=n8n.empresa.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https

      # Timezone
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - TZ=America/Sao_Paulo

      # Execution
      - EXECUTIONS_TIMEOUT=3600
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=336

      # Security
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info

    volumes:
      - ./n8n-data:/home/node/.n8n
      - ./custom-nodes:/home/node/.n8n/custom
      - ./workflows:/home/node/.n8n/workflows

  postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_password
      - POSTGRES_DB=n8n
    volumes:
      - ./postgres-data:/var/lib/postgresql/data

  # Opcional: Redis para queue
  redis:
    image: redis:7-alpine
    container_name: n8n-redis
    restart: unless-stopped
    volumes:
      - ./redis-data:/data

networks:
  default:
    name: n8n-network
EOF

# Subir serviços
docker-compose up -d

# Verificar logs
docker logs -f n8n

# Acessar UI
# URL: http://localhost:5678
# User: admin
# Password: (definido no docker-compose.yml)
```

### **2. Configurar Wazuh para n8n**

**Editar ossec.conf:**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <!-- Webhook para todos os alertas relevantes -->
  <integration>
    <name>webhook</name>
    <hook_url>https://n8n.empresa.com/webhook/wazuh-alerts</hook_url>
    <level>7</level>
    <alert_format>json</alert_format>
    <options>
      <retry_attempts>3</retry_attempts>
      <retry_interval>15</retry_interval>
      <timeout>5</timeout>
    </options>
  </integration>

  <!-- Webhook específico para alertas críticos -->
  <integration>
    <name>webhook</name>
    <hook_url>https://n8n.empresa.com/webhook/wazuh-critical</hook_url>
    <level>12</level>
    <alert_format>json</alert_format>
  </integration>

  <!-- Webhook para ticketing automático -->
  <integration>
    <name>webhook</name>
    <hook_url>https://n8n.empresa.com/webhook/odoo-ticketing</hook_url>
    <level>8</level>
    <rule_id>210010,210011,210020,210021,220000,220010</rule_id>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

**Recarregar configuração:**

```bash
# Hot reload (Wazuh 4.12+)
/var/ossec/bin/wazuh-control reload

# Verificar logs
tail -f /var/ossec/logs/integrations.log
```

---

## 📋 **Workflows Prontos**

### **Workflow 1: Auto-Ticketing Odoo**

**Descrição:** Recebe alerta Wazuh, enriquece com NetBox, cria ticket Odoo.

**Nodes:**

```
[Webhook] → [Parse JSON] → [NetBox HTTP Request] → [Odoo Create Ticket] → [Slack Notification]
```

**Configuração Step-by-Step:**

#### **Node 1: Webhook Trigger**

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "wazuh-alerts",
        "responseMode": "onReceived",
        "options": {}
      },
      "name": "Wazuh Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    }
  ]
}
```

#### **Node 2: Parse Wazuh Alert**

```json
{
  "parameters": {
    "functionCode": "const alert = $input.item.json;\n\nreturn {\n  json: {\n    alertId: alert.id,\n    ruleId: alert.rule.id,\n    ruleDescription: alert.rule.description,\n    ruleLevel: alert.rule.level,\n    agentName: alert.agent.name,\n    agentIp: alert.agent.ip,\n    timestamp: alert.timestamp,\n    fullLog: alert.full_log\n  }\n};"
  },
  "name": "Parse Alert",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [450, 300]
}
```

#### **Node 3: Enrich with NetBox**

```json
{
  "parameters": {
    "url": "=https://netbox.empresa.com/api/ipam/ip-addresses/?address={{$json.agentIp}}",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "options": {
      "headers": {
        "entries": [
          {
            "name": "Authorization",
            "value": "Token YOUR_NETBOX_TOKEN"
          }
        ]
      }
    }
  },
  "name": "NetBox Get Asset",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "position": [650, 300]
}
```

#### **Node 4: Extract Asset Info**

```json
{
  "parameters": {
    "functionCode": "const netboxData = $input.item.json;\nconst wazuhAlert = $node['Parse Alert'].json;\n\nlet asset = null;\nif (netboxData.count > 0) {\n  const ipObj = netboxData.results[0];\n  if (ipObj.assigned_object) {\n    asset = {\n      deviceName: ipObj.assigned_object.device.name,\n      deviceId: ipObj.assigned_object.device.id,\n      interface: ipObj.assigned_object.name,\n      site: ipObj.assigned_object.device.site?.name || 'Unknown',\n      criticality: ipObj.assigned_object.device.custom_fields?.criticality || 'medium'\n    };\n  }\n}\n\nreturn {\n  json: {\n    ...wazuhAlert,\n    asset: asset\n  }\n};"
  },
  "name": "Extract Asset Data",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [850, 300]
}
```

#### **Node 5: Create Odoo Ticket**

```json
{
  "parameters": {
    "resource": "create",
    "operation": "create",
    "model": "project.task",
    "fields": {
      "name": "=[WAZUH-{{$json.ruleId}}] {{$json.ruleDescription}}",
      "description": "=**Alerta Wazuh**\n\n**Rule ID:** {{$json.ruleId}}\n**Level:** {{$json.ruleLevel}}\n**Timestamp:** {{$json.timestamp}}\n\n**Agent:**\n- Name: {{$json.agentName}}\n- IP: {{$json.agentIp}}\n\n**Asset (NetBox):**\n- Device: {{$json.asset.deviceName}}\n- Site: {{$json.asset.site}}\n- Criticality: {{$json.asset.criticality}}\n\n**Full Log:**\n```\n{{$json.fullLog}}\n```",
      "project_id": 1,
      "priority": "={{$json.ruleLevel >= 12 ? '5' : ($json.ruleLevel >= 10 ? '4' : '3')}}",
      "tag_ids": [[6, 0, [1, 2]]]
    }
  },
  "name": "Odoo Create Ticket",
  "type": "n8n-nodes-base.odoo",
  "typeVersion": 1,
  "position": [1050, 300],
  "credentials": {
    "odooApi": {
      "id": "1",
      "name": "Odoo 19"
    }
  }
}
```

#### **Node 6: Notify Slack**

```json
{
  "parameters": {
    "channel": "#security-alerts",
    "text": "=🚨 **Security Alert Created**\n\n*Ticket:* #{{$json.id}}\n*Rule:* {{$node['Parse Alert'].json.ruleId}} - {{$node['Parse Alert'].json.ruleDescription}}\n*Level:* {{$node['Parse Alert'].json.ruleLevel}}\n*Agent:* {{$node['Parse Alert'].json.agentName}} ({{$node['Parse Alert'].json.agentIp}})\n*Asset:* {{$node['Extract Asset Data'].json.asset.deviceName}}\n\n<https://odoo.empresa.com/web#id={{$json.id}}&model=project.task|View Ticket>",
    "otherOptions": {
      "includeLinkToWorkflow": false
    }
  },
  "name": "Slack Notification",
  "type": "n8n-nodes-base.slack",
  "typeVersion": 2,
  "position": [1250, 300],
  "credentials": {
    "slackApi": {
      "id": "2",
      "name": "Slack Bot"
    }
  }
}
```

**JSON Completo do Workflow:**

```json
{
  "name": "Wazuh to Odoo Auto-Ticketing",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "wazuh-alerts",
        "responseMode": "onReceived"
      },
      "name": "Wazuh Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "wazuh-alerts"
    },
    {
      "parameters": {
        "functionCode": "const alert = $input.item.json;\n\nreturn {\n  json: {\n    alertId: alert.id,\n    ruleId: alert.rule.id,\n    ruleDescription: alert.rule.description,\n    ruleLevel: alert.rule.level,\n    agentName: alert.agent.name,\n    agentIp: alert.agent.ip,\n    timestamp: alert.timestamp,\n    fullLog: alert.full_log\n  }\n};"
      },
      "name": "Parse Alert",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "url": "=https://netbox.empresa.com/api/ipam/ip-addresses/?address={{$json.agentIp}}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "headers": {
            "entries": [
              {
                "name": "Authorization",
                "value": "Token YOUR_NETBOX_TOKEN"
              }
            ]
          }
        }
      },
      "name": "NetBox Get Asset",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300]
    },
    {
      "parameters": {
        "functionCode": "const netboxData = $input.item.json;\nconst wazuhAlert = $node['Parse Alert'].json;\n\nlet asset = null;\nif (netboxData.count > 0) {\n  const ipObj = netboxData.results[0];\n  if (ipObj.assigned_object) {\n    asset = {\n      deviceName: ipObj.assigned_object.device.name,\n      deviceId: ipObj.assigned_object.device.id,\n      interface: ipObj.assigned_object.name,\n      site: ipObj.assigned_object.device.site?.name || 'Unknown',\n      criticality: ipObj.assigned_object.device.custom_fields?.criticality || 'medium'\n    };\n  }\n}\n\nreturn {\n  json: {\n    ...wazuhAlert,\n    asset: asset\n  }\n};"
      },
      "name": "Extract Asset Data",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "resource": "create",
        "operation": "create",
        "model": "project.task",
        "fields": {
          "name": "=[WAZUH-{{$json.ruleId}}] {{$json.ruleDescription}}",
          "description": "=**Alerta Wazuh**\n\n**Rule ID:** {{$json.ruleId}}\n**Level:** {{$json.ruleLevel}}\n**Timestamp:** {{$json.timestamp}}\n\n**Agent:**\n- Name: {{$json.agentName}}\n- IP: {{$json.agentIp}}\n\n**Asset (NetBox):**\n- Device: {{$json.asset.deviceName}}\n- Site: {{$json.asset.site}}\n- Criticality: {{$json.asset.criticality}}\n\n**Full Log:**\n```\n{{$json.fullLog}}\n```",
          "project_id": 1,
          "priority": "={{$json.ruleLevel >= 12 ? '5' : ($json.ruleLevel >= 10 ? '4' : '3')}}",
          "tag_ids": [[6, 0, [1, 2]]]
        }
      },
      "name": "Odoo Create Ticket",
      "type": "n8n-nodes-base.odoo",
      "typeVersion": 1,
      "position": [1050, 300],
      "credentials": {
        "odooApi": "Odoo 19"
      }
    },
    {
      "parameters": {
        "channel": "#security-alerts",
        "text": "=🚨 **Security Alert Created**\n\n*Ticket:* #{{$json.id}}\n*Rule:* {{$node['Parse Alert'].json.ruleId}} - {{$node['Parse Alert'].json.ruleDescription}}\n*Level:* {{$node['Parse Alert'].json.ruleLevel}}\n*Agent:* {{$node['Parse Alert'].json.agentName}} ({{$node['Parse Alert'].json.agentIp}})\n*Asset:* {{$node['Extract Asset Data'].json.asset.deviceName}}\n\n<https://odoo.empresa.com/web#id={{$json.id}}&model=project.task|View Ticket>",
        "otherOptions": {
          "includeLinkToWorkflow": false
        }
      },
      "name": "Slack Notification",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2,
      "position": [1250, 300],
      "credentials": {
        "slackApi": "Slack Bot"
      }
    }
  ],
  "connections": {
    "Wazuh Webhook": {
      "main": [
        [
          {
            "node": "Parse Alert",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Parse Alert": {
      "main": [
        [
          {
            "node": "NetBox Get Asset",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "NetBox Get Asset": {
      "main": [
        [
          {
            "node": "Extract Asset Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract Asset Data": {
      "main": [
        [
          {
            "node": "Odoo Create Ticket",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Odoo Create Ticket": {
      "main": [
        [
          {
            "node": "Slack Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "1.0",
  "id": "wazuh-odoo-ticketing"
}
```

**Importar no n8n:**

1. Copiar JSON completo acima
2. n8n UI → **Workflows** → **Import from JSON**
3. Colar JSON → **Import**
4. Configurar credenciais (Odoo, Slack, NetBox token)
5. **Activate** workflow
6. Testar com curl ou alerta real

### **Workflow 2: Vulnerability Report Generator**

**Trigger:** Schedule (diário às 8h)

**Nodes:**

```
[Schedule] → [Wazuh API: Get Vulnerabilities] → [Filter Critical] → [Generate PDF] → [Email Report]
```

**Código Python para geração de PDF:**

```python
# Node: Generate PDF
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from datetime import datetime
import json

def generate_vuln_report(vulnerabilities):
    filename = f"/tmp/vulnerability_report_{datetime.now().strftime('%Y%m%d')}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()

    # Title
    title = Paragraph(f"<b>Vulnerability Report - {datetime.now().strftime('%Y-%m-%d')}</b>", styles['Title'])
    story.append(title)

    # Summary
    summary_data = [
        ['Total Vulnerabilities', len(vulnerabilities)],
        ['Critical', len([v for v in vulnerabilities if v['severity'] == 'Critical'])],
        ['High', len([v for v in vulnerabilities if v['severity'] == 'High'])],
        ['Medium', len([v for v in vulnerabilities if v['severity'] == 'Medium'])],
    ]
    summary_table = Table(summary_data)
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(summary_table)

    # Detailed list
    vuln_data = [['CVE', 'Severity', 'CVSS', 'Affected Assets', 'Status']]
    for vuln in vulnerabilities:
        vuln_data.append([
            vuln['cve'],
            vuln['severity'],
            str(vuln['cvss_score']),
            ', '.join(vuln['affected_agents']),
            vuln['status']
        ])

    vuln_table = Table(vuln_data)
    vuln_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(vuln_table)

    doc.build(story)
    return filename

# Main execution
vulnerabilities = $input.all()[0].json
pdf_file = generate_vuln_report(vulnerabilities)

return {
    'json': {
        'pdf_path': pdf_file,
        'report_date': datetime.now().isoformat()
    }
}
```

---

## 🔍 **Troubleshooting**

### **Problema: Webhook retorna 404**

**Verificar URL:**

```bash
# Testar webhook manualmente
curl -X POST https://n8n.empresa.com/webhook/wazuh-alerts \
  -H "Content-Type: application/json" \
  -d '{
    "rule": {
      "id": "100400",
      "description": "Test alert"
    }
  }'

# Deve retornar: {"message": "Workflow started"}
```

**Checar workflow:**

1. n8n UI → **Workflows**
2. Verificar se workflow está **Active**
3. Verificar path do webhook: deve ser `/webhook/wazuh-alerts`
4. Testar manualmente: **Execute Workflow**

### **Problema: Credenciais Odoo inválidas**

**Testar conexão Odoo:**

```python
import xmlrpc.client

url = "https://odoo.empresa.com"
db = "odoo19"
username = "admin"
password = "admin"

# Test authentication
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})

if uid:
    print(f"Authentication successful! UID: {uid}")
else:
    print("Authentication failed!")

# Test models access
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
projects = models.execute_kw(db, uid, password, 'project.project', 'search_read', [[]], {'fields': ['name'], 'limit': 5})
print(f"Projects: {projects}")
```

**Configurar credencial no n8n:**

1. n8n UI → **Credentials** → **Add Credential**
2. Tipo: **Odoo API**
3. Preencher:
   - URL: `https://odoo.empresa.com`
   - Database: `odoo19`
   - Username: `admin`
   - Password: `admin`
4. **Test Connection**

---

## 📊 **Monitoramento**

### **n8n Execution Logs**

**Ver logs de execução:**

```bash
# Docker logs
docker logs -f n8n

# Logs de workflow específico
docker exec -it n8n cat /home/node/.n8n/logs/workflow-<ID>.log
```

**Métricas Prometheus (se habilitado):**

```promql
# Total execuções
sum(n8n_workflow_executions_total)

# Taxa de falhas
sum(n8n_workflow_executions_total{status="error"}) / sum(n8n_workflow_executions_total) * 100

# Tempo de execução
histogram_quantile(0.95, sum(rate(n8n_workflow_execution_duration_seconds_bucket[5m])) by (le))
```

---

## 🎓 **Próximos Passos**

1. Criar workflows customizados
2. Integrar com CTI feeds (MISP, OTX)
3. Implementar machine learning nodes
4. Explorar n8n community workflows
5. Configurar high availability (clustering)

**Links Úteis:**

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [Workflow Templates](https://n8n.io/workflows)
- [n8n GitHub](https://github.com/n8n-io/n8n)

---

**Status: ✅ Integração Completa | 400+ Nodes | Workflows Prontos | Production-Ready**
