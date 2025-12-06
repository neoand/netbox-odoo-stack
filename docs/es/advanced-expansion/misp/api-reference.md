# Referencia de API de MISP

## Introducción

MISP proporciona una API REST completa y una biblioteca Python oficial (**PyMISP**) para automatizar todas las operaciones. Esta guía cubre los aspectos más importantes de la API para desarrolladores y administradores.

!!! info "Recursos Oficiales"
    - **Documentación API**: `https://your-misp.com/servers/openapi`
    - **PyMISP GitHub**: https://github.com/MISP/PyMISP
    - **PyMISP Docs**: https://pymisp.readthedocs.io/

## Autenticación

### API Key

Todas las requests a la API de MISP requieren autenticación mediante **Authorization Header**.

#### Obtener API Key

1. **Login** a MISP
2. **My Profile** (esquina superior derecha)
3. **Auth Keys** → **Add Authentication Key**
4. **Copiar** la key generada

#### Usar API Key

=== "PyMISP"
    ```python
    from pymisp import PyMISP

    misp_url = 'https://misp.tu-empresa.com'
    misp_key = 'YOUR_API_KEY_HERE'
    misp_verifycert = True

    misp = PyMISP(misp_url, misp_key, misp_verifycert)
    ```

=== "cURL"
    ```bash
    curl -X GET \
      -H "Authorization: YOUR_API_KEY_HERE" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      https://misp.tu-empresa.com/events/index
    ```

=== "Python Requests"
    ```python
    import requests

    headers = {
        'Authorization': 'YOUR_API_KEY_HERE',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    response = requests.get(
        'https://misp.tu-empresa.com/events/index',
        headers=headers,
        verify=True
    )
    ```

### Permisos de API Key

Las API Keys heredan permisos del usuario:

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total |
| **Org Admin** | Gestión de su organización |
| **User** | Crear/editar events de su org |
| **Read Only** | Solo lectura |
| **Sync User** | Sincronización entre instancias |

## PyMISP: Biblioteca Python Oficial

### Instalación

```bash
# Instalación básica
pip install pymisp

# Con dependencias opcionales
pip install pymisp[fileobjects,openioc,virustotal,pdfexport]

# Verificar instalación
python -c "from pymisp import PyMISP; print(PyMISP.__version__)"
```

### Inicialización

```python
from pymisp import PyMISP, MISPEvent, MISPAttribute, MISPObject
import urllib3

# Deshabilitar warnings SSL (solo para testing)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuración
MISP_URL = 'https://misp.tu-empresa.com'
MISP_KEY = 'YOUR_API_KEY'
MISP_VERIFYCERT = True  # False para self-signed certs

# Conectar
misp = PyMISP(MISP_URL, MISP_KEY, MISP_VERIFYCERT)

# Test de conexión
try:
    version = misp.get_version()
    print(f"✅ Conectado a MISP {version['version']}")
except Exception as e:
    print(f"❌ Error de conexión: {e}")
```

## Events (Eventos)

### Crear Event

```python
from pymisp import MISPEvent
from datetime import date

# Crear event
event = MISPEvent()
event.info = 'Malware Campaign - Emotet December 2024'
event.distribution = 1  # This community only
event.threat_level_id = 1  # High
event.analysis = 1  # Ongoing
event.date = date.today()

# Tags
event.add_tag('tlp:amber')
event.add_tag('malware:emotet')

# Agregar a MISP
result = misp.add_event(event, pythonify=True)
print(f"Event creado con ID: {result.id}")
```

### Obtener Event

```python
# Por ID
event = misp.get_event(123, pythonify=True)
print(f"Event: {event.info}")
print(f"Attributes: {len(event.attributes)}")

# Con metadata adicional
event = misp.get_event(123, pythonify=True, metadata=True)
print(f"Organización: {event.Org.name}")
print(f"Publicado: {event.published}")
```

### Actualizar Event

