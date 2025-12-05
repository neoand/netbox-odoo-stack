# 🚀 Fase 1: Planejamento & Setup NetBox

> **Dias 1-7: Estabelecendo as bases para o sucesso**

---

## 📋 **Visão Geral da Fase**

### **🎯 Objetivos**
- [ ] Definir arquitetura NetBox
- [ ] Configurar ambiente de produção
- [ ] Mapear ambiente atual
- [ ] Preparar equipe
- [ ] Validar requisitos
- [ ] Estabelecer processos

### **👥 Equipe Envolvida**
- **👤 PM:** Coordenação geral, comunicação stakeholders
- **👤 DevOps:** Setup NetBox, configuração, automação
- **👤 Network Engineer:** Mapeamento rede, credenciais
- **👤 Técnico Campo:** Coleta info física, validação

### **⏰ Cronograma**
```
DIA 1: Kick-off + Planejamento
DIA 2: Definição arquitetura + Requirements
DIA 3: Auditoria inicial + Mapeamento
DIA 4: Coleta detailed + Scripts
DIA 5-6: Setup NetBox
DIA 7: Validação + Go/No-Go Fase 2
```

---

## 📅 **Dia 1: Kick-off & Planejamento**

### **9h00-10h30: Reunião Kick-off**

#### **📋 Agenda (90 min)**
```
1. BOAS VINDAS (5 min)
   ├─ Apresentação equipe
   ├─ Agenda do dia
   └─ Expectativas

2. BUSINESS CASE (20 min)
   ├─ Revisar ROI (250% 1º ano)
   ├─ Objetivos projeto
   └─ Cronograma 30 dias

3. TEAM ROLES (15 min)
   ├─ Definir responsabilidades
   ├─ Escalation paths
   └─ Daily stand-ups

4. CRONOGRAMA (20 min)
   ├─ Roadmap detalhado
   ├─ Marcos e deadlines
   └─ Critérios de aceitação

5. RISK MANAGEMENT (15 min)
   ├─ Identificar riscos
   ├─ Planos mitigação
   └─ Escalation procedures

6. Q&A (15 min)
   ├─ Dúvidas gerais
   └─ Clarifications
```

#### **📄 Entregáveis**
```
✅ Project Charter (aprovado)
✅ Equipe alocada e confirmada
✅ Cronograma validado
✅ Stakeholder alignment
✅ Plano comunicação definido
```

#### **👥 Participantes**
```
OBRIGATÓRIOS:
├─ Gestor Sponsor (CIO/CTO)
├─ Gestor TI
├─ Project Manager
├─ DevOps Engineer
└─ Network Engineer

OPCIONAIS:
├─ Gestor Financeiro (budget approval)
├─ Representante Auditors (compliance)
└─ Técnico de Campo
```

### **10h30-12h00: Requirements Workshop**

#### **📊 Checklist Requirements**
```
INFRAESTRUTURA:
□ Quantos sites/locations?
□ Quantos dispositivos (estimativa)?
□ Tipos de equipamentos:
  □ Switches (quantos?)
  □ Routers
  □ Access Points
  □ Firewalls
  □ Servers (físicos + virtuais)
  □ Outros (especificar)

NETWORK:
□ Quantas VLANs?
□ Ranges IP por site?
□ Múltiplas WANs (quantas?)
□ Proxies?
□ DMZs?

SISTEMAS INTEGRATION:
□ ERP/Odoo (sim/não)?
□ Monitoramento (Grafana, etc)?
□ Backup systems?
□ ITSM tools?
□ LDAP/Active Directory?

FUNCIONALIDADES:
□ RBAC (Role-based access)?
□ API requirements?
□ Webhooks?
□ Custom fields?
□ Reports específicos?

REQUISITOS TÉCNICOS:
□ SLA de disponibilidade?
□ Volume de dados?
□ Integrações específicas?
□ Compliance requirements?
□ Retention policies?
```

#### **📄 Entregáveis**
```
✅ Requirements document
✅ Technical specifications
✅ Integration priorities
✅ Custom fields list
✅ User roles definition
```

### **14h00-17h00: Team Setup**

