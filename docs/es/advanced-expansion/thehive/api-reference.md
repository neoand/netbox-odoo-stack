# API Reference - TheHive 5.x

## Resumen Ejecutivo

Esta guía proporciona referencia completa de la API REST de TheHive 5.x, incluyendo autenticación, endpoints principales, ejemplos con curl y Python, rate limiting, y webhooks para integraciones avanzadas.

!!! info "AI Context"
    La API de TheHive 5.x es una API REST completa que permite automatización total de operaciones: crear casos, agregar observables, ejecutar análisis, gestionar usuarios, y exportar métricas. Todos los endpoints requieren autenticación via Bearer token (API Key).

---

## Autenticación en la API

### Métodos de Autenticación

TheHive 5 soporta dos métodos de autenticación para API:

| Método | Header | Formato | Uso |
|--------|--------|---------|-----|
| **API Key** | `Authorization` | `Bearer <api_key>` | Recomendado para integraciones |
| **Session Token** | `Authorization` | `Bearer <session_token>` | Para aplicaciones web |

### Crear API Key

#### Via UI

```
1. Login en TheHive
2. Click en tu perfil (esquina superior derecha)
3. Ir a "API Keys"
4. Click "+ NEW API KEY"
5. Name: "Integration with Shuffle"
6. Expiration: 365 days (o "Never")
7. Click "CREATE"
8. ⚠️ COPIAR LA KEY (solo se muestra una vez)
```

#### Via API (requiere usuario admin)

```bash
curl -X POST https://thehive.example.com/api/v1/user/analyst@thehive.local/key \
  -H "Authorization: Bearer ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "automation-script",
    "duration": "365 days"
  }'

# Respuesta:
# {
#   "key": "rT4ndom+Gener4ted+API+K3y+DoNotShare=="
# }
```

### Verificar API Key

```bash
# Test de autenticación
curl -X GET https://thehive.example.com/api/v1/user/current \
  -H "Authorization: Bearer YOUR_API_KEY"

# Respuesta exitosa:
# {
#   "_id": "~123456",
#   "login": "analyst@thehive.local",
#   "name": "Security Analyst",
#   "profile": "analyst",
#   "organization": "MyOrganization"
# }
```

### Revocar API Key

```bash
curl -X DELETE https://thehive.example.com/api/v1/key/KEY_ID \
  -H "Authorization: Bearer ADMIN_API_KEY"
```

---

## Endpoints Principales

### Base URL

```
https://thehive.example.com/api/v1
```

### Estructura de Respuestas

**Success Response:**

```json
{
  "_id": "~12345",
  "field1": "value1",
  "field2": "value2",
  ...
}
```

**Error Response:**

```json
{
  "type": "BadRequestError",
  "message": "Invalid request: field 'title' is required"
}
```

### HTTP Status Codes

| Code | Significado | Acción |
|------|-------------|--------|
| **200** | OK | Request exitoso |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Error en formato de request |
| **401** | Unauthorized | API Key inválida o expirada |
| **403** | Forbidden | Permisos insuficientes |
| **404** | Not Found | Recurso no existe |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Error del servidor |

---

## Cases (Casos)

### Crear Caso

=== "curl"

    ```bash
    curl -X POST https://thehive.example.com/api/v1/case \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Phishing Email Investigation",
        "description": "User reported suspicious email with malicious attachment",
        "severity": 2,
        "tlp": 2,
        "pap": 2,
        "tags": ["phishing", "email", "tier1"],
        "flag": false,
        "startDate": 1704067200000,
        "customFields": {
          "reportedBy": "john.doe@example.com",
          "businessUnit": "Finance"
        }
      }'

    # Respuesta:
    # {
    #   "_id": "~41287496",
    #   "number": 123,
    #   "title": "Phishing Email Investigation",
    #   "status": "New",
    #   "createdAt": 1704067200000,
    #   "createdBy": "analyst@thehive.local"
    # }
    ```

=== "Python"

    ```python
    from thehive4py.api import TheHiveApi
    from thehive4py.models import Case

    # Connect to TheHive
    api = TheHiveApi('https://thehive.example.com', 'YOUR_API_KEY')

    # Create case
    case = Case(
        title='Phishing Email Investigation',
        description='User reported suspicious email with malicious attachment',
        severity=2,  # Medium
        tlp=2,       # AMBER
        pap=2,       # AMBER
        tags=['phishing', 'email', 'tier1'],
        customFields={
            'reportedBy': 'john.doe@example.com',
            'businessUnit': 'Finance'
        }
    )

    # Send to TheHive
    response = api.create_case(case)
    case_id = response.json()['id']

    print(f"Case created: {case_id}")
    ```