```python
# Obtener event
event = misp.get_event(123, pythonify=True)

# Modificar
event.info = 'Malware Campaign - Emotet December 2024 - UPDATED'
event.threat_level_id = 2  # Medium (downgrade)

# Agregar nuevo attribute
event.add_attribute('domain', 'new-malicious-domain.com', to_ids=True)

# Actualizar en MISP
result = misp.update_event(event)
print(f"Event actualizado: {result['Event']['id']}")
```

### Eliminar Event

```python
# Eliminar event (soft delete)
misp.delete_event(123)

# Hard delete (permanente, solo admin)
misp.delete_event(123, hard=True)
```

### Publicar Event

```python
# Publicar event (hace visible según distribución)
misp.publish(123)

# Despublicar
misp.unpublish(123)
```

### Buscar Events

```python
# Búsqueda simple
events = misp.search(
    eventinfo='ransomware',
    published=True,
    pythonify=True
)

# Búsqueda avanzada
events = misp.search(
    controller='events',
    date_from='2024-12-01',
    date_to='2024-12-31',
    org='My Organisation',
    tags=['tlp:amber', 'malware'],
    published=True,
    metadata=False,
    pythonify=True
)

for event in events:
    print(f"{event.id}: {event.info}")
```

### Parámetros de Búsqueda

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `eventid` | int | ID del event | `123` |
| `eventinfo` | str | Buscar en info field | `"ransomware"` |
| `org` | str | Organización | `"My Org"` |
| `tags` | list | Tags | `['tlp:white', 'apt']` |
| `date_from` | str | Fecha desde | `'2024-01-01'` |
| `date_to` | str | Fecha hasta | `'2024-12-31'` |
| `published` | bool | Solo publicados | `True` |
| `threat_level_id` | int | Nivel de amenaza | `1` (High) |
| `analysis` | int | Estado de análisis | `2` (Completed) |

## Attributes (Atributos)

### Agregar Attribute a Event

```python
# Método 1: Directo en event
event = misp.get_event(123, pythonify=True)
attr = event.add_attribute('ip-dst', '192.0.2.100', to_ids=True, comment='C2 server')
misp.update_event(event)

# Método 2: Mediante MISPAttribute
from pymisp import MISPAttribute

attr = MISPAttribute()
attr.type = 'domain'
attr.category = 'Network activity'
attr.value = 'malicious-domain.com'
attr.to_ids = True
attr.comment = 'Phishing domain'
attr.distribution = 5  # Inherit event

event.add_attribute(**attr)
misp.update_event(event)

# Método 3: API directa
attribute = {
    'type': 'sha256',
    'category': 'Payload delivery',
    'value': 'abc123...',
    'to_ids': True,
    'comment': 'Malware hash'
}
misp.add_attribute(123, attribute)
```

### Obtener Attributes

```python
# Todos los attributes de un event
event = misp.get_event(123, pythonify=True)
for attr in event.attributes:
    print(f"{attr.type}: {attr.value}")

# Buscar attributes específicos
attributes = misp.search(
    controller='attributes',
    type_attribute=['ip-dst', 'domain'],
    to_ids=1,
    date_from='2024-12-01',
    published=True,
    pythonify=True
)

for attr in attributes:
    print(f"{attr.value} (Event: {attr.Event.info})")
```

### Actualizar Attribute

```python
# Obtener attribute
attr = misp.get_attribute(456, pythonify=True)

# Modificar
attr.comment = 'Updated comment'
attr.to_ids = False  # Deshabilitar IDS flag

# Actualizar
misp.update_attribute(attr)
```

### Eliminar Attribute

```python
# Soft delete
misp.delete_attribute(456)

# Hard delete
misp.delete_attribute(456, hard=True)
```

## Objects (Objetos)

### Agregar Object a Event

```python
from pymisp import MISPObject

# Crear event
event = misp.get_event(123, pythonify=True)

# Object: file
file_obj = MISPObject('file')
file_obj.add_attribute('filename', value='malware.exe')
file_obj.add_attribute('md5', value='5d41402abc4b2a76b9719d911017c592')
file_obj.add_attribute('sha1', value='aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
file_obj.add_attribute('sha256', value='2c26b46b68ffc68ff99b453c1d30413413422d706480b8ad529accb91a67e80e')
file_obj.add_attribute('size-in-bytes', value=1024000)

# Agregar al event
event.add_object(file_obj)
misp.update_event(event)
```

