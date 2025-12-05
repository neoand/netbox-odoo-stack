# 🔌 Odoo Integration Reference

> **Sincronização NetBox ↔ Odoo: Assets, Inventory & Workflows**

---

## 🔗 **Conectar NetBox com Odoo**

### **Via API REST**

```python
import requests

# Configuração
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

# Testar conexão
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
    """Sincronizar devices do NetBox para Odoo como assets"""

    # Buscar devices no NetBox
    netbox_devices = requests.get(
        f"{NETBOX_URL}/api/dcim/devices/",
        headers=netbox_headers
    ).json()['results']

    odoo_assets = []

    for device in netbox_devices:
        # Criar asset no Odoo
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

        # POST para Odoo
        response = requests.post(
            f"{ODOO_URL}/api/maintenance.equipment",
            json=asset_data,
            auth=odoo_auth
        )

        if response.status_code == 200:
            odoo_assets.append(asset_data['name'])

    return odoo_assets

def map_device_type(netbox_type_id):
    """Mapear device type do NetBox para categoria do Odoo"""
    mapping = {
        1: 1,  # Switch -> Networking
        2: 2,  # Router -> Networking
        3: 3,  # Server -> Computing
        4: 4,  # Firewall -> Security
    }
    return mapping.get(netbox_type_id, 1)

def get_site_name(site_id):
    """Buscar nome do site"""
    site = requests.get(
        f"{NETBOX_URL}/api/dcim/sites/{site_id}/",
        headers=netbox_headers
    ).json()
    return site['name']

# Executar sync
synced = sync_netbox_devices_to_odoo()
print(f"✅ Sincronizados {len(synced)} devices")
```

---

## 💰 **Purchase Order → NetBox**

```python
def sync_purchase_order_to_netbox(po_id):
    """Quando PO é aprovada no Odoo, criar dispositivos no NetBox"""

    # Buscar PO no Odoo
    po = requests.get(
        f"{ODOO_URL}/api/purchase.order/{po_id}",
        auth=odoo_auth
    ).json()

    netbox_devices = []

    for line in po['order_line']:
        product = line['product_id']

        # Criar dispositivo no NetBox
        device_data = {
            'name': generate_device_name(product),
            'device_type': map_product_to_device_type(product),
            'site': po.get('picking_type_id', {}).get('warehouse_id', {}),
            'status': 'inventory',  # Aguardando instalação
            'custom_fields': {
                'purchase_order': po_id,
                'purchase_date': po['date_order'],
                'cost': line['price_unit'],
                'supplier': po['partner_id']['name']
            }
        }

        # POST para NetBox
        response = requests.post(
            f"{NETBOX_URL}/api/dcim/devices/",
            json=device_data,
            headers=netbox_headers
        )

        if response.status_code == 201:
            netbox_devices.append(response.json())

    return netbox_devices

def generate_device_name(product):
    """Gerar nome do dispositivo baseado no produto"""
    return f"{product['name'][:20]}-{product['id']}"
```

---

## 📊 **Sync Inventory Levels**

```python
def sync_inventory_levels():
    """Sincronizar níveis de inventário do Odoo para NetBox"""

    # Buscar inventory no Odoo
    inventory = requests.get(
        f"{ODOO_URL}/api/stock.quant",
        auth=odoo_auth
    ).json()

    for item in inventory:
        if item['product_id']['type'] == 'product':
            # Atualizar device no NetBox
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

## 📋 **Work Orders**

```python
def create_odoo_workorder_from_netbox(maintenance_id):
    """Criar ordem de manutenção no Odoo baseada em NetBox"""

    # Buscar maintenance request no NetBox
    maintenance = requests.get(
        f"{NETBOX_URL}/api/extras/maintenance-requests/{maintenance_id}/",
        headers=netbox_headers
    ).json()

    # Criar no Odoo
    workorder_data = {
        'name': maintenance['title'],
        'description': maintenance['description'],
        'equipment_id': map_netbox_device_to_odoo_asset(maintenance['assignments'][0]['device']),
        'scheduled_date': maintenance['scheduled_date'],
        'state': 'draft',
        'maintenance_type': 'corrective'  # ou 'preventive'
    }

    response = requests.post(
        f"{ODOO_URL}/api/maintenance.request",
        json=workorder_data,
        auth=odoo_auth
    )

    return response.json()

