# 📋 Regras Customizadas Wazuh - NEO Stack v2.0

> **AI Context**: Este arquivo contém regras Wazuh customizadas específicas para o stack NEO (NetBox + Odoo + Wazuh). Inclui detecção de ameaças, integração com SOAR (Shuffle/n8n), e auto-ticketing no Odoo 19. Todas as regras são XML com exemplos completos prontos para uso.

---

## 🎯 **Visão Geral**

Regras customizadas para o **NEO_NETBOX_ODOO_STACK v2.0** com foco em:

- Detecção de ameaças específicas do stack
- Integração NetBox (enriquecimento de context)
- Auto-ticketing Odoo 19
- Triggers para Shuffle/n8n workflows
- Compliance LGPD/GDPR

---

## 📂 **Estrutura de Regras**

```
/var/ossec/etc/rules/
├── local_rules.xml              # Regras gerais custom
├── neo_stack_rules.xml          # Regras específicas do NEO Stack
├── netbox_integration.xml       # Regras de integração NetBox
├── odoo_integration.xml         # Regras de integração Odoo
├── shuffle_triggers.xml         # Triggers para Shuffle SOAR
└── n8n_webhooks.xml             # Webhooks para n8n
```

---

## 🔥 **Regras NEO Stack**

### **1. Detecção de Anomalias NetBox**

```xml
<!-- /var/ossec/etc/rules/neo_stack_rules.xml -->
<group name="neo_stack,netbox,">

  <!-- NetBox API Authentication Failures -->
  <rule id="200000" level="0">
    <decoded_as>json</decoded_as>
    <field name="service">netbox</field>
    <description>NetBox service event</description>
    <options>no_log</options>
  </rule>

  <rule id="200001" level="5">
    <if_sid>200000</if_sid>
    <field name="event_type">authentication_failure</field>
    <description>NetBox: Failed authentication attempt</description>
    <group>authentication_failed,pci_dss_10.2.4,pci_dss_10.2.5,gdpr_IV_35.7.d</group>
  </rule>

  <rule id="200002" level="10" frequency="3" timeframe="120">
    <if_matched_sid>200001</if_matched_sid>
    <same_source_ip />
    <description>NetBox: Multiple authentication failures from same IP</description>
    <mitre>
      <id>T1110</id>
    </mitre>
    <group>authentication_failures,pci_dss_11.4,gdpr_IV_35.7.d</group>
  </rule>

  <!-- NetBox Critical Asset Changes -->
  <rule id="200010" level="7">
    <if_sid>200000</if_sid>
    <field name="event_type">asset_modified</field>
    <field name="asset_criticality">critical|high</field>
    <description>NetBox: Critical asset modified - $(asset_name)</description>
    <group>asset_management,configuration_changes</group>
  </rule>

  <rule id="200011" level="12">
    <if_sid>200010</if_sid>
    <field name="change_type">delete</field>
    <description>NetBox: Critical asset DELETED - URGENT - $(asset_name)</description>
    <mitre>
      <id>T1485</id>
    </mitre>
    <group>asset_management,data_destruction,pci_dss_10.6.1</group>
  </rule>

  <!-- NetBox IP Address Assignment Anomalies -->
  <rule id="200020" level="6">
    <if_sid>200000</if_sid>
    <field name="event_type">ip_assigned</field>
    <field name="ip_range">^10\.|^172\.16\.|^192\.168\.</field>
    <description>NetBox: New IP address assigned - $(ip_address)</description>
    <group>asset_management,network_changes</group>
  </rule>

  <rule id="200021" level="10">
    <if_sid>200020</if_sid>
    <field name="assignment_method">manual</field>
    <field name="outside_business_hours">true</field>
    <description>NetBox: IP manually assigned outside business hours - SUSPICIOUS</description>
    <group>asset_management,suspicious_activity</group>
  </rule>

  <!-- NetBox VLAN Changes -->
  <rule id="200030" level="8">
    <if_sid>200000</if_sid>
    <field name="event_type">vlan_modified</field>
    <field name="vlan_type">production|dmz|critical</field>
    <description>NetBox: Production VLAN modified - $(vlan_name)</description>
    <group>network_changes,configuration_changes</group>
  </rule>

</group>
```

