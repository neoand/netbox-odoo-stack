# ⚡ NetBox CLI Cheat Sheet (ES)

> **Comandos esenciales de nb-cli para máxima productividad**

---

## 📦 **Instalación**

```bash
# Instalar
pip install pynetbox-cli

# Configurar
nb-cli config --host http://localhost:8000 --token YOUR_TOKEN

# Probar
nb-cli --version
```

---

## 🏗️ **Sitios & Racks**

```bash
# Listar sitios
nb-cli site list
nb-cli site ls

# Crear sitio
nb-cli site add "Ciudad de México"
nb-cli site create --name="Guadalajara" --slug="guadalajara"

# Racks
nb-cli rack list
nb-cli rack add --name="RACK-01" --site="Ciudad de México"

# Estado
nb-cli site list --status active
```

---

## 💻 **Dispositivos**

```bash
# Listar
nb-cli device list
nb-cli device ls

# Filtros
nb-cli device list --site "Ciudad de México"
nb-cli device list --status active
nb-cli device list --device_type "Switch"

# Agregar
nb-cli device add --name="Switch-Core-01"
nb-cli device create \
  --name="Server-01" \
  --device_type="Dell PowerEdge R740" \
  --site="Ciudad de México" \
  --rack="RACK-01" \
  --position=1

# Actualizar
nb-cli device update 1 --status offline
nb-cli device modify 1 --serial="SN123456"

# Detalles
nb-cli device show 1
nb-cli device info Switch-Core-01

# Remover
nb-cli device delete 1
```

---

## 🌐 **IPs & VLANs**

```bash
# IPs
nb-cli ip list
nb-cli ipam ip-address list

# Agregar IP
nb-cli ip add 192.168.1.10/24
nb-cli ipam ip-address create \
  --address="10.0.0.1/24" \
  --interface="eth0" \
  --status="Active"

# Encontrar IPs libres
nb-cli ip free 192.168.1.0/24
nb-cli prefix available 10.0.0.0/16

# VLANs
nb-cli vlan list
nb-cli vlan add --vid=100 --name="VLAN-USERS"
nb-cli vlan add --vid=200 --name="VLAN-SERVERS"
```

---

## 🔌 **Interfaces & Conexiones**

```bash
# Interfaces
nb-cli interface list
nb-cli interface add "GigabitEthernet0/1"
nb-cli interface update 1 --description="Uplink to Core"

# Conexiones
nb-cli cable list
nb-cli cable create \
  --termination_a_type="dcim.interface" \
  --termination_a_id=1 \
  --termination_b_type="dcim.interface" \
  --termination_b_id=2

# Trace
nb-cli cable trace 1
```

---

## 🔍 **Búsqueda**

```bash
# Search global
nb-cli search "switch"
nb-cli find --query "Switch-Core"

# Filtros avanzados
nb-cli device filter --site "Ciudad de México" --status "active"
nb-cli ip filter --parent "192.168.0.0/16"
```

---

## 📊 **Reports & Exports**

```bash
# Reports
nb-cli report list
nb-cli report run "Interface Status"

# Exportar
nb-cli export csv --format devices.csv
nb-cli export json > netbox-backup.json

# Importar
nb-cli import csv --file devices.csv
```

---

## 🎯 **Scripts Útiles**

### **Agregar 100 dispositivos**
```bash
#!/bin/bash
for i in {1..100}; do
  nb-cli device add --name="Switch-$i"
  echo "Created Switch-$i"
done
```

### **Encontrar IPs no utilizados**
```bash
nb-cli prefix available 192.168.0.0/24 | grep "available"
```

---

## 📝 **Aliases Útiles**

```bash
# Agregar al ~/.bashrc
alias nbs='nb-cli device list'
alias nbss='nb-cli site list'
alias nbi='nb-cli ip list'
alias nbv='nb-cli vlan list'

# Usar
nbs  # Lista dispositivos
nbss # Lista sitios
```

---

**⚡ Total: 50+ comandos | 20+ ejemplos | Quick reference v1.0**
