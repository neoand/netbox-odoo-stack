# Integración Shuffle con Wazuh

> **AI Context**: Configuración completa de la integración Wazuh → Shuffle SOAR. Incluye ossec.conf, formato webhook, filtros por rule_level/rule_groups y troubleshooting. Stack: Wazuh Manager → Shuffle webhook → respuesta automatizada. Keywords: Wazuh Shuffle integration, webhook configuration, ossec.conf, alert filtering, SOAR automation.

## Descripción General

Esta integración permite que el **Wazuh Manager** envíe alertas automáticamente al **Shuffle SOAR** a través de webhook HTTP, disparando flujos de trabajo de respuesta a incidentes.

### Flujo de Integración

```
┌──────────────────┐
│  Wazuh Manager   │
│                  │
│  1. Detecta      │
│     alerta       │
│                  │
│  2. Filtra       │
│     (rule_level, │
│      groups)     │
│                  │
│  3. Formatea JSON│
└────────┬─────────┘
         │ HTTP POST
         │
         ▼
┌──────────────────┐
│  Shuffle Webhook │
│                  │
│  4. Recibe alert │
│                  │
│  5. Parsea JSON  │
│                  │
│  6. Ejecuta      │
│     workflow     │
└────────┬─────────┘
         │
         ├──► NetBox (enrichment)
         │
         └──► Odoo (ticket)
```

## Prerrequisitos

### En Wazuh Manager

```bash
# Verificar conectividad
curl -X POST http://shuffle-host:3001/api/v1/hooks/webhook_test \
  -H "Content-Type: application/json" \
  -d '{"test": "connection"}'

# Verificar versión Wazuh (4.5+)
/var/ossec/bin/wazuh-control info
```

### En Shuffle

1. ✅ Shuffle instalado y ejecutándose ([guía de configuración](setup.md))
2. ✅ Workflow creado con trigger **Webhook**
3. ✅ URL del webhook copiada (ej: `http://shuffle:3001/api/v1/hooks/webhook_abc123`)

## Configuración de Wazuh

### 1. Editar ossec.conf

```bash
# Editar configuración
sudo nano /var/ossec/etc/ossec.conf
```

Agregar bloque de integración:

```xml
<ossec_config>
  <!-- SHUFFLE SOAR INTEGRATION -->
  <integration>
    <name>shuffle</name>
    <hook_url>http://shuffle.neoand.local:3001/api/v1/hooks/webhook_abc123def456</hook_url>
    <level>7</level>
    <rule_id>554,555,5712,5710,5503</rule_id>
    <alert_format>json</alert_format>
    <options>{"data": "alert", "use_geoip": true}</options>
  </integration>

  <!-- RESPALDO: En caso de que Shuffle no esté disponible -->
  <integration>
    <name>custom-webhook</name>
    <hook_url>http://backup-soar.neoand.local:8080/wazuh</hook_url>
    <level>10</level>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

### 2. Parámetros de Integración

| Parámetro | Descripción | Ejemplo |
|-----------|-----------|---------|
| `<name>` | Nombre de la integración (fijo) | `shuffle` |
| `<hook_url>` | URL completa del webhook Shuffle | `http://shuffle:3001/api/v1/hooks/webhook_xyz` |
| `<level>` | Nivel mínimo de alerta (0-15) | `7` (medio), `10` (crítico) |
| `<rule_id>` | IDs específicos (CSV) | `554,5712,5710` |
| `<group>` | Grupos de reglas | `syscheck,ossec` |
| `<alert_format>` | Formato de payload | `json` (predeterminado) |
| `<options>` | Opciones adicionales (JSON) | `{"use_geoip": true}` |

### 3. Filtros Avanzados

#### Por Nivel de Severidad

```xml
<!-- Solo alertas críticas -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_critical</hook_url>
  <level>12</level>  <!-- Nivel 12-15 -->
</integration>
```

**Niveles Wazuh**:
- `0-3`: Informativo
- `4-6`: Bajo
- `7-9`: Medio
- `10-12`: Alto
- `13-15`: Crítico