### Obtener Caso por ID

=== "curl"

    ```bash
    curl -X GET https://thehive.example.com/api/v1/case/~41287496 \
      -H "Authorization: Bearer YOUR_API_KEY"

    # Respuesta incluye todos los detalles del caso
    ```

=== "Python"

    ```python
    case = api.get_case('~41287496').json()

    print(f"Title: {case['title']}")
    print(f"Status: {case['status']}")
    print(f"Severity: {case['severity']}")
    ```

### Buscar Casos

=== "curl"

    ```bash
    # Buscar casos abiertos con severity High
    curl -X POST https://thehive.example.com/api/v1/query \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "query": [
          {
            "_name": "listCase"
          },
          {
            "_name": "filter",
            "_and": [
              {
                "_field": "status",
                "_value": "InProgress"
              },
              {
                "_field": "severity",
                "_gte": 3
              }
            ]
          },
          {
            "_name": "sort",
            "_fields": [
              {"startDate": "desc"}
            ]
          },
          {
            "_name": "page",
            "from": 0,
            "to": 10
          }
        ]
      }'
    ```

=== "Python"

    ```python
    # Buscar casos con severity Critical
    query = {
        'query': {
            '_and': [
                {'status': 'InProgress'},
                {'_gte': {'severity': 3}}
            ]
        }
    }

    response = api.find_cases(query=query, range='0-10', sort=['-startDate'])
    cases = response.json()

    for case in cases:
        print(f"[{case['number']}] {case['title']} - Severity: {case['severity']}")
    ```

### Actualizar Caso

=== "curl"

    ```bash
    # Update case severity
    curl -X PATCH https://thehive.example.com/api/v1/case/~41287496 \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "severity": 4,
        "status": "InProgress"
      }'
    ```

=== "Python"

    ```python
    # Update case
    case_id = '~41287496'
    updates = {
        'severity': 4,
        'status': 'InProgress',
        'owner': 'incident-responder@thehive.local'
    }

    api.update_case(case_id, **updates)
    ```

### Cerrar Caso

=== "curl"

    ```bash
    curl -X PATCH https://thehive.example.com/api/v1/case/~41287496 \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "status": "Resolved",
        "resolutionStatus": "TruePositive",
        "summary": "Phishing confirmed and blocked. All affected users notified.",
        "impactStatus": "WithImpact"
      }'
    ```

=== "Python"

    ```python
    api.update_case(
        case_id,
        status='Resolved',
        resolutionStatus='TruePositive',
        summary='Phishing confirmed and blocked. All affected users notified.',
        impactStatus='WithImpact'
    )
    ```

---

## Observables (IOCs)

### Agregar Observable a Caso

=== "curl"

    ```bash
    curl -X POST https://thehive.example.com/api/v1/case/~41287496/observable \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "dataType": "ip",
        "data": "185.220.101.45",
        "tlp": 2,
        "ioc": true,
        "sighted": true,
        "tags": ["c2-server", "apt28"],
        "message": "C2 server identified during investigation"
      }'

    # Respuesta:
    # {
    #   "_id": "~obs123456",
    #   "dataType": "ip",
    #   "data": "185.220.101.45",
    #   "ioc": true
    # }
    ```

=== "Python"

    ```python
    from thehive4py.models import CaseObservable

    observable = CaseObservable(
        dataType='ip',
        data='185.220.101.45',
        tlp=2,
        ioc=True,
        sighted=True,
        tags=['c2-server', 'apt28'],
        message='C2 server identified during investigation'
    )

    response = api.create_case_observable(case_id, observable)
    observable_id = response.json()['id']
    ```

### Listar Observables de un Caso

