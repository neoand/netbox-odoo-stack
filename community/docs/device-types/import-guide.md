# Guia de Instalação: Device Types

> **"Este guia te leva do zero à importação completa de device types em 30 minutos."**

---

## 🎯 **Objetivo**

Ao final desta seção, você terá:
- ✅ Device Type Library clonada
- ✅ Device types importados no NetBox
- ✅ Imagens configuradas
- ✅ Primeiros dispositivos criados

---

## 📋 **Pré-requisitos**

### **1. NetBox Funcional**
```bash
# Verificar se NetBox está rodando
curl -I http://localhost:8080
# Deve retornar: HTTP/1.1 200 OK
```

### **2. Token de API**
```bash
# Acesse: NetBox → Admin → Tokens → Add
# Crie um token com permissões de leitura/escrita
# Anote o token: 0123456789abcdef...
```

### **3. Python + PyNetBox**
```bash
# Instalar PyNetBox
pip install pynetbox

# Verificar instalação
python3 -c "import pynetbox; print('✅ PyNetBox instalado')"
```

---

## 🚀 **Passo 1: Clonar Device Type Library**

### **Download Manual:**
```bash
# Clone o repositório
cd /opt
sudo git clone https://github.com/netbox-community/devicetype-library.git

# Verificar conteúdo
sudo ls -la devicetype-library/device-types/
```

### **OU via este projeto:**
```bash
# Os device types já estão em:
community/devicetype-library/

# Verificar
ls community/devicetype-library/device-types/ | head -20
```

---

## 🔍 **Passo 2: Explorar Device Types**

### **Listar Fabricantes:**
```bash
# Ver fabricantes disponíveis
ls community/devicetype-library/device-types/

# Saída esperada:
# APC/
# Arista/
# Cisco/
# Dell/
# F5/
# HPE/
# IBM/
# Juniper/
# ...
```

### **Ver um Device Type:**
```bash
# Ver exemplo: Dell PowerEdge R740
cat community/devicetype-library/device-types/Dell/PowerEdge-R740.yaml

# Ver Cisco Catalyst 2960X
cat community/devicetype-library/device-types/Cisco/Catalyst-2960X-48FPS-L.yaml
```

### **Contar Device Types:**
```bash
# Contar total
find community/devicetype-library/device-types -name "*.yaml" | wc -l

# Contar por fabricante
for mfr in community/devicetype-library/device-types/*; do
  count=$(find "$mfr" -name "*.yaml" | wc -l)
  echo "$(basename "$mfr"): $count device types"
done
```

---

## ⚙️ **Passo 3: Importar Device Types**

### **Método 1: Script Python**

#### **Criar o script:**
```python
#!/usr/bin/env python3
# import-device-types.py

import os
import sys
import yaml
import pynetbox
from pathlib import Path

# ==================== CONFIGURAÇÃO ====================
NETBOX_URL = 'http://localhost:8080'
NETBOX_TOKEN = 'SEU_TOKEN_AQUI'  # SUBSTITUA pelo seu token
DEVICE_TYPES_DIR = './community/devicetype-library/device-types'

# =====================================================

print("="*70)
print("🚀 NETBOX DEVICE TYPE IMPORTER")
print("="*70)
print(f"URL: {NETBOX_URL}")
print(f"Diretório: {DEVICE_TYPES_DIR}")
print()

# Conectar ao NetBox
try:
    nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)
    print("✅ Conectado ao NetBox")
except Exception as e:
    print(f"❌ Erro ao conectar: {e}")
    sys.exit(1)

def import_device_type(file_path):
    """Importa um device type a partir de arquivo YAML"""
    try:
        # Ler YAML
        with open(file_path, 'r') as f:
            data = yaml.safe_load(f)

        # Validar dados
        required_fields = ['manufacturer', 'model', 'slug']
        for field in required_fields:
            if field not in data:
                return False, f"Campo obrigatório '{field}' faltando"

        # Verificar se já existe
        existing = nb.dcim.device_types.get(slug=data['slug'])
        if existing:
            return False, f"Device type '{data['slug']}' já existe"

        # Criar manufacturer se não existir
        manufacturer = nb.dcim.manufacturers.get(slug=data['manufacturer'].lower())
        if not manufacturer:
            manufacturer = nb.dcim.manufacturers.create({
                'name': data['manufacturer'],
                'slug': data['manufacturer'].lower()
            })
            print(f"  📦 Manufacturer criado: {data['manufacturer']}")

        # Definir data para criação
        create_data = {
            'manufacturer': manufacturer.id,
            'model': data['model'],
            'slug': data['slug'],
            'u_height': data.get('u_height', 1),
            'is_full_depth': data.get('is_full_depth', True),
        }

        # Adicionar campos opcionais se existirem
        if 'weight' in data:
            create_data['weight'] = data['weight']
        if 'weight_unit' in data:
            create_data['weight_unit'] = data['weight_unit']

        # Criar device type
        dt = nb.dcim.device_types.create(create_data)

        return True, f"✅ {dt.manufacturer.name} {dt.model}"

    except Exception as e:
        return False, f"❌ Erro: {e}"

def main():
    """Função principal"""
    device_types_dir = Path(DEVICE_TYPES_DIR)

    if not device_types_dir.exists():
        print(f"❌ Diretório não encontrado: {DEVICE_TYPES_DIR}")
        return

    # Buscar todos os arquivos YAML
    yaml_files = list(device_types_dir.rglob('*.yaml'))

    if len(yaml_files) == 0:
        print(f"❌ Nenhum arquivo YAML encontrado em {DEVICE_TYPES_DIR}")
        return

    print(f"🔍 Encontrados {len(yaml_files)} device types para importar")
    print("-"*70)

    imported = 0
    failed = 0
    skipped = 0

    for yaml_file in yaml_files:
        # Progress bar
        progress = (imported + failed + skipped + 1) / len(yaml_files) * 100
        print(f"\r[{progress:5.1f}%] Importando: {yaml_file.name}", end='', flush=True)

        # Importar
        success, message = import_device_type(yaml_file)

        if success:
            imported += 1
            if imported % 10 == 0:  # Mostrar a cada 10
                print()  # Nova linha
                print(message)
        elif 'já existe' in message:
            skipped += 1
        else:
            failed += 1
            print()  # Nova linha
            print(f"  {message}")

    print("\n" + "="*70)
    print("📊 RESUMO DA IMPORTAÇÃO:")
    print("="*70)
    print(f"  ✅ Importados: {imported}")
    print(f"  ⚠️  Pulados (já existem): {skipped}")
    print(f"  ❌ Falharam: {failed}")
    print(f"  📦 Total encontrado: {len(yaml_files)}")
    print()
    print("🎉 Importação concluída!")

if __name__ == '__main__':
    main()
```