#### Por Grupo de Reglas

```xml
<!-- Solo ataques de red -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_network</hook_url>
  <level>5</level>
  <group>attack,ids</group>
</integration>

<!-- Solo cambios de archivos -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_fim</hook_url>
  <group>syscheck</group>
</integration>
```

**Grupos comunes**:
- `attack`: Ataques detectados
- `ids`: Detección de intrusión
- `syscheck`: Monitoreo de Integridad de Archivos
- `rootcheck`: Detección de rootkits
- `malware`: Malware detectado
- `authentication_failed`: Fallas de autenticación
- `vulnerability-detector`: CVEs

#### Por Rule ID Específico

```xml
<!-- Malware, brute force, escalación de privilegios -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_security</hook_url>
  <rule_id>554,555,5712,5710,40111</rule_id>
</integration>
```

**Rule IDs críticos**:
| Rule ID | Descripción |
|---------|-----------|
| 554 | Malware detectado (rootcheck) |
| 555 | Rootkit detectado |
| 5712 | Brute force SSH (múltiples intentos) |
| 5710 | Autenticación SSH exitosa (posible brute force) |
| 5503 | Brute force PAM (Linux) |
| 40111 | Vulnerabilidad crítica (CVE) |
| 60103 | Vulnerabilidad alta |

#### Combinando Filtros

```xml
<!-- Alertas medias+ de malware Y ataques -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_combined</hook_url>
  <level>7</level>
  <group>malware,attack</group>
</integration>
```

### 4. Opciones Adicionales

```xml
<options>
  {
    "data": "alert",           # Incluir datos completos de la alerta
    "use_geoip": true,         # Enriquecer con geolocalización
    "custom_alert": {
      "organization": "NeoAnd",
      "environment": "production"
    }
  }
</options>
```

### 5. Validar y Aplicar Configuración

```bash
# Validar sintaxis XML
sudo /var/ossec/bin/wazuh-control configcheck

# Reiniciar Wazuh Manager
sudo systemctl restart wazuh-manager

# Verificar logs de integración
sudo tail -f /var/ossec/logs/integrations.log
```

## Formato del Payload JSON

### Estructura Completa

```json
{
  "timestamp": "2025-12-05T14:32:10.123-0300",
  "rule": {
    "level": 12,
    "description": "Malware detected (rootcheck)",
    "id": "554",
    "firedtimes": 3,
    "mail": true,
    "groups": ["malware", "rootcheck"],
    "pci_dss": ["11.4"],
    "gdpr": ["IV_35.7.d"]
  },
  "agent": {
    "id": "001",
    "name": "web-server-01",
    "ip": "192.168.1.50"
  },
  "manager": {
    "name": "wazuh-manager"
  },
  "id": "1701788730.123456",
  "full_log": "/var/www/uploads/malware.php contains malicious code",
  "decoder": {
    "name": "rootcheck"
  },
  "data": {
    "file": "/var/www/uploads/malware.php",
    "title": "PHP webshell detected"
  },
  "location": "rootcheck",
  "GeoLocation": {
    "city_name": "São Paulo",
    "country_name": "Brazil",
    "location": {
      "lat": -23.55,
      "lon": -46.63
    }
  }
}
```

### Campos Importantes

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-----------|---------|
| `rule.id` | string | ID de la regla disparada | `"554"` |
| `rule.level` | int | Severidad (0-15) | `12` |
| `rule.description` | string | Descripción de la alerta | `"Malware detected"` |
| `rule.groups[]` | array | Categorías de la alerta | `["malware", "rootcheck"]` |
| `agent.id` | string | ID del agente Wazuh | `"001"` |
| `agent.name` | string | Hostname del agente | `"web-server-01"` |
| `agent.ip` | string | IP del agente | `"192.168.1.50"` |
| `data.*` | object | Datos específicos de la regla | `{"file": "/path"}` |
| `GeoLocation.*` | object | Geolocalización del IP | `{"country": "BR"}` |

## Configuración del Workflow Shuffle

### 1. Crear Workflow "Wazuh Alert Handler"

