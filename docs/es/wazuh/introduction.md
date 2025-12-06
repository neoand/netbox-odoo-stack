# 📖 Introducción a Wazuh 4.12+ - Security Intelligence Platform

> **Contexto AI**: Guía completa de introducción a Wazuh 4.12+ para el stack NEO v2.0. Este documento es el punto de partida para entender Wazuh, su arquitectura, capacidades y cómo se integra con NetBox y Odoo.

---

## 🎯 **¿Qué es Wazuh?**

**Wazuh 4.12+** es una plataforma open source de seguridad que combina:

- **SIEM** (Security Information and Event Management)
- **XDR** (Extended Detection and Response)
- **HIDS** (Host Intrusion Detection System)
- **Compliance Management** (PCI-DSS, GDPR, LGPD, HIPAA)

### **Historia y Evolución**

- **2015**: Fork de OSSEC, fundación Wazuh Inc.
- **2020**: Wazuh 4.0 - Migración a OpenSearch
- **2023**: Wazuh 4.5 - ML integrado, eBPF FIM
- **2025**: Wazuh 4.12 - Hot reload, CTI links directos

---

## 🏗️ **Arquitectura Wazuh**

### **Componentes Principales**

```
┌─────────────────────────────────────────────────────────┐
│                   ARQUITECTURA WAZUH 4.12                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │          Wazuh Agents (Endpoints)            │       │
│  │  Windows | Linux | macOS | Network Devices   │       │
│  └────────────┬─────────────────────────────────┘       │
│               │ 1514/TCP (Events)                       │
│               │ 1515/TCP (Registration)                 │
│               ▼                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │        Wazuh Manager (Core Engine)           │       │
│  │  ┌────────────┐  ┌──────────┐  ┌─────────┐ │       │
│  │  │ Analysis   │  │  Ruleset │  │  Active │ │       │
│  │  │ Engine     │  │  Engine  │  │Response │ │       │
│  │  └────────────┘  └──────────┘  └─────────┘ │       │
│  └────────────┬─────────────────────────────────┘       │
│               │ 9200/TCP (Indexing)                     │
│               ▼                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │    Wazuh Indexer (OpenSearch 2.x)           │       │
│  │    Storage & Indexing & Search              │       │
│  └────────────┬─────────────────────────────────┘       │
│               │ 443/TCP (API)                           │
│               ▼                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │    Wazuh Dashboard (Visualization)           │       │
│  │    Analytics | Reports | Compliance         │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **Flujo de Datos**

1. **Agentes** recolectan eventos (logs, FIM, syscalls, etc.)
2. **Manager** analiza eventos contra ruleset
3. **Indexer** almacena alertas y eventos
4. **Dashboard** visualiza datos y genera informes

---

## 🔥 **Capacidades Principales**

### **1. File Integrity Monitoring (FIM)**

**Novedad 4.12:** FIM con eBPF en Linux (kernel-level monitoring)

```xml
<!-- /var/ossec/etc/ossec.conf -->
<syscheck>
  <directories check_all="yes" realtime="yes" report_changes="yes">
    /etc
  </directories>
  <directories check_all="yes" whodata="yes">
    /home
  </directories>
  <!-- eBPF FIM (nuevo en 4.12) -->
  <whodata>
    <ebpf>yes</ebpf>
  </whodata>
</syscheck>
```

**Beneficios:**
- Detección inmediata de cambios en archivos críticos
- Menor overhead que inotify
- Bypasses rootkits

### **2. Vulnerability Detection**

Integración con:
- **NIST NVD** (National Vulnerability Database)
- **Red Hat Security Advisory**
- **Debian Security Advisory**
- **Ubuntu Security Notices**

```xml
<vulnerability-detector>
  <enabled>yes</enabled>
  <interval>5m</interval>
  <run_on_start>yes</run_on_start>
  <update_ubuntu_oval>yes</update_ubuntu_oval>
  <update_redhat_oval>yes</update_redhat_oval>
</vulnerability-detector>
```

### **3. Configuration Assessment (SCA)**

**Novedad 4.12:** Hot reload de políticas SCA sin reinicio

Políticas incluidas:
- CIS Benchmarks (Windows, Linux, macOS)
- PCI-DSS v4.0
- GDPR
- LGPD (Brasil)
- HIPAA

```bash
# Recargar políticas SCA sin reinicio (4.12+)
/var/ossec/bin/wazuh-control reload sca

# Verificar status
curl -k https://localhost:55000/sca/001 -u wazuh:wazuh
```

### **4. Threat Intelligence Integration**

**Novedad 4.12:** Enlaces CTI directos en alertas

Integraciones:
- **MISP** (Malware Information Sharing Platform)
- **AlienVault OTX**
- **ThreatFox**
- **VirusTotal** (API)

```xml
<integration>
  <name>virustotal</name>
  <api_key>YOUR_VT_API_KEY</api_key>
  <group>syscheck</group>
  <alert_format>json</alert_format>