### **2. Integração Odoo 19**

```xml
<!-- /var/ossec/etc/rules/odoo_integration.xml -->
<group name="neo_stack,odoo,">

  <!-- Odoo Base Events -->
  <rule id="210000" level="0">
    <decoded_as>json</decoded_as>
    <field name="service">odoo</field>
    <description>Odoo service event</description>
    <options>no_log</options>
  </rule>

  <!-- Odoo Authentication -->
  <rule id="210001" level="5">
    <if_sid>210000</if_sid>
    <field name="event_type">login_failed</field>
    <description>Odoo: Failed login attempt - User: $(user)</description>
    <group>authentication_failed,pci_dss_10.2.4</group>
  </rule>

  <rule id="210002" level="10" frequency="5" timeframe="300">
    <if_matched_sid>210001</if_matched_sid>
    <same_source_ip />
    <description>Odoo: Brute force attack detected from $(srcip)</description>
    <mitre>
      <id>T1110</id>
    </mitre>
    <group>authentication_failures,brute_force</group>
  </rule>

  <!-- Odoo Helpdesk Ticket Creation from Wazuh -->
  <rule id="210010" level="3">
    <if_sid>210000</if_sid>
    <field name="event_type">ticket_created</field>
    <field name="source">wazuh</field>
    <description>Odoo: Security ticket created automatically from Wazuh alert</description>
    <group>ticket_management,automation</group>
  </rule>

  <rule id="210011" level="7">
    <if_sid>210010</if_sid>
    <field name="priority">urgent|high</field>
    <description>Odoo: HIGH priority security ticket created - ID: $(ticket_id)</description>
    <group>ticket_management,high_priority</group>
  </rule>

  <!-- Odoo Critical Data Access -->
  <rule id="210020" level="8">
    <if_sid>210000</if_sid>
    <field name="event_type">data_access</field>
    <field name="model">res.partner|account.move|hr.employee</field>
    <field name="action">read|export</field>
    <description>Odoo: Critical data accessed - Model: $(model) User: $(user)</description>
    <group>data_access,gdpr_compliance,lgpd_compliance</group>
  </rule>

  <rule id="210021" level="12">
    <if_sid>210020</if_sid>
    <field name="action">export|download</field>
    <field name="record_count">\d{2,}</field>
    <description>Odoo: BULK data export detected - $(record_count) records - User: $(user)</description>
    <mitre>
      <id>T1005</id>
      <id>T1048</id>
    </mitre>
    <group>data_exfiltration,gdpr_IV_35.7.d,lgpd_article_46</group>
  </rule>

  <!-- Odoo Module Installation (Security Risk) -->
  <rule id="210030" level="10">
    <if_sid>210000</if_sid>
    <field name="event_type">module_installed</field>
    <description>Odoo: New module installed - $(module_name) by $(user)</description>
    <group>configuration_changes,security_risk</group>
  </rule>

  <rule id="210031" level="12">
    <if_sid>210030</if_sid>
    <field name="module_source">^(?!apps\.odoo\.com)</field>
    <description>Odoo: EXTERNAL module installed (non-official) - CRITICAL</description>
    <group>malware_risk,supply_chain_attack</group>
  </rule>

  <!-- Odoo Database Backup Events -->
  <rule id="210040" level="5">
    <if_sid>210000</if_sid>
    <field name="event_type">database_backup</field>
    <description>Odoo: Database backup initiated by $(user)</description>
    <group>backup,data_protection</group>
  </rule>

  <rule id="210041" level="12">
    <if_sid>210040</if_sid>
    <field name="backup_location">^(?!s3://|/backup/)</field>
    <description>Odoo: Database backup to SUSPICIOUS location - $(backup_location)</description>
    <mitre>
      <id>T1005</id>
    </mitre>
    <group>data_exfiltration,suspicious_activity</group>
  </rule>

</group>
```

