# 🚀 Fase 1: Planificación & Setup NetBox

> **Días 1-7: Estableciendo las bases para el éxito**

---

## 📋 **Visión General de la Fase**

### **🎯 Objetivos**
- [ ] Definir arquitectura NetBox
- [ ] Configurar ambiente de producción
- [ ] Mapear ambiente actual
- [ ] Preparar equipo
- [ ] Validar requisitos
- [ ] Establecer procesos

### **👥 Equipo Involucrado**
- **👤 PM:** Coordinación general, comunicación stakeholders
- **👤 DevOps:** Setup NetBox, configuración, automatización
- **👤 Network Engineer:** Mapeo red, credenciales
- **👤 Técnico Campo:** Recolección info física, validación

### **⏰ Cronograma**
```
DÍA 1: Kick-off + Planificación
DÍA 2: Definición arquitectura + Requirements
DÍA 3: Auditoría inicial + Mapeo
DÍA 4: Recolección detallada + Scripts
DÍA 5-6: Setup NetBox
DÍA 7: Validación + Go/No-Go Fase 2
```

---

## 📅 **Día 1: Kick-off & Planificación**

### **9h00-10h30: Reunión Kick-off**

#### **📋 Agenda (90 min)**
```
1. BIENVENIDOS (5 min)
   ├─ Presentación equipo
   ├─ Agenda del día
   └─ Expectativas

2. BUSINESS CASE (20 min)
   ├─ Revisar ROI (250% 1er año)
   ├─ Objetivos proyecto
   └─ Cronograma 30 días

3. TEAM ROLES (15 min)
   ├─ Definir responsabilidades
   ├─ Escalation paths
   └─ Daily stand-ups

4. CRONOGRAMA (20 min)
   ├─ Roadmap detallado
   ├─ Hitos y deadlines
   └─ Criterios de aceptación

5. RISK MANAGEMENT (15 min)
   ├─ Identificar riesgos
   ├─ Planes mitigación
   └─ Escalation procedures

6. Q&A (15 min)
   ├─ Dudas generales
   └─ Clarifications
```

#### **📄 Entregables**
```
✅ Project Charter (aprobado)
✅ Equipo asignado y confirmado
✅ Cronograma validado
✅ Stakeholder alignment
✅ Plan comunicación definido
```

#### **👥 Participantes**
```
OBLIGATORIOS:
├─ Gestor Sponsor (CIO/CTO)
├─ Gestor TI
├─ Project Manager
├─ DevOps Engineer
└─ Network Engineer

OPCIONALES:
├─ Gestor Financiero (budget approval)
├─ Representante Auditors (compliance)
└─ Técnico de Campo
```

### **10h30-12h00: Requirements Workshop**

#### **📊 Checklist Requirements**
```
INFRAESTRUCTURA:
□ ¿Cuántos sites/locations?
□ ¿Cuántos dispositivos (estimado)?
□ Tipos de equipos:
  □ Switches (cuántos?)
  □ Routers
  □ Access Points
  □ Firewalls
  □ Servers (físicos + virtuales)
  □ Otros (especificar)

RED:
□ ¿Cuántas VLANs?
□ Ranges IP por site?
□ Múltiples WANs (cuántas?)
□ Proxies?
□ DMZs?

SISTEMAS INTEGRACIÓN:
□ ERP/Odoo (sí/no)?
□ Monitoreo (Grafana, etc)?
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
□ SLA disponibilidad?
□ Volumen de datos?
□ Integraciones específicas?
□ Compliance requirements?
□ Retention policies?
```

#### **📄 Entregables**
```
✅ Requirements document
✅ Technical specifications
✅ Integration priorities
✅ Custom fields list
✅ User roles definition
```

### **14h00-17h00: Team Setup**

