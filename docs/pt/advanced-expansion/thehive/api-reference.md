# Referência da API do TheHive

## Visão Geral

!!! info "AI Context: TheHive API Reference"
    TheHive 5.x expõe uma API REST completa que permite automação total de todas as operações: criar/atualizar/fechar casos, adicionar observables e tasks, executar analyzers/responders, buscar casos com queries avançadas, e receber webhooks de eventos. Autenticação via Bearer token (API key). Todos os endpoints retornam JSON. Rate limiting: 100 req/min por default. Este guia cobre endpoints principais com exemplos em curl e Python.

Este guia de referência completo documenta a **API REST** do TheHive 5.x, permitindo integração e automação completa com qualquer linguagem de programação.

## Informações Gerais

### Base URL

```
http://thehive.company.local:9000/api/v1
```

### Autenticação

TheHive usa **Bearer Token** para autenticação:

```bash
Authorization: Bearer YOUR_API_KEY
```

**Obter API Key:**

```
TheHive UI > Settings > Users > [seu usuário] > Create API Key
```

### Headers Padrão

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
Accept: application/json
```

### Rate Limiting

```yaml
Default Limits:
  - 100 requests / minute (por API key)
  - 1000 requests / hour

Headers de Resposta:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1705334400

Status Code quando exceder:
  429 Too Many Requests
```

### Códigos de Status HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| **200** | OK | Request bem-sucedido (GET, PUT, PATCH) |
| **201** | Created | Recurso criado com sucesso (POST) |
| **204** | No Content | Request bem-sucedido, sem corpo de resposta (DELETE) |
| **400** | Bad Request | Dados inválidos ou malformados |
| **401** | Unauthorized | API key inválida ou ausente |
| **403** | Forbidden | Sem permissão para o recurso |
| **404** | Not Found | Recurso não encontrado |
| **409** | Conflict | Conflito (ex: recurso duplicado) |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Erro interno do servidor |

## Autenticação

### Testar Autenticação

=== "curl"

    ```bash
    curl -X GET "http://thehive.company.local:9000/api/v1/status" \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

=== "Python"

    ```python
    import requests

    THEHIVE_URL = "http://thehive.company.local:9000"
    API_KEY = "YOUR_API_KEY"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.get(
        f"{THEHIVE_URL}/api/v1/status",
        headers=headers
    )

    print(response.json())
    # {'versions': {'TheHive': '5.3.0'}}
    ```

**Resposta:**

```json
{
  "versions": {
    "TheHive": "5.3.0"
  }
}
```

## Endpoints: Cases (Casos)

### Listar Casos

**Request:**

=== "curl"

    ```bash
    curl -X GET "http://thehive.company.local:9000/api/v1/case?range=0-10" \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

=== "Python"

    ```python
    response = requests.get(
        f"{THEHIVE_URL}/api/v1/case?range=0-10",
        headers=headers
    )

    cases = response.json()
    for case in cases:
        print(f"Case #{case['number']}: {case['title']}")
    ```

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `range` | String | Paginação: "0-10", "10-20", etc |
| `sort` | String | Ordenação: "+createdAt", "-severity" |

**Resposta:**

```json
[
  {
    "_id": "~1234567890",
    "_type": "case",
    "number": 42,
    "title": "Ransomware - finance-srv-01",
    "description": "Ransomware detected on finance server...",
    "severity": 3,
    "tlp": 2,
    "pap": 2,
    "status": "Open",
    "owner": "analyst@company.local",
    "assignee": "senior-analyst@company.local",
    "tags": ["ransomware", "finance"],
    "startDate": 1705329780000,
    "createdAt": 1705329780000,
    "createdBy": "analyst@company.local",
    "updatedAt": 1705333380000,
    "updatedBy": "senior-analyst@company.local"
  }
]
```

### Criar Caso

**Request:**

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/case" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Malware Detection on Workstation",
        "description": "## Summary\n\nMalware detected by EDR on WS-045.\n\n## Details\n- Hash: d41d8cd98f00b204e9800998ecf8427e\n- User: john.doe",
        "severity": 2,
        "tlp": 2,
        "pap": 2,
        "tags": ["malware", "edr", "workstation"],
        "customFields": {
          "affected-user": {
            "string": "john.doe"
          },
          "workstation": {
            "string": "WS-045"
          }
        }
      }'
    ```

