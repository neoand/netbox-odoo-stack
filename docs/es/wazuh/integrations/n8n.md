# 🔗 Integración Wazuh + n8n Workflow Automation

> **Contexto AI**: Guía completa de integración entre Wazuh 4.12+ y n8n (plataforma de automatización de workflows). n8n es una alternativa a Zapier/Make, totalmente open source, con 400+ integraciones nativas. Este documento muestra cómo automatizar incident response, ticketing, y enriquecimiento de alertas usando n8n.

---

## 🎯 **Visión General**

### **¿Qué es n8n?**

**n8n** (nodemation) es una plataforma de automatización de workflows open source con:

- 400+ integraciones nativas (Odoo, NetBox, Slack, etc.)
- Editor visual drag-and-drop
- Ejecución local (self-hosted) o cloud
- JavaScript personalizado en cada nodo
- Webhooks ilimitados
- Totalmente gratuito (licencia Fair-Code)

### **Wazuh + n8n: Casos de Uso**

```
AUTOMATIZACIONES:
├─ Auto-ticketing en Odoo/Jira/ServiceNow
├─ Enriquecimiento de alertas con NetBox
├─ Notificaciones multi-canal (Slack/Teams/Email)
├─ Actualización de estado de activos
├─ Generación de informes programados
├─ Integración con CTI feeds (MISP, OTX)
└─ Orquestación de respuesta a incidentes
```

---

## 🏗️ **Arquitectura**

```
┌─────────────────────────────────────────────────────────────────┐
│                     WAZUH + N8N INTEGRATION                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐                    ┌──────────────┐          │
│  │   Wazuh      │   Webhook          │     n8n      │          │
│  │   Manager    ├───────────────────►│   Webhook    │          │
│  │   (4.12+)    │   JSON Alert       │   Trigger    │          │
│  └──────────────┘                    └──────┬───────┘          │
│                                             ▼                   │
│                                    ┌────────────────┐          │
│                                    │   Workflow     │          │
│                                    │   Nodes        │          │
│                                    └───────┬────────┘          │
│            ┌───────────────────────────────┼───────────┐       │
│            ▼                               ▼           ▼       │
│     ┌────────────┐                 ┌────────────┐  ┌─────────┐│
│     │  NetBox    │                 │   Odoo 19  │  │  Slack  ││
│     │  Node      │                 │   Node     │  │  Node   ││
│     │ Enrich     │                 │  Create    │  │ Notify  ││
│     │ Asset Data │                 │  Ticket    │  │  Team   ││
│     └────────────┘                 └────────────┘  └─────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Instalación**

### **1. Instalar n8n (Docker)**

```bash
# Crear directorio
mkdir -p ~/n8n-docker
cd ~/n8n-docker

# Crear docker-compose.yml
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
      - GENERIC_TIMEZONE=America/Mexico_City
      - TZ=America/Mexico_City

      # Execution
      - EXECUTIONS_TIMEOUT=3600
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all

    volumes:
      - ./n8n-data:/home/node/.n8n
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
EOF

# Levantar servicios
docker-compose up -d

# Acceder UI: http://localhost:5678
```

### **2. Configurar Wazuh para n8n**

**Editar ossec.conf:**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <!-- Webhook para todas las alertas relevantes -->
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

  <!-- Webhook específico para alertas críticas -->
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

**Recargar configuración:**

```bash
# Hot reload (Wazuh 4.12+)
/var/ossec/bin/wazuh-control reload

# Verificar logs
tail -f /var/ossec/logs/integrations.log
```

---

## 📋 **Workflows Listos**

### **Workflow 1: Auto-Ticketing Odoo**

**Descripción:** Recibe alerta Wazuh, enriquece con NetBox, crea ticket Odoo.

**Nodos:**

```
[Webhook] → [Parse JSON] → [NetBox HTTP Request] → [Odoo Create Ticket] → [Slack Notification]
```

**Configuración Paso a Paso:**

#### **Nodo 1: Webhook Trigger**

1. n8n UI → **Workflows** → **Add Workflow**
2. Agregar nodo: **Webhook**
3. Configurar:
   - HTTP Method: `POST`
   - Path: `wazuh-alerts`
   - Response Mode: `On Received`

#### **Nodo 2: Parse Wazuh Alert**

1. Agregar nodo: **Function**
2. JavaScript Code:

```javascript
const alert = $input.item.json;

return {
  json: {
    alertId: alert.id,
    ruleId: alert.rule.id,
    ruleDescription: alert.rule.description,
    ruleLevel: alert.rule.level,
    agentName: alert.agent.name,
    agentIp: alert.agent.ip,
    timestamp: alert.timestamp,
    fullLog: alert.full_log
  }
};
```

#### **Nodo 3: Enrich with NetBox**

1. Agregar nodo: **HTTP Request**
2. Configurar:
   - Method: `GET`
   - URL: `https://netbox.empresa.com/api/ipam/ip-addresses/?address={{$json.agentIp}}`
   - Headers:
     - `Authorization`: `Token YOUR_NETBOX_TOKEN`

