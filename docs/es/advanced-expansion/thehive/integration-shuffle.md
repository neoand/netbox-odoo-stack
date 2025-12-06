# Integración TheHive con Shuffle (SOAR)

## Resumen Ejecutivo

Esta guía detalla la integración completa entre **TheHive** y **Shuffle** para automatizar la respuesta a incidentes de seguridad, desde la recepción de alertas de Wazuh hasta la creación, enriquecimiento y cierre automático de casos.

!!! info "AI Context"
    Shuffle es la plataforma SOAR (Security Orchestration, Automation and Response) que orquesta el flujo: **Wazuh (Detección) → Shuffle (Orquestación) → TheHive (Gestión) → Cortex (Análisis) → Acciones de Respuesta**. Esta integración reduce el tiempo de respuesta de horas a minutos.

---

## Visión General de la Integración

### Flujo Completo: Wazuh → Shuffle → TheHive

```mermaid
sequenceDiagram
    participant W as Wazuh Manager
    participant S as Shuffle
    participant T as TheHive
    participant C as Cortex
    participant F as Firewall
    participant E as EDR
    participant O as Odoo

    W->>S: Alerta: Brute Force SSH
    Note over S: Workflow triggered
    S->>S: Parse alerta Wazuh
    S->>T: Crear caso en TheHive
    T-->>S: Case ID: ~12345

    S->>T: Agregar observables (IP atacante)
    T->>C: Analizar IP con Cortex
    C->>C: VirusTotal, AbuseIPDB, Shodan
    C-->>T: IP maliciosa (95% confidence)

    alt IP maliciosa confirmada
        S->>F: Bloquear IP en firewall
        F-->>S: IP bloqueada exitosamente
        S->>T: Agregar comment: "IP bloqueada"
        S->>T: Update case severity → High
    else IP legítima (false positive)
        S->>T: Agregar comment: "False positive"
        S->>T: Close case como FalsePositive
    end

    S->>E: Verificar si host interno comprometido
    alt Host comprometido
        S->>E: Aislar endpoint
        S->>O: Crear ticket de remediación
        O-->>S: Ticket #TKT-456 creado
        S->>T: Link ticket en caso
    end

    S->>S: Send notification (Slack/Email)
    S->>T: Update timeline
```

### Beneficios de la Integración

| Sin Automatización | Con Shuffle + TheHive |
|--------------------|----------------------|
| Analista revisa 500+ alertas/día manualmente | Shuffle filtra y prioriza automáticamente |
| Crear caso manualmente (5-10 min) | Caso creado en <5 segundos |
| Buscar IOCs en múltiples fuentes (15-30 min) | Enriquecimiento automático via Cortex |
| Coordinar bloqueo con Networking (30-60 min) | Bloqueo automático en <1 minuto |
| Documentación inconsistente | Timeline completo y auditable |
| MTTR (Mean Time to Respond): 2-4 horas | MTTR: 5-15 minutos |

---

## Configuración de API Keys

### 1. Obtener API Key de TheHive

#### Método 1: Crear Usuario Dedicado para Shuffle

```bash
# Via API (desde un usuario admin existente)
curl -X POST https://thehive.example.com/api/v1/user \
  -H "Authorization: Bearer ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "shuffle-integration@thehive.local",
    "name": "Shuffle SOAR Integration",
    "profile": "analyst",
    "password": "TempPassword123!Change"
  }'

# Respuesta incluye user ID
# {
#   "_id": "~user123",
#   "login": "shuffle-integration@thehive.local",
#   ...
# }
```

#### Método 2: Crear API Key para Usuario

```bash
# Login en TheHive UI como admin
# 1. Ir a Admin → Users
# 2. Click en usuario "shuffle-integration"
# 3. Ir a pestaña "API Keys"
# 4. Click "Create API Key"
# 5. Name: "Shuffle Production"
# 6. Expiration: 365 days (o "Never" para producción)
# 7. Click "Create"

# TheHive mostrará la API Key UNA SOLA VEZ:
# API_KEY: "rT4ndom+Gener4ted+API+K3y+DoNotShare=="

# ⚠️ IMPORTANTE: Copiar y guardar en password manager
```