### **3. Triggers SOAR (Shuffle)**

```xml
<!-- /var/ossec/etc/rules/shuffle_triggers.xml -->
<group name="neo_stack,soar,shuffle,">

  <!-- Trigger Shuffle Workflow: Malware Response -->
  <rule id="220000" level="12">
    <decoded_as>json</decoded_as>
    <field name="rule.groups">malware|virus|trojan</field>
    <field name="rule.level">(1[0-5])</field>
    <description>SHUFFLE TRIGGER: Malware detected on $(agent.name) - Workflow: malware_response</description>
    <mitre>
      <id>T1204</id>
    </mitre>
    <group>malware,automated_response,shuffle_workflow</group>
    <options>alert_by_email</options>
  </rule>

  <!-- Trigger Shuffle Workflow: Vulnerability Remediation -->
  <rule id="220010" level="10">
    <if_sid>23503</if_sid>
    <field name="vulnerability.severity">High|Critical</field>
    <field name="vulnerability.cvss.cvss3.base_score">[7-9]\.|10\.0</field>
    <description>SHUFFLE TRIGGER: Critical vulnerability detected - CVE: $(vulnerability.cve) - Workflow: vuln_remediation</description>
    <mitre>
      <id>T1190</id>
    </mitre>
    <group>vulnerability,automated_remediation,shuffle_workflow</group>
  </rule>

  <!-- Trigger Shuffle Workflow: Suspicious Login -->
  <rule id="220020" level="10">
    <if_matched_sid>210002</if_matched_sid>
    <description>SHUFFLE TRIGGER: Brute force detected - IP: $(srcip) - Workflow: block_ip</description>
    <mitre>
      <id>T1110</id>
    </mitre>
    <group>authentication_failures,automated_response,shuffle_workflow</group>
  </rule>

  <!-- Trigger Shuffle Workflow: Data Exfiltration -->
  <rule id="220030" level="12">
    <if_matched_sid>210021</if_matched_sid>
    <description>SHUFFLE TRIGGER: Data exfiltration detected - User: $(user) - Workflow: incident_response</description>
    <mitre>
      <id>T1048</id>
    </mitre>
    <group>data_exfiltration,incident_response,shuffle_workflow</group>
  </rule>

  <!-- Trigger Shuffle Workflow: Compliance Violation -->
  <rule id="220040" level="9">
    <decoded_as>json</decoded_as>
    <field name="rule.groups">gdpr|lgpd|pci_dss|hipaa</field>
    <field name="compliance.status">failed|non_compliant</field>
    <description>SHUFFLE TRIGGER: Compliance violation - Framework: $(compliance.framework) - Workflow: compliance_remediation</description>
    <group>compliance,automated_remediation,shuffle_workflow</group>
  </rule>

  <!-- Trigger Shuffle Workflow: NetBox Asset Deleted -->
  <rule id="220050" level="12">
    <if_matched_sid>200011</if_matched_sid>
    <description>SHUFFLE TRIGGER: Critical asset deleted in NetBox - Workflow: asset_recovery</description>
    <mitre>
      <id>T1485</id>
    </mitre>
    <group>asset_management,data_destruction,shuffle_workflow</group>
  </rule>

</group>
```

### **4. Webhooks n8n**

