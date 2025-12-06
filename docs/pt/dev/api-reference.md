# API Reference - NEO_NETBOX_ODOO_STACK v2.0

> **AI Context**: Este documento fornece referência completa das APIs do NEO_NETBOX_ODOO_STACK v2.0, incluindo Odoo FastAPI, NetBox REST API e Wazuh API. Contém endpoints, autenticação, schemas JSON, exemplos curl e Python, códigos de status e troubleshooting.

## Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Odoo FastAPI](#odoo-fastapi)
- [NetBox REST API](#netbox-rest-api)
- [Wazuh API](#wazuh-api)
- [Rate Limiting](#rate-limiting)
- [Códigos de Erro](#códigos-de-erro)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

### Tabela de Referência Rápida

| API | Base URL | Autenticação | Versão |
|-----|----------|--------------|--------|
| Odoo FastAPI | `http://odoo:8069/api/v1` | Bearer Token | v1 |
| NetBox REST | `http://netbox:8000/api` | Token Header | v3.x |
| Wazuh API | `https://wazuh:55000` | JWT Bearer | v4.x |

### URLs de Produção

```bash
# Odoo FastAPI
ODOO_API_URL="https://odoo.example.com/api/v1"

# NetBox REST
NETBOX_API_URL="https://netbox.example.com/api"

# Wazuh API
WAZUH_API_URL="https://wazuh.example.com:55000"
```

---

## Autenticação

### Odoo FastAPI - Bearer Token

```bash
# Obter token (Odoo OAuth2)
curl -X POST "http://odoo:8069/api/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "db": "odoo",
    "login": "admin",
    "password": "admin"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Uso:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### NetBox - Token Authentication

```bash
# Token gerado em: Admin > Users > API Tokens
X-API-Token: 0123456789abcdef0123456789abcdef01234567
```

### Wazuh - JWT Bearer

```bash
# 1. Obter JWT token
curl -u admin:SecretPassword -k -X GET \
  "https://wazuh:55000/security/user/authenticate"

# Response
{
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzUxMiJ9..."
  }
}

# 2. Usar token nas requisições
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzUxMiJ9...
```

---

## Odoo FastAPI

Base URL: `http://odoo:8069/api/v1`

### POST /api/v1/wazuh/alert

Receber e processar alertas do Wazuh.

**URL Completa:** `http://odoo:8069/api/v1/wazuh/alert`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "id": "1234567890",
  "timestamp": "2025-12-05T10:30:00.000Z",
  "rule": {
    "id": "5710",
    "description": "Multiple authentication failures",
    "level": 10,
    "groups": ["authentication_failed", "syslog"]
  },
  "agent": {
    "id": "001",
    "name": "server-01",
    "ip": "192.168.1.100"
  },
  "location": "/var/log/auth.log",
  "full_log": "Failed password for invalid user admin from 10.0.0.1",
  "decoder": {
    "name": "sshd"
  },
  "data": {
    "srcip": "10.0.0.1",
    "srcuser": "admin"
  }
}
```

**Response Body (201 Created):**
```json
{
  "status": "success",
  "ticket_id": 42,
  "ticket_name": "ALERT-001-5710",
  "message": "Ticket created successfully"
}
```

**Response Body (200 OK - Duplicate):**
```json
{
  "status": "duplicate",
  "ticket_id": 42,
  "message": "Alert already processed"
}
```

**Códigos de Status:**
- `201 Created` - Ticket criado com sucesso
- `200 OK` - Alerta já processado (duplicado)
- `400 Bad Request` - JSON inválido ou campos obrigatórios ausentes
- `401 Unauthorized` - Token inválido ou ausente
- `500 Internal Server Error` - Erro no servidor

**Exemplo curl:**
```bash
curl -X POST "http://odoo:8069/api/v1/wazuh/alert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ODOO_TOKEN}" \
  -d '{
    "id": "1234567890",
    "timestamp": "2025-12-05T10:30:00.000Z",
    "rule": {
      "id": "5710",
      "description": "Multiple authentication failures",
      "level": 10
    },
    "agent": {
      "id": "001",
      "name": "server-01",
      "ip": "192.168.1.100"
    },
    "full_log": "Failed password for invalid user admin"
  }'
```

**Exemplo Python:**
```python
import requests
import json
from datetime import datetime

def send_wazuh_alert(alert_data, odoo_url, token):
    """Enviar alerta Wazuh para Odoo FastAPI."""

    url = f"{odoo_url}/api/v1/wazuh/alert"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    response = requests.post(url, headers=headers, json=alert_data)

    if response.status_code == 201:
        print(f"Ticket criado: {response.json()['ticket_id']}")
    elif response.status_code == 200:
        print(f"Alerta duplicado: {response.json()['message']}")
    else:
        print(f"Erro: {response.status_code} - {response.text}")

    return response

# Exemplo de uso
alert = {
    "id": "1234567890",
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "rule": {
        "id": "5710",
        "description": "Multiple authentication failures",
        "level": 10
    },
    "agent": {
        "id": "001",
        "name": "server-01",
        "ip": "192.168.1.100"
    },
    "full_log": "Failed password for invalid user admin"
}

response = send_wazuh_alert(
    alert_data=alert,
    odoo_url="http://odoo:8069",
    token="YOUR_TOKEN_HERE"
)
```

---

### POST /api/v1/netbox/webhook

Receber webhooks do NetBox para sincronização de dispositivos.

**URL Completa:** `http://odoo:8069/api/v1/netbox/webhook`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
X-Hook-Signature: sha256=<signature>
```

**Request Body:**
```json
{
  "event": "created",
  "timestamp": "2025-12-05T10:30:00.000Z",
  "model": "dcim.device",
  "username": "admin",
  "request_id": "abc-123-def-456",
  "data": {
    "id": 123,
    "name": "switch-01",
    "device_type": {
      "id": 1,
      "manufacturer": {"name": "Cisco"},
      "model": "Catalyst 9300"
    },
    "device_role": {
      "id": 2,
      "name": "switch"
    },
    "site": {
      "id": 1,
      "name": "Datacenter-SP"
    },
    "status": {
      "value": "active"
    },
    "primary_ip4": {
      "address": "192.168.1.10/24"
    },
    "serial": "FCW1234A5B6",
    "asset_tag": "AST-001"
  }
}
```

**Response Body (200 OK):**
```json
{
  "status": "success",
  "action": "created",
  "asset_id": 15,
  "message": "Device synced successfully"
}
```

**Códigos de Status:**
- `200 OK` - Webhook processado com sucesso
- `400 Bad Request` - Payload inválido
- `401 Unauthorized` - Token inválido
- `422 Unprocessable Entity` - Dados inconsistentes

**Exemplo curl:**
```bash
curl -X POST "http://odoo:8069/api/v1/netbox/webhook" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ODOO_TOKEN}" \
  -d '{
    "event": "created",
    "timestamp": "2025-12-05T10:30:00.000Z",
    "model": "dcim.device",
    "data": {
      "id": 123,
      "name": "switch-01",
      "site": {"name": "Datacenter-SP"},
      "status": {"value": "active"}
    }
  }'