### Templates de Objects Disponibles

```python
# Listar templates
templates = misp.get_object_templates_list()
for template in templates:
    print(f"- {template['ObjectTemplate']['name']}: {template['ObjectTemplate']['description']}")

# Obtener template específico
template = misp.get_object_template('file')
print(f"Attributes: {template['ObjectTemplate']['attributes']}")
```

### Objects Comunes

=== "file"
    ```python
    file_obj = MISPObject('file')
    file_obj.add_attribute('filename', value='document.pdf')
    file_obj.add_attribute('md5', value='...')
    file_obj.add_attribute('sha256', value='...')
    file_obj.add_attribute('size-in-bytes', value=245760)
    file_obj.add_attribute('mime-type', value='application/pdf')
    ```

=== "email"
    ```python
    email_obj = MISPObject('email')
    email_obj.add_attribute('from', value='attacker@evil.com')
    email_obj.add_attribute('to', value='victim@company.com')
    email_obj.add_attribute('subject', value='Urgent Action Required')
    email_obj.add_attribute('email-body', value='...')
    email_obj.add_attribute('attachment', value='invoice.zip')
    ```

=== "network-connection"
    ```python
    netconn_obj = MISPObject('network-connection')
    netconn_obj.add_attribute('ip-src', value='10.0.0.50')
    netconn_obj.add_attribute('ip-dst', value='192.0.2.100')
    netconn_obj.add_attribute('src-port', value=49152)
    netconn_obj.add_attribute('dst-port', value=443)
    netconn_obj.add_attribute('protocol', value='tcp')
    ```

=== "url"
    ```python
    url_obj = MISPObject('url')
    url_obj.add_attribute('url', value='http://malicious.com/payload.exe')
    url_obj.add_attribute('domain', value='malicious.com')
    url_obj.add_attribute('ip', value='192.0.2.100')
    url_obj.add_attribute('first-seen', value='2024-12-05T10:30:00Z')
    ```

### Relaciones entre Objects

```python
# Object 1: URL
url_obj = MISPObject('url')
url_obj.add_attribute('url', value='http://evil.com/malware.exe')

# Object 2: File descargado
file_obj = MISPObject('file')
file_obj.add_attribute('filename', value='malware.exe')
file_obj.add_attribute('sha256', value='...')

# Crear relación: File fue downloaded-from URL
file_obj.add_reference(url_obj.uuid, 'downloaded-from')

# Agregar ambos al event
event.add_object(url_obj)
event.add_object(file_obj)
misp.update_event(event)
```

## Tags y Taxonomías

### Agregar Tags

```python
# Al event
event = misp.get_event(123, pythonify=True)
event.add_tag('tlp:amber')
event.add_tag('malware:emotet')
misp.update_event(event)

# A attribute
attr = misp.get_attribute(456, pythonify=True)
attr.add_tag('osint')
misp.update_attribute(attr)
```

### Remover Tags

```python
# Del event
event.delete_tag('tlp:amber')
misp.update_event(event)

# Del attribute
attr.delete_tag('osint')
misp.update_attribute(attr)
```

### Listar Taxonomías

```python
# Todas las taxonomías
taxonomies = misp.taxonomies()
for tax in taxonomies:
    print(f"- {tax['Taxonomy']['namespace']}: {tax['Taxonomy']['description']}")

# Taxonomía específica
tlp = misp.get_taxonomy('tlp')
print(f"Tags TLP: {[p['value'] for p in tlp['Taxonomy']['predicates']]}")
```

### Habilitar Taxonomías

```python
# Habilitar taxonomía
misp.enable_taxonomy(1)  # TLP

# Deshabilitar
misp.disable_taxonomy(1)
```

## Galaxies y MITRE ATT&CK

### Agregar Galaxy Cluster

```python
event = misp.get_event(123, pythonify=True)

# Agregar técnica MITRE ATT&CK
event.add_galaxy_cluster({
    'collection_uuid': 'attack-pattern',
    'value': 'Phishing: Spearphishing Attachment - T1566.001'
})

# Agregar threat actor
event.add_galaxy_cluster({
    'collection_uuid': 'threat-actor',
    'value': 'APT28'
})

misp.update_event(event)
```

