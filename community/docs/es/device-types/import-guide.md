# Guía de Instalación: Device Types

> **"Esta guía te lleva del cero a la importación completa de device types en 30 minutos."**

---

## 🎯 **Objetivo**

Al final de esta sección tendrás:
- ✅ Device Type Library clonada
- ✅ Device types importados en NetBox
- ✅ Imágenes configuradas
- ✅ Primeros dispositivos creados

---

## 📋 **Pre-requisitos**

### **1. NetBox Funcional**
```bash
# Verificar si NetBox está corriendo
curl -I http://localhost:8080
# Debe retornar: HTTP/1.1 200 OK
```

### **2. Token de API**
```bash
# Acceder a: NetBox → Admin → Tokens → Add
# Crear un token con permisos de lectura/escritura
# Anotar el token: 0123456789abcdef...
```

### **3. Python + PyNetBox**
```bash
# Instalar PyNetBox
pip install pynetbox

# Verificar instalación
python3 -c "import pynetbox; print('✅ PyNetBox instalado')"
```

---

## 🚀 **Paso 1: Clonar Device Type Library**

### **Descarga Manual:**
```bash
# Clonar el repositorio
cd /opt
sudo git clone https://github.com/netbox-community/devicetype-library.git

# Verificar contenido
sudo ls -la devicetype-library/device-types/
```

### **O vía este proyecto:**
```bash
# Los device types ya están en:
community/devicetype-library/

# Verificar
ls community/devicetype-library/device-types/ | head -20
```

---

## 🔍 **Paso 2: Explorar Device Types**

### **Listar Fabricantes:**
```bash
# Ver fabricantes disponibles
ls community/devicetype-library/device-types/

# Salida esperada:
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

### **Ver un Device Type:**
```bash
# Ver ejemplo: Dell PowerEdge R740
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

## ⚙️ **Paso 3: Importar Device Types**

### **Método 1: Script Python**

#### **Crear el script:**
```python
#!/usr/bin/env python3
# import-device-types.py

import os
import sys
import yaml
import pynetbox
from pathlib import Path

# ==================== CONFIGURACIÓN ====================
NETBOX_URL = 'http://localhost:8080'
NETBOX_TOKEN = 'TU_TOKEN_AQUI'  # SUSTITUIR por tu token
DEVICE_TYPES_DIR = './community/devicetype-library/device-types'

# =====================================================

print("="*70)
print("🚀 NETBOX DEVICE TYPE IMPORTER")
print("="*70)
print(f"URL: {NETBOX_URL}")
print(f"Directorio: {DEVICE_TYPES_DIR}")
print()

# Conectar a NetBox
try:
    nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)
    print("✅ Conectado a NetBox")
except Exception as e:
    print(f"❌ Error al conectar: {e}")
    sys.exit(1)

def import_device_type(file_path):
    """Importa un device type a partir de archivo YAML"""
    try:
        # Leer YAML
        with open(file_path, 'r') as f:
            data = yaml.safe_load(f)

        # Validar datos
        required_fields = ['manufacturer', 'model', 'slug']
        for field in required_fields:
            if field not in data:
                return False, f"Campo obligatorio '{field}' faltando"

        # Verificar si ya existe
        existing = nb.dcim.device_types.get(slug=data['slug'])
        if existing:
            return False, f"Device type '{data['slug']}' ya existe"

        # Crear manufacturer si no existe
        manufacturer = nb.dcim.manufacturers.get(slug=data['manufacturer'].lower())
        if not manufacturer:
            manufacturer = nb.dcim.manufacturers.create({
                'name': data['manufacturer'],
                'slug': data['manufacturer'].lower()
            })
            print(f"  📦 Manufacturer creado: {data['manufacturer']}")

        # Definir data para creación
        create_data = {
            'manufacturer': manufacturer.id,
            'model': data['model'],
            'slug': data['slug'],
            'u_height': data.get('u_height', 1),
            'is_full_depth': data.get('is_full_depth', True),
        }

        # Añadir campos opcionales si existen
        if 'weight' in data:
            create_data['weight'] = data['weight']
        if 'weight_unit' in data:
            create_data['weight_unit'] = data['weight_unit']

        # Crear device type
        dt = nb.dcim.device_types.create(create_data)

        return True, f"✅ {dt.manufacturer.name} {dt.model}"

    except Exception as e:
        return False, f"❌ Error: {e}"

def main():
    """Función principal"""
    device_types_dir = Path(DEVICE_TYPES_DIR)

    if not device_types_dir.exists():
        print(f"❌ Directorio no encontrado: {DEVICE_TYPES_DIR}")
        return

    # Buscar todos los archivos YAML
    yaml_files = list(device_types_dir.rglob('*.yaml'))

    if len(yaml_files) == 0:
        print(f"❌ Ningún archivo YAML encontrado en {DEVICE_TYPES_DIR}")
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
            if imported % 10 == 0:  # Mostrar cada 10
                print()  # Nueva línea
                print(message)
        elif 'ya existe' in message:
            skipped += 1
        else:
            failed += 1
            print()  # Nueva línea
            print(f"  {message}")

    print("\n" + "="*70)
    print("📊 RESUMEN DE LA IMPORTACIÓN:")
    print("="*70)
    print(f"  ✅ Importados: {imported}")
    print(f"  ⚠️  Omitidos (ya existen): {skipped}")
    print(f"  ❌ Fallaron: {failed}")
    print(f"  📦 Total encontrado: {len(yaml_files)}")
    print()
    print("🎉 ¡Importación completada!")

if __name__ == '__main__':
    main()
```

