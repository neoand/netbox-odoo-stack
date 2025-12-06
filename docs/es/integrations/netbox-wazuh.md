# Integración NetBox ↔ Wazuh

> **AI Context**: Este documento describe cómo enriquecer alertas del Wazuh SIEM con datos de assets de NetBox (CMDB/IPAM), agregando contexto de negocio (criticidad, owner, ubicación) a los eventos de seguridad para priorización y respuesta más eficaz.

## Objetivo

- **Enriquecer alertas** de Wazuh con contexto de assets de NetBox
- Agregar información de **criticidad de negocio** a los eventos de seguridad
- Identificar **owner/responsable** del asset comprometido
- Priorizar respuesta basada en **ubicación y función** del activo
- Crear **cache de assets** para rendimiento en alto volumen

## Arquitectura de la Integración

```
┌────────────────────────────────────────────────────────────┐
│                    Wazuh Manager 4.12                      │
│  - Recibe alertas de agents                                │
│  - Ejecuta rules/decoders                                  │
│  - Integración custom para NetBox enrichment               │
└───────────────┬────────────────────────────────────────────┘
                │
          [Alert Trigger]
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│           NetBox Enrichment Script                        │
│  /var/ossec/integrations/custom-netbox-enrichment.py      │
│  1. Extrae IP/hostname de la alerta                       │
│  2. Query NetBox API                                       │
│  3. Cache Redis (30min TTL)                                │
│  4. Enriquece JSON de la alerta                            │
└───────────────┬───────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────┐
│                    NetBox CMDB 4.2                         │
│  - Devices: name, role, site, status                       │
│  - IPs: address, dns_name, device                          │
│  - Custom Fields: criticality, owner_team, sla_tier        │
│  - Tags: environment, business_unit                        │
└────────────────────────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────┐
│              Wazuh Alert (Enriched)                        │
│  {                                                         │
│    "agent": {...},                                         │
│    "rule": {...},                                          │
│    "netbox": {                                             │
│      "device_name": "srv-db-prod-01",                      │
│      "site": "Datacenter São Paulo",                       │
│      "criticality": "critical",                            │
│      "owner": "DBA Team",                                  │
│      "primary_ip": "10.20.30.40",                          │
│      "status": "active",                                   │
│      "tags": ["production", "database"]                    │
│    }                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

## Beneficios del Enrichment

| Sin NetBox | Con NetBox |
|------------|------------|
| Alert: SSH brute force en 10.20.30.40 | Alert: SSH brute force en **srv-db-prod-01** (Criticidad: **CRITICAL**, Owner: **DBA Team**, Site: **DC-SP**) |
| Prioridad: basada solo en rule_level | Prioridad: rule_level **+ criticality + environment** |
| Responsable: desconocido | Responsable: **DBA Team** vía Slack @dba-oncall |
| Contexto: limitado | Contexto: producción, database crítico, SLA Tier 1 |

## Implementación

### 1. Script de Integración Wazuh

```python
#!/var/ossec/framework/python/bin/python3
# /var/ossec/integrations/custom-netbox-enrichment.py

import sys
import json
import os
import requests
from datetime import datetime, timedelta
import redis
import logging

# Configuración
NETBOX_URL = os.getenv('NETBOX_URL', 'https://netbox.example.com')
NETBOX_TOKEN = os.getenv('NETBOX_TOKEN')
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
CACHE_TTL = int(os.getenv('CACHE_TTL', 1800))  # 30 minutos

# Setup logging
LOG_FILE = '/var/ossec/logs/integrations.log'
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('netbox-enrichment')

# Redis cache
try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    redis_client.ping()
    CACHE_ENABLED = True
except:
    logger.warning("Redis no disponible, cache deshabilitado")
    CACHE_ENABLED = False


