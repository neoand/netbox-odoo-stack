# 🔀 Integração Wazuh + Shuffle SOAR

> **AI Context**: Guia completo de integração entre Wazuh 4.12+ e Shuffle SOAR. Shuffle tornou-se parceiro oficial da Wazuh em Setembro/2025, oferecendo integração nativa e workflows pré-construídos. Este documento cobre instalação, configuração, workflows prontos e troubleshooting.

---

## 🎯 **Visão Geral**

### **O que é Shuffle?**

**Shuffle** é uma plataforma SOAR (Security Orchestration, Automation and Response) open source que automatiza resposta a incidentes de segurança. Com a **parceria oficial Wazuh-Shuffle (Set/2025)**, agora temos:

- Integração nativa Wazuh → Shuffle
- 50+ workflows pré-construídos
- App Wazuh oficial no Shuffle
- Suporte enterprise compartilhado

### **Por que Integrar?**

```
BENEFÍCIOS:
├─ Automação completa de incident response
├─ Redução de MTTR (Mean Time to Respond) em até 80%
├─ Orquestração de múltiplas ferramentas (NetBox, Odoo, VirusTotal, etc.)
├─ Workflows visuais (drag-and-drop)
├─ Comunidade ativa + 1000 workflows compartilhados
└─ Totalmente open source e gratuito
```

---

## 🏗️ **Arquitetura**

### **Fluxo de Dados**

```
┌─────────────────────────────────────────────────────────────────┐
│                    WAZUH + SHUFFLE INTEGRATION                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                    ┌──────────────┐          │
│  │   Wazuh      │   1. Webhook       │   Shuffle    │          │
│  │   Manager    ├───────────────────►│   Backend    │          │
│  │              │   Alert JSON       │              │          │
│  └──────────────┘                    └──────┬───────┘          │
│                                             │                   │
│                                             │ 2. Parse         │
│                                             │    Trigger       │
│                                             ▼                   │
│                                    ┌────────────────┐          │
│                                    │   Workflow     │          │
│                                    │   Engine       │          │
│                                    └───────┬────────┘          │
│                                            │                   │
│                        3. Execute Actions  │                   │
│         ┌──────────────────┬───────────────┼────────┐          │
│         │                  │               │        │          │
│         ▼                  ▼               ▼        ▼          │
│  ┌────────────┐    ┌────────────┐  ┌───────────┐  ┌─────────┐│
│  │  NetBox    │    │   Odoo     │  │ VirusTotal│  │  Slack  ││
│  │  (Enrich)  │    │  (Ticket)  │  │  (Scan)   │  │ (Notify)││
│  └────────────┘    └────────────┘  └───────────┘  └─────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Instalação**

### **1. Instalar Shuffle (Docker)**

```bash
# Clonar repositório oficial
git clone https://github.com/Shuffle/Shuffle.git
cd Shuffle

# Configurar environment
cp .env.example .env

# Editar .env
nano .env
```

**Configuração .env:**

```bash
# Shuffle Configuration
SHUFFLE_PORT_HTTP=3001
SHUFFLE_PORT_HTTPS=3443
SHUFFLE_VERSION=1.4.0

# Database
SHUFFLE_DB=shuffle
POSTGRES_USER=shuffle
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=shuffle

# External URL (para webhooks)
SHUFFLE_EXTERNAL_URL=https://shuffle.empresa.com

# Authentication
SHUFFLE_DEFAULT_ADMIN_USER=admin@empresa.com
SHUFFLE_DEFAULT_ADMIN_PASSWORD=CHANGE_ME_ADMIN_PASSWORD

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

**Subir serviços:**

```bash
# Iniciar Shuffle
docker-compose up -d

# Verificar logs
docker-compose logs -f shuffle-backend

# Acessar UI
# URL: https://localhost:3443
# User: admin@empresa.com
# Password: (definido no .env)
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

  <!-- Integração específica para eventos críticos -->
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
# Recarregar configuração sem reiniciar
/var/ossec/bin/wazuh-control reload

# Verificar integração
tail -f /var/ossec/logs/integrations.log
```

### **3. Instalar App Wazuh no Shuffle**

**Via UI:**

1. Acessar Shuffle UI → **Apps**
2. Buscar "Wazuh" no marketplace
3. Clicar **Install** no app oficial
4. Configurar credenciais:
   - Wazuh Manager URL: `https://wazuh.empresa.com:55000`
   - Username: `wazuh`
   - Password: `wazuh`
5. Testar conexão

**Via CLI (alternativo):**

```bash
# Instalar app Wazuh via CLI
docker exec -it shuffle-backend python3 /shuffle/install_app.py \
  --name="Wazuh" \
  --version="4.12.0" \
  --author="Shuffle" \
  --url="https://wazuh.empresa.com:55000"
```

---

## 🔧 **Workflows Prontos**

### **Workflow 1: Malware Response (Auto-Remediation)**

**Descrição:** Detecta malware, isola host, coleta evidências, cria ticket.

**Trigger:** Regra Wazuh 220000 (malware detection)

**Workflow JSON:**

