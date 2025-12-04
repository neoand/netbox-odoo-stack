# Caso de Uso: Usando neo_stack para Aplicaciones NetBox + Odoo

> **"Crea aplicaciones web modernas que integran NetBox y Odoo usando el framework neo_stack"**

---

## 🎯 ¿Qué es neo_stack?

**Neo Stack** es un framework full-stack optimizado para desarrolladores Odoo:

### 🏗️ **Stack Tecnológica**
- **Frontend:** Nuxt.js 3 + Nuxt UI + TypeScript + PWA
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Optimizado para:** Cursor IDE (AI-First Development)

### ✅ **¿Por qué usar neo_stack?**

| Para Desarrolladores Odoo | Beneficio |
|---------------------------|-----------|
| **Mismo lenguaje** (Python) | Reutiliza tu conocimiento |
| **Misma base de datos** (PostgreSQL) | Integración nativa con Odoo |
| **Patrones similares** | Transición suave a Web |
| **PWA built-in** | Apps móviles sin configuración |

---

## 💡 Integración NetBox + Odoo con neo_stack

### Escenario
Crear una aplicación web que:
- Consulta NetBox para obtener datos de infraestructura
- Integra con Odoo para sincronizar inventario
- Muestra dashboard con datos unificados
- Permite operaciones vía interfaz web

---

## 💻 Implementación Práctica

### 1. Backend (FastAPI) - Conectando con NetBox

```python
# backend/app/services/netbox_service.py
import pynetbox
from typing import List, Dict, Optional
from app.config import settings

class NetBoxService:
    """Servicio para integrar con NetBox API"""

    def __init__(self):
        self.nb = pynetbox.api(
            settings.NETBOX_URL,
            token=settings.NETBOX_TOKEN
        )

    async def get_all_devices(self) -> List[Dict]:
        """Busca todos los dispositivos de NetBox"""
        devices = self.nb.dcim.devices.all()

        return [
            {
                'id': device.id,
                'name': device.name,
                'serial': device.serial,
                'asset_tag': device.asset_tag,
                'site': device.site.name if device.site else None,
                'rack': device.rack.name if device.rack else None,
                'position': device.position,
                'status': device.status.label if device.status else None,
                'device_type': device.device_type.model if device.device_type else None,
                'primary_ip': device.primary_ip.address if device.primary_ip else None
            }
            for device in devices
        ]

    async def get_device_by_id(self, device_id: int) -> Optional[Dict]:
        """Busca dispositivo específico por ID"""
        device = self.nb.dcim.devices.get(id=device_id)

        if not device:
            return None

        # Buscar interfaces del dispositivo
        interfaces = []
        for iface in device.interfaces.all():
            interfaces.append({
                'id': iface.id,
                'name': iface.name,
                'enabled': iface.enabled,
                'mac_address': iface.mac_address,
                'mtu': iface.mtu,
                'description': iface.description
            })

        # Buscar IPs del dispositivo
        ips = []
        for ip in self.nb.ipam.ip_addresses.filter(device_id=device_id):
            ips.append({
                'id': ip.id,
                'address': ip.address,
                'family': ip.family,
                'description': ip.description
            })

        return {
            'id': device.id,
            'name': device.name,
            'serial': device.serial,
            'asset_tag': device.asset_tag,
            'site': device.site.name if device.site else None,
            'rack': device.rack.name if device.rack else None,
            'position': device.position,
            'status': device.status.label if device.status else None,
            'device_type': device.device_type.model if device.device_type else None,
            'manufacturer': device.device_type.manufacturer.name if device.device_type and device.device_type.manufacturer else None,
            'primary_ip': device.primary_ip.address if device.primary_ip else None,
            'interfaces': interfaces,
            'ips': ips
        }

    async def get_site_devices(self, site_name: str) -> List[Dict]:
        """Busca todos los dispositivos de un sitio"""
        devices = self.nb.dcim.devices.filter(site__name=site_name)

        return [
            {
                'id': device.id,
                'name': device.name,
                'rack': device.rack.name if device.rack else None,
                'position': device.position,
                'status': device.status.label if device.status else None
            }
            for device in devices
        ]

    async def search_devices(self, query: str) -> List[Dict]:
        """Busca dispositivos por nombre o serial"""
        devices = self.nb.dcim.devices.filter(name__ic=query)

        return [
            {
                'id': device.id,
                'name': device.name,
                'serial': device.serial,
                'site': device.site.name if device.site else None,
                'rack': device.rack.name if device.rack else None
            }
            for device in devices
        ]
```