```

**Exemplo Python:**
```python
import requests
import hmac
import hashlib
import json

def send_netbox_webhook(webhook_data, odoo_url, token, secret=None):
    """Enviar webhook NetBox para Odoo."""

    url = f"{odoo_url}/api/v1/netbox/webhook"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    # Adicionar assinatura se secret fornecido
    if secret:
        payload = json.dumps(webhook_data)
        signature = hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        headers["X-Hook-Signature"] = f"sha256={signature}"

    response = requests.post(url, headers=headers, json=webhook_data)

    return response.json()

# Exemplo de uso
webhook = {
    "event": "created",
    "model": "dcim.device",
    "data": {
        "id": 123,
        "name": "switch-01"
    }
}

result = send_netbox_webhook(
    webhook_data=webhook,
    odoo_url="http://odoo:8069",
    token="YOUR_TOKEN_HERE",
    secret="webhook_secret"
)
print(result)
```

---

### GET /api/v1/tickets

Listar tickets do helpdesk.

**URL Completa:** `http://odoo:8069/api/v1/tickets`

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=50              # Limite de resultados (padrão: 50)
&offset=0              # Offset para paginação (padrão: 0)
&stage=open            # Filtrar por estágio (open, in_progress, closed)
&priority=high         # Filtrar por prioridade (low, medium, high, urgent)
&team_id=1             # Filtrar por equipe
&created_after=2025-12-01T00:00:00Z
```

**Response Body (200 OK):**
```json
{
  "total": 150,
  "limit": 50,
  "offset": 0,
  "tickets": [
    {
      "id": 42,
      "name": "TICKET-001",
      "description": "Multiple authentication failures on server-01",
      "stage": "open",
      "priority": "high",
      "team_id": 1,
      "team_name": "Security Team",
      "user_id": 5,
      "user_name": "John Doe",
      "created_at": "2025-12-05T10:30:00Z",
      "updated_at": "2025-12-05T11:00:00Z",
      "tags": ["security", "authentication"],
      "custom_fields": {
        "alert_id": "1234567890",
        "source": "wazuh"
      }
    }
  ]
}
```

**Exemplo curl:**
```bash
curl -X GET "http://odoo:8069/api/v1/tickets?limit=10&stage=open&priority=high" \
  -H "Authorization: Bearer ${ODOO_TOKEN}"
```

**Exemplo Python:**
```python
import requests

def get_tickets(odoo_url, token, filters=None):
    """Listar tickets do Odoo."""

    url = f"{odoo_url}/api/v1/tickets"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    params = filters or {}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()

    return response.json()

# Exemplo de uso
tickets = get_tickets(
    odoo_url="http://odoo:8069",
    token="YOUR_TOKEN_HERE",
    filters={
        "limit": 20,
        "stage": "open",
        "priority": "high"
    }
)

print(f"Total de tickets: {tickets['total']}")
for ticket in tickets['tickets']:
    print(f"- {ticket['name']}: {ticket['description']}")
```

---

### POST /api/v1/tickets

Criar novo ticket no helpdesk.

**URL Completa:** `http://odoo:8069/api/v1/tickets`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "TICKET-001",
  "description": "Servidor apresentando alto uso de CPU",
  "priority": "high",
  "team_id": 1,
  "user_id": 5,
  "tags": ["infrastructure", "performance"],
  "custom_fields": {
    "asset_name": "server-01",
    "asset_ip": "192.168.1.100"
  }
}
```

**Response Body (201 Created):**
```json
{
  "status": "success",
  "ticket_id": 43,
  "ticket_name": "TICKET-001",
  "url": "/web#id=43&model=helpdesk.ticket"
}
```

**Códigos de Status:**
- `201 Created` - Ticket criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido
- `422 Unprocessable Entity` - Validação falhou

**Exemplo curl:**
```bash
curl -X POST "http://odoo:8069/api/v1/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ODOO_TOKEN}" \
  -d '{
    "name": "TICKET-001",
    "description": "Servidor com alto uso de CPU",
    "priority": "high",
    "team_id": 1,
    "tags": ["infrastructure"]
  }'
```

**Exemplo Python:**
```python
import requests

def create_ticket(odoo_url, token, ticket_data):
    """Criar ticket no Odoo."""

    url = f"{odoo_url}/api/v1/tickets"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    response = requests.post(url, headers=headers, json=ticket_data)
    response.raise_for_status()

    return response.json()

# Exemplo de uso
ticket = create_ticket(
    odoo_url="http://odoo:8069",
    token="YOUR_TOKEN_HERE",
    ticket_data={
        "name": "TICKET-002",
        "description": "Vulnerabilidade crítica detectada",
        "priority": "urgent",
        "team_id": 1,
        "tags": ["security", "vulnerability"]
    }
)