=== "Python"

    ```python
    case_data = {
        "title": "Malware Detection on Workstation",
        "description": """
    ## Summary

    Malware detected by EDR on WS-045.

    ## Details
    - Hash: d41d8cd98f00b204e9800998ecf8427e
    - User: john.doe
        """,
        "severity": 2,  # Medium
        "tlp": 2,       # AMBER
        "pap": 2,
        "tags": ["malware", "edr", "workstation"],
        "customFields": {
            "affected-user": {"string": "john.doe"},
            "workstation": {"string": "WS-045"}
        }
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/case",
        headers=headers,
        json=case_data
    )

    if response.status_code == 201:
        case = response.json()
        print(f"Case created: #{case['number']}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
    ```

**Campos Obrigatórios:**

- `title`: String (não vazio)
- `description`: String (pode ser Markdown)

**Campos Opcionais:**

- `severity`: Integer (1=Low, 2=Medium, 3=High, 4=Critical) - Default: 2
- `tlp`: Integer (0=WHITE, 1=GREEN, 2=AMBER, 3=RED) - Default: 2
- `pap`: Integer (0=WHITE, 1=GREEN, 2=AMBER, 3=RED) - Default: 2
- `tags`: Array de strings
- `customFields`: Object com custom fields

**Resposta (201 Created):**

```json
{
  "_id": "~1234567891",
  "_type": "case",
  "number": 43,
  "title": "Malware Detection on Workstation",
  "status": "Open",
  "severity": 2,
  "tlp": 2,
  "createdAt": 1705334400000,
  "createdBy": "api-user@company.local"
}
```

### Obter Caso por ID

=== "curl"

    ```bash
    curl -X GET "http://thehive.company.local:9000/api/v1/case/~1234567890" \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

=== "Python"

    ```python
    case_id = "~1234567890"

    response = requests.get(
        f"{THEHIVE_URL}/api/v1/case/{case_id}",
        headers=headers
    )

    case = response.json()
    print(f"Case: {case['title']}")
    print(f"Status: {case['status']}")
    print(f"Severity: {case['severity']}")
    ```

### Atualizar Caso

=== "curl"

    ```bash
    curl -X PATCH "http://thehive.company.local:9000/api/v1/case/~1234567890" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "status": "InProgress",
        "severity": 3,
        "assignee": "senior-analyst@company.local"
      }'
    ```

=== "Python"

    ```python
    case_id = "~1234567890"
    update_data = {
        "status": "InProgress",
        "severity": 3,
        "assignee": "senior-analyst@company.local"
    }

    response = requests.patch(
        f"{THEHIVE_URL}/api/v1/case/{case_id}",
        headers=headers,
        json=update_data
    )

    if response.status_code == 200:
        print("Case updated successfully")
    ```

**Campos Atualizáveis:**

- `title`, `description`
- `severity`, `tlp`, `pap`
- `status`: "Open", "InProgress", "Resolved", "Deleted"
- `owner`, `assignee`
- `tags`
- `customFields`

### Fechar Caso

=== "curl"

    ```bash
    curl -X PATCH "http://thehive.company.local:9000/api/v1/case/~1234567890" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "status": "Resolved",
        "resolutionStatus": "TruePositive",
        "summary": "Malware removed, system cleaned."
      }'
    ```

=== "Python"

    ```python
    case_id = "~1234567890"
    close_data = {
        "status": "Resolved",
        "resolutionStatus": "TruePositive",  # ou "FalsePositive"
        "summary": "Malware removed, system cleaned."
    }

    response = requests.patch(
        f"{THEHIVE_URL}/api/v1/case/{case_id}",
        headers=headers,
        json=close_data
    )
    ```

### Deletar Caso

!!! danger "Ação Irreversível"
    Deletar um caso é permanente e não pode ser desfeito.

=== "curl"

    ```bash
    curl -X DELETE "http://thehive.company.local:9000/api/v1/case/~1234567890" \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

=== "Python"

    ```python
    case_id = "~1234567890"

    response = requests.delete(
        f"{THEHIVE_URL}/api/v1/case/{case_id}",
        headers=headers
    )

    if response.status_code == 204:
        print("Case deleted")
    ```

