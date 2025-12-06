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

## 📦 **Inventario**

```bash
# Componentes
nb-cli component list
nb-cli inventory-item list

# Inventario
nb-cli inventory-item add \
  --device="Switch-Core-01" \
  --name="Módulo de Memoria" \
  --serial="MEM123"
```

---

## 🔐 **Usuarios & Permisos**

```bash
# Usuarios
nb-cli user list
nb-cli user add --username="jose.garcia"

# Grupos
nb-cli group list
nb-cli group create --name="Admins-Red"
```

---

## ⚙️ **Configuraciones**

```bash
# Config
nb-cli config list
nb-cli config get

# Secrets
nb-cli secret list
nb-cli secret add --name="SNMP-Community"

# Campos Personalizados
nb-cli custom-field list
nb-cli custom-field create \
  --name="warranty_end_date" \
  --type="date"
```

---

## 📈 **Estado & Salud**

```bash
# Estadísticas
nb-cli stats
nb-cli dashboard

# Ping/Conectividad
nb-cli ping 192.168.1.1
nb-cli check interface "GigabitEthernet0/1"
```

---

## 🎯 **Scripts Útiles**

### **Agregar 100 dispositivos**
```bash
#!/bin/bash
for i in {1..100}; do
  nb-cli device add --name="Switch-$i"
  echo "Creado Switch-$i"
done
```

### **Encontrar IPs no utilizadas**
```bash
nb-cli prefix available 192.168.0.0/24 | grep "available"
```

### **Exportar lista de dispositivos**
```bash
nb-cli device list --format json | jq '.[] | {name, status, site}' > devices.json
```

---

## 📚 **Ejemplos Completos**

### **Crear Rack completo**
```bash
# 1. Sitio
nb-cli site add "Centro de Datos A"

# 2. Rack
nb-cli rack add --site="Centro de Datos A" --name="RACK-A01"

# 3. Switch
nb-cli device create \
  --name="Core-SW-01" \
  --device_type="Cisco Catalyst 2960X" \
  --site="Centro de Datos A" \
  --rack="RACK-A01" \
  --position=1

# 4. Interfaz
nb-cli interface add --device="Core-SW-01" --name="GigabitEthernet0/1"

# 5. IP
nb-cli ip add 192.168.1.1/24 --interface="GigabitEthernet0/1"

# 6. VLAN
nb-cli vlan add --vid=100 --name="GESTION" --site="Centro de Datos A"
```

---

## ⚠️ **Comandos Peligrosos**

```bash
# ¡CUIDADO! Borra todo
nb-cli delete --all

# ¡CUIDADO! Forzar borrado
nb-cli device delete --force 1

# ¡CUIDADO! Modifica en lote
nb-cli device update --all --status=offline
```

---

## 🆘 **Ayuda Rápida**

```bash
# Ayuda general
nb-cli --help

# Ayuda por comando
nb-cli device --help
nb-cli device add --help

# Versión
nb-cli --version

# Debug
nb-cli --debug device list
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

## 💾 **Exportar/Importar**

```bash
# Backup
nb-cli export json > netbox-$(date +%Y%m%d).json

# Restaurar
nb-cli import json < netbox-20241204.json

# CSV
nb-cli device list --format csv > devices.csv
nb-cli import csv --file devices.csv
```

---

**⚡ Total: 50+ comandos | 20+ ejemplos | Quick reference v1.0**