#### **📋 Atividades**
```
1. CRIAÇÃO CONTAS (30 min)
   ├─ Criar contas equipe NetBox
   ├─ Configurar permissões
   ├─ Testar acesso
   └─ Documentar credenciais

2. SETUP COMUNICAÇÃO (30 min)
   ├─ Criar Slack/Teams channels
   ├─ Configurar email lists
   ├─ Setup WhatsApp group (emergências)
   └─ Definir protocols comunicação

3. AMBIENTE DESENVOLVIMENTO (60 min)
   ├─ Provisionar VMs
   ├─ Instalar Docker
   ├─ Setup Git repositories
   └─ Testar ambiente

4. DEFINIR NAMING CONVENTIONS (90 min)
   ├─ Sites (ex: SP-HQ, RIO-DC)
   ├─ Racks (ex: RACK-A01, RACK-B05)
   ├─ Devices (ex: SP-HQ-RACK01-U10)
   ├─ VLANs (ex: VLAN-ADMIN-100)
   └─ IPs (ex: 192.168.100.0/24)
```

#### **📄 Entregáveis**
```
✅ Contas criadas e testadas
✅ Canais comunicação ativos
✅ Ambiente dev funcionando
✅ Naming conventions aprovadas
✅ Documentation repositório
```

---

## 📅 **Dia 2: Arquitetura & Requirements**

### **9h00-12h00: Arquitetura NetBox**

#### **🏗️ Design da Arquitetura**

```
┌─────────────────────────────────────────────────────┐
│                    NETBOX ARCHITECTURE              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐      ┌─────────────┐              │
│  │   USERS     │      │   ADMINS    │              │
│  └──────┬──────┘      └──────┬──────┘              │
│         │                    │                     │
│         └────────┬───────────┘                     │
│                  │                                 │
│          ┌───────▼────────┐                       │
│          │  NetBox App    │                       │
│          │   (Django)     │                       │
│          └───────┬────────┘                       │
│                  │                                 │
│          ┌───────▼────────┐                       │
│          │  PostgreSQL    │                       │
│          │   Database     │                       │
│          └───────┬────────┘                       │
│                  │                                 │
│          ┌───────▼────────┐                       │
│          │     Redis      │                       │
│          │    (Cache)     │                       │
│          └────────────────┘                       │
│                                                      │
│  EXTERNAL INTEGRATIONS:                            │
│  ├─ LDAP/AD                                        │
│  ├─ Odoo ERP                                       │
│  ├─ Monitoring (Grafana)                          │
│  ├─ Ansible                                        │
│  └─ Webhooks                                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### **📊 Sizing**
```
RECOMENDAÇÕES HARDWARE:
┌─────────────────┬──────────┬────────────┬─────────────┐
│ # Dispositivos  │   RAM    │   CPU     │   Storage   │
├─────────────────┼──────────┼────────────┼─────────────┤
│ < 500           │   4 GB   │    2 vCPU  │     50 GB   │
│ 500-2000        │   8 GB   │    4 vCPU  │    100 GB   │
│ 2000-10000      │  16 GB   │    8 vCPU  │    200 GB   │
│ > 10000         │  32 GB   │   16 vCPU  │    500 GB   │
└─────────────────┴──────────┴────────────┴─────────────┘

PARA NOSSO CASO (~500 dispositivos):
├─ RAM: 4-8 GB
├─ CPU: 2-4 vCPU
├─ Storage: 50-100 GB SSD
└─ Backup: 200 GB (retenção 30 dias)
```

#### **📄 Entregáveis**
```
✅ Arquitetura documentada
✅ Sizing calculations
✅ Hardware requirements
✅ Network diagram
✅ Security design
✅ Backup strategy
```

### **14h00-17h00: Environment Planning**

#### **🌐 Network Design**
```
NETBOX SERVER NETWORKING:
┌─────────────────────────────────────────────┐
│ Interface 1: Management (VLAN ADMIN)        │
│ ├─ IP: 192.168.10.100/24                    │
│ ├─ Gateway: 192.168.10.1                    │
│ ├─ DNS: 192.168.10.10, 192.168.10.11       │
│ └─ NTP: pool.ntp.org                        │
│                                              │
│ Interface 2: Database (Internal)            │
│ ├─ IP: 10.0.0.10/24                         │
│ └─ Para: PostgreSQL isolation               │
│                                              │
│ Interface 3: Backup (Separate)              │
│ ├─ IP: 172.16.0.10/24                       │
│ └─ Para: Backup server                      │
└─────────────────────────────────────────────┘

