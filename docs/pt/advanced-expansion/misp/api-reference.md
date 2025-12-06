# Referência de API do MISP

## Visão Geral

Este guia fornece referência completa da API REST do MISP e da biblioteca PyMISP para automação de operações de Threat Intelligence.

!!! abstract "Objetivos deste Guia"
    - Autenticação e configuração
    - PyMISP: Biblioteca Python oficial
    - REST API: Endpoints principais
    - Exemplos práticos de queries
    - Exportação e bulk operations
    - Scripts de automação prontos para uso

## Autenticação

### API Key

Todas as requisições à API do MISP requerem autenticação via API Key.

#### Obter API Key

**Via Interface Web**:

```
1. Login no MISP
2. Menu superior direito > My Profile
3. Seção "Auth Keys"
4. Copiar "Authkey"

Ou criar nova:
  > Add authentication key
  - Comment: "Script automation"
  - Allowed IPs: (opcional - restringir por IP)
  - Expiration: (opcional - definir expiração)
```

#### Usar API Key

=== "HTTP Header"
    ```bash
    Authorization: YOUR_API_KEY_HERE
    ```

=== "URL Parameter"
    ```bash
    ?authkey=YOUR_API_KEY_HERE
    # Menos seguro, não recomendado
    ```

=== "PyMISP"
    ```python
    from pymisp import PyMISP

    misp = PyMISP('https://misp.exemplo.com', 'YOUR_API_KEY', True)
    ```

!!! danger "Segurança de API Keys"
    - **Nunca** commitar API keys em repositórios Git
    - Usar variáveis de ambiente ou secrets managers
    - Rotacionar keys periodicamente
    - Restringir por IP quando possível
    - Configurar expiração para keys temporárias

## PyMISP: Biblioteca Python Oficial

### Instalação

```bash
# Via pip
pip install pymisp

# Ou via conda
conda install -c conda-forge pymisp

# Versão de desenvolvimento
pip install git+https://github.com/MISP/PyMISP.git
```

### Configuração Inicial

```python title="misp_config.py"
#!/usr/bin/env python3
"""
Configuração PyMISP
"""

import os
from pymisp import PyMISP

# Configurações (usar variáveis de ambiente em produção)
MISP_URL = os.getenv('MISP_URL', 'https://misp.exemplo.com')
MISP_KEY = os.getenv('MISP_KEY', 'YOUR_API_KEY_HERE')
MISP_VERIFYCERT = os.getenv('MISP_VERIFYCERT', 'True').lower() == 'true'

def connect_misp():
    """
    Conectar ao MISP

    Returns:
        PyMISP: Instância conectada
    """
    misp = PyMISP(MISP_URL, MISP_KEY, MISP_VERIFYCERT)

    # Testar conexão
    try:
        misp.get_version()
        print(f"[+] Conectado ao MISP: {MISP_URL}")
        return misp
    except Exception as e:
        print(f"[-] Erro ao conectar: {e}")
        return None

if __name__ == '__main__':
    misp = connect_misp()
```

### Operações Básicas

#### 1. Buscar Events

=== "Buscar Todos os Events"
    ```python
    from pymisp import PyMISP

    misp = PyMISP('https://misp.exemplo.com', 'API_KEY', True)

    # Buscar todos os events (últimos 100)
    events = misp.search_index(limit=100)

    for event in events:
        print(f"Event #{event['id']}: {event['info']}")
    ```

=== "Buscar por Data"
    ```python
    from datetime import datetime, timedelta

    # Últimos 7 dias
    date_from = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')

    events = misp.search_index(
        date_from=date_from,
        published=True  # Apenas publicados
    )
    ```

=== "Buscar por Org"
    ```python
    events = misp.search_index(
        org='CERT-BR',
        date_from='2025-01-01'
    )
    ```

=== "Buscar por Tag"
    ```python
    events = misp.search_index(
        tags=['tlp:amber', 'phishing'],
        date_from='2025-01-01'
    )
    ```

#### 2. Obter Event Completo

```python
# Buscar event por ID
event_id = 123
event = misp.get_event(event_id, pythonify=True)

print(f"Event: {event.info}")
print(f"Org: {event.Orgc.name}")
print(f"Date: {event.date}")
print(f"Published: {event.published}")
print(f"Attributes: {len(event.attributes)}")

# Iterar attributes
for attr in event.attributes:
    print(f"  - {attr.type}: {attr.value}")
```