=== "curl"

    ```bash
    curl -X GET https://thehive.example.com/api/v1/case/~41287496/observable \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

=== "Python"

    ```python
    observables = api.get_case_observables(case_id).json()

    for obs in observables:
        ioc_mark = "🚨" if obs['ioc'] else "ℹ️"
        print(f"{ioc_mark} {obs['dataType']}: {obs['data']}")
    ```

### Tipos de Observables Soportados

| DataType | Descripción | Ejemplo |
|----------|-------------|---------|
| `ip` | IPv4/IPv6 | `192.168.1.100`, `2001:db8::1` |
| `domain` | Nombre de dominio | `malicious-site.com` |
| `url` | URL completa | `https://evil.com/payload.exe` |
| `fqdn` | FQDN | `mail.attacker.org` |
| `mail` | Email address | `phishing@evil.com` |
| `hash` | MD5/SHA1/SHA256 | `d41d8cd98f00b204e9800998ecf8427e` |
| `filename` | Nombre de archivo | `invoice.pdf.exe` |
| `registry` | Clave de registro | `HKLM\Software\Malware` |
| `user-agent` | User-Agent HTTP | `Mozilla/5.0 (EvilBot)` |
| `autonomous-system` | ASN | `AS15169` |
| `other` | Cualquier dato | `API Key: abc123...` |

---

## Tasks (Tareas)

### Crear Task

=== "curl"

    ```bash
    curl -X POST https://thehive.example.com/api/v1/case/~41287496/task \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Analyze Malware Sample",
        "description": "Submit attachment to sandbox and extract IOCs",
        "status": "Waiting",
        "owner": "malware-analyst@thehive.local",
        "flag": true
      }'
    ```

=== "Python"

    ```python
    from thehive4py.models import CaseTask

    task = CaseTask(
        title='Analyze Malware Sample',
        description='Submit attachment to sandbox and extract IOCs',
        status='Waiting',
        owner='malware-analyst@thehive.local',
        flag=True  # Marcar como urgente
    )

    api.create_case_task(case_id, task)
    ```

### Actualizar Status de Task

=== "curl"

    ```bash
    # Marcar task como completada
    curl -X PATCH https://thehive.example.com/api/v1/task/~task123456 \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "status": "Completed"
      }'
    ```

=== "Python"

    ```python
    task_id = '~task123456'
    api.update_task(task_id, status='Completed')
    ```

---

## Alerts (Alertas)

### Crear Alerta

Las alertas son eventos que pueden convertirse en casos.

=== "curl"

    ```bash
    curl -X POST https://thehive.example.com/api/v1/alert \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "wazuh-alert",
        "source": "Wazuh SIEM",
        "sourceRef": "wazuh-alert-12345",
        "title": "SSH Brute Force Detected",
        "description": "Multiple failed SSH login attempts from 203.0.113.45",
        "severity": 2,
        "tlp": 1,
        "tags": ["ssh", "brute-force"],
        "artifacts": [
          {
            "dataType": "ip",
            "data": "203.0.113.45",
            "ioc": true,
            "tags": ["attacker-ip"]
          }
        ]
      }'
    ```

=== "Python"

    ```python
    from thehive4py.models import Alert, AlertArtifact

    # Create artifacts (observables)
    artifacts = [
        AlertArtifact(
            dataType='ip',
            data='203.0.113.45',
            ioc=True,
            tags=['attacker-ip']
        )
    ]

    # Create alert
    alert = Alert(
        type='wazuh-alert',
        source='Wazuh SIEM',
        sourceRef='wazuh-alert-12345',
        title='SSH Brute Force Detected',
        description='Multiple failed SSH login attempts from 203.0.113.45',
        severity=2,
        tlp=1,
        tags=['ssh', 'brute-force'],
        artifacts=artifacts
    )

    response = api.create_alert(alert)
    alert_id = response.json()['id']
    ```

### Promover Alerta a Caso

=== "curl"

    ```bash
    curl -X POST https://thehive.example.com/api/v1/alert/~alert123456/case \
      -H "Authorization: Bearer YOUR_API_KEY"

    # Respuesta contiene el case_id creado
    ```

=== "Python"

    ```python
    alert_id = '~alert123456'
    response = api.promote_alert_to_case(alert_id)
    case_id = response.json()['id']

    print(f"Alert promoted to case: {case_id}")
    ```

---

## Comments (Comentarios)

### Agregar Comentario a Caso