```xml
<!-- /var/ossec/etc/rules/n8n_webhooks.xml -->
<group name="neo_stack,soar,n8n,">

  <!-- n8n Webhook: Create Odoo Ticket -->
  <rule id="230000" level="8">
    <if_sid>100400,100500,100600</if_sid>
    <description>N8N WEBHOOK: Security alert requires ticket - $(rule.description)</description>
    <group>ticket_automation,n8n_webhook</group>
  </rule>

  <!-- n8n Webhook: Enrich with NetBox Data -->
  <rule id="230010" level="5">
    <decoded_as>json</decoded_as>
    <field name="agent.ip">.*</field>
    <field name="rule.level">[7-9]|1[0-5]</field>
    <description>N8N WEBHOOK: Enrich alert with NetBox asset data - IP: $(agent.ip)</description>
    <group>asset_enrichment,n8n_webhook</group>
  </rule>

  <!-- n8n Webhook: Notify Teams/Slack -->
  <rule id="230020" level="10">
    <decoded_as>json</decoded_as>
    <field name="rule.level">1[0-5]</field>
    <description>N8N WEBHOOK: Send notification to Teams/Slack - $(rule.description)</description>
    <group>notification,n8n_webhook</group>
  </rule>

  <!-- n8n Webhook: Update Asset Status -->
  <rule id="230030" level="7">
    <if_sid>220000,220030</if_sid>
    <description>N8N WEBHOOK: Update NetBox asset status to 'compromised' - $(agent.name)</description>
    <group>asset_management,n8n_webhook</group>
  </rule>

  <!-- n8n Webhook: Scheduled Vulnerability Scan Report -->
  <rule id="230040" level="3">
    <decoded_as>json</decoded_as>
    <field name="event_type">scheduled_report</field>
    <field name="report_type">vulnerability_scan</field>
    <description>N8N WEBHOOK: Generate and send vulnerability scan report</description>
    <group>reporting,n8n_webhook</group>
  </rule>

</group>
```

---

## 🔄 **Configuração de Integrações**

### **ossec.conf - Configuração para Shuffle**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <integration>
    <name>shuffle</name>
    <hook_url>https://shuffler.io/api/v1/hooks/webhook_YOUR_WORKFLOW_ID</hook_url>
    <api_key>YOUR_SHUFFLE_API_KEY</api_key>
    <level>10</level>
    <rule_id>220000,220010,220020,220030,220040,220050</rule_id>
    <alert_format>json</alert_format>
    <options>
      <retry_attempts>3</retry_attempts>
      <retry_interval>30</retry_interval>
      <timeout>10</timeout>
    </options>
  </integration>
</ossec_config>
```

### **ossec.conf - Configuração para n8n**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <integration>
    <name>webhook</name>
    <hook_url>https://n8n.empresa.com/webhook/wazuh-alerts</hook_url>
    <level>7</level>
    <rule_id>230000,230010,230020,230030,230040</rule_id>
    <alert_format>json</alert_format>
    <options>
      <retry_attempts>3</retry_attempts>
      <retry_interval>15</retry_interval>
      <timeout>5</timeout>
    </options>
  </integration>

  <!-- Webhook específico para Odoo ticketing -->
  <integration>
    <name>webhook</name>
    <hook_url>https://n8n.empresa.com/webhook/odoo-ticketing</hook_url>
    <level>8</level>
    <rule_id>210010,210011,210020,210021</rule_id>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

### **ossec.conf - Hot Reload (Novo em 4.12)**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <global>
    <!-- Hot reload rules/decoders without restart -->
    <rule_reload>yes</rule_reload>
    <decoder_reload>yes</decoder_reload>

    <!-- Reload interval (seconds) -->
    <reload_interval>300</reload_interval>

    <!-- Notify on reload -->
    <reload_notification>yes</reload_notification>
  </global>
</ossec_config>
```

---

## 🎯 **Exemplos de Payloads**

### **Payload Shuffle (Malware Response)**

```json
{
  "timestamp": "2025-12-05T10:30:15.123Z",
  "rule": {
    "id": "220000",
    "level": 12,
    "description": "SHUFFLE TRIGGER: Malware detected",
    "groups": ["malware", "automated_response", "shuffle_workflow"]
  },
  "agent": {
    "id": "001",
    "name": "web-server-01",
    "ip": "192.168.1.100"
  },
  "data": {
    "file_path": "/tmp/malicious.exe",
    "file_hash": "a1b2c3d4e5f6...",
    "detection_method": "signature"
  },
  "workflow": {
    "name": "malware_response",
    "actions": [
      "quarantine_host",
      "collect_forensics",
      "create_odoo_ticket",
      "notify_soc"
    ]
  }
}
```

### **Payload n8n (Odoo Ticketing)**

