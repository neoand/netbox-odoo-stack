# Device Types: Guia Completo

> **"Device types são os tijolos do seu CMDB. A comunidade NetBox já construiu a parede para você."**

---

## 🎯 **O que são Device Types?**

Device Types são **templates** que definem as características de um modelo de equipamento:

```yaml
# Exemplo: Cisco Catalyst 2960X
manufacturer: Cisco
model: Catalyst 2960X-48FPS-L
part_number: WS-C2960X-48FPS-L
u_height: 1
is_full_depth: true
weight: 7.5
weight_unit: kg

# Interfaces
interface_templates:
  - name: "GigabitEthernet0/1"
    type: 1000base-t
    mgmt_only: false

# Portas de energia
power_ports:
  - name: "PSU1"
    type: iec-60320-c14
    maximum_wattage: 370
```

**Benefícios:**
- ✅ Reutilizável para múltiplos devices
- ✅ Define portas, energia, dimensões
- ✅ Inclui imagens front/rear
- ✅ Mantém consistência

---

## 📦 **Device Type Library**

### **Localização:** `/community/devicetype-library/`

### **Estrutura:**
```
devicetype-library/
├── device-types/
│   ├── Cisco/
│   │   ├── Catalyst-2960X-48FPS-L.yaml
│   │   ├── ISR-4331.yaml
│   │   └── ASA-5516-X.yaml
│   ├── Dell/
│   │   ├── PowerEdge-R740.yaml
│   │   └── PowerEdge-R650.yaml
│   ├── HPE/
│   │   ├── Aruba-2930F.yaml
│   │   └── ProLiant-DL380.yaml
│   └── ...
└── images/
    ├── Cisco/
    ├── Dell/
    └── HPE/
```

### **Como navegar:**
```bash
# Listar fabricantes disponíveis
ls community/devicetype-library/device-types/

# Ver quantos device types existem
find community/devicetype-library/device-types -name "*.yaml" | wc -l

# Buscar por fabricante
find community/devicetype-library/device-types -name "*Cisco*" | head -10

# Ver device type específico
cat community/devicetype-library/device-types/Dell/PowerEdge-R740.yaml
```

---

## 📖 **Formato YAML Explained**

### **Exemplo completo comentado:**

```yaml
# manufacturer: Nome do fabricante (deve existir em NetBox)
manufacturer: Dell

# model: Nome do modelo
model: PowerEdge R740

# part_number: Número do produto
part_number: R740

# slug: Identificador único (geralmente: fabricante-modelo em minúsculas)
slug: dell-poweredge-r740

# u_height: Altura em unidades U (1U = 4.445 cm)
u_height: 2

# is_full_depth: Se ocupa toda a profundidade do rack
is_full_depth: true

# weight: Peso
weight: 18.5
weight_unit: kg

# Is subdevice template: Se é um template para subdispositivos (ex: line cards)
is_subdevice_template: false

# Frente
front_image: dell-poweredge-r740-front.jpg

# Traseira
rear_image: dell-poweredge-r740-rear.jpg

# Subdispositivos (se aplicável)
subdevice_templates: []

# Modelos de interfaces
interface_templates:
  - name: "GigabitEthernet1/0/1"
    type: "1000base-t"
    mgmt_only: false

# Interfaces que podem ser expandidas (modular)
expansion_module_templates:
  - name: "Port Module"
    type: "8x1gbe"
    description: "8-port 1GbE module"

# Portas de energia
power_ports:
  - name: "PSU1"
    type: "iec-60320-c14"
    maximum_wattage: 495
    description: "Primary Power Supply"

# Portas de energia redundantes
power_outlets:
  - name: "PSU1 Outlet"
    type: "iec-60320-c13"
    connection_type: "pd"
    maximum_wattage: 495

# Consoles
console_ports:
  - name: "Console"
    type: "rj-45"
    speed: 9600

# Baias para storage
component_templates:
  - name: "Drive Bay 1"
    component_type: "dcim.incidental"
    data:
      position: 1
      size: 2.5
```

---

## 🚀 **Como Importar Device Types**

### **Método 1: Via Interface Web**

```bash
1. Acesse: NetBox → Devices → Device Types
2. Clique em "Add"
3. Selecione "Import from YAML"
4. Cole o conteúdo do YAML
5. Clique em "Save"
```