def get_netbox_device_by_ip(ip_address: str) -> dict:
    """
    Buscar device en NetBox por dirección IP.
    Usa cache Redis para reducir llamadas a la API.
    """
    cache_key = f"netbox:ip:{ip_address}"

    # Intentar cache primero
    if CACHE_ENABLED:
        cached = redis_client.get(cache_key)
        if cached:
            logger.info(f"Cache HIT para {ip_address}")
            return json.loads(cached)

    # Query NetBox API
    logger.info(f"Consultando NetBox para IP: {ip_address}")
    headers = {
        'Authorization': f'Token {NETBOX_TOKEN}',
        'Content-Type': 'application/json'
    }

    try:
        # 1. Buscar IP address
        response = requests.get(
            f"{NETBOX_URL}/api/ipam/ip-addresses/",
            params={'address': ip_address},
            headers=headers,
            timeout=5
        )
        response.raise_for_status()
        ip_data = response.json()

        if not ip_data.get('results'):
            logger.warning(f"IP {ip_address} no encontrada en NetBox")
            return None

        ip_obj = ip_data['results'][0]
        device_id = ip_obj.get('assigned_object', {}).get('device', {}).get('id')

        if not device_id:
            logger.warning(f"IP {ip_address} no asignada a un device")
            return None

        # 2. Buscar device details
        response = requests.get(
            f"{NETBOX_URL}/api/dcim/devices/{device_id}/",
            headers=headers,
            timeout=5
        )
        response.raise_for_status()
        device = response.json()

        # 3. Montar objeto enriquecido
        enriched_data = {
            'device_id': device.get('id'),
            'device_name': device.get('name'),
            'device_url': f"{NETBOX_URL}/dcim/devices/{device.get('id')}/",
            'site': device.get('site', {}).get('name'),
            'rack': device.get('rack', {}).get('name'),
            'status': device.get('status', {}).get('value'),
            'role': device.get('device_role', {}).get('name'),
            'platform': device.get('platform', {}).get('name') if device.get('platform') else None,
            'primary_ip': device.get('primary_ip4', {}).get('address') if device.get('primary_ip4') else None,
            'serial': device.get('serial'),
            'asset_tag': device.get('asset_tag'),
            'tags': [tag['name'] for tag in device.get('tags', [])],
        }

        # 4. Extraer custom fields
        custom_fields = device.get('custom_fields', {})
        enriched_data['criticality'] = custom_fields.get('criticality', 'medium')
        enriched_data['owner_team'] = custom_fields.get('owner_team')
        enriched_data['sla_tier'] = custom_fields.get('sla_tier')
        enriched_data['warranty_end'] = custom_fields.get('warranty_end')

        # Cache resultado
        if CACHE_ENABLED:
            redis_client.setex(cache_key, CACHE_TTL, json.dumps(enriched_data))
            logger.info(f"Datos en cache para {ip_address}")

        return enriched_data

    except requests.exceptions.RequestException as e:
        logger.error(f"Error API NetBox para {ip_address}: {e}")
        return None


def get_netbox_device_by_hostname(hostname: str) -> dict:
    """
    Buscar device en NetBox por nombre/hostname.
    """
    cache_key = f"netbox:hostname:{hostname}"

    # Intentar cache
    if CACHE_ENABLED:
        cached = redis_client.get(cache_key)
        if cached:
            logger.info(f"Cache HIT para hostname {hostname}")
            return json.loads(cached)

    # Query NetBox API
    logger.info(f"Consultando NetBox para hostname: {hostname}")
    headers = {
        'Authorization': f'Token {NETBOX_TOKEN}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.get(
            f"{NETBOX_URL}/api/dcim/devices/",
            params={'name': hostname},
            headers=headers,
            timeout=5
        )
        response.raise_for_status()
        device_data = response.json()

        if not device_data.get('results'):
            logger.warning(f"Hostname {hostname} no encontrado en NetBox")
            return None

        device = device_data['results'][0]

        # Reutilizar misma lógica de enrichment
        enriched_data = {
            'device_id': device.get('id'),
            'device_name': device.get('name'),
            'device_url': f"{NETBOX_URL}/dcim/devices/{device.get('id')}/",
            'site': device.get('site', {}).get('name'),
            'status': device.get('status', {}).get('value'),
            'role': device.get('device_role', {}).get('name'),
            'primary_ip': device.get('primary_ip4', {}).get('address') if device.get('primary_ip4') else None,
            'tags': [tag['name'] for tag in device.get('tags', [])],
        }

        custom_fields = device.get('custom_fields', {})
        enriched_data['criticality'] = custom_fields.get('criticality', 'medium')
        enriched_data['owner_team'] = custom_fields.get('owner_team')

        # Cache
        if CACHE_ENABLED:
            redis_client.setex(cache_key, CACHE_TTL, json.dumps(enriched_data))

        return enriched_data

    except Exception as e:
        logger.error(f"Error API NetBox para hostname {hostname}: {e}")
        return None