### Buscar en Galaxies

```python
# Listar galaxies
galaxies = misp.galaxies()
for galaxy in galaxies:
    print(f"- {galaxy['Galaxy']['name']}: {galaxy['Galaxy']['description']}")

# Obtener galaxy específica
mitre = misp.get_galaxy('mitre-attack-pattern')
print(f"Clusters MITRE ATT&CK: {len(mitre['Galaxy']['GalaxyCluster'])}")

# Buscar técnica específica
for cluster in mitre['Galaxy']['GalaxyCluster']:
    if 'T1566.001' in cluster['value']:
        print(f"Encontrado: {cluster['value']} - {cluster['description']}")
```

## Sightings (Confirmaciones)

### Agregar Sighting

```python
import time

# Sighting: IOC observado
sighting = {
    'type': '0',  # 0=Sighting, 1=False positive, 2=Expiration
    'source': 'SOC Team - Firewall Logs',
    'timestamp': int(time.time())
}
misp.add_sighting(sighting, 456)  # attribute_id

# Con más detalles
sighting_detailed = {
    'type': '0',
    'source': 'Wazuh SIEM',
    'timestamp': int(time.time()),
    'count': 5,  # Visto 5 veces
    'organisation_name': 'My Organisation'
}
misp.add_sighting(sighting_detailed, 456)
```

### Obtener Sightings

```python
# Sightings de un attribute
sightings = misp.sightings(456)
for sighting in sightings:
    print(f"Tipo: {sighting['Sighting']['type']}")
    print(f"Fuente: {sighting['Sighting']['source']}")
    print(f"Timestamp: {sighting['Sighting']['date_sighting']}")
```

## Exportación de Datos

### Formatos de Exportación

=== "JSON"
    ```python
    # Event completo
    event = misp.get_event(123, pythonify=True)
    json_export = event.to_json()

    with open('event_123.json', 'w') as f:
        f.write(json_export)
    ```

=== "STIX 2.1"
    ```python
    # Exportar a STIX
    stix_export = misp.search(
        eventid=123,
        return_format='stix2',
        with_attachments=False
    )

    with open('event_123.stix2.json', 'w') as f:
        f.write(stix_export)
    ```

=== "CSV"
    ```python
    # Exportar attributes a CSV
    csv_export = misp.search(
        eventid=123,
        return_format='csv',
        published=True
    )

    with open('event_123.csv', 'w') as f:
        f.write(csv_export)
    ```

=== "OpenIOC"
    ```python
    # Exportar a OpenIOC
    ioc_export = misp.search(
        eventid=123,
        return_format='openioc'
    )

    with open('event_123.ioc', 'w') as f:
        f.write(ioc_export)
    ```

### Exportar IOCs para Otros Sistemas

```python
#!/usr/bin/env python3
# Exportar IOCs a diferentes formatos

def export_to_wazuh_cdb(event_id):
    """Exportar IOCs a formato Wazuh CDB"""
    attributes = misp.search(
        eventid=event_id,
        type_attribute=['ip-dst', 'domain'],
        to_ids=1,
        pythonify=True
    )

    cdb_lines = []
    for attr in attributes:
        # Formato: valor:descripción
        value = attr.value
        description = f"MISP Event {event_id} - {attr.comment or 'IOC'}"
        cdb_lines.append(f"{value}:{description}")

    return '\n'.join(cdb_lines)

def export_to_snort_rules(event_id):
    """Exportar IOCs a reglas Snort"""
    attributes = misp.search(
        eventid=event_id,
        type_attribute=['ip-dst'],
        to_ids=1,
        pythonify=True
    )

    rules = []
    for i, attr in enumerate(attributes, start=1):
        rule = f'alert ip any any -> {attr.value} any (msg:"MISP IOC: {attr.comment}"; sid:100{event_id}{i:03d}; rev:1;)'
        rules.append(rule)

    return '\n'.join(rules)

# Uso
cdb = export_to_wazuh_cdb(123)
print(cdb)
```