#### Verificar API Key

```bash
# Test de conectividad
curl -X GET https://thehive.example.com/api/v1/user/current \
  -H "Authorization: Bearer rT4ndom+Gener4ted+API+K3y+DoNotShare=="

# Respuesta esperada:
# {
#   "_id": "~user123",
#   "login": "shuffle-integration@thehive.local",
#   "name": "Shuffle SOAR Integration",
#   "profile": "analyst"
# }
```

### 2. Configurar TheHive en Shuffle

#### Paso 1: Agregar App "TheHive" en Shuffle

```
1. Login en Shuffle: https://shuffle.example.com
2. Ir a "Apps"
3. Search "TheHive"
4. Click "Activate" en "TheHive 5.x"
5. Version: 1.2.0 (o más reciente)
```

#### Paso 2: Crear Authentication

```yaml
1. En Shuffle, ir a "Settings" → "App Authentication"
2. Click "+ NEW AUTHENTICATION"

Authentication Details:
  App: TheHive
  Label: TheHive Production
  Authentication:
    - API URL: https://thehive.example.com
    - API Key: rT4ndom+Gener4ted+API+K3y+DoNotShare==
    - Organization: [Dejar vacío para default]
    - Version: 5

3. Click "Test Authentication"
   → Shuffle intentará listar casos

4. Si exitoso: "✓ Authentication successful"
5. Click "SUBMIT"
```

### 3. Obtener Webhook de Shuffle

#### Crear Workflow con Webhook Trigger

```
1. En Shuffle, click "+ NEW WORKFLOW"
2. Name: "Wazuh to TheHive - Auto Case Creation"
3. Description: "Automatically creates TheHive cases from Wazuh alerts"

4. Agregar nodo "Webhook"
   - Drag & drop "Webhook" desde sidebar
   - Name: "Wazuh Alert Webhook"
   - Method: POST
   - Click "START"

5. Copiar Webhook URL:
   https://shuffle.example.com/api/v1/hooks/webhook_550e8400-e29b-41d4-a716-446655440000
```

!!! danger "Seguridad de Webhook"
    El webhook está desprotegido por defecto. Para producción, implementa una de estas medidas:

    **Opción 1: API Key en Header**
    ```bash
    # Configurar en Shuffle webhook node:
    Authorization Header: Bearer SecureRandomToken123

    # Wazuh debe enviar:
    curl -X POST https://shuffle.example.com/api/v1/hooks/webhook_XXX \
      -H "Authorization: Bearer SecureRandomToken123" \
      -d @alert.json
    ```

    **Opción 2: IP Whitelisting**
    ```nginx
    # En Nginx reverse proxy de Shuffle:
    location /api/v1/hooks/ {
        allow 10.0.1.50;  # IP de Wazuh Manager
        deny all;
        proxy_pass http://shuffle:3001;
    }
    ```

---

## Creación Automática de Casos via Shuffle

### Workflow 1: Alerta Simple de Wazuh

#### Configuración de Wazuh Integration

```xml
<!-- /var/ossec/etc/ossec.conf en Wazuh Manager -->
<integration>
  <name>shuffle</name>
  <hook_url>https://shuffle.example.com/api/v1/hooks/webhook_550e8400-e29b-41d4-a716-446655440000</hook_url>
  <level>7</level> <!-- Enviar solo alertas level 7+ -->
  <alert_format>json</alert_format>
  <options>
    {
      "authentication": "Bearer SecureRandomToken123"
    }
  </options>
</integration>

<!-- Reiniciar Wazuh -->
<!-- systemctl restart wazuh-manager -->
```

#### Workflow de Shuffle