def extract_identifiers_from_alert(alert_json: dict) -> tuple:
    """
    Extraer IP y/o hostname de la alerta Wazuh.
    """
    ip_address = None
    hostname = None

    # Intentar extraer de diferentes campos
    data = alert_json.get('data', {})
    agent = alert_json.get('agent', {})

    # IP del srcip/dstip
    ip_address = data.get('srcip') or data.get('dstip') or agent.get('ip')

    # Hostname del agent
    hostname = agent.get('name')

    return ip_address, hostname


def enrich_alert(alert_json: dict) -> dict:
    """
    Enriquecer alerta con datos de NetBox.
    """
    ip_address, hostname = extract_identifiers_from_alert(alert_json)

    netbox_data = None

    # Intentar por IP primero
    if ip_address and ip_address not in ['any', '0.0.0.0', '127.0.0.1']:
        netbox_data = get_netbox_device_by_ip(ip_address)

    # Fallback para hostname
    if not netbox_data and hostname:
        netbox_data = get_netbox_device_by_hostname(hostname)

    # Agregar a la alerta
    if netbox_data:
        alert_json['netbox'] = netbox_data
        logger.info(f"Alerta enriquecida con datos NetBox: {netbox_data.get('device_name')}")
    else:
        logger.info(f"No se encontraron datos NetBox para IP={ip_address}, hostname={hostname}")

    return alert_json


