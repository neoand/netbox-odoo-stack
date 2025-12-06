# 🐍 Hoja de Referencia de Scripts Python

> **Scripts Python esenciales para NetBox Automation**

---

## 🔑 **Configuración**

```python
# Instalar dependencias
pip install pynetbox requests python-dotenv

# Configuración con .env
import os
from dotenv import load_dotenv

load_dotenv()

NETBOX_URL = os.getenv('NETBOX_URL')
NETBOX_TOKEN = os.getenv('NETBOX_TOKEN')

# Conectar
import pynetbox
nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)

# Probar
print(nb.status)
```

---

## 📦 **Agregar Dispositivos en Lote**

```python
#!/usr/bin/env python3
import pynetbox
import csv

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

def add_devices_from_csv(csv_file):
    with open(csv_file) as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                device = nb.dcim.devices.create(
                    name=row['name'],
                    device_type=row['device_type'],
                    site=row['site'],
                    rack=row['rack'],
                    position=int(row['position']),
                    status='active'
                )
                print(f"✅ Creado: {device.name}")
            except Exception as e:
                print(f"❌ Error: {device.name} - {e}")

add_devices_from_csv('devices.csv')

# Formato CSV:
# name,device_type,site,rack,position
# Switch-01,1,1,1,1
# Switch-02,1,1,1,2
```

---

## 📊 **Exportar Todos los Dispositivos**

```python
import pynetbox
import json

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

devices = list(nb.dcim.devices.all())
data = []

for device in devices:
    data.append({
        'id': device.id,
        'name': device.name,
        'device_type': device.device_type.display,
        'site': device.site.name,
        'rack': device.rack.name if device.rack else None,
        'status': device.status,
        'serial': device.serial,
        'ip_addresses': [ip.address for ip in device.ip_addresses]
    })

with open('devices_export.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"✅ Exportados {len(devices)} dispositivos")
```

---

## 🌐 **Gestión de IPs**

```python
import pynetbox

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

# Encontrar IPs libres en rango
def find_free_ips(prefix, count=10):
    prefix = nb.ipam.prefixes.get(prefix=prefix)
    free_ips = list(prefix.available_ips.list())
    return free_ips[:count]

# Uso
free_ips = find_free_ips('192.168.1.0/24', 5)
for ip in free_ips:
    print(ip)

# Asignar IP a interfaz
def assign_ip_to_interface(interface_id, ip_address):
    ip = nb.ipam.ip_addresses.create(
        address=ip_address,
        interface=interface_id
    )
    return ip

# Uso
interface = nb.dcim.interfaces.get(id=1)
assign_ip_to_interface(interface.id, '192.168.1.100/24')

# Encontrar IPs duplicadas
def find_duplicate_ips():
    all_ips = list(nb.ipam.ip_addresses.all())
    ip_counts = {}
    duplicates = []

    for ip in all_ips:
        addr = ip.address.split('/')[0]
        if addr in ip_counts:
            duplicates.append(addr)
        else:
            ip_counts[addr] = 1

    return duplicates

dup_ips = find_duplicate_ips()
print(f"🔍 Encontradas {len(dup_ips)} IPs duplicadas: {dup_ips}")
```

---

## 🏷️ **Gestión de VLANs**

```python
import pynetbox

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

# Crear VLANs en lote
def create_vlans(vlan_list):
    for vlan_data in vlan_list:
        try:
            vlan = nb.ipam.vlans.create(
                vid=vlan_data['vid'],
                name=vlan_data['name'],
                site=vlan_data['site']
            )
            print(f"✅ Creada VLAN {vlan.vid}: {vlan.name}")
        except Exception as e:
            print(f"❌ Error: {vlan_data['name']} - {e}")

# Uso
vlans = [
    {'vid': 100, 'name': 'USUARIOS', 'site': 1},
    {'vid': 200, 'name': 'SERVIDORES', 'site': 1},
    {'vid': 300, 'name': 'INVITADOS', 'site': 1}
]
create_vlans(vlans)

# Encontrar VLANs no utilizadas
def find_unused_vlans():
    all_vlans = list(nb.ipam.vlans.all())
    used_vids = set()

    for vlan in all_vlans:
        interfaces = nb.dcim.interfaces.filter(vlan=vlan.id)
        if interfaces:
            used_vids.add(vlan.vid)

    all_vids = set(range(1, 4096))
    unused = all_vids - used_vids
    return sorted(list(unused))[:50]

print("VLANs no utilizadas:", find_unused_vlans())
```