=== "curl"

    ```bash
    curl -X POST https://thehive.example.com/api/v1/case/~41287496/comment \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "message": "# Analysis Complete\n\nMalware identified as **AgentTesla** info-stealer.\n\n**Capabilities:**\n- Keylogging\n- Credential theft\n- Screenshot capture\n\n**Remediation:** Endpoint isolated and cleaned."
      }'
    ```

=== "Python"

    ```python
    comment = """
# Analysis Complete

Malware identified as **AgentTesla** info-stealer.

**Capabilities:**
- Keylogging
- Credential theft
- Screenshot capture

**Remediation:** Endpoint isolated and cleaned.
    """

    api.create_case_comment(case_id, comment)
    ```

---

## Attachments (Anexos)

### Subir Archivo a Caso

=== "curl"

    ```bash
    # Upload file
    curl -X POST https://thehive.example.com/api/v1/case/~41287496/attachment \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -F "attachment=@/path/to/forensic-report.pdf"

    # Respuesta:
    # {
    #   "_id": "~att123456",
    #   "name": "forensic-report.pdf",
    #   "size": 1024000,
    #   "contentType": "application/pdf"
    # }
    ```

=== "Python"

    ```python
    # Upload file to case
    file_path = '/path/to/forensic-report.pdf'

    with open(file_path, 'rb') as f:
        response = api.create_case_attachment(
            case_id,
            file_path,
            f.read()
        )

    attachment_id = response.json()['id']
    print(f"File uploaded: {attachment_id}")
    ```

### Descargar Archivo

=== "curl"

    ```bash
    curl -X GET https://thehive.example.com/api/v1/attachment/~att123456/download \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -o downloaded-file.pdf
    ```

=== "Python"

    ```python
    import requests

    attachment_id = '~att123456'
    url = f'https://thehive.example.com/api/v1/attachment/{attachment_id}/download'

    response = requests.get(
        url,
        headers={'Authorization': f'Bearer {api_key}'},
        stream=True
    )

    with open('downloaded-file.pdf', 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    ```

---

## Statistics & Metrics

### Obtener Estadísticas de Casos

=== "curl"

    ```bash
    # Casos por status
    curl -X POST https://thehive.example.com/api/v1/query \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "query": [
          {
            "_name": "listCase"
          },
          {
            "_name": "groupBy",
            "_field": "status"
          },
          {
            "_name": "count"
          }
        ]
      }'

    # Respuesta:
    # [
    #   {"status": "New", "count": 45},
    #   {"status": "InProgress", "count": 23},
    #   {"status": "Resolved", "count": 12}
    # ]
    ```

=== "Python"

    ```python
    # Get case statistics
    query = {
        'query': [
            {'_name': 'listCase'},
            {'_name': 'groupBy', '_field': 'status'},
            {'_name': 'count'}
        ]
    }

    response = api.do_query(query)
    stats = response.json()

    for stat in stats:
        print(f"{stat['status']}: {stat['count']} cases")
    ```

---

## Rate Limiting

### Límites por Defecto

| Plan | Requests/Second | Requests/Minute | Requests/Hour |
|------|-----------------|-----------------|---------------|
| **Community** | 10 | 600 | 36,000 |
| **Enterprise** | 50 | 3,000 | 180,000 |

### Headers de Rate Limit

```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 587
X-RateLimit-Reset: 1704067260
```

### Manejar Rate Limiting

=== "Python"

    ```python
    import time
    from requests.exceptions import HTTPError

    def api_call_with_retry(func, *args, **kwargs):
        max_retries = 3
        retry_delay = 5  # seconds

        for attempt in range(max_retries):
            try:
                response = func(*args, **kwargs)
                return response
            except HTTPError as e:
                if e.response.status_code == 429:
                    reset_time = int(e.response.headers.get('X-RateLimit-Reset', 0))
                    wait_time = max(reset_time - time.time(), retry_delay)

                    print(f"Rate limit hit. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    raise

        raise Exception("Max retries exceeded")

    # Uso:
    response = api_call_with_retry(api.get_case, case_id)
    ```

---

## Webhooks

### Configurar Webhook en TheHive

```hocon
# /opt/thehive/config/application.conf

notification.webhook.endpoints = [
  {
    name = "shuffle-automation"
    version = 0
    wsConfig {}
    auth {
      type = "bearer"
      key = "SecureWebhookToken123"
    }
    url = "https://shuffle.example.com/api/v1/hooks/webhook_thehive"

    # Events to send
    includedTheHiveOrganisations = ["*"]
    excludedTheHiveOrganisations = []

    # Filter by object type
    includeFilter = [
      "Case",
      "Alert",
      "Observable"
    ]
  }
]
```