def update_netbox_maintenance_from_odoo(wo_id):
    """Atualizar NetBox quando WO no Odoo é concluído"""

    # Buscar WO
    workorder = requests.get(
        f"{ODOO_URL}/api/maintenance.request/{wo_id}",
        auth=odoo_auth
    ).json()

    if workorder['state'] == 'done':
        # Atualizar NetBox
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

## 💵 **Depreciation & Assets**

```python
def calculate_depreciation():
    """Calcular depreciação de assets no Odoo baseado no NetBox"""

    # Assets no Odoo
    assets = requests.get(
        f"{ODOO_URL}/api/account.asset.asset",
        auth=odoo_auth
    ).json()

    for asset in assets:
        netbox_id = asset['custom_fields'].get('netbox_id')
        if netbox_id:
            # Buscar device no NetBox
            device = requests.get(
                f"{NETBOX_URL}/api/dcim/devices/{netbox_id}/",
                headers=netbox_headers
            ).json()

            # Calcular depreciação
            if device['custom_fields'].get('purchase_date'):
                purchase_date = datetime.strptime(
                    device['custom_fields']['purchase_date'],
                    '%Y-%m-%d'
                )
                years_in_service = (datetime.now() - purchase_date).days / 365.25

                # Calcular valor atual (depreciação linear 5 anos)
                original_cost = device['custom_fields'].get('cost', 0)
                current_value = original_cost * max(0, 1 - years_in_service / 5)

                # Atualizar NetBox
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

## 🔄 **Automated Sync**

```python
import schedule
import time

def full_sync():
    """Sincronização completa bidirecional"""
    print("🔄 Starting full sync...")

    # 1. NetBox → Odoo (Devices, VLANs, Sites)
    print("  📦 Syncing NetBox → Odoo")
    sync_netbox_devices_to_odoo()

    # 2. Odoo → NetBox (Purchase Orders, Work Orders)
    print("  💰 Syncing Odoo → NetBox")
    sync_purchase_orders_to_netbox()

    # 3. Inventory levels
    print("  📊 Syncing inventory")
    sync_inventory_levels()

    # 4. Update depreciation
    print("  💵 Calculating depreciation")
    calculate_depreciation()

    print("✅ Full sync completed")

# Schedule (rodar a cada hora)
schedule.every().hour.do(full_sync)

# Rodar a cada 6 horas
schedule.every(6).hours.do(full_sync)

# Ou executar manualmente
# full_sync()

while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## 📡 **Webhooks**

### **NetBox Webhook → Odoo**

```python
# Configurar webhook no NetBox
webhook_config = {
    "name": "Device Created",
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
        # Criar asset no Odoo
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

## 📊 **Dashboard Metrics**

```python
def get_integration_metrics():
    """Métricas da integração NetBox-Odoo"""

    # NetBox devices
    nb_devices = requests.get(
        f"{NETBOX_URL}/api/dcim/devices/",
        headers=netbox_headers
    ).json()['count']

    # Odoo assets
    odoo_assets = requests.get(
        f"{ODOO_URL}/api/maintenance.equipment",
        auth=odoo_auth
    ).json()['count']

    # Sync status
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

# Exemplo de resposta
# {
#   "netbox_devices": 1247,
#   "odoo_assets": 1156,
#   "synced_devices": 1123,
#   "sync_percentage": 90.06,
#   "last_sync": "2024-12-05T10:30:00"
# }
```

---

## ⚠️ **Error Handling**

```python
def safe_sync_operation(operation, **kwargs):
    """Wrapper para operações com erro handling"""
    try:
        result = operation(**kwargs)
        return {'success': True, 'data': result}
    except requests.exceptions.ConnectionError:
        return {'success': False, 'error': 'Connection failed'}
    except KeyError as e:
        return {'success': False, 'error': f'Missing field: {e}'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# Uso
result = safe_sync_operation(sync_netbox_devices_to_odoo)
if result['success']:
    print(f"✅ Sync successful: {result['data']}")
else:
    print(f"❌ Sync failed: {result['error']}")
```

---

**🔌 Total: Integration patterns | Bidirectional sync | Production ready**