## Bulk Operations (Operaciones Masivas)

### Crear Múltiples Events

```python
#!/usr/bin/env python3
# Crear múltiples events desde archivo

import json

def bulk_create_events(events_file):
    """Crear events desde archivo JSON"""

    with open(events_file, 'r') as f:
        events_data = json.load(f)

    results = []
    for event_data in events_data:
        event = MISPEvent()
        event.info = event_data['info']
        event.distribution = event_data['distribution']
        event.threat_level_id = event_data['threat_level_id']

        # Agregar attributes
        for attr in event_data['attributes']:
            event.add_attribute(
                attr['type'],
                attr['value'],
                to_ids=attr.get('to_ids', False),
                comment=attr.get('comment', '')
            )

        # Crear event
        result = misp.add_event(event, pythonify=True)
        results.append(result.id)
        print(f"✅ Event creado: {result.id}")

    return results

# Archivo de ejemplo: events.json
'''
[
  {
    "info": "Phishing Campaign 1",
    "distribution": 1,
    "threat_level_id": 2,
    "attributes": [
      {"type": "domain", "value": "phishing1.com", "to_ids": true}
    ]
  },
  {
    "info": "Phishing Campaign 2",
    "distribution": 1,
    "threat_level_id": 2,
    "attributes": [
      {"type": "domain", "value": "phishing2.com", "to_ids": true}
    ]
  }
]
'''

# Ejecutar
event_ids = bulk_create_events('events.json')
print(f"Total events creados: {len(event_ids)}")
```

### Actualizar Múltiples Events

```python
def bulk_update_tags(event_ids, tags_to_add):
    """Agregar tags a múltiples events"""

    for event_id in event_ids:
        event = misp.get_event(event_id, pythonify=True)

        for tag in tags_to_add:
            event.add_tag(tag)

        misp.update_event(event)
        print(f"✅ Tags agregados a event {event_id}")

# Uso
event_ids = [123, 124, 125, 126]
tags = ['campaign:phishing-q4-2024', 'tlp:amber']
bulk_update_tags(event_ids, tags)
```

### Eliminar Múltiples Events

```python
def bulk_delete_events(event_ids, hard=False):
    """Eliminar múltiples events"""

    for event_id in event_ids:
        try:
            misp.delete_event(event_id, hard=hard)
            print(f"✅ Event {event_id} eliminado")
        except Exception as e:
            print(f"❌ Error eliminando event {event_id}: {e}")

# Uso (CUIDADO!)
old_event_ids = [100, 101, 102]
bulk_delete_events(old_event_ids, hard=False)
```

## Queries Avanzadas

### Búsqueda Compleja

```python
# Query compleja con múltiples filtros
results = misp.search(
    controller='events',

    # Filtros temporales
    date_from='2024-12-01',
    date_to='2024-12-31',
    timestamp='30d',  # Últimos 30 días

    # Filtros de organización
    org='My Organisation',

    # Filtros de contenido
    eventinfo='ransomware',
    tags=['tlp:amber', 'malware'],

    # Filtros de estado
    published=True,
    analysis=[1, 2],  # Ongoing o Completed
    threat_level_id=[1, 2],  # High o Medium

    # Filtros de distribución
    distribution=[1, 2, 3],  # Community, Connected, All

    # Opciones de resultado
    limit=100,
    page=1,
    metadata=False,
    pythonify=True
)

print(f"Resultados: {len(results)}")
```

### Búsqueda por Attribute

```python
# Buscar events que contengan IP específica
results = misp.search(
    controller='events',
    type_attribute='ip-dst',
    value='192.0.2.100',
    pythonify=True
)

for event in results:
    print(f"Event {event.id}: {event.info}")
```

### Búsqueda con Warninglist

```python
# Buscar excluyendo warninglists
results = misp.search(
    controller='attributes',
    type_attribute=['ip-dst', 'domain'],
    enforceWarninglist=True,  # Excluir IPs/dominios en warninglists
    to_ids=1,
    pythonify=True
)
```

## Ejemplos Prácticos

### Script 1: Monitor de Nuevos Events

