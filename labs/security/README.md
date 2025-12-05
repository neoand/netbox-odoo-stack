# 🔐 Laboratório de Segurança - NetBox + Compliance

> **"Harden sua infraestrutura com benchmarks CIS, Vulnerability Scanning e SIEM"**

---

## 🎯 **Objetivo**

Laboratório hands-on para implementar segurança enterprise:
- ✅ CIS Benchmarks
- ✅ Vulnerability Scanning
- ✅ SIEM Integration
- ✅ Compliance Automático
- ✅ Incident Response

---

## 📋 **Componentes**

| Serviço | Porta | Função |
|---------|-------|--------|
| **NetBox** | 8010 | CMDB com dados simulados de segurança |
| **OpenVAS** | 9392 | Vulnerability Scanner |
| **Wazuh** | 5000 | SIEM + HIDS |
| **Elasticsearch** | 9200 | Log storage |
| **Kibana** | 5601 | Log visualization |
| **Nessus** (demo) | 8834 | Vulnerability scanner |
| **Suricata** | 9001 | IDS/IPS |

---

## 🚀 **Quick Start**

```bash
# Lab de Segurança
cd labs/security
docker-compose up -d

# Acessar:
# - NetBox Security: http://localhost:8010
# - Wazuh: http://localhost:5000
# - Kibana: http://localhost:5601
# - OpenVAS: http://localhost:9392
```

---

## 🎓 **Exercícios**

### **Exercício 1: Vulnerability Scanning (30 min)**
```bash
# 1. Acessar OpenVAS
# 2. Criar scan da rede 192.168.1.0/24
# 3. Executar scan
# 4. Analisar vulnerabilidades
# 5. Gerar relatório
```

**Alvo:** Simular 100 dispositivos com vulnerabilidades

### **Exercício 2: SIEM Setup (45 min)**
```bash
# 1. Configurar Wazuh Manager
# 2. Conectar agents
# 3. Definir regras de detecção
# 4. Criar dashboard Kibana
# 5. Testar alertas
```

### **Exercício 3: Compliance CIS (60 min)**
```python
# Verificar 150+ controles CIS
from wazuh.core import compliance

results = compliance.check_benchmark('cis_centos7')
for control in results.failed:
    print(f"❌ {control.id}: {control.description}")
    print(f"   Remediation: {control.remediation}")
```

### **Exercício 4: Incident Response (30 min)**
```bash
# Simular incidente:
# 1. Login fora do horário
# 2. Multiple failed logins
# 3. Data exfiltration attempt
# 4. Investigar no SIEM
# 5. Criar ticket
```

---

## 📊 **Métricas de Segurança**

### **Dashboard Principal:**
- **Critical Vulns:** 23
- **High Vulns:** 87
- **Medium Vulns:** 234
- **Failed Logins:** 1,247 (24h)
- **Compliance Score:** 78.3%
- **MTTR:** 45 minutos

### **CIS Controls:**
- ✅ 127 controls passing
- ❌ 23 controls failing
- ⚠️ 15 controls warning

---

## 🎯 **Casos de Uso**

### **1. PCI-DSS Compliance**
- Network segmentation
- Vulnerability management
- Access control
- Monitoring

### **2. ISO 27001**
- Risk assessment
- Security controls
- Incident management
- Continuous improvement

### **3. SOC 2**
- Security
- Availability
- Processing integrity
- Confidentiality

---

## 🛠️ **Ferramentas Integradas**

### **Scanners:**
- OpenVAS
- Nessus (demo)
- Nmap
- Nikto

### **SIEM:**
- Wazuh
- Elasticsearch
- Kibana
- Logstash

### **HIDS/NIDS:**
- Suricata
- OSSEC
- YARA rules

### **Hardening:**
- CIS-CAT
- Lynis
- OpenSCAP

---

## 📚 **Recursos**

- 📖 [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)
- 🎥 [Wazuh Training](https://training.wazuh.com)
- 📝 [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**🔐 Segurança é um processo, não um produto. Lab v1.0**