def main():
    """
    Punto de entrada. Wazuh pasa la alerta vía stdin.
    """
    try:
        # Leer alerta del stdin (formato Wazuh integration)
        input_str = sys.stdin.read()
        alert_json = json.loads(input_str)

        # Enriquecer
        enriched_alert = enrich_alert(alert_json)

        # Output para stdout (Wazuh lo registrará)
        print(json.dumps(enriched_alert, indent=2))

        logger.info("Enrichment de alerta completado exitosamente")
        sys.exit(0)

    except Exception as e:
        logger.error(f"Error en main: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
```

### 2. Configuración de la Integración en Wazuh

**Archivo: `/var/ossec/etc/ossec.conf`**

```xml
<ossec_config>
  <integration>
    <name>custom-netbox-enrichment</name>
    <hook_url>/var/ossec/integrations/custom-netbox-enrichment.py</hook_url>
    <level>3</level>
    <alert_format>json</alert_format>
    <!-- Filtrar solo alertas relevantes -->
    <rule_id>5710,5712,5551,5402</rule_id>  <!-- SSH, auth failures, etc -->
  </integration>
</ossec_config>
```

**Variables de entorno (systemd override):**

```bash
# /etc/systemd/system/wazuh-manager.service.d/override.conf
[Service]
Environment="NETBOX_URL=https://netbox.example.com"
Environment="NETBOX_TOKEN=tu-token-aqui"
Environment="REDIS_HOST=localhost"
Environment="REDIS_PORT=6379"
Environment="CACHE_TTL=1800"
```

### 3. Permisos y Deploy

```bash
# Copiar script
sudo cp custom-netbox-enrichment.py /var/ossec/integrations/
sudo chmod 750 /var/ossec/integrations/custom-netbox-enrichment.py
sudo chown root:wazuh /var/ossec/integrations/custom-netbox-enrichment.py

# Instalar dependencias Python
sudo /var/ossec/framework/python/bin/pip3 install requests redis

# Reiniciar Wazuh
sudo systemctl restart wazuh-manager
```

## Customización de Rules para Alertas Enriquecidas

### Rule para Elevar Prioridad de Assets Críticos

```xml
<!-- /var/ossec/etc/rules/local_rules.xml -->
<group name="netbox,enrichment">

  <!-- Elevar prioridad si asset es crítico -->
  <rule id="100100" level="10">
    <if_sid>5710,5712</if_sid>  <!-- SSH brute force -->
    <match>criticality": "critical"</match>
    <description>SSH brute force en asset CRÍTICO (NetBox): $(netbox.device_name) - Site: $(netbox.site)</description>
    <group>authentication_failures,pci_dss_10.2.4,pci_dss_10.2.5,gdpr_IV_35.7.d,gdpr_IV_32.2,hipaa_164.312.b,nist_800_53_AU.14,nist_800_53_AC.7,tsc_CC6.1,tsc_CC6.8,tsc_CC7.2,tsc_CC7.3,</group>
  </rule>

  <!-- Alertar sobre cambios en producción -->
  <rule id="100101" level="8">
    <if_sid>550</if_sid>  <!-- Integrity check -->
    <match>"production"</match>
    <description>Cambio de integridad de archivo en asset de PRODUCCIÓN: $(netbox.device_name)</description>
    <group>file_integrity,pci_dss_11.5,gpg13_4.11,gdpr_II_5.1.f,hipaa_164.312.c.1,nist_800_53_SI.7,tsc_PI1.4,tsc_PI1.5,tsc_CC6.1,tsc_CC6.8,tsc_CC7.2,tsc_CC7.3,</group>
  </rule>

  <!-- Alertar sobre intentos de acceso en horario no comercial -->
  <rule id="100102" level="7">
    <if_sid>5710</if_sid>
    <match>"sla_tier": "1"</match>
    <time>8 pm - 6 am</time>
    <description>Autenticación fuera de horario en asset SLA Tier 1: $(netbox.device_name)</description>
  </rule>

</group>
```

## Cache Redis para Rendimiento

### Configuración Redis

```yaml
# docker-compose.yml
services:
  redis-cache:
    image: redis:7-alpine
    container_name: wazuh-redis-cache
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

volumes:
  redis_data:
```

### Monitorear Cache

```bash
# Estadísticas del cache
redis-cli INFO stats | grep keyspace_hits

# Listar keys
redis-cli KEYS "netbox:*"

# Ver contenido de un asset
redis-cli GET "netbox:ip:10.20.30.40"

# Flush cache (forzar re-query)
redis-cli FLUSHDB
```

## Custom Fields Necesarios en NetBox

```python
# Script para crear custom fields necesarios
import pynetbox

nb = pynetbox.api('https://netbox.example.com', token='tu-token')

custom_fields = [
    {
        'name': 'criticality',
        'label': 'Business Criticality',
        'type': 'select',
        'content_types': ['dcim.device'],
        'required': True,
        'choices': ['low', 'medium', 'high', 'critical'],
        'default': 'medium',
        'description': 'Usado por Wazuh para priorización de alertas'
    },
    {
        'name': 'owner_team',
        'label': 'Owner Team',
        'type': 'text',
        'content_types': ['dcim.device'],
        'required': False,
        'description': 'Equipo responsable de este asset (ej., "DBA Team", "DevOps")'
    },
    {
        'name': 'sla_tier',
        'label': 'SLA Tier',
        'type': 'select',
        'content_types': ['dcim.device'],
        'required': False,
        'choices': ['1', '2', '3', '4'],
        'default': '3',
        'description': 'Service Level Agreement tier (1=más alto)'
    },
    {
        'name': 'security_zone',
        'label': 'Security Zone',
        'type': 'select',
        'content_types': ['dcim.device'],
        'choices': ['dmz', 'internal', 'management', 'external'],
        'description': 'Zona de seguridad de red para reglas de firewall'
    },
]

for cf_data in custom_fields:
    try:
        cf = nb.extras.custom_fields.create(**cf_data)
        print(f"Creado: {cf.name}")
    except Exception as e:
        print(f"Error: {e}")
```

## Ejemplos de Alertas Enriquecidas

### Antes (Alert estándar Wazuh)

```json
{
  "timestamp": "2025-12-05T14:30:00.000Z",
  "rule": {
    "level": 5,
    "description": "sshd: authentication failed.",
    "id": "5710",
    "groups": ["authentication_failed", "syslog"]
  },
  "agent": {
    "id": "001",
    "name": "unknown",
    "ip": "10.20.30.40"
  },
  "data": {
    "srcip": "203.0.113.50",
    "srcuser": "admin"
  }
}
```

### Después (Con NetBox enrichment)

```json
{
  "timestamp": "2025-12-05T14:30:00.000Z",
  "rule": {
    "level": 10,
    "description": "SSH brute force en asset CRÍTICO (NetBox): srv-db-prod-01 - Site: Datacenter São Paulo",
    "id": "100100",
    "groups": ["authentication_failed", "syslog", "netbox", "critical_asset"]
  },
  "agent": {
    "id": "001",
    "name": "srv-db-prod-01",
    "ip": "10.20.30.40"
  },
  "data": {
    "srcip": "203.0.113.50",
    "srcuser": "admin"
  },
  "netbox": {
    "device_id": 123,
    "device_name": "srv-db-prod-01",
    "device_url": "https://netbox.example.com/dcim/devices/123/",
    "site": "Datacenter São Paulo",
    "rack": "R42-A",
    "status": "active",
    "role": "Database Server",
    "platform": "CentOS 8",
    "primary_ip": "10.20.30.40/24",
    "serial": "SN123456",
    "asset_tag": "IT-DB-0042",
    "tags": ["production", "database", "tier1"],
    "criticality": "critical",
    "owner_team": "DBA Team",
    "sla_tier": "1",
    "security_zone": "internal"
  }
}
```

## Dashboard OpenSearch/Kibana

### Visualizaciones Sugeridas

**1. Alertas por Criticidad**

```json
{
  "title": "Alertas por Criticidad de Asset",
  "type": "pie",
  "query": {
    "aggs": {
      "criticality": {
        "terms": {
          "field": "netbox.criticality.keyword"
        }
      }
    }
  }
}
```

**2. Top Assets con Más Alertas**

```json
{
  "title": "Top 10 Assets por Cantidad de Alertas",
  "type": "horizontal_bar",
  "query": {
    "aggs": {
      "top_devices": {
        "terms": {
          "field": "netbox.device_name.keyword",
          "size": 10
        }
      }
    }
  }
}
```

**3. Alertas por Site**

```json
{
  "title": "Alertas de Seguridad por Site",
  "type": "map",
  "query": {
    "aggs": {
      "sites": {
        "terms": {
          "field": "netbox.site.keyword"
        }
      }
    }
  }
}
```

## Troubleshooting

### El script no se está ejecutando

```bash
# Verificar logs
tail -f /var/ossec/logs/integrations.log

# Probar manualmente
echo '{"agent":{"ip":"10.20.30.40","name":"test"},"rule":{"id":"5710","level":5}}' | \
  sudo -u wazuh /var/ossec/integrations/custom-netbox-enrichment.py

# Verificar permisos
ls -la /var/ossec/integrations/custom-netbox-enrichment.py
```

### NetBox API retornando error 401

```bash
# Probar token directamente
curl -H "Authorization: Token tu-token" \
  https://netbox.example.com/api/dcim/devices/?limit=1

# Verificar si variable de entorno está configurada
sudo systemctl show wazuh-manager | grep NETBOX_TOKEN
```

### Cache no está funcionando

```bash
# Probar conexión Redis
redis-cli ping

# Verificar si Python puede conectar
python3 -c "import redis; r=redis.Redis(); print(r.ping())"

# Ver si hay keys siendo creadas
watch -n 1 'redis-cli DBSIZE'
```

### Rendimiento degradado

```python
# Ajustar TTL del cache
# Reducir de 30min a 5min si los datos cambian frecuentemente
CACHE_TTL = 300

# Aumentar a 2h si los datos son estables
CACHE_TTL = 7200

# Monitorear latencia de la API NetBox
import time
start = time.time()
response = requests.get(f"{NETBOX_URL}/api/dcim/devices/123/", headers=headers)
print(f"Latencia API NetBox: {time.time() - start:.2f}s")
```

## Próximos Pasos

- [ ] Implementar enrichment para máquinas virtuales (VMware/Proxmox)
- [ ] Agregar geolocalización de IPs externos con GeoIP
- [ ] Integrar con CMDB adicional (ServiceNow, iTop)
- [ ] Crear dashboard dedicado para alertas enriquecidas
- [ ] Implementar auto-response basado en criticidad
- [ ] Webhook inverso: alertar NetBox sobre devices comprometidos
- [ ] Machine learning para detectar anomalías en assets críticos
