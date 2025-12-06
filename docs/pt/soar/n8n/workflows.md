# Workflows n8n - Exemplos Práticos

> **AI Context**: Catálogo de workflows n8n prontos para automação de resposta a incidentes. Inclui JSON completo e casos de uso práticos. Stack: Wazuh → n8n → Odoo/NetBox. Keywords: n8n workflows, automation, incident response, Wazuh alerts, visual workflows.

## Workflow 1: Alert → Enrichment → Ticket

### Nodes Utilizados
- **Webhook**: Receber alerta Wazuh
- **Function**: Parsear JSON
- **HTTP Request**: NetBox API
- **IF**: Verificar severidade
- **HTTP Request**: Odoo API
- **Slack**: Notificação

### Configuração Visual

```
[Webhook] → [Parse Alert] → [Get NetBox] → [IF Severity ≥10?]
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                            [Create Critical]      [Create Warning]
                                    │                       │
                                    └───────────┬───────────┘
                                                ▼
                                          [Send Slack]
```

### JSON Export

Ver arquivo completo em [wazuh-integration.md](wazuh-integration.md#2-workflow-completo-export-json)

## Workflow 2: IP Reputation Check

### Nodes
```javascript
// Function: Extract IP from log
const alert = $input.item.json;
const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
const ips = alert.full_log.match(ipRegex);

return [{
  json: {
    source_ip: ips ? ips[0] : null,
    alert_data: alert
  }
}];
```

```
[Webhook] → [Extract IP] → [VirusTotal API] → [IF Malicious?]
                                                      │
                                          ┌───────────┴───────────┐
                                          ▼                       ▼
                                   [Block IP]              [Whitelist]
                                          │
                                          ▼
                                   [Log Action]
```

## Workflow 3: Schedule Compliance Report

### Configuração

```
Node: Schedule Trigger
Cron Expression: 0 6 * * *  # Diário às 6h
Timezone: America/Sao_Paulo
```

```javascript
// Function: Query Last 24h
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

return [{
  json: {
    start_date: yesterday.toISOString(),
    end_date: new Date().toISOString()
  }
}];
```

```
[Schedule] → [Query Wazuh API] → [Aggregate Data] → [Generate PDF] → [Email]
```

## Melhores Práticas

### Error Handling

```javascript
// Node: Function com try/catch
try {
  const result = performOperation();
  return [{ json: { success: true, data: result } }];
} catch (error) {
  return [{
    json: {
      success: false,
      error: error.message
    }
  }];
}
```

### Logging

```javascript
// Adicionar logs em Function nodes
console.log('Processing alert:', $input.item.json.rule_id);
console.log('NetBox response:', $input.item.json);
```

## Recursos Adicionais

- [n8n Template Library](https://n8n.io/workflows/)
- [Security Automation Templates](https://n8n.io/workflows/?categories=Security)

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
