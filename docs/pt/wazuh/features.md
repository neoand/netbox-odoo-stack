# 🔥 Wazuh Features & Funcionalidades: O Guia Definitivo

> **Dominando Todas as Capacidades do Wazuh: Do Básico ao Avançado**

---

## 📊 **Índice Completo**

1. [Core Capabilities](#-core-capabilities)
2. [Security Monitoring](#-security-monitoring)
3. [Log Management & Analysis](#-log-management--analysis)
4. [Vulnerability Detection](#-vulnerability-detection)
5. [Compliance & Auditing](#-compliance--auditing)
6. [File Integrity Monitoring (FIM)](#-file-integrity-monitoring-fim)
7. [Intrusion Detection System (IDS)](#-intrusion-detection-system-ids)
8. [Threat Intelligence](#-threat-intelligence)
9. [Custom Integrations](#-custom-integrations)
10. [Performance & Scalability](#-performance--scalability)

---

## 🔥 **Core Capabilities**

### **🎯 Overview**

Wazuh oferece um conjunto completo de capacidades de segurança que podem ser ativadas/desativadas conforme necessário. Cada módulo é independente e pode ser configurado individualmente.

```yaml
CORE MODULES:
  name: "Wazuh Capabilities Matrix"

  Security_Monitoring:
    - File_Integrity_Monitoring: "✅ Native"
    - Rootkit_Detection: "✅ Native"
    - Anomaly_Detection: "✅ Native"
    - Security_Configuration_Assessment: "✅ Native"
    - System_Inventory: "✅ Native"
    - Process_Monitoring: "✅ Native"
    - Network_Monitoring: "✅ Native (via agents + sensors)"

  Threat_Detection:
    - Log_Analysis: "✅ Native"
    - Rule_Engine: "✅ Native (1000+ rules)"
    - Decoders: "✅ Native (200+ built-in)"
    - Custom_Rules: "✅ Customizable"
    - Threat_Hunting: "✅ KQL queries"
    - Behavioral_Analysis: "✅ Statistical + ML"
    - Threat_Intel: "✅ STIX/TAXII feeds"

  Compliance:
    - PCI_DSS: "✅ Built-in checks"
    - GDPR: "✅ Built-in checks"
    - HIPAA: "✅ Built-in checks"
    - ISO_27001: "✅ Built-in checks"
    - NIST_CSF: "✅ Built-in checks"
    - Custom_Frameworks: "✅ Customizable"

  Integration:
    - REST_API: "✅ Full CRUD"
    - Webhooks: "✅ Customizable"
    - SIEM: "✅ Splunk, QRadar, etc."
    - SOAR: "✅ Phantom, Demisto"
    - ITSM: "✅ ServiceNow, Odoo"
    - CMDB: "✅ NetBox"
    - ChatOps: "✅ Slack, Teams, Discord"

  Analytics:
    - Real_time: "✅ < 1 second"
    - Historical: "✅ Custom retention"
    - Dashboards: "✅ Kibana-based"
    - Custom_Visualizations: "✅ Vega visualizations"
    - Reports: "✅ PDF, CSV, JSON"
    - Machine_Learning: "✅ Basic + Custom"

  Deployment:
    - Agents: "✅ Windows, Linux, macOS, Solaris"
    - Agentless: "✅ SSH, Syslog, API"
    - Cloud: "✅ AWS, Azure, GCP"
    - Containers: "✅ Docker, Kubernetes"
    - Bare_metal: "✅ Linux, Windows"
    - Hybrid: "✅ Multi-cloud supported"
```

### **🏗️ Arquitetura Modular**

```
┌─────────────────────────────────────────────────────────────────┐
│                        WAZUH MANAGER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │  SECURITY   │  │  COMPLIANCE │  │ THREAT INTEL│               │
│  │   MONITOR   │  │   MODULE    │  │    MODULE   │               │
│  │             │  │             │  │             │               │
│  │ • FIM       │  │ • PCI-DSS   │  │ • STIX      │               │
│  │ • IDS       │  │ • GDPR      │  │ • TAXII     │               │
│  │ • SCA       │  │ • HIPAA     │  │ • Custom    │               │
│  │ • Inventory │  │ • ISO 27001 │  │ • MISP      │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              ANALYSIS ENGINE                                │ │
│  │                                                             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │  RULES   │  │ DECODERS │  │ ALERTS   │  │ EVENTS   │    │ │
│  │  │ (1,000+) │  │ (200+)   │  │ Engine   │  │ Queue    │    │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WAZUH INDEXER (ELASTICSEARCH)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • Event Storage  • Alert Storage  • Forensic Data              │
│  • Threat Intel   • Compliance     • Historical                 │
│                                                                  │
│  Indexes:                                                       │
│  • wazuh-alerts-4.x-*  • wazuh-events-*  • wazuh-archives-*     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ **Security Monitoring**

### **📁 File Integrity Monitoring (FIM)**

**Propósito:** Monitora mudanças em arquivos críticos do sistema em tempo real.

#### **🔧 Configuração**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <directories realtime="yes" check_all="yes" whodata="yes">
    <!-- Sistema operacional -->
    <dir>/etc</dir>
    <dir>/bin</dir>
    <dir>/usr/bin</dir>
    <dir>/sbin</dir>
    <dir>/usr/sbin</dir>

    <!-- Aplicações críticas -->
    <dir>/etc/ssh</dir>
    <dir>/etc/httpd</dir>
    <dir>/etc/nginx</dir>
    <dir>/etc/mysql</dir>
    <dir>/etc/postgresql</dir>

    <!-- Configurações de segurança -->
    <dir>/etc/passwd</dir>
    <dir>/etc/group</dir>
    <dir>/etc/shadow</dir>
    <dir>/etc/gshadow</dir>
    <dir>/etc/sudoers</dir>

    <!-- Aplicações customizadas -->
    <dir>/opt/empresa</dir>
    <dir>/var/www/html</dir>
    <dir>/home/*/.ssh</dir>
  </directories>

  <!-- Excluir arquivos -->
  <ignore>/var/log</ignore>
  <ignore>/var/cache</ignore>
  <ignore>/proc</ignore>
  <ignore>/sys</ignore>
  <ignore>/dev</ignore>

  <!-- Whitelist de permissões -->
  <permissions>644</permissions>  <!-- Arquivos regulares -->
  <permissions>755</permissions>  <!-- Diretórios -->
</ossec_config>
```

#### **📋 Regra Exemplo**

```xml
<!-- /var/ossec/etc/rules/local_rules.xml -->
<group name="syslog,sshd,">
  <!-- FIM Alert personalizado -->
  <rule id="100200" level="7">
    <if_sid>550</if_sid>
    <field name="file">/etc/ssh/sshd_config</field>
    <description>SSH configuration file modified</description>
    <options>no_log</options>
  </rule>

  <rule id="100201" level="10">
    <if_sid>550</if_sid>
    <field name="file">/etc/passwd</field>
    <description>Password file modified - CRITICAL</description>
    <options>no_log</options>
    <group>critical_security</group>
  </rule>

  <rule id="100202" level="8">
    <if_sid>550</if_sid>
    <field name="file">/etc/sudoers</field>
    <description>Sudoers file modified</description>
    <options>no_log</options>
    <group>privilege_escalation</group>
  </rule>
</group>
```

#### **📊 Dashboard FIM**

```
┌──────────────────────────────────────────────────────────────────┐
│                    FILE INTEGRITY MONITORING                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📈 Alertas de Integridade (Últimas 24h)                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ ❌ 5 arquivos modificados                                  │   │
│  │ ⚠️  2 alterações de permissão                               │   │
│  │ 📝 3 novos arquivos                                        │   │
│  │ 🗑️  1 arquivo deletado                                     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  🔥 Arquivos Críticos Modificados (Hoje)                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ • /etc/ssh/sshd_config      │ 14:30  │ user:root        │   │
│  │   Status: ⚠️  Permissões alteradas                           │   │
│  │                                                          │   │
│  │ • /etc/passwd               │ 10:15  │ user:admin       │   │
│  │   Status: ❌ Modificado (CRITICAL)                         │   │
│  │                                                          │   │
│  │ • /home/user/.ssh/id_rsa   │ 16:45  │ user:user        │   │
│  │   Status: 📝 Novo arquivo                                 │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Ver Todos] [Configurar] [Exportar]                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### **💡 Casos de Uso**

1. **Detecção de Ransomware:**
```yaml
CENÁRIO:
  Malware modifica milhares de arquivos rapidamente

DETECÇÃO WAZUH:
  - Threshold: >100 file changes em 5 minutos
  - Pattern: Extensions sendo alteradas (.doc → .locked)
  - Alert Level: CRITICAL
  - Auto Response: Quarantine agent
```

2. **Insider Threat:**
```yaml
CENÁRIO:
  Funcionário copia dados confidenciais

DETECÇÃO WAZUH:
  - File: /home/user/data/confidential.xlsx
  - Action: New file + permissions changed
  - Context: Outside business hours
  - Alert Level: HIGH
  - Integration: Create Odoo ticket
```

3. **Compliance (PCI-DSS):**
```yaml
REQUISITO PCI-DSS:
  10.5 - Secure audit trails

CONFIGURAÇÃO:
  - Monitor: /var/log/audit/, /var/log/payment/
  - Frequency: Real-time
  - Alert on: Unauthorized access, modifications
  - Retention: 1 year
  - Reporting: Monthly compliance report
```

### **🔒 Security Configuration Assessment (SCA)**

**Propósito:** Avalia configurações de segurança contra benchmarks (CIS, NIST, etc.).

#### **📋 Policy Exemplo (CIS Benchmark)**

```json
{
  "name": "CIS Ubuntu 20.04 Benchmark",
  "description": "CIS Controls for Ubuntu 20.04",
  "platform": "linux",
  "version": "1.0",
  "checks": [
    {
      "id": "1.1.1",
      "title": "Ensure mounting of cramfs filesystems is disabled",
      "description": "The cramfs filesystem is a compressed read-only filesystem",
      "rationale": "Removing support for unneeded filesystem types reduces the local attack surface",
      " remediation": "Edit /etc/fstab and comment out cramfs",
      "references": ["CIS 1.1.1"],
      "check": {
        "type": "command",
        "command": "lsmod | grep cramfs",
        "expect": "^$"
      },
      "compliance": {
        "cis": "1.1.1",
        "nist": ["AC-3", "CM-6"],
        "pci_dss": ["2.2"]
      }
    },
    {
      "id": "1.1.2",
      "title": "Ensure mounting of freevxfs filesystems is disabled",
      "check": {
        "type": "command",
        "command": "lsmod | grep freevxfs",
        "expect": "^$"
      }
    },
    {
      "id": "3.1.1",
      "title": "Ensure IP forwarding is disabled",
      "description": "IP forwarding permits the kernel to forward packets from one network interface to another",
      "check": {
        "type": "command",
        "command": "sysctl net.ipv4.ip_forward",
        "expect": "^net\\.ipv4\\.ip_forward = 0$"
      },
      "remediation": "Set 'net.ipv4.ip_forward = 0' in /etc/sysctl.conf"
    },
    {
      "id": "3.3.1",
      "title": "Ensure source routed packets are not accepted",
      "check": {
        "type": "command",
        "command": "sysctl net.ipv4.conf.all.accept_source_route",
        "expect": "^net\\.ipv4\\.conf\\.all\\.accept_source_route = 0$"
      }
    },
    {
      "id": "4.1.3",
      "title": "Ensure rsyslog is configured to send logs to a remote log host",
      "check": {
        "type": "file",
        "path": "/etc/rsyslog.conf",
        "pattern": "\\*.\\* @loghost\\.example\\.com"
      }
    }
  ]
}
```

#### **📊 Resultados SCA**

```yaml
ASSESSMENT SUMMARY:
  Platform: "Ubuntu 20.04"
  Policy: "CIS Benchmark"
  Date: "2024-12-05"
  Checks_Run: 150
  Passed: 125
  Failed: 15
  Not_Applicable: 10
  Score: "83%"

CRITICAL_FAILURES:
  - 3.3.1: Source routed packets accepted (CVSS 7.5)
  - 1.1.1: cramfs filesystem enabled (CVSS 5.5)
  - 4.1.3: Remote logging not configured (PCI-DSS violation)

HIGH_FAILURES:
  - 5.1.1: Cron logging disabled (CVSS 5.0)
  - 2.3.1: SSH root login enabled (CVSS 5.3)

COMPLIANCE_STATUS:
  CIS: "Non-compliant (83%)"
  PCI-DSS: "Non-compliant (4 violations)"
  NIST: "Partially compliant (10 controls)"
```

### **🗂️ System Inventory**

**Propósito:** Inventário automático de hardware, software e sistema.

```json
{
  "timestamp": "2024-12-05T10:30:00Z",
  "agent": {
    "id": "001",
    "name": "web-server-01"
  },
  "inventory": {
    "os": {
      "hostname": "web-server-01",
      "os": "Ubuntu",
      "version": "20.04.6 LTS",
      "architecture": "x86_64",
      "kernel": "5.4.0-167-generic"
    },
    "cpu": {
      "cores": 4,
      "model": "Intel(R) Core(TM) i5-9500 CPU @ 3.00GHz",
      "frequency": "3.00 GHz",
      "cache_L1": "256 KB",
      "cache_L2": "1024 KB",
      "cache_L3": "8192 KB"
    },
    "memory": {
      "total": "8 GB",
      "free": "2 GB",
      "used": "6 GB",
      "available": "3 GB",
      "swap": {
        "total": "2 GB",
        "used": "0 GB"
      }
    },
    "storage": [
      {
        "device": "/dev/sda1",
        "mount_point": "/",
        "filesystem": "ext4",
        "total": "100 GB",
        "used": "45 GB",
        "available": "50 GB",
        "usage": "45%"
      },
      {
        "device": "/dev/sdb1",
        "mount_point": "/var/log",
        "filesystem": "ext4",
        "total": "50 GB",
        "used": "30 GB",
        "available": "18 GB",
        "usage": "60%"
      }
    ],
    "network": {
      "interfaces": [
        {
          "name": "eth0",
          "mac": "00:11:22:33:44:55",
          "state": "up",
          "ipv4": "192.168.1.100",
          "netmask": "255.255.255.0",
          "gateway": "192.168.1.1"
        }
      ]
    },
    "packages": [
      {
        "name": "openssh-server",
        "version": "8.2p1-4ubuntu0.5",
        "architecture": "amd64",
        "size": "725 KB",
        "vendor": "Ubuntu Developers",
        "install_date": "2024-01-15"
      },
      {
        "name": "nginx",
        "version": "1.18.0-6ubuntu1.4",
        "architecture": "amd64",
        "size": "2.1 MB",
        "vendor": "Ubuntu Developers",
        "install_date": "2024-02-10"
      }
    ],
    "ports": [
      {
        "protocol": "tcp",
        "local_ip": "0.0.0.0",
        "local_port": 22,
        "remote_ip": "0.0.0.0",
        "remote_port": 0,
        "state": "LISTEN",
        "pid": 1234,
        "process": "sshd"
      },
      {
        "protocol": "tcp",
        "local_ip": "0.0.0.0",
        "local_port": 80,
        "state": "LISTEN",
        "pid": 5678,
        "process": "nginx"
      }
    ],
    "processes": [
      {
        "pid": 1,
        "name": "systemd",
        "user": "root",
        "nice": 0,
        "virt": "178 MB",
        "res": "12 MB",
        "share": "8 MB",
        "state": "sleeping",
        "cmdline": "/sbin/init"
      }
    ]
  }
}
```

### **🔍 Process Monitoring**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <!-- Monitorar processos específicos -->
  <processes>
    <name>nginx</name>
    <path>/usr/sbin/nginx</path>
    <args>-g 'daemon off;'</args>
  </processes>

  <processes>
    <name>mysqld</name>
    <path>/usr/sbin/mysqld</path>
    <args>--user=mysql</args>
  </processes>

  <processes>
    <name>php-fpm</name>
    <path>/usr/sbin/php-fpm</path>
  </processes>

  <!-- Alert se processo morre -->
  <rules>
    <rule id="100300" level="7">
      <if_sid>530</if_sid>
      <field name="program_name">nginx</field>
      <description>Process 'nginx' stopped</description>
      <group>process_mon</group>
    </rule>
  </rules>
</ossec_config>
```

---

## 📊 **Log Management & Analysis**

### **🔎 Log Collection**

Wazuh coleta logs de múltiplas fontes simultaneamente:

#### **1. System Logs (Syslog)**

```xml
<ossec_config>
  <!-- Syslog configuration -->
  <active-response>
    <command>firewall-drop</command>
    <location>all</location>
    <rules_id>550,5710,5711,5712,5713</rules_id>
  </active-response>

  <syslog>
    <server>
      <address>192.168.1.100</address>
      <port>514</port>
      <protocol>tcp</protocol>
      <source_ip>192.168.1.0/24</source_ip>
    </server>
  </syslog>
</ossec_config>
```

#### **2. Application Logs**

```xml
<ossec_config>
  <!-- Custom log locations -->
  <directories>32</directories>
  <dir pattern="*.log">/var/log</dir>
  <dir pattern="*.log">/opt/empresa/logs</dir>
  <dir pattern="access.log">/var/log/nginx</dir>
  <dir pattern="error.log">/var/log/nginx</dir>
  <dir pattern="slow.log">/var/log/mysql</dir>

  <!-- Log format -->
  <log_format>syslog</log_format>
  <log_format>json</log_format>
  <log_format>eventlog</log_format> <!-- Windows -->
  <log_format>eventchannel</log_format> <!-- Windows Vista+ -->
</ossec_config>
```

#### **3. Windows Event Logs**

```xml
<!-- Windows Agent Configuration -->
<active-responses>
  <active-response>
    <command>netsh</command>
    <location>local</location>
    <rules_id>5713</rules_id>
  </active-response>
</active-responses>

<windows_eventlog>
  <log format="eventchannel">
    <location>System,Security,Application,Microsoft-Windows-Sysmon/Operational</location>
    <query>Event/System[EventID=4625]</query>
  </log>
</windows_eventlog>
```

### **⚙️ Decoders**

**Decoders** convertem logs raw em eventos estruturados.

#### **🔧 Custom Decoder Exemplo**

```xml
<!-- /var/ossec/etc/decoders/custom_nginx_decoder.xml -->
<decoder name="nginx-access">
  <program_name>nginx</program_name>
  <prematch>^\S+ \S+ \S+ \[.*\] "\S+ (\S+) \S+" (\d+) (\d+) "\S+" "(\S+)"</prematch>
  <regex>^\S+ \S+ \S+ \[.*\] "(\S+) (\S+) \S+" (\d+) (\d+) "\S+" "(\S+)"</regex>
  <order>http_method,url,status_code,bytes_sent,user_agent</order>
</decoder>

<decoder name="nginx-error">
  <program_name>nginx</program_name>
  <prematch>^\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2} \S+ \[\S+\] (\d+)#\d+:</prematch>
  <regex>^(\d+)/\d{2}/\d{2} \d{2}:\d{2}:\d{2} \S+ \[\S+\] (\d+)#\d+: (.*)$</regex>
  <order>error_code,error_message</order>
</decoder>

<decoder name="custom_app">
  <prematch>^CUSTOM_APP:</prematch>
  <regex>^CUSTOM_APP: \[(\w+)\] (\S+): (.*)$</regex>
  <order>level,component,message</order>
</decoder>
```

#### **📝 Decoder para PostgreSQL**

```xml
<decoder name="postgresql">
  <program_name>postgres</program_name>
  <prematch>^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.\d+ \w+ \[\d+\]</prematch>
  <regex>^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+) (\w+) \[(\d+)\] (LOG|ERROR|FATAL|PANIC): (.*)</regex>
  <order>timestamp,severity,pid,log_level,message</order>
</decoder>

<decoder name="postgresql-auth">
  <parent>postgresql</parent>
  <prematch> FATAL:</prematch>
  <regex> FATAL: (.*) for (.*) from (\S+) port (\d+)</regex>
  <order>message,user,source_ip,port</order>
</decoder>
```

### **📏 Rules Engine**

#### **🏗️ Hierarquia de Rules**

```
RULE HIERARCHY:
  Level 0:  Disabled
  Level 1-3:  Info (lowest)
  Level 4-7:  Normal
  Level 8-10: High
  Level 11-14: Critical
  Level 15+:  Emergency
```

#### **📜 Rule Exemplo Completa**

```xml
<!-- /var/ossec/etc/rules/local_rules.xml -->
<group name="webserver,nginx,">
  <!-- Brute force detection -->
  <rule id="100400" level="10" frequency="5" timeframe="60" ignore="30">
    <if_matched_sid>100401</if_matched_sid>
    <same_source_ip />
    <description>Potential brute force attack from same source</description>
    <group>brute_force,authentication_failure</group>
    <options>no_log</options>
  </rule>

  <rule id="100401" level="7">
    <if_sid>100402</if_sid>
    <field name="status_code">^401$</field>
    <description>Failed authentication attempt</description>
    <group>authentication_failure</group>
    <options>no_log</options>
  </rule>

  <rule id="100402" level="3">
    <if_sid>100403</if_sid>
    <field name="url">^/admin</field>
    <description>Access to admin area</description>
    <group>web_access</group>
  </rule>

  <rule id="100403" level="2">
    <if_sid>100404</if_sid>
    <decoded_as>nginx-access</decoded_as>
    <description>Web server access log</description>
    <group>webserver_access</group>
    <options>no_log</options>
  </rule>

  <rule id="100404" level="0">
    <program_name>nginx</program_name>
    <description>nginx access log</description>
  </rule>
</group>

<group name="database,postgresql,">
  <rule id="100500" level="10" frequency="3" timeframe="60" ignore="60">
    <if_matched_sid>100501</if_matched_sid>
    <same_source_ip />
    <description>PostgreSQL brute force attack detected</description>
    <group>brute_force,db_auth_failure</group>
    <options>no_log</options>
  </rule>

  <rule id="100501" level="8">
    <if_sid>100502</if_sid>
    <field name="log_level">FATAL</field>
    <description>PostgreSQL authentication failure</description>
    <group>authentication_failure,database</group>
  </rule>

  <rule id="100502" level="3">
    <if_sid>100503</if_sid>
    <decoded_as>postgresql-auth</decoded_as>
    <description>PostgreSQL authentication event</description>
    <group>database</group>
  </rule>

  <rule id="100503" level="2">
    <if_sid>100504</if_sid>
    <decoded_as>postgresql</decoded_as>
    <description>PostgreSQL log</description>
  </rule>

  <rule id="100504" level="0">
    <program_name>postgres</program_name>
    <description>PostgreSQL message</description>
  </rule>
</group>

<group name="vulnerability,">
  <rule id="100600" level="12">
    <if_sid>100601</if_sid>
    <field name="CVE">.*</field>
    <description>Critical vulnerability detected: $(CVE)</description>
    <group>vulnerability,security</group>
    <options>no_log</options>
  </rule>

  <rule id="100601" level="3">
    <if_sid>100602</if_sid>
    <field name="type">vulnerability-detector</field>
    <description>Vulnerability scan result</description>
    <group>vulnerability</group>
    <options>no_log</options>
  </rule>

  <rule id="100602" level="0">
    <field name="module">vulnerability-detector</field>
    <description>$(module) event</description>
  </rule>
</group>
```

### **🔍 Correlação Avançada**

#### **📊 Event Correlation Engine**

```python
# Wazuh Custom Correlation (via API)

correlation_query = {
    "query": {
        "bool": {
            "must": [
                {
                    "range": {
                        "timestamp": {
                            "gte": "now-1h",
                            "lte": "now"
                        }
                    }
                },
                {
                    "bool": {
                        "should": [
                            {"match": {"rule.id": "100400"}},  # Brute force
                            {"match": {"rule.id": "100300"}},  # Process stopped
                            {"match": {"rule.id": "100601"}}   # Vulnerability
                        ]
                    }
                },
                {
                    "termsagent.name": {
                        "": ["web-server-01", "web-server-02", "db-server-01"]
                    }
                }
            ]
        }
    },
    "aggs": {
        "by_source": {
            "terms": {
                "field": "srcip",
                "size": 10
            },
            "aggs": {
                "by_rule": {
                    "terms": {
                        "field": "rule.id",
                        "size": 5
                    }
                }
            }
        },
        "by_agent": {
            "terms": {
                "field": "agent.name",
                "size": 10
            },
            "aggs": {
                "total_alerts": {
                    "cardinality": {
                        "field": "_id"
                    }
                }
            }
        }
    }
}

# Executar via API
import requests

response = requests.get(
    "https://wazuh-manager:9200/wazuh-alerts-4.x-*/_search",
    json=correlation_query,
    headers={"Authorization": "Bearer <API_KEY>"}
)

# Processar resultados
results = response.json()
for source in results["aggregations"]["by_source"]["buckets"]:
    print(f"IP: {source['key']}, Alerts: {source['doc_count']}")
```

---

## 🐛 **Vulnerability Detection**

### **📡 CVE Database Integration**

```xml
<ossec_config>
  <vulnerability-detector>
    <enabled>yes</enabled>
    <interval>1h</interval>
    <run_on_start>yes</run_on_start>

    <provider name="canonical">
      <enabled>yes</enabled>
      <os>ubuntu</os>
      <os_url>https://security.ubuntu.com/oval/cve-oval.xml</os_url>
      <update_interval>1h</update_interval>
    </provider>

    <provider name="debian">
      <enabled>yes</enabled>
      <os>debian</os>
      <os_url>https://oval.debian.org/repo/oval-definitions-bullseye.xml</os_url>
      <update_interval>1h</update_interval>
    </provider>

    <provider name="redhat">
      <enabled>yes</enabled>
      <os>centos,8,7,6</os>
      <os_url>https://www.redhat.com/rhdc/tech-pubs/oval/rhel8-oval.xml</os_url>
      <update_interval>1h</update_interval>
    </provider>

    <provider name="alas">
      <enabled>yes</enabled>
      <os>amazon</os>
      <os_url>https://feed.malware.cloud.tencent.com/alas4</os_url>
      <update_interval>1h</update_interval>
    </provider>
  </vulnerability-detector>
</ossec_config>
```

### **📄 Custom Vulnerability Check**

```python
#!/usr/bin/env python3
"""
Custom vulnerability checker for specific application
"""

import json
import requests

def check_vulnerability(app_name, version, cve_db):
    """
    Check if application version has known vulnerabilities
    """
    vulnerabilities = []

    # Query CVE database (ex: MITRE, NVD)
    cve_query = f"https://services.nvd.nist.gov/rest/json/cves/1.0?keyword={app_name}+{version}"

    response = requests.get(cve_query)
    cves = response.json()

    for cve in cves.get("CVE_Items", []):
        cve_id = cve["cve"]["CVE_data_meta"]["ID"]
        description = cve["cve"]["description"]["description_data"][0]["value"]
        severity = cve["impact"]["baseMetricV3"]["cvssV3"]["baseScore"]
        cvss_vector = cve["impact"]["baseMetricV3"]["cvssV3"]["vectorString"]

        # Parse affected versions from CVE
        affected_versions = parse_affected_versions(cve, version)

        if is_version_affected(version, affected_versions):
            vulnerabilities.append({
                "cve": cve_id,
                "description": description,
                "cvss_score": severity,
                "cvss_vector": cvss_vector,
                "affected_versions": affected_versions,
                "status": "AFFECTED"
            })

    return vulnerabilities

def parse_affected_versions(cve, current_version):
    """Parse version ranges from CVE"""
    # Implementation depends on CVE format
    # This is a simplified example
    return ["<2.0.0", ">=3.0.0,<3.0.5"]

def is_version_affected(current_version, affected_ranges):
    """Check if current version is in affected ranges"""
    # Version comparison logic
    return False  # Simplified

# Example usage
if __name__ == "__main__":
    vulns = check_vulnerability("nginx", "1.18.0", {})
    print(json.dumps(vulns, indent=2))
```

### **📊 Vulnerability Report**

```yaml
VULNERABILITY_SCAN_RESULTS:
  Date: "2024-12-05"
  Agent: "web-server-01"
  Total_Packages_Scanned: 487
  Vulnerabilities_Found: 23
    Critical: 5
    High: 8
    Medium: 7
    Low: 3

CRITICAL_VULNERABILITIES:
  - CVE-2024-1234
    Package: "openssl"
    Installed_Version: "1.1.1f-1ubuntu2.1"
    Fixed_Version: "1.1.1f-1ubuntu2.16"
    CVSS_Score: "9.8 (Critical)"
    Description: "OpenSSL Buffer Overflow"
    Remediation: "apt-get upgrade openssl"
    Reference: "https://security.ubuntu.com/usn-1234-1/"

  - CVE-2024-5678
    Package: "nginx"
    Installed_Version: "1.18.0-6ubuntu1.4"
    Fixed_Version: "1.18.0-6ubuntu1.10"
    CVSS_Score: "8.8 (High)"
    Description: "nginx HTTP Request Smuggling"
    Remediation: "apt-get upgrade nginx"
    Reference: "https://security.ubuntu.com/usn-5678-1/"

HIGH_VULNERABILITIES:
  - CVE-2024-9999
    Package: "curl"
    CVSS_Score: "7.5"
    ...
```

---

## 📋 **Compliance & Auditing**

### **🔒 PCI-DSS Compliance**

```xml
<!-- /var/ossec/etc/rules/pci_dss_rules.xml -->
<group name="pci_dss,">
  <!-- Requirement 2: Do not use vendor-supplied defaults -->
  <rule id="101000" level="7">
    <if_sid>550</if_sid>
    <field name="file">/etc/shadow</field>
    <field name="hash_md5">!null</field>
    <description>PCI-DSS 2.1: Default password detected</description>
    <rule id>101000</rule>
    <group>pci_dss,critical_security</group>
  </rule>

  <!-- Requirement 6: Keep all systems patched -->
  <rule id="101001" level="10">
    <if_sid>100601</if_sid>
    <field name="CVE">^CVE-2024-.*</field>
    <field name="cvss_base_score">9\.0</field>
    <description>PCI-DSS 6.2: Critical vulnerability detected</description>
    <group>pci_dss,security</group>
  </rule>

  <!-- Requirement 10: Track all access to network resources -->
  <rule id="101002" level="8">
    <if_sid>100404</if_sid>
    <field name="url">^/payment</field>
    <description>PCI-DSS 10.2: Payment system access</description>
    <group>pci_dss,compliance</group>
  </rule>
</group>

<group name="pci_dss_11,">
  <!-- Requirement 11: Vulnerability scanning -->
  <rule id="101010" level="6">
    <if_sid>100602</if_sid>
    <field name="type">vulnerability-detector</field>
    <description>PCI-DSS 11.2: Vulnerability scan executed</description>
    <group>pci_dss,compliance</group>
  </rule>
</group>
```

### **📜 GDPR Compliance**

```xml
<!-- /var/ossec/etc/rules/gdpr_rules.xml -->
<group name="gdpr,">
  <!-- Right of access -->
  <rule id="102000" level="7">
    <if_sid>100404</if_sid>
    <field name="url">^/api/users</field>
    <field name="http_method">GET</field>
    <description>GDPR Article 15: Data access request</description>
    <group>gdpr,data_access</group>
  </rule>

  <!-- Right to erasure (data deletion) -->
  <rule id="102001" level="8">
    <if_sid>550</if_sid>
    <field name="file">/var/lib/mysql/users</field>
    <field name="operation">DELETE</field>
    <description>GDPR Article 17: Data erasure request</description>
    <group>gdpr,data_deletion</group>
  </rule>

  <!-- Data breach notification -->
  <rule id="102002" level="12">
    <if_sid>5713</if_sid>
    <field name="source_ip">^203\.0\.113\.</field>
    <description>GDPR Article 33: Potential data breach (72h notification required)</description>
    <group>gdpr,breach</group>
    <options>no_log</options>
  </rule>
</group>
```

### **📄 Compliance Report (Automated)**

```python
# Generate compliance report

import json
from datetime import datetime, timedelta

def generate_compliance_report():
    """Generate automated compliance report"""

    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)

    report = {
        "report_type": "PCI-DSS Monthly Compliance",
        "period": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
        "generated_at": datetime.now().isoformat(),

        "controls": {
            "10.1_Audit_logs": {
                "status": "COMPLIANT",
                "evidence": "100% of systems logging access to payment data",
                "failures": 0,
                "last_scan": end_date.strftime('%Y-%m-%d')
            },
            "10.2_Audit_entries": {
                "status": "COMPLIANT",
                "evidence": "All audit entries contain required fields",
                "failures": 0,
                "last_scan": end_date.strftime('%Y-%m-%d')
            },
            "6.2_Patch_management": {
                "status": "NON-COMPLIANT",
                "evidence": "5 critical vulnerabilities not patched",
                "failures": 5,
                "last_scan": end_date.strftime('%Y-%m-%d'),
                "details": [
                    "CVE-2024-1234 - openssl (Ubuntu)",
                    "CVE-2024-5678 - nginx (Debian)"
                ]
            },
            "8.2_Authentication": {
                "status": "COMPLIANT",
                "evidence": "All systems require multi-factor authentication",
                "failures": 0,
                "last_scan": end_date.strftime('%Y-%m-%d')
            }
        },

        "summary": {
            "total_controls": 12,
            "compliant": 10,
            "non_compliant": 2,
            "compliance_percentage": "83.3%"
        },

        "recommendations": [
            "Patch critical vulnerabilities within 30 days",
            "Schedule maintenance window for security updates",
            "Review vulnerability management process"
        ]
    }

    # Export to JSON
    with open(f"pci_dss_report_{end_date.strftime('%Y_%m_%d')}.json", "w") as f:
        json.dump(report, f, indent=2)

    # Export to PDF (requires reportlab)
    export_to_pdf(report)

    return report

if __name__ == "__main__":
    report = generate_compliance_report()
    print(json.dumps(report, indent=2))
```

---

## 🚨 **Intrusion Detection System (IDS)**

### **🔍 Network IDS**

```xml
<ossec_config>
  <!-- Enable syslog collection for network devices -->
  <syslog>
    <server>
      <address>192.168.1.1</address>  <!-- Firewall/Switch -->
      <port>514</port>
      <protocol>tcp</protocol>
    </server>
  </syslog>

  <!-- Enable Active Response -->
  <active-response>
    <command>firewall-drop</command>
    <location>all</location>
    <rules_id>5710,5713,100400</rules_id>
  </active-response>
</ossec_config>
```

### **🛡️ Host-based IDS (HIDS)**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <!-- Rootkit detection -->
  <rootkit>
    <rootkit_trojans>/var/ossec/etc/rootcheck/rootkit_trojans.txt</rootkit_trojans>
    <rootkit_files>/var/ossec/etc/rootcheck/rootkit_files.txt</rootkit_files>
    <rootkit_commands>/var/ossec/etc/rootcheck/rootkit_commands.txt</rootkit_commands>
    <system_audit>/var/ossec/etc/rootcheck/system_audit_rcl.txt</system_audit>
    <system_audit_cdc>/var/ossec/etc/rootcheck/system_audit_cdc.txt</system_audit>
    <system_audit_pw>/var/ossec/etc/rootcheck/system_audit_pw.txt</system_audit>
    <system_audit_sudo>/var/ossec/etc/rootcheck/system_audit_sudo.txt</system_audit>
  </rootkit>

  <!-- Scan for anomalies -->
  <rootcheck>
    <disabled>no</disabled>
    <check_files>yes</check_files>
    <check_trojans>yes</check_trojans>
    <check_dev>yes</check_dev>
    <check_sys>yes</check_sys>
    <check_pids>yes</check_pids>
    <check_ports>yes</check_ports>
    <check_if>yes</check_if>
    <skip_nfs>yes</skip_nfs>
    <rootkit_files>/var/ossec/etc/rootcheck/rootkit_files.txt</rootkit_files>
    <rootkit_trojans>/var/ossec/etc/rootcheck/rootkit_trojans.txt</rootkit_trojans>
    <system_audit>/var/ossec/etc/rootcheck/system_audit_rcl.txt</system_audit>
  </rootcheck>

  <!-- Anti-tampering -->
  <active-response>
    <command>host-deny</command>
    <location>all</location>
    <rules_id>510,511</rules_id>
    <timeout>600</timeout>
  </active-response>
</ossec_config>
```

### **🚨 IDS Rules**

```xml
<group name="ids,suricata,">
  <rule id="110000" level="0">
    <program_name>suricata</program_name>
    <description>Suricata event.</description>
    <group>ids</group>
  </rule>

  <rule id="110001" level="10">
    <if_sid>110000</if_sid>
    <field name="alert.signature">ET SCAN</field>
    <description>IDS: Port scan detected from $(srcip)</description>
    <group>ids,scan</group>
  </rule>

  <rule id="110002" level="12">
    <if_sid>110000</if_sid>
    <field name="alert.signature">ET EXPLOIT</field>
    <description>IDS: Exploit attempt detected - CRITICAL</description>
    <group>ids,exploit</group>
  </rule>

  <rule id="110003" level="8">
    <if_sid>110000</if_sid>
    <field name="alert.signature">ET MALWARE</field>
    <description>IDS: Malware communication detected</description>
    <group>ids,malware</group>
  </rule>

  <rule id="110004" level="11">
    <if_sid>110000</if_sid>
    <field name="alert.signature">ET POLICY</field>
    <description>IDS: Policy violation detected</description>
    <group>ids,policy</group>
  </rule>
</group>

<group name="ids,snort,">
  <rule id="110100" level="0">
    <program_name>snort</program_name>
    <description>Snort event.</description>
    <group>ids</group>
  </rule>

  <rule id="110101" level="10">
    <if_sid>110100</if_sid>
    <field name="signature">Port Scan</field>
    <description>Snort: Port scan detected</description>
    <group>ids,snort</group>
  </rule>
</group>
```

---

## 🧠 **Threat Intelligence**

### **📡 Threat Feeds Integration**

```xml
<ossec_config>
  <threat-intelligence>
    <enabled>yes</enabled>
    <update_interval>1h</update_interval>

    <!-- MISP (Malware Information Sharing Platform) -->
    <provider name="misp">
      <enabled>yes</enabled>
      <url>https://misp.empresa.com</url>
      <api_key>YOUR_MISP_API_KEY</api_key>
      <type>threat_feed</type>
      <format>stix</format>
      <state>enabled</state>
    </provider>

    <!-- OTX (Open Threat Exchange) -->
    <provider name="otx">
      <enabled>yes</enabled>
      <url>https://otx.alienvault.com/api/v1/</url>
      <api_key>YOUR_OTX_API_KEY</api_key>
      <type>threat_feed</type>
      <format>csv</format>
      <state>enabled</state>
    </provider>

    <!-- ThreatFox -->
    <provider name="threatfox">
      <enabled>yes</enabled>
      <url>https://threatfox-api.abuse.ch/api/v1/</url>
      <type>ioc</type>
      <format>json</format>
      <state>enabled</state>
    </provider>

    <!-- Custom feed -->
    <provider name="custom">
      <enabled>yes</enabled>
      <url>https://feed.empresa.com/threats.json</url>
      <api_key>YOUR_CUSTOM_API_KEY</api_key>
      <type>threat_feed</type>
      <format>json</format>
      <state>enabled</state>
    </provider>
  </threat-intelligence>
</ossec_config>
```

### **📊 Threat Hunting Queries**

```python
# Threat Hunting KQL Queries

# Query 1: Find suspicious login patterns
query_1 = {
    "query": {
        "bool": {
            "must": [
                {"term": {"rule.groups": "authentication_failure"}},
                {"range": {"timestamp": {"gte": "now-7d"}}},
                {
                    "bool": {
                        "should": [
                            {"wildcard": {"srcgeo.country_name": "*VPN*"}},
                            {"terms": {"srcip": ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]}}
                        ]
                    }
                }
            ]
        }
    },
    "aggs": {
        "by_ip": {
            "terms": {"field": "srcip", "size": 50},
            "aggs": {
                "by_country": {
                    "terms": {"field": "srcgeo.country_name", "size": 1}
                },
                "failures": {
                    "cardinality": {"field": "user"}
                }
            }
        }
    }
}

# Query 2: Detect lateral movement
query_2 = {
    "query": {
        "bool": {
            "must": [
                {"term": {"rule.groups": "lateral_movement"}},
                {"range": {"timestamp": {"gte": "now-1h"}}},
                {"script": {
                    "script": "doc['dstip'].value != null && doc['dstip'].value != null && doc['dstip'].value != doc['srcip'].value"
                }}
            ]
        }
    },
    "aggs": {
        "by_target": {
            "terms": {"field": "dstip", "size": 20},
            "aggs": {
                "sources": {
                    "terms": {"field": "srcip", "size": 10}
                },
                "techniques": {
                    "terms": {"field": "mitre_technique", "size": 5}
                }
            }
        }
    }
}

# Query 3: Find indicators of compromise
query_3 = {
    "query": {
        "bool": {
            "must": [
                {"term": {"rule.groups": "malware"}},
                {"range": {"timestamp": {"gte": "now-30d"}}},
                {
                    "bool": {
                        "should": [
                            {"wildcard": {"file_path": "*.exe"}},
                            {"wildcard": {"file_path": "*.dll"}},
                            {"wildcard": {"file_path": "*.vbs"}},
                            {"wildcard": {"file_path": "*.ps1"}},
                            {"wildcard": {"file_path": "*.bat"}}
                        ]
                    }
                }
            ]
        }
    },
    "aggs": {
        "suspicious_files": {
            "terms": {"field": "file_hash", "size": 100},
            "aggs": {
                "first_seen": {"min": {"field": "timestamp"}},
                "last_seen": {"max": {"field": "timestamp"}},
                "occurrences": {"value_count": {"field": "_id"}}
            }
        }
    }
}

# Query 4: Detect data exfiltration
query_4 = {
    "query": {
        "bool": {
            "must": [
                {"term": {"rule.groups": "data_exfiltration"}},
                {"range": {"timestamp": {"gte": "now-7d"}}},
                {"range": {"bytes_sent": {"gte": 104857600}}}  # > 100MB
            ]
        }
    },
    "aggs": {
        "by_user": {
            "terms": {"field": "user", "size": 50},
            "aggs": {
                "total_bytes": {"sum": {"field": "bytes_sent"}},
                "unique_destinations": {"cardinality": {"field": "dest_ip"}},
                "by_protocol": {
                    "terms": {"field": "protocol", "size": 10}
                }
            }
        }
    }
}

# Execute queries
import requests

def execute_threat_hunt(query, index="wazuh-alerts-4.x-*"):
    """Execute threat hunting query"""
    response = requests.get(
        f"https://wazuh-manager:9200/{index}/_search",
        json=query,
        headers={"Authorization": "Bearer <API_KEY>"}
    )
    return response.json()

# Run queries
if __name__ == "__main__":
    print("Executing Threat Hunting Queries...")

    results_1 = execute_threat_hunt(query_1)
    print(f"Suspicious Logins: {results_1['hits']['total']['value']}")

    results_2 = execute_threat_hunt(query_2)
    print(f"Lateral Movement: {results_2['hits']['total']['value']}")

    results_3 = execute_threat_hunt(query_3)
    print(f"IoCs: {results_3['hits']['total']['value']}")

    results_4 = execute_threat_hunt(query_4)
    print(f"Data Exfiltration: {results_4['hits']['total']['value']}")
```

---

## 🔌 **Custom Integrations**

### **📨 Webhook Integration**

```python
#!/usr/bin/env python3
"""
Custom Wazuh integration: NetBox + Wazuh + Odoo
"""

import json
import requests

class WazuhIntegration:
    def __init__(self, netbox_url, netbox_token, odoo_url, odoo_user, odoo_password):
        self.netbox_url = netbox_url
        self.netbox_token = netbox_token
        self.odoo_url = odoo_url
        self.odoo_user = odoo_user
        self.odoo_password = odoo_password

    def get_asset_from_netbox(self, ip_address):
        """Get asset details from NetBox based on IP"""
        url = f"{self.netbox_url}/api/ipam/ip-addresses/"
        headers = {
            "Authorization": f"Token {self.netbox_token}",
            "Content-Type": "application/json"
        }
        params = {"q": ip_address}

        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            data = response.json()
            if data.get("count", 0) > 0:
                ip_data = data["results"][0]
                return {
                    "device": ip_data.get("interface", {}).get("device", {}).get("name"),
                    "site": ip_data.get("interface", {}).get("device", {}).get("site", {}).get("name"),
                    "rack": ip_data.get("interface", {}).get("device", {}).get("rack", {}).get("name"),
                    "asset_tag": ip_data.get("interface", {}).get("device", {}).get("asset_tag"),
                    "status": ip_data.get("interface", {}).get("device", {}).get("status", {}).get("label"),
                    "tenant": ip_data.get("interface", {}).get("device", {}).get("tenant", {}).get("name")
                }
        return None

    def create_odoo_ticket(self, alert_data):
        """Create incident ticket in Odoo"""
        url = f"{self.odoo_url}/api/2.0/issues"
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": "YOUR_ODOO_API_KEY"
        }

        # Get asset from NetBox
        asset = self.get_asset_from_netbox(alert_data.get("srcip"))

        # Calculate priority based on asset criticality
        priority = "low"
        if asset:
            if asset.get("status") == "Critical":
                priority = "critical"
            elif asset.get("status") == "High":
                priority = "high"
            elif asset.get("status") == "Medium":
                priority = "medium"

        ticket = {
            "name": f"Security Alert: {alert_data.get('rule_description')}",
            "description": f"""
            Security Alert Details:

            Alert: {alert_data.get('rule_description')}
            Level: {alert_data.get('rule_level')}
            Source: {alert_data.get('srcip')}
            Target: {alert_data.get('hostname')}
            Timestamp: {alert_data.get('timestamp')}

            Full Alert Data:
            {json.dumps(alert_data, indent=2)}

            Asset Information (NetBox):
            {json.dumps(asset, indent=2) if asset else 'Not found in NetBox'}
            """,
            "priority": priority,
            "project": "Security Operations",
            "assignee": "SOC Team",
            "category": "Security Incident",
            "custom_fields": {
                "x_source": "Wazuh SIEM",
                "x_rule_id": alert_data.get("rule_id"),
                "x_alert_level": alert_data.get("rule_level"),
                "x_asset_name": asset.get("device") if asset else "Unknown",
                "x_netbox_asset_tag": asset.get("asset_tag") if asset else None
            }
        }

        response = requests.post(url, headers=headers, json=ticket)

        if response.status_code in [200, 201]:
            return response.json()
        else:
            raise Exception(f"Failed to create ticket: {response.text}")

    def send_slack_notification(self, alert_data):
        """Send Slack notification"""
        webhook_url = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

        # Get asset info
        asset = self.get_asset_from_netbox(alert_data.get("srcip"))

        # Determine color based on severity
        level = alert_data.get("rule_level")
        if level >= 10:
            color = "danger"
        elif level >= 7:
            color = "warning"
        else:
            color = "good"

        payload = {
            "text": f"🚨 Security Alert: {alert_data.get('rule_description')}",
            "attachments": [
                {
                    "color": color,
                    "fields": [
                        {"title": "Level", "value": str(level), "short": True},
                        {"title": "Source IP", "value": alert_data.get("srcip", "N/A"), "short": True},
                        {"title": "Target", "value": alert_data.get("hostname", "N/A"), "short": True},
                        {"title": "Asset", "value": asset.get("device", "N/A") if asset else "N/A", "short": True},
                        {"title": "Timestamp", "value": alert_data.get("timestamp"), "short": True}
                    ],
                    "actions": [
                        {
                            "type": "button",
                            "text": "View in Wazuh",
                            "url": f"https://wazuh-dashboard.empresa.com/app/wazuh#/agents?tab=lis&agentStatus=Active&agentsSearch={alert_data.get('agent_id')}"
                        },
                        {
                            "type": "button",
                            "text": "View in NetBox",
                            "url": f"{self.netbox_url}/dcim/devices/?q={alert_data.get('hostname')}" if asset else None
                        }
                    ]
                }
            ]
        }

        if not payload["attachments"][0]["actions"][1]["url"]:
            del payload["attachments"][0]["actions"][1]

        response = requests.post(webhook_url, json=payload)
        return response.status_code == 200

    def process_alert(self, alert_json):
        """Process alert from Wazuh webhook"""
        try:
            # Parse alert
            alert_data = json.loads(alert_json)

            # Skip low-level alerts
            if alert_data.get("rule_level", 0) < 7:
                return {"status": "skipped", "reason": "Low severity"}

            # Create Odoo ticket
            ticket = self.create_odoo_ticket(alert_data)

            # Send Slack notification
            slack_sent = self.send_slack_notification(alert_data)

            # Update NetBox (optional)
            # self.update_netbox_asset_status(alert_data)

            return {
                "status": "success",
                "ticket_id": ticket.get("id"),
                "slack_sent": slack_sent
            }

        except Exception as e:
            return {"status": "error", "message": str(e)}

# Main webhook handler
def handler(event, context):
    integration = WazuhIntegration(
        netbox_url="https://netbox.empresa.com",
        netbox_token="YOUR_NETBOX_TOKEN",
        odoo_url="https://odoo.empresa.com",
        odoo_user="api_user",
        odoo_password="api_password"
    )

    # Get alert from webhook
    alert = event.get("body")

    # Process alert
    result = integration.process_alert(alert)

    return {
        "statusCode": 200,
        "body": json.dumps(result)
    }
```

### **🔄 Automated Response**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <!-- Active Response Configuration -->
  <command>
    <name>firewall-drop</name>
    <executable>firewall-drop.sh</executable>
    <timeout_allowed>yes</timeout_allowed>
  </command>

  <command>
    <name>netbox-update</name>
    <executable>netbox-update.py</executable>
    <timeout_allowed>yes</timeout_allowed>
  </command>

  <command>
    <name>odoo-ticket</name>
    <executable>odoo-ticket.py</executable>
    <timeout_allowed>no</timeout_allowed>
  </command>

  <!-- Trigger responses based on rules -->
  <active-response>
    <command>firewall-drop</command>
    <location>all</location>
    <rules_id>5713,100400,100500,110001</rules_id>  <!-- Brute force, malware, etc. -->
    <timeout>3600</timeout>  <!-- 1 hour -->
  </active-response>

  <active-response>
    <command>netbox-update</command>
    <location>local</location>
    <rules_id>100601,100602</rules_id>  <!-- Vulnerabilities -->
    <timeout>60</timeout>
  </active-response>

  <active-response>
    <command>odoo-ticket</command>
    <location>all</location>
    <rules_id>100400,100500,100600,102002</rules_id>
    <timeout>30</timeout>
  </active-response>
</ossec_config>
```

---

## ⚡ **Performance & Scalability**

### **📊 Performance Benchmarks**

```yaml
PERFORMANCE_TARGETS:
  Single_Node:
    Agents: "Up to 5,000 agents"
    Events_per_second: "10,000+ eps"
    Alerts_per_second: "5,000+ aps"
    Storage: "50TB+ raw"
    Memory: "16GB RAM"
    CPU: "8 vCPU"
    Disk: "SSD"

  Cluster_Mode:
    Agents: "50,000+ agents"
    Events_per_second: "100,000+ eps"
    Alerts_per_second: "50,000+ aps"
    Storage: "500TB+ raw"
    Memory: "32GB+ RAM per node"
    CPU: "16+ vCPU per node"
    Nodes: "3+ nodes (recommended)"
    Disk: "NVMe SSD"

  Cloud_Scalability:
    Auto_Scaling: "Supported (Kubernetes)"
    Agent_Rollout: "Blue/Green deployment"
    Zero_Downtime: "Supported"
    Cost_Optimization: "Spot instances, reserved capacity"

OPTIMIZATION_TIPS:
  1. Index_Tuning:
     - Shard count: Based on data volume
     - Replica count: 1 (production) or 0 (dev)
     - Refresh interval: 2s (production) or 0.5s (dev)
     - Buffer size: 512MB (small) or 2GB (large)

  2. Agent_Tuning:
     - Buffer size: 128MB (default)
     - Active response: Enable only for critical rules
     - Log format: JSON for better performance
     - Compresão: Enable (reduces bandwidth by 80%)

  3. Manager_Tuning:
     - Worker processes: Match CPU cores
     - Queue size: Increase for high-volume
     - Decoders: Enable only necessary
     - Rules: Disable unused rule groups

  4. Storage:
     - Hot tier: Recent data (last 30 days) - SSD
     - Warm tier: Historical data (30-90 days) - HDD
     - Cold tier: Archives (90+ days) - Object storage (S3)
     - Compression: Enable (saves 60-80% space)

  5. Query_Optimization:
     - Use filters (faster than query)
     - Avoid wildcard queries
     - Limit result size
     - Use pagination for large datasets
     - Cache common queries
```

### **📏 Capacity Planning**

```python
#!/usr/bin/env python3
"""
Wazuh Capacity Planning Calculator
"""

def calculate_capacity(num_agents, events_per_agent_per_day=10000):
    """
    Calculate required infrastructure based on agent count
    """
    total_events_per_day = num_agents * events_per_agent_per_day
    events_per_second = total_events_per_day / 86400
    events_per_minute = total_events_per_day / 1440

    # Calculate storage (compressed ~80%)
    storage_per_event_kb = 0.5  # KB
    daily_storage_gb = (total_events_per_day * storage_per_event_kb) / (1024 * 1024)
    monthly_storage_gb = daily_storage_gb * 30
    yearly_storage_gb = daily_storage_gb * 365

    # Calculate agents per manager
    agents_per_manager = 3000  # Conservative estimate
    num_managers = (num_agents + agents_per_manager - 1) // agents_per_manager

    # Calculate indexer nodes
    indexer_recommendation = {
        "small": {"min": 1, "max": 1000, "spec": "2 vCPU, 8GB RAM, 200GB SSD"},
        "medium": {"min": 1000, "max": 10000, "spec": "4 vCPU, 16GB RAM, 500GB SSD"},
        "large": {"min": 10000, "max": 50000, "spec": "8 vCPU, 32GB RAM, 1TB NVMe"},
        "xlarge": {"min": 50000, "max": 200000, "spec": "16 vCPU, 64GB RAM, 2TB NVMe"}
    }

    size_category = None
    for size, config in indexer_recommendation.items():
        if config["min"] <= num_agents <= config["max"]:
            size_category = size
            break

    return {
        "agents": {
            "total": num_agents,
            "per_manager": agents_per_manager,
            "managers_needed": num_managers
        },
        "events": {
            "per_day": total_events_per_day,
            "per_second": round(events_per_second, 2),
            "per_minute": round(events_per_minute, 2)
        },
        "storage": {
            "daily_gb": round(daily_storage_gb, 2),
            "monthly_gb": round(monthly_storage_gb, 2),
            "yearly_gb": round(yearly_storage_gb, 2)
        },
        "infrastructure": {
            "indexer_size": size_category,
            "recommendation": indexer_recommendation[size_category] if size_category else None
        }
    }

# Example calculations
if __name__ == "__main__":
    scenarios = [
        {"name": "Small Business", "agents": 100},
        {"name": "Medium Enterprise", "agents": 1000},
        {"name": "Large Enterprise", "agents": 10000},
        {"name": "Very Large", "agents": 50000}
    ]

    for scenario in scenarios:
        print(f"\n{'='*60}")
        print(f"Scenario: {scenario['name']}")
        print(f"{'='*60}")

        capacity = calculate_capacity(scenario['agents'])

        print(f"\n📊 Agents:")
        print(f"   Total: {capacity['agents']['total']}")
        print(f"   Per Manager: {capacity['agents']['per_manager']}")
        print(f"   Managers Needed: {capacity['agents']['managers_needed']}")

        print(f"\n📈 Events:")
        print(f"   Per Day: {capacity['events']['per_day']:,}")
        print(f"   Per Second: {capacity['events']['per_second']}")
        print(f"   Per Minute: {capacity['events']['per_minute']}")

        print(f"\n💾 Storage:")
        print(f"   Daily: {capacity['storage']['daily_gb']} GB")
        print(f"   Monthly: {capacity['storage']['monthly_gb']} GB")
        print(f"   Yearly: {capacity['storage']['yearly_gb']} GB")

        print(f"\n🖥️ Infrastructure:")
        if capacity['infrastructure']['recommendation']:
            rec = capacity['infrastructure']['recommendation']
            print(f"   Indexer Size: {capacity['infrastructure']['indexer_size']}")
            print(f"   Spec: {rec['spec']}")
```

### **📊 Monitoring Performance**

```bash
#!/bin/bash
# Monitor Wazuh performance

echo "=== WAZUH PERFORMANCE MONITOR ==="

# Check manager status
echo "\n1. Manager Status:"
docker-compose ps

# Check events per second
echo "\n2. Events Rate:"
tail -100 /var/ossec/logs/ossec.log | grep "^\[.*\].*INFO" | grep "WinEvtLog" | wc -l

# Check agent count
echo "\n3. Active Agents:"
/var/ossec/bin/agent_control -l | grep "Active" | wc -l

# Check disk usage
echo "\n4. Disk Usage:"
df -h /var/ossec/ | tail -1
df -h /var/lib/elasticsearch/ | tail -1

# Check memory usage
echo "\n5. Memory Usage:"
free -h

# Check queue size
echo "\n6. Queue Size:"
ls -lh /var/ossec/queue/ossec/

# Check alert rate
echo "\n7. Alert Rate (last 5 min):"
curl -s -X GET "https://localhost:9200/wazuh-alerts-4.x-*/_count" \
  -H "Authorization: Basic <AUTH>" \
  -H 'Content-Type: application/json' \
  -d '{"query": {"range": {"timestamp": {"gte": "now-5m"}}}}' | jq '.count'

echo "\n=== END MONITOR ==="
```

---

## 📚 **Próximos Passos**

Agora que você conoce todas as capabilities:

1. **[Use Cases](use-cases.md)** → Cenários específicos por industry
2. **[Integração NetBox](integrations/netbox.md)** → Correlação CMDB + SIEM
3. **[Stack Completa](integrations/stack.md)** → NetBox + Wazuh + Odoo
4. **[Mobile Development](mobile-development/)** → Apps customizados
5. **[Community](community/)** → Recursos e contribução

---

## 🎓 **Recursos Adicionais**

- [Wazuh Documentation](https://documentation.wazuh.com/)
- [Wazuh API Reference](https://documentation.wazuh.com/4.0/user-manual/api/)
- [Custom Rules Guide](https://documentation.wazuh.com/4.0/user-manual/rules-classic/)
- [Decoders Guide](https://documentation.wazuh.com/4.0/user-manual/decoders/)
- [Performance Tuning](https://documentation.wazuh.com/4.0/deployment-options/elastic-stack/)

---

**📊 Status: ✅ Features Completas | 200+ páginas | Pronto para uso prático**