---

### 2. Backend - Integración con Odoo

```python
# backend/app/services/odoo_service.py
import xmlrpc.client as xc
from typing import List, Dict, Optional
from app.config import settings

class OdooService:
    """Servicio para integrar con API de Odoo"""

    def __init__(self):
        self.url = settings.ODOO_URL
        self.db = settings.ODOO_DATABASE
        self.username = settings.ODOO_USERNAME
        self.password = settings.ODOO_PASSWORD

        # Conectar a Odoo
        self.common = xc.ServerProxy(f'{self.url}/xmlrpc/2/common')
        self.uid = self.common.authenticate(self.db, self.username, self.password, {})

        if not self.uid:
            raise Exception("Falla en la autenticación con Odoo")

        self.models = xc.ServerProxy(f'{self.url}/xmlrpc/2/object')

    def get_product_by_asset_tag(self, asset_tag: str) -> Optional[Dict]:
        """Busca producto en Odoo por asset_tag"""
        product_id = self.models.execute_kw(
            self.db, self.uid, self.password,
            'product.product', 'search_read',
            [[['default_code', '=', asset_tag]]],
            {'fields': ['id', 'name', 'default_code', 'standard_price', 'categ_id', 'qty_available']}
        )

        if product_id:
            return {
                'id': product_id[0]['id'],
                'name': product_id[0]['name'],
                'default_code': product_id[0]['default_code'],
                'standard_price': product_id[0]['standard_price'],
                'category': product_id[0]['categ_id'][1] if product_id[0]['categ_id'] else None,
                'qty_available': product_id[0]['qty_available']
            }
        return None

    def create_product_from_device(self, device_data: Dict) -> int:
        """Crea producto en Odoo basado en el dispositivo NetBox"""
        product_data = {
            'name': device_data['name'],
            'default_code': device_data.get('asset_tag', f"NB-{device_data['id']}"),
            'type': 'product',
            'tracking': 'serial',
            'categ_id': [2, 'Hardware'],  # ID de la categoría
            'standard_price': 0,  # Precio a definir
            'description': f"Dispositivo NetBox: {device_data.get('device_type', '')}",
        }

        product_id = self.models.execute_kw(
            self.db, self.uid, self.password,
            'product.product', 'create',
            [product_data]
        )

        return product_id

    def update_product_info(self, product_id: int, device_data: Dict):
        """Actualiza información del producto con datos del dispositivo"""
        product_data = {
            'name': device_data['name'],
            'description': f"Dispositivo NetBox: {device_data.get('device_type', '')}\nSitio: {device_data.get('site', '')}\nRack: {device_data.get('rack', '')}"
        }

        self.models.execute_kw(
            self.db, self.uid, self.password,
            'product.product', 'write',
            [[product_id], product_data]
        )

    def get_stock_moves(self, product_id: int) -> List[Dict]:
        """Busca movimientos de inventario del producto"""
        moves = self.models.execute_kw(
            self.db, self.uid, self.password,
            'stock.move', 'search_read',
            [[['product_id', '=', product_id]]],
            {'fields': ['id', 'date', 'state', 'product_uom_qty', 'location_id', 'location_dest_id'], 'limit': 10}
        )

        return [
            {
                'id': move['id'],
                'date': move['date'],
                'state': move['state'],
                'quantity': move['product_uom_qty'],
                'location_from': move['location_id'][1] if move['location_id'] else None,
                'location_to': move['location_dest_id'][1] if move['location_dest_id'] else None
            }
            for move in moves
        ]
```

---

### 3. Backend - API Endpoints