---

## 📋 **Verificación de Cumplimiento**

```python
import pynetbox
from datetime import datetime

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

def compliance_check():
    issues = []
    devices = list(nb.dcim.devices.all())

    for device in devices:
        # Verificar serial faltante
        if not device.serial:
            issues.append({
                'type': 'missing_serial',
                'device': device.name,
                'severity': 'medium'
            })

        # Verificar dispositivos antiguos (>5 años)
        if device.created:
            created_date = datetime.strptime(device.created, '%Y-%m-%d')
            if (datetime.now() - created_date).days > 1825:
                issues.append({
                    'type': 'old_device',
                    'device': device.name,
                    'age_years': (datetime.now() - created_date).days // 365,
                    'severity': 'low'
                })

        # Verificar dispositivos sin IPs
        if not list(device.ip_addresses):
            issues.append({
                'type': 'no_ip',
                'device': device.name,
                'severity': 'high'
            })

    return issues

issues = compliance_check()
print(f"⚠️  Encontrados {len(issues)} problemas de cumplimiento:")
for issue in issues:
    print(f"  {issue['severity'].upper()}: {issue['device']} - {issue['type']}")
```

---

## 🔄 **Sincronización con Odoo**

```python
import requests
import pynetbox

# NetBox
nb = pynetbox.api("http://localhost:8000", token="NETBOX_TOKEN")

# Odoo
ODOO_URL = "http://localhost:8069"
ODOO_DB = "netbox"
ODOO_USER = "admin"
ODOO_PASSWORD = "admin"

def sync_devices_to_odoo():
    devices = nb.dcim.devices.all()

    for device in devices:
        # Crear en Odoo
        url = f"{ODOO_URL}/api/iot.device"
        data = {
            'name': device.name,
            'device_type': device.device_type.display,
            'site': device.site.name if device.site else '',
            'serial': device.serial or '',
            'status': device.status
        }

        response = requests.post(url, json=data, auth=(ODOO_USER, ODOO_PASSWORD))

        if response.status_code == 200:
            print(f"✅ Sincronizado: {device.name}")
        else:
            print(f"❌ Falló: {device.name}")

sync_devices_to_odoo()
```

---

## 📊 **Generar Reporte**

```python
import pynetbox
from datetime import datetime, timedelta

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

def generate_inventory_report():
    devices = list(nb.dcim.devices.all())
    sites = list(nb.dcim.sites.all())
    vlans = list(nb.ipam.vlans.all())

    # Conteos
    total_devices = len(devices)
    active_devices = len([d for d in devices if d.status == 'active'])
    sites_count = len(sites)
    vlans_count = len(vlans)

    # Por sitio
    by_site = {}
    for device in devices:
        site_name = device.site.name if device.site else 'Sin asignar'
        by_site[site_name] = by_site.get(site_name, 0) + 1

    # Por tipo
    by_type = {}
    for device in devices:
        dtype = device.device_type.display if device.device_type else 'Desconocido'
        by_type[dtype] = by_type.get(dtype, 0) + 1

    # Generar reporte
    report = f"""
    📊 REPORTE DE INVENTARIO NETBOX
    Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📦 RESUMEN
    Total de Dispositivos: {total_devices}
    Dispositivos Activos: {active_devices}
    Dispositivos Inactivos: {total_devices - active_devices}

    Sitios: {sites_count}
    VLANs: {vlans_count}

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📍 POR SITIO
    """
    for site, count in by_site.items():
        report += f"\n    {site}: {count} dispositivos"

    report += "\n\n ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n 🏷️  POR TIPO"
    for dtype, count in sorted(by_type.items(), key=lambda x: x[1], reverse=True):
        report += f"\n    {dtype}: {count}"

    report += "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Guardar reporte
    with open(f'inventory_report_{datetime.now().strftime("%Y%m%d")}.txt', 'w') as f:
        f.write(report)

    print(report)
    print(f"\n✅ Reporte guardado en inventory_report_{datetime.now().strftime('%Y%m%d')}.txt")

generate_inventory_report()
```

