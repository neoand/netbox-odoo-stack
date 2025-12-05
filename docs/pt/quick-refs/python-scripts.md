# 🐍 Python Scripts Cheat Sheet

> **Scripts Python essenciais para NetBox Automation**

---

## 🔑 **Setup**

```python
# Instalar dependências
pip install pynetbox requests python-dotenv

# Configuração com .env
import os
from dotenv import load_dotenv

load_dotenv()

NETBOX_URL = os.getenv('NETBOX_URL')
NETBOX_TOKEN = os.getenv('NETBOX_TOKEN')

# Conectar
import pynetbox
nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)

# Teste
print(nb.status)
```

---

## 📦 **Add Bulk Devices**

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
                print(f"✅ Created: {device.name}")
            except Exception as e:
                print(f"❌ Error: {device.name} - {e}")

add_devices_from_csv('devices.csv')

# CSV Format:
# name,device_type,site,rack,position
# Switch-01,1,1,1,1
# Switch-02,1,1,1,2
```

---

## 📊 **Export All Devices**

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

print(f"✅ Exported {len(devices)} devices")
```

---

## 🌐 **IP Management**

```python
import pynetbox

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

# Find free IPs in range
def find_free_ips(prefix, count=10):
    prefix = nb.ipam.prefixes.get(prefix=prefix)
    free_ips = list(prefix.available_ips.list())
    return free_ips[:count]

# Usage
free_ips = find_free_ips('192.168.1.0/24', 5)
for ip in free_ips:
    print(ip)

# Assign IP to interface
def assign_ip_to_interface(interface_id, ip_address):
    ip = nb.ipam.ip_addresses.create(
        address=ip_address,
        interface=interface_id
    )
    return ip

# Usage
interface = nb.dcim.interfaces.get(id=1)
assign_ip_to_interface(interface.id, '192.168.1.100/24')

# Find duplicate IPs
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
print(f"🔍 Found {len(dup_ips)} duplicate IPs: {dup_ips}")
```

---

## 🏷️ **VLAN Management**

```python
import pynetbox

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

# Create VLANs bulk
def create_vlans(vlan_list):
    for vlan_data in vlan_list:
        try:
            vlan = nb.ipam.vlans.create(
                vid=vlan_data['vid'],
                name=vlan_data['name'],
                site=vlan_data['site']
            )
            print(f"✅ Created VLAN {vlan.vid}: {vlan.name}")
        except Exception as e:
            print(f"❌ Error: {vlan_data['name']} - {e}")

# Usage
vlans = [
    {'vid': 100, 'name': 'USERS', 'site': 1},
    {'vid': 200, 'name': 'SERVERS', 'site': 1},
    {'vid': 300, 'name': 'GUESTS', 'site': 1}
]
create_vlans(vlans)

# Find unused VLANs
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

print("Unused VLANs:", find_unused_vlans())
```

---

## 📋 **Compliance Check**

```python
import pynetbox
from datetime import datetime

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

def compliance_check():
    issues = []
    devices = list(nb.dcim.devices.all())

    for device in devices:
        # Check for missing serial
        if not device.serial:
            issues.append({
                'type': 'missing_serial',
                'device': device.name,
                'severity': 'medium'
            })

        # Check for old devices (>5 years)
        if device.created:
            created_date = datetime.strptime(device.created, '%Y-%m-%d')
            if (datetime.now() - created_date).days > 1825:
                issues.append({
                    'type': 'old_device',
                    'device': device.name,
                    'age_years': (datetime.now() - created_date).days // 365,
                    'severity': 'low'
                })

        # Check for devices without IPs
        if not list(device.ip_addresses):
            issues.append({
                'type': 'no_ip',
                'device': device.name,
                'severity': 'high'
            })

    return issues

issues = compliance_check()
print(f"⚠️  Found {len(issues)} compliance issues:")
for issue in issues:
    print(f"  {issue['severity'].upper()}: {issue['device']} - {issue['type']}")
```

---

## 🔄 **Sync with Odoo**

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
        # Create in Odoo
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
            print(f"✅ Synced: {device.name}")
        else:
            print(f"❌ Failed: {device.name}")

sync_devices_to_odoo()
```

---

## 📊 **Generate Report**

```python
import pynetbox
from datetime import datetime, timedelta

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

