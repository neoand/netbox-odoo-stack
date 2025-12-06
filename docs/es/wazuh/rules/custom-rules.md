# 📋 Reglas Personalizadas Wazuh - NEO Stack v2.0

> **Contexto AI**: Este archivo contiene reglas Wazuh personalizadas específicas para el stack NEO (NetBox + Odoo + Wazuh). Incluye detección de amenazas, integración con SOAR (Shuffle/n8n), y auto-ticketing en Odoo 19. Todas las reglas son XML con ejemplos completos listos para usar.

---

## 🎯 **Visión General**

Reglas personalizadas para el **NEO_NETBOX_ODOO_STACK v2.0** con enfoque en:

- Detección de amenazas específicas del stack
- Integración NetBox (enriquecimiento de contexto)
- Auto-ticketing Odoo 19
- Triggers para workflows Shuffle/n8n
- Cumplimiento LGPD/GDPR

---

## 📂 **Estructura de Reglas**

```
/var/ossec/etc/rules/
├── local_rules.xml              # Reglas generales custom
├── neo_stack_rules.xml          # Reglas específicas del NEO Stack
├── netbox_integration.xml       # Reglas de integración NetBox
├── odoo_integration.xml         # Reglas de integración Odoo
├── shuffle_triggers.xml         # Triggers para Shuffle SOAR
└── n8n_webhooks.xml             # Webhooks para n8n
```

---

## 🔥 **Reglas NEO Stack**

### **1. Detección de Anomalías NetBox**

```xml
<!-- /var/ossec/etc/rules/neo_stack_rules.xml -->
<group name="neo_stack,netbox,">

  <!-- NetBox API Authentication Failures -->
  <rule id="200000" level="0">
    <decoded_as>json</decoded_as>
    <field name="service">netbox</field>
    <description>Evento de servicio NetBox</description>
    <options>no_log</options>
  </rule>

  <rule id="200001" level="5">
    <if_sid>200000</if_sid>
    <field name="event_type">authentication_failure</field>
    <description>NetBox: Intento de autenticación fallido</description>
    <group>authentication_failed,pci_dss_10.2.4,pci_dss_10.2.5,gdpr_IV_35.7.d</group>
  </rule>

  <rule id="200002" level="10" frequency="3" timeframe="120">
    <if_matched_sid>200001</if_matched_sid>
    <same_source_ip />
    <description>NetBox: Múltiples fallos de autenticación desde la misma IP</description>
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
    <description>NetBox: Asset crítico modificado - $(asset_name)</description>
    <group>asset_management,configuration_changes</group>
  </rule>

  <rule id="200011" level="12">
    <if_sid>200010</if_sid>
    <field name="change_type">delete</field>
    <description>NetBox: Asset crítico ELIMINADO - URGENTE - $(asset_name)</description>
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
    <description>NetBox: Nueva dirección IP asignada - $(ip_address)</description>
    <group>asset_management,network_changes</group>
  </rule>

  <rule id="200021" level="10">
    <if_sid>200020</if_sid>
    <field name="assignment_method">manual</field>
    <field name="outside_business_hours">true</field>
    <description>NetBox: IP asignada manualmente fuera del horario laboral - SOSPECHOSO</description>
    <group>asset_management,suspicious_activity</group>
  </rule>

  <!-- NetBox VLAN Changes -->
  <rule id="200030" level="8">
    <if_sid>200000</if_sid>
    <field name="event_type">vlan_modified</field>
    <field name="vlan_type">production|dmz|critical</field>
    <description>NetBox: VLAN de producción modificada - $(vlan_name)</description>
    <group>network_changes,configuration_changes</group>
  </rule>

</group>
```

### **2. Integración Odoo 19**

