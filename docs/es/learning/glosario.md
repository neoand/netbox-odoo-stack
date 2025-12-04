# Glosario Interactivo: Términos que Necesitas Conocer

> **"Si no sabes qué significa, no podrás amar lo que haces"**

---

## 📚 Índice Rápido

**[Conceptos Básicos](#conceptos-básicos)** | **[NetBox Específico](#netbox-específico)** | **[Integración](#integración)** | **[Infraestructura](#infraestructura)**

---

## 🎯 Conceptos Básicos

### CMDB (Configuration Management Database)

**Qué es:** Base de datos que almacena información sobre componentes de TI (hardware, software, servicios).

**Por qué existe:** Imagínate una hoja de cálculo de Excel gigante que tiene TODO de tu infraestructura: dónde está cada servidor, qué software corre dónde, quién es responsable de cada cosa.

**Ejemplo práctico:**
```
Antes del CMDB:
  - "Juan, ¿dónde está el servidor de email?"
  - "Déjame verificar... *busca por 30 min*"
  - "Ah, está en la sala del servidor, rack 5, posición 15"

Con CMDB:
  - "NetBox, ¿dónde está el servidor de email?"
  - "Mail-Server-01: Rack-05, U15, IP 192.168.1.10, responsable: María"
```

**Por qué developers deben importarse:** Es la **fuente única de verdad**. Cualquier automatización que hagas depende de estos datos correctos.

---

### IPAM (IP Address Management)

**Qué es:** Sistema para gestionar direcciones IP (quién usa cuál IP, subredes, conflictos).

**El dolor que resuelve:** Imagínate 3 hojas de cálculo diferentes con IPs. ¿Cuál está correcta? Cuando un servidor no conecta, ¿cómo descobrir si es conflicto de IP?

**Ejemplo:**
```
Sin IPAM:
  ❌ Hoja-1: 192.168.1.10 → Servidor A
  ❌ Hoja-2: 192.168.1.10 → Servidor B  (¡PELIGRO!)
  ❌ Hoja-3: 192.168.1.11 → Servidor C

Con NetBox (IPAM):
  ✅ NetBox: 192.168.1.10 → Asignado a Servidor A
  ✅ NetBox muestra: IP libre 192.168.1.11 para Servidor C
  ✅ Validación automática evita conflictos
```

---

### DCIM (Data Center Infrastructure Management)

**Qué es:** Gestión de la infraestructura física del datacenter: racks, energía, cooling, cables.

**Qué incluye:**
- **Sitios** (donde están los datacenters)
- **Racks** (cada "estante" para equipos)
- **Cables** (cómo está interconectado)

**Por qué importa:** Sin esto, ¿cómo saber qué rack tiene espacio? ¿Cómo mapear dependencias? ¿Cómo un técnico encuentra el servidor en el rack?

---

## 🔧 NetBox Específico

### Site (Sitio)

**Qué es:** Representa una ubicación física (ej: Datacenter Ciudad de México, Oficina Guadalajara).

**Campos importantes:**
```yaml
name: "Ciudad de México HQ"
location: "Av. Reforma 100"
description: "Datacenter principal"
status: "Active"  # o Planned, Staged, Retired
```

**Ejemplo práctico:** Sitio "CDMX-HQ" tiene 5 racks, 120 servidores, 50 switches.

---

### Rack

**Qué es:** Estructura física que hospeda equipos. Tiene unidades (U) numeradas (generalmente 42U).

**Ejemplo de layout:**
```
Rack-01 (U42 arriba → U1 abajo):
  U42: Switch Core 01
  U41: Switch Access 01
  U40: Patch Panel 01
  ...
  U20: Servidor Web 03
  ...
  U01: Patch Panel Bottom
```

**Por qué developers necesitan saber:** Cuando un equipo falla, necesitas saber exactamente dónde está físicamente.

---

### Device (Dispositivo)

**Qué es:** Cualquier equipo: servidor, switch, router, storage, etc.

**Ejemplo:**
```yaml
name: "web-server-prod-01"
device_type: "Dell PowerEdge R740"
role: "Web Server"
status: "Active"
site: "CDMX-HQ"
rack: "Rack-15"
position: "20"  # U20
serial: "ABC123XYZ"
asset_tag: "WEB-001"
```

**Device Type vs Device:**
- **Device Type**: Template (ej: "Dell PowerEdge R740") - define specs
- **Device**: Instancia real (ej: "web-server-prod-01") - usa el template

---

### Interface

**Qué es:** Puerto físico o virtual en un dispositivo.

**Tipos:**
- **Physical**: eth0, gig0/1, fa1/0/24
- **Virtual**: VLAN interfaces, loopback, SVI

**Ejemplo:**
```yaml
name: "eth0"
type: "1000base-t"  # velocidad
enabled: true
mac_address: "00:11:22:33:44:55"
mtu: 1500
```

---

### IP Address

**Qué es:** Dirección IPv4 o IPv6 asignada a una interfaz.

**Estados:**
- **Active**: En uso
- **Available**: Libre para usar
- **Reserved**: Reservado (no usar aún)
- **Deprecated**: Descontinuado

**Ejemplo:**
```yaml
address: "192.168.1.10/24"
status: "Active"
interface: "eth0"  # a cuál interfaz está attached
description: "Servidor Web Producción"
```

---

### Prefix (Prefijo de Red)

**Qué es:** Bloque de direcciones de red (ej: 192.168.0.0/24).

**Jerarquía:**
```
192.168.0.0/16 (red clase B)
  ├── 192.168.1.0/24 (subred 1)
  ├── 192.168.2.0/24 (subred 2)
  └── 192.168.3.0/24 (subred 3)
```

**Uso:** Organiza la red por función o departamento.

---

### VLAN (Virtual LAN)

**Qué es:** Red virtual aislada dentro de la misma red física.

**Ejemplo:**
```
VLAN 100: Usuarios (192.168.100.0/24)
VLAN 200: Servidores (192.168.200.0/24)
VLAN 300: IoT (192.168.300.0/24)

Mismo switch físico, pero tráfico aislado.
```

---

### VRF (Virtual Routing and Forwarding)

**Qué es:** Instancia virtual de enrutamiento. Múltiples tablas de enrutamiento en la misma red física.

**Uso típico:**
- VRF-Production: Servicios de producción
- VRF-Development: Ambiente de desarrollo
- VRF-Guest: WiFi de visitantes

---

### Custom Fields (Campos Personalizados)

**Qué es:** Campos personalizados que creas para agregar datos específicos de tu negocio.

**Ejemplo:**
```python
# Crear custom field en NetBox
{
  'name': 'codigo_inventario',
  'type': 'text',
  'label': 'Código de Inventario',
  'required': True
}

# Usar en el dispositivo
device = {
  'name': 'web-server-01',
  'custom_fields': {
    'codigo_inventario': 'INV-2024-001'
  }
}
```

**Ejemplos de custom fields útiles:**
- `cost_center` (centro de costo para Odoo)
- `warranty_end` (fin de garantía)
- `responsible_team` (equipo responsable)
- `environment` (prod, hom, dev)

---

## 🔗 Integración

### Webhook

**Qué es:** HTTP POST automático que NetBox dispara cuando algo pasa.

**Flujo:**
```
1. Usuario crea device en NetBox
2. NetBox detecta: "¡evento ocurrió!"
3. NetBox hace POST a URL configurada
4. Tu sistema recibe: {event: "create", data: {...}}
5. Tu sistema procesa (ej: crear en Odoo)
```

**Payload ejemplo:**
```json
{
  "event": "create",
  "timestamp": "2024-12-04T10:30:00Z",
  "data": {
    "id": 123,
    "name": "switch-core-01",
    "serial": "ABC123",
    "site": "Ciudad de México HQ"
  }
}
```

---

### REST API

**Qué es:** Interfaz HTTP para leer/escribir datos de NetBox.

**Ejemplo de request:**
```bash
# Listar devices (GET)
GET http://netbox/api/dcim/devices/

# Crear device (POST)
POST http://netbox/api/dcim/devices/
{
  "name": "servidor-test",
  "device_type": 15,
  "role": 3,
  "status": "active"
}

# Autenticación via token
curl -H "Authorization: Token abc123def456" \
     http://netbox/api/dcim/devices/
```

---

### GraphQL

**Qué es:** Lenguaje de consulta que permite buscar datos de forma flexible.

**Ejemplo:**
```graphql
query {
  devices {
    id
    name
    serial
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
```

**Ventaja:** Busca exactamente lo que quieres, nada más.

---

### Plugin

**Qué es:** Extensión que agrega funcionalidades a NetBox.

**Tipos:**
- **UI Extensions**: Pestañas, botones, formularios personalizados
- **Data Validation**: Reglas de validación personalizadas
- **Custom Scripts**: Jobs automatizados
- **Reports**: Reportes personalizados

---

### Job / Script

**Qué es:** Tarea automatizada que corre en NetBox.

**Ejemplo de uso:**
- Sincronización con Odoo (nightly)
- Backup de configuraciones
- Validación de compliance
- Limpieza de IPs huérfanas

---

## 🏗️ Infraestructura

### Interface (Concepto de Red)

**Qué es:** Punto de conexión entre dispositivos.

**Ejemplo de conexión:**
```
Switch-Core-01: eth0
        ↕️ (cable de red)
Servidor-Web-01: eth0
```

**Cómo aparece en NetBox:**
```
Conexión de Interfaz:
  Switch-Core-01:eth0 ⟷ Servidor-Web-01:eth0
  Estado: Conectado
```

---

### Cable / Cable Terminations

**Qué es:** Registro de cables y dónde están conectados.

**Por qué importa:**
- Mapeo visual de la red
- Identificar puntos de falla
- Auditoría de cableado

---

### Power Panel / Power Port

**Qué es:** Gestión de energía (dónde cada equipo está conectado).

**Problema que resuelve:** "¿El rack se cayó, qué equipos fueron afectados?"

---

### Platform

**Qué es:** Sistema operativo o plataforma (Linux, Windows, Cisco IOS, etc.).

**Uso:** Usado por plugins de automatización (Ansible, etc.).

---

### Manufacturer / Device Type

**Qué es:** Catálogo de hardware.

```
Manufacturer: Dell
  └─ Device Type: PowerEdge R740
      └─ Device: web-server-01
```

---

## 🔍 Consejos Prácticos para Developers

### 1. Entiende la Jerarquía

```
Sitio
 └─ Rack (dentro del Sitio)
     └─ Device (en el Rack)
         └─ Interface (en el Device)
             └─ IP Address (en la Interface)
```

**Siempre piensa:** "Si borro X, ¿qué pasa con Y?"

### 2. IDs vs Nombres

```python
# ❌ MALO: Buscar por nombre (puede cambiar)
device = nb.dcim.devices.get(name='servidor-web')

# ✅ BUENO: Buscar por ID (único y estable)
device = nb.dcim.devices.get(id=123)

# ⚠️ ACEPTABLE: Filtros con campos únicos
device = nb.dcim.devices.get(serial='ABC123')
```

### 3. Operaciones en Lote

```python
# ❌ LENTO: Uno por uno
for ip in lista_ips:
    nb.ipam.ip_addresses.create(ip)

# ✅ RÁPIDO: Bulk
nb.ipam.ip_addresses.create(lista_ips)
```

### 4. Custom Fields son tus amigos

```python
# Guardar datos de Odoo en NetBox
device['custom_fields'] = {
    'odoo_id': 456,
    'costo': 15000,
    'centro_costo': 'TI-Infra'
}
```

---

## 📖 Lectura Complementaria

### Documentación Oficial
- **[NetBox Docs](https://docs.netbox.dev/)** - Documentación completa
- **[PyNetBox](https://pynetbox.readthedocs.io/)** - Client Python

### Comunidades
- **[NetBox Community](https://github.com/netbox-community/netbox/discussions)**
- **[NetBox Discord](https://discord.gg/netbox)**

### Ejemplos Prácticos
- **[GitHub: netbox-examples](https://github.com/netbox-community/netbox/discussions)**

---

> **"Las palabras son importantes. Cuando todos hablan el mismo idioma, la comunicación fluye y las soluciones nacen naturalmente."**