#### 3. Criar Event

```python
from pymisp import MISPEvent

# Criar event
event = MISPEvent()
event.info = "Phishing Campaign - January 2025"
event.distribution = 1  # This community only
event.threat_level_id = 2  # Medium
event.analysis = 1  # Ongoing

# Adicionar ao MISP
result = misp.add_event(event, pythonify=True)

print(f"Event criado: ID {result.id}")
```

#### 4. Adicionar Attributes

```python
from pymisp import MISPAttribute

# Assumindo que 'event' é um MISPEvent existente
event_id = 123
event = misp.get_event(event_id, pythonify=True)

# Adicionar attribute
attr = MISPAttribute()
attr.type = 'ip-dst'
attr.value = '203.0.113.5'
attr.category = 'Network activity'
attr.to_ids = True
attr.comment = 'C2 server detected'

event.add_attribute(**attr)

# Atualizar event
misp.update_event(event)
```

#### 5. Buscar Attributes (IOCs)

```python
# Buscar attributes específicos
result = misp.search(
    controller='attributes',
    type_attribute='ip-dst',
    date_from='2025-01-01',
    to_ids=True,  # Apenas IOCs para IDS
    published=True,
    pythonify=False
)

if 'Attribute' in result:
    for attr in result['Attribute']:
        print(f"{attr['type']}: {attr['value']} - {attr['Event']['info']}")
```

#### 6. Adicionar Tags

```python
# Adicionar tag a event
misp.tag(event_id, tag='tlp:amber')
misp.tag(event_id, tag='phishing')

# Remover tag
misp.untag(event_id, tag='tlp:red')
```

#### 7. Adicionar Sighting

```python
# Adicionar sighting (observação) a um attribute
attribute_value = '203.0.113.5'

sighting = {
    'value': attribute_value,
    'type': '0',  # 0=sighting, 1=false-positive, 2=expiration
    'source': 'Wazuh Detection',
    'timestamp': int(datetime.now().timestamp())
}

misp.add_sighting(sighting)

print(f"Sighting adicionado para {attribute_value}")
```

#### 8. Publicar Event

```python
# Publicar event (tornar visível conforme distribution)
event_id = 123
misp.publish(event_id)

print(f"Event {event_id} publicado")
```

### Operações Avançadas

#### Busca Complexa

```python
# Busca avançada com múltiplos critérios
result = misp.search(
    controller='events',
    date_from='2024-01-01',
    date_to='2025-12-31',
    org='CERT-BR',
    tags=['tlp:amber', 'ransomware'],
    published=True,
    enforce_warninglist=True,  # Filtrar com warninglists
    to_ids=True,
    type_attribute=['ip-dst', 'domain', 'sha256'],
    pythonify=True
)

for event in result:
    print(f"Event: {event.info}")
    for attr in event.attributes:
        if attr.to_ids:
            print(f"  IOC: {attr.type} = {attr.value}")
```

#### Criar Event Completo com Objects

```python
from pymisp import MISPEvent, MISPObject

# Criar event
event = MISPEvent()
event.info = "Emotet Banking Trojan - Complete Analysis"
event.distribution = 2  # Connected communities
event.threat_level_id = 1  # High
event.analysis = 2  # Completed

# Adicionar file object (malware)
file_obj = MISPObject('file')
file_obj.add_attribute('filename', value='invoice.exe')
file_obj.add_attribute('md5', value='5d41402abc4b2a76b9719d911017c592')
file_obj.add_attribute('sha256', value='d7a8fbb307d313a6df40847d1e0e9e56...')
file_obj.add_attribute('size-in-bytes', value='245760')
file_obj.add_attribute('mime-type', value='application/x-dosexec')
event.add_object(file_obj)

# Adicionar network-connection object
network_obj = MISPObject('network-connection')
network_obj.add_attribute('ip-dst', value='203.0.113.25')
network_obj.add_attribute('dst-port', value='8080')
network_obj.add_attribute('protocol', value='tcp')
event.add_object(network_obj)

# Adicionar tags
event.add_tag('tlp:amber')
event.add_tag('malware:emotet')

# Adicionar galaxy (MITRE ATT&CK)
# Note: Galaxies devem ser adicionados após event ser criado

# Criar event no MISP
result = misp.add_event(event, pythonify=True)
print(f"Event criado: {result.id}")

# Adicionar galaxy
misp.tag(result.id, tag='misp-galaxy:mitre-attack-pattern="Phishing - T1566"')
```