### Busca Avançada de Casos

**Query DSL:**

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/query" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "query": [
          {"_name": "listCase"},
          {"_name": "filter", "_and": [
            {"_gte": {"_field": "severity", "_value": 3}},
            {"_in": {"_field": "status", "_values": ["Open", "InProgress"]}},
            {"_contains": {"_field": "tags", "_value": "ransomware"}}
          ]},
          {"_name": "sort", "_fields": [{"startDate": "desc"}]},
          {"_name": "page", "from": 0, "to": 10}
        ]
      }'
    ```

=== "Python"

    ```python
    query = {
        "query": [
            {"_name": "listCase"},
            {"_name": "filter", "_and": [
                {"_gte": {"_field": "severity", "_value": 3}},
                {"_in": {"_field": "status", "_values": ["Open", "InProgress"]}},
                {"_contains": {"_field": "tags", "_value": "ransomware"}}
            ]},
            {"_name": "sort", "_fields": [{"startDate": "desc"}]},
            {"_name": "page", "from": 0, "to": 10}
        ]
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/query",
        headers=headers,
        json=query
    )

    cases = response.json()
    print(f"Found {len(cases)} cases")
    ```

**Operadores de Query:**

| Operador | Descrição | Exemplo |
|----------|-----------|---------|
| `_eq` | Igual | `{"_eq": {"_field": "status", "_value": "Open"}}` |
| `_ne` | Diferente | `{"_ne": {"_field": "severity", "_value": 1}}` |
| `_gt` | Maior que | `{"_gt": {"_field": "severity", "_value": 2}}` |
| `_gte` | Maior ou igual | `{"_gte": {"_field": "severity", "_value": 3}}` |
| `_lt` | Menor que | `{"_lt": {"_field": "createdAt", "_value": 1705334400000}}` |
| `_lte` | Menor ou igual | `{"_lte": {"_field": "severity", "_value": 2}}` |
| `_in` | Em lista | `{"_in": {"_field": "status", "_values": ["Open", "InProgress"]}}` |
| `_contains` | Contém | `{"_contains": {"_field": "tags", "_value": "malware"}}` |
| `_and` | E lógico | `{"_and": [condition1, condition2]}` |
| `_or` | OU lógico | `{"_or": [condition1, condition2]}` |

## Endpoints: Alerts (Alertas)

### Criar Alerta

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/alert" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "wazuh-alert",
        "source": "Wazuh SIEM",
        "sourceRef": "5710",
        "title": "SSH Brute Force Detected",
        "description": "Multiple failed SSH login attempts",
        "severity": 2,
        "tlp": 2,
        "tags": ["brute-force", "ssh"],
        "customFields": {
          "wazuh_rule_id": {"string": "5710"},
          "source_ip": {"string": "203.0.113.50"}
        }
      }'
    ```

=== "Python"

    ```python
    alert_data = {
        "type": "wazuh-alert",
        "source": "Wazuh SIEM",
        "sourceRef": "5710",
        "title": "SSH Brute Force Detected",
        "description": "Multiple failed SSH login attempts",
        "severity": 2,
        "tlp": 2,
        "tags": ["brute-force", "ssh"],
        "customFields": {
            "wazuh_rule_id": {"string": "5710"},
            "source_ip": {"string": "203.0.113.50"}
        }
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/alert",
        headers=headers,
        json=alert_data
    )

    alert = response.json()
    print(f"Alert created: {alert['_id']}")
    ```

### Promover Alerta para Caso

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/alert/~123456/case" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "SSH Brute Force - Promoted from Alert",
        "severity": 3
      }'
    ```

=== "Python"

    ```python
    alert_id = "~123456"

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/alert/{alert_id}/case",
        headers=headers,
        json={
            "title": "SSH Brute Force - Promoted from Alert",
            "severity": 3
        }
    )

    case = response.json()
    print(f"Case created from alert: #{case['number']}")
    ```

## Endpoints: Observables (IOCs)

### Adicionar Observable a um Caso

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/case/~1234567890/observable" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "dataType": "ip",
        "data": "203.0.113.50",
        "tlp": 2,
        "ioc": true,
        "sighted": true,
        "tags": ["c2-server", "malicious"],
        "message": "Command and Control server"
      }'
    ```