#### Trigger: Webhook

```json
{
  "name": "wazuh_webhook",
  "type": "WEBHOOK",
  "id": "trigger_1"
}
```

**URL generada**:
```
http://shuffle.neoand.local:3001/api/v1/hooks/webhook_abc123def456
```

### 2. Agregar Action: Parse Alert

```json
{
  "name": "Parse Wazuh Alert",
  "app_name": "Shuffle Tools",
  "app_version": "1.2.0",
  "action": "execute_python",
  "parameters": [
    {
      "name": "code",
      "value": "import json\n\n# Ejecutar trigger\nalert = json.loads($webhook.#.body$)\n\n# Extraer campos importantes\nresult = {\n    'rule_id': alert['rule']['id'],\n    'rule_level': alert['rule']['level'],\n    'description': alert['rule']['description'],\n    'agent_name': alert['agent']['name'],\n    'agent_ip': alert['agent']['ip'],\n    'timestamp': alert['timestamp'],\n    'full_log': alert.get('full_log', '')\n}\n\nprint(json.dumps(result))"
    }
  ]
}
```

### 3. Agregar Condition: Filtrar Severidad

```json
{
  "name": "Check Severity",
  "app_name": "Shuffle Tools",
  "app_version": "1.2.0",
  "action": "filter_list",
  "parameters": [
    {
      "name": "list",
      "value": "$parse_alert.rule_level$"
    },
    {
      "name": "field",
      "value": "rule_level"
    },
    {
      "name": "check",
      "value": ">="
    },
    {
      "name": "value",
      "value": "10"
    }
  ],
  "branches": {
    "true": "create_ticket",
    "false": "log_only"
  }
}
```

### 4. Probar Workflow

```bash
# Enviar alerta de prueba
curl -X POST http://shuffle.neoand.local:3001/api/v1/hooks/webhook_abc123 \
  -H "Content-Type: application/json" \
  -d '{
  "timestamp": "2025-12-05T14:32:10.123-0300",
  "rule": {
    "level": 12,
    "description": "Malware detected - TEST",
    "id": "554",
    "groups": ["malware"]
  },
  "agent": {
    "id": "001",
    "name": "test-server",
    "ip": "192.168.1.99"
  },
  "full_log": "TEST: Malware simulation"
}'
```

**Verificar ejecución**:
1. Shuffle UI → Workflows → Wazuh Alert Handler
2. Tab **Executions**
3. Verificar status: `FINISHED` (éxito) o `FAILED` (error)

## Pruebas de Integración

### Prueba 1: Regla SSH Brute Force

```bash
# En el agente Wazuh, generar intentos SSH fallidos
for i in {1..10}; do
  ssh invalid_user@localhost
done

# Verificar alerta en Wazuh
sudo tail -f /var/ossec/logs/alerts/alerts.json | grep 5712

# Verificar recepción en Shuffle
docker logs shuffle-backend | grep webhook
```

### Prueba 2: Monitoreo de Integridad de Archivos

```bash
# En el agente, modificar archivo monitoreado
echo "prueba" | sudo tee -a /etc/passwd

# Wazuh detectará el cambio (rule 550)
sudo tail -f /var/ossec/logs/alerts/alerts.json | grep 550

# Shuffle debe recibir webhook
```

### Prueba 3: Detección de Malware (Simulado)

```bash
# Crear archivo de prueba EICAR (no es malware real)
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > /tmp/eicar.txt

# Wazuh puede detectar vía rootcheck
sudo /var/ossec/bin/rootcheck -d

# Verificar alerta
sudo tail -f /var/ossec/logs/alerts/alerts.json | grep -i eicar
```

## Troubleshooting

### Problema: Webhook no recibe alertas

**Diagnóstico**:
```bash
# 1. Verificar logs de integración Wazuh
sudo tail -f /var/ossec/logs/integrations.log
# Buscar errores de conexión

# 2. Probar conectividad
sudo curl -X POST http://shuffle:3001/api/v1/hooks/webhook_xyz \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 3. Verificar si integración está activa
sudo grep -A 10 "<integration>" /var/ossec/etc/ossec.conf
```

