# 🔥 Wazuh 4.12 - Features y Funcionalidades Completas

> **Contexto AI**: Documentación completa de todas las funcionalidades de Wazuh 4.12+, con énfasis en nuevas capacidades: eBPF FIM, hot reload, enlaces CTI, y integraciones nativas con SOAR (Shuffle/n8n).

---

## 🎯 **Nuevas Funcionalidades en Wazuh 4.12**

### **1. eBPF File Integrity Monitoring**

**Descripción:** FIM a nivel de kernel usando eBPF (extended Berkeley Packet Filter)

**Beneficios:**
- 70% menos overhead que inotify
- Detección imposible de bypassear
- Captura de eventos antes de llegar al filesystem

**Configuración:**

```xml
<syscheck>
  <whodata>
    <ebpf>yes</ebpf>
  </whodata>
  <directories check_all="yes" whodata="yes">/etc</directories>
  <directories check_all="yes" whodata="yes">/bin</directories>
</syscheck>
```

### **2. Hot Reload de Configuraciones**

**Descripción:** Recargar rules, decoders y SCA policies sin reiniciar

**Uso:**

```bash
# Recargar rules
/var/ossec/bin/wazuh-control reload rules

# Recargar decoders
/var/ossec/bin/wazuh-control reload decoders

# Recargar políticas SCA
/var/ossec/bin/wazuh-control reload sca

# Verificar status
tail -f /var/ossec/logs/ossec.log
```

### **3. Enlaces CTI Directos**

**Descripción:** Enlaces automáticos a threat intelligence en alertas

**Integraciones:**
- MISP (Malware Information Sharing Platform)
- AlienVault OTX
- ThreatFox
- VirusTotal

**Ejemplo de alerta:**

```json
{
  "rule": {
    "id": "100400",
    "description": "Malware detected",
    "mitre": {
      "id": "T1204",
      "tactic": "Execution",
      "technique": "User Execution"
    }
  },
  "cti_links": [
    "https://misp.empresa.com/events/view/12345",
    "https://otx.alienvault.com/indicator/file/abc123...",
    "https://www.virustotal.com/gui/file/abc123..."
  ]
}
```

---

## 🛡️ **Detección y Respuesta**

### **Log Analysis & Correlation**

**Soporta:**
- Syslog (RFC 3164, RFC 5424)
- Windows Event Logs (WEL, EVTX)
- JSON logs
- Audit logs (Linux auditd)
- Application logs (Apache, Nginx, MySQL, etc.)

**Ejemplo de regla de correlación:**

```xml
<rule id="100500" level="10" frequency="3" timeframe="120">
  <if_matched_sid>100400</if_matched_sid>
  <same_source_ip />
  <description>Multiple malware detections from same source</description>
  <mitre>
    <id>T1204</id>
  </mitre>
  <group>malware,correlation</group>
</rule>
```

### **Active Response**

**Acciones disponibles:**
- Firewall block (iptables, pfSense, Windows Firewall)
- Process termination
- File quarantine
- User account disable
- Custom scripts

**Configuración:**

```xml
<active-response>
  <command>firewall-drop</command>
  <location>local</location>
  <rules_id>100002</rules_id>
  <timeout>600</timeout>
</active-response>
```

---

## 📊 **Compliance & Auditing**

### **Frameworks Soportados**

- **PCI-DSS v4.0**: Payment Card Industry Data Security Standard
- **GDPR**: General Data Protection Regulation (EU)
- **LGPD**: Lei Geral de Proteção de Dados (Brasil)
- **HIPAA**: Health Insurance Portability and Accountability Act (USA)
- **NIST 800-53**: Security and Privacy Controls
- **CIS Benchmarks**: Center for Internet Security
- **SOC 2**: Service Organization Control 2

### **Security Configuration Assessment (SCA)**

**Políticas incluidas:**

```bash
# Listar políticas SCA disponibles
ls -la /var/ossec/ruleset/sca/

# Output:
cis_debian_linux_10.yml
cis_ubuntu_22.yml
cis_rhel_8_linux.yml
cis_win2019_enterprise.yml
pci_dss_v4.yml
gdpr.yml
lgpd.yml
```

**Resultados dashboard:**

- **Pass**: Checks que cumplen
- **Fail**: Checks que fallan
- **Not applicable**: No aplican al sistema

---

## 🔍 **Vulnerability Detection**

### **Fuentes de Vulnerabilidades**

- **NIST NVD**: National Vulnerability Database
- **Red Hat Security Advisory**
- **Debian Security Advisory**
- **Ubuntu Security Notices**
- **Amazon Linux Security Center**
- **Arch Linux Security Tracker**

### **Detección Automática**