```python
#!/usr/bin/env python3
# monitor_new_events.py

from pymisp import PyMISP
from datetime import datetime, timedelta
import time

MISP_URL = 'https://misp.tu-empresa.com'
MISP_KEY = 'API_KEY'

def monitor_events():
    """Monitor nuevos events cada 5 minutos"""
    misp = PyMISP(MISP_URL, MISP_KEY, True)

    print("=== MISP Event Monitor ===")
    print("Monitoreando nuevos events cada 5 minutos...\n")

    while True:
        # Buscar events de últimos 5 minutos
        timestamp = '5m'
        events = misp.search(
            controller='events',
            timestamp=timestamp,
            published=True,
            pythonify=True
        )

        if events:
            print(f"[{datetime.now()}] {len(events)} nuevo(s) event(s):")
            for event in events:
                print(f"  - ID {event.id}: {event.info}")
                print(f"    Org: {event.Org.name}")
                print(f"    Tags: {[t.name for t in event.tags]}")
                print(f"    URL: {MISP_URL}/events/view/{event.id}")
                print()

        time.sleep(300)  # 5 minutos

if __name__ == '__main__':
    monitor_events()
```

### Script 2: Exportar IOCs Diarios

```python
#!/usr/bin/env python3
# daily_ioc_export.py

from pymisp import PyMISP
from datetime import datetime, timedelta
import csv

def export_daily_iocs():
    """Exportar IOCs del día a CSV"""
    misp = PyMISP('https://misp.tu-empresa.com', 'API_KEY', True)

    # IOCs de hoy
    today = datetime.now().strftime('%Y-%m-%d')

    attributes = misp.search(
        controller='attributes',
        date_from=today,
        to_ids=1,
        published=True,
        pythonify=True
    )

    # Escribir a CSV
    filename = f"iocs_{today}.csv"
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Type', 'Value', 'Category', 'Comment', 'Event', 'Org'])

        for attr in attributes:
            writer.writerow([
                attr.type,
                attr.value,
                attr.category,
                attr.comment or '',
                attr.Event.info,
                attr.Event.Org.name
            ])

    print(f"✅ Exportados {len(attributes)} IOCs a {filename}")

if __name__ == '__main__':
    export_daily_iocs()
```

### Script 3: Sincronización con Sistema Externo

```python
#!/usr/bin/env python3
# sync_to_external_system.py

from pymisp import PyMISP
import requests

MISP_URL = 'https://misp.tu-empresa.com'
MISP_KEY = 'API_KEY'
EXTERNAL_SYSTEM_URL = 'https://external-system.com/api/iocs'
EXTERNAL_SYSTEM_KEY = 'EXTERNAL_API_KEY'

def sync_iocs_to_external():
    """Sincronizar IOCs de MISP a sistema externo"""
    misp = PyMISP(MISP_URL, MISP_KEY, True)

    # Obtener IOCs de últimas 24 horas
    attributes = misp.search(
        controller='attributes',
        timestamp='24h',
        to_ids=1,
        published=True,
        pythonify=True
    )

    # Enviar a sistema externo
    for attr in attributes:
        payload = {
            'type': attr.type,
            'value': attr.value,
            'source': 'MISP',
            'threat_level': attr.Event.threat_level_id,
            'tags': [t.name for t in attr.tags] if attr.tags else []
        }

        response = requests.post(
            EXTERNAL_SYSTEM_URL,
            json=payload,
            headers={'Authorization': f'Bearer {EXTERNAL_SYSTEM_KEY}'}
        )

        if response.status_code == 201:
            print(f"✅ Sincronizado: {attr.type} = {attr.value}")
        else:
            print(f"❌ Error sincronizando {attr.value}: {response.status_code}")

    print(f"\nTotal sincronizados: {len(attributes)}")

if __name__ == '__main__':
    sync_iocs_to_external()
```

## Error Handling

### Manejo de Errores Común