SECURITY GROUPS/FIREWALLS:
├─ INBOUND:
│  ├─ HTTP (80) → Only from admin VLAN
│  ├─ HTTPS (443) → Company IPs
│  ├─ SSH (22) → Jump server only
│  └─ SNMP (161) → Monitoring servers
├─ OUTBOUND:
│  ├─ HTTP/HTTPS (80/443) → Internet (updates)
│  ├─ DNS (53) → Internal DNS servers
│  ├─ NTP (123) → pool.ntp.org
│  └─ PostgreSQL (5432) → Internal DB subnet
└─ MONITORING:
   ├─ Incoming: SNMP traps
   ├─ Outgoing: Metrics to Grafana
   └─ Health checks: Prometheus
```

#### **📋 Server Setup Checklist**
```
PREPARAÇÃO:
□ Provisionar servidor (VM/Physical)
□ Instalar Ubuntu 22.04 LTS (or CentOS)
□ Configurar rede
□ Atualizar OS
□ Instalar Docker + docker-compose
□ Configurar firewall
□ Configurar SSH keys
□ Configurar NTP
□ Configurar backup client

NETBOX:
□ Clonar NetBox Docker repo
□ Configurar docker-compose.yml
□ Configurar .env file
□ Setup PostgreSQL database
□ Setup Redis cache
□ Executar migrations
□ Criar superuser
□ Testar instalação

VALIDAÇÃO:
□ Acessar http://netbox-server:8000
□ Login com superuser
□ Verificar plugins
□ Testar API
□ Configurar backup inicial
□ Documentar setup
```

#### **📄 Entregáveis**
```
✅ Network design approved
✅ Server provisioned
✅ Docker containers running
✅ Database configured
✅ Backup system setup
✅ Security configured
```

---

## 📅 **Dia 3: Auditoria Inicial**

### **9h00-12h00: Infrastructure Mapping**

#### **📊 Site Survey**
```
SITES IDENTIFICATION:
┌────────────────────────────────────────────────────┐
│ #  │ Site Name     │ Location    │ Devices │ Notes │
├────────────────────────────────────────────────────┤
│ 01 │ HQ - São Paulo│ Av. Paulista│  ~150   │ Sede  │
│ 02 │ DC - São Paulo│ Alphaville  │  ~200   │ DC    │
│ 03 │ Filial - Rio  │ Centro      │   ~50   │ small │
│ 04 │ Filial - BH   │ Zona Sul    │   ~40   │ small │
│ 05 │ Filial - BSB  │ Asa Norte   │   ~30   │ small │
│    │               │             │         │       │
│    │ TOTAL         │ 5 sites     │  ~470   │       │
└────────────────────────────────────────────────────┘

PER SITE DETAILS:
┌────────────────────────────────────────────────────┐
│ SITE: [Site Name]                                  │
├────────────────────────────────────────────────────┤
│ 📍 Address:                                        │
│ 🏢 Building Floors:                                │
│ 🔌 Racks:                                          │
│ ├─ Rack 01: [x]U, [equipment]                     │
│ ├─ Rack 02: [x]U, [equipment]                     │
│ └─ ...                                             │
│ 🌐 Network Infrastructure:                         │
│ ├─ Core Switch: [model/brand]                      │
│ ├─ Distribution Switches:                          │
│ ├─ Access Switches:                                │
│ ├─ Routers:                                        │
│ ├─ Firewalls:                                      │
│ ├─ WiFi Controllers:                               │
│ └─ Other:                                          │
│ 📡 WAN Links:                                      │
│ ├─ Link 1: [ISP] [Bandwidth] [Technology]         │
│ ├─ Link 2: [ISP] [Bandwidth] [Technology]         │
│ └─ Backup: [ISP] [Bandwidth] [Technology]         │
└────────────────────────────────────────────────────┘
```

#### **📋 Equipment Inventory (Rascunho)**
```
SWITCHES:
┌────────────────────────────────────────────────────┐
│ Qty │ Brand/Model     │ Location    │ IP Mgmt    │
├────────────────────────────────────────────────────┤
│ 5   │ Cisco Catalyst  │ DC - Rack 1 │ 10.0.1.x  │
│ 12  │ HPE Aruba       │ DC - Rack 2 │ 10.0.2.x  │
│ 8   │ Cisco SG        │ HQ - Floors │ 10.0.10.x │
│ 3   │ HP 1820         │ Filiais     │ 10.0.50.x │
└────────────────────────────────────────────────────┘

