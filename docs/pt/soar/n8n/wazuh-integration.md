# Integração n8n com Wazuh

> **AI Context**: Configuração completa da integração Wazuh → n8n SOAR. Inclui ossec.conf, webhook configuration, parsing e troubleshooting. Stack: Wazuh Manager → n8n webhook → automated response. Keywords: Wazuh n8n integration, webhook, ossec.conf, alert processing, SOAR automation.

## Visão Geral

Esta integração permite que o **Wazuh Manager** envie alertas para o **n8n** via webhook HTTP, disparando workflows de resposta automatizada.

### Fluxo de Integração

```
┌──────────────────┐
│  Wazuh Manager   │
│  1. Detecta      │
│     alerta       │
│  2. Filtra       │
│  3. POST webhook │
└────────┬─────────┘
         │ HTTP POST
         │
         ▼
┌──────────────────┐
│  n8n Webhook     │
│  4. Parseia JSON │
│  5. Executa flow │
└────────┬─────────┘
         │
         ├──► NetBox
         └──► Odoo
```

## Configuração do Wazuh

### 1. Editar ossec.conf

```xml
<ossec_config>
  <!-- N8N SOAR INTEGRATION -->
  <integration>
    <name>custom-webhook</name>
    <hook_url>http://n8n.neoand.local:5678/webhook/wazuh-alerts</hook_url>
    <level>7</level>
    <alert_format>json</alert_format>
    <options>{"data": "alert"}</options>
  </integration>

  <!-- Com autenticação (recomendado) -->
  <integration>
    <name>custom-webhook</name>
    <hook_url>http://n8n.neoand.local:5678/webhook/wazuh-alerts</hook_url>
    <api_key>X-API-Key:wazuh-secret-key-123</api_key>
    <level>10</level>
    <rule_id>554,5712,5710</rule_id>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

### 2. Reiniciar Wazuh

```bash
sudo /var/ossec/bin/wazuh-control configcheck
sudo systemctl restart wazuh-manager
sudo tail -f /var/ossec/logs/integrations.log
```

## Configuração do n8n

### 1. Criar Workflow "Wazuh Alert Handler"

#### Step 1: Adicionar Node Webhook

```
Node: Webhook
HTTP Method: POST
Path: wazuh-alerts
Authentication: Header Auth
  Header Name: X-API-Key
  Header Value: wazuh-secret-key-123
Response Mode: Last Node
Response Code: 200
```

#### Step 2: Adicionar Node Function (Parse Alert)

```javascript
// Node: Function - Parse Wazuh Alert
const body = $input.item.json.body;

// Parse body se vier como string
const alert = typeof body === 'string' ? JSON.parse(body) : body;

// Extrair campos importantes
return [{
  json: {
    rule_id: alert.rule.id,
    rule_level: alert.rule.level,
    description: alert.rule.description,
    agent_id: alert.agent.id,
    agent_name: alert.agent.name,
    agent_ip: alert.agent.ip,
    timestamp: alert.timestamp,
    full_log: alert.full_log || 'N/A',
    groups: alert.rule.groups ? alert.rule.groups.join(',') : 'unknown',
    location: alert.location || 'unknown',
    // Campos adicionais conforme necessário
    data: alert.data || {}
  }
}];
```

#### Step 3: Adicionar Node IF (Check Severity)

```
Node: IF
Condition:
  {{ $json["rule_level"] }} >= 10