#### **Nodo 4: Extract Asset Info**

1. Agregar nodo: **Function**
2. JavaScript Code:

```javascript
const netboxData = $input.item.json;
const wazuhAlert = $node['Parse Alert'].json;

let asset = null;
if (netboxData.count > 0) {
  const ipObj = netboxData.results[0];
  if (ipObj.assigned_object) {
    asset = {
      deviceName: ipObj.assigned_object.device.name,
      deviceId: ipObj.assigned_object.device.id,
      site: ipObj.assigned_object.device.site?.name || 'Unknown',
      criticality: ipObj.assigned_object.device.custom_fields?.criticality || 'medium'
    };
  }
}

return {
  json: {
    ...wazuhAlert,
    asset: asset
  }
};
```

#### **Nodo 5: Create Odoo Ticket**

1. Agregar nodo: **Odoo**
2. Configurar credenciales Odoo:
   - URL: `https://odoo.empresa.com`
   - Database: `odoo19`
   - Username: `admin`
   - Password: `admin`
3. Configurar operación:
   - Resource: `create`
   - Model: `project.task`
   - Fields:
     - `name`: `[WAZUH-{{$json.ruleId}}] {{$json.ruleDescription}}`
     - `description`: (ver template completo en docs PT)
     - `project_id`: `1`
     - `priority`: (calculado por nivel)

#### **Nodo 6: Notify Slack**

1. Agregar nodo: **Slack**
2. Configurar:
   - Channel: `#security-alerts`
   - Message:

```
🚨 **Alerta de Seguridad Creada**

*Ticket:* #{{$json.id}}
*Regla:* {{$node['Parse Alert'].json.ruleId}}
*Nivel:* {{$node['Parse Alert'].json.ruleLevel}}
*Agente:* {{$node['Parse Alert'].json.agentName}}
*Asset:* {{$node['Extract Asset Data'].json.asset.deviceName}}
```

**Importar en n8n:**

1. n8n UI → **Workflows** → **Import from JSON**
2. Pegar JSON completo (disponible en repositorio)
3. Configurar credenciales
4. **Activate** workflow
5. Probar con curl o alerta real

### **Workflow 2: Vulnerability Report Generator**

**Trigger:** Schedule (diario a las 8h)

**Nodos:**

```
[Schedule] → [Wazuh API: Get Vulnerabilities] → [Filter Critical] → [Generate PDF] → [Email Report]
```

**Configuración:**

1. **Schedule Trigger**: Cron `0 8 * * *`
2. **Wazuh API**: Endpoint `/vulnerabilities/`
3. **Filter**: Solo `severity: Critical|High`
4. **Generate PDF**: Usar ReportLab (Python)
5. **Email**: Enviar a SOC team

---

## 🔍 **Troubleshooting**

### **Problema: Webhook retorna 404**

**Verificar URL:**

```bash
# Probar webhook manualmente
curl -X POST https://n8n.empresa.com/webhook/wazuh-alerts \
  -H "Content-Type: application/json" \
  -d '{"rule": {"id": "100400", "description": "Test alert"}}'

# Debe retornar: {"message": "Workflow started"}
```

**Verificar workflow:**

1. n8n UI → **Workflows**
2. Verificar si workflow está **Active**
3. Verificar path del webhook: `/webhook/wazuh-alerts`
4. Probar manualmente: **Execute Workflow**

### **Problema: Credenciales Odoo inválidas**

**Probar conexión Odoo:**

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
```

**Configurar credencial en n8n:**

1. n8n UI → **Credentials** → **Add Credential**
2. Tipo: **Odoo API**
3. Llenar datos
4. **Test Connection**

---

## 📊 **Monitoreo**

### **n8n Execution Logs**

```bash
# Docker logs
docker logs -f n8n

# Métricas Prometheus (si habilitado)
# Total ejecuciones
sum(n8n_workflow_executions_total)

# Tasa de fallas
sum(n8n_workflow_executions_total{status="error"}) / sum(n8n_workflow_executions_total) * 100
```

---

## 🎓 **Próximos Pasos**

1. Crear workflows personalizados
2. Integrar con CTI feeds (MISP, OTX)
3. Implementar machine learning nodes
4. Explorar n8n community workflows
5. Configurar high availability (clustering)

**Enlaces Útiles:**

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [Workflow Templates](https://n8n.io/workflows)
- [n8n GitHub](https://github.com/n8n-io/n8n)

---

**Estado: ✅ Integración Completa | 400+ Nodos | Workflows Listos | Production-Ready**