```json
{
  "timestamp": "2025-12-05T10:30:15.123Z",
  "alert_id": "wazuh-alert-12345",
  "rule": {
    "id": "230000",
    "description": "Security alert requires ticket"
  },
  "agent": {
    "name": "db-server-02",
    "ip": "192.168.1.200"
  },
  "netbox_asset": {
    "id": 42,
    "name": "db-server-02",
    "criticality": "high",
    "site": "datacenter-01",
    "tenant": "production"
  },
  "odoo_ticket": {
    "project": "Security Operations",
    "priority": "high",
    "title": "[WAZUH] Security alert on db-server-02",
    "description": "Automated ticket from Wazuh alert",
    "assignee": "soc-team@empresa.com"
  }
}
```

---

## 📊 **Dashboard de Regras Customizadas**

### **Kibana/OpenSearch Visualization**

```json
{
  "dashboard": "NEO Stack Custom Rules",
  "visualizations": [
    {
      "title": "Top Triggered Custom Rules",
      "type": "bar",
      "query": "rule.id:20* OR rule.id:21* OR rule.id:22* OR rule.id:23*",
      "aggregation": "terms",
      "field": "rule.id",
      "size": 10
    },
    {
      "title": "SOAR Triggers (Shuffle/n8n)",
      "type": "pie",
      "query": "rule.groups:shuffle_workflow OR rule.groups:n8n_webhook",
      "aggregation": "terms",
      "field": "rule.groups"
    },
    {
      "title": "Auto-Created Odoo Tickets",
      "type": "metric",
      "query": "rule.id:210010",
      "aggregation": "count"
    }
  ]
}
```

---

## 🧪 **Testes de Regras**

### **Script de Teste**

```bash
#!/bin/bash
# test-neo-rules.sh

# Testar regra NetBox authentication
/var/ossec/bin/wazuh-logtest << EOF
{"service":"netbox","event_type":"authentication_failure","srcip":"192.168.1.50","user":"attacker"}
EOF

# Testar regra Odoo brute force
for i in {1..6}; do
  /var/ossec/bin/wazuh-logtest << EOF
{"service":"odoo","event_type":"login_failed","srcip":"203.0.113.45","user":"admin"}
EOF
  sleep 1
done

# Testar regra malware com trigger Shuffle
/var/ossec/bin/wazuh-logtest << EOF
{"rule":{"groups":"malware","level":12},"agent":{"name":"test-host"},"data":{"file_path":"/tmp/virus.exe"}}
EOF

# Verificar hot reload
echo "Testando hot reload..."
/var/ossec/bin/wazuh-control reload rules
```

---

## 📚 **Referências**

### **Documentação Oficial**
- [Wazuh Rules Syntax](https://documentation.wazuh.com/current/user-manual/ruleset/rules-classification.html)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Shuffle Documentation](https://shuffler.io/docs)
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

### **Compliance Frameworks**
- PCI-DSS v4.0
- GDPR (EU Regulation 2016/679)
- LGPD (Lei 13.709/2018)
- NIST Cybersecurity Framework v1.1

---

## 🔐 **Boas Práticas**

1. **Sempre testar regras** antes de production com `wazuh-logtest`
2. **Documentar cada regra** com description clara
3. **Usar MITRE ATT&CK IDs** para mapeamento de táticas
4. **Configurar timeframes** adequados para frequency rules
5. **Implementar hot reload** para mudanças sem downtime
6. **Monitorar performance** das regras (overhead)
7. **Versionamento** de regras no Git
8. **Backup regular** de `/var/ossec/etc/rules/`

---

## 🎓 **Próximos Passos**

1. Implementar regras → [Guia de Instalação](../02-installation/)
2. Configurar Shuffle → [Integração Shuffle](../integrations/shuffle.md)
3. Configurar n8n → [Integração n8n](../integrations/n8n.md)
4. Configurar Odoo → [Integração Odoo](../integrations/odoo.md)

---

**Status: ✅ Regras NEO Stack v2.0 | XML completo | SOAR ready | Hot reload | Production-ready**
