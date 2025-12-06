# Workflows n8n - Ejemplos Prácticos

> **AI Context**: Catálogo de workflows n8n listos para automatización de respuesta a incidentes. Incluye JSON completo y casos de uso prácticos. Stack: Wazuh → n8n → Odoo/NetBox. Keywords: n8n workflows, automation, incident response, Wazuh alerts, visual workflows.

## Workflow 1: Alerta → Enriquecimiento → Ticket

### Nodes Utilizados
- **Webhook**: Recibir alerta Wazuh
- **Function**: Parsear JSON
- **HTTP Request**: NetBox API
- **IF**: Verificar severidad
- **HTTP Request**: Odoo API
- **Slack**: Notificación

### Configuración Visual

```
[Webhook] → [Parse Alert] → [Get NetBox] → [IF Severidad ≥10?]
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

Ver archivo completo en [wazuh-integration.md](wazuh-integration.md#2-workflow-completo-export-json)

## Workflow 2: Verificación de Reputación de IP

### Nodes
```javascript
// Function: Extraer IP del log
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
[Webhook] → [Extract IP] → [VirusTotal API] → [IF Malicioso?]
                                                      │
                                          ┌───────────┴───────────┐
                                          ▼                       ▼
                                   [Block IP]              [Whitelist]
                                          │
                                          ▼
                                   [Log Action]
```

## Workflow 3: Reporte de Compliance Programado

### Configuración

```
Node: Schedule Trigger
Cron Expression: 0 6 * * *  # Diario a las 6h
Timezone: America/Sao_Paulo
```

```javascript
// Function: Query Últimas 24h
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

## Mejores Prácticas

### Manejo de Errores

```javascript
// Node: Function con try/catch
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
// Agregar logs en Function nodes
console.log('Processing alert:', $input.item.json.rule_id);
console.log('NetBox response:', $input.item.json);
```

## Recursos Adicionales

- [n8n Template Library](https://n8n.io/workflows/)
- [Security Automation Templates](https://n8n.io/workflows/?categories=Security)

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
