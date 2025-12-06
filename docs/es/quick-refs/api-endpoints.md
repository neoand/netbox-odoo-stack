# 🔌 Referencia de API Endpoints

> **Todos los endpoints REST y GraphQL esenciales**

---

## 🔑 **Autenticación**

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

## 🏗️ **Sitios & Ubicaciones**

```bash
# GET listar sitios
GET /api/dcim/sites/

# GET sitio específico
GET /api/dcim/sites/{id}/

# POST crear sitio
POST /api/dcim/sites/
{
  "name": "Ciudad de México HQ",
  "slug": "cdmx",
  "physical_address": "Calle Ejemplo, 123"
}

# PUT actualizar sitio
PUT /api/dcim/sites/{id}/
{
  "status": "active",
  "description": "Descripción actualizada"
}

# DELETE sitio
DELETE /api/dcim/sites/{id}/
```

---

## 💻 **Dispositivos**

```bash
# GET dispositivos
GET /api/dcim/devices/

# Filtros
GET /api/dcim/devices/?site=1
GET /api/dcim/devices/?status=active
GET /api/dcim/devices/?device_type=1
GET /api/dcim/devices/?limit=100
GET /api/dcim/devices/?offset=0

# GET detalles de dispositivo
GET /api/dcim/devices/{id}/

# POST crear dispositivo
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

# PUT/PATCH actualizar
PUT /api/dcim/devices/{id}/
PATCH /api/dcim/devices/{id}/
{
  "status": "offline",
  "serial": "SN123456"
}

# DELETE dispositivo
DELETE /api/dcim/devices/{id}/
```

---

## 🌐 **IPAM (IPs & Prefijos)**

```bash
# Direcciones IP
GET /api/ipam/ip-addresses/
GET /api/ipam/ip-addresses/?limit=1000

# Crear IP
POST /api/ipam/ip-addresses/
{
  "family": 4,
  "address": "192.168.1.10/24",
  "status": "active",
  "interface": 1
}

# Prefijos
GET /api/ipam/prefixes/
GET /api/ipam/prefixes/?prefix=192.168.0.0/16

# Crear prefijo
POST /api/ipam/prefixes/
{
  "prefix": "10.0.0.0/24",
  "site": 1,
  "status": "active"
}

# IPs disponibles
GET /api/ipam/prefixes/{id}/available-ips/
```

---

## 🏷️ **VLANs**

```bash
# VLANs
GET /api/ipam/vlans/

# Crear VLAN
POST /api/ipam/vlans/
{
  "vid": 100,
  "name": "VLAN-USUARIOS",
  "site": 1,
  "status": "active"
}

# Filtros
GET /api/ipam/vlans/?site=1
GET /api/ipam/vlans/?group=1
```

---

## 🔌 **Interfaces**

```bash
# Interfaces
GET /api/dcim/interfaces/

# Crear interfaz
POST /api/dcim/interfaces/
{
  "device": 1,
  "name": "GigabitEthernet0/1",
  "type": "1000base-t",
  "enabled": true
}

# Actualizar interfaz
PUT /api/dcim/interfaces/{id}/
{
  "description": "Uplink a Core",
  "enabled": false
}

# Conexiones de interfaz
GET /api/dcim/interface-cable-terminations/
```

---

## 📦 **Inventario**

```bash
# Elementos de inventario
GET /api/dcim/inventory-items/

# Crear elemento de inventario
POST /api/dcim/inventory-items/
{
  "device": 1,
  "name": "Módulo de Memoria",
  "manufacturer": 1,
  "part_id": "DDR4-16GB",
  "serial": "MEM123456"
}
```

---

## ⚙️ **Plantillas de Configuración**

```bash
# Plantillas
GET /api/extras/config-templates/

# Crear plantilla
POST /api/extras/config-templates/
{
  "name": "Cisco IOS",
  "template_code": "interface {{ interface.name }}",
  "environment": "cisco_ios"
}

# Renderizar plantilla
POST /api/extras/config-templates/{id}/render/
{
  "data": {
    "interface": {"name": "GigabitEthernet0/1"}
  }
}
```

---

## 🔐 **Usuarios & Grupos**