```json
{
  "name": "Wazuh Malware Auto-Response",
  "id": "workflow_malware_response",
  "version": "1.0",
  "trigger": {
    "type": "webhook",
    "name": "wazuh_malware_alert",
    "parameters": {
      "url": "/api/v1/hooks/webhook_wazuh_alerts"
    }
  },
  "actions": [
    {
      "id": "1",
      "name": "Parse Wazuh Alert",
      "app": "Shuffle Tools",
      "action": "parse_json",
      "parameters": {
        "input": "$webhook.body"
      }
    },
    {
      "id": "2",
      "name": "Enrich with NetBox",
      "app": "NetBox",
      "action": "get_device_by_ip",
      "parameters": {
        "ip_address": "$1.agent.ip"
      }
    },
    {
      "id": "3",
      "name": "Quarantine Host",
      "app": "Wazuh",
      "action": "add_agent_to_group",
      "parameters": {
        "agent_id": "$1.agent.id",
        "group_name": "quarantine"
      }
    },
    {
      "id": "4",
      "name": "Collect Forensics",
      "app": "Wazuh",
      "action": "run_command",
      "parameters": {
        "agent_id": "$1.agent.id",
        "command": "collect_forensics.sh"
      }
    },
    {
      "id": "5",
      "name": "Scan File with VirusTotal",
      "app": "VirusTotal",
      "action": "scan_file",
      "parameters": {
        "file_hash": "$1.data.file_hash"
      }
    },
    {
      "id": "6",
      "name": "Create Odoo Ticket",
      "app": "Odoo",
      "action": "create_ticket",
      "parameters": {
        "project": "Security Operations",
        "title": "[MALWARE] $1.rule.description on $1.agent.name",
        "description": "Auto-generated from Shuffle\n\nAgent: $1.agent.name\nIP: $1.agent.ip\nFile: $1.data.file_path\nHash: $1.data.file_hash\nVT Result: $5.result",
        "priority": "urgent",
        "tags": ["malware", "auto-response"]
      }
    },
    {
      "id": "7",
      "name": "Notify SOC Team",
      "app": "Slack",
      "action": "send_message",
      "parameters": {
        "channel": "#security-alerts",
        "message": "🚨 MALWARE DETECTED\n\nHost: $1.agent.name\nFile: $1.data.file_path\nAction: QUARANTINED\nTicket: $6.ticket_id"
      }
    }
  ]
}
```

**Importar no Shuffle:**

1. Copiar JSON acima
2. Shuffle UI → **Workflows** → **Import**
3. Colar JSON → **Save**
4. Configurar apps (NetBox, Odoo, Slack)
5. Testar com alert simulado

### **Workflow 2: Vulnerability Remediation**

**Trigger:** Regra Wazuh 220010 (critical CVE)

**Ações:**

```python
# Workflow simplificado (Python)
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

    # 5. Update NetBox
    netbox.update_device(
        device_id=asset['id'],
        custom_fields={
            'last_vuln_scan': datetime.now(),
            'vulnerability_status': status
        }
    )

    return {"status": "success", "action": status}
```

### **Workflow 3: Brute Force Auto-Block**

**Trigger:** Regra Wazuh 220020 (brute force detected)

**Ações:**

1. Extrair IP do atacante
2. Verificar se IP está em whitelist (NetBox)
3. Adicionar IP ao firewall blocklist (iptables/pfSense)
4. Criar ticket Odoo para revisão
5. Notificar SOC via Slack

**Configuração Visual (Drag-and-Drop):**

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

### **Apps Disponíveis no Shuffle**

| App | Versão | Ações Disponíveis | Status |
|-----|--------|-------------------|--------|
| **Wazuh** | 4.12.0 | List agents, Get agent info, Run command, Add to group, Remove from group, Get alerts | ✅ Oficial |
| **NetBox** | 4.2.0 | Get device, Update device, Create device, List IPs, Assign IP | ✅ Community |
| **Odoo** | 19.0 | Create ticket, Update ticket, Get tickets, Create partner | ✅ Community |
| **VirusTotal** | 3.0 | Scan file, Get report, Scan URL | ✅ Oficial |
| **Slack** | 2.0 | Send message, Upload file | ✅ Oficial |
| **Microsoft Teams** | 1.0 | Send message, Create channel | ✅ Oficial |

### **Configurar App NetBox**