</integration>
```

---

## 🚀 **Instalación Rápida (Docker)**

### **Requisitos Mínimos**

| Componente | CPU | RAM | Disco |
|-----------|-----|-----|-------|
| Wazuh Manager | 2 cores | 4 GB | 50 GB |
| Wazuh Indexer | 4 cores | 8 GB | 100 GB |
| Wazuh Dashboard | 2 cores | 4 GB | 20 GB |

### **Instalación Single-Node**

```bash
# 1. Clonar repositorio oficial
git clone -b 4.12 https://github.com/wazuh/wazuh-docker.git
cd wazuh-docker/single-node

# 2. Generar certificados
docker-compose -f generate-indexer-certs.yml run --rm generator

# 3. Levantar stack
docker-compose up -d

# 4. Verificar servicios
docker-compose ps

# 5. Acceder Dashboard
# URL: https://localhost
# Usuario: admin
# Contraseña: SecretPassword (cambiar en .env)

# 6. Verificar API
curl -k https://localhost:55000/ -u wazuh:wazuh
```

### **Instalación Multi-Node (Producción)**

```bash
cd wazuh-docker/multi-node

# Editar docker-compose.yml para configurar IPs
nano docker-compose.yml

# Levantar cluster
docker-compose up -d

# Verificar cluster
curl -k https://localhost:55000/cluster/status -u wazuh:wazuh
```

---

## 🔧 **Configuración Inicial**

### **1. Registrar Primer Agente (Linux)**

```bash
# Ubuntu/Debian
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --dearmor | sudo tee /usr/share/keyrings/wazuh.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | sudo tee /etc/apt/sources.list.d/wazuh.list
sudo apt-get update
sudo apt-get install wazuh-agent=4.12.0-1

# Configurar manager IP
sudo sed -i 's|MANAGER_IP|192.168.1.100|g' /var/ossec/etc/ossec.conf

# Registrar agente
sudo /var/ossec/bin/agent-auth -m 192.168.1.100 -p 1515

# Iniciar agente
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent

# Verificar
sudo systemctl status wazuh-agent
```

### **2. Configurar Dashboard**

1. Acceder: `https://localhost`
2. Login: `admin / SecretPassword`
3. **Settings** → **API configuration**:
   - URL: `https://localhost:55000`
   - Username: `wazuh`
   - Password: `wazuh`
4. **Agents** → Verificar agente registrado

---

## 📊 **Primeros Dashboards**

### **Security Events**

- **Alerts over time**: Tendencias de alertas
- **Top 5 agents**: Agentes más activos
- **Rule level distribution**: Distribución por severidad

### **Compliance**

- **PCI-DSS Requirements**: Cumplimiento por requisito
- **GDPR Articles**: Cumplimiento GDPR
- **CIS Benchmarks**: Resultados de evaluación

### **Vulnerability Detection**

- **CVEs by severity**: Vulnerabilidades por nivel
- **Agents with vulnerabilities**: Top hosts vulnerables
- **CVE trends**: Tendencias de CVEs

---

## 🔗 **Integraciones del Stack NEO**

### **Wazuh + NetBox**

- Enriquecimiento de alertas con datos de assets
- Actualización automática de estado en NetBox
- Correlación IP → Device → Owner

### **Wazuh + Odoo 19**

- Auto-creación de tickets de seguridad
- SLA tracking
- Asignación automática a equipos SOC

### **Wazuh + Shuffle/n8n**

- Orquestación de respuesta automatizada
- Workflows visuales de incident response
- Integración con múltiples herramientas

---

## 🎓 **Próximos Pasos**

1. [Features Detallados](features.md) → Explorar todas las capacidades
2. [Casos de Uso](use-cases.md) → Escenarios reales por industria
3. [Integración Shuffle](integrations/shuffle.md) → Automatización SOAR
4. [Integración n8n](integrations/n8n.md) → Workflows personalizados
5. [Integración Odoo](integrations/odoo.md) → Auto-ticketing
6. [Reglas Personalizadas](rules/custom-rules.md) → Detección customizada

---

## 📚 **Recursos Adicionales**

- [Documentación Oficial](https://documentation.wazuh.com/)
- [Wazuh University](https://university.wazuh.com/)
- [GitHub](https://github.com/wazuh/wazuh)
- [Discord](https://discord.gg/wazuh)
- [Foro](https://groups.google.com/g/wazuh)

---

**Estado: ✅ Introducción Completa | Wazuh 4.12 | NEO Stack v2.0 | Production-Ready**