```yaml
Nodes:

1. [WEBHOOK] Wazuh Alert Webhook
   ↓
2. [CONDITION] Check Alert Severity
   - IF rule.level >= 10 → Create Case (Critical)
   - ELSE IF rule.level >= 7 → Create Case (High)
   - ELSE → Skip
   ↓
3. [THEHIVE] Create Case
   ↓
4. [THEHIVE] Add Observables
   ↓
5. [SHUFFLE TOOLS] Send Notification
```

#### Nodo 2: Condition (Filtro de Severidad)

```javascript
// Shuffle Liquid syntax
const alert = $exec.execution_argument;
const level = alert.rule.level;

if (level >= 12) {
  return {
    "severity": 4,  // Critical
    "tlp": 2,       // AMBER
    "priority": "P1"
  }
} else if (level >= 10) {
  return {
    "severity": 3,  // High
    "tlp": 1,       // GREEN
    "priority": "P2"
  }
} else if (level >= 7) {
  return {
    "severity": 2,  // Medium
    "tlp": 1,       // GREEN
    "priority": "P3"
  }
}
```

#### Nodo 3: TheHive - Create Case

```json
{
  "title": "Wazuh Alert: {{ $exec.execution_argument.rule.description }}",
  "description": "# Wazuh Alert Details\n\n**Rule ID:** {{ $exec.execution_argument.rule.id }}\n**Level:** {{ $exec.execution_argument.rule.level }}\n**Agent:** {{ $exec.execution_argument.agent.name }} ({{ $exec.execution_argument.agent.ip }})\n**Timestamp:** {{ $exec.execution_argument.timestamp }}\n\n## Full Description\n{{ $exec.execution_argument.rule.description }}\n\n## Log Data\n```\n{{ $exec.execution_argument.full_log }}\n```\n\n## Recommended Actions\n{{ $exec.execution_argument.rule.info }}",
  "severity": "{{ $condition.result.severity }}",
  "tlp": "{{ $condition.result.tlp }}",
  "pap": 2,
  "tags": [
    "wazuh",
    "rule-{{ $exec.execution_argument.rule.id }}",
    "{{ $condition.result.priority }}",
    "auto-created"
  ],
  "customFields": {
    "wazuhRuleId": "{{ $exec.execution_argument.rule.id }}",
    "wazuhAgentName": "{{ $exec.execution_argument.agent.name }}",
    "wazuhAgentIp": "{{ $exec.execution_argument.agent.ip }}"
  }
}
```

**Variables de Shuffle:**

- `$exec.execution_argument`: Payload completo del webhook
- `$condition.result`: Output del nodo anterior
- `$thehive_create_case.success.id`: Case ID retornado por TheHive

#### Nodo 4: TheHive - Add Observables

```javascript
// Shuffle JavaScript execution node

const alert = $exec.execution_argument;
const caseId = $thehive_create_case.success.id;
const observables = [];

// Extraer IP de atacante si existe
if (alert.data && alert.data.srcip) {
  observables.push({
    "dataType": "ip",
    "data": alert.data.srcip,
    "tlp": 2,
    "ioc": true,
    "sighted": true,
    "tags": ["attacker-ip", "wazuh"],
    "message": "Source IP from Wazuh alert"
  });
}

// Extraer hash de archivo si existe
if (alert.data && alert.data.sha256) {
  observables.push({
    "dataType": "hash",
    "data": alert.data.sha256,
    "tlp": 2,
    "ioc": true,
    "sighted": true,
    "tags": ["file-hash", "wazuh"],
    "message": "SHA256 hash from Wazuh FIM"
  });
}

// Extraer hostname
if (alert.agent && alert.agent.name) {
  observables.push({
    "dataType": "other",
    "data": alert.agent.name,
    "tlp": 1,
    "ioc": false,
    "sighted": true,
    "tags": ["affected-host"],
    "message": "Agent hostname"
  });
}

return {
  "caseId": caseId,
  "observables": observables
};
```