ROUTERS:
┌────────────────────────────────────────────────────┐
│ Qty │ Brand/Model   │ Location   │ WAN Links  │
├────────────────────────────────────────────────────┤
│ 2   │ Cisco ISR    │ DC         │ 3x ISPs    │
│ 1   │ MikroTik     │ HQ         │ 2x ISPs    │
│ 5   │ Huawei AR    │ Filiais    │ 1x ISP     │
└────────────────────────────────────────────────────┘

ACCESS POINTS:
┌────────────────────────────────────────────────────┐
│ Qty │ Brand/Model   │ SSIDs     │ Locations   │
├────────────────────────────────────────────────────┤
│ 25  │ UniFi AP-AC  │ 5 SSIDs   │ HQ          │
│ 12  │ Aruba AP     │ 3 SSIDs   │ DC          │
│ 8   │ TP-Link      │ 2 SSIDs   │ Filiais     │
└────────────────────────────────────────────────────┘
```

### **14h00-17h00: Detailed Data Collection**

#### **🔍 Network Discovery**

##### **Script: Network Scan**
```bash
#!/bin/bash
# network-scan.sh
# Descoberta automatizada da rede

# Definir ranges de rede para scan
RANGES=(
    "192.168.0.0/24"
    "192.168.1.0/24"
    "10.0.0.0/16"
    "172.16.0.0/16"
)

echo "🔍 Iniciando network scan..."

# Instalar nmap se não instalado
if ! command -v nmap &> /dev/null; then
    echo "📦 Instalando nmap..."
    sudo apt-get update
    sudo apt-get install -y nmap
fi

# Scan cada range
for RANGE in "${RANGES[@]}"; do
    echo ""
    echo "🔍 Escaneando $RANGE..."

    # Descoberta de hosts ativos
    nmap -sn $RANGE -oG nmap-scan-$RANGE.txt

    # Descoberta de serviços
    nmap -sS -O $RANGE -oX nmap-services-$RANGE.xml

    # SNMP discovery
    nmap --script snmp* -p 161 $RANGE -oX nmap-snmp-$RANGE.xml

    echo "✅ Concluído: $RANGE"
done

echo ""
echo "🎯 Scan concluído! Resultados em:"
echo "   - nmap-scan-*.txt"
echo "   - nmap-services-*.xml"
echo "   - nmap-snmp-*.xml"
```

##### **Script: SNMP Walk**
```bash
#!/bin/bash
# snmp-walk.sh
# Coleta SNMP de dispositivos

# Comunidades SNMP (edite conforme seu ambiente)
SNMP_COMMUNITIES=(
    "public"
    "private"
    "company-read"
    "company-write"
)

# IPs para scan SNMP
SNMP_IPS_FILE="snmp-hosts.txt"

echo "🔍 Iniciando SNMP scan..."

# Criar lista de IPs para scan
nmap -sn 192.168.0.0/16 10.0.0.0/16 | grep "Nmap scan report" | awk '{print $5}' > $SNMP_IPS_FILE

# Para cada IP, tentar SNMP
while IFS= read -r ip; do
    echo "🔍 SNMP: $ip"

    for community in "${SNMP_COMMUNITIES[@]}"; do
        echo "  Tentativa: $community"

        # Tentar SNMPv2
        snmpwalk -v2c -c $community $ip 1.3.6.1.2.1.1 > snmp-$ip-$community.txt 2>/dev/null

        if [ $? -eq 0 ]; then
            echo "  ✅ Sucesso: $community"
            break
        fi
    done
done < $SNMP_IPS_FILE

echo ""
echo "🎯 SNMP scan concluído!"
```

#### **📊 Data Collection Template**
```csv
# devices.csv - Template para importação inicial
name,device_type,manufacturer,model,site,rack,position,status,serial,ip_address,mac_address,custom_location,notes
Switch-Core-01,Switch,Cisco,Catalyst 2960X,DC-Alphaville,RACK-01,U1,active,FCW2140L0JC,10.0.1.10,00:1A:2B:3C:4D:5E,Prédio Principal - Andar 1,Core switch datacenter
Switch-Dist-01,Switch,Cisco,Catalyst 2960X,HQ-Paulista,RACK-A05,U5,active,FCW2140L0JD,10.0.10.20,00:1A:2B:3C:4D:5F,Escritório - Andar 5,Distribution switch
Router-Main-01,Router,Cisco,ISR 4331,DC-Alphaville,RACK-02,U10,active,FCW2140L0JK,10.0.0.1,00:1A:2B:3C:4D:60,Router principal,Head-end
AP-Office-01,Access Point,UniFi,UniFi AP-AC-Pro,HQ-Paulista,Andar-3,Desk-01,active,AP123456,DHCP,AA:BB:CC:DD:EE:FF,Sala 301,Acesso WiFi

