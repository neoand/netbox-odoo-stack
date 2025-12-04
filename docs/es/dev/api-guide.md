# Guía Práctica de APIs NetBox

> **"La API es lo que conecta NetBox con el resto del mundo. Dominarla es dominar la automatización."**

---

## 🎯 Lo que vas a aprender

- ✅ **Lectura** eficiente de datos (filtros, includes, excludes)
- ✅ **Creación** y **actualización** de objetos
- ✅ **Operaciones en lote** (bulk)
- ✅ **Paginación** y performance
- ✅ **Custom fields** y extensiones
- ✅ **Webhooks** y eventos
- ✅ **GraphQL** vs REST

---

## 🔑 Autenticación

### 1. Obtener Token

```bash
# Vía interfaz web (recomendado)
# Admin → Tokens → Add

# O vía API
curl -X POST "http://localhost:8080/api/auth/token/" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Respuesta:**
```json
{
  "token": "0123456789abcdef0123456789abcdef01234567",
  "key": "0123456789abcdef0123456789abcdef01234567"
}
```

### 2. Usar Token

```python
import pynetbox

nb = pynetbox.api(
    'http://localhost:8080',
    token='0123456789abcdef0123456789abcdef01234567'
)

# O curl directo
curl -H "Authorization: Token 0123456789abcdef..." \
  http://localhost:8080/api/dcim/devices/
```

---

## 📖 Lectura de Datos

### 1. Listar Todos los Objetos (.all())

```python
# ⚠️ CUIDADO: puede ser lento con muchos objetos
devices = nb.dcim.devices.all()

for device in devices:
    print(f"{device.name}: {device.serial}")
```

**Mejor usar cuando:**
- Sabes que son pocos registros (<100)
- Necesitas hacer loop completo

---

### 2. Filtrar (.filter())

```python
# Filtrar por campo exacto
devices_activos = nb.dcim.devices.filter(status='active')

# Filtrar por múltiples campos
devices_sp = nb.dcim.devices.filter(
    site__name='São Paulo',
    status='active'
)

# Filtros avanzados
# Contiene (LIKE)
devices = nb.dcim.devices.filter(name__ic='web')

# Inicia con
devices = nb.dcim.devices.filter(name__sw='web-')

# Termina con
devices = nb.dcim.devices.filter(name__ew='-prod')

# Múltiples valores (IN)
devices = nb.dcim.devices.filter(
    status=['active', 'planned']
)

# Operaciones
devices_mas_de_10 = nb.dcim.devices.filter(u_height__gt=10)
devices_menos_de_5 = nb.dcim.devices.filter(u_height__lt=5)

# Ejemplos de lookup:
# __exact o __eq: =
# __iex: case-insensitive
# __ic: contains
# __sw: starts with
# __ew: ends with
# __gt: >
# __gte: >=
# __lt: <
# __lte: <=
```

---

### 3. Buscar Objeto Específico (.get())

```python
# Buscar por ID (más rápido)
device = nb.dcim.devices.get(id=123)

# Buscar por campos únicos
device = nb.dcim.devices.get(name='web-server-01')

# ❌ ERROR: múltiples resultados
# device = nb.dcim.devices.get(status='active')  # puede retornar varios

# ✅ CORRECTO: usar filtro si no sabes si es único
if nb.dcim.devices.filter(name='web-server-01'):
    device = nb.dcim.devices.get(name='web-server-01')
else:
    print("No encontrado")

# Buscar relaciones
device = nb.dcim.devices.get(name='web-server-01')
print(device.site.name)  # Acceder datos relacionados
print(device.rack.name)
print(device.device_type.model)
```

---

### 4. Incluir/Excluir Campos (.only(), .omit())

```python
# ✅ BUENO: reducir payload
devices = nb.dcim.devices.only('id', 'name', 'status')

# ✅ BUENO: excluir campos grandes
devices = nb.dcim.devices.omit('description', 'comments')

# ❌ MALO: sin optimización (trae todo)
devices = nb.dcim.devices.all()

# Útil para:
# - Listas grandes de dispositivos
# - Dashboards (necesita solo nombre + status)
# - APIs públicas (reducir tamaño)
```

---

## ✏️ Creación y Actualización

### 1. Crear Objeto (.create())

```python
# Ejemplo: Crear dispositivo
device_type = nb.dcim.device_types.get(slug='dell-r740')
site = nb.dcim.sites.get(name='São Paulo')
role = nb.dcim.device_types.get(role='server')

