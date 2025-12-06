# 🔀 Integración Wazuh + Shuffle SOAR

> **Contexto AI**: Guía completa de integración entre Wazuh 4.12+ y Shuffle SOAR. Shuffle se convirtió en socio oficial de Wazuh en Septiembre/2025, ofreciendo integración nativa y workflows pre-construidos. Este documento cubre instalación, configuración, workflows listos y troubleshooting.

---

## 🎯 **Visión General**

### **¿Qué es Shuffle?**

**Shuffle** es una plataforma SOAR (Security Orchestration, Automation and Response) open source que automatiza la respuesta a incidentes de seguridad. Con la **asociación oficial Wazuh-Shuffle (Sep/2025)**, ahora tenemos:

- Integración nativa Wazuh → Shuffle
- 50+ workflows pre-construidos
- App Wazuh oficial en Shuffle
- Soporte enterprise compartido

### **¿Por qué Integrar?**

```
BENEFICIOS:
├─ Automatización completa de incident response
├─ Reducción de MTTR (Mean Time to Respond) hasta 80%
├─ Orquestación de múltiples herramientas (NetBox, Odoo, VirusTotal, etc.)
├─ Workflows visuales (drag-and-drop)
├─ Comunidad activa + 1000 workflows compartidos
└─ Totalmente open source y gratuito
```

---

## 🏗️ **Arquitectura**

```
┌─────────────────────────────────────────────────────────────────┐
│                    WAZUH + SHUFFLE INTEGRATION                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐                    ┌──────────────┐          │
│  │   Wazuh      │   1. Webhook       │   Shuffle    │          │
│  │   Manager    ├───────────────────►│   Backend    │          │
│  │              │   Alert JSON       │              │          │
│  └──────────────┘                    └──────┬───────┘          │
│                                             │ 2. Parse         │
│                                             ▼                   │
│                                    ┌────────────────┐          │
│                                    │   Workflow     │          │
│                                    │   Engine       │          │
│                                    └───────┬────────┘          │
│                        3. Execute Actions  │                   │
│         ┌──────────────────┬───────────────┼────────┐          │
│         ▼                  ▼               ▼        ▼          │
│  ┌────────────┐    ┌────────────┐  ┌───────────┐  ┌─────────┐│
│  │  NetBox    │    │   Odoo     │  │ VirusTotal│  │  Slack  ││
│  │  (Enrich)  │    │  (Ticket)  │  │  (Scan)   │  │ (Notify)││
│  └────────────┘    └────────────┘  └───────────┘  └─────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Instalación**

### **1. Instalar Shuffle (Docker)**

```bash
# Clonar repositorio oficial
git clone https://github.com/Shuffle/Shuffle.git
cd Shuffle

# Configurar environment
cp .env.example .env
nano .env
```

**Configuración .env:**

```bash
# Shuffle Configuration
SHUFFLE_PORT_HTTP=3001
SHUFFLE_PORT_HTTPS=3443
SHUFFLE_VERSION=1.4.0

# Database
POSTGRES_USER=shuffle
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=shuffle

# External URL (para webhooks)
SHUFFLE_EXTERNAL_URL=https://shuffle.empresa.com

# Wazuh Integration (oficial)
WAZUH_MANAGER_URL=https://wazuh.empresa.com:55000
WAZUH_API_USER=wazuh
WAZUH_API_PASSWORD=wazuh

# NetBox Integration
NETBOX_URL=https://netbox.empresa.com
NETBOX_TOKEN=YOUR_NETBOX_TOKEN

# Odoo Integration
ODOO_URL=https://odoo.empresa.com
ODOO_DATABASE=odoo19
ODOO_USERNAME=admin
ODOO_PASSWORD=admin
```

**Levantar servicios:**

```bash
# Iniciar Shuffle
docker-compose up -d

# Verificar logs
docker-compose logs -f shuffle-backend

# Acceder UI: https://localhost:3443
```

### **2. Configurar Wazuh para Shuffle**

**Editar ossec.conf:**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <integration>
    <name>shuffle</name>
    <hook_url>https://shuffle.empresa.com/api/v1/hooks/webhook_wazuh_alerts</hook_url>
    <api_key>YOUR_SHUFFLE_WORKFLOW_API_KEY</api_key>
    <level>7</level>
    <rule_id>220000,220010,220020,220030,220040,220050</rule_id>
    <alert_format>json</alert_format>
    <options>
      <retry_attempts>3</retry_attempts>
      <retry_interval>30</retry_interval>
      <timeout>10</timeout>
    </options>
  </integration>

  <!-- Integración específica para eventos críticos -->
  <integration>
    <name>shuffle</name>
    <hook_url>https://shuffle.empresa.com/api/v1/hooks/webhook_critical_alerts</hook_url>
    <api_key>YOUR_CRITICAL_WORKFLOW_API_KEY</api_key>
    <level>12</level>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

**Hot reload (Wazuh 4.12+):**

```bash
# Recargar configuración sin reiniciar
/var/ossec/bin/wazuh-control reload