# Campos:
# name: Nome do dispositivo
# device_type: Switch, Router, Server, Access Point, etc
# manufacturer: Cisco, HP, Dell, etc
# model: Modelo específico
# site: Nome do site
# rack: Rack (se aplicável)
# position: U position (ex: U10) ou localização física
# status: active, offline, planned, inventory
# serial: Número de série
# ip_address: Endereço IP de gerenciamento
# mac_address: MAC address
# custom_location: Descrição livre da localização
# notes: Observações adicionais
```

#### **📄 Entregáveis**
```
✅ Site survey completo
✅ Device inventory draft
✅ Network topology map
✅ VLAN list
✅ IP ranges documented
✅ SNMP credentials list
✅ Discovery scripts ready
```

---

## 📅 **Dias 4-5: Scripts & Preparação**

### **9h00-17h00: Automação Setup**

#### **🛠️ NetBox Installation Script**
```bash
#!/bin/bash
# install-netbox.sh
# Instalação automatizada NetBox

set -e

echo "🚀 Installing NetBox..."

# Variáveis
NETBOX_VERSION="v4.0.4"
DB_NAME="netbox"
DB_USER="netbox"
DB_PASSWORD=$(openssl rand -base64 32)
NETBOX_SECRET=$(openssl rand -base64 50)

# Diretórios
INSTALL_DIR="/opt/netbox"
DATA_DIR="/opt/netbox-data"

# 1. Instalar dependências
echo "📦 Installing dependencies..."
sudo apt-get update
sudo apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    postgresql \
    postgresql-contrib \
    redis-server \
    git \
    curl \
    nginx

# 2. Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL..."
sudo -u postgres createdb $DB_NAME
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# 3. Instalar NetBox
echo "⬇️ Downloading NetBox..."
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR
cd $INSTALL_DIR
wget https://github.com/netbox-community/netbox/archive/$NETBOX_VERSION.tar.gz
tar -xzf $NETBOX_VERSION.tar.gz --strip-components 1
rm $NETBOX_VERSION.tar.gz

# 4. Setup virtual environment
echo "🐍 Setting up Python virtualenv..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 5. Configuração
echo "⚙️ Configuring NetBox..."
cp configuration.example.py configuration.py

cat > configuration.py << EOF
from netbox.settings import *

DATABASE = {
    'NAME': '$DB_NAME',
    'USER': '$DB_USER',
    'PASSWORD': '$DB_PASSWORD',
    'HOST': 'localhost',
    'PORT': '',
}

SECRET_KEY = '$NETBOX_SECRET'

ALLOWED_HOSTS = ['*']

EOF

# 6. Rodar migrations
echo "🔄 Running migrations..."
python manage.py migrate

# 7. Criar superuser
echo "👤 Creating superuser..."
python manage.py createsuperuser

# 8. Coletar static files
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

# 9. Testar instalação
echo "✅ Testing installation..."
curl -I http://localhost:8000

# Salvar credenciais
cat > $DATA_DIR/netbox-credentials.txt << EOF
# NetBox Installation Credentials
# Generated: $(date)

Database:
  Name: $DB_NAME
  User: $DB_USER
  Password: $DB_PASSWORD

NetBox:
  URL: http://localhost:8000
  Admin: admin
  Password: [SET AT SUPERUSER CREATION]

Secret Key: $NETBOX_SECRET

EOF

echo "✅ NetBox installed successfully!"
echo "📄 Credentials saved to: $DATA_DIR/netbox-credentials.txt"
```

#### **🔌 Data Collection Scripts**

##### **Script: Import from CSV**
```python
#!/usr/bin/env python3
"""
Import devices from CSV file to NetBox
"""

import csv
import sys
import os
import django

# Setup Django
sys.path.append('/opt/netbox')
os.environ['DJANGO_SETTINGS_MODULE'] = 'netbox.settings'
django.setup()

from dcim.models import Device, DeviceType, Manufacturer, Site, Rack