device = nb.dcim.devices.create({
    'name': 'web-server-prod-01',
    'device_type': device_type.id,
    'site': site.id,
    'role': role.id,
    'status': 'active',
    'serial': 'ABC123XYZ',
    'asset_tag': 'WEB-001',
    'position': 10,  # U10
    'custom_fields': {
        'cost_center': 'TI-Infra',
        'environment': 'production'
    }
})

print(f"Dispositivo creado: {device.id}")
```

**Orden de creación recomendada:**

```python
# 1. Preparar datos
site = nb.dcim.sites.get(name='São Paulo')
rack = nb.dcim.racks.get(name='Rack-01')
device_type = nb.dcim.device_types.get(slug='dell-r740')
role = nb.dcim.device_roles.get(slug='server')

# 2. Verificar que no existe
existing = nb.dcim.devices.filter(name='web-server-prod-01')
if existing:
    print("Ya existe")
    exit(1)

# 3. Crear objeto
device_data = {
    'name': 'web-server-prod-01',
    'device_type': device_type.id,
    'device_role': role.id,
    'site': site.id,
    'rack': rack.id,
    'position': 10,
    'status': 'active'
}

device = nb.dcim.devices.create(device_data)
print(f"Creado: {device.id}")
```

### 2. Actualizar Objeto (.save())

```python
# Cargar objeto
device = nb.dcim.devices.get(name='web-server-prod-01')

# Modificar campos
device.serial = 'XYZ789ABC'
device.asset_tag = 'WEB-002'
device.status = 'active'

# Guardar cambios
device.save()

# ✅ Actualizar campos específicos
device.patch({'serial': 'NEW123'})
```

### 3. Operaciones en Lote

```python
# Bulk create
devices_data = [
    {'name': 'web-01', 'device_type': 1, 'site': 1},
    {'name': 'web-02', 'device_type': 1, 'site': 1},
    {'name': 'web-03', 'device_type': 1, 'site': 1},
]

created = nb.dcim.devices.create(devices_data)
print(f"Creados: {len(created)} dispositivos")

# Bulk update
for device in nb.dcim.devices.filter(status='planned'):
    device.status = 'active'
    device.save()

# Bulk delete
nb.dcim.devices.filter(
    status='retired',
    last_updated__lt='2023-01-01'
).delete()
```

---

## 📄 Paginación

### 1. Manual

```python
from pynetbox.core.query import RequestOptions

# Buscar con offset/limit
devices = nb.dcim.devices.all()
devices.limit = 50  # 50 por página

while True:
    batch = list(devices)
    if not batch:
        break

    for device in batch:
        print(device.name)

    if not devices.has_next:
        break
```

### 2. Automática (iteración)

```python
# PyNetBox itera automáticamente con paginación
for device in nb.dcim.devices.all():
    print(device.name)
    # Internamente, busca páginas según sea necesario
```

---

## 🔗 Relaciones

### 1. Forward Relationships (parent → child)

```python
device = nb.dcim.devices.get(name='web-server-01')

# Buscar interfaces del dispositivo
interfaces = device.interfaces.all()
for iface in interfaces:
    print(f"{iface.name}: {iface.connected_endpoint}")

# Buscar IPs de la interfaz
for iface in interfaces:
    ips = nb.ipam.ip_addresses.filter(interface_id=iface.id)
    for ip in ips:
        print(f"  IP: {ip.address}")
```

### 2. Reverse Relationships (child → parent)

```python
# Buscar dispositivos por sitio
site = nb.dcim.sites.get(name='São Paulo')
devices = site.devices.all()

# Buscar dispositivos por rack
rack = nb.dcim.racks.get(name='Rack-01')
devices = rack.devices.all()

# Buscar IP por interfaz
interface = nb.dcim.interfaces.get(id=123)
ip_addresses = interface.ip_addresses.all()
```

### 3. Many-to-Many

```python
# Tags son many-to-many
device = nb.dcim.devices.get(name='web-server-01')

# Agregar tag
tag = nb.extras.tags.create({
    'name': 'production',
    'slug': 'prod'
})
device.tags.append(tag)
device.save()

# Ver tags
for tag in device.tags:
    print(tag.name)
```

---

## 🎨 Custom Fields

### 1. Crear Custom Field (vía API)

```python
# Crear custom field
custom_field = nb.extras.custom_fields.create({
    'name': 'cost_center',
    'type': 'text',
    'label': 'Centro de Costo',
    'description': 'Centro de costo para Odoo',
    'required': False,
    'weight': 100
})