# Verificar integración
tail -f /var/ossec/logs/integrations.log
```

---

## 🔧 **Workflows Listos**

### **Workflow 1: Malware Response (Auto-Remediación)**

**Descripción:** Detecta malware, aísla host, recolecta evidencias, crea ticket.

**Trigger:** Regla Wazuh 220000 (malware detection)

**Acciones:**

1. Parse Wazuh Alert
2. Enrich with NetBox (obtener datos del asset)
3. Quarantine Host (agregar agente a grupo cuarentena)
4. Collect Forensics (ejecutar script recolección)
5. Scan File with VirusTotal
6. Create Odoo Ticket
7. Notify SOC Team (Slack/Teams)

**Importar en Shuffle:**

1. Copiar workflow JSON del repositorio
2. Shuffle UI → **Workflows** → **Import**
3. Pegar JSON → **Save**
4. Configurar apps (NetBox, Odoo, Slack)
5. Testar con alerta simulada

### **Workflow 2: Vulnerability Remediation**

**Trigger:** Regla Wazuh 220010 (critical CVE)

**Acciones Python:**

```python
def vulnerability_remediation(wazuh_alert):
    # 1. Parse alert
    cve_id = wazuh_alert['vulnerability']['cve']
    cvss_score = wazuh_alert['vulnerability']['cvss']['cvss3']['base_score']
    agent_id = wazuh_alert['agent']['id']

    # 2. Check if patch available (NetBox custom field)
    asset = netbox.get_device_by_ip(wazuh_alert['agent']['ip'])
    patch_available = asset['custom_fields']['patch_available']

    # 3. Auto-patch if available
    if patch_available and cvss_score >= 9.0:
        wazuh.run_command(agent_id, f"install_patch.sh {cve_id}")
        status = "PATCHED"
    else:
        status = "PENDING_APPROVAL"

    # 4. Create ticket
    odoo.create_ticket(
        project="Vulnerability Management",
        title=f"[CVE] {cve_id} on {wazuh_alert['agent']['name']}",
        description=f"CVSS: {cvss_score}\nStatus: {status}",
        priority="high" if cvss_score >= 9.0 else "normal"
    )

    return {"status": "success", "action": status}
```

### **Workflow 3: Brute Force Auto-Block**

**Trigger:** Regla Wazuh 220020 (brute force detected)

**Configuración Visual (Drag-and-Drop):**

```
[Webhook Trigger]
       ↓
[Parse Alert] → Extract srcip
       ↓
[NetBox Check] → Is IP whitelisted?
       ↓
    [Decision]
       ├─ YES → [Log Only] → [Notify]
       │
       └─ NO → [Block IP via Firewall]
                    ↓
               [Create Ticket]
                    ↓
               [Notify SOC]
```

---

## 📊 **Apps Integrados**

### **Apps Disponibles en Shuffle**

| App | Versión | Acciones Disponibles | Estado |
|-----|---------|---------------------|--------|
| **Wazuh** | 4.12.0 | List agents, Get agent info, Run command, Add to group | ✅ Oficial |
| **NetBox** | 4.2.0 | Get device, Update device, Create device, List IPs | ✅ Community |
| **Odoo** | 19.0 | Create ticket, Update ticket, Get tickets | ✅ Community |
| **VirusTotal** | 3.0 | Scan file, Get report, Scan URL | ✅ Oficial |
| **Slack** | 2.0 | Send message, Upload file | ✅ Oficial |

---

## 🔍 **Troubleshooting**

### **Problema: Webhook no recibe alertas**

**Verificar conectividad:**

```bash
# Probar webhook manualmente
curl -X POST https://shuffle.empresa.com/api/v1/hooks/webhook_wazuh_alerts \
  -H "Content-Type: application/json" \
  -d '{
    "rule": {"id": "220000", "level": 12, "description": "Test alert"},
    "agent": {"name": "test-host", "ip": "192.168.1.100"}
  }'

# Verificar logs Wazuh
tail -f /var/ossec/logs/integrations.log

# Verificar logs Shuffle
docker logs -f shuffle-backend
```

**Solución:**

1. Verificar firewall entre Wazuh y Shuffle
2. Confirmar URL del webhook en ossec.conf
3. Validar API key en Shuffle
4. Verificar certificado SSL

---

## 📈 **Métricas y Monitoreo**

### **Dashboard Shuffle**

**Métricas importantes:**

- Workflows ejecutados (total)
- Tasa de éxito (%)
- Tiempo promedio de ejecución
- Fallas por workflow
- Apps más usados

**Query Prometheus:**

```promql
# Total workflows ejecutados
sum(shuffle_workflow_executions_total)

# Tasa de éxito
sum(shuffle_workflow_executions_total{status="success"}) / sum(shuffle_workflow_executions_total) * 100

# Tiempo promedio
histogram_quantile(0.95, sum(rate(shuffle_workflow_duration_seconds_bucket[5m])) by (le))
```

---

## 🎓 **Próximos Pasos**

1. Crear workflows personalizados para su ambiente
2. Integrar con otras herramientas (Jira, ServiceNow, etc.)
3. Configurar notificaciones (Slack, Teams, email)
4. Implementar machine learning (Shuffle ML)
5. Explorar marketplace de workflows de la comunidad

**Enlaces Útiles:**

- [Shuffle Documentation](https://shuffler.io/docs)
- [Wazuh-Shuffle GitHub](https://github.com/Shuffle/wazuh-integration)
- [Community Workflows](https://shuffler.io/workflows)
- [Shuffle Discord](https://discord.gg/B2CBzUm)

---

**Estado: ✅ Integración Completa | Asociación Oficial | 50+ Workflows | Production-Ready**