```bash
# Usuarios
GET /api/users/users/

# Crear usuario
POST /api/users/users/
{
  "username": "jose.garcia",
  "email": "jose@empresa.com",
  "password": "password123",
  "first_name": "José",
  "last_name": "García"
}

# Grupos
GET /api/auth/groups/
```

---

## 📊 **Búsqueda & Filtrado**

```bash
# Búsqueda global
GET /api/search/?q=switch

# Múltiples filtros
GET /api/dcim/devices/?site=1&status=active&limit=100

# Ordenamiento
GET /api/dcim/devices/?ordering=name
GET /api/dcim/devices/?ordering=-created

# Campos personalizados
GET /api/dcim/devices/?cf_warranty_end_date=2025-12-31
```

---

## 📈 **GraphQL**

```bash
# Endpoint GraphQL
POST /graphql/

# Consultar dispositivos
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

# Crear dispositivo mutation
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

# Consultas anidadas
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

# Crear webhook
POST /api/extras/webhooks/
{
  "name": "Dispositivo Creado",
  "url": "https://your-app.com/webhooks/netbox",
  "events": ["device.create"],
  "http_method": "POST",
  "http_content_type": "application/json"
}
```

---

## 📦 **Operaciones en Lote**

```bash
# Crear en lote (API v2.1+)
POST /api/dcim/devices/bulk/
[
  {"name": "Switch-01", "device_type": 1},
  {"name": "Switch-02", "device_type": 1}
]

# Actualizar en lote
PATCH /api/dcim/devices/
[
  {"id": 1, "status": "offline"},
  {"id": 2, "status": "offline"}
]
```

---

## 📊 **Estadísticas & Reportes**

```bash
# Estadísticas
GET /api/status/

# Reportes
GET /api/extras/reports/

# Ejecutar reporte
POST /api/extras/reports/{id}/run/

# Entradas de journal
GET /api/extras/journal-entries/
```

---

## 🔍 **Ejemplos con cURL**

### **GET Dispositivos**
```bash
curl -H "Authorization: Token abc123" \
  http://localhost:8000/api/dcim/devices/ \
  | jq
```

### **POST Dispositivo**
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

### **Buscar Dispositivos**
```bash
curl -H "Authorization: Token abc123" \
  "http://localhost:8000/api/dcim/devices/?search=core"
```

---

## 🐍 **Ejemplos en Python**

```python
import requests

token = "YOUR_TOKEN"
base_url = "http://localhost:8000/api"

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

# GET dispositivos
response = requests.get(f"{base_url}/dcim/devices/", headers=headers)
devices = response.json()

# POST dispositivo
data = {
    "name": "Switch-01",
    "device_type": 1,
    "site": 1,
    "status": "active"
}
response = requests.post(f"{base_url}/dcim/devices/", json=data, headers=headers)
device = response.json()

# PUT actualizar
data = {"status": "offline"}
response = requests.put(f"{base_url}/dcim/devices/1/", json=data, headers=headers)
```

---

## ⚙️ **Paginación**

```bash
# Tamaño de página
GET /api/dcim/devices/?limit=100
GET /api/dcim/devices/?offset=0

# Conteo total
GET /api/dcim/devices/?limit=1
# Response: {"count": 1250, "next": "...", "previous": null}

# Página siguiente
GET /api/dcim/devices/?limit=100&offset=100
```

---

## 🔐 **Manejo de Errores**

```bash
# 400 Bad Request
{
  "site": ["Este campo es requerido"]
}

# 401 Unauthorized
{
  "detail": "No se proporcionaron credenciales de autenticación"
}

# 403 Forbidden
{
  "detail": "No tiene permiso para realizar esta acción"
}

# 404 Not Found
{
  "detail": "No encontrado"
}

# 429 Rate Limit
{
  "detail": "Solicitud limitada. Disponible en 60 segundos"
}
```

---

## 📚 **Python SDK (pynetbox)**

```python
import pynetbox

# Inicializar
nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

# Consultar
devices = nb.dcim.devices.all()
sites = nb.dcim.sites.get(1)

# Crear
site = nb.dcim.sites.create(
    name="Ciudad de México",
    slug="cdmx"
)

# Actualizar
device = nb.dcim.devices.get(1)
device.status = "offline"
device.save()

# Eliminar
device.delete()
```

---

**🔌 Total: 80+ endpoints | REST + GraphQL | Ejemplos ES**