#### Bulk Import de IOCs

```python
def bulk_import_iocs(misp, event_id, iocs_list):
    """
    Import em massa de IOCs para um event

    Args:
        misp: PyMISP instance
        event_id: ID do event
        iocs_list: Lista de dicts com IOCs
                   [{'type': 'ip-dst', 'value': '1.2.3.4', 'comment': '...'}, ...]
    """
    event = misp.get_event(event_id, pythonify=True)

    for ioc in iocs_list:
        attr = MISPAttribute()
        attr.type = ioc['type']
        attr.value = ioc['value']
        attr.category = ioc.get('category', 'Network activity')
        attr.to_ids = ioc.get('to_ids', True)
        attr.comment = ioc.get('comment', '')
        attr.batch_import = True  # Não notificar para cada um

        event.add_attribute(**attr)

    # Update uma vez só
    result = misp.update_event(event)
    print(f"Importados {len(iocs_list)} IOCs para event {event_id}")

    return result

# Exemplo de uso
iocs = [
    {'type': 'ip-dst', 'value': '203.0.113.10', 'comment': 'C2 server 1'},
    {'type': 'ip-dst', 'value': '203.0.113.11', 'comment': 'C2 server 2'},
    {'type': 'domain', 'value': 'malware.com', 'comment': 'Malicious domain'},
    {'type': 'sha256', 'value': 'abc123...', 'comment': 'Malware hash'},
]

bulk_import_iocs(misp, event_id=123, iocs_list=iocs)
```

#### Export de IOCs para Wazuh CDB

```python
#!/usr/bin/env python3
"""
Export IOCs do MISP para formato CDB do Wazuh
"""

def export_iocs_to_cdb(misp, ioc_type, days=30, output_file=None):
    """
    Exportar IOCs do MISP para arquivo CDB do Wazuh

    Args:
        misp: PyMISP instance
        ioc_type: Tipo de IOC (ip-dst, domain, md5, sha256)
        days: Buscar IOCs dos últimos N dias
        output_file: Caminho do arquivo de saída
    """
    from datetime import datetime, timedelta

    date_from = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

    # Buscar IOCs
    result = misp.search(
        controller='attributes',
        type_attribute=ioc_type,
        date_from=date_from,
        to_ids=True,
        published=True,
        deleted=False,
        pythonify=False
    )

    iocs = []
    if 'Attribute' in result:
        for attr in result['Attribute']:
            value = attr.get('value', '').strip()
            event_info = attr.get('Event', {}).get('info', 'Unknown')
            # Formato CDB: valor:descrição
            iocs.append(f"{value}:MISP - {event_info}")

    # Escrever arquivo
    if output_file:
        with open(output_file, 'w') as f:
            for ioc in iocs:
                f.write(f"{ioc}\n")
        print(f"[+] Exportados {len(iocs)} IOCs para {output_file}")
    else:
        for ioc in iocs:
            print(ioc)

    return iocs

# Exemplo de uso
misp = PyMISP('https://misp.exemplo.com', 'API_KEY', True)

# Exportar IPs maliciosos
export_iocs_to_cdb(
    misp,
    ioc_type='ip-dst',
    days=30,
    output_file='/var/ossec/etc/lists/misp_malicious_ips'
)

# Exportar domínios
export_iocs_to_cdb(
    misp,
    ioc_type='domain',
    days=30,
    output_file='/var/ossec/etc/lists/misp_malicious_domains'
)
```

## REST API: Endpoints Principais

### Base URL

```
https://misp.exemplo.com
```

### Endpoints

#### 1. Buscar Events

**Endpoint**: `POST /events/restSearch`

**Headers**:
```
Authorization: YOUR_API_KEY
Content-Type: application/json
Accept: application/json
```

**Body**:
```json
{
  "returnFormat": "json",
  "page": 1,
  "limit": 100,
  "date_from": "2025-01-01",
  "published": true,
  "tags": ["tlp:amber"],
  "org": "CERT-BR"
}
```