# Usar en objeto
device = nb.dcim.devices.get(name='web-server-01')
device.custom_fields = {
    'cost_center': 'TI-Infra',
    'environment': 'production',
    'warranty_end': '2025-12-31'
}
device.save()
```

### 2. Tipos de Custom Fields

```python
# Texto
device.custom_fields['description'] = 'Servidor de producción'

# Número
device.custom_fields['budget'] = 15000

# Fecha
device.custom_fields['purchase_date'] = '2024-01-15'

# Boolean
device.custom_fields['critical'] = True

# Select
device.custom_fields['environment'] = 'production'  # Opciones predefinidas

# Multi-select
device.custom_fields['tags'] = ['web', 'production', 'critical']
```

---

## 🚨 Webhooks

### 1. Configurar Webhook en NetBox

```python
# Crear webhook
webhook = nb.extras.webhooks.create({
    'name': 'Device Created',
    'url': 'http://your-app.com/webhooks/netbox',
    'events': ['create'],
    'model': 'dcim.device',
    'enabled': True,
    'http_method': 'POST',
    'http_content_type': 'application/json'
})
```

### 2. Recibir Webhook (Flask)

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhooks/netbox', methods=['POST'])
def netbox_webhook():
    data = request.json

    if data['event'] == 'create':
        device = data['data']
        print(f"Nuevo dispositivo: {device['name']}")

        # Tu lógica aquí
        # - Notificar a Slack
        # - Sincronizar con Odoo
        # - Crear ticket en Jira

        return jsonify({'status': 'processed'}), 200

    return jsonify({'status': 'ignored'}), 204
```

### 3. Webhook con Validación

```python
import hashlib
import hmac

@app.route('/webhooks/netbox', methods=['POST'])
def netbox_webhook():
    # Verificar firma
    signature = request.headers.get('X-NetBox-Signature')
    secret = 'your-secret-key'

    if signature:
        expected = hmac.new(
            secret.encode(),
            request.data,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            return jsonify({'error': 'Invalid signature'}), 401

    # Procesar evento
    data = request.json
    # ... tu lógica

    return jsonify({'status': 'ok'})
```

---

## ⚡ GraphQL vs REST

### REST (ejemplo)

```python
# Múltiples requests para datos relacionados
device = nb.dcim.devices.get(name='web-server-01')
interfaces = device.interfaces.all()
ips = [nb.ipam.ip_addresses.filter(interface_id=i.id) for i in interfaces]
```

### GraphQL (ejemplo)

```python
import requests

query = '''
query {
  devices(name: "web-server-01") {
    id
    name
    site {
      name
      location
    }
    interfaces {
      name
      enabled
      ip_addresses {
        address
      }
    }
  }
}
'''

response = requests.post(
    'http://localhost:8080/graphql/',
    json={'query': query},
    headers={'Authorization': 'Token YOUR_TOKEN'}
)

data = response.json()
device = data['data']['devices'][0]

print(f"Sitio: {device['site']['name']}")
print(f"Interfaces: {len(device['interfaces'])}")
```

---

## ⚡ Performance y Mejores Prácticas

### 1. Minimizar Queries

```python
# ✅ BUENO: Una sola query con filtros
sp_devices = nb.dcim.devices.filter(site__name='São Paulo')

# ❌ MALO: Many queries
for site in nb.dcim.sites.all():
    print(f"{site.name}: {len(site.devices.all())}")
```

### 2. Error Handling

```python
import pynetbox

try:
    device = nb.dcim.devices.get(name='non-existent')
except pynetbox.RequestError as e:
    if e.req.status_code == 404:
        print("Dispositivo no encontrado")
    else:
        print(f"Error: {e}")
except Exception as e:
    print(f"Error inesperado: {e}")
```

### 3. Caching

```python
from functools import lru_cache

class NetBoxCache:
    def __init__(self, nb_api):
        self.nb = nb_api
        self._sites = None
        self._device_types = None

    @property
    def sites(self):
        if self._sites is None:
            self._sites = list(self.nb.dcim.sites.only('id', 'name'))
        return self._sites

    @property
    def device_types(self):
        if self._device_types is None:
            self._device_types = list(self.nb.dcim.device_types.only('id', 'model'))
        return self._device_types

# Uso
nb_cache = NetBoxCache(nb)
for site in nb_cache.sites:  # Solo descarga una vez
    print(site.name)
```

---

## 🧪 Ejemplos Completos

### Ejemplo 1: Sincronización con Odoo