### Estructura de Payload de Webhook

**Case Created Event:**

```json
{
  "operation": "Create",
  "objectType": "Case",
  "objectId": "~41287496",
  "object": {
    "_id": "~41287496",
    "title": "Phishing Email Investigation",
    "severity": 2,
    "tlp": 2,
    "status": "New",
    "createdAt": 1704067200000,
    "createdBy": "analyst@thehive.local"
  },
  "requestId": "req-12345"
}
```

**Observable Added Event:**

```json
{
  "operation": "Create",
  "objectType": "Observable",
  "objectId": "~obs123456",
  "object": {
    "_id": "~obs123456",
    "dataType": "ip",
    "data": "185.220.101.45",
    "ioc": true,
    "sighted": true,
    "tags": ["c2-server"]
  },
  "rootId": "~41287496",
  "requestId": "req-12346"
}
```

### Recibir Webhook (Python Flask)

```python
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = "SecureWebhookToken123"

@app.route('/webhook/thehive', methods=['POST'])
def thehive_webhook():
    # Verify authentication
    auth_header = request.headers.get('Authorization')
    if auth_header != f'Bearer {WEBHOOK_SECRET}':
        return jsonify({'error': 'Unauthorized'}), 401

    # Parse payload
    payload = request.json
    operation = payload.get('operation')
    object_type = payload.get('objectType')
    object_data = payload.get('object')

    # Process based on operation and type
    if operation == 'Create' and object_type == 'Case':
        print(f"New case created: {object_data['title']}")
        # Trigger automation...

    elif operation == 'Create' and object_type == 'Observable':
        print(f"New observable: {object_data['dataType']} = {object_data['data']}")
        # Trigger Cortex analysis...

    return jsonify({'status': 'received'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## Ejemplos Completos

### Script: Auto-Triage de Alertas

```python
#!/usr/bin/env python3
"""
Auto-triage script:
- Fetch new alerts from TheHive
- Analyze observables with Cortex
- Promote to case if malicious
- Close if false positive
"""

from thehive4py.api import TheHiveApi
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Connect to TheHive
api = TheHiveApi('https://thehive.example.com', 'YOUR_API_KEY')

def triage_alerts():
    # Get all new alerts
    query = {
        'query': {'status': 'New'}
    }

    alerts = api.find_alerts(query=query).json()
    logger.info(f"Found {len(alerts)} new alerts to triage")

    for alert in alerts:
        alert_id = alert['_id']
        logger.info(f"Processing alert {alert_id}: {alert['title']}")

        # Check if alert has artifacts (observables)
        artifacts = alert.get('artifacts', [])

        if not artifacts:
            logger.info("No artifacts, marking as low priority")
            api.update_alert(alert_id, severity=1)
            continue

        # Check for malicious indicators
        malicious_count = sum(1 for a in artifacts if a.get('ioc', False))

        if malicious_count > 0:
            logger.info(f"Found {malicious_count} IOCs, promoting to case")
            response = api.promote_alert_to_case(alert_id)
            case_id = response.json()['id']
            logger.info(f"Case created: {case_id}")

            # Add initial comment
            api.create_case_comment(
                case_id,
                f"Case created from alert with {malicious_count} IOCs. Requires investigation."
            )
        else:
            logger.info("No IOCs found, marking alert as reviewed")
            api.update_alert(alert_id, status='Ignored')

if __name__ == '__main__':
    triage_alerts()
```

### Script: Exportar Métricas para Grafana

```python
#!/usr/bin/env python3
"""
Export TheHive metrics to Prometheus format
"""

from thehive4py.api import TheHiveApi
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway
import time

api = TheHiveApi('https://thehive.example.com', 'YOUR_API_KEY')
registry = CollectorRegistry()

# Define metrics
cases_total = Gauge('thehive_cases_total', 'Total cases', ['status', 'severity'], registry=registry)
cases_mttr = Gauge('thehive_cases_mttr_hours', 'Mean Time to Resolve', ['severity'], registry=registry)
observables_total = Gauge('thehive_observables_total', 'Total observables', registry=registry)
iocs_total = Gauge('thehive_iocs_total', 'Total IOCs', registry=registry)