### **Método 2: Via API Python**

```python
import yaml
import pynetbox

# Conectar ao NetBox
nb = pynetbox.api('http://localhost:8080', token='SEU_TOKEN')

# Ler YAML
with open('device-types/Dell/PowerEdge-R740.yaml', 'r') as f:
    device_type_data = yaml.safe_load(f)

# Importar manufacturer se não existir
manufacturer = nb.dcim.manufacturers.get(slug='dell')
if not manufacturer:
    manufacturer = nb.dcim.manufacturers.create({
        'name': 'Dell',
        'slug': 'dell'
    })

# Criar device type
try:
    device_type = nb.dcim.device_types.create(device_type_data)
    print(f"✅ Device type criado: {device_type.model}")
except Exception as e:
    print(f"❌ Erro: {e}")
```

### **Método 3: Script de Importação em Lote**

```python
#!/usr/bin/env python3
import os
import yaml
import pynetbox
from pathlib import Path

# Configuração
NETBOX_URL = 'http://localhost:8080'
NETBOX_TOKEN = 'SEU_TOKEN'
DEVICE_TYPES_DIR = './community/devicetype-library/device-types'

# Conectar ao NetBox
nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)

def import_device_type(file_path):
    """Importa um device type a partir de arquivo YAML"""
    try:
        with open(file_path, 'r') as f:
            data = yaml.safe_load(f)

        # Criar manufacturer se necessário
        manufacturer = nb.dcim.manufacturers.get(slug=data['manufacturer'].lower())
        if not manufacturer:
            manufacturer = nb.dcim.manufacturers.create({
                'name': data['manufacturer'],
                'slug': data['manufacturer'].lower()
            })
            print(f"📦 Manufacturer criado: {data['manufacturer']}")

        # Criar device type
        dt = nb.dcim.device_types.create(data)
        print(f"✅ Importado: {dt.manufacturer} {dt.model}")
        return True

    except Exception as e:
        print(f"❌ Erro ao importar {file_path}: {e}")
        return False

def main():
    """Importa todos os device types"""
    device_types_dir = Path(DEVICE_TYPES_DIR)
    imported = 0
    failed = 0

    # Buscar todos os arquivos YAML
    yaml_files = list(device_types_dir.rglob('*.yaml'))

    print(f"🔍 Encontrados {len(yaml_files)} device types para importar")
    print("-" * 60)

    for yaml_file in yaml_files:
        if import_device_type(yaml_file):
            imported += 1
        else:
            failed += 1

    print("-" * 60)
    print(f"📊 Resumo:")
    print(f"   ✅ Importados: {imported}")
    print(f"   ❌ Falharam: {failed}")
    print(f"   📦 Total: {imported + failed}")

if __name__ == '__main__':
    main()
```

**Uso:**
```bash
# Executar script
python3 import-device-types.py

# Saída esperada:
# 🔍 Encontrados 523 device types para importar
# ------------------------------------------------------------
# 📦 Manufacturer criado: Cisco
# ✅ Importado: Cisco Catalyst 2960X-48FPS-L
# 📦 Manufacturer criado: Dell
# ✅ Importado: Dell PowerEdge R740
# ...
# ------------------------------------------------------------
# 📊 Resumo:
#    ✅ Importados: 510
#    ❌ Falharam: 13
#    📦 Total: 523
```

---

## 🖼️ **Gerenciando Imagens**

### **Estrutura de Imagens:**
```
community/devicetype-library/images/
├── Cisco/
│   ├── catalyst-2960x-48fps-l/
│   │   ├── front.jpg
│   │   └── rear.jpg
│   └── isr-4331/
│       └── front.jpg
├── Dell/
│   ├── poweredge-r740/
│   │   ├── front.jpg
│   │   └── rear.jpg
```

### **Como adicionar imagens:**

**Via Interface Web:**
```bash
1. Device Type → Edit
2. Em "Front Image": Upload da imagem frontal
3. Em "Rear Image": Upload da imagem trasera
4. Save
```

**Via API Python:**
```python
device_type = nb.dcim.device_types.get(slug='dell-poweredge-r740')

# Upload da imagem frontal
with open('images/dell-poweredge-r740-front.jpg', 'rb') as f:
    device_type.front_image = f
    device_type.save()
```