```xml
<!-- /var/ossec/etc/rules/odoo_integration.xml -->
<group name="neo_stack,odoo,">

  <!-- Odoo Base Events -->
  <rule id="210000" level="0">
    <decoded_as>json</decoded_as>
    <field name="service">odoo</field>
    <description>Evento de servicio Odoo</description>
    <options>no_log</options>
  </rule>

  <!-- Odoo Authentication -->
  <rule id="210001" level="5">
    <if_sid>210000</if_sid>
    <field name="event_type">login_failed</field>
    <description>Odoo: Intento de login fallido - Usuario: $(user)</description>
    <group>authentication_failed,pci_dss_10.2.4</group>
  </rule>

  <rule id="210002" level="10" frequency="5" timeframe="300">
    <if_matched_sid>210001</if_matched_sid>
    <same_source_ip />
    <description>Odoo: Ataque de fuerza bruta detectado desde $(srcip)</description>
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
    <description>Odoo: Ticket de seguridad creado automáticamente desde alerta Wazuh</description>
    <group>ticket_management,automation</group>
  </rule>

  <rule id="210011" level="7">
    <if_sid>210010</if_sid>
    <field name="priority">urgent|high</field>
    <description>Odoo: Ticket de seguridad de ALTA prioridad creado - ID: $(ticket_id)</description>
    <group>ticket_management,high_priority</group>
  </rule>

  <!-- Odoo Critical Data Access -->
  <rule id="210020" level="8">
    <if_sid>210000</if_sid>
    <field name="event_type">data_access</field>
    <field name="model">res.partner|account.move|hr.employee</field>
    <field name="action">read|export</field>
    <description>Odoo: Acceso a datos críticos - Modelo: $(model) Usuario: $(user)</description>
    <group>data_access,gdpr_compliance,lgpd_compliance</group>
  </rule>

  <rule id="210021" level="12">
    <if_sid>210020</if_sid>
    <field name="action">export|download</field>
    <field name="record_count">\d{2,}</field>
    <description>Odoo: Exportación MASIVA de datos detectada - $(record_count) registros - Usuario: $(user)</description>
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
    <description>Odoo: Nuevo módulo instalado - $(module_name) por $(user)</description>
    <group>configuration_changes,security_risk</group>
  </rule>

  <rule id="210031" level="12">
    <if_sid>210030</if_sid>
    <field name="module_source">^(?!apps\.odoo\.com)</field>
    <description>Odoo: Módulo EXTERNO instalado (no oficial) - CRÍTICO</description>
    <group>malware_risk,supply_chain_attack</group>
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
    <description>TRIGGER SHUFFLE: Malware detectado en $(agent.name) - Workflow: malware_response</description>
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
    <description>TRIGGER SHUFFLE: Vulnerabilidad crítica detectada - CVE: $(vulnerability.cve) - Workflow: vuln_remediation</description>
    <mitre>
      <id>T1190</id>
    </mitre>
    <group>vulnerability,automated_remediation,shuffle_workflow</group>
  </rule>

  <!-- Trigger Shuffle Workflow: Suspicious Login -->
  <rule id="220020" level="10">
    <if_matched_sid>210002</if_matched_sid>
    <description>TRIGGER SHUFFLE: Fuerza bruta detectada - IP: $(srcip) - Workflow: block_ip</description>
    <mitre>
      <id>T1110</id>
    </mitre>
    <group>authentication_failures,automated_response,shuffle_workflow</group>
  </rule>

  <!-- Trigger Shuffle Workflow: Data Exfiltration -->
  <rule id="220030" level="12">
    <if_matched_sid>210021</if_matched_sid>
    <description>TRIGGER SHUFFLE: Exfiltración de datos detectada - Usuario: $(user) - Workflow: incident_response</description>
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
    <description>TRIGGER SHUFFLE: Violación de cumplimiento - Framework: $(compliance.framework) - Workflow: compliance_remediation</description>
    <group>compliance,automated_remediation,shuffle_workflow</group>
  </rule>

  <!-- Trigger Shuffle Workflow: NetBox Asset Deleted -->
  <rule id="220050" level="12">
    <if_matched_sid>200011</if_matched_sid>
    <description>TRIGGER SHUFFLE: Asset crítico eliminado en NetBox - Workflow: asset_recovery</description>
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
    <description>WEBHOOK N8N: Alerta de seguridad requiere ticket - $(rule.description)</description>
    <group>ticket_automation,n8n_webhook</group>
  </rule>

  <!-- n8n Webhook: Enrich with NetBox Data -->
  <rule id="230010" level="5">
    <decoded_as>json</decoded_as>
    <field name="agent.ip">.*</field>
    <field name="rule.level">[7-9]|1[0-5]</field>
    <description>WEBHOOK N8N: Enriquecer alerta con datos de asset NetBox - IP: $(agent.ip)</description>
    <group>asset_enrichment,n8n_webhook</group>
  </rule>

  <!-- n8n Webhook: Notify Teams/Slack -->
  <rule id="230020" level="10">
    <decoded_as>json</decoded_as>
    <field name="rule.level">1[0-5]</field>
    <description>WEBHOOK N8N: Enviar notificación a Teams/Slack - $(rule.description)</description>
    <group>notification,n8n_webhook</group>
  </rule>

</group>
```

---

## 🔄 **Configuración de Integraciones**

### **ossec.conf - Configuración para Shuffle**

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

### **ossec.conf - Hot Reload (Nuevo en 4.12)**

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

## 🧪 **Pruebas de Reglas**

### **Script de Prueba**

```bash
#!/bin/bash
# test-neo-rules.sh

# Probar regla NetBox authentication
/var/ossec/bin/wazuh-logtest << EOF
{"service":"netbox","event_type":"authentication_failure","srcip":"192.168.1.50","user":"attacker"}
EOF

# Probar regla Odoo brute force
for i in {1..6}; do
  /var/ossec/bin/wazuh-logtest << EOF
{"service":"odoo","event_type":"login_failed","srcip":"203.0.113.45","user":"admin"}
EOF
  sleep 1
done

# Probar regla malware con trigger Shuffle
/var/ossec/bin/wazuh-logtest << EOF
{"rule":{"groups":"malware","level":12},"agent":{"name":"test-host"},"data":{"file_path":"/tmp/virus.exe"}}
EOF

# Verificar hot reload
echo "Probando hot reload..."
/var/ossec/bin/wazuh-control reload rules
```

---

## 🔐 **Mejores Prácticas**

1. **Siempre probar reglas** antes de producción con `wazuh-logtest`
2. **Documentar cada regla** con description clara
3. **Usar MITRE ATT&CK IDs** para mapeo de tácticas
4. **Configurar timeframes** adecuados para frequency rules
5. **Implementar hot reload** para cambios sin downtime
6. **Monitorear performance** de las reglas (overhead)
7. **Versionamiento** de reglas en Git
8. **Backup regular** de `/var/ossec/etc/rules/`

---

## 🎓 **Próximos Pasos**

1. Implementar reglas → [Guía de Instalación](../02-installation/)
2. Configurar Shuffle → [Integración Shuffle](../integrations/shuffle.md)
3. Configurar n8n → [Integración n8n](../integrations/n8n.md)
4. Configurar Odoo → [Integración Odoo](../integrations/odoo.md)

---

**Estado: ✅ Reglas NEO Stack v2.0 | XML completo | SOAR ready | Hot reload | Production-ready**