```python
from pymisp import PyMISP
from pymisp.exceptions import (
    PyMISPError,
    MISPServerError,
    NewEventError,
    NewAttributeError
)

misp = PyMISP('https://misp.tu-empresa.com', 'API_KEY', True)

try:
    # Operación MISP
    event = misp.get_event(999999, pythonify=True)

except MISPServerError as e:
    print(f"Error del servidor MISP: {e}")
    # Event no existe

except NewEventError as e:
    print(f"Error creando event: {e}")
    # Datos inválidos

except NewAttributeError as e:
    print(f"Error creando attribute: {e}")
    # Tipo o valor inválido

except PyMISPError as e:
    print(f"Error general de PyMISP: {e}")

except Exception as e:
    print(f"Error inesperado: {e}")
```

## Performance y Buenas Prácticas

### 1. Usar `pythonify=True`

```python
# ✅ Recomendado: pythonify=True para trabajar con objetos Python
event = misp.get_event(123, pythonify=True)
print(event.info)  # Acceso directo a atributos

# ❌ Evitar: Trabajar con diccionarios raw
event_dict = misp.get_event(123)
print(event_dict['Event']['info'])  # Más complejo
```

### 2. Limitar Resultados

```python
# ✅ Usar limit para grandes queries
results = misp.search(
    controller='events',
    limit=100,
    page=1,
    pythonify=True
)

# Paginar si hay más resultados
page = 1
while True:
    results = misp.search(limit=100, page=page, pythonify=True)
    if not results:
        break

    # Procesar results
    for event in results:
        print(event.info)

    page += 1
```

### 3. Cachear Resultados

```python
import pickle
from datetime import datetime, timedelta

def get_events_cached(cache_file='events_cache.pkl', cache_duration_hours=6):
    """Obtener events con cache"""

    # Verificar si cache existe y es reciente
    try:
        with open(cache_file, 'rb') as f:
            cache_data = pickle.load(f)

        cache_time = cache_data['timestamp']
        if datetime.now() - cache_time < timedelta(hours=cache_duration_hours):
            print("✅ Usando cache")
            return cache_data['events']
    except FileNotFoundError:
        pass

    # Cache no existe o expiró, obtener de MISP
    print("Obteniendo de MISP...")
    events = misp.search(controller='events', pythonify=True)

    # Guardar en cache
    with open(cache_file, 'wb') as f:
        pickle.dump({
            'timestamp': datetime.now(),
            'events': events
        }, f)

    return events
```

### 4. Batch Operations

```python
# ✅ Agrupar operaciones
event = misp.get_event(123, pythonify=True)

# Agregar múltiples attributes
attributes_to_add = [
    ('ip-dst', '192.0.2.100'),
    ('ip-dst', '192.0.2.101'),
    ('domain', 'evil.com'),
]

for attr_type, attr_value in attributes_to_add:
    event.add_attribute(attr_type, attr_value, to_ids=True)

# Una sola actualización
misp.update_event(event)

# ❌ Evitar: Múltiples updates
# for attr_type, attr_value in attributes_to_add:
#     event.add_attribute(attr_type, attr_value)
#     misp.update_event(event)  # NO! Demasiadas requests
```

## Recursos Adicionales

### Documentación

- **PyMISP Docs**: https://pymisp.readthedocs.io/
- **MISP Book**: https://www.circl.lu/doc/misp/
- **API Automation**: https://www.circl.lu/doc/misp/automation/

### Ejemplos

- **PyMISP Examples**: https://github.com/MISP/PyMISP/tree/main/examples
- **MISP Modules**: https://github.com/MISP/misp-modules

### Comunidad

- **GitHub**: https://github.com/MISP/MISP
- **Gitter Chat**: https://gitter.im/MISP/MISP
- **Mailing List**: https://www.misp-project.org/community/

---

!!! success "API Reference Completa"
    Ahora tienes el conocimiento para:

    - ✅ Autenticarte con la API de MISP
    - ✅ Crear, leer, actualizar y eliminar events
    - ✅ Gestionar attributes, objects, tags
    - ✅ Realizar búsquedas avanzadas
    - ✅ Exportar datos en múltiples formatos
    - ✅ Automatizar operaciones con PyMISP
    - ✅ Implementar scripts de integración

**¡La automatización de MISP está en tus manos!**