print(f"Ticket criado: {ticket['ticket_id']}")
```

---

### GET /api/v1/assets

Listar assets/dispositivos gerenciados.

**URL Completa:** `http://odoo:8069/api/v1/assets`

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=50
&offset=0
&status=active         # active, inactive, maintenance
&site=Datacenter-SP
&device_type=server
```

**Response Body (200 OK):**
```json
{
  "total": 250,
  "limit": 50,
  "offset": 0,
  "assets": [
    {
      "id": 15,
      "name": "server-01",
      "ip_address": "192.168.1.100",
      "status": "active",
      "device_type": "server",
      "manufacturer": "Dell",
      "model": "PowerEdge R740",
      "serial": "SRV123456",
      "site": "Datacenter-SP",
      "rack": "A1",
      "position": 10,
      "wazuh_agent_id": "001",
      "netbox_id": 123,
      "created_at": "2025-01-15T08:00:00Z",
      "updated_at": "2025-12-05T10:00:00Z"
    }
  ]
}
```

**Exemplo curl:**
```bash
curl -X GET "http://odoo:8069/api/v1/assets?status=active&site=Datacenter-SP" \
  -H "Authorization: Bearer ${ODOO_TOKEN}"
```

**Exemplo Python:**
```python
import requests

def get_assets(odoo_url, token, filters=None):
    """Listar assets do Odoo."""

    url = f"{odoo_url}/api/v1/assets"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    params = filters or {}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()

    return response.json()

# Exemplo de uso
assets = get_assets(
    odoo_url="http://odoo:8069",
    token="YOUR_TOKEN_HERE",
    filters={
        "status": "active",
        "device_type": "server"
    }
)

print(f"Total de assets: {assets['total']}")
for asset in assets['assets']:
    print(f"- {asset['name']} ({asset['ip_address']})")
```

---

## NetBox REST API

Base URL: `http://netbox:8000/api`

Documentação oficial: https://demo.netbox.dev/api/docs/

### Autenticação

```http
Authorization: Token 0123456789abcdef0123456789abcdef01234567
```

### Paginação

NetBox usa paginação baseada em offset/limit:

```bash
# Padrão: 50 resultados por página
GET /api/dcim/devices/?limit=100&offset=0
```

**Response:**
```json
{
  "count": 250,
  "next": "http://netbox:8000/api/dcim/devices/?limit=100&offset=100",
  "previous": null,
  "results": [...]
}
```

---

### GET /api/dcim/devices/

Listar dispositivos do datacenter.

**URL Completa:** `http://netbox:8000/api/dcim/devices/`

**Headers:**
```http
Authorization: Token <netbox_token>
Accept: application/json
```

**Query Parameters:**
```
?name=server-01        # Filtrar por nome
&site=datacenter-sp    # Filtrar por site
&status=active         # active, planned, staged, failed, inventory, decommissioning
&role=server           # Filtrar por role
&manufacturer=dell     # Filtrar por fabricante
&has_primary_ip=true   # Filtrar por IP primário
&limit=50
&offset=0
```

**Response Body (200 OK):**
```json
{
  "count": 250,
  "next": "http://netbox:8000/api/dcim/devices/?offset=50",
  "previous": null,
  "results": [
    {
      "id": 123,
      "url": "http://netbox:8000/api/dcim/devices/123/",
      "display": "server-01",
      "name": "server-01",
      "device_type": {
        "id": 10,
        "url": "http://netbox:8000/api/dcim/device-types/10/",
        "display": "Dell PowerEdge R740",
        "manufacturer": {
          "id": 1,
          "name": "Dell"
        },
        "model": "PowerEdge R740"
      },
      "device_role": {
        "id": 2,
        "name": "Server",
        "slug": "server"
      },
      "tenant": null,
      "platform": {
        "id": 5,
        "name": "Ubuntu 22.04"
      },
      "serial": "SRV123456",
      "asset_tag": "AST-001",
      "site": {
        "id": 1,
        "name": "Datacenter-SP",
        "slug": "datacenter-sp"
      },
      "location": {
        "id": 10,
        "name": "Floor 1"
      },
      "rack": {
        "id": 5,
        "name": "A1"
      },
      "position": 10,
      "face": "front",
      "status": {
        "value": "active",
        "label": "Active"
      },
      "primary_ip4": {
        "id": 100,
        "address": "192.168.1.100/24"
      },
      "primary_ip6": null,
      "comments": "Production server",
      "tags": [
        {"name": "production"},
        {"name": "critical"}
      ],
      "custom_fields": {
        "wazuh_agent_id": "001"
      },
      "created": "2025-01-15T08:00:00.000000Z",
      "last_updated": "2025-12-05T10:00:00.000000Z"
    }
  ]
}
```

**Exemplo curl:**
```bash
curl -X GET "http://netbox:8000/api/dcim/devices/?status=active&site=datacenter-sp" \
  -H "Authorization: Token ${NETBOX_TOKEN}" \
  -H "Accept: application/json"
```

**Exemplo Python:**
```python
import requests

def get_netbox_devices(netbox_url, token, filters=None):
    """Listar dispositivos do NetBox."""

    url = f"{netbox_url}/api/dcim/devices/"

    headers = {
        "Authorization": f"Token {token}",
        "Accept": "application/json"
    }

    params = filters or {}

    all_devices = []

    while url:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        all_devices.extend(data['results'])

        url = data['next']  # Próxima página
        params = {}  # Limpar params após primeira requisição

    return all_devices

# Exemplo de uso
devices = get_netbox_devices(
    netbox_url="http://netbox:8000",
    token="YOUR_NETBOX_TOKEN",
    filters={
        "status": "active",
        "role": "server"
    }
)

print(f"Total de dispositivos: {len(devices)}")
for device in devices:
    ip = device['primary_ip4']['address'] if device['primary_ip4'] else "N/A"
    print(f"- {device['name']}: {ip}")
```