**Luego, usar nodo TheHive "Add Observable" en loop:**

```
FOR EACH observable IN $extract_observables.observables
  TheHive.AddObservable(
    caseId: $extract_observables.caseId,
    observable: $item
  )
```

### Workflow 2: Enriquecimiento con Cortex

#### Agregar Análisis Automático

```yaml
Workflow Extended:

3. [THEHIVE] Create Case
   ↓
4. [THEHIVE] Add Observables
   ↓
5. [CONDITION] Check Observable Type
   - IF dataType == "ip" → Analyze with Cortex
   - IF dataType == "hash" → Analyze with Cortex
   - IF dataType == "domain" → Analyze with Cortex
   ↓
6. [CORTEX] Run Analyzers
   - VirusTotal_GetReport_3_0
   - AbuseIPDB_1_0
   - Shodan_Info_1_0
   ↓
7. [CONDITION] Parse Results
   - IF malicious → Update case severity
   - IF benign → Mark as false positive
   ↓
8. [THEHIVE] Add Analysis Results as Comment
```

#### Nodo 6: Cortex - Run Analyzer

```json
{
  "analyzerId": "VirusTotal_GetReport_3_0",
  "artifactId": "{{ $thehive_add_observable.success.id }}",
  "cortexId": "local-cortex"
}
```

!!! warning "Cortex API Key Requerida"
    Asegúrate de configurar authentication para Cortex en Shuffle:

    ```
    Settings → App Authentication → Cortex
    - API URL: https://cortex.example.com
    - API Key: [Cortex API Key]
    ```

#### Nodo 7: Condition - Parse Cortex Results

```javascript
// Shuffle JavaScript
const cortexResults = $cortex_run_analyzer.success.report;
const summary = cortexResults.summary;

let isMalicious = false;
let confidence = 0;

// Parsear resultados de VirusTotal
if (summary.taxonomies) {
  for (const taxonomy of summary.taxonomies) {
    if (taxonomy.namespace === "VT" && taxonomy.predicate === "malicious") {
      isMalicious = true;
      const parts = taxonomy.value.split("/");
      const detected = parseInt(parts[0]);
      const total = parseInt(parts[1]);
      confidence = (detected / total) * 100;
    }
  }
}

return {
  "isMalicious": isMalicious,
  "confidence": confidence,
  "verdict": isMalicious ? "MALICIOUS" : "CLEAN",
  "actionRequired": confidence > 50
};
```

---

## Workflows de Ejemplo

### Workflow 1: Brute Force SSH Detection

**Trigger:** Wazuh Rule 5720 (Multiple SSH authentication failures)

```yaml
Workflow: SSH Brute Force Response

Steps:
  1. Webhook recibe alerta de Wazuh
  2. Parse alert:
     - Attacker IP
     - Target hostname
     - Number of attempts
  3. Create case en TheHive:
     - Title: "SSH Brute Force from {{ srcip }}"
     - Severity: Medium (2)
     - TLP: GREEN (1)
  4. Add observable: IP address (IOC)
  5. Analyze IP with Cortex:
     - AbuseIPDB (reputation)
     - Shodan (reconnaissance)
  6. IF IP malicious:
     - Block IP in firewall
     - Update case severity → High
     - Notify SOC in Slack
  7. ELSE:
     - Add comment: "Possible legitimate user lockout"
     - Assign to helpdesk for verification
  8. Monitor for 1 hour:
     - IF no more attempts → Auto-close case
     - IF attempts continue → Escalate to incident
```

**Shuffle Configuration:**

```javascript
// Nodo: Parse Wazuh Alert
const alert = $exec.execution_argument;

return {
  "attackerIp": alert.data.srcip,
  "targetHost": alert.agent.name,
  "attempts": alert.data.srcuser ? alert.data.srcuser.split(",").length : 0,
  "timestamp": alert.timestamp,
  "ruleId": alert.rule.id,
  "ruleDescription": alert.rule.description
};
```