#### **📋 Actividades**
```
1. CREACIÓN CUENTAS (30 min)
   ├─ Crear cuentas equipo NetBox
   ├─ Configurar permisos
   ├─ Probar acceso
   └─ Documentar credenciales

2. SETUP COMUNICACIÓN (30 min)
   ├─ Crear Slack/Teams channels
   ├─ Configurar email lists
   ├─ Setup WhatsApp group (emergencias)
   └─ Definir protocols comunicación

3. AMBIENTE DESARROLLO (60 min)
   ├─ Provisionar VMs
   ├─ Instalar Docker
   ├─ Setup Git repositories
   └─ Probar ambiente

4. DEFINIR NAMING CONVENTIONS (90 min)
   ├─ Sites (ej: MX-HQ, GDL-DC)
   ├─ Racks (ej: RACK-A01, RACK-B05)
   ├─ Devices (ej: MX-HQ-RACK01-U10)
   ├─ VLANs (ej: VLAN-ADMIN-100)
   └─ IPs (ej: 192.168.100.0/24)
```

#### **📄 Entregables**
```
✅ Cuentas creadas y probadas
✅ Canales comunicación activos
✅ Ambiente dev funcionando
✅ Naming conventions aprobadas
✅ Documentation repositorio
```

---

## 📅 **Día 2: Arquitectura & Requirements**

### **9h00-12h00: Arquitectura NetBox**

#### **🏗️ Diseño de la Arquitectura**

```
┌─────────────────────────────────────────────────────┐
│                NETBOX ARCHITECTURE                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐      ┌─────────────┐              │
│  │   USERS     │      │    ADMIN    │              │
│  │             │      │             │              │
│  └──────┬──────┘      └──────┬──────┘              │
│         │                    │                     │
│         └──────────┬─────────┘                     │
│                    │                               │
│  ┌─────────────────▼─────────────────────────────┐ │
│  │              NETBOX APP                        │ │
│  │  ┌─────────────┐  ┌─────────────┐             │ │
│  │  │    WEB      │  │    API      │             │ │
│  │  │   GUI       │  │  REST/GraphQL│             │ │
│  │  └─────────────┘  └─────────────┘             │ │
│  └─────────────────┬─────────────────────────────┘ │
│                    │                               │
│  ┌─────────────────▼─────────────────────────────┐ │
│  │           REDIS (Cache)                       │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────┬─────────────────────────────┐ │
│  │   POSTGRESQL    │                            │ │
│  │   (Database)    │                            │ │
│  └─────────────────┘                            │ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │           EXTERNAL SYNC                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │ │
│  │  │  Odoo    │  │  VMware  │  │ Monitoring│     │ │
│  │  │   ERP    │  │   vSphere│  │ (Grafana) │     │ │
│  │  └──────────┘  └──────────┘  └──────────┘     │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

#### **📋 Infrastructure Sizing**

| 📊 Component | 🖥️ **Development** | 🚀 **Production** | 💾 Storage |
|--------------|--------------------|-------------------|------------|
| **CPU** | 2 vCPU | 4-8 vCPU | - |
| **Memory** | 4 GB RAM | 8-16 GB RAM | - |
| **Storage** | 50 GB | 100-500 GB SSD | Según datos |
| **Network** | 1 Gbps | 1 Gbps | - |

#### **🛠️ Stack Tecnológico**

```
INFRAESTRUCTURA:
├─ OS: Ubuntu 22.04 LTS / CentOS 8
├─ Container: Docker + Docker Compose
├─ Database: PostgreSQL 14+
├─ Cache: Redis 6+
├─ Web Server: Nginx (reverse proxy)
└─ SSL: Let's Encrypt

APLICACIÓN:
├─ NetBox: v4.0+
├─ Python: 3.11+
├─ Gunicorn (WSGI)
└─ Daphne (ASGI para websockets)

INTEGRACIONES:
├─ LDAP/AD: Para autenticación
├─ Odoo: Sincronización ERP
├─ VMware: Inventory VMs
├─ Monitoring: Prometheus/Grafana
└─ Backup: pg_dump + scripts
```

### **14h00-17h00: Configuración Técnica**

#### **📋 Setup Inicial**

```bash
# 1. INSTALACIÓN DOCKER
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. CREAR DIRECTORY ESTRUCTURA
mkdir -p /opt/netbox/{postgres,redis,netbox-media,netbox-config}
cd /opt/netbox