#### **Executar o script:**
```bash
# Tornar executável
chmod +x import-device-types.py

# Executar
python3 import-device-types.py

# Saída esperada:
# ===============================================================
# 🚀 NETBOX DEVICE TYPE IMPORTER
# ===============================================================
# URL: http://localhost:8080
# Diretório: ./community/devicetype-library/device-types
#
# ✅ Conectado ao NetBox
# 🔍 Encontrados 523 device types para importar
# ---------------------------------------------------------------
# [  1.0%] Importando: PowerEdge-R740.yaml
#   📦 Manufacturer criado: Dell
#   ✅ Dell PowerEdge R740
# [  2.0%] Importando: Catalyst-2960X-48FPS-L.yaml
#   📦 Manufacturer criado: Cisco
#   ✅ Cisco Catalyst 2960X-48FPS-L
# ...
# ===============================================================
# 📊 RESUMO DA IMPORTAÇÃO:
# ===============================================================
#   ✅ Importados: 512
#   ⚠️  Pulados (já existem): 0
#   ❌ Falharam: 11
#   📦 Total encontrado: 523
#
# 🎉 Importação concluída!
```

### **Método 2: Via Interface Web**

```bash
1. Acesse: NetBox → Devices → Device Types
2. Clique em "Add"
3. Selecione "Import from YAML"
4. Cole o conteúdo do YAML (exemplo abaixo)
5. Clique em "Save"

Exemplo de YAML:
---
manufacturer: Dell
model: PowerEdge R740
slug: dell-poweredge-r740
u_height: 2
is_full_depth: true
weight: 18.5
weight_unit: kg
interface_templates:
  - name: "GigabitEthernet1/0/1"
    type: "1000base-t"
    mgmt_only: false
power_ports:
  - name: "PSU1"
    type: "iec-60320-c14"
    maximum_wattage: 495
```

### **Método 3: Importação Selectiva**

```python
#!/usr/bin/env python3
"""
Importar apenas device types específicos
"""

# Lista de device types importantes
IMPORTANT_DEVICE_TYPES = [
    'Cisco/Catalyst-2960X-48FPS-L.yaml',
    'Cisco/ISR-4331.yaml',
    'Dell/PowerEdge-R740.yaml',
    'HPE/Aruba-2930F-48G.yaml',
    'APC/AP8653.yaml',
]

for dt_file in IMPORTANT_DEVICE_TYPES:
    file_path = f'community/devicetype-library/device-types/{dt_file}'

    print(f"Importando: {dt_file}")
    success, message = import_device_type(file_path)

    if success:
        print(f"  ✅ {message}")
    else:
        print(f"  ❌ {message}")
```

---

## 🖼️ **Passo 4: Configurar Imagens**

### **Upload Manual:**
```bash
1. Device Type → Edit
2. Front Image: Upload da imagem frontal
3. Rear Image: Upload da imagen trasera
4. Save
```