---

### POST /api/dcim/devices/

Criar novo dispositivo no NetBox.

**URL Completa:** `http://netbox:8000/api/dcim/devices/`

**Headers:**
```http
Authorization: Token <netbox_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "server-02",
  "device_type": 10,
  "device_role": 2,
  "site": 1,
  "status": "active",
  "serial": "SRV654321",
  "asset_tag": "AST-002",
  "rack": 5,
  "position": 15,
  "face": "front",
  "comments": "New production server",
  "tags": [
    {"name": "production"}
  ],
  "custom_fields": {
    "wazuh_agent_id": "002"
  }
}
```

**Response Body (201 Created):**
```json
{
  "id": 124,
  "url": "http://netbox:8000/api/dcim/devices/124/",
  "display": "server-02",
  "name": "server-02",
  ...
}
```

**Códigos de Status:**
- `201 Created` - Dispositivo criado
- `400 Bad Request` - Dados inválidos
- `403 Forbidden` - Permissão negada
- `409 Conflict` - Nome duplicado

**Exemplo curl:**
```bash
curl -X POST "http://netbox:8000/api/dcim/devices/" \
  -H "Authorization: Token ${NETBOX_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "server-02",
    "device_type": 10,
    "device_role": 2,
    "site": 1,
    "status": "active"
  }'
```

**Exemplo Python:**
```python
import requests

def create_netbox_device(netbox_url, token, device_data):
    """Criar dispositivo no NetBox."""

    url = f"{netbox_url}/api/dcim/devices/"

    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=device_data)
    response.raise_for_status()

    return response.json()

# Exemplo de uso
device = create_netbox_device(
    netbox_url="http://netbox:8000",
    token="YOUR_NETBOX_TOKEN",
    device_data={
        "name": "switch-02",
        "device_type": 15,
        "device_role": 3,
        "site": 1,
        "status": "active"
    }
)

print(f"Dispositivo criado: {device['id']} - {device['name']}")
```

---

### GET /api/ipam/ip-addresses/

Listar endereços IP.

**URL Completa:** `http://netbox:8000/api/ipam/ip-addresses/`

**Headers:**
```http
Authorization: Token <netbox_token>
```

**Query Parameters:**
```
?address=192.168.1.100   # Filtrar por IP específico
&status=active           # active, reserved, deprecated, dhcp
&device=server-01        # Filtrar por dispositivo
&vrf_id=1               # Filtrar por VRF
&limit=50
```

**Response Body (200 OK):**
```json
{
  "count": 500,
  "results": [
    {
      "id": 100,
      "url": "http://netbox:8000/api/ipam/ip-addresses/100/",
      "display": "192.168.1.100/24",
      "address": "192.168.1.100/24",
      "vrf": null,
      "tenant": null,
      "status": {
        "value": "active",
        "label": "Active"
      },
      "role": null,
      "assigned_object_type": "dcim.interface",
      "assigned_object_id": 200,
      "assigned_object": {
        "id": 200,
        "url": "http://netbox:8000/api/dcim/interfaces/200/",
        "display": "eth0",
        "device": {
          "id": 123,
          "name": "server-01"
        },
        "name": "eth0"
      },
      "dns_name": "server-01.example.com",
      "description": "Primary IP",
      "tags": [],
      "created": "2025-01-15T08:00:00.000000Z",
      "last_updated": "2025-12-05T10:00:00.000000Z"
    }
  ]
}
```

**Exemplo curl:**
```bash
curl -X GET "http://netbox:8000/api/ipam/ip-addresses/?device=server-01" \
  -H "Authorization: Token ${NETBOX_TOKEN}"
```

**Exemplo Python:**
```python
import requests

def get_ip_addresses(netbox_url, token, filters=None):
    """Listar endereços IP do NetBox."""

    url = f"{netbox_url}/api/ipam/ip-addresses/"

    headers = {
        "Authorization": f"Token {token}"
    }

    params = filters or {}

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()

    return response.json()

# Exemplo de uso
ips = get_ip_addresses(
    netbox_url="http://netbox:8000",
    token="YOUR_NETBOX_TOKEN",
    filters={"device": "server-01"}
)

print(f"IPs encontrados: {ips['count']}")
for ip in ips['results']:
    print(f"- {ip['address']}: {ip['dns_name']}")
```

---

### POST /api/extras/webhooks/

Criar webhook no NetBox.

**URL Completa:** `http://netbox:8000/api/extras/webhooks/`

**Headers:**
```http
Authorization: Token <netbox_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Odoo Sync Webhook",
  "enabled": true,
  "type_create": true,
  "type_update": true,
  "type_delete": false,
  "payload_url": "http://odoo:8069/api/v1/netbox/webhook",
  "http_method": "POST",
  "http_content_type": "application/json",
  "additional_headers": "Authorization: Bearer YOUR_ODOO_TOKEN",
  "body_template": "{{ data }}",
  "secret": "webhook_secret_key",
  "ssl_verification": true,
  "ca_file_path": null,
  "content_types": [
    "dcim.device",
    "dcim.interface",
    "ipam.ipaddress"
  ]
}
```

**Response Body (201 Created):**
```json
{
  "id": 1,
  "url": "http://netbox:8000/api/extras/webhooks/1/",
  "display": "Odoo Sync Webhook",
  "name": "Odoo Sync Webhook",
  ...
}
```

**Exemplo curl:**
```bash
curl -X POST "http://netbox:8000/api/extras/webhooks/" \
  -H "Authorization: Token ${NETBOX_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Odoo Sync",
    "enabled": true,
    "type_create": true,
    "payload_url": "http://odoo:8069/api/v1/netbox/webhook",
    "http_method": "POST",
    "content_types": ["dcim.device"]
  }'
```