=== "Python"

    ```python
    case_id = "~1234567890"

    observable_data = {
        "dataType": "ip",
        "data": "203.0.113.50",
        "tlp": 2,
        "ioc": True,
        "sighted": True,
        "tags": ["c2-server", "malicious"],
        "message": "Command and Control server"
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/case/{case_id}/observable",
        headers=headers,
        json=observable_data
    )

    observable = response.json()
    print(f"Observable created: {observable['_id']}")
    ```

**Tipos de Observables (`dataType`):**

- `ip` - IP Address
- `domain` - Domain name
- `fqdn` - Fully Qualified Domain Name
- `url` - URL
- `email` - Email address
- `hash` - File hash (MD5/SHA1/SHA256)
- `filename` - Filename
- `file` - File attachment
- `registry` - Windows Registry key
- `hostname` - Hostname
- `autonomous-system` - AS number
- `mail_subject` - Email subject
- `user-agent` - HTTP User-Agent
- `other` - Custom type

### Adicionar Múltiplos Observables

=== "Python"

    ```python
    case_id = "~1234567890"

    observables = [
        {"dataType": "ip", "data": "203.0.113.50", "ioc": True},
        {"dataType": "ip", "data": "203.0.113.51", "ioc": True},
        {"dataType": "domain", "data": "malicious-c2.com", "ioc": True},
        {"dataType": "hash", "data": "d41d8cd98f00b204e9800998ecf8427e", "ioc": True}
    ]

    for obs in observables:
        response = requests.post(
            f"{THEHIVE_URL}/api/v1/case/{case_id}/observable",
            headers=headers,
            json=obs
        )
        print(f"Added: {obs['dataType']} - {obs['data']}")
    ```

### Executar Analyzer em Observable

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/connector/cortex/job" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "objectId": "~observable_id",
        "objectType": "Observable",
        "analyzerId": "VirusTotal_GetReport_3_0",
        "cortexId": "Cortex-Production"
      }'
    ```

=== "Python"

    ```python
    observable_id = "~observable_id"

    job_data = {
        "objectId": observable_id,
        "objectType": "Observable",
        "analyzerId": "VirusTotal_GetReport_3_0",
        "cortexId": "Cortex-Production"
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/connector/cortex/job",
        headers=headers,
        json=job_data
    )

    job = response.json()
    print(f"Job started: {job['_id']}")

    # Aguardar resultado (polling)
    import time
    while True:
        job_status = requests.get(
            f"{THEHIVE_URL}/api/v1/connector/cortex/job/{job['_id']}",
            headers=headers
        ).json()

        if job_status['status'] == 'Success':
            print("Analysis complete!")
            print(job_status['report'])
            break
        elif job_status['status'] == 'Failure':
            print("Analysis failed")
            break

        time.sleep(5)
    ```

## Endpoints: Tasks (Tarefas)

### Adicionar Task a um Caso

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/case/~1234567890/task" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Analyze malware sample",
        "description": "Submit sample to Cuckoo Sandbox for analysis",
        "status": "Waiting",
        "group": "Forensic Analysis",
        "assignee": "forensics@company.local"
      }'
    ```

=== "Python"

    ```python
    case_id = "~1234567890"

    task_data = {
        "title": "Analyze malware sample",
        "description": "Submit sample to Cuckoo Sandbox for analysis",
        "status": "Waiting",
        "group": "Forensic Analysis",
        "assignee": "forensics@company.local"
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/case/{case_id}/task",
        headers=headers,
        json=task_data
    )

    task = response.json()
    print(f"Task created: {task['_id']}")
    ```

### Atualizar Status da Task

=== "curl"

    ```bash
    curl -X PATCH "http://thehive.company.local:9000/api/v1/case/task/~task_id" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "status": "Completed"
      }'
    ```

=== "Python"

    ```python
    task_id = "~task_id"

    response = requests.patch(
        f"{THEHIVE_URL}/api/v1/case/task/{task_id}",
        headers=headers,
        json={"status": "Completed"}
    )
    ```

**Status de Task:**

- `Waiting` - Aguardando início
- `InProgress` - Em execução
- `Completed` - Finalizada
- `Cancel` - Cancelada