---

## 🔍 **Búsqueda & Filtrado**

```python
import pynetbox

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

# Búsqueda avanzada
def find_devices_by_criteria(**criteria):
    filters = {}
    if 'site' in criteria:
        filters['site'] = criteria['site']
    if 'status' in criteria:
        filters['status'] = criteria['status']
    if 'device_type' in criteria:
        filters['device_type'] = criteria['device_type']

    devices = nb.dcim.devices.filter(**filters)
    return list(devices)

# Uso
active_switches = find_devices_by_criteria(status='active', device_type=1)
for device in active_switches:
    print(f"{device.name} - {device.site.name}")

# Buscar por patrón de nombre
def search_devices_by_name(pattern):
    devices = nb.dcim.devices.all()
    matches = []
    for device in devices:
        if pattern.lower() in device.name.lower():
            matches.append(device)
    return matches

# Uso
switches = search_devices_by_name('switch')
```

---

## 🛠️ **Tareas de Mantenimiento**

```python
import pynetbox
from datetime import datetime, timedelta

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

def find_eol_devices():
    """Encontrar dispositivos de Fin de Vida (>7 años)"""
    eol_devices = []
    cutoff_date = datetime.now() - timedelta(days=2555)  # 7 años

    devices = nb.dcim.devices.all()
    for device in devices:
        if device.created:
            created = datetime.strptime(device.created, '%Y-%m-%d')
            if created < cutoff_date:
                eol_devices.append({
                    'name': device.name,
                    'age_years': (datetime.now() - created).days // 365,
                    'site': device.site.name if device.site else 'Desconocido'
                })

    return eol_devices

def update_interface_descriptions():
    """Actualizar descripciones de interfaz basadas en convención de nombres"""
    interfaces = nb.dcim.interfaces.all()
    updated = 0

    for iface in interfaces:
        if iface.name.startswith('Gi'):
            if not iface.description:
                iface.description = f'Interfaz Gigabit - Auto-actualizado'
                iface.save()
                updated += 1

    print(f"Actualizadas {updated} interfaces")

# Ejecutar
eol = find_eol_devices()
print(f"⚠️  Encontrados {len(eol)} dispositivos EOL")
for device in eol:
    print(f"  {device['name']} - {device['age_years']} años")

update_interface_descriptions()
```

---

## 📦 **Importación en Lote desde JSON**

```python
import json
import pynetbox

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

def import_from_json(json_file):
    with open(json_file) as f:
        data = json.load(f)

    created = 0
    failed = 0

    for item in data:
        try:
            if item['type'] == 'device':
                device = nb.dcim.devices.create(
                    name=item['name'],
                    device_type=item['device_type'],
                    site=item['site'],
                    status='active'
                )
                print(f"✅ Creado dispositivo: {device.name}")
                created += 1

        except Exception as e:
            print(f"❌ Falló al crear {item.get('name', 'desconocido')}: {e}")
            failed += 1

    print(f"\n📊 Resultados: {created} creados, {failed} fallidos")

# Uso
import_from_json('devices.json')

# Formato JSON:
# [
#   {"type": "device", "name": "Switch-01", "device_type": "1", "site": "1"},
#   {"type": "device", "name": "Switch-02", "device_type": "1", "site": "1"}
# ]
```

---

**🐍 Total: 20+ scripts | Listo para automatización | Referencia rápida**