**Exemplo Python:**
```python
import requests

def create_webhook(netbox_url, token, webhook_data):
    """Criar webhook no NetBox."""

    url = f"{netbox_url}/api/extras/webhooks/"

    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, json=webhook_data)
    response.raise_for_status()

    return response.json()

# Exemplo de uso
webhook = create_webhook(
    netbox_url="http://netbox:8000",
    token="YOUR_NETBOX_TOKEN",
    webhook_data={
        "name": "Odoo Device Sync",
        "enabled": True,
        "type_create": True,
        "type_update": True,
        "payload_url": "http://odoo:8069/api/v1/netbox/webhook",
        "http_method": "POST",
        "content_types": ["dcim.device"]
    }
)

print(f"Webhook criado: {webhook['id']} - {webhook['name']}")
```

---

## Wazuh API

Base URL: `https://wazuh:55000`

Documentação oficial: https://documentation.wazuh.com/current/user-manual/api/reference.html

### Autenticação

Wazuh API usa JWT Bearer tokens.

#### 1. Obter Token JWT

```bash
curl -u admin:SecretPassword -k -X GET \
  "https://wazuh:55000/security/user/authenticate"
```

**Response:**
```json
{
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzUxMiJ9.eyJpc3MiOiJ3YXp1aCIsImF1ZCI6IldhenVoIEFQSSBSRVNUIiwibmJmIjoxNzMzMzk5NDAwLCJleHAiOjE3MzMzOTk0MDAsInN1YiI6IndhenVoIiwicnVuX2FzIjpmYWxzZSwicmJhY19yb2xlcyI6WzFdLCJyYmFjX21vZGUiOiJ3aGl0ZSJ9..."
  }
}
```

**Token expira em 900 segundos (15 minutos).**

---

### GET /security/user/authenticate

Autenticar e obter JWT token.

**URL Completa:** `https://wazuh:55000/security/user/authenticate`

**Headers:**
```http
Authorization: Basic base64(username:password)
```

**Response Body (200 OK):**
```json
{
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzUxMiJ9..."
  },
  "error": 0
}
```

**Exemplo curl:**
```bash
# Método 1: Basic Auth
curl -u admin:SecretPassword -k -X GET \
  "https://wazuh:55000/security/user/authenticate"

# Método 2: Header Authorization
curl -k -X GET \
  -H "Authorization: Basic $(echo -n 'admin:SecretPassword' | base64)" \
  "https://wazuh:55000/security/user/authenticate"
```

**Exemplo Python:**
```python
import requests
from requests.auth import HTTPBasicAuth
import urllib3

# Desabilitar warnings SSL (apenas dev)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_wazuh_token(wazuh_url, username, password):
    """Obter JWT token do Wazuh."""

    url = f"{wazuh_url}/security/user/authenticate"

    response = requests.get(
        url,
        auth=HTTPBasicAuth(username, password),
        verify=False  # Desabilitar verificação SSL (apenas dev)
    )
    response.raise_for_status()

    return response.json()['data']['token']

# Exemplo de uso
token = get_wazuh_token(
    wazuh_url="https://wazuh:55000",
    username="admin",
    password="SecretPassword"
)

print(f"Token obtido: {token[:50]}...")
```

---

### GET /agents

Listar agentes Wazuh.

**URL Completa:** `https://wazuh:55000/agents`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
?limit=50              # Limite de resultados
&offset=0              # Offset para paginação
&status=active         # active, disconnected, never_connected, pending
&q=name~server         # Query de busca
&select=id,name,ip,status  # Campos a retornar
&sort=+name            # Ordenação (+asc, -desc)
```

**Response Body (200 OK):**
```json
{
  "data": {
    "affected_items": [
      {
        "id": "001",
        "name": "server-01",
        "ip": "192.168.1.100",
        "status": "active",
        "dateAdd": "2025-01-15T08:00:00Z",
        "lastKeepAlive": "2025-12-05T10:30:00Z",
        "os": {
          "name": "Ubuntu",
          "platform": "ubuntu",
          "version": "22.04",
          "codename": "Jammy Jellyfish",
          "arch": "x86_64"
        },
        "version": "4.7.0",
        "manager": "wazuh-manager",
        "node_name": "node01"
      }
    ],
    "total_affected_items": 150,
    "total_failed_items": 0,
    "failed_items": []
  },
  "error": 0
}
```

**Exemplo curl:**
```bash
# 1. Obter token
TOKEN=$(curl -u admin:SecretPassword -k -X GET \
  "https://wazuh:55000/security/user/authenticate" \
  | jq -r '.data.token')

# 2. Listar agentes
curl -k -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "https://wazuh:55000/agents?status=active&limit=10"
```

**Exemplo Python:**
```python
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class WazuhAPI:
    def __init__(self, url, username, password):
        self.url = url
        self.token = self._authenticate(username, password)

    def _authenticate(self, username, password):
        """Autenticar e obter token."""
        response = requests.get(
            f"{self.url}/security/user/authenticate",
            auth=(username, password),
            verify=False
        )
        response.raise_for_status()
        return response.json()['data']['token']

    def get_agents(self, filters=None):
        """Listar agentes."""
        headers = {"Authorization": f"Bearer {self.token}"}
        params = filters or {}

        response = requests.get(
            f"{self.url}/agents",
            headers=headers,
            params=params,
            verify=False
        )
        response.raise_for_status()

        return response.json()['data']

# Exemplo de uso
wazuh = WazuhAPI(
    url="https://wazuh:55000",
    username="admin",
    password="SecretPassword"
)

agents = wazuh.get_agents(filters={"status": "active", "limit": 10})

print(f"Total de agentes: {agents['total_affected_items']}")
for agent in agents['affected_items']:
    print(f"- {agent['name']} ({agent['ip']}): {agent['status']}")