```json
// Nodo: Create Case
{
  "title": "SSH Brute Force from {{ $parse_alert.attackerIp }} → {{ $parse_alert.targetHost }}",
  "description": "# SSH Brute Force Detection\n\n**Attacker IP:** {{ $parse_alert.attackerIp }}\n**Target Host:** {{ $parse_alert.targetHost }}\n**Failed Attempts:** {{ $parse_alert.attempts }}\n**Detection Time:** {{ $parse_alert.timestamp }}\n\n## Wazuh Rule\n**ID:** {{ $parse_alert.ruleId }}\n**Description:** {{ $parse_alert.ruleDescription }}\n\n## Automatic Actions\n- ✓ IP added as observable\n- ⏳ Reputation check in progress\n- ⏳ Firewall block pending confirmation",
  "severity": 2,
  "tlp": 1,
  "tags": ["ssh", "brute-force", "auto-created"]
}
```

### Workflow 2: Malware Detection & Quarantine

**Trigger:** Wazuh Rule 550 (Windows Defender malware detected)

```yaml
Workflow: Malware Response Pipeline

Steps:
  1. Webhook recibe alerta de malware
  2. Extract:
     - Malware name
     - File hash (SHA256)
     - Affected hostname
     - File path
  3. Create case en TheHive:
     - Title: "Malware Detected: {{ malware_name }}"
     - Severity: High (3)
     - TLP: AMBER (2)
  4. Add observables:
     - Hash (SHA256)
     - Filename
     - Affected hostname
  5. Analyze hash with Cortex:
     - VirusTotal
     - Hybrid Analysis
  6. IF hash unknown (0-day?):
     - Upload sample to sandbox
     - Escalate to malware analyst
     - Increase severity → Critical
  7. ELSE IF hash known:
     - Verify quarantine successful
     - Check for lateral movement
     - Search for same hash on other endpoints
  8. Automated containment:
     - Isolate endpoint (via EDR API)
     - Block hash organization-wide
     - Revoke user session tokens
  9. Create Odoo ticket for reimaging
 10. Update case with remediation status
```

**Shuffle Implementation:**

```javascript
// Nodo: Extract Malware Info
const alert = $exec.execution_argument;
const fullLog = alert.full_log;

// Regex para extraer hash de log de Windows Defender
const hashMatch = fullLog.match(/SHA256:([A-Fa-f0-9]{64})/);
const nameMatch = fullLog.match(/ThreatName:([^\n]+)/);

return {
  "malwareName": nameMatch ? nameMatch[1].trim() : "Unknown",
  "fileHash": hashMatch ? hashMatch[1] : null,
  "hostname": alert.agent.name,
  "filePath": fullLog.match(/file:([^\n]+)/) ? fullLog.match(/file:([^\n]+)/)[1] : "Unknown"
};
```

```json
// Nodo: Search for Hash in Other Endpoints (Wazuh API)
{
  "method": "POST",
  "url": "https://wazuh.example.com/api/v4/vulnerability",
  "headers": {
    "Authorization": "Bearer {{ $wazuh_auth.token }}"
  },
  "body": {
    "hash": "{{ $extract_info.fileHash }}",
    "agents": "all"
  }
}
```

### Workflow 3: Phishing Email Response

**Trigger:** Usuario reporta email sospechoso via botón "Report Phishing"