### Adicionar Log a uma Task

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/case/task/~task_id/log" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "message": "## Analysis Complete\n\n- File submitted to Cuckoo\n- Waiting for report (ETA: 10 min)"
      }'
    ```

=== "Python"

    ```python
    task_id = "~task_id"

    log_data = {
        "message": """
    ## Analysis Complete

    - File submitted to Cuckoo
    - Waiting for report (ETA: 10 min)
        """
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/case/task/{task_id}/log",
        headers=headers,
        json=log_data
    )
    ```

## Endpoints: TTPs

### Adicionar TTP a um Caso

=== "curl"

    ```bash
    curl -X POST "http://thehive.company.local:9000/api/v1/case/~1234567890/procedure" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "tactic": "Initial Access",
        "techniqueId": "T1566.001",
        "techniqueName": "Phishing: Spearphishing Attachment",
        "description": "User opened malicious PDF attachment",
        "occurredAt": 1705329780000
      }'
    ```

=== "Python"

    ```python
    case_id = "~1234567890"

    ttp_data = {
        "tactic": "Initial Access",
        "techniqueId": "T1566.001",
        "techniqueName": "Phishing: Spearphishing Attachment",
        "description": "User opened malicious PDF attachment",
        "occurredAt": 1705329780000
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/case/{case_id}/procedure",
        headers=headers,
        json=ttp_data
    )
    ```

## Webhooks

### Configurar Webhook no TheHive

**Editar `/opt/thehive/config/thehive.conf`:**

```hocon
notification {
  webhook {
    endpoints = [
      {
        name = "Shuffle"
        version = 2
        wsConfig {
          url = "https://shuffle.company.local/api/v1/hooks/thehive"
          auth {
            type = "bearer"
            key = "YOUR_WEBHOOK_SECRET"
          }
        }

        # Filtros (opcional)
        includedTheHiveOrganisations = ["*"]
        excludedTheHiveOrganisations = []

        # Filtros por tipo de evento
        # Remover tipos não desejados
        # filterBy = ["CaseCreated", "CaseUpdated"]
      }
    ]
  }
}
```

### Eventos de Webhook

**Tipos de Eventos:**

- `CaseCreated` - Novo caso criado
- `CaseUpdated` - Caso atualizado
- `CaseDeleted` - Caso deletado
- `AlertCreated` - Novo alerta criado
- `AlertUpdated` - Alerta atualizado
- `ObservableCreated` - Observable adicionado
- `ObservableUpdated` - Observable atualizado
- `TaskCreated` - Task criada
- `TaskUpdated` - Task atualizada
- `TaskLogCreated` - Log adicionado a task

**Payload de Exemplo (CaseCreated):**

```json
{
  "operation": "Creation",
  "objectType": "case",
  "objectId": "~1234567890",
  "object": {
    "_id": "~1234567890",
    "_type": "case",
    "number": 42,
    "title": "Ransomware Detection",
    "description": "...",
    "severity": 3,
    "tlp": 2,
    "status": "Open",
    "tags": ["ransomware"],
    "createdAt": 1705329780000,
    "createdBy": "analyst@company.local"
  }
}
```

### Receber Webhook (Servidor Receptor)

=== "Python (Flask)"

    ```python
    from flask import Flask, request, jsonify
    import hmac
    import hashlib

    app = Flask(__name__)
    WEBHOOK_SECRET = "YOUR_WEBHOOK_SECRET"

    @app.route('/webhook/thehive', methods=['POST'])
    def thehive_webhook():
        # Validar assinatura (se configurado)
        signature = request.headers.get('X-Signature')
        if signature:
            body = request.get_data()
            expected_signature = hmac.new(
                WEBHOOK_SECRET.encode(),
                body,
                hashlib.sha256
            ).hexdigest()

            if signature != expected_signature:
                return jsonify({"error": "Invalid signature"}), 403

        # Processar payload
        data = request.json

        operation = data['operation']
        object_type = data['objectType']
        obj = data['object']

        print(f"Received: {operation} {object_type}")

        if object_type == 'case' and operation == 'Creation':
            handle_case_created(obj)
        elif object_type == 'case' and operation == 'Update':
            handle_case_updated(obj)

        return jsonify({"status": "ok"}), 200

    def handle_case_created(case):
        print(f"New case created: #{case['number']} - {case['title']}")
        # Executar automações aqui
        # Ex: Enviar para Shuffle, criar ticket no Odoo, etc

    def handle_case_updated(case):
        print(f"Case updated: #{case['number']}")
        if case['status'] == 'Resolved':
            print("Case resolved!")
            # Enviar notificação, atualizar dashboard, etc

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000)
    ```

## Exemplo Completo: Workflow End-to-End

### Cenário: Criar Caso a partir de Alerta Wazuh

=== "Python"

    ```python
    import requests
    import json
    from datetime import datetime

    # Configuração
    THEHIVE_URL = "http://thehive.company.local:9000"
    API_KEY = "YOUR_API_KEY"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # 1. Receber alerta do Wazuh (via webhook)
    wazuh_alert = {
        "rule": {
            "id": "550",
            "level": 12,
            "description": "Malware detected"
        },
        "agent": {
            "id": "001",
            "name": "finance-ws-045",
            "ip": "10.0.10.45"
        },
        "data": {
            "virustotal": {
                "malicious": "35",
                "total": "50",
                "sha256": "d41d8cd98f00b204e9800998ecf8427e"
            }
        }
    }

    # 2. Criar caso no TheHive
    case_data = {
        "title": f"Malware Detection - {wazuh_alert['agent']['name']}",
        "description": f"""
    ## Alert Details

    **Rule**: {wazuh_alert['rule']['id']} - {wazuh_alert['rule']['description']}
    **Agent**: {wazuh_alert['agent']['name']} ({wazuh_alert['agent']['ip']})
    **Timestamp**: {datetime.utcnow().isoformat()}

    ## VirusTotal Detection

    {wazuh_alert['data']['virustotal']['malicious']}/{wazuh_alert['data']['virustotal']['total']} engines detected malware

    ## Required Actions

    1. Isolate workstation
    2. Analyze malware sample
    3. Check for lateral movement
        """,
        "severity": 3,
        "tlp": 2,
        "pap": 2,
        "tags": ["wazuh", "malware", "virustotal"],
        "customFields": {
            "wazuh_rule_id": {"string": wazuh_alert['rule']['id']},
            "agent_name": {"string": wazuh_alert['agent']['name']},
            "agent_ip": {"string": wazuh_alert['agent']['ip']}
        }
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/case",
        headers=headers,
        json=case_data
    )

    case = response.json()
    print(f"✅ Case created: #{case['number']}")

    # 3. Adicionar observables
    observables = [
        {
            "dataType": "ip",
            "data": wazuh_alert['agent']['ip'],
            "tlp": 2,
            "ioc": False,
            "tags": ["agent-ip"]
        },
        {
            "dataType": "hash",
            "data": wazuh_alert['data']['virustotal']['sha256'],
            "tlp": 2,
            "ioc": True,
            "sighted": True,
            "tags": ["malware", "virustotal"]
        }
    ]

    for obs in observables:
        response = requests.post(
            f"{THEHIVE_URL}/api/v1/case/{case['_id']}/observable",
            headers=headers,
            json=obs
        )
        print(f"✅ Observable added: {obs['dataType']} - {obs['data']}")

    # 4. Criar tasks
    tasks = [
        {
            "title": "Isolate Workstation",
            "description": "Isolate finance-ws-045 from network",
            "status": "Waiting",
            "group": "Containment"
        },
        {
            "title": "Analyze Malware Sample",
            "description": "Submit sample to Cuckoo Sandbox",
            "status": "Waiting",
            "group": "Investigation"
        },
        {
            "title": "Check for Lateral Movement",
            "description": "Review logs for signs of spread",
            "status": "Waiting",
            "group": "Investigation"
        }
    ]

    for task in tasks:
        response = requests.post(
            f"{THEHIVE_URL}/api/v1/case/{case['_id']}/task",
            headers=headers,
            json=task
        )
        print(f"✅ Task created: {task['title']}")

    # 5. Executar analyzer no hash
    observable_hash_id = "~observable_id"  # Obter do response anterior

    job_data = {
        "objectId": observable_hash_id,
        "objectType": "Observable",
        "analyzerId": "VirusTotal_GetReport_3_0",
        "cortexId": "Cortex-Production"
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/v1/connector/cortex/job",
        headers=headers,
        json=job_data
    )

    print(f"✅ Analyzer started: VirusTotal")

    print(f"\n✨ Case #{case['number']} created successfully!")
    print(f"🔗 URL: http://thehive.company.local:9000/case/{case['_id']}")
    ```

## Bibliotecas e SDKs

### Python: thehive4py

```bash
pip install thehive4py
```

```python
from thehive4py.api import TheHiveApi
from thehive4py.models import Case, CaseTask, CaseObservable