# 3. CREAR DOCKER-COMPOSE.YML
cat > docker-compose.yml << 'EOF'
version: '3.4'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: netbox
      POSTGRES_USER: netbox
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:6
    command: redis-server /etc/redis/redis.conf

  netbox:
    image: netboxcommunity/netbox:v4.0
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8080"
    environment:
      DB_NAME: netbox
      DB_USER: netbox
      DB_PASSWORD: your_secure_password
      DB_HOST: postgres
      REDIS_HOST: redis
    volumes:
      - netbox-media:/opt/netbox/media
      - netbox-config:/opt/netbox/config

volumes:
  postgres-data:
  netbox-media:
  netbox-config:
EOF

# 4. INICIAR SERVICIOS
docker-compose up -d

# 5. VERIFICAR STATUS
docker-compose ps
docker-compose logs netbox
```

#### **📄 Configuración Post-Instalación**

```python
# /opt/netbox/netbox/netbox/configuration.py
ALLOWED_HOSTS = ['netbox.empresa.com', '192.168.1.100']
DATABASE = {
    'NAME': 'netbox',
    'USER': 'netbox',
    'PASSWORD': 'your_secure_password',
    'HOST': 'postgres',
    'PORT': '5432',
}

REDIS = {
    'HOST': 'redis',
    'PORT': 6379,
    'DATABASE': 0,
}

# LDAP Integration (opcional)
import ldap
from django_auth_ldap.config import LDAPSearch

AUTH_LDAP_SERVER_URI = "ldap://ldap.empresa.com"
AUTH_LDAP_BIND_DN = "cn=admin,dc=empresa,dc=com"
AUTH_LDAP_BIND_PASSWORD = "password"
AUTH_LDAP_USER_SEARCH = LDAPSearch(
    "ou=users,dc=empresa,dc=com",
    ldap.SCOPE_SUBTREE,
    "(uid=%(user)s)"
)
```

---

## 📅 **Día 3: Auditoría Inicial**

### **9h00-12h00: Network Discovery**

#### **🔍 Scripts de Descubrimiento**

```bash
#!/bin/bash
# /scripts/network-discovery.sh

# 1. NETWORK SCAN
echo "=== NETWORK SCAN ==="
nmap -sn 192.168.0.0/16 -oN network-scan.txt

# 2. SNMP ENUMERATION
echo "=== SNMP DEVICES ==="
nmap -p 161,162 --script snmp-info 192.168.0.0/16 -oN snmp-devices.txt

# 3. WEB SERVICES DETECTION
echo "=== WEB SERVICES ==="
nmap -p 80,443,8080,8443 --script http-title 192.168.0.0/16 -oN web-services.txt

# 4. CISCO DEVICES
echo "=== CISCO DEVICES ==="
nmap -p 23 --script telnet-brute 192.168.0.0/16 -oN telnet-devices.txt
```

```python
#!/usr/bin/env python3
# /scripts/snmp-walk.py

import pysnmp.hlapi as snmp
import csv

def snmp_walk(host, oid):
    devices = []
    for (errorIndication,
         errorStatus,
         errorIndex,
         varBinds) in nextCmd(SnmpEngine(),
                             CommunityData('public'),
                             UdpTransportTarget((host, 161)),
                             ContextData(),
                             ObjectType(ObjectIdentity(oid)),
                             lexicographicMode=False):

        if errorIndication:
            print(errorIndication)
            break
        elif errorStatus:
            print(errorStatus.prettyPrint())
            break
        else:
            for varBind in varBinds:
                devices.append([host, str(varBind[0]), str(varBind[1])])

    return devices

# Ejemplo: Recolectar datos de switches
switches = ['192.168.1.10', '192.168.1.20', '192.168.1.30']
data = []

for switch in switches:
    # System description
    sys_desc = snmp_walk(switch, '1.3.6.1.2.1.1.1.0')
    # Interfaces
    if_desc = snmp_walk(switch, '1.3.6.1.2.1.2.2.1.2')
    data.extend(sys_desc + if_desc)

# Exportar a CSV
with open('switch-data.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Host', 'OID', 'Value'])
    writer.writerows(data)