**Response**:
```json
{
  "response": [
    {
      "Event": {
        "id": "123",
        "org_id": "1",
        "date": "2025-01-15",
        "info": "Phishing Campaign - January 2025",
        "published": true,
        "threat_level_id": "2",
        "Attribute": [
          {
            "id": "456",
            "type": "ip-dst",
            "value": "203.0.113.5",
            "category": "Network activity",
            "to_ids": true
          }
        ]
      }
    }
  ]
}
```

**cURL Exemplo**:
```bash
curl -X POST \
  https://misp.exemplo.com/events/restSearch \
  -H 'Authorization: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "returnFormat": "json",
    "date_from": "2025-01-01",
    "published": true
  }'
```

#### 2. Buscar Attributes (IOCs)

**Endpoint**: `POST /attributes/restSearch`

**Body**:
```json
{
  "returnFormat": "json",
  "type": ["ip-dst", "domain"],
  "date_from": "2025-01-01",
  "to_ids": true,
  "published": true
}
```

**Response**:
```json
{
  "response": {
    "Attribute": [
      {
        "id": "789",
        "event_id": "123",
        "type": "ip-dst",
        "value": "203.0.113.5",
        "category": "Network activity",
        "to_ids": true,
        "Event": {
          "id": "123",
          "info": "Phishing Campaign"
        }
      }
    ]
  }
}
```

**cURL Exemplo**:
```bash
curl -X POST \
  https://misp.exemplo.com/attributes/restSearch \
  -H 'Authorization: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "ip-dst",
    "to_ids": true,
    "published": true
  }'
```

#### 3. Obter Event por ID

**Endpoint**: `GET /events/view/{event_id}`

**cURL Exemplo**:
```bash
curl -X GET \
  https://misp.exemplo.com/events/view/123 \
  -H 'Authorization: YOUR_API_KEY' \
  -H 'Accept: application/json'
```

#### 4. Criar Event

**Endpoint**: `POST /events/add`

**Body**:
```json
{
  "Event": {
    "info": "New Phishing Campaign",
    "distribution": "1",
    "threat_level_id": "2",
    "analysis": "1",
    "date": "2025-01-20"
  }
}
```

**cURL Exemplo**:
```bash
curl -X POST \
  https://misp.exemplo.com/events/add \
  -H 'Authorization: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "Event": {
      "info": "New Phishing Campaign",
      "distribution": "1",
      "threat_level_id": "2"
    }
  }'
```

#### 5. Adicionar Attribute

**Endpoint**: `POST /attributes/add/{event_id}`

**Body**:
```json
{
  "Attribute": {
    "type": "ip-dst",
    "value": "203.0.113.99",
    "category": "Network activity",
    "to_ids": true,
    "comment": "C2 server"
  }
}
```

**cURL Exemplo**:
```bash
curl -X POST \
  https://misp.exemplo.com/attributes/add/123 \
  -H 'Authorization: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "ip-dst",
    "value": "203.0.113.99",
    "to_ids": true
  }'
```

#### 6. Adicionar Sighting

**Endpoint**: `POST /sightings/add`

**Body**:
```json
{
  "value": "203.0.113.5",
  "type": "0",
  "source": "Wazuh Detection",
  "timestamp": "1705315200"
}
```

**cURL Exemplo**:
```bash
curl -X POST \
  https://misp.exemplo.com/sightings/add \
  -H 'Authorization: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "value": "203.0.113.5",
    "type": "0",
    "source": "Wazuh Detection"
  }'
```

#### 7. Publicar Event

**Endpoint**: `POST /events/publish/{event_id}`

**cURL Exemplo**:
```bash
curl -X POST \
  https://misp.exemplo.com/events/publish/123 \
  -H 'Authorization: YOUR_API_KEY'
```

#### 8. Export de IOCs

**Endpoint**: `GET /events/restSearch`

**Formatos de Export**:

=== "JSON"
    ```bash
    curl -X POST \
      https://misp.exemplo.com/events/restSearch \
      -H 'Authorization: YOUR_API_KEY' \
      -d '{"returnFormat": "json"}'
    ```

=== "CSV"
    ```bash
    curl -X POST \
      https://misp.exemplo.com/events/restSearch \
      -H 'Authorization: YOUR_API_KEY' \
      -d '{"returnFormat": "csv"}'
    ```

=== "STIX 2.1"
    ```bash
    curl -X POST \
      https://misp.exemplo.com/events/restSearch \
      -H 'Authorization: YOUR_API_KEY' \
      -d '{"returnFormat": "stix2"}'
    ```