```

---

### GET /sca/{agent_id}

Obter resultados de Security Configuration Assessment (SCA) de um agente.

**URL Completa:** `https://wazuh:55000/sca/001`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
?limit=50
&offset=0
&policy_id=cis_ubuntu22_linux  # Filtrar por política específica
```

**Response Body (200 OK):**
```json
{
  "data": {
    "affected_items": [
      {
        "name": "CIS Ubuntu Linux 22.04 Benchmark",
        "policy_id": "cis_ubuntu22_linux",
        "description": "CIS Benchmark for Ubuntu Linux 22.04",
        "references": "https://www.cisecurity.org/cis-benchmarks/",
        "pass": 85,
        "fail": 10,
        "invalid": 2,
        "total_checks": 97,
        "score": 87,
        "start_scan": "2025-12-05T10:00:00Z",
        "end_scan": "2025-12-05T10:05:00Z"
      }
    ],
    "total_affected_items": 1
  },
  "error": 0
}
```

**Exemplo curl:**
```bash
curl -k -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "https://wazuh:55000/sca/001?policy_id=cis_ubuntu22_linux"
```

**Exemplo Python:**
```python
def get_sca_results(wazuh_api, agent_id, policy_id=None):
    """Obter resultados SCA de um agente."""

    headers = {"Authorization": f"Bearer {wazuh_api.token}"}
    params = {}

    if policy_id:
        params['policy_id'] = policy_id

    response = requests.get(
        f"{wazuh_api.url}/sca/{agent_id}",
        headers=headers,
        params=params,
        verify=False
    )
    response.raise_for_status()

    return response.json()['data']

# Exemplo de uso
sca_results = get_sca_results(
    wazuh_api=wazuh,
    agent_id="001",
    policy_id="cis_ubuntu22_linux"
)

for policy in sca_results['affected_items']:
    print(f"Policy: {policy['name']}")
    print(f"Score: {policy['score']}%")
    print(f"Pass: {policy['pass']} | Fail: {policy['fail']}")
```

---

### GET /vulnerability/{agent_id}

Obter vulnerabilidades detectadas em um agente.

**URL Completa:** `https://wazuh:55000/vulnerability/001`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
?limit=50
&offset=0
&severity=High,Critical   # Filtrar por severidade
&status=active            # active, resolved
```

**Response Body (200 OK):**
```json
{
  "data": {
    "affected_items": [
      {
        "cve": "CVE-2024-1234",
        "title": "OpenSSL Vulnerability",
        "severity": "Critical",
        "cvss": {
          "cvss2": {"score": 7.5},
          "cvss3": {"score": 9.8}
        },
        "name": "openssl",
        "version": "1.1.1f-1ubuntu2",
        "architecture": "amd64",
        "condition": "Package less than 1.1.1f-1ubuntu2.16",
        "published": "2024-03-15T10:00:00Z",
        "detected_at": "2025-12-05T08:00:00Z",
        "status": "active",
        "external_references": [
          "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-1234"
        ]
      }
    ],
    "total_affected_items": 15
  },
  "error": 0
}
```

**Exemplo curl:**
```bash
curl -k -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "https://wazuh:55000/vulnerability/001?severity=High,Critical"
```

**Exemplo Python:**
```python
def get_vulnerabilities(wazuh_api, agent_id, severity=None):
    """Obter vulnerabilidades de um agente."""

    headers = {"Authorization": f"Bearer {wazuh_api.token}"}
    params = {}

    if severity:
        params['severity'] = severity

    response = requests.get(
        f"{wazuh_api.url}/vulnerability/{agent_id}",
        headers=headers,
        params=params,
        verify=False
    )
    response.raise_for_status()

    return response.json()['data']

# Exemplo de uso
vulns = get_vulnerabilities(
    wazuh_api=wazuh,
    agent_id="001",
    severity="High,Critical"
)

print(f"Vulnerabilidades críticas: {vulns['total_affected_items']}")
for vuln in vulns['affected_items']:
    print(f"- {vuln['cve']}: {vuln['title']} (Score: {vuln['cvss']['cvss3']['score']})")
```

---

### POST /active-response

Executar resposta ativa em agentes.

**URL Completa:** `https://wazuh:55000/active-response`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "command": "restart-wazuh",
  "arguments": [],
  "alert": {
    "data": {}
  },
  "custom": false,
  "agents_list": ["001", "002"]
}
```

**Commands disponíveis:**
- `restart-wazuh` - Reiniciar agente
- `firewall-drop` - Bloquear IP no firewall
- `disable-account` - Desabilitar conta de usuário
- `custom-script` - Executar script customizado

**Response Body (200 OK):**
```json
{
  "data": {
    "affected_items": ["001", "002"],
    "total_affected_items": 2,
    "total_failed_items": 0,
    "failed_items": []
  },
  "error": 0
}
```

**Exemplo curl:**
```bash
curl -k -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://wazuh:55000/active-response" \
  -d '{
    "command": "restart-wazuh",
    "agents_list": ["001"]
  }'
```

**Exemplo Python:**
```python
def active_response(wazuh_api, command, agents_list, arguments=None):
    """Executar resposta ativa."""

    headers = {
        "Authorization": f"Bearer {wazuh_api.token}",
        "Content-Type": "application/json"
    }

    data = {
        "command": command,
        "arguments": arguments or [],
        "agents_list": agents_list,
        "custom": False
    }

    response = requests.post(
        f"{wazuh_api.url}/active-response",
        headers=headers,
        json=data,
        verify=False
    )
    response.raise_for_status()

    return response.json()['data']

# Exemplo de uso: Bloquear IP malicioso
result = active_response(
    wazuh_api=wazuh,
    command="firewall-drop",
    agents_list=["001"],
    arguments=["add", "10.0.0.1"]
)

print(f"Resposta ativa executada em {result['total_affected_items']} agentes")
```

---

## Rate Limiting

### Odoo FastAPI

```
Rate Limit: 100 requisições/minuto por token
Headers:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1733399460
```

**429 Too Many Requests:**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Try again in 30 seconds."
}
```