# Conectar
api = TheHiveApi('http://thehive.company.local:9000', 'YOUR_API_KEY')

# Criar caso
case = Case(
    title='Test Case',
    description='Testing thehive4py',
    severity=2,
    tlp=2,
    tags=['test']
)

response = api.create_case(case)
print(response.json())

# Adicionar observable
observable = CaseObservable(
    dataType='ip',
    data='203.0.113.50',
    tlp=2,
    ioc=True,
    tags=['malicious']
)

response = api.create_case_observable(case_id, observable)
```

## Rate Limiting e Boas Práticas

### Respeitar Rate Limits

```python
import time
from requests.exceptions import HTTPError

def api_call_with_retry(url, method='get', **kwargs):
    """Wrapper para calls de API com retry em caso de rate limit"""
    max_retries = 3
    retry_delay = 60  # segundos

    for attempt in range(max_retries):
        try:
            if method == 'get':
                response = requests.get(url, **kwargs)
            elif method == 'post':
                response = requests.post(url, **kwargs)

            response.raise_for_status()
            return response

        except HTTPError as e:
            if e.response.status_code == 429:
                # Rate limit excedido
                retry_after = int(e.response.headers.get('Retry-After', retry_delay))
                print(f"Rate limit hit. Retrying in {retry_after}s...")
                time.sleep(retry_after)
            else:
                raise

    raise Exception("Max retries exceeded")