```python
# shuffle/apps/netbox/1.0.0/src/app.py
from walkoff_app_sdk.app_base import AppBase

class NetBox(AppBase):
    __version__ = "1.0.0"
    app_name = "NetBox"

    def __init__(self, redis, logger, console_logger=None):
        super().__init__(redis, logger, console_logger)

    def get_device_by_ip(self, netbox_url, netbox_token, ip_address):
        """Get NetBox device by IP address"""
        import requests

        headers = {
            "Authorization": f"Token {netbox_token}",
            "Content-Type": "application/json"
        }

        # Search IP
        response = requests.get(
            f"{netbox_url}/api/ipam/ip-addresses/?address={ip_address}",
            headers=headers,
            verify=False
        )

        if response.status_code != 200:
            return {"error": f"Failed to fetch IP: {response.text}"}

        data = response.json()
        if not data['results']:
            return {"error": "IP not found in NetBox"}

        # Get device from interface
        ip_obj = data['results'][0]
        if not ip_obj['assigned_object']:
            return {"error": "IP not assigned to any device"}

        interface_id = ip_obj['assigned_object']['id']

        # Get interface details
        response = requests.get(
            f"{netbox_url}/api/dcim/interfaces/{interface_id}/",
            headers=headers,
            verify=False
        )

        if response.status_code != 200:
            return {"error": f"Failed to fetch interface: {response.text}"}

        interface = response.json()
        device_id = interface['device']['id']

        # Get device details
        response = requests.get(
            f"{netbox_url}/api/dcim/devices/{device_id}/",
            headers=headers,
            verify=False
        )

        if response.status_code != 200:
            return {"error": f"Failed to fetch device: {response.text}"}

        device = response.json()

        return {
            "id": device['id'],
            "name": device['name'],
            "status": device['status']['value'],
            "device_type": device['device_type']['model'],
            "site": device['site']['name'],
            "tenant": device['tenant']['name'] if device['tenant'] else None,
            "custom_fields": device['custom_fields']
        }

    def update_device(self, netbox_url, netbox_token, device_id, custom_fields):
        """Update NetBox device custom fields"""
        import requests

        headers = {
            "Authorization": f"Token {netbox_token}",
            "Content-Type": "application/json"
        }

        payload = {
            "custom_fields": custom_fields
        }

        response = requests.patch(
            f"{netbox_url}/api/dcim/devices/{device_id}/",
            headers=headers,
            json=payload,
            verify=False
        )

        if response.status_code not in [200, 201]:
            return {"error": f"Failed to update device: {response.text}"}

        return response.json()

if __name__ == "__main__":
    NetBox.run()
```

---

## 🔍 **Troubleshooting**

### **Problema: Webhook não recebe alertas**

**Verificar conectividade:**

```bash
# Testar webhook manualmente
curl -X POST https://shuffle.empresa.com/api/v1/hooks/webhook_wazuh_alerts \
  -H "Content-Type: application/json" \
  -d '{
    "rule": {
      "id": "220000",
      "level": 12,
      "description": "Test alert"
    },
    "agent": {
      "name": "test-host",
      "ip": "192.168.1.100"
    }
  }'

# Verificar logs Wazuh
tail -f /var/ossec/logs/integrations.log

# Verificar logs Shuffle
docker logs -f shuffle-backend
```

**Solução:**

1. Verificar firewall entre Wazuh e Shuffle
2. Confirmar URL do webhook no ossec.conf
3. Validar API key no Shuffle
4. Checar certificado SSL (pode precisar `verify=false`)

### **Problema: Workflow não executa**

**Debug no Shuffle:**

1. Shuffle UI → **Workflows** → Selecionar workflow
2. **Execution History** → Ver logs
3. Verificar cada ação individualmente
4. Testar manualmente: **Run workflow**

**Logs detalhados:**

```bash
# Habilitar debug mode
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up -d

# Ver logs em tempo real
docker logs -f shuffle-backend --tail 100
```

### **Problema: App NetBox não conecta**

**Verificar credenciais:**

```python
# Testar conexão NetBox
import requests

netbox_url = "https://netbox.empresa.com"
netbox_token = "YOUR_TOKEN"

headers = {
    "Authorization": f"Token {netbox_token}",
    "Content-Type": "application/json"
}

response = requests.get(f"{netbox_url}/api/status/", headers=headers, verify=False)
print(response.json())
```

---

## 📈 **Métricas e Monitoramento**

### **Dashboard Shuffle**

**Métricas importantes:**

- Workflows executados (total)
- Taxa de sucesso (%)
- Tempo médio de execução
- Falhas por workflow
- Apps mais usados

**Query Prometheus (se habilitado):**

```promql
# Total workflows executados
sum(shuffle_workflow_executions_total)

# Taxa de sucesso
sum(shuffle_workflow_executions_total{status="success"}) / sum(shuffle_workflow_executions_total) * 100

# Tempo médio
histogram_quantile(0.95, sum(rate(shuffle_workflow_duration_seconds_bucket[5m])) by (le))
```

---

## 🎓 **Próximos Passos**

1. Criar workflows customizados para seu ambiente
2. Integrar com outras ferramentas (Jira, ServiceNow, etc.)
3. Configurar notificações (Slack, Teams, email)
4. Implementar machine learning (Shuffle ML)
5. Explorar marketplace de workflows da comunidade

**Links Úteis:**

- [Shuffle Documentation](https://shuffler.io/docs)
- [Wazuh-Shuffle GitHub](https://github.com/Shuffle/wazuh-integration)
- [Community Workflows](https://shuffler.io/workflows)
- [Shuffle Discord](https://discord.gg/B2CBzUm)

---

**Status: ✅ Integração Completa | Parceria Oficial | 50+ Workflows | Production-Ready**