### **Upload Automático:**
```python
#!/usr/bin/env python3
# upload-images.py

import os
from pathlib import Path

def upload_device_type_images():
    """Faz upload de imagens para device types"""
    images_dir = Path('./community/devicetype-library/images')

    # Listar todas as imagens
    image_files = list(images_dir.rglob('*.jpg'))
    image_files.extend(list(images_dir.rglob('*.png')))

    print(f"🔍 Encontradas {len(image_files)} imagens")

    for image_file in image_files:
        # Determinar device type slug a partir do nome da imagem
        image_name = image_file.stem  # Sem extensão
        slug = image_name.replace('-front', '').replace('-rear', '')

        # Buscar device type
        device_type = nb.dcim.device_types.get(slug=slug)

        if device_type:
            # Determinar se é front ou rear
            if 'front' in image_name:
                with open(image_file, 'rb') as f:
                    device_type.front_image = f
                    device_type.save()
                print(f"  ✅ Front image: {image_name}")
            elif 'rear' in image_name:
                with open(image_file, 'rb') as f:
                    device_type.rear_image = f
                    device_type.save()
                print(f"  ✅ Rear image: {image_name}")

upload_device_type_images()
```

---

## ✅ **Passo 5: Verificar Importação**

### **Via Interface Web:**
```bash
1. Acesse: NetBox → Devices → Device Types
2. Verificar lista de device types importados
3. Clicar em um device type para ver detalhes
4. Verificar se imagens aparecem
```

### **Via Python:**
```python
# Listar device types importados
device_types = nb.dcim.device_types.all()

print(f"📦 Total de Device Types: {len(device_types)}")
print()

# Agrupar por fabricante
from collections import defaultdict

by_manufacturer = defaultdict(list)

for dt in device_types:
    by_manufacturer[dt.manufacturer.name].append(dt)

# Mostrar estatísticas
for mfr, dt_list in sorted(by_manufacturer.items()):
    print(f"  {mfr}: {len(dt_list)} device types")

# Verificar device types sem imagem
no_image = [dt for dt in device_types if not dt.front_image]
print(f"\n⚠️  Device types sem imagem frontal: {len(no_image)}")
```

---

## 🛠️ **Passo 6: Criar Primeiros Dispositivos**

### **Exemplo Prático:**
```python
#!/usr/bin/env python3
# create-sample-devices.py

# Criar alguns dispositivos de exemplo

# 1. Switch Core
switch_core = nb.dcim.devices.create(
    name='switch-core-01',
    device_type=nb.dcim.device_types.get(slug='cisco-catalyst-2960x-48fps-l').id,
    device_role=nb.dcim.device_roles.get(slug='core-switch').id,
    site=nb.dcim.sites.get(slug='datacenter-1').id,
    rack=nb.dcim.racks.get(name='Rack-01').id,
    position=20,
    status='active',
    serial='ABC123DEF456',
    asset_tag='SW-CORE-001'
)

# 2. Servidor
server = nb.dcim.devices.create(
    name='server-web-01',
    device_type=nb.dcim.device_types.get(slug='dell-poweredge-r740').id,
    device_role=nb.dcim.device_roles.get(slug='server').id,
    site=nb.dcim.sites.get(slug='datacenter-1').id,
    rack=nb.dcim.racks.get(name='Rack-01').id,
    position=10,
    status='active',
    serial='XYZ789ABC123',
    asset_tag='SRV-WEB-001'
)

print("✅ Dispositivos de exemplo criados:")
print(f"  - {switch_core.name}")
print(f"  - {server.name}")
```

---

## 📊 **Troubleshooting**

### **Erro: "Manufacturer does not exist"**
```python
# Solução: Criar manufacturer primeiro
manufacturer = nb.dcim.manufacturers.create({
    'name': 'Fabricante',
    'slug': 'fabricante'
})
```

### **Erro: "Device type already exists"**
```python
# Verificar se já existe
existing = nb.dcim.device_types.get(slug='dell-poweredge-r740')
if existing:
    print("⚠️  Device type já existe")
```

### **Erro: "Permission denied"**
```python
# Verificar token
print(f"Token: {NETBOX_TOKEN[:10]}...")
# Token deve ter permissões de escrita
```

### **Importação Lenta**
```python
# Otimizar: Importar em paralelo
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=5) as executor:
    executor.map(import_device_type, yaml_files)
```

---

## 🎯 **Próximos Passos**

### **Depois de importar device types:**

1. 👉 **[Aprenda sobre Plugins](plugins.md)** - Extenda funcionalidades
2. 👉 **[Configure Documentos](plugins/documents-setup.md)** - Anexe documentação
3. 👉 **[Crie Templates](templates.md)** - Automatize configurações
4. 👉 **[Veja Exemplos](examples.md)** - Casos reais

---

## 📚 **Recursos**

### **Documentação:**
👉 **[Device Type Library GitHub](https://github.com/netbox-community/devicetype-library)**

👉 **[NetBox Device Types Docs](https://docs.netbox.dev/en/stable/models/dcim/devicetype/)**

### **Comunidade:**
👉 **[GitHub Discussions](https://github.com/netbox-community/netbox/discussions)**

---

> **"Device types são a base. Importe uma vez, use para sempre!"**