```xml
<vulnerability-detector>
  <enabled>yes</enabled>
  <interval>5m</interval>
  <run_on_start>yes</run_on_start>
  <provider name="ubuntu">
    <enabled>yes</enabled>
    <update_interval>1h</update_interval>
  </provider>
  <provider name="redhat">
    <enabled>yes</enabled>
    <update_from_year>2020</update_from_year>
  </provider>
</vulnerability-detector>
```

### **Alertas de Vulnerabilidades**

```json
{
  "rule": {
    "id": "23503",
    "description": "CVE-2024-1234 affects agent"
  },
  "vulnerability": {
    "cve": "CVE-2024-1234",
    "severity": "Critical",
    "cvss": {
      "cvss3": {
        "base_score": 9.8,
        "vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
      }
    },
    "package": {
      "name": "openssl",
      "version": "1.1.1f-1ubuntu2"
    },
    "references": [
      "https://nvd.nist.gov/vuln/detail/CVE-2024-1234",
      "https://ubuntu.com/security/CVE-2024-1234"
    ]
  }
}
```

---

## 📱 **Cloud Security Monitoring**

### **AWS Security**

**Integraciones:**
- AWS CloudTrail
- AWS VPC Flow Logs
- AWS GuardDuty
- AWS Security Hub
- AWS Config
- AWS Macie

**Configuración:**

```xml
<wodle name="aws-s3">
  <disabled>no</disabled>
  <interval>10m</interval>
  <run_on_start>yes</run_on_start>
  <bucket type="cloudtrail">
    <name>wazuh-cloudtrail</name>
    <aws_profile>default</aws_profile>
  </bucket>
</wodle>
```

### **Azure Security**

**Integraciones:**
- Azure Activity Logs
- Azure Security Center
- Azure Sentinel
- Azure Storage Logs

### **GCP Security**

**Integraciones:**
- GCP Pub/Sub
- GCP Cloud Logging
- GCP Security Command Center

---

## 🔗 **Integraciones Nativas**

### **SOAR Platforms**

| Plataforma | Tipo | Estado | Features |
|-----------|------|--------|----------|
| **Shuffle** | SOAR | ✅ Oficial | 50+ workflows, app nativo |
| **n8n** | Automation | ✅ Community | 400+ nodos, webhooks |
| **TheHive** | IR Platform | ✅ Oficial | Case management |
| **Cortex** | Analysis | ✅ Oficial | Threat analysis |

### **Ticketing Systems**

| Sistema | Integración | Auto-ticketing |
|---------|-------------|----------------|
| **Odoo 19** | Webhook + Module | ✅ |
| **Jira** | REST API | ✅ |
| **ServiceNow** | REST API | ✅ |
| **Zendesk** | Webhook | ✅ |

### **ChatOps**

| Plataforma | Método | Notificaciones |
|-----------|--------|----------------|
| **Slack** | Webhook | ✅ |
| **Microsoft Teams** | Connector | ✅ |
| **Discord** | Webhook | ✅ |
| **Mattermost** | Webhook | ✅ |

---

## 📈 **Análisis y Reporting**

### **Dashboards Pre-construidos**

1. **Security Events**: Eventos en tiempo real
2. **Compliance**: PCI-DSS, GDPR, LGPD, HIPAA
3. **Vulnerability Detection**: CVEs por severidad
4. **FIM**: Cambios en archivos
5. **Agents**: Estado y métricas
6. **Threat Hunting**: Búsquedas personalizadas

### **Custom Queries (KQL)**

```kql
# Alertas críticas últimas 24h
rule.level >= 12 AND timestamp >= now-24h

# Malware detectado por agente
rule.groups: malware AND agent.name: "web-server-01"

# Vulnerabilidades críticas no parcheadas
vulnerability.severity: Critical AND vulnerability.status: open

# Compliance failures PCI-DSS
rule.pci_dss: * AND rule.pci_dss.status: fail
```

### **Informes Programados**

```python
# Ejemplo: Informe semanal de vulnerabilidades
from wazuh.api import WazuhAPI

api = WazuhAPI(host='localhost', port=55000, user='wazuh', password='wazuh')

# Obtener vulnerabilidades críticas
vulns = api.get('/vulnerability/agents', params={
    'severity': 'Critical',
    'status': 'open'
})

# Generar informe PDF
generate_pdf_report(vulns, output='weekly_vulns.pdf')

# Enviar por email
send_email(
    to='soc-team@empresa.com',
    subject='Informe Semanal de Vulnerabilidades',
    attachment='weekly_vulns.pdf'
)
```

---

## 🎓 **Próximos Pasos**

1. [Casos de Uso](use-cases.md) → Escenarios reales por industria
2. [Integración Shuffle](integrations/shuffle.md) → Automatización SOAR
3. [Integración n8n](integrations/n8n.md) → Workflows
4. [Reglas Personalizadas](rules/custom-rules.md) → Detección custom

---

**Estado: ✅ Features Completos | Wazuh 4.12 | NEO Stack v2.0 | Production-Ready**