=== "Suricata Rules"
    ```bash
    curl -X POST \
      https://misp.exemplo.com/events/restSearch \
      -H 'Authorization: YOUR_API_KEY' \
      -d '{"returnFormat": "suricata"}'
    ```

=== "YARA Rules"
    ```bash
    curl -X POST \
      https://misp.exemplo.com/events/restSearch \
      -H 'Authorization: YOUR_API_KEY' \
      -d '{"returnFormat": "yara"}'
    ```

## Scripts de Automação Prontos

### Script 1: Monitorar Novos IOCs

```python title="monitor_new_iocs.py"
#!/usr/bin/env python3
"""
Monitorar novos IOCs no MISP e enviar alertas
"""

import os
import json
from datetime import datetime, timedelta
from pymisp import PyMISP

MISP_URL = os.getenv('MISP_URL')
MISP_KEY = os.getenv('MISP_KEY')

def get_new_iocs(misp, hours=1):
    """Buscar IOCs das últimas N horas"""
    date_from = (datetime.now() - timedelta(hours=hours)).strftime('%Y-%m-%d %H:%M:%S')

    result = misp.search(
        controller='attributes',
        date_from=date_from,
        to_ids=True,
        published=True,
        pythonify=False
    )

    iocs = []
    if 'Attribute' in result:
        for attr in result['Attribute']:
            iocs.append({
                'type': attr['type'],
                'value': attr['value'],
                'event': attr['Event']['info'],
                'event_id': attr['event_id']
            })

    return iocs

def send_alert(iocs):
    """Enviar alerta (email, Slack, etc)"""
    # Implementar conforme sua infraestrutura
    print(f"[!] {len(iocs)} novos IOCs detectados:")
    for ioc in iocs:
        print(f"  - {ioc['type']}: {ioc['value']} (Event: {ioc['event']})")

def main():
    misp = PyMISP(MISP_URL, MISP_KEY, True)

    iocs = get_new_iocs(misp, hours=1)

    if iocs:
        send_alert(iocs)
    else:
        print("[+] Nenhum novo IOC nas últimas horas")

if __name__ == '__main__':
    main()
```

### Script 2: Sync IOCs para Firewall

```python title="sync_to_firewall.py"
#!/usr/bin/env python3
"""
Sincronizar IOCs do MISP para blocklist de firewall
"""

import requests
from pymisp import PyMISP

MISP_URL = 'https://misp.exemplo.com'
MISP_KEY = 'YOUR_API_KEY'

FIREWALL_API_URL = 'https://firewall.exemplo.com/api/blocklist'
FIREWALL_API_KEY = 'YOUR_FIREWALL_API_KEY'

def get_malicious_ips(misp, days=7):
    """Buscar IPs maliciosos do MISP"""
    from datetime import datetime, timedelta

    date_from = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

    result = misp.search(
        controller='attributes',
        type_attribute='ip-dst',
        date_from=date_from,
        to_ids=True,
        published=True,
        pythonify=False
    )

    ips = []
    if 'Attribute' in result:
        for attr in result['Attribute']:
            ips.append(attr['value'])

    return list(set(ips))  # Remover duplicatas

def add_to_firewall_blocklist(ips):
    """Adicionar IPs à blocklist do firewall"""
    headers = {
        'Authorization': f'Bearer {FIREWALL_API_KEY}',
        'Content-Type': 'application/json'
    }

    for ip in ips:
        payload = {
            'ip': ip,
            'action': 'deny',
            'comment': 'MISP IOC - Malicious IP'
        }

        response = requests.post(
            FIREWALL_API_URL,
            headers=headers,
            json=payload
        )

        if response.status_code == 200:
            print(f"[+] Bloqueado: {ip}")
        else:
            print(f"[-] Erro ao bloquear {ip}: {response.text}")

def main():
    misp = PyMISP(MISP_URL, MISP_KEY, True)

    print("[*] Buscando IPs maliciosos do MISP...")
    ips = get_malicious_ips(misp, days=7)

    print(f"[+] Encontrados {len(ips)} IPs únicos")

    print("[*] Adicionando à blocklist do firewall...")
    add_to_firewall_blocklist(ips)

    print("[+] Sincronização concluída")

if __name__ == '__main__':
    main()
```

### Script 3: Criar Event a partir de CSV