def collect_metrics():
    # Count cases by status and severity
    for status in ['New', 'InProgress', 'Resolved', 'Closed']:
        for severity in [1, 2, 3, 4]:
            query = {
                'query': {
                    '_and': [
                        {'status': status},
                        {'severity': severity}
                    ]
                }
            }
            count = len(api.find_cases(query=query).json())
            cases_total.labels(status=status, severity=severity).set(count)

    # Calculate MTTR by severity
    for severity in [1, 2, 3, 4]:
        query = {
            'query': {
                '_and': [
                    {'status': 'Resolved'},
                    {'severity': severity}
                ]
            }
        }
        cases = api.find_cases(query=query).json()

        if cases:
            total_time = sum(
                (case.get('endDate', 0) - case['createdAt']) / (1000 * 3600)
                for case in cases
            )
            avg_mttr = total_time / len(cases)
            cases_mttr.labels(severity=severity).set(avg_mttr)

    # Count observables and IOCs
    all_observables = api.find_observables(query={}).json()
    observables_total.set(len(all_observables))
    iocs_total.set(sum(1 for obs in all_observables if obs.get('ioc', False)))

    # Push to Prometheus Pushgateway
    push_to_gateway('pushgateway:9091', job='thehive_metrics', registry=registry)
    print("Metrics pushed successfully")

if __name__ == '__main__':
    while True:
        collect_metrics()
        time.sleep(300)  # Every 5 minutes
```

---

## AI Context - Información para LLMs

```yaml
API Reference: TheHive 5.x

Base URL: https://thehive.example.com/api/v1

Autenticación:
  - Header: Authorization: Bearer <api_key>
  - Crear API Key: UI → Profile → API Keys
  - Verificar: GET /api/v1/user/current

Endpoints Principales:
  Cases:
    - POST /api/v1/case (crear)
    - GET /api/v1/case/{id} (obtener)
    - PATCH /api/v1/case/{id} (actualizar)
    - POST /api/v1/query (buscar)

  Observables:
    - POST /api/v1/case/{id}/observable (crear)
    - GET /api/v1/case/{id}/observable (listar)

  Tasks:
    - POST /api/v1/case/{id}/task (crear)
    - PATCH /api/v1/task/{id} (actualizar)

  Alerts:
    - POST /api/v1/alert (crear)
    - POST /api/v1/alert/{id}/case (promover)

Rate Limiting:
  - Community: 10 req/s, 600 req/min
  - Enterprise: 50 req/s, 3000 req/min
  - Header: X-RateLimit-Remaining

Webhooks:
  - Configurar en application.conf
  - Events: Create, Update, Delete
  - Objects: Case, Alert, Observable, Task
  - Auth: Bearer token

Python Libraries:
  - thehive4py: Official Python client
  - requests: HTTP library para custom integration

Status Codes:
  - 200: OK
  - 201: Created
  - 401: Unauthorized (API key inválida)
  - 403: Forbidden (permisos insuficientes)
  - 404: Not Found
  - 429: Rate limit exceeded

Best Practices:
  - Usar API keys con permisos mínimos necesarios
  - Implementar retry logic para rate limiting
  - Validar responses antes de procesar
  - Loggear todas las operaciones críticas
  - Rotar API keys periódicamente
```

---

## Referencias Adicionales

### Documentación Oficial

- **TheHive API Docs**: [https://docs.strangebee.com/thehive/api/](https://docs.strangebee.com/thehive/api/)
- **thehive4py GitHub**: [https://github.com/TheHive-Project/TheHive4py](https://github.com/TheHive-Project/TheHive4py)
- **Postman Collection**: [Descargar](https://github.com/TheHive-Project/TheHive/tree/main/docs/api)

### Ejemplos de Comunidad

- **TheHive Templates**: [GitHub](https://github.com/TheHive-Project/TheHive-Resources)
- **Integration Examples**: [GitHub](https://github.com/TheHive-Project/Integration-Examples)

---

!!! success "API Reference Completa"
    Con esta referencia, puedes automatizar completamente TheHive. Para más ejemplos prácticos, revisa:

    - **[Casos de Uso](use-cases.md)**: Scripts completos de automatización
    - **[Integración Shuffle](integration-shuffle.md)**: Orquestación SOAR
