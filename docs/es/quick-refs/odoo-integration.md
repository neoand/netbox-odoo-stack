# 🔌 Referencia de Integración con Odoo

> **Sincronización NetBox ↔ Odoo: Assets, Inventory & Workflows**

---

## 🔗 **Conectar NetBox con Odoo**

### **Vía API REST**

```python
import requests

# Configuración
NETBOX_URL = "http://localhost:8000"
NETBOX_TOKEN = "YOUR_NETBOX_TOKEN"

ODOO_URL = "http://localhost:8069"
ODOO_DB = "netbox"
ODOO_USER = "admin"
ODOO_PASSWORD = "admin"

# Headers NetBox
netbox_headers = {
    "Authorization": f"Token {NETBOX_TOKEN}",
    "Content-Type": "application/json"
}

# Auth Odoo
odoo_auth = (ODOO_USER, ODOO_PASSWORD)

# Probar conexión
def test_connections():
    # NetBox
    nb_response = requests.get(
        f"{NETBOX_URL}/api/",
        headers=netbox_headers
    )
    print(f"NetBox: {nb_response.status_code}")

    # Odoo
    odoo_response = requests.get(
        f"{ODOO_URL}/web/database/list",
        auth=odoo_auth
    )
    print(f"Odoo: {odoo_response.status_code}")

test_connections()
```

---

## 📦 **Sync NetBox → Odoo**

```python
import requests
import json

def sync_netbox_devices_to_odoo():
    """Sincronizar dispositivos de NetBox a Odoo como assets"""

    # Buscar dispositivos en NetBox
    netbox_devices = requests.get(
        f"{NETBOX_URL}/api/dcim/devices/",
        headers=netbox_headers
    ).json()['results']

    odoo_assets = []

    for device in netbox_devices:
        # Crear asset en Odoo
        asset_data = {
            'name': device['name'],
            'category_id': map_device_type(device['device_type']),  # Mapear tipo
            'serial_no': device.get('serial', ''),
            'location': get_site_name(device['site']),
            'status': 'in_service' if device['status'] == 'active' else 'in_stock',
            'date': device['created'],
            'custom_fields': {
                'netbox_id': device['id'],
                'netbox_url': f"{NETBOX_URL}/dcim/devices/{device['id']}/"
            }
        }

        # POST a Odoo
        response = requests.post(
            f"{ODOO_URL}/api/maintenance.equipment",
            json=asset_data,
            auth=odoo_auth
        )

        if response.status_code == 200:
            odoo_assets.append(asset_data['name'])

    return odoo_assets

def map_device_type(netbox_type_id):
    """Mapear device type de NetBox a categoría de Odoo"""
    mapping = {
        1: 1,  # Switch -> Networking
        2: 2,  # Router -> Networking
        3: 3,  # Server -> Computing
        4: 4,  # Firewall -> Security
    }
    return mapping.get(netbox_type_id, 1)

def get_site_name(site_id):
    """Buscar nombre del sitio"""
    site = requests.get(
        f"{NETBOX_URL}/api/dcim/sites/{site_id}/",
        headers=netbox_headers
    ).json()
    return site['name']

# Ejecutar sync
synced = sync_netbox_devices_to_odoo()
print(f"✅ Sincronizados {len(synced)} dispositivos")
```

---

## 💰 **Orden de Compra → NetBox**

```python
def sync_purchase_order_to_netbox(po_id):
    """Cuando la OC es aprobada en Odoo, crear dispositivos en NetBox"""

    # Buscar OC en Odoo
    po = requests.get(
        f"{ODOO_URL}/api/purchase.order/{po_id}",
        auth=odoo_auth
    ).json()

    netbox_devices = []

    for line in po['order_line']:
        product = line['product_id']

        # Crear dispositivo en NetBox
        device_data = {
            'name': generate_device_name(product),
            'device_type': map_product_to_device_type(product),
            'site': po.get('picking_type_id', {}).get('warehouse_id', {}),
            'status': 'inventory',  # Esperando instalación
            'custom_fields': {
                'purchase_order': po_id,
                'purchase_date': po['date_order'],
                'cost': line['price_unit'],
                'supplier': po['partner_id']['name']
            }
        }

        # POST a NetBox
        response = requests.post(
            f"{NETBOX_URL}/api/dcim/devices/",
            json=device_data,
            headers=netbox_headers
        )

        if response.status_code == 201:
            netbox_devices.append(response.json())

    return netbox_devices

def generate_device_name(product):
    """Generar nombre del dispositivo basado en el producto"""
    return f"{product['name'][:20]}-{product['id']}"
```