#### **Ejecutar el script:**
```bash
# Hacer ejecutable
chmod +x import-device-types.py

# Ejecutar
python3 import-device-types.py

# Salida esperada:
# ===============================================================
# 🚀 NETBOX DEVICE TYPE IMPORTER
# ===============================================================
# URL: http://localhost:8080
# Directorio: ./community/devicetype-library/device-types
#
# ✅ Conectado a NetBox
# 🔍 Encontrados 523 device types para importar
# ---------------------------------------------------------------
# [  1.0%] Importando: PowerEdge-R740.yaml
#   📦 Manufacturer creado: Dell
#   ✅ Dell PowerEdge R740
# [  2.0%] Importando: Catalyst-2960X-48FPS-L.yaml
#   📦 Manufacturer creado: Cisco
#   ✅ Cisco Catalyst 2960X-48FPS-L
# ...
# ===============================================================
# 📊 RESUMEN DE LA IMPORTACIÓN:
# ===============================================================
#   ✅ Importados: 512
#   ⚠️  Omitidos (ya existen): 0
#   ❌ Fallaron: 11
#   📦 Total encontrado: 523
#
# 🎉 ¡Importación completada!
```

### **Método 2: Vía Interfaz Web**

```bash
1. Acceder a: NetBox → Devices → Device Types
2. Hacer clic en "Add"
3. Seleccionar "Import from YAML"
4. Copiar el contenido del YAML (ejemplo abajo)
5. Hacer clic en "Save"

Ejemplo de YAML:
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

### **Método 3: Importación Selectiva**

```python
#!/usr/bin/env python3
"""
Importar solo device types específicos
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

## 🖼️ **Paso 4: Configurar Imágenes**

### **Upload Manual:**
```bash
1. Device Type → Edit
2. Front Image: Upload de la imagen frontal
3. Rear Image: Upload de la imagen trasera
4. Save
```

### **Upload Automático:**
```python
#!/usr/bin/env python3
# upload-images.py

import os
from pathlib import Path

def upload_device_type_images():
    """Hace upload de imágenes para device types"""
    images_dir = Path('./community/devicetype-library/images')

    # Listar todas las imágenes
    image_files = list(images_dir.rglob('*.jpg'))
    image_files.extend(list(images_dir.rglob('*.png')))

    print(f"🔍 Encontradas {len(image_files)} imágenes")

    for image_file in image_files:
        # Determinar device type slug a partir del nombre de la imagen
        image_name = image_file.stem  # Sin extensión
        slug = image_name.replace('-front', '').replace('-rear', '')

        # Buscar device type
        device_type = nb.dcim.device_types.get(slug=slug)

        if device_type:
            # Determinar si es front o rear
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

## ✅ **Paso 5: Verificar Importación**

### **Vía Interfaz Web:**
```bash
1. Acceder a: NetBox → Devices → Device Types
2. Verificar lista de device types importados
3. Hacer clic en un device type para ver detalles
4. Verificar si aparecen imágenes
```

### **Vía Python:**
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

# Mostrar estadísticas
for mfr, dt_list in sorted(by_manufacturer.items()):
    print(f"  {mfr}: {len(dt_list)} device types")

# Verificar device types sin imagen
no_image = [dt for dt in device_types if not dt.front_image]
print(f"\n⚠️  Device types sin imagen frontal: {len(no_image)}")
```

---

## 🛠️ **Paso 6: Crear Primeros Dispositivos**

### **Ejemplo Práctico:**
```python
#!/usr/bin/env python3
# create-sample-devices.py

# Crear algunos dispositivos de ejemplo

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

print("✅ Dispositivos de ejemplo creados:")
print(f"  - {switch_core.name}")
print(f"  - {server.name}")
```

---

## 📊 **Troubleshooting**

### **Error: "Manufacturer does not exist"**
```python
# Solución: Crear manufacturer primero
manufacturer = nb.dcim.manufacturers.create({
    'name': 'Fabricante',
    'slug': 'fabricante'
})
```

### **Error: "Device type already exists"**
```python
# Verificar si ya existe
existing = nb.dcim.device_types.get(slug='dell-poweredge-r740')
if existing:
    print("⚠️  Device type ya existe")
```

### **Error: "Permission denied"**
```python
# Verificar token
print(f"Token: {NETBOX_TOKEN[:10]}...")
# Token debe tener permisos de escritura
```

### **Importación Lenta**
```python
# Optimizar: Importar en paralelo
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=5) as executor:
    executor.map(import_device_type, yaml_files)
```

---

## 🎯 **Próximos Pasos**

### **Después de importar device types:**

1. 👉 **[Aprender sobre Plugins](plugins.md)** - Extender funcionalidades
2. 👉 **[Configurar Documentos](plugins/documents-setup.md)** - Adjuntar documentación
3. 👉 **[Crear Templates](templates.md)** - Automatizar configuraciones
4. 👉 **[Ver Ejemplos](examples.md)** - Casos reales

---

## 📚 **Recursos**

### **Documentación:**
👉 **[Device Type Library GitHub](https://github.com/netbox-community/devicetype-library)**

👉 **[NetBox Device Types Docs](https://docs.netbox.dev/en/stable/models/dcim/devicetype/)**

### **Comunidad:**
👉 **[GitHub Discussions](https://github.com/netbox-community/netbox/discussions)**

---

> **"Device types son la base. ¡Importa una vez, usa para siempre!"**