```python title="csv_to_misp.py"
#!/usr/bin/env python3
"""
Importar IOCs de CSV para MISP
"""

import csv
from pymisp import PyMISP, MISPEvent, MISPAttribute

MISP_URL = 'https://misp.exemplo.com'
MISP_KEY = 'YOUR_API_KEY'

def import_csv_to_misp(csv_file, event_info):
    """
    Importar CSV para MISP

    CSV Format:
    type,value,category,comment,to_ids
    ip-dst,203.0.113.5,Network activity,C2 server,1
    domain,malware.com,Network activity,Malicious domain,1
    """
    misp = PyMISP(MISP_URL, MISP_KEY, True)

    # Criar event
    event = MISPEvent()
    event.info = event_info
    event.distribution = 1  # This community
    event.threat_level_id = 2  # Medium

    # Adicionar attributes do CSV
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)

        for row in reader:
            attr = MISPAttribute()
            attr.type = row['type']
            attr.value = row['value']
            attr.category = row.get('category', 'Network activity')
            attr.to_ids = row.get('to_ids', '1') == '1'
            attr.comment = row.get('comment', '')
            attr.batch_import = True

            event.add_attribute(**attr)

    # Criar event no MISP
    result = misp.add_event(event, pythonify=True)

    print(f"[+] Event criado: ID {result.id}")
    print(f"[+] Total de attributes: {len(event.attributes)}")

    return result

if __name__ == '__main__':
    import sys

    if len(sys.argv) != 3:
        print("Uso: python csv_to_misp.py <csv_file> <event_info>")
        sys.exit(1)

    csv_file = sys.argv[1]
    event_info = sys.argv[2]

    import_csv_to_misp(csv_file, event_info)
```

**Exemplo de uso**:
```bash
# Criar arquivo CSV
cat > iocs.csv << EOF
type,value,category,comment,to_ids
ip-dst,203.0.113.10,Network activity,C2 server,1
ip-dst,203.0.113.11,Network activity,C2 server,1
domain,malware.com,Network activity,Phishing domain,1
sha256,abc123...,Payload delivery,Malware hash,1
EOF

# Importar para MISP
python csv_to_misp.py iocs.csv "Phishing Campaign - Manual Import"
```

## Melhores Práticas

### Performance

```python
# ✅ Bom: Usar pythonify=False para grandes volumes
result = misp.search(
    controller='attributes',
    date_from='2024-01-01',
    pythonify=False  # Mais rápido
)

# ❌ Ruim: pythonify=True em grandes buscas (lento)
result = misp.search(
    controller='attributes',
    date_from='2020-01-01',
    pythonify=True  # Lento para muitos resultados
)
```

### Paginação

```python
# Para grandes volumes, usar paginação
page = 1
limit = 100
all_events = []

while True:
    events = misp.search_index(
        page=page,
        limit=limit,
        date_from='2024-01-01'
    )

    if not events:
        break

    all_events.extend(events)
    page += 1

print(f"Total de events: {len(all_events)}")
```

### Tratamento de Erros

```python
from pymisp import PyMISP, PyMISPError

try:
    misp = PyMISP(MISP_URL, MISP_KEY, True)
    event = misp.get_event(123, pythonify=True)

except PyMISPError as e:
    print(f"Erro MISP: {e}")
except Exception as e:
    print(f"Erro geral: {e}")
```

### Rate Limiting

```python
import time

# Para operações em massa, adicionar delay
for ioc in large_ioc_list:
    misp.add_attribute(event_id, ioc)
    time.sleep(0.1)  # 100ms delay entre requests
```

## Recursos Adicionais

### Documentação Oficial

- **PyMISP**: https://pymisp.readthedocs.io/
- **MISP API**: https://www.misp-project.org/openapi/
- **MISP Book**: https://www.circl.lu/doc/misp/

### Exemplos

- **PyMISP Examples**: https://github.com/MISP/PyMISP/tree/main/examples
- **MISP Workflows**: https://github.com/MISP/misp-workflows

### Comunidade

- **GitHub**: https://github.com/MISP/MISP
- **Gitter Chat**: https://gitter.im/MISP/MISP
- **Mailing List**: https://lists.misp-project.org/

---

**Documentação**: NEO_NETBOX_ODOO Stack - MISP
**Versão**: 1.0
**Última Atualização**: 2025-12-05
