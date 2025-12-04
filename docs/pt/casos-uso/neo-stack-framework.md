# Caso de Uso: Usando neo_stack para Aplicações NetBox + Odoo

> **"Crie aplicações web modernas que integram NetBox e Odoo usando o framework neo_stack"**

---

## 🎯 O que é o neo_stack?

**Neo Stack** é um framework full-stack otimizado para desenvolvedores Odoo:

### 🏗️ **Stack Tecnológica**
- **Frontend:** Nuxt.js 3 + Nuxt UI + TypeScript + PWA
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Otimizado para:** Cursor IDE (AI-First Development)

### ✅ **Por que usar neo_stack?**

| Para Desenvolvedores Odoo | Benefício |
|---------------------------|-----------|
| **Mesma linguagem** (Python) | Reutilize seu conhecimento |
| **Mesmo banco** (PostgreSQL) | Integração nativa com Odoo |
| **Padrões similares** | Transição suave para Web |
| **PWA built-in** | Apps mobile sem configuração |

---

## 💡 Integração NetBox + Odoo com neo_stack

### Cenário
Criar uma aplicação web que:
- Consulta NetBox para obter dados de infraestrutura
- Integra com Odoo para sincronizar inventário
- Exibe dashboard com dados unificados
- Permite operações via interface web

---

## 💻 Implementação Prática

### 1. Backend (FastAPI) - Conectando com NetBox

```python
# backend/app/services/netbox_service.py
import pynetbox
from typing import List, Dict, Optional
from app.config import settings

class NetBoxService:
    """Serviço para integrar com NetBox API"""

    def __init__(self):
        self.nb = pynetbox.api(
            settings.NETBOX_URL,
            token=settings.NETBOX_TOKEN
        )

    async def get_all_devices(self) -> List[Dict]:
        """Busca todos os dispositivos do NetBox"""
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
        """Busca device específico pelo ID"""
        device = self.nb.dcim.devices.get(id=device_id)

        if not device:
            return None

        # Buscar interfaces do device
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

        # Buscar IPs do device
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
        """Busca todos os devices de um site"""
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
        """Busca devices por nome ou serial"""
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

### 2. Backend - Integração com Odoo

```python
# backend/app/services/odoo_service.py
import xmlrpc.client as xc
from typing import List, Dict, Optional
from app.config import settings

class OdooService:
    """Serviço para integrar com Odoo API"""

    def __init__(self):
        self.url = settings.ODOO_URL
        self.db = settings.ODOO_DATABASE
        self.username = settings.ODOO_USERNAME
        self.password = settings.ODOO_PASSWORD

        # Conectar ao Odoo
        self.common = xc.ServerProxy(f'{self.url}/xmlrpc/2/common')
        self.uid = self.common.authenticate(self.db, self.username, self.password, {})

        if not self.uid:
            raise Exception("Falha na autenticação com Odoo")

        self.models = xc.ServerProxy(f'{self.url}/xmlrpc/2/object')

    def get_product_by_asset_tag(self, asset_tag: str) -> Optional[Dict]:
        """Busca produto no Odoo pelo asset_tag"""
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
        """Cria produto no Odoo baseado no device NetBox"""
        product_data = {
            'name': device_data['name'],
            'default_code': device_data.get('asset_tag', f"NB-{device_data['id']}"),
            'type': 'product',
            'tracking': 'serial',
            'categ_id': [2, 'Hardware'],  # ID da categoria
            'standard_price': 0,  # Preço a ser definido
            'description': f"Device NetBox: {device_data.get('device_type', '')}",
        }

        product_id = self.models.execute_kw(
            self.db, self.uid, self.password,
            'product.product', 'create',
            [product_data]
        )

        return product_id

    def update_product_info(self, product_id: int, device_data: Dict):
        """Atualiza informações do produto com dados do device"""
        product_data = {
            'name': device_data['name'],
            'description': f"Device NetBox: {device_data.get('device_type', '')}\\nSite: {device_data.get('site', '')}\\nRack: {device_data.get('rack', '')}"
        }

        self.models.execute_kw(
            self.db, self.uid, self.password,
            'product.product', 'write',
            [[product_id], product_data]
        )

    def get_stock_moves(self, product_id: int) -> List[Dict]:
        """Busca movimentações de estoque do produto"""
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
    """Lista todos os dispositivos"""
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
        raise HTTPException(status_code=404, detail="Device não encontrado")

    return device

