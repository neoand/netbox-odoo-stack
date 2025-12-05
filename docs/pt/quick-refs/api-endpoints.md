# 🔌 API Endpoints Reference

> **Todos os endpoints REST e GraphQL essenciais**

---

## 🔑 **Autenticação**

```bash
# Bearer Token
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/dcim/devices/

# Query String
curl http://localhost:8000/api/dcim/devices/?token=YOUR_TOKEN

# Session (cookies)
curl -X POST \
  -d "username=admin&password=admin" \
  http://localhost:8000/api/login/
```

---

## 🏗️ **Sites & Locations**

```bash
# GET list sites
GET /api/dcim/sites/

# GET specific site
GET /api/dcim/sites/{id}/

# POST create site
POST /api/dcim/sites/
{
  "name": "São Paulo HQ",
  "slug": "sao-paulo",
  "physical_address": "Rua Example, 123"
}

# PUT update site
PUT /api/dcim/sites/{id}/
{
  "status": "active",
  "description": "Updated description"
}

# DELETE site
DELETE /api/dcim/sites/{id}/
```

---

## 💻 **Devices**

```bash
# GET devices
GET /api/dcim/devices/

# Filters
GET /api/dcim/devices/?site=1
GET /api/dcim/devices/?status=active
GET /api/dcim/devices/?device_type=1
GET /api/dcim/devices/?limit=100
GET /api/dcim/devices/?offset=0

# GET device details
GET /api/dcim/devices/{id}/

# POST create device
POST /api/dcim/devices/
{
  "name": "Switch-Core-01",
  "device_type": 1,
  "device_role": 1,
  "site": 1,
  "rack": 1,
  "position": 1,
  "status": "active"
}

# PUT/PATCH update
PUT /api/dcim/devices/{id}/
PATCH /api/dcim/devices/{id}/
{
  "status": "offline",
  "serial": "SN123456"
}

# DELETE device
DELETE /api/dcim/devices/{id}/
```

---

## 🌐 **IPAM (IPs & Prefixes)**

```bash
# IP Addresses
GET /api/ipam/ip-addresses/
GET /api/ipam/ip-addresses/?limit=1000

# Create IP
POST /api/ipam/ip-addresses/
{
  "family": 4,
  "address": "192.168.1.10/24",
  "status": "active",
  "interface": 1
}

# Prefixes
GET /api/ipam/prefixes/
GET /api/ipam/prefixes/?prefix=192.168.0.0/16

# Create prefix
POST /api/ipam/prefixes/
{
  "prefix": "10.0.0.0/24",
  "site": 1,
  "status": "active"
}

# Available IPs
GET /api/ipam/prefixes/{id}/available-ips/
```

---

## 🏷️ **VLANs**

```bash
# VLANs
GET /api/ipam/vlans/

# Create VLAN
POST /api/ipam/vlans/
{
  "vid": 100,
  "name": "VLAN-USERS",
  "site": 1,
  "status": "active"
}

# Filters
GET /api/ipam/vlans/?site=1
GET /api/ipam/vlans/?group=1
```

---

## 🔌 **Interfaces**

```bash
# Interfaces
GET /api/dcim/interfaces/

# Create interface
POST /api/dcim/interfaces/
{
  "device": 1,
  "name": "GigabitEthernet0/1",
  "type": "1000base-t",
  "enabled": true
}

# Update interface
PUT /api/dcim/interfaces/{id}/
{
  "description": "Uplink to Core",
  "enabled": false
}

# Interface connections
GET /api/dcim/interface-cable-terminations/
```

---

## 📦 **Inventory**

```bash
# Inventory items
GET /api/dcim/inventory-items/

# Create inventory item
POST /api/dcim/inventory-items/
{
  "device": 1,
  "name": "Memory Module",
  "manufacturer": 1,
  "part_id": "DDR4-16GB",
  "serial": "MEM123456"
}
```

---

## ⚙️ **Configuration Templates**

```bash
# Templates
GET /api/extras/config-templates/

# Create template
POST /api/extras/config-templates/
{
  "name": "Cisco IOS",
  "template_code": "interface {{ interface.name }}",
  "environment": "cisco_ios"
}

# Render template
POST /api/extras/config-templates/{id}/render/
{
  "data": {
    "interface": {"name": "GigabitEthernet0/1"}
  }
}
```

---

## 🔐 **Users & Groups**

```bash
# Users
GET /api/users/users/

# Create user
POST /api/users/users/
{
  "username": "jose.silva",
  "email": "jose@empresa.com",
  "password": "senha123",
  "first_name": "José",
  "last_name": "Silva"
}

# Groups
GET /api/auth/groups/
```