def generate_inventory_report():
    devices = list(nb.dcim.devices.all())
    sites = list(nb.dcim.sites.all())
    vlans = list(nb.ipam.vlans.all())

    # Counts
    total_devices = len(devices)
    active_devices = len([d for d in devices if d.status == 'active'])
    sites_count = len(sites)
    vlans_count = len(vlans)

    # By site
    by_site = {}
    for device in devices:
        site_name = device.site.name if device.site else 'Unassigned'
        by_site[site_name] = by_site.get(site_name, 0) + 1

    # By type
    by_type = {}
    for device in devices:
        dtype = device.device_type.display if device.device_type else 'Unknown'
        by_type[dtype] = by_type.get(dtype, 0) + 1

    # Generate report
    report = f"""
    📊 NETBOX INVENTORY REPORT
    Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📦 SUMMARY
    Total Devices: {total_devices}
    Active Devices: {active_devices}
    Inactive Devices: {total_devices - active_devices}

    Sites: {sites_count}
    VLANs: {vlans_count}

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📍 BY SITE
    """
    for site, count in by_site.items():
        report += f"\n    {site}: {count} devices"

    report += "\n\n ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n 🏷️  BY TYPE"
    for dtype, count in sorted(by_type.items(), key=lambda x: x[1], reverse=True):
        report += f"\n    {dtype}: {count}"

    report += "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Save report
    with open(f'inventory_report_{datetime.now().strftime("%Y%m%d")}.txt', 'w') as f:
        f.write(report)

    print(report)
    print(f"\n✅ Report saved to inventory_report_{datetime.now().strftime('%Y%m%d')}.txt")

generate_inventory_report()
```

---

## 🔍 **Search & Filter**

```python
import pynetbox

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

# Advanced search
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

# Usage
active_switches = find_devices_by_criteria(status='active', device_type=1)
for device in active_switches:
    print(f"{device.name} - {device.site.name}")

# Search by name pattern
def search_devices_by_name(pattern):
    devices = nb.dcim.devices.all()
    matches = []
    for device in devices:
        if pattern.lower() in device.name.lower():
            matches.append(device)
    return matches

# Usage
switches = search_devices_by_name('switch')
```

---

## 🛠️ **Maintenance Tasks**

```python
import pynetbox
from datetime import datetime, timedelta

nb = pynetbox.api("http://localhost:8000", token="YOUR_TOKEN")

def find_eol_devices():
    """Find End-of-Life devices (>7 years old)"""
    eol_devices = []
    cutoff_date = datetime.now() - timedelta(days=2555)  # 7 years

    devices = nb.dcim.devices.all()
    for device in devices:
        if device.created:
            created = datetime.strptime(device.created, '%Y-%m-%d')
            if created < cutoff_date:
                eol_devices.append({
                    'name': device.name,
                    'age_years': (datetime.now() - created).days // 365,
                    'site': device.site.name if device.site else 'Unknown'
                })

    return eol_devices

def update_interface_descriptions():
    """Update interface descriptions based on naming convention"""
    interfaces = nb.dcim.interfaces.all()
    updated = 0

    for iface in interfaces:
        if iface.name.startswith('Gi'):
            if not iface.description:
                iface.description = f'Gigabit Interface - Auto-updated'
                iface.save()
                updated += 1

    print(f"Updated {updated} interfaces")

# Run
eol = find_eol_devices()
print(f"⚠️  Found {len(eol)} EOL devices")
for device in eol:
    print(f"  {device['name']} - {device['age_years']} years")

update_interface_descriptions()
```

---

## 📦 **Bulk Import from JSON**

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
                print(f"✅ Created device: {device.name}")
                created += 1

        except Exception as e:
            print(f"❌ Failed to create {item.get('name', 'unknown')}: {e}")
            failed += 1

    print(f"\n📊 Results: {created} created, {failed} failed")

# Usage
import_from_json('devices.json')

# JSON Format:
# [
#   {"type": "device", "name": "Switch-01", "device_type": "1", "site": "1"},
#   {"type": "device", "name": "Switch-02", "device_type": "1", "site": "1"}
# ]
```

---

**🐍 Total: 20+ scripts | Automation ready | Quick reference**