### NetBox REST API

```
Rate Limit: 1000 requisições/hora por token
Headers:
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 950
```

### Wazuh API

```
Rate Limit: 300 requisições/minuto
Token Expiration: 900 segundos (15 minutos)
```

**Renovar token:**
```python
def ensure_token(wazuh_api):
    """Garantir que token seja válido."""
    # Implementar lógica de renovação automática
    if token_expired():
        wazuh_api.token = wazuh_api._authenticate(username, password)
```

---

## Códigos de Erro

### Códigos HTTP Comuns

| Código | Significado | Ação |
|--------|-------------|------|
| 200 OK | Sucesso | - |
| 201 Created | Recurso criado | - |
| 400 Bad Request | Dados inválidos | Validar JSON e campos obrigatórios |
| 401 Unauthorized | Autenticação falhou | Verificar token/credenciais |
| 403 Forbidden | Sem permissão | Verificar roles e permissões |
| 404 Not Found | Recurso não existe | Verificar ID/URL |
| 409 Conflict | Conflito (duplicado) | Verificar unicidade |
| 422 Unprocessable Entity | Validação falhou | Verificar regras de negócio |
| 429 Too Many Requests | Rate limit excedido | Implementar backoff |
| 500 Internal Server Error | Erro no servidor | Verificar logs |
| 503 Service Unavailable | Serviço indisponível | Retry com backoff |

### Odoo FastAPI - Erros

```json
{
  "error": "validation_error",
  "message": "Invalid request body",
  "details": {
    "field": "priority",
    "error": "Must be one of: low, medium, high, urgent"
  }
}
```

### NetBox - Erros

```json
{
  "detail": "Device with this name already exists.",
  "error": "unique_constraint_violation"
}
```

### Wazuh - Erros

```json
{
  "title": "Unauthorized",
  "detail": "Invalid token",
  "error": 6000
}
```

**Códigos de erro Wazuh:**
- `6000` - Token inválido/expirado
- `1701` - Agente não encontrado
- `1707` - Erro ao executar comando

---

## Troubleshooting

### Problema: Token expirado

**Sintoma:**
```json
{
  "error": "token_expired",
  "message": "Access token has expired"
}
```

**Solução:**
```python
# Implementar refresh automático
def request_with_retry(url, token, max_retries=1):
    response = requests.get(url, headers={"Authorization": f"Bearer {token}"})

    if response.status_code == 401 and max_retries > 0:
        # Renovar token
        new_token = get_new_token()
        return request_with_retry(url, new_token, max_retries - 1)

    return response
```

### Problema: Rate Limit Exceeded

**Sintoma:**
```json
{
  "error": "rate_limit_exceeded"
}
```

**Solução:**
```python
import time
from functools import wraps

def retry_with_backoff(max_retries=3, backoff_factor=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    response = func(*args, **kwargs)

                    if response.status_code == 429:
                        wait_time = backoff_factor ** attempt
                        print(f"Rate limited. Waiting {wait_time}s...")
                        time.sleep(wait_time)
                        continue

                    return response
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(backoff_factor ** attempt)

        return wrapper
    return decorator

@retry_with_backoff(max_retries=3)
def api_call(url, headers):
    return requests.get(url, headers=headers)
```

### Problema: SSL Certificate Verification Failed

**Sintoma:**
```
SSLError: [SSL: CERTIFICATE_VERIFY_FAILED]
```

**Solução (Desenvolvimento):**
```python
import urllib3

# Desabilitar warnings (apenas dev)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Requests
response = requests.get(url, verify=False)
```

**Solução (Produção):**
```python
# Usar certificados válidos
response = requests.get(url, verify='/path/to/ca-bundle.crt')
```

### Problema: Webhook não está sendo recebido

**Checklist:**
1. Verificar conectividade de rede
```bash
docker exec netbox curl -v http://odoo:8069/api/v1/netbox/webhook
```

2. Verificar logs do webhook no NetBox
```bash
docker logs netbox | grep webhook
```

3. Verificar configuração do webhook
```bash
curl -X GET "http://netbox:8000/api/extras/webhooks/" \
  -H "Authorization: Token ${NETBOX_TOKEN}"
```

4. Testar manualmente
```bash
curl -X POST "http://odoo:8069/api/v1/netbox/webhook" \
  -H "Authorization: Bearer ${ODOO_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"event": "created", "model": "dcim.device", "data": {...}}'
```

### Problema: Paginação não funciona corretamente

**NetBox - Iterar todas as páginas:**
```python
def get_all_pages(netbox_url, token, endpoint):
    """Obter todos os resultados paginados."""

    headers = {"Authorization": f"Token {token}"}
    url = f"{netbox_url}/api/{endpoint}"
    all_results = []

    while url:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()
        all_results.extend(data['results'])

        url = data['next']  # Próxima página

    return all_results
```

### Problema: Autenticação Wazuh falhando

**Verificar credenciais:**
```bash
# Testar autenticação básica
curl -u admin:SecretPassword -k -X GET \
  "https://wazuh:55000/security/user/authenticate" \
  -v
```

**Verificar se API está acessível:**
```bash
docker exec wazuh-manager curl -k https://localhost:55000
```

**Resetar senha (se necessário):**
```bash
docker exec wazuh-manager /var/ossec/bin/wazuh-keystore -f indexer -k password -v NewPassword
```

---

## Exemplos Completos de Integração

### Exemplo 1: Pipeline Wazuh → Odoo