```yaml
Workflow: Phishing Email Processing

Steps:
  1. Webhook recibe reporte de usuario
  2. Extract email data:
     - Sender address
     - Subject
     - Attachment hashes
     - URLs in body
  3. Create case en TheHive:
     - Title: "Reported Phishing: {{ subject }}"
     - Severity: Low (1) - Pending verification
     - TLP: GREEN (1)
  4. Add observables:
     - Email address (sender)
     - Domain (sender domain)
     - URLs (all links)
     - Hashes (all attachments)
  5. Analyze ALL observables with Cortex:
     - Email reputation
     - URL reputation
     - File analysis
  6. IF malicious confirmed:
     - Update severity → High
     - Purge email from ALL mailboxes
     - Block sender in email gateway
     - Search for similar emails (same sender/subject)
     - Notify affected users
  7. ELSE IF benign:
     - Update case: False positive
     - Thank reporter for vigilance
     - Close case
  8. Add findings to user's security awareness score
  9. IF multiple reports of same campaign:
     - Create organization-wide alert
     - Update email filters
```

---

## Enriquecimiento de Casos

### Agregar Contexto Automático

#### Integración con NetBox (Asset Context)

```javascript
// Shuffle node: Get Asset Info from NetBox

const hostname = $parse_alert.targetHost;

// Query NetBox API
const response = await fetch(
  `https://netbox.example.com/api/dcim/devices/?name=${hostname}`,
  {
    headers: {
      "Authorization": "Token YOUR_NETBOX_TOKEN",
      "Content-Type": "application/json"
    }
  }
);

const device = await response.json();

if (device.count > 0) {
  const assetInfo = device.results[0];

  // Add info to TheHive case
  return {
    "customFields": {
      "assetOwner": assetInfo.tenant.name,
      "assetLocation": assetInfo.site.name,
      "assetCriticality": assetInfo.custom_fields.criticality,
      "assetIp": assetInfo.primary_ip4.address,
      "maintenanceWindow": assetInfo.custom_fields.maintenance_window
    }
  };
}
```

#### Enriquecimiento con MISP (Threat Intel)

```javascript
// Shuffle node: Query MISP for IOC

const observable = $thehive_add_observable.success.data;

const mispResponse = await fetch(
  `https://misp.example.com/attributes/restSearch`,
  {
    method: "POST",
    headers: {
      "Authorization": "YOUR_MISP_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "returnFormat": "json",
      "type": "ip-dst",
      "value": observable
    })
  }
);

const results = await mispResponse.json();

if (results.response.Attribute.length > 0) {
  const attributes = results.response.Attribute;

  // Add comment to TheHive case
  let comment = "# MISP Threat Intelligence\n\n";
  comment += `Found ${attributes.length} matching attributes:\n\n`;

  for (const attr of attributes) {
    comment += `- **Event:** ${attr.Event.info}\n`;
    comment += `  - **Tags:** ${attr.Tag.map(t => t.name).join(", ")}\n`;
    comment += `  - **Timestamp:** ${attr.timestamp}\n\n`;
  }

  return {
    "caseId": $thehive_create_case.success.id,
    "comment": comment
  };
}
```

---

## Cierre Automático de Casos

### Condiciones de Auto-Cierre

```yaml
Casos que pueden cerrarse automáticamente:

1. False Positives:
   - Análisis de Cortex confirma benign (confidence > 80%)
   - Sin IOCs maliciosos encontrados
   - Zero impact on systems

2. Automated Remediation Successful:
   - IP bloqueada en firewall (confirmado)
   - Malware removido (confirmado vía EDR)
   - Usuario educated (email sent + acknowledged)

3. Duplicate Cases:
   - Mismo observable en caso existente
   - Same timestamp window (±5 min)
   - Merge en caso original, cerrar duplicado
```

### Workflow de Auto-Cierre

```javascript
// Shuffle node: Auto-Close Condition

const caseData = $thehive_get_case.success;
const analysisResults = $cortex_results;
const remediationStatus = $remediation_check;

let shouldClose = false;
let closeReason = "";

// Condition 1: False Positive
if (analysisResults.verdict === "CLEAN" && analysisResults.confidence > 80) {
  shouldClose = true;
  closeReason = "False Positive - Confirmed benign by automated analysis";
  caseData.resolutionStatus = "FalsePositive";
}