@router.get("/site/{site_name}", response_model=List[dict])
async def get_site_devices(
    site_name: str,
    netbox: NetBoxService = Depends(get_netbox_service)
):
    """Lista dispositivos de um site"""
    devices = await netbox.get_site_devices(site_name)
    return devices

@router.get("/search/{query}", response_model=List[dict])
async def search_devices(
    query: str,
    netbox: NetBoxService = Depends(get_netbox_service)
):
    """Busca dispositivos"""
    devices = await netbox.search_devices(query)
    return devices

@router.post("/{device_id}/sync-to-odoo")
async def sync_device_to_odoo(
    device_id: int,
    netbox: NetBoxService = Depends(get_netbox_service),
    odoo: OdooService = Depends(get_odoo_service)
):
    """Sincroniza device NetBox com Odoo"""
    device = await netbox.get_device_by_id(device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device não encontrado")

    # Verificar se já existe no Odoo
    odoo_product = odoo.get_product_by_asset_tag(device['asset_tag'])

    if odoo_product:
        # Atualizar produto existente
        odoo.update_product_info(odoo_product['id'], device)
        return {
            "message": "Produto atualizado no Odoo",
            "product_id": odoo_product['id']
        }
    else:
        # Criar novo produto
        product_id = odoo.create_product_from_device(device)
        return {
            "message": "Produto criado no Odoo",
            "product_id": product_id
        }
```

---

### 4. Backend - Configuração

```python
# backend/app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

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
    DATABASE_URL: str

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

---

### 5. Frontend (Nuxt.js) - Dashboard de Dispositivos

```vue
<!-- frontend/pages/devices/index.vue -->
<template>
  <div class="devices-page">
    <div class="header">
      <h1>📱 Dispositivos NetBox</h1>
      <UButton @click="refreshDevices" icon="i-heroicons-arrow-path">
        Atualizar
      </UButton>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <UInput
        v-model="searchQuery"
        placeholder="Buscar por nome ou serial..."
        icon="i-heroicons-magnifying-glass"
        @input="searchDevices"
      />
      <USelect
        v-model="selectedSite"
        :options="siteOptions"
        placeholder="Filtrar por site"
        @change="filterBySite"
      />
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
      <p>Carregando dispositivos...</p>
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
    console.error('Erro ao buscar dispositivos:', error)
  } finally {
    pending.value = false
  }
}

const refreshDevices = () => {
  fetchDevices()
}

const searchDevices = () => {
  // Implementar busca em tempo real
  if (searchQuery.value.length > 2) {
    // Fazer request para /api/devices/search/{query}
  }
}

const filterBySite = () => {
  // Filtrar por site
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  padding: 40px;
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

.device-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

### 6. Frontend - Página de Detalhe do Dispositivo

```vue
<!-- frontend/pages/devices/[id].vue -->
<template>
  <div class="device-detail">
    <div class="header">
      <UButton @click="goBack" icon="i-heroicons-arrow-left">
        Voltar
      </UButton>
      <UButton @click="syncToOdoo" color="green" icon="i-heroicons-arrow-path">
        Sincronizar com Odoo
      </UButton>
    </div>

    <div v-if="pending" class="loading">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
    </div>

    <div v-else-if="device" class="content">
      <UCard>
        <template #header>
          <div class="device-title">
            <h1>{{ device.name }}</h1>
            <UBadge :label="device.status" :color="getStatusColor(device.status)" />
          </div>
        </template>

        <div class="device-grid">
          <div class="info-section">
            <h3>📋 Informações Gerais</h3>
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
                <span class="label">IP Primário:</span>
                <span class="value">{{ device.primary_ip || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>📍 Localização</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="label">Site:</span>
                <span class="value">{{ device.site }}</span>
              </div>
              <div class="info-row">
                <span class="label">Rack:</span>
                <span class="value">{{ device.rack }}</span>
              </div>
              <div class="info-row">
                <span class="label">Posição:</span>
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
            <UBadge :label="row.enabled ? 'Ativa' : 'Inativa'" :color="row.enabled ? 'green' : 'red'" />
          </template>
        </UTable>
      </UCard>

      <!-- IPs -->
      <UCard class="mt-4">
        <template #header>
          <h3>🌐 Endereços IP</h3>
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
  { key: 'name', label: 'Nome' },
  { key: 'enabled', label: 'Status' },
  { key: 'mac_address', label: 'MAC Address' },
  { key: 'mtu', label: 'MTU' },
  { key: 'description', label: 'Descrição' }
]

const ipColumns = [
  { key: 'address', label: 'Endereço' },
  { key: 'family', label: 'Família' },
  { key: 'description', label: 'Descrição' }
]

const syncToOdoo = async () => {
  try {
    await $fetch(`/api/devices/${deviceId}/sync-to-odoo`, { method: 'POST' })
    useToast().add({
      title: 'Sucesso',
      description: 'Dispositivo sincronizado com Odoo',
      color: 'green'
    })
  } catch (error) {
    useToast().add({
      title: 'Erro',
      description: 'Falha ao sincronizar com Odoo',
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

### 8. Setup e Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/neoand/neo_stack.git
cd neo_stack

# 2. Instalar frontend
cd frontend
pnpm install

# 3. Instalar backend
cd ../backend
poetry install

# 4. Configurar variáveis de ambiente
cd backend
cp .env.example .env
# Editar .env com suas configurações:
# NETBOX_URL=http://your-netbox.com
# NETBOX_TOKEN=your-netbox-token
# ODOO_URL=http://your-odoo.com:8069
# ODOO_DATABASE=your-db
# ODOO_USERNAME=admin
# ODOO_PASSWORD=your-password

# 5. Configurar banco PostgreSQL
createdb netbox_odoo_app

# 6. Rodar migrações
poetry run alembic upgrade head

# 7. Executar em desenvolvimento
# Terminal 1 - Frontend
cd frontend
pnpm dev

# Terminal 2 - Backend
cd backend
poetry run uvicorn app.main:app --reload
```

---

## 📊 Métricas de Sucesso

### Benefícios da Integração

| Métrica | Antes | Com neo_stack + NetBox + Odoo |
|---------|-------|--------------------------------|
| **Tempo para consultar device** | 5-10 min (manual) | 2 seg (web) |
| **Sincronização inventário** | Manual (1 dia/semana) | Automática (real-time) |
| **Visibilidade** | Planilhas分散 | Dashboard unificado |
| **Mobile access** | Não disponível | PWA nativo |
| **Desenvolvimento** | Partindo do zero | Framework pronto |

### ROI para Desenvolvedores

```
Cenário: Desenvolvedor Odoo criando app NetBox + Odoo

Sem neo_stack:
- Setup backend: 2-3 dias
- Setup frontend: 3-4 dias
- Configuração build: 1 dia
- Total: 1-2 semanas

Com neo_stack:
- Setup backend: 2 horas
- Setup frontend: 2 horas
- Configuração build: 30 min
- Total: ~5 horas

Economia: 90% do tempo
Foco: 95% em lógica de negócio (vs configuração)
```

---

## 🔗 Próximos Passos

👉 **[Gerenciamento de IPs](./gerenciamento-ips.md)** - Exemplo prático com neo_stack

👉 **[PWA para Time de Campo](../historias/pwas-campo.md)** - Apps mobile com Nuxt.js

👉 **[Guia de APIs](../dev/api-guide.md)** - Integração NetBox

---

## 📚 Recursos

- **[neo_stack Repository](https://github.com/neoand/neo_stack)** - Framework completo
- **[Nuxt.js Documentation](https://nuxt.com)** - Framework frontend
- **[FastAPI Documentation](https://fastapi.tiangolo.com)** - Framework backend
- **[NetBox API Guide](../dev/api-guide.md)** - Documentação de APIs

---

> **"O neo_stack permite que desenvolvedores Odoo criem aplicações web modernas em horas, não semanas."**