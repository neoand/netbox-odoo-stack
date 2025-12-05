# ⚡ NetBox CLI Cheat Sheet

> **Comandos essenciais do nb-cli para produtividade máxima**

---

## 📦 **Instalação**

```bash
# Instalar
pip install pynetbox-cli

# Configurar
nb-cli config --host http://localhost:8000 --token YOUR_TOKEN

# Testar
nb-cli --version
```

---

## 🏗️ **Sites & Racks**

```bash
# Listar sites
nb-cli site list
nb-cli site ls

# Criar site
nb-cli site add "São Paulo HQ"
nb-cli site create --name="Rio de Janeiro" --slug="rio"

# Racks
nb-cli rack list
nb-cli rack add --name="RACK-01" --site="São Paulo HQ"

# Status
nb-cli site list --status active
```

---

## 💻 **Dispositivos**

```bash
# Listar
nb-cli device list
nb-cli device ls

# Filtros
nb-cli device list --site "São Paulo"
nb-cli device list --status active
nb-cli device list --device_type "Switch"

# Adicionar
nb-cli device add --name="Switch-Core-01"
nb-cli device create \
  --name="Server-01" \
  --device_type="Dell PowerEdge R740" \
  --site="São Paulo" \
  --rack="RACK-01" \
  --position=1

# Atualizar
nb-cli device update 1 --status offline
nb-cli device modify 1 --serial="SN123456"

# Detalhes
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

# Adicionar IP
nb-cli ip add 192.168.1.10/24
nb-cli ipam ip-address create \
  --address="10.0.0.1/24" \
  --interface="eth0" \
  --status="Active"

# Encontrar IPs livres
nb-cli ip free 192.168.1.0/24
nb-cli prefix available 10.0.0.0/16

# VLANs
nb-cli vlan list
nb-cli vlan add --vid=100 --name="VLAN-USERS"
nb-cli vlan add --vid=200 --name="VLAN-SERVERS"
```

---

## 🔌 **Interfaces & Conexões**

```bash
# Interfaces
nb-cli interface list
nb-cli interface add "GigabitEthernet0/1"
nb-cli interface update 1 --description="Uplink to Core"

# Conexões
nb-cli cable list
nb-cli cable create \
  --termination_a_type="dcim.interface" \
  --termination_a_id=1 \
  --termination_b_type="dcim.interface" \
  --termination_b_id=2

# Path trace
nb-cli cable trace 1
```

---

## 📦 **Inventário**

```bash
# Componentes
nb-cli component list
nb-cli inventory-item list

# Inventário
nb-cli inventory-item add \
  --device="Switch-Core-01" \
  --name="Memory Module" \
  --serial="MEM123"
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

## 🔍 **Busca**

```bash
# Search global
nb-cli search "switch"
nb-cli find --query "Switch-Core"

# Filtros avançados
nb-cli device filter --site "São Paulo" --status "active"
nb-cli ip filter --parent "192.168.0.0/16"
```

---

## 🔐 **Users & Permissions**

```bash
# Usuários
nb-cli user list
nb-cli user add --username="jose.silva"

# Groups
nb-cli group list
nb-cli group create --name="Network-Admins"
```

---

## ⚙️ **Configurações**

```bash
# Config
nb-cli config list
nb-cli config get

# Secrets
nb-cli secret list
nb-cli secret add --name="SNMP-Community"

# Custom Fields
nb-cli custom-field list
nb-cli custom-field create \
  --name="warranty_end_date" \
  --type="date"
```

---

## 📈 **Status & Health**

```bash
# Stats
nb-cli stats
nb-cli dashboard

# Ping/Connectivity
nb-cli ping 192.168.1.1
nb-cli check interface "GigabitEthernet0/1"
```

---

## 🎯 **Scripts Úteis**

### **Add 100 devices**
```bash
#!/bin/bash
for i in {1..100}; do
  nb-cli device add --name="Switch-$i"
  echo "Created Switch-$i"
done
```

### **Find unused IPs**
```bash
nb-cli prefix available 192.168.0.0/24 | grep "available"
```

### **Export device list**
```bash
nb-cli device list --format json | jq '.[] | {name, status, site}' > devices.json
```

---

## 📚 **Exemplos Completos**

### **Criar Rack completo**
```bash
# 1. Site
nb-cli site add "Data Center A"

# 2. Rack
nb-cli rack add --site="Data Center A" --name="RACK-A01"

# 3. Switch
nb-cli device create \
  --name="Core-SW-01" \
  --device_type="Cisco Catalyst 2960X" \
  --site="Data Center A" \
  --rack="RACK-A01" \
  --position=1

# 4. Interface
nb-cli interface add --device="Core-SW-01" --name="GigabitEthernet0/1"

# 5. IP
nb-cli ip add 192.168.1.1/24 --interface="GigabitEthernet0/1"

# 6. VLAN
nb-cli vlan add --vid=100 --name="MANAGEMENT" --site="Data Center A"
```

---

## ⚠️ **Comandos Perigosos**

```bash
# CUIDADO! Apaga tudo
nb-cli delete --all

# CUIDADO! Força delete
nb-cli device delete --force 1

# CUIDADO! Modifica em lote
nb-cli device update --all --status=offline
```

---

## 🆘 **Ajuda Rápida**

```bash
# Help geral
nb-cli --help

# Help por comando
nb-cli device --help
nb-cli device add --help

# Versão
nb-cli --version

# Debug
nb-cli --debug device list
```

---

## 📝 **Aliases Úteis**

```bash
# Adicionar ao ~/.bashrc
alias nbs='nb-cli device list'
alias nbss='nb-cli site list'
alias nbi='nb-cli ip list'
alias nbv='nb-cli vlan list'

# Usar
nbs  # Lista devices
nbss # Lista sites
```

---

## 💾 **Export/Import**

```bash
# Backup
nb-cli export json > netbox-$(date +%Y%m%d).json

# Restore
nb-cli import json < netbox-20241204.json

# CSV
nb-cli device list --format csv > devices.csv
nb-cli import csv --file devices.csv
```

---

**⚡ Total: 50+ comandos | 20+ exemplos | Quick reference v1.0**