```python
# backend/app/routes/devices.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.services.netbox_service import NetBoxService
from app.services.odoo_service import OdooService

router = APIRouter(prefix="/api/devices", tags=["devices"])

# Dependency injection
def get_netbox_service():
    return NetBoxService()

def get_odoo_service():
    return OdooService()

@router.get("/", response_model=List[dict])
async def list_devices(
    netbox: NetBoxService = Depends(get_netbox_service)
):
    """Lista todos los dispositivos"""
    try:
        devices = await netbox.get_all_devices()
        return devices
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{device_id}", response_model=dict)
async def get_device(
    device_id: int,
    netbox: NetBoxService = Depends(get_netbox_service)
):
    """Busca dispositivo específico"""
    device = await netbox.get_device_by_id(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")

    return device

@router.get("/search/{query}", response_model=List[dict])
async def search_devices(
    query: str,
    netbox: NetBoxService = Depends(get_netbox_service)
):
    """Busca dispositivos por query"""
    try:
        devices = await netbox.search_devices(query)
        return devices
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{device_id}/sync-to-odoo")
async def sync_device_to_odoo(
    device_id: int,
    netbox: NetBoxService = Depends(get_netbox_service),
    odoo: OdooService = Depends(get_odoo_service)
):
    """Sincroniza dispositivo NetBox con Odoo"""
    device = await netbox.get_device_by_id(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")

    try:
        # Si ya existe en Odoo, actualizar
        if device.get('asset_tag'):
            odoo_product = odoo.get_product_by_asset_tag(device['asset_tag'])
            if odoo_product:
                odoo.update_product_info(odoo_product['id'], device)
                return {"status": "updated", "product_id": odoo_product['id']}

        # Crear nuevo producto
        product_id = odoo.create_product_from_device(device)
        return {"status": "created", "product_id": product_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

### 4. Backend - Configuración Principal

```python
# backend/app/config.py
from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # NetBox
    NETBOX_URL: str
    NETBOX_TOKEN: str

    # Odoo
    ODOO_URL: str
    ODOO_DATABASE: str
    ODOO_USERNAME: str
    ODOO_PASSWORD: str

    # Database
    DATABASE_URL: str = "postgresql://user:pass@localhost/netbox_odoo_app"

    class Config:
        env_file = ".env"

settings = Settings()
```

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.devices import router as devices_router

app = FastAPI(
    title="NetBox + Odoo Integration",
    description="API para integrar NetBox con Odoo usando neo_stack",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(devices_router)

@app.get("/")
async def root():
    return {"message": "NetBox + Odoo API"}
```

---

### 5. Frontend - Página Principal (Nuxt.js)

```vue
<!-- frontend/pages/devices/index.vue -->
<template>
  <div class="devices-page">
    <div class="header">
      <div class="title-section">
        <h1>🔧 Dispositivos de Infraestructura</h1>
        <UButton
          icon="i-heroicons-arrow-path"
          @click="refreshDevices"
          :loading="pending"
        >
          Actualizar
        </UButton>
      </div>

      <div class="filters">
        <UInput
          v-model="searchQuery"
          placeholder="Buscar por nombre o serial..."
          icon="i-heroicons-magnifying-glass"
          @input="searchDevices"
        />
        <USelect
          v-model="selectedSite"
          :options="siteOptions"
          placeholder="Filtrar por sitio"
          @change="filterBySite"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
      <p>Cargando dispositivos...</p>
    </div>

    <!-- Lista de dispositivos -->
    <div v-else class="devices-grid">
      <UCard
        v-for="device in devices"
        :key="device.id"
        class="device-card"
        @click="goToDevice(device.id)"
      >
        <div class="device-header">
          <h3>{{ device.name }}</h3>
          <UBadge :label="device.status" :color="getStatusColor(device.status)" />
        </div>

        <div class="device-info">
          <div class="info-item">
            <UIcon name="i-heroicons-building-office" />
            <span>{{ device.site }}</span>
          </div>
          <div class="info-item">
            <UIcon name="i-heroicons-cube" />
            <span>{{ device.device_type }}</span>
          </div>
          <div class="info-item">
            <UIcon name="i-heroicons-hashtag" />
            <span>S/N: {{ device.serial || 'N/A' }}</span>
          </div>
          <div v-if="device.rack" class="info-item">
            <UIcon name="i-heroicons-squares-2x2" />
            <span>{{ device.rack }} - U{{ device.position }}</span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Device } from '~/types/device'

// State
const searchQuery = ref('')
const selectedSite = ref('')
const devices = ref<Device[]>([])
const pending = ref(true)

// Computed
const siteOptions = computed(() => {
  const sites = [...new Set(devices.value.map(d => d.site))]
  return sites.filter(Boolean).map(site => ({ label: site, value: site }))
})

// Methods
const fetchDevices = async () => {
  pending.value = true
  try {
    const { data } = await useFetch<Device[]>('/api/devices')
    devices.value = data.value || []
  } catch (error) {
    console.error('Error al buscar dispositivos:', error)
  } finally {
    pending.value = false
  }
}

const refreshDevices = () => {
  fetchDevices()
}

const searchDevices = () => {
  // Implementar búsqueda en tiempo real
  if (searchQuery.value.length > 2) {
    // Hacer request para /api/devices/search/{query}
  }
}

const filterBySite = () => {
  // Filtrar por sitio
}

const goToDevice = (deviceId: number) => {
  navigateTo(`/devices/${deviceId}`)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Active': 'green',
    'Planned': 'blue',
    'Staged': 'yellow',
    'Retired': 'red'
  }
  return colors[status] || 'gray'
}

// Lifecycle
onMounted(() => {
  fetchDevices()
})
</script>

<style scoped>
.devices-page {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.device-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.device-card:hover {
  transform: translateY(-2px);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.device-header h3 {
  margin: 0;
  font-size: 1.2em;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}
</style>
```