---

## 📊 **Sync Niveles de Inventario**

```python
def sync_inventory_levels():
    """Sincronizar niveles de inventario de Odoo a NetBox"""

    # Buscar inventario en Odoo
    inventory = requests.get(
        f"{ODOO_URL}/api/stock.quant",
        auth=odoo_auth
    ).json()

    for item in inventory:
        if item['product_id']['type'] == 'product':
            # Actualizar dispositivo en NetBox
            device_id = item['product_id'].get('netbox_id')
            if device_id:
                update_data = {
                    'custom_fields': {
                        'quantity_available': item['quantity'],
                        'quantity_on_hand': item['inventory_quantity']
                    }
                }

                requests.patch(
                    f"{NETBOX_URL}/api/dcim/devices/{device_id}/",
                    json=update_data,
                    headers=netbox_headers
                )

sync_inventory_levels()
```

---

## 📋 **Órdenes de Trabajo**

```python
def create_odoo_workorder_from_netbox(maintenance_id):
    """Crear orden de mantenimiento en Odoo basada en NetBox"""

    # Buscar solicitud de mantenimiento en NetBox
    maintenance = requests.get(
        f"{NETBOX_URL}/api/extras/maintenance-requests/{maintenance_id}/",
        headers=netbox_headers
    ).json()

    # Crear en Odoo
    workorder_data = {
        'name': maintenance['title'],
        'description': maintenance['description'],
        'equipment_id': map_netbox_device_to_odoo_asset(maintenance['assignments'][0]['device']),
        'scheduled_date': maintenance['scheduled_date'],
        'state': 'draft',
        'maintenance_type': 'corrective'  # o 'preventive'
    }

    response = requests.post(
        f"{ODOO_URL}/api/maintenance.request",
        json=workorder_data,
        auth=odoo_auth
    )

    return response.json()

def update_netbox_maintenance_from_odoo(wo_id):
    """Actualizar NetBox cuando OT en Odoo es completada"""

    # Buscar OT
    workorder = requests.get(
        f"{ODOO_URL}/api/maintenance.request/{wo_id}",
        auth=odoo_auth
    ).json()

    if workorder['state'] == 'done':
        # Actualizar NetBox
        maintenance_id = workorder['custom_fields']['netbox_maintenance_id']

        update_data = {
            'status': 'completed',
            'completed': datetime.now().isoformat(),
            'custom_fields': {
                'workorder_id': wo_id
            }
        }

        requests.patch(
            f"{NETBOX_URL}/api/extras/maintenance-requests/{maintenance_id}/",
            json=update_data,
            headers=netbox_headers
        )
```

---

## 💵 **Depreciación & Assets**

```python
def calculate_depreciation():
    """Calcular depreciación de assets en Odoo basado en NetBox"""

    # Assets en Odoo
    assets = requests.get(
        f"{ODOO_URL}/api/account.asset.asset",
        auth=odoo_auth
    ).json()

    for asset in assets:
        netbox_id = asset['custom_fields'].get('netbox_id')
        if netbox_id:
            # Buscar dispositivo en NetBox
            device = requests.get(
                f"{NETBOX_URL}/api/dcim/devices/{netbox_id}/",
                headers=netbox_headers
            ).json()

            # Calcular depreciación
            if device['custom_fields'].get('purchase_date'):
                purchase_date = datetime.strptime(
                    device['custom_fields']['purchase_date'],
                    '%Y-%m-%d'
                )
                years_in_service = (datetime.now() - purchase_date).days / 365.25

                # Calcular valor actual (depreciación lineal 5 años)
                original_cost = device['custom_fields'].get('cost', 0)
                current_value = original_cost * max(0, 1 - years_in_service / 5)

                # Actualizar NetBox
                requests.patch(
                    f"{NETBOX_URL}/api/dcim/devices/{netbox_id}/",
                    json={
                        'custom_fields': {
                            'current_value': current_value,
                            'depreciation_years': years_in_service
                        }
                    },
                    headers=netbox_headers
                )
```

---

## 🔄 **Sincronización Automatizada**