def import_devices(csv_file):
    """Import devices from CSV"""

    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)

        for row in reader:
            try:
                # Get or create site
                site, created = Site.objects.get_or_create(
                    name=row['site'],
                    defaults={
                        'slug': row['site'].lower().replace(' ', '-'),
                        'status': 'active'
                    }
                )
                if created:
                    print(f"✅ Created site: {site.name}")

                # Get or create device type
                manufacturer, _ = Manufacturer.objects.get_or_create(
                    name=row['manufacturer']
                )

                device_type, created = DeviceType.objects.get_or_create(
                    manufacturer=manufacturer,
                    model=row['model'],
                    defaults={
                        'slug': row['model'].lower().replace(' ', '-'),
                        'part_number': row.get('model', '')
                    }
                )
                if created:
                    print(f"✅ Created device type: {device_type}")

                # Create device
                device, created = Device.objects.get_or_create(
                    name=row['name'],
                    site=site,
                    defaults={
                        'device_type': device_type,
                        'status': row.get('status', 'active'),
                        'serial': row.get('serial', ''),
                        'custom_fields': {
                            'mac_address': row.get('mac_address', ''),
                            'custom_location': row.get('custom_location', ''),
                            'notes': row.get('notes', '')
                        }
                    }
                )

                if created:
                    print(f"✅ Created device: {device.name}")
                else:
                    print(f"⚠️  Device already exists: {device.name}")

            except Exception as e:
                print(f"❌ Error creating device {row['name']}: {e}")

if __name__ == '__main__':
    csv_file = sys.argv[1]
    import_devices(csv_file)
    print("✅ Import completed!")
```

##### **Script: SNMP Discovery**
```python
#!/usr/bin/env python3
"""
SNMP-based device discovery for NetBox
"""

import subprocess
import json
from datetime import datetime

def snmp_get(ip, oid, community='public'):
    """Execute SNMP GET"""
    try:
        result = subprocess.run(
            ['snmpget', '-v2c', '-c', community, ip, oid],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def discover_device(ip, community='public'):
    """Discover single device via SNMP"""

    device = {
        'ip': ip,
        'timestamp': datetime.now().isoformat(),
        'reachable': False,
        'info': {}
    }

    # Test connectivity
    ping_result = subprocess.run(
        ['ping', '-c', '1', '-W', '1', ip],
        capture_output=True
    )

    if ping_result.returncode == 0:
        device['reachable'] = True

        # SNMP System Info
        sys_descr = snmp_get(ip, '1.3.6.1.2.1.1.1.0', community)
        sys_name = snmp_get(ip, '1.3.6.1.2.1.1.5.0', community)

        device['info'] = {
            'sys_descr': sys_descr,
            'sys_name': sys_name
        }

        # Try to identify vendor
        if 'cisco' in sys_descr.lower():
            device['vendor'] = 'Cisco'
        elif 'hp' in sys_descr.lower() or 'hpe' in sys_descr.lower():
            device['vendor'] = 'HP/HPE'
        elif 'aruba' in sys_descr.lower():
            device['vendor'] = 'Aruba'
        elif 'juniper' in sys_descr.lower():
            device['vendor'] = 'Juniper'
        else:
            device['vendor'] = 'Unknown'

    return device

def scan_network(network):
    """Scan entire network"""

    print(f"🔍 Scanning network: {network}")

    # Use nmap to find hosts
    nmap_result = subprocess.run(
        ['nmap', '-sn', '-n', network],
        capture_output=True,
        text=True
    )

    devices = []

    # Parse nmap output
    for line in nmap_result.stdout.split('\n'):
        if 'Nmap scan report for' in line:
            ip = line.split()[-1].strip('()')
            device = discover_device(ip)
            devices.append(device)

    return devices

if __name__ == '__main__':
    network = sys.argv[1] if len(sys.argv) > 1 else '192.168.0.0/24'

    devices = scan_network(network)

    # Save results
    with open(f'discovery-{datetime.now().strftime("%Y%m%d-%H%M%S")}.json', 'w') as f:
        json.dump(devices, f, indent=2)

    print(f"✅ Discovery completed. Found {len(devices)} devices")
    print(f"📄 Results saved to discovery-*.json")
```

#### **📄 Entregáveis**
```
✅ NetBox server installed and configured
✅ Database optimized
✅ Backup system configured
✅ Monitoring setup
✅ Import scripts ready
✅ Discovery scripts tested
✅ Documentation complete
```

---

## 📅 **Dias 6-7: Setup Completion & Validation**

### **9h00-12h00: Final Setup**

#### **🔒 Security Hardening**
```bash
#!/bin/bash
# security-hardening.sh

echo "🔒 Applying security hardening..."

# 1. Disable root SSH
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh

# 2. Configure firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 3. Fail2ban (prevent brute force)
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# 4. Auto-updates
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 5. Log rotation
cat > /etc/logrotate.d/netbox << EOF
/opt/netbox/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 netbox netbox
}
EOF