```

### Batch Operations

```python
# ❌ Evitar: N+1 queries
for ip in ip_list:
    response = requests.post(f"{THEHIVE_URL}/api/v1/case/{case_id}/observable", ...)

# ✅ Melhor: Batch com delay
import time

for i, ip in enumerate(ip_list):
    response = requests.post(f"{THEHIVE_URL}/api/v1/case/{case_id}/observable", ...)

    # Adicionar delay a cada 10 requests
    if (i + 1) % 10 == 0:
        time.sleep(1)
```

## Troubleshooting

### Erro 401: Unauthorized

```python
# Verificar API key
response = requests.get(
    f"{THEHIVE_URL}/api/v1/status",
    headers={"Authorization": f"Bearer {API_KEY}"}
)

if response.status_code == 401:
    print("❌ API Key inválida ou expirada")
    print("Gere uma nova: Settings > Users > Create API Key")
```

### Erro 403: Forbidden

```python
# Usuário não tem permissão
# Verificar profile do usuário (analyst vs read-only)
```

### Erro 429: Rate Limit

```python
# Implementar exponential backoff
import time

retry_delay = 1
max_retries = 5

for attempt in range(max_retries):
    if response.status_code == 429:
        time.sleep(retry_delay)
        retry_delay *= 2  # Exponential backoff
    else:
        break
```

## Recursos Adicionais

- [TheHive API Documentation](https://docs.strangebee.com/thehive/api/)
- [thehive4py GitHub](https://github.com/TheHive-Project/TheHive4py)
- [Postman Collection](https://documenter.getpostman.com/view/12345/thehive)

!!! tip "AI Context: API Reference Summary"
    TheHive 5.x API REST completa permite automação total: criar/atualizar/fechar casos (POST/PATCH), adicionar observables e tasks, executar Cortex analyzers, busca avançada com query DSL (operadores: _eq, _gte, _in, _contains, _and, _or), webhooks para eventos (CaseCreated, CaseUpdated, ObservableCreated). Autenticação via Bearer token. Rate limit: 100 req/min. Status codes: 201 (created), 200 (ok), 401 (unauthorized), 429 (rate limit). Library recomendada: thehive4py (Python). Boas práticas: batch operations com delay, retry com exponential backoff, respeitar rate limits.