---

## 📊 **Search & Filtering**

```bash
# Global search
GET /api/search/?q=switch

# Multiple filters
GET /api/dcim/devices/?site=1&status=active&limit=100

# Ordering
GET /api/dcim/devices/?ordering=name
GET /api/dcim/devices/?ordering=-created

# Custom fields
GET /api/dcim/devices/?cf_warranty_end_date=2025-12-31
```

---

## 📈 **GraphQL**

```bash
# GraphQL endpoint
POST /graphql/

# Query devices
POST /graphql/
{
  "query": `
    query {
      devices {
        id
        name
        status
        site {
          name
        }
      }
    }
  `
}

# Create device mutation
POST /graphql/
{
  "query": `
    mutation {
      createDevice(input: {
        name: "Switch-01"
        deviceType: 1
        site: 1
      }) {
        device {
          id
          name
        }
      }
    }
  `
}

# Nested queries
POST /graphql/
{
  "query": `
    query {
      sites {
        name
        devices {
          name
          interfaces {
            name
            ipAddresses {
              address
            }
          }
        }
      }
    }
  `
}
```

---

## 🔌 **Webhooks**

```bash
# Webhooks
GET /api/extras/webhooks/

# Create webhook
POST /api/extras/webhooks/
{
  "name": "Device Created",
  "url": "https://your-app.com/webhooks/netbox",
  "events": ["device.create"],
  "http_method": "POST",
  "http_content_type": "application/json"
}
```

---

## 📦 **Bulk Operations**

```bash
# Bulk create (API v2.1+)
POST /api/dcim/devices/bulk/
[
  {"name": "Switch-01", "device_type": 1},
  {"name": "Switch-02", "device_type": 1}
]

# Bulk update
PATCH /api/dcim/devices/
[
  {"id": 1, "status": "offline"},
  {"id": 2, "status": "offline"}
]
```

---

## 📊 **Statistics & Reports**

```bash
# Stats
GET /api/status/

# Reports
GET /api/extras/reports/

# Run report
POST /api/extras/reports/{id}/run/

# Journal entries
GET /api/extras/journal-entries/
```

---

## 🔍 **cURL Examples**

### **GET Devices**
```bash
curl -H "Authorization: Token abc123" \
  http://localhost:8000/api/dcim/devices/ \
  | jq
```

### **POST Device**
```bash
curl -X POST \
  -H "Authorization: Token abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Switch-01",
    "device_type": 1,
    "site": 1
  }' \
  http://localhost:8000/api/dcim/devices/
```

### **Search Devices**
```bash
curl -H "Authorization: Token abc123" \
  "http://localhost:8000/api/dcim/devices/?search=core"
```

---

## 🐍 **Python Examples**

```python
import requests

token = "YOUR_TOKEN"
base_url = "http://localhost:8000/api"

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

# GET devices
response = requests.get(f"{base_url}/dcim/devices/", headers=headers)
devices = response.json()

# POST device
data = {
    "name": "Switch-01",
    "device_type": 1,
    "site": 1,
    "status": "active"
}
response = requests.post(f"{base_url}/dcim/devices/", json=data, headers=headers)
device = response.json()

# PUT update
data = {"status": "offline"}
response = requests.put(f"{base_url}/dcim/devices/1/", json=data, headers=headers)
```

---

## ⚙️ **Pagination**

```bash
# Page size
GET /api/dcim/devices/?limit=100
GET /api/dcim/devices/?offset=0

# Total count
GET /api/dcim/devices/?limit=1
# Response: {"count": 1250, "next": "...", "previous": null}

# Next page
GET /api/dcim/devices/?limit=100&offset=100
```

---

## 🔐 **Error Handling**

```bash
# 400 Bad Request
{
  "site": ["This field is required"]
}

# 401 Unauthorized
{
  "detail": "Authentication credentials were not provided"
}

# 403 Forbidden
{
  "detail": "You do not have permission to perform this action"
}

# 404 Not Found
{
  "detail": "Not found"
}

# 429 Rate Limit
{
  "detail": "Request was throttled. Expected available in 60 seconds"
}
```

---

## 📚 **Python SDK (pynetbox)**

```python
import pynetbox

# Initialize
nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

# Query
devices = nb.dcim.devices.all()
sites = nb.dcim.sites.get(1)

# Create
site = nb.dcim.sites.create(
    name="São Paulo",
    slug="sao-paulo"
)

# Update
device = nb.dcim.devices.get(1)
device.status = "offline"
device.save()

# Delete
device.delete()
```

---

**🔌 Total: 80+ endpoints | REST + GraphQL | Examples PT**