echo "✅ Security hardening applied"
```

#### **📊 Monitoring Setup**
```yaml
# docker-compose.yml (excerpt)
services:
  netbox:
    # ... other config
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

### **14h00-17h00: Validation**

#### **✅ Test Checklist**
```
FUNCTIONAL TESTS:
□ NetBox loads at http://server:8000
□ Login with admin works
□ Can create site
□ Can create device type
□ Can create device
□ API responds at /api/
□ Search works
□ Reports generate

PERFORMANCE TESTS:
□ Page load < 2 seconds
□ API response < 500ms
□ Database queries < 100ms
□ Import 100 devices < 30 seconds

INTEGRATION TESTS:
□ LDAP/AD authentication (if configured)
□ Webhook delivery
□ Backup/restore test
□ Monitoring alerts working
□ SSL certificate valid

SECURITY TESTS:
□ HTTPS redirect working
□ Security headers present
□ No credentials in logs
□ Firewall rules active
□ Fail2ban blocking attacks
```

#### **📄 Documentation**
```
✅ Installation guide
✅ Configuration guide
✅ Backup/restore procedure
✅ Troubleshooting guide
✅ User manual
✅ Admin quick reference
✅ Architecture document
```

---

## 🎯 **Go/No-Go Criteria - Fase 1**

### **Para Avançar para Fase 2, Precisamos:**

#### **✅ Obrigatório (Must Have)**
- [ ] NetBox instalado e funcionando
- [ ] Banco de dados configurado e otimizado
- [ ] Backup automatizado testado
- [ ] Equipe com acesso e contas criadas
- [ ] Network scan executado
- [ ] Lista de dispositivos inicial criada
- [ ] Scripts de importação testados
- [ ] Security hardening aplicado
- [ ] Documentation completa

#### **🎯 Desejável (Nice to Have)**
- [ ] LDAP/AD integrado
- [ ] SSL certificate configured
- [ ] Monitoring com Grafana
- [ ] Performance otimizada
- [ ] Custom fields configurados

#### **📊 Métricas de Sucesso**
```
Setup Time: ≤ 7 dias ✓
Devices Discovered: ≥ 400 (~85%)
Setup Success: 100%
Team Readiness: 100%
Script Reliability: ≥ 95%
```

---

## 🚨 **Troubleshooting**

### **Problemas Comuns**

#### **❌ NetBox não inicia**
```bash
# Verificar logs
docker-compose logs netbox

# Verificar banco
docker-compose exec postgres pg_isready

# Verificar configuração
docker-compose exec netbox python manage.py check
```

#### **❌ Database connection failed**
```bash
# Verificar credenciais
cat .env | grep DB_

# Testar conexão
docker-compose exec netbox python manage.py dbshell

# Resetar banco (CUIDADO!)
docker-compose down -v
docker volume rm $(docker volume ls -q | grep netbox)
docker-compose up -d
```

#### **❌ Performance lenta**
```bash
# Verificar recursos
docker stats

# Otimizar PostgreSQL
docker-compose exec postgres psql -U netbox -c "
    ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
    ALTER SYSTEM SET pg_stat_statements.track = 'all';
    SELECT pg_reload_conf();
"
```

### **🆘 Emergency Contacts**
```
PM: [phone] [email]
DevOps: [phone] [email]
Network: [phone] [email]
Sponsor: [phone] [email]
```

---

## 📚 **Próximos Passos**

### **Se Fase 1 foi concluída:**
```
1. Documentar lições aprendidas
2. Atualizar roadmap
3. Preparar kick-off Fase 2
4. Comunicar stakeholders
5. Começar Data Collection
```

### **Recursos Adicionais:**
- [Phase 2: Data Collection](phase-02-audit.md)
- [Quick References](../quick-refs/)
- [Troubleshooting](../troubleshooting/)

---

**✅ Fase 1 Status: ___/___ checkpoints completos**