### **Boas práticas para imagens:**
```
✅ Resolução: 800x600 ou superior
✅ Formato: JPG ou PNG
✅ Tamanho: < 2MB por imagem
✅ Nomenclatura: fabricante-modelo-front.jpg
✅ Mostrar: Frente e trás do equipamento
```

---

## 🎨 **Criando Device Types Customizados**

### **Quando criar um device type customizado:**
- ✅ Novo modelo ainda não existe na biblioteca
- ✅ Necesita portas específicas
- ✅ Requer propriedades especiais
- ✅ Device com layout customizado

### **Exemplo: Criando device type para servidor customizado**

```yaml
# custom-server.yaml
manufacturer: "Supermicro"
model: "SYS-1029P-WTR"
part_number: "SYS-1029P-WTR"
slug: "supermicro-sys-1029p-wtr"
u_height: 1
is_full_depth: true
weight: 12.5
weight_unit: kg

# Interface de gerenciamento
interface_templates:
  - name: "ipmi0"
    type: "1000base-t"
    mgmt_only: true

# Interfaces de rede
  - name: "eth0"
    type: "1000base-t"
    mgmt_only: false

  - name: "eth1"
    type: "1000base-t"
    mgmt_only: false

# Baías para discos
component_templates:
  - name: "Drive Bay 1"
    component_type: "dcim.incidental"
    label: "Drive Bay 1"
    data:
      position: 1
      size: "2.5"

  - name: "Drive Bay 2"
    component_type: "dcim.incidental"
    label: "Drive Bay 2"
    data:
      position: 2
      size: "2.5"

# Continue para todas as 8 baías...

# Portas de energia redundantes
power_ports:
  - name: "PSU1"
    type: "iec-60320-c14"
    maximum_wattage: 650

  - name: "PSU2"
    type: "iec-60320-c14"
    maximum_wattage: 650
```

### **Validação do device type:**

```python
def validate_device_type(yaml_data):
    """Valida se o YAML do device type está correto"""
    required_fields = ['manufacturer', 'model', 'slug', 'u_height']
    missing = []

    for field in required_fields:
        if field not in yaml_data:
            missing.append(field)

    if missing:
        print(f"❌ Campos obrigatórios faltando: {missing}")
        return False

    # Validar manufacturer existe
    manufacturer = nb.dcim.manufacturers.get(slug=yaml_data['manufacturer'].lower())
    if not manufacturer:
        print(f"⚠️  Manufacturer '{yaml_data['manufacturer']}' não existe. Será criado.")

    # Validar portas
    if 'interface_templates' in yaml_data:
        for iface in yaml_data['interface_templates']:
            if 'name' not in iface:
                print("❌ Interface sem nome")
                return False

    print("✅ Device type válido")
    return True
```

---

## 📊 **Device Types Mais Utilizados**

### **Top 20 Device Types (por popularidade):**

| # | Fabricante | Modelo | Categoria | Devices |
|---|-----------|--------|-----------|---------|
| 1 | Cisco | Catalyst 2960X-48FPS-L | Switch | 1.2K |
| 2 | Dell | PowerEdge R740 | Servidor | 890 |
| 3 | Cisco | ISR 4331 | Router | 756 |
| 4 | HPE | Aruba 2930F-48G | Switch | 654 |
| 5 | Dell | PowerEdge R650 | Servidor | 543 |
| 6 | Cisco | ASA 5516-X | Firewall | 487 |
| 7 | Arista | DCS-7050X-48Y-8F | Switch | 432 |
| 8 | APC | AP8653 | PDU | 398 |
| 9 | Juniper | SRX340 | Firewall | 367 |
| 10 | Dell | EMC Unity XT 380 | Storage | 312 |

---

## 🛠️ **Scripts Úteis**

### **1. Verificar device types não utilizados**