```python
#!/usr/bin/env python3
"""
Pipeline: Wazuh Alert → Odoo Ticket
"""

import requests
import json
from datetime import datetime

class WazuhOdooPipeline:
    def __init__(self, odoo_url, odoo_token):
        self.odoo_url = odoo_url
        self.odoo_token = odoo_token

    def process_wazuh_alert(self, alert):
        """Processar alerta Wazuh e criar ticket Odoo."""

        # Transformar alerta para formato Odoo
        ticket_data = self._transform_alert(alert)

        # Criar ticket
        response = self._create_ticket(ticket_data)

        return response

    def _transform_alert(self, alert):
        """Transformar alerta Wazuh para formato Odoo."""

        return {
            "name": f"ALERT-{alert['agent']['id']}-{alert['rule']['id']}",
            "description": f"{alert['rule']['description']}\n\nFull Log: {alert['full_log']}",
            "priority": self._map_priority(alert['rule']['level']),
            "team_id": 1,  # Security Team
            "tags": ["security", "wazuh"],
            "custom_fields": {
                "alert_id": alert['id'],
                "rule_id": alert['rule']['id'],
                "agent_id": alert['agent']['id'],
                "source": "wazuh"
            }
        }

    def _map_priority(self, level):
        """Mapear nível Wazuh para prioridade Odoo."""
        if level >= 12:
            return "urgent"
        elif level >= 8:
            return "high"
        elif level >= 5:
            return "medium"
        else:
            return "low"

    def _create_ticket(self, ticket_data):
        """Criar ticket no Odoo."""

        url = f"{self.odoo_url}/api/v1/tickets"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.odoo_token}"
        }

        response = requests.post(url, headers=headers, json=ticket_data)
        response.raise_for_status()

        return response.json()

# Exemplo de uso
pipeline = WazuhOdooPipeline(
    odoo_url="http://odoo:8069",
    odoo_token="YOUR_TOKEN"
)

alert = {
    "id": "1234567890",
    "timestamp": "2025-12-05T10:30:00.000Z",
    "rule": {"id": "5710", "description": "Authentication failure", "level": 10},
    "agent": {"id": "001", "name": "server-01"},
    "full_log": "Failed password for admin"
}

result = pipeline.process_wazuh_alert(alert)
print(f"Ticket criado: {result['ticket_id']}")
```

### Exemplo 2: Sync NetBox → Odoo

```python
#!/usr/bin/env python3
"""
Sincronização: NetBox Devices → Odoo Assets
"""

import requests

class NetBoxOdooSync:
    def __init__(self, netbox_url, netbox_token, odoo_url, odoo_token):
        self.netbox_url = netbox_url
        self.netbox_token = netbox_token
        self.odoo_url = odoo_url
        self.odoo_token = odoo_token

    def sync_all_devices(self):
        """Sincronizar todos os dispositivos NetBox → Odoo."""

        devices = self._get_netbox_devices()

        synced = 0
        failed = 0

        for device in devices:
            try:
                self._sync_device(device)
                synced += 1
            except Exception as e:
                print(f"Erro ao sincronizar {device['name']}: {e}")
                failed += 1

        return {"synced": synced, "failed": failed}

    def _get_netbox_devices(self):
        """Obter todos os dispositivos do NetBox."""

        headers = {"Authorization": f"Token {self.netbox_token}"}
        url = f"{self.netbox_url}/api/dcim/devices/"

        all_devices = []

        while url:
            response = requests.get(url, headers=headers)
            response.raise_for_status()

            data = response.json()
            all_devices.extend(data['results'])
            url = data['next']

        return all_devices

    def _sync_device(self, device):
        """Sincronizar dispositivo individual."""

        asset_data = {
            "name": device['name'],
            "ip_address": device['primary_ip4']['address'] if device['primary_ip4'] else None,
            "status": device['status']['value'],
            "device_type": device['device_role']['name'],
            "manufacturer": device['device_type']['manufacturer']['name'],
            "model": device['device_type']['model'],
            "serial": device['serial'],
            "site": device['site']['name'],
            "netbox_id": device['id']
        }

        # Verificar se asset já existe
        existing = self._find_asset(device['id'])

        if existing:
            return self._update_asset(existing['id'], asset_data)
        else:
            return self._create_asset(asset_data)

    def _find_asset(self, netbox_id):
        """Buscar asset existente no Odoo."""

        url = f"{self.odoo_url}/api/v1/assets?netbox_id={netbox_id}"
        headers = {"Authorization": f"Bearer {self.odoo_token}"}

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()
        return data['assets'][0] if data['assets'] else None

    def _create_asset(self, asset_data):
        """Criar novo asset no Odoo."""

        url = f"{self.odoo_url}/api/v1/assets"
        headers = {
            "Authorization": f"Bearer {self.odoo_token}",
            "Content-Type": "application/json"
        }

        response = requests.post(url, headers=headers, json=asset_data)
        response.raise_for_status()

        return response.json()

    def _update_asset(self, asset_id, asset_data):
        """Atualizar asset existente."""

        url = f"{self.odoo_url}/api/v1/assets/{asset_id}"
        headers = {
            "Authorization": f"Bearer {self.odoo_token}",
            "Content-Type": "application/json"
        }

        response = requests.put(url, headers=headers, json=asset_data)
        response.raise_for_status()

        return response.json()

# Exemplo de uso
sync = NetBoxOdooSync(
    netbox_url="http://netbox:8000",
    netbox_token="YOUR_NETBOX_TOKEN",
    odoo_url="http://odoo:8069",
    odoo_token="YOUR_ODOO_TOKEN"
)

result = sync.sync_all_devices()
print(f"Sincronização completa: {result['synced']} sucesso, {result['failed']} falhas")
```

---

## Referências Externas

- **Odoo API Documentation**: https://www.odoo.com/documentation/17.0/developer/reference/external_api.html
- **FastAPI Framework**: https://fastapi.tiangolo.com/
- **NetBox REST API**: https://demo.netbox.dev/api/docs/
- **Wazuh API Reference**: https://documentation.wazuh.com/current/user-manual/api/reference.html
- **Python Requests Library**: https://requests.readthedocs.io/

---

**Última atualização:** 2025-12-05
**Versão:** 2.0.0