print("Datos recolectados en switch-data.csv")
```

#### **📊 Template de Inventario**

```csv
Device Name,Type,Model,IP Address,Location,Rack,Position,Serial Number,OS Version,Status
SWITCH-01,Switch,C2960X-48FPS-L,192.168.1.10,Sao Paulo HQ,Rack-A,U10,FOC1234ABC,V15.2(7)E3,Active
ROUTER-01,Router,ISR4321,192.168.1.1,Sao Paulo HQ,Rack-A,U5,FOC5678DEF,IOS XE 16.09.04,Active
FIREWALL-01,Firewall,ASA5520,192.168.1.2,Sao Paulo HQ,Rack-B,U1,FOC9012GHI,9.1(7)28,Active
AP-01,Access Point,AP-1852E,192.168.10.100,Sao Paulo HQ,Floor 2,Conference,,8.10.162.0,Active
```

### **14h00-17h00: Validación y Mapeo**

#### **📋 Checklist de Validación**

```
DISCOVERED DEVICES:
□ Lista de IPs escaneadas
□ Tipos de dispositivos identificados
□ Credenciales SNMP verificadas
□ Dispositivos sin autenticación listados
□ Información de interfaz recolectada

PHYSICAL INFRASTRUCTURE:
□ Sites/locations mapeados
□ Racks identificados por site
□ Power requirements documentados
□ Cooling requirements documentados
□ Cable management documentado

VIRTUAL INFRASTRUCTURE:
□ VMware/vSphere inventory
□ KVM hosts identificados
□ VM guests documentados
□ Storage systems mapeados
□ Cluster configurations documentadas

WAN & CONNECTIVITY:
□ Internet providers listados
□ WAN links documentados
□ Bandwidth utilization medido
□ Redundancy paths identificados
□ SLA status documentado

SECURITY:
□ Firewalls identificados
□ IDS/IPS systems documentados
□ VPN endpoints listados
□ DMZ configurations documentadas
□ ACL rules exportadas
```

#### **📊 Report Template**

```markdown
# Auditoría de Infraestructura - Día 3

## Resumen Ejecutivo
- **Total Dispositivos:** 487
- **Switches:** 120
- **Routers:** 45
- **Access Points:** 80
- **Servers:** 60
- **Firewalls:** 15
- **Otros:** 167

## Topología de Red
```
[Internet]
    |
[Firewall] (ASA-5520)
    |
[Core Switch] (Cisco 4500X)
    |
[Distribution] --> [Access Switches] --> [APs]
```

## Hallazgos Críticos
1. **15 dispositivos sin SNMP configurado**
2. **5 VLANs duplicadas en diferentes sites**
3. **3 switches en fim de vida (EOL)**
4. **Redundancia parcial en WAN**

## Recomendaciones
1. Configurar SNMP en 15 dispositivos
2. Renumerar VLANs duplicadas
3. Plan de reemplazo para switches EOL
4. Implementar redundancia WAN completa

## Próximos Pasos
- [ ] Configurar SNMP en dispositivos faltantes
- [ ] Actualizar documentación de VLANs
- [ ] Planificar reemplazo de equipos EOL
- [ ] Validar redundancy WAN
```

---

## 📅 **Día 4: Recolección Detallada & Scripts**

### **9h00-12h00: Scripts de Automatización**

#### **🔧 Script de Recolección Completa**

```bash
#!/bin/bash
# /scripts/full-inventory.sh

set -e

echo "=== INICIANDO INVENTARIO COMPLETO ==="

# 1. DISCOVER HOSTS
echo "1. Discover hosts en rango..."
nmap -sn 192.168.0.0/16 -oX scans/network-scan.xml
xsltproc scans/network-scan.xml -o scans/network-scan.html

# 2. SNMP ENUMERATION
echo "2. Enumeración SNMP..."
for ip in $(grep 'status="up"' scans/network-scan.xml | grep -oP '(?<=address=")[^"]+'); do
    echo "Escaneando $ip..."
    snmpwalk -v2c -c public $ip 1.3.6.1.2.1.1.1.0 >> scans/snmp-sysdescr.txt
    snmpwalk -v2c -c public $ip 1.3.6.1.2.1.2.2.1.2 >> scans/snmp-ifdescr.txt
done

# 3. EXPORT VMWARE DATA
echo "3. Exportando VMware data..."
python3 /scripts/export-vmware.py

# 4. COLLECT CISCO CONFIGS
echo "4. Recolectando configs Cisco..."
python3 /scripts/collect-cisco-configs.py