// Condition 2: Automated Remediation
if (remediationStatus.ipBlocked && remediationStatus.edRconfirmed) {
  shouldClose = true;
  closeReason = "Incident resolved - Automated remediation successful";
  caseData.resolutionStatus = "TruePositive";
}

// Condition 3: Low severity + no activity for 24h
const hoursSinceCreation = (Date.now() - caseData.createdAt) / (1000 * 3600);
if (caseData.severity === 1 && hoursSinceCreation > 24 && caseData.tasks.every(t => t.status === "Waiting")) {
  shouldClose = true;
  closeReason = "Auto-closed - Low severity, no activity for 24 hours";
  caseData.resolutionStatus = "Indeterminate";
}

if (shouldClose) {
  return {
    "caseId": caseData.id,
    "shouldClose": true,
    "resolutionStatus": caseData.resolutionStatus,
    "summary": closeReason
  };
} else {
  return {
    "shouldClose": false
  };
}
```

```json
// Nodo: Close Case in TheHive
{
  "caseId": "{{ $auto_close_condition.caseId }}",
  "status": "Resolved",
  "resolutionStatus": "{{ $auto_close_condition.resolutionStatus }}",
  "summary": "{{ $auto_close_condition.summary }}\n\n---\n\n*This case was automatically closed by Shuffle workflow.*",
  "impactStatus": "NoImpact"
}
```

---

## Dashboards y Métricas

### Métricas Exportadas a Grafana

```python
# Script Python para exportar métricas de TheHive a Prometheus

from thehive4py.api import TheHiveApi
from prometheus_client import Gauge, CollectorRegistry, push_to_gateway
import time

# Connect to TheHive
api = TheHiveApi('https://thehive.example.com', 'API_KEY')

# Prometheus metrics
registry = CollectorRegistry()
cases_total = Gauge('thehive_cases_total', 'Total cases', ['status', 'severity'], registry=registry)
cases_open_duration = Gauge('thehive_cases_open_duration_hours', 'Open case duration', ['case_id'], registry=registry)
observables_total = Gauge('thehive_observables_total', 'Total observables', ['dataType'], registry=registry)
iocs_total = Gauge('thehive_iocs_total', 'Total IOCs', registry=registry)

while True:
    # Query all cases
    response = api.find_cases(query={}, range='all')
    cases = response.json()

    # Count by status and severity
    status_counts = {}
    for case in cases:
        key = (case['status'], case['severity'])
        status_counts[key] = status_counts.get(key, 0) + 1

    for (status, severity), count in status_counts.items():
        cases_total.labels(status=status, severity=severity).set(count)

    # Calculate open case duration
    for case in cases:
        if case['status'] in ['New', 'InProgress']:
            duration_hours = (time.time() * 1000 - case['createdAt']) / (1000 * 3600)
            cases_open_duration.labels(case_id=case['_id']).set(duration_hours)

    # Push to Prometheus Pushgateway
    push_to_gateway('pushgateway:9091', job='thehive_metrics', registry=registry)

    time.sleep(300)  # Update every 5 minutes
```

### Dashboard de Shuffle Execution

```yaml
Métricas de Shuffle para Grafana:

1. Workflow Execution Rate
   - Total executions per hour
   - Success rate (%)
   - Failure rate (%)

2. Case Creation Rate
   - Cases created per hour
   - By severity
   - By source (Wazuh rule ID)

3. Response Time
   - Time from alert to case creation
   - Time from case creation to first action
   - Time from detection to remediation

4. Automation Efficiency
   - % of cases auto-resolved
   - % of cases requiring manual intervention
   - Average analyst time saved

5. Integration Health
   - TheHive API latency
   - Cortex API latency
   - Wazuh webhook delivery rate
```

---

## Troubleshooting

### Problema 1: Webhook No Recibido por Shuffle

**Síntomas:**

- Alertas de Wazuh no crean casos en TheHive
- No hay logs en Shuffle de ejecución de workflow

**Diagnóstico:**

```bash
# En Wazuh Manager, verificar logs de integración
tail -f /var/ossec/logs/integrations.log