```python
def sync_netbox_to_odoo():
    """
    Sincroniza dispositivos de NetBox con productos de Odoo
    """
    import xmlrpc.client

    # Conectar a Odoo
    odoo = xmlrpc.client.ServerProxy('http://odoo:8069/xmlrpc/2/common')
    uid = odoo.authenticate('db', 'user', 'password', {})

    # Buscar dispositivos en NetBox
    devices = nb.dcim.devices.filter(status='active')

    for device in devices:
        # Preparar datos para Odoo
        product_data = {
            'name': device.name,
            'default_code': device.asset_tag or f"NB-{device.id}",
            'serial_number': device.serial,
            'categ_id': [2, 'Hardware'],  # ID de la categoría
            'type': 'product',
            'tracking': 'serial',
            'custom_fields': {
                'netbox_id': device.id,
                'site': device.site.name,
                'rack': device.rack.name if device.rack else None,
                'position': device.position
            }
        }

        # Buscar si ya existe
        existing = odoo.execute_kw(
            'db', uid, 'password',
            'product.product', 'search_read',
            [[['default_code', '=', product_data['default_code']]]]
        )

        if existing:
            # Actualizar
            odoo.execute_kw(
                'db', uid, 'password',
                'product.product', 'write',
                [[existing[0]['id']], product_data]
            )
            print(f"Actualizado: {device.name}")
        else:
            # Crear
            new_id = odoo.execute_kw(
                'db', uid, 'password',
                'product.product', 'create',
                [product_data]
            )
            print(f"Creado: {device.name} (ID: {new_id})")

# Ejecutar
sync_netbox_to_odoo()
```

### Ejemplo 2: Validación de Compliance

```python
def validate_device_compliance():
    """
    Valida dispositivos contra reglas de compliance
    """
    violations = []

    devices = nb.dcim.devices.filter(status='active')

    for device in devices:
        # Regla 1: Dispositivo activo debe tener rack
        if device.status.label == 'Active' and not device.rack:
            violations.append({
                'device': device.name,
                'rule': 'active_must_have_rack',
                'severity': 'CRITICAL',
                'message': 'Dispositivo activo sin rack definido'
            })

        # Regra 2: Nombre debe seguir patrón
        import re
        if not re.match(r'^[a-z]+-[a-z]+-\d+$', device.name):
            violations.append({
                'device': device.name,
                'rule': 'naming_convention',
                'severity': 'MEDIUM',
                'message': 'Nombre no sigue patrón: tipo-recurso-numero'
            })

    # Report
    if violations:
        print(f"❌ {len(violations)} violaciones encontradas:\n")
        for v in violations:
            print(f"[{v['severity']}] {v['device']}: {v['message']}")
    else:
        print("✅ Todos los dispositivos en compliance")

    return violations

violations = validate_device_compliance()
```

### Ejemplo 3: Generación de Configuración

```python
from jinja2 import Template

def generate_switch_config(device_id):
    """
    Genera configuración de switch basado en datos de NetBox
    """
    device = nb.dcim.devices.get(id=device_id)

    # Buscar interfaces configuradas
    interfaces = nb.dcim.interfaces.filter(
        device_id=device.id,
        enabled=True
    )

    # Template Jinja2
    template = Template('''
hostname {{ device.name }}

interface Loopback0
 ip address {{ device.loopback_ip }}/32

{% for interface in interfaces %}
interface {{ interface.name }}
 description {{ interface.description or 'Configured via NetBox' }}
{% if interface.untagged_vlan %}
 switchport access vlan {{ interface.untagged_vlan.vid }}
{% endif %}
{% if interface.mode == 'tagged' %}
 switchport trunk allowed vlan {{ interface.tagged_vlans|join(',') }}
{% endif %}
 no shutdown

{% endfor %}

ip route 0.0.0.0/0 {{ device.default_gateway }}
    ''')

    config = template.render(
        device=device,
        interfaces=interfaces
    )

    return config

# Generar configuración
config = generate_switch_config(123)
print(config)
```

---

## 📖 Recursos

### Documentación
- **[PyNetBox Docs](https://pynetbox.readthedocs.io/)**
- **[NetBox API Reference](https://docs.netbox.dev/en/stable/api-guide/)**
- **[REST API Quickstart](https://docs.netbox.dev/en/stable/integrations/api/)**

### Ejemplos
- **[NetBox Labs Scripts](https://github.com/netbox-community/netbox/scripts)**
- **[NetBox Docker Scripts](https://github.com/netbox-community/netbox-docker/tree/main/scripts)**

---

> **"La API es el espejo del sistema. Cuanto más la uses, más entenderás NetBox."**