```python
import schedule
import time

def full_sync():
    """Sincronización completa bidireccional"""
    print("🔄 Iniciando sincronización completa...")

    # 1. NetBox → Odoo (Dispositivos, VLANs, Sitios)
    print("  📦 Sincronizando NetBox → Odoo")
    sync_netbox_devices_to_odoo()

    # 2. Odoo → NetBox (Órdenes de Compra, Órdenes de Trabajo)
    print("  💰 Sincronizando Odoo → NetBox")
    sync_purchase_orders_to_netbox()

    # 3. Niveles de inventario
    print("  📊 Sincronizando inventario")
    sync_inventory_levels()

    # 4. Actualizar depreciación
    print("  💵 Calculando depreciación")
    calculate_depreciation()

    print("✅ Sincronización completa finalizada")

# Programar (ejecutar cada hora)
schedule.every().hour.do(full_sync)

# Ejecutar cada 6 horas
schedule.every(6).hours.do(full_sync)

# O ejecutar manualmente
# full_sync()

while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## 📡 **Webhooks**

### **Webhook NetBox → Odoo**

```python
# Configurar webhook en NetBox
webhook_config = {
    "name": "Dispositivo Creado",
    "url": "https://your-app.com/webhooks/netbox-to-odoo",
    "events": ["device.create"],
    "http_method": "POST",
    "http_content_type": "application/json",
    "body_template": json.dumps({
        "event": "{{ event_type }}",
        "timestamp": "{{ timestamp }}",
        "data": {
            "device_id": "{{ id }}",
            "device_name": "{{ name }}",
            "device_type": "{{ device_type }}",
            "site": "{{ site }}"
        }
    })
}

# Handler webhook
@app.route('/webhooks/netbox-to-odoo', methods=['POST'])
def handle_netbox_webhook():
    payload = request.json
    event_type = payload['event']

    if event_type == 'device.create':
        # Crear asset en Odoo
        asset_data = {
            'name': payload['data']['device_name'],
            'custom_fields': {
                'netbox_id': payload['data']['device_id']
            }
        }

        response = requests.post(
            f"{ODOO_URL}/api/maintenance.equipment",
            json=asset_data,
            auth=odoo_auth
        )

        return jsonify({'status': 'success'}), 200

    return jsonify({'status': 'ignored'}), 200
```

---

## 📊 **Métricas del Dashboard**

```python
def get_integration_metrics():
    """Métricas de la integración NetBox-Odoo"""

    # Dispositivos NetBox
    nb_devices = requests.get(
        f"{NETBOX_URL}/api/dcim/devices/",
        headers=netbox_headers
    ).json()['count']

    # Assets Odoo
    odoo_assets = requests.get(
        f"{ODOO_URL}/api/maintenance.equipment",
        auth=odoo_auth
    ).json()['count']

    # Estado de sincronización
    synced_devices = requests.get(
        f"{ODOO_URL}/api/maintenance.equipment",
        params={'custom_fields__netbox_id__isnull': False},
        auth=odoo_auth
    ).json()['count']

    metrics = {
        'netbox_devices': nb_devices,
        'odoo_assets': odoo_assets,
        'synced_devices': synced_devices,
        'sync_percentage': round((synced_devices / nb_devices) * 100, 2) if nb_devices > 0 else 0,
        'last_sync': datetime.now().isoformat()
    }

    return metrics

# Ejemplo de respuesta
# {
#   "netbox_devices": 1247,
#   "odoo_assets": 1156,
#   "synced_devices": 1123,
#   "sync_percentage": 90.06,
#   "last_sync": "2024-12-05T10:30:00"
# }
```

---

## ⚠️ **Manejo de Errores**

```python
def safe_sync_operation(operation, **kwargs):
    """Wrapper para operaciones con manejo de errores"""
    try:
        result = operation(**kwargs)
        return {'success': True, 'data': result}
    except requests.exceptions.ConnectionError:
        return {'success': False, 'error': 'Falló la conexión'}
    except KeyError as e:
        return {'success': False, 'error': f'Campo faltante: {e}'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# Uso
result = safe_sync_operation(sync_netbox_devices_to_odoo)
if result['success']:
    print(f"✅ Sincronización exitosa: {result['data']}")
else:
    print(f"❌ Sincronización falló: {result['error']}")
```

---

**🔌 Total: Patrones de integración | Sincronización bidireccional | Listo para producción**