# Buscar errores de envío
grep -i "shuffle" /var/ossec/logs/integrations.log | grep -i "error"

# Test manual del webhook
curl -X POST https://shuffle.example.com/api/v1/hooks/webhook_XXX \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Soluciones:**

1. **Firewall bloqueando:** Verificar que Wazuh Manager puede alcanzar Shuffle
   ```bash
   curl -v https://shuffle.example.com
   ```

2. **SSL Certificate issue:**
   ```xml
   <!-- En ossec.conf, agregar: -->
   <options>{"verify_ssl": false}</options>
   ```

3. **Webhook URL incorrecta:** Verificar que coincide con la de Shuffle

### Problema 2: TheHive API Error "Unauthorized"

**Síntomas:**

- Shuffle ejecuta workflow pero falla en nodo TheHive
- Error: "401 Unauthorized"

**Soluciones:**

```bash
# Verificar API Key es válida
curl -X GET https://thehive.example.com/api/v1/user/current \
  -H "Authorization: Bearer YOUR_API_KEY"

# Verificar permisos del usuario
# TheHive UI → Admin → Users → shuffle-integration
# Debe tener perfil "analyst" o "admin"
```

### Problema 3: Cortex Analysis Timeout

**Síntomas:**

- Observable agregado correctamente
- Análisis de Cortex nunca completa

**Diagnóstico:**

```bash
# En Shuffle, ver logs del nodo Cortex
# Check execution details → Cortex node → Logs

# Verificar conectividad Shuffle → Cortex
docker exec shuffle-app curl -v https://cortex.example.com/api/analyzer
```

**Soluciones:**

1. **Timeout muy corto:** Aumentar timeout en Shuffle node (default: 30s → 120s)
2. **Cortex sobrecargado:** Verificar queue de jobs en Cortex
3. **API Key incorrecta:** Reconfigurar authentication en Shuffle

---

## AI Context - Información para LLMs

```yaml
Integración: TheHive + Shuffle

Flujo Principal:
  Wazuh Alert → Shuffle Webhook → Parse Data → Create TheHive Case → Add Observables → Cortex Analysis → Automated Response

Componentes:
  - Shuffle: SOAR platform (orchestration)
  - TheHive: Case management
  - Cortex: Observable analysis
  - Wazuh: Alert source

APIs Utilizadas:
  - TheHive API: https://docs.strangebee.com/thehive/api/
  - Cortex API: https://github.com/TheHive-Project/CortexDocs
  - Wazuh API: https://documentation.wazuh.com/current/user-manual/api/

Autenticación:
  - TheHive: Bearer token (API Key)
  - Cortex: Bearer token (API Key)
  - Shuffle Webhook: Optional Bearer token o IP whitelist

Workflows Comunes:
  1. Auto Case Creation from Alerts
  2. Observable Enrichment with Threat Intel
  3. Automated Blocking (firewall/EDR)
  4. False Positive Detection
  5. Auto-closure of Resolved Cases

Métricas Clave:
  - Case Creation Rate (casos/hora)
  - MTTR (Mean Time to Respond)
  - Automation Rate (% casos auto-resueltos)
  - False Positive Rate

Troubleshooting:
  - Webhook connectivity
  - API authentication
  - Cortex analyzer timeouts
  - Data parsing errors

Files Relevantes:
  - /var/ossec/etc/ossec.conf (Wazuh integration)
  - Shuffle workflow JSON export
  - TheHive application.conf (webhook endpoints)
```

---

!!! success "Integración Completa"
    Con esta configuración, tu stack puede procesar cientos de alertas automáticamente. Continúa con:

    - **[Integración con Stack Completa](integration-stack.md)**: Conectar con MISP, Odoo, NetBox
    - **[Casos de Uso](use-cases.md)**: Implementar escenarios específicos