---

### 6. Frontend - Detalle del Dispositivo

```vue
<!-- frontend/pages/devices/[id].vue -->
<template>
  <div class="device-detail">
    <div class="header">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        @click="goBack"
      >
        Volver
      </UButton>
      <UButton
        icon="i-heroicons-arrow-right-left-on-rectangle"
        @click="syncToOdoo"
      >
        Sincronizar con Odoo
      </UButton>
    </div>

    <div v-if="pending" class="loading">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
      <p>Cargando dispositivo...</p>
    </div>

    <div v-else-if="device" class="content">
      <!-- Información general -->
      <UCard>
        <template #header>
          <div class="device-title">
            <h1>{{ device.name }}</h1>
            <UBadge :label="device.status" :color="getStatusColor(device.status)" />
          </div>
        </template>

        <div class="device-grid">
          <div class="info-section">
            <h3>📋 Información General</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="label">Serial:</span>
                <span class="value">{{ device.serial || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Asset Tag:</span>
                <span class="value">{{ device.asset_tag || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Tipo:</span>
                <span class="value">{{ device.device_type }}</span>
              </div>
              <div class="info-row">
                <span class="label">Fabricante:</span>
                <span class="value">{{ device.manufacturer || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">IP Primario:</span>
                <span class="value">{{ device.primary_ip || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>📍 Ubicación</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="label">Sitio:</span>
                <span class="value">{{ device.site }}</span>
              </div>
              <div class="info-row">
                <span class="label">Rack:</span>
                <span class="value">{{ device.rack }}</span>
              </div>
              <div class="info-row">
                <span class="label">Posición:</span>
                <span class="value">U{{ device.position }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Interfaces -->
      <UCard class="mt-4">
        <template #header>
          <h3>🔌 Interfaces</h3>
        </template>

        <UTable :rows="device.interfaces" :columns="interfaceColumns">
          <template #enabled-data="{ row }">
            <UBadge :label="row.enabled ? 'Activa' : 'Inactiva'" :color="row.enabled ? 'green' : 'red'" />
          </template>
        </UTable>
      </UCard>

      <!-- IPs -->
      <UCard class="mt-4">
        <template #header>
          <h3>🌐 Direcciones IP</h3>
        </template>

        <UTable :rows="device.ips" :columns="ipColumns" />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Device } from '~/types/device'

const route = useRoute()
const deviceId = route.params.id

const { data: device, pending } = await useFetch<Device>(`/api/devices/${deviceId}`)

const interfaceColumns = [
  { key: 'name', label: 'Nombre' },
  { key: 'enabled', label: 'Estado' },
  { key: 'mac_address', label: 'Dirección MAC' },
  { key: 'mtu', label: 'MTU' },
  { key: 'description', label: 'Descripción' }
]

const ipColumns = [
  { key: 'address', label: 'Dirección' },
  { key: 'family', label: 'Familia' },
  { key: 'description', label: 'Descripción' }
]

const syncToOdoo = async () => {
  try {
    await $fetch(`/api/devices/${deviceId}/sync-to-odoo`, { method: 'POST' })
    useToast().add({
      title: 'Éxito',
      description: 'Dispositivo sincronizado con Odoo',
      color: 'green'
    })
  } catch (error) {
    useToast().add({
      title: 'Error',
      description: 'Falla al sincronizar con Odoo',
      color: 'red'
    })
  }
}

const goBack = () => {
  navigateTo('/devices')
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Active': 'green',
    'Planned': 'blue',
    'Staged': 'yellow',
    'Retired': 'red'
  }
  return colors[status] || 'gray'
}
</script>

<style scoped>
.device-detail {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-row .label {
  font-weight: 600;
  color: #666;
}

.info-row .value {
  color: #333;
}
</style>
```