# 5. GENERATE REPORT
echo "5. Generando reporte..."
python3 /scripts/generate-inventory-report.py

echo "=== INVENTARIO COMPLETO TERMINADO ==="
```

#### **📦 Script de Importación a NetBox**

```python
#!/usr/bin/env python3
# /scripts/import-to-netbox.py

import pynetbox
import csv
import sys

# Configuración
NETBOX_URL = "http://netbox.empresa.com:8000"
NETBOX_TOKEN = "your_api_token_here"

# Inicializar conexión
nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)

def import_sites():
    """Importar sites desde CSV"""
    with open('sites.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            site = nb.dcim.sites.create(
                name=row['name'],
                slug=row['slug'],
                region=row.get('region', ''),
                facility=row.get('facility', ''),
                physical_address=row.get('address', ''),
                latitude=float(row['lat']) if row.get('lat') else None,
                longitude=float(row['lon']) if row.get('lon') else None,
            )
            print(f"Site creado: {site.name}")

def import_devices():
    """Importar dispositivos"""
    with open('devices.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Buscar site y device type
            site = nb.dcim.sites.get(row['site'])
            device_type = nb.dcim.device_types.get(row['device_type'])

            device = nb.dcim.devices.create(
                name=row['name'],
                device_type=device_type.id,
                site=site.id,
                status='active',
                serial=row.get('serial', ''),
                asset_tag=row.get('asset_tag', ''),
            )
            print(f"Dispositivo creado: {device.name}")

def import_vlans():
    """Importar VLANs"""
    with open('vlans.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            site = nb.dcim.sites.get(row['site'])
            vlan = nb.ipam.vlans.create(
                name=row['name'],
                vid=int(row['vid']),
                site=site.id,
                status='active',
            )
            print(f"VLAN creada: {vlan.name}")

if __name__ == "__main__":
    print("Iniciando importación...")
    import_sites()
    import_devices()
    import_vlans()
    print("¡Importación completada!")
```

### **14h00-17h00: Testing y Validación**

#### **✅ Checklist de Pruebas**

```
FUNCIONAL TESTS:
□ NetBox UI accesible desde browser
□ Login con credenciales de prueba
□ Crear/editar/leer objects básicos
□ Búsquedas funcionando
□ Reports generándose
□ API endpoints respondiendo

PERFORMANCE TESTS:
□ Tiempo respuesta < 2 segundos
□ Búsquedas rápidas (< 1 segundo)
□ Carga de páginas completa < 5 segundos
□ Concurrent users (10+) funcionando
□ Large datasets (500+ devices) OK

INTEGRATION TESTS:
□ LDAP/AD authentication OK
□ Odoo sync funcionando
□ VMware inventory import OK
□ Webhooks disparándose
□ Backup/recovery probado

SECURITY TESTS:
□ SSL/TLS habilitado
□ Credenciales por defecto cambiadas
□ RBAC funcionando
□ API tokens seguros
□ Logs auditados
```

#### **🧪 Script de Pruebas**

```bash
#!/bin/bash
# /scripts/test-netbox.sh

echo "=== NETBOX VALIDATION TESTS ==="

# Test 1: Check UI
echo "1. Testing Web UI..."
curl -I http://netbox.empresa.com:8000
if [ $? -eq 0 ]; then
    echo "✓ Web UI OK"
else
    echo "✗ Web UI FAIL"
fi

# Test 2: Check API
echo "2. Testing API..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Token your_token_here" \
    http://netbox.empresa.com:8000/api/)
if [ "$response" = "200" ]; then
    echo "✓ API OK"
else
    echo "✗ API FAIL"
fi

# Test 3: Check Database
echo "3. Testing Database..."
docker-compose exec -T postgres psql -U netbox -d netbox -c "SELECT 1;" > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Database OK"
else
    echo "✗ Database FAIL"
fi

# Test 4: Performance
echo "4. Testing Performance..."
time curl -s http://netbox.empresa.com:8000/api/sites/ > /dev/null
echo "Performance test completed"

# Test 5: Backup
echo "5. Testing Backup..."
docker-compose exec postgres pg_dump -U netbox netbox > backup-test.sql
if [ -f backup-test.sql ]; then
    echo "✓ Backup OK"
    rm backup-test.sql
else
    echo "✗ Backup FAIL"
fi

echo "=== VALIDATION TESTS COMPLETED ==="
```

---

## 📅 **Día 5-6: Setup NetBox Production**

### **Configuración de Producción**

#### **🔒 Hardening & Security**

```bash
#!/bin/bash
# /scripts/production-hardening.sh

echo "=== PRODUCTION HARDENING ==="

# 1. CAMBIAR CREDENCIALES POR DEFECTO
echo "1. Cambiar credenciales..."
docker-compose exec netbox netbox init
docker-compose exec netbox netbox createsuperuser

# 2. CONFIGURAR SSL/TLS
echo "2. Configurar SSL..."
certbot --nginx -d netbox.empresa.com

# 3. CONFIGURAR FIREWALL
echo "3. Configurar firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 4. CONFIGURAR BACKUP AUTOMÁTICO
echo "4. Setup backup..."
cat > /etc/cron.daily/netbox-backup << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/netbox"
docker-compose exec postgres pg_dump -U netbox netbox | gzip > $BACKUP_DIR/db_$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF
chmod +x /etc/cron.daily/netbox-backup

# 5. CONFIGURAR MONITORING
echo "5. Setup monitoring..."
cat > /etc/netdata/health.d/netbox.conf << 'EOF'
alarm: netbox_down
on: web_service
lookup: max -1m unaligned of web_service
warn: $status == CRITICAL
crit: $status == CRITICAL
EOF

echo "=== HARDENING COMPLETED ==="
```

#### **📊 Optimización**

```yaml
# docker-compose.prod.yml
version: '3.4'

services:
  netbox:
    image: netboxcommunity/netbox:v4.0
    environment:
      DB_NAME: netbox
      DB_USER: netbox
      DB_PASSWORD: ${DB_PASSWORD}
      DB_HOST: postgres
      REDIS_HOST: redis
      REDIS_DATABASE: 0
    volumes:
      - netbox-media:/opt/netbox/media
      - netbox-config:/opt/netbox/config
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
    restart: unless-stopped

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: netbox
      POSTGRES_USER: netbox
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - /etc/postgresql/postgresql.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '1.0'
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    restart: unless-stopped

volumes:
  postgres-data:
  netbox-media:
  netbox-config:
```

---

## 📅 **Día 7: Validación & Go/No-Go**

### **📋 Checklist Final**

#### **Phase 1 Completion Criteria**

```
INFRAESTRUCTURA:
□ NetBox instalado y funcionando
□ PostgreSQL configurado y optimizado
□ Redis configurado como cache
□ SSL/TLS habilitado
□ Backup automático configurado
□ Monitoring activo

CONFIGURACIÓN:
□ Settings básicos configurados
□ LDAP/AD integration OK (si aplica)
□ API tokens creados
□ Users y permissions configurados
□ Custom fields definidos
□ Webhooks configurados (si aplica)

DOCUMENTACIÓN:
□ Architecture document
□ Installation guide
□ Configuration guide
□ User manual básico
□ Troubleshooting guide
□ Scripts documentados

TESTS COMPLETADOS:
□ UI/UX tests OK
□ API tests OK
□ Performance tests OK
□ Integration tests OK
□ Security tests OK
□ Backup/restore tests OK

EQUIPO PREPARADO:
□ NetBox instalado y funcionando
□ Team access validado
□ Communication channels activas
□ Knowledge transfer realizada
□ Soporte escalado definido
```

### **🎯 Métricas de Aceptación**

| 📊 Métrica | 🎯 Target | 📏 Actual | ✅ Status |
|------------|-----------|-----------|-----------|
| Setup Time | ≤ 7 días | __ días | __ |
| System Uptime | ≥ 99% | __ % | __ |
| Response Time | < 2 seg | __ seg | __ |
| Team Satisfaction | 8+/10 | __ /10 | __ |
| Documentation Complete | 100% | __ % | __ |

### **📄 Go/No-Go Decision**

```markdown
# Go/No-Go Decision - Phase 1

## ✅ Criterios Cumplidos
- [ ] NetBox funcionando correctamente
- [ ] Performance OK (< 2 seg response)
- [ ] Security hardening completo
- [ ] Backup automatizado activo
- [ ] Equipo entrenado y validado
- [ ] Documentación completa
- [ ] Integration tests OK

## ⚠️ Issues Abiertos
1. ________________________________
2. ________________________________
3. ________________________________

## 🚀 Decisión Final

□ **GO** - Continuar a Phase 2
  - Razón: ________________________________
  - Condiciones: ____________________________

□ **NO-GO** - Corregir issues antes de continuar
  - Issues: ________________________________
  - Tiempo estimado: _________________________
  - Responsable: _____________________________

## Sign-offs

| 👤 Nombre | 💼 Rol | 📅 Fecha | ✍️ Firma |
|-----------|--------|----------|----------|
| | PM | | |
| | DevOps Lead | | |
| | Network Engineer | | |
| | Sponsor | | |

## Próxima Fase
Si **GO**: [Phase 2: Auditoría y Descubrimiento](phase-02-audit.md)
Si **NO-GO**: Revisar issues y re-evaluar en 24-48h
```

---

## ✅ **Resumen de Entregables Fase 1**

### **📊 Documentación**
- [x] Project Charter aprobado
- [x] Requirements document
- [x] Architecture design
- [x] Network discovery report
- [x] Installation guide
- [x] Configuration guide
- [x] User manual básico

### **🛠️ Infraestructura**
- [x] NetBox server configurado
- [x] PostgreSQL optimizado
- [x] Redis cache configurado
- [x] SSL/TLS habilitado
- [x] Backup automatizado
- [x] Monitoring configurado

### **🔧 Scripts & Automatización**
- [x] Network discovery scripts
- [x] SNMP collection scripts
- [x] Data import scripts
- [x] Validation tests
- [x] Backup scripts

### **👥 Capacitación**
- [x] Equipo con acceso validado
- [x] Communication channels activas
- [x] Knowledge transfer realizada
- [x] Roles y responsabilidades definidos

---

## 🎯 **Próximos Pasos**

### **Si GO a Fase 2:**
```
📅 DÍA 8:
├─ [ ] Kick-off Phase 2
├─ [ ] Iniciar auditoría detallada
├─ [ ] Ejecutar network discovery
├─ [ ] Recolectar SNMP data
├─ [ ] Configurar scripts automatizados
└─ [ ] Documentar hallazgos

📖 DOCUMENTOS:
├─ [Phase 02 - Audit](phase-02-audit.md)
├─ [Network Scan Guide](network-scan.md)
├─ [Data Collection Scripts](../scripts/data-collection/)
```

### **Si NO-GO:**
```
📋 ACCIONES:
1. Identificar issues críticos
2. Asignar recursos para fix
3. Establecer timeline corrección
4. Re-evaluar en 24-48h
5. Documentar lecciones aprendidas
```

---

**📊 Fase 1 Completada: ✅ / ❌ | Tiempo: __ días | Equipo: 4 personas**

---

## 🆘 **Troubleshooting**

### **Common Issues & Solutions**

#### **Issue 1: NetBox no inicia**
```bash
# Verificar logs
docker-compose logs netbox

# Común: Database connection error
# Solución:
docker-compose down
docker volume rm netbox_postgres-data
docker-compose up -d
```

#### **Issue 2: Performance lenta**
```bash
# Verificar recursos
docker stats

# Optimizar PostgreSQL
docker-compose exec postgres psql -U netbox -c "VACUUM ANALYZE;"

# Aumentar cache Redis
docker-compose exec redis redis-cli CONFIG SET maxmemory 512mb
```

#### **Issue 3: API no responde**
```bash
# Verificar networking
docker-compose exec netbox curl http://postgres:5432

# Re-create network
docker-compose down
docker network prune
docker-compose up -d
```

---

**📝 Para soporte adicional:**
- 📧 Email: soporte@netbox-implementacion.com
- 💬 Slack: #netbox-implementacion
- 📚 Docs: [NetBox Official Documentation](https://docs.netbox.dev)

---

**📊 Total Fase 1: 7 días | 100+ tareas | Infraestructura lista para producción**