**Soluciones**:
- Verificar firewall: `sudo iptables -L | grep 3001`
- Verificar DNS: `nslookup shuffle.neoand.local`
- Verificar URL del webhook (copiar nuevamente desde Shuffle)

### Problema: Alertas duplicadas

**Síntoma**: La misma alerta se dispara múltiples veces

**Causa**: `firedtimes` incrementándose en la misma regla

**Solución**:
```xml
<!-- Agregar opción max_firedtimes -->
<integration>
  <name>shuffle</name>
  <hook_url>...</hook_url>
  <level>7</level>
  <max_log>1</max_log>  <!-- Enviar solo primera vez -->
</integration>
```

### Problema: Payload vacío en Shuffle

**Diagnóstico**:
```bash
# Verificar logs de Shuffle
docker logs shuffle-backend | grep -A 20 webhook_abc123
```

**Causa**: Formato de alerta incorrecto

**Solución**:
```xml
<!-- Garantizar formato JSON -->
<integration>
  <alert_format>json</alert_format>  <!-- NO usar 'splunk' o 'full' -->
</integration>
```

### Problema: Timeout de webhook

**Síntoma**:
```
integrations.log: ERROR: Unable to send alert to Shuffle (timeout)
```

**Solución**:
```bash
# Aumentar timeout en Wazuh (predeterminado: 5s)
# Editar /var/ossec/etc/internal_options.conf
sudo nano /var/ossec/etc/internal_options.conf

# Agregar:
integrator.timeout=15  # 15 segundos

# Reiniciar
sudo systemctl restart wazuh-manager
```

### Problema: Shuffle no parsea JSON

**Diagnóstico**:
```python
# En el workflow Shuffle, agregar debug
import json
print("Raw body:", $webhook.#.body$)
print("Type:", type($webhook.#.body$))

alert = json.loads($webhook.#.body$)
print("Parsed:", alert)
```

**Solución**: Verificar si body es string, no objeto:
```python
# Si body ya es objeto (parseado):
alert = $webhook.#.body$

# Si body es string:
alert = json.loads($webhook.#.body$)
```

## Monitoreo de la Integración

### Métricas Wazuh

```bash
# Alertas enviadas a Shuffle (últimas 24h)
sudo grep "shuffle" /var/ossec/logs/integrations.log | \
  grep "$(date +%Y/%m/%d)" | wc -l

# Tasa de éxito
sudo grep "shuffle.*successfully" /var/ossec/logs/integrations.log | wc -l
sudo grep "shuffle.*ERROR" /var/ossec/logs/integrations.log | wc -l
```

### Métricas Shuffle

```bash
# Webhooks recibidos
docker logs shuffle-backend | grep "Webhook execution" | wc -l

# Workflows ejecutados con éxito
docker logs shuffle-backend | grep "Workflow.*FINISHED" | wc -l

# Workflows con error
docker logs shuffle-backend | grep "Workflow.*FAILED" | wc -l
```

### Dashboard (Opcional)

```bash
# Exportar métricas a Prometheus
# /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: 'shuffle'
    static_configs:
      - targets: ['shuffle.neoand.local:3001']
    metrics_path: '/api/v1/metrics'
```

## Próximos Pasos

1. **[Crear Workflows Avanzados](workflows.md)**: Automatice respuestas complejas
2. **[Playbooks](../playbooks/index.md)**: Implemente respuesta a malware, brute force, etc.
3. **[Alternativa n8n](../n8n/wazuh-integration.md)**: Compare con el enfoque n8n

## Recursos Adicionales

- [Wazuh Integrations Docs](https://documentation.wazuh.com/current/user-manual/manager/manual-integration.html)
- [Shuffle Webhook Trigger](https://shuffler.io/docs/triggers#webhook)
- [Wazuh Rule IDs](https://documentation.wazuh.com/current/user-manual/ruleset/rules-classification.html)

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Probado con**: Wazuh 4.5.4, Shuffle 1.3.0