```python
# find-unused-device-types.py
import pynetbox

nb = pynetbox.api('http://localhost:8080', token='TOKEN')

# Buscar todos os device types
all_device_types = list(nb.dcim.device_types.all())
device_types_in_use = set()

# Ver quais estão sendo usados
for device in nb.dcim.devices.all():
    if device.device_type:
        device_types_in_use.add(device.device_type.id)

# Encontrar os não utilizados
unused = [dt for dt in all_device_types if dt.id not in device_types_in_use]

print(f"Device types não utilizados ({len(unused)}):")
for dt in unused:
    print(f"  - {dt.manufacturer} {dt.model} (ID: {dt.id})")
```

### **2. Backup de device types**

```python
# backup-device-types.py
import yaml
import os
from datetime import datetime

nb = pynetbox.api('http://localhost:8080', token='TOKEN')

backup_dir = f"backup-device-types-{datetime.now().strftime('%Y%m%d')}"
os.makedirs(backup_dir, exist_ok=True)

for dt in nb.dcim.device_types.all():
    # Exportar como dict
    dt_dict = {
        'manufacturer': dt.manufacturer.name,
        'model': dt.model,
        'slug': dt.slug,
        'u_height': dt.u_height,
        'is_full_depth': dt.is_full_depth,
        'weight': dt.weight,
        'weight_unit': dt.weight_unit,
        'front_image': dt.front_image.name if dt.front_image else None,
        'rear_image': dt.rear_image.name if dt.rear_image else None,
    }

    # Salvar YAML
    filename = f"{backup_dir}/{dt.manufacturer.name}-{dt.model}.yaml".replace(' ', '_')
    with open(filename, 'w') as f:
        yaml.dump(dt_dict, f, default_flow_style=False)

print(f"✅ Backup salvo em: {backup_dir}/")
```

---

## 🔗 **Integração com neo_stack**

### **Device Types + neo_stack Framework:**

```python
# backend/app/services/device_type_service.py
from app.core.netbox_client import NetBoxClient

class DeviceTypeService:
    def __init__(self):
        self.nb = NetBoxClient()

    def get_device_type_catalog(self):
        """Retorna catálogo de device types disponíveis"""
        device_types = self.nb.device_types.all()

        catalog = []
        for dt in device_types:
            catalog.append({
                'id': dt.id,
                'manufacturer': dt.manufacturer.name,
                'model': dt.model,
                'slug': dt.slug,
                'u_height': dt.u_height,
                'is_full_depth': dt.is_full_depth,
                'image_url': dt.front_image.image.url if dt.front_image else None
            })

        return catalog

    def create_device_from_type(self, device_type_id, site_id, **kwargs):
        """Cria dispositivo baseado em device type"""
        device_type = self.nb.device_types.get(id=device_type_id)

        device_data = {
            'device_type': device_type.id,
            'device_role': kwargs.get('role_id'),
            'site': site_id,
            'name': kwargs.get('name'),
            'serial': kwargs.get('serial'),
            'asset_tag': kwargs.get('asset_tag'),
            'status': 'active'
        }

        if 'rack' in kwargs:
            device_data['rack'] = kwargs['rack']
        if 'position' in kwargs:
            device_data['position'] = kwargs['position']

        device = self.nb.devices.create(device_data)
        return device
```

---

## 📚 **Recursos Adicionais**

### **Documentação Oficial**
👉 **[NetBox Device Types](https://docs.netbox.dev/en/stable/models/dcim/devicetype/)**

👉 **[Device Type Library GitHub](https://github.com/netbox-community/devicetype-library)**

### **Vídeos Tutoriais**
- [NetBox Device Types Explained](https://youtube.com/watch?v=XXXXX)
- [Importing Device Types](https://youtube.com/watch?v=XXXXX)
- [Creating Custom Device Types](https://youtube.com/watch?v=XXXXX)

### **Comunidade**
👉 **[GitHub Discussions - Device Types](https://github.com/netbox-community/netbox/discussions/categories/device-types)**

---

## 🎯 **Próximos Passos**

### **Para continuar seu aprendizado:**

1. 👉 **[Instale Device Types](device-types/import-guide.md)** - Tutorial passo-a-passo

2. 👉 **[Aprenda sobre Plugins](plugins.md)** - Extenda funcionalidades

3. 👉 **[Crie Templates](templates.md)** - Automação de configurações

4. 👉 **[Veja Exemplos](examples.md)** - Casos reais de uso

---

> **"Device types são a base do seu CMDB. Invista tempo para organizá-los bem desde o início."**