True Branch: High Priority Actions
False Branch: Low Priority Actions
```

### 2. Workflow Completo (Export JSON)

```json
{
  "name": "Wazuh Alert Handler",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "wazuh-alerts",
        "authentication": "headerAuth",
        "responseMode": "lastNode",
        "responseCode": 200,
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "wazuh-alerts",
      "credentials": {
        "httpHeaderAuth": {
          "id": "1",
          "name": "Wazuh API Key"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "const body = $input.item.json.body;\nconst alert = typeof body === 'string' ? JSON.parse(body) : body;\n\nreturn [{\n  json: {\n    rule_id: alert.rule.id,\n    rule_level: alert.rule.level,\n    description: alert.rule.description,\n    agent_name: alert.agent.name,\n    agent_ip: alert.agent.ip,\n    timestamp: alert.timestamp,\n    full_log: alert.full_log || 'N/A'\n  }\n}];"
      },
      "name": "Parse Alert",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json[\"rule_level\"] }}",
              "operation": "largerEqual",
              "value2": 10
            }
          ]
        }
      },
      "name": "Check Severity",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "https://netbox.neoand.local/api/dcim/devices/",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth",
        "options": {
          "qs": {
            "name": "={{ $json[\"agent_name\"] }}"
          }
        }
      },
      "name": "Get NetBox Info",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [850, 200],
      "credentials": {
        "httpHeaderAuth": {
          "id": "2",
          "name": "NetBox API"
        }
      }
    },
    {
      "parameters": {
        "url": "https://odoo.neoand.local/api/helpdesk.ticket",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth",
        "method": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"name\": \"[CRÍTICO] {{ $node[\"Parse Alert\"].json[\"description\"] }}\",\n  \"description\": \"**Wazuh Alert**\\n\\n**Rule ID**: {{ $node[\"Parse Alert\"].json[\"rule_id\"] }}\\n**Severity**: {{ $node[\"Parse Alert\"].json[\"rule_level\"] }}/15\\n**Agent**: {{ $node[\"Parse Alert\"].json[\"agent_name\"] }} ({{ $node[\"Parse Alert\"].json[\"agent_ip\"] }})\\n\\n**Log**:\\n```\\n{{ $node[\"Parse Alert\"].json[\"full_log\"] }}\\n```\\n\\n**NetBox**:\\n{{ $json }}\",\n  \"priority\": \"3\",\n  \"team_id\": 1\n}"
      },
      "name": "Create Odoo Ticket",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1050, 300],
      "credentials": {
        "httpHeaderAuth": {
          "id": "3",
          "name": "Odoo API"
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
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
            "node": "Check Severity",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Severity": {
      "main": [
        [
          {
            "node": "Get NetBox Info",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get NetBox Info": {
      "main": [
        [
          {
            "node": "Create Odoo Ticket",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "versionId": "1"
}
```

### 3. Importar no n8n

1. **Workflows** → **Import from File/URL**
2. Cole o JSON acima
3. **Import**
4. Ativar workflow (toggle switch)

## Teste de Integração

### Teste 1: Curl Manual

```bash
curl -X POST http://localhost:5678/webhook/wazuh-alerts \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wazuh-secret-key-123" \
  -d '{
  "timestamp": "2025-12-05T16:00:00-0300",
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
  "full_log": "Malware /var/www/malware.php detected",
  "location": "rootcheck"
}'

# Verificar execução na UI n8n
# Executions → Ver última execução
```

### Teste 2: Wazuh Real

```bash
# Gerar alerta teste no agente
sudo /var/ossec/bin/agent_control -r -a 001

# Verificar logs
sudo tail -f /var/ossec/logs/integrations.log
# Procurar por: "successfully sent" ou "ERROR"

# Verificar n8n
docker logs n8n | grep webhook
```

## Troubleshooting

### Problema: 401 Unauthorized

**Solução**:
```javascript
// Verificar header no n8n
console.log($input.item.json.headers);

// Configurar credencial corretamente
// Credentials → HTTP Header Auth
// Name: X-API-Key
// Value: wazuh-secret-key-123
```

### Problema: Body vazio no n8n

**Solução**:
```javascript
// Node Function - Debug
console.log('Full input:', JSON.stringify($input.item));
console.log('Body:', $input.item.json.body);
console.log('Query:', $input.item.json.query);

// Ajustar parsing
const alert = $input.item.json.body || $input.item.json;
```

### Problema: Wazuh timeout

**Solução**:
```xml
<!-- ossec.conf -->
<integration>
  <name>custom-webhook</name>
  <hook_url>http://n8n:5678/webhook/wazuh-alerts</hook_url>
  <timeout>15</timeout>  <!-- Aumentar de 5s para 15s -->
</integration>
```

## Próximos Passos

1. **[Criar Workflows Avançados](workflows.md)**
2. **[Playbooks](../playbooks/index.md)**

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