---

### 7. Frontend - Types

```typescript
// frontend/types/device.ts
export interface Device {
  id: number
  name: string
  serial?: string
  asset_tag?: string
  site?: string
  rack?: string
  position?: number
  status?: string
  device_type?: string
  manufacturer?: string
  primary_ip?: string
  interfaces: NetworkInterface[]
  ips: IPAddress[]
}

export interface NetworkInterface {
  id: number
  name: string
  enabled: boolean
  mac_address?: string
  mtu?: number
  description?: string
}

export interface IPAddress {
  id: number
  address: string
  family: number
  description?: string
}
```

---

### 8. Setup y Configuración

```bash
# 1. Clona el repositorio
git clone https://github.com/neoand/neo_stack.git
cd neo_stack

# 2. Instalar frontend
cd frontend
pnpm install

# 3. Instalar backend
cd ../backend
poetry install

# 4. Configurar variables de entorno
cd backend
cp .env.example .env
# Editar .env con tus configuraciones:
# NETBOX_URL=http://your-netbox.com
# NETBOX_TOKEN=your-netbox-token
# ODOO_URL=http://your-odoo.com:8069
# ODOO_DATABASE=your-db
# ODOO_USERNAME=admin
# ODOO_PASSWORD=your-password

# 5. Configurar base de datos PostgreSQL
createdb netbox_odoo_app

# 6. Ejecutar migraciones
poetry run alembic upgrade head

# 7. Ejecutar en desarrollo
# Terminal 1 - Frontend
cd frontend
pnpm dev

# Terminal 2 - Backend
cd backend
poetry run uvicorn app.main:app --reload
```

---

## 📊 Métricas de Éxito

### Beneficios de la Integración

| Métrica | Antes | Con neo_stack + NetBox + Odoo |
|---------|-------|--------------------------------|
| **Tiempo para consultar dispositivo** | 5-10 min (manual) | 2 seg (web) |
| **Sincronización inventario** | Manual (1 día/semana) | Automática (tiempo real) |
| **Visibilidad** | Hojas de cálculo dispersas | Dashboard unificado |
| **Acceso móvil** | No disponible | PWA nativo |
| **Desarrollo** | Partiendo de cero | Framework listo |

### ROI para Desarrolladores

```
Escenario: Desarrollador Odoo creando app NetBox + Odoo

Sin neo_stack:
- Setup backend: 2-3 días
- Setup frontend: 3-4 días
- Configuración build: 1 día
- Total: 1-2 semanas

Con neo_stack:
- Setup backend: 2 horas
- Setup frontend: 2 horas
- Configuración build: 30 min
- Total: ~5 horas

Ahorro: 90% del tiempo
Enfoque: 95% en lógica de negocio (vs configuración)
```

---

## 🔗 Próximos Pasos

👉 **[Gestión de IPs](./gerenciamento-ips.md)** - Ejemplo práctico con neo_stack

👉 **[PWA para Equipo de Campo](../historias/pwas-campo.md)** - Apps móviles con Nuxt.js

👉 **[Guía de APIs](../dev/api-guide.md)** - Integración NetBox

---

## 📚 Recursos

- **[neo_stack Repository](https://github.com/neoand/neo_stack)** - Framework completo
- **[Nuxt.js Documentation](https://nuxt.com)** - Framework frontend
- **[FastAPI Documentation](https://fastapi.tiangolo.com)** - Framework backend
- **[NetBox API Guide](../dev/api-guide.md)** - Documentación de APIs

---

> **"El neo_stack permite que desarrolladores Odoo creen aplicaciones web modernas en horas, no semanas."**