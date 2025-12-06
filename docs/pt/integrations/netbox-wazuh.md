# Integração NetBox ↔ Wazuh

> **AI Context**: Este documento descreve como enriquecer alertas do Wazuh SIEM com dados de assets do NetBox (CMDB/IPAM), adicionando contexto de negócio (criticidade, owner, localização) aos eventos de segurança para priorização e resposta mais eficaz.

## Objetivo

- **Enriquecer alertas** do Wazuh com contexto de assets do NetBox
- Adicionar informações de **criticidade de negócio** aos eventos de segurança
- Identificar **owner/responsável** pelo asset comprometido
- Priorizar resposta baseada em **localização e função** do ativo
- Criar **cache de assets** para performance em alto volume

## Arquitetura da Integração

```
┌────────────────────────────────────────────────────────────┐
│                    Wazuh Manager 4.12                      │
│  - Recebe alertas de agents                                │
│  - Executa rules/decoders                                  │
│  - Integração custom para NetBox enrichment                │
└───────────────┬────────────────────────────────────────────┘
                │
          [Alert Trigger]
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│           NetBox Enrichment Script                        │
│  /var/ossec/integrations/custom-netbox-enrichment.py      │
│  1. Extrai IP/hostname do alerta                          │
│  2. Query NetBox API                                       │
│  3. Cache Redis (30min TTL)                                │
│  4. Enriquece JSON do alerta                               │
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

## Benefícios do Enrichment

| Sem NetBox | Com NetBox |
|------------|------------|
| Alert: SSH brute force em 10.20.30.40 | Alert: SSH brute force em **srv-db-prod-01** (Criticality: **CRITICAL**, Owner: **DBA Team**, Site: **DC-SP**) |
| Prioridade: baseada apenas em rule_level | Prioridade: rule_level **+ criticality + environment** |
| Responsável: desconhecido | Responsável: **DBA Team** via Slack @dba-oncall |
| Contexto: limitado | Contexto: produção, database crítico, SLA Tier 1 |

## Implementação

### 1. Script de Integração Wazuh

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

# Configuração
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
    logger.warning("Redis not available, cache disabled")
    CACHE_ENABLED = False


def get_netbox_device_by_ip(ip_address: str) -> dict:
    """
    Buscar device no NetBox por endereço IP.
    Usa cache Redis para reduzir chamadas à API.
    """
    cache_key = f"netbox:ip:{ip_address}"

    # Tentar cache primeiro
    if CACHE_ENABLED:
        cached = redis_client.get(cache_key)
        if cached:
            logger.info(f"Cache HIT for {ip_address}")
            return json.loads(cached)

    # Query NetBox API
    logger.info(f"Querying NetBox for IP: {ip_address}")
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
            logger.warning(f"IP {ip_address} not found in NetBox")
            return None

        ip_obj = ip_data['results'][0]
        device_id = ip_obj.get('assigned_object', {}).get('device', {}).get('id')

        if not device_id:
            logger.warning(f"IP {ip_address} not assigned to a device")
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

        # 4. Extrair custom fields
        custom_fields = device.get('custom_fields', {})
        enriched_data['criticality'] = custom_fields.get('criticality', 'medium')
        enriched_data['owner_team'] = custom_fields.get('owner_team')
        enriched_data['sla_tier'] = custom_fields.get('sla_tier')
        enriched_data['warranty_end'] = custom_fields.get('warranty_end')

        # Cache resultado
        if CACHE_ENABLED:
            redis_client.setex(cache_key, CACHE_TTL, json.dumps(enriched_data))
            logger.info(f"Cached data for {ip_address}")

        return enriched_data

    except requests.exceptions.RequestException as e:
        logger.error(f"NetBox API error for {ip_address}: {e}")
        return None


def get_netbox_device_by_hostname(hostname: str) -> dict:
    """
    Buscar device no NetBox por nome/hostname.
    """
    cache_key = f"netbox:hostname:{hostname}"

    # Tentar cache
    if CACHE_ENABLED:
        cached = redis_client.get(cache_key)
        if cached:
            logger.info(f"Cache HIT for hostname {hostname}")
            return json.loads(cached)

    # Query NetBox API
    logger.info(f"Querying NetBox for hostname: {hostname}")
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
            logger.warning(f"Hostname {hostname} not found in NetBox")
            return None

        device = device_data['results'][0]

        # Reutilizar mesma lógica de enrichment
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
        logger.error(f"NetBox API error for hostname {hostname}: {e}")
        return None


def extract_identifiers_from_alert(alert_json: dict) -> tuple:
    """
    Extrair IP e/ou hostname do alerta Wazuh.
    """
    ip_address = None
    hostname = None

    # Tentar extrair de diferentes campos
    data = alert_json.get('data', {})
    agent = alert_json.get('agent', {})

    # IP do srcip/dstip
    ip_address = data.get('srcip') or data.get('dstip') or agent.get('ip')

    # Hostname do agent
    hostname = agent.get('name')

    return ip_address, hostname


def enrich_alert(alert_json: dict) -> dict:
    """
    Enriquecer alerta com dados do NetBox.
    """
    ip_address, hostname = extract_identifiers_from_alert(alert_json)

    netbox_data = None

    # Tentar por IP primeiro
    if ip_address and ip_address not in ['any', '0.0.0.0', '127.0.0.1']:
        netbox_data = get_netbox_device_by_ip(ip_address)

    # Fallback para hostname
    if not netbox_data and hostname:
        netbox_data = get_netbox_device_by_hostname(hostname)

    # Adicionar ao alerta
    if netbox_data:
        alert_json['netbox'] = netbox_data
        logger.info(f"Alert enriched with NetBox data: {netbox_data.get('device_name')}")
    else:
        logger.info(f"No NetBox data found for IP={ip_address}, hostname={hostname}")

    return alert_json


def main():
    """
    Ponto de entrada. Wazuh passa o alerta via stdin.
    """
    try:
        # Ler alerta do stdin (formato Wazuh integration)
        input_str = sys.stdin.read()
        alert_json = json.loads(input_str)

        # Enriquecer
        enriched_alert = enrich_alert(alert_json)

        # Output para stdout (Wazuh irá logar)
        print(json.dumps(enriched_alert, indent=2))

        logger.info("Alert enrichment completed successfully")
        sys.exit(0)

    except Exception as e:
        logger.error(f"Error in main: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
```

### 2. Configuração da Integração no Wazuh

**Arquivo: `/var/ossec/etc/ossec.conf`**

```xml
<ossec_config>
  <integration>
    <name>custom-netbox-enrichment</name>
    <hook_url>/var/ossec/integrations/custom-netbox-enrichment.py</hook_url>
    <level>3</level>
    <alert_format>json</alert_format>
    <!-- Filtrar apenas alertas relevantes -->
    <rule_id>5710,5712,5551,5402</rule_id>  <!-- SSH, auth failures, etc -->
  </integration>
</ossec_config>
```

**Variáveis de ambiente (systemd override):**

```bash
# /etc/systemd/system/wazuh-manager.service.d/override.conf
[Service]
Environment="NETBOX_URL=https://netbox.example.com"
Environment="NETBOX_TOKEN=seu-token-aqui"
Environment="REDIS_HOST=localhost"
Environment="REDIS_PORT=6379"
Environment="CACHE_TTL=1800"
```

### 3. Permissões e Deploy

```bash
# Copiar script
sudo cp custom-netbox-enrichment.py /var/ossec/integrations/
sudo chmod 750 /var/ossec/integrations/custom-netbox-enrichment.py
sudo chown root:wazuh /var/ossec/integrations/custom-netbox-enrichment.py

# Instalar dependências Python
sudo /var/ossec/framework/python/bin/pip3 install requests redis

# Reiniciar Wazuh
sudo systemctl restart wazuh-manager
```

## Customização de Rules para Alertas Enriquecidos

### Rule para Elevar Prioridade de Assets Críticos

```xml
<!-- /var/ossec/etc/rules/local_rules.xml -->
<group name="netbox,enrichment">

  <!-- Elevar prioridade se asset é crítico -->
  <rule id="100100" level="10">
    <if_sid>5710,5712</if_sid>  <!-- SSH brute force -->
    <match>criticality": "critical"</match>
    <description>SSH brute force on CRITICAL asset (NetBox): $(netbox.device_name) - Site: $(netbox.site)</description>
    <group>authentication_failures,pci_dss_10.2.4,pci_dss_10.2.5,gdpr_IV_35.7.d,gdpr_IV_32.2,hipaa_164.312.b,nist_800_53_AU.14,nist_800_53_AC.7,tsc_CC6.1,tsc_CC6.8,tsc_CC7.2,tsc_CC7.3,</group>
  </rule>

  <!-- Alertar sobre mudanças em produção -->
  <rule id="100101" level="8">
    <if_sid>550</if_sid>  <!-- Integrity check -->
    <match>"production"</match>
    <description>File integrity change on PRODUCTION asset: $(netbox.device_name)</description>
    <group>file_integrity,pci_dss_11.5,gpg13_4.11,gdpr_II_5.1.f,hipaa_164.312.c.1,nist_800_53_SI.7,tsc_PI1.4,tsc_PI1.5,tsc_CC6.1,tsc_CC6.8,tsc_CC7.2,tsc_CC7.3,</group>
  </rule>

  <!-- Alertar sobre tentativas de acesso em horário não comercial -->
  <rule id="100102" level="7">
    <if_sid>5710</if_sid>
    <match>"sla_tier": "1"</match>
    <time>8 pm - 6 am</time>
    <description>Off-hours authentication on SLA Tier 1 asset: $(netbox.device_name)</description>
  </rule>

</group>
```

## Cache Redis para Performance

### Configuração Redis

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

### Monitorar Cache

```bash
# Estatísticas do cache
redis-cli INFO stats | grep keyspace_hits

# Listar keys
redis-cli KEYS "netbox:*"

# Ver conteúdo de um asset
redis-cli GET "netbox:ip:10.20.30.40"

# Flush cache (forçar re-query)
redis-cli FLUSHDB
```

## Custom Fields Necessários no NetBox

```python
# Script para criar custom fields necessários
import pynetbox

nb = pynetbox.api('https://netbox.example.com', token='seu-token')

custom_fields = [
    {
        'name': 'criticality',
        'label': 'Business Criticality',
        'type': 'select',
        'content_types': ['dcim.device'],
        'required': True,
        'choices': ['low', 'medium', 'high', 'critical'],
        'default': 'medium',
        'description': 'Used by Wazuh for alert prioritization'
    },
    {
        'name': 'owner_team',
        'label': 'Owner Team',
        'type': 'text',
        'content_types': ['dcim.device'],
        'required': False,
        'description': 'Team responsible for this asset (e.g., "DBA Team", "DevOps")'
    },
    {
        'name': 'sla_tier',
        'label': 'SLA Tier',
        'type': 'select',
        'content_types': ['dcim.device'],
        'required': False,
        'choices': ['1', '2', '3', '4'],
        'default': '3',
        'description': 'Service Level Agreement tier (1=highest)'
    },
    {
        'name': 'security_zone',
        'label': 'Security Zone',
        'type': 'select',
        'content_types': ['dcim.device'],
        'choices': ['dmz', 'internal', 'management', 'external'],
        'description': 'Network security zone for firewall rules'
    },
]

for cf_data in custom_fields:
    try:
        cf = nb.extras.custom_fields.create(**cf_data)
        print(f"Created: {cf.name}")
    except Exception as e:
        print(f"Error: {e}")
```

## Exemplos de Alertas Enriquecidos

### Antes (Alert padrão Wazuh)

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

### Depois (Com NetBox enrichment)

```json
{
  "timestamp": "2025-12-05T14:30:00.000Z",
  "rule": {
    "level": 10,
    "description": "SSH brute force on CRITICAL asset (NetBox): srv-db-prod-01 - Site: Datacenter São Paulo",
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

### Visualizações Sugeridas

**1. Alertas por Criticidade**

```json
{
  "title": "Alerts by Asset Criticality",
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

**2. Top Assets com Mais Alertas**

```json
{
  "title": "Top 10 Assets by Alert Count",
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
  "title": "Security Alerts by Site",
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

### Script não está sendo executado

```bash
# Verificar logs
tail -f /var/ossec/logs/integrations.log

# Testar manualmente
echo '{"agent":{"ip":"10.20.30.40","name":"test"},"rule":{"id":"5710","level":5}}' | \
  sudo -u wazuh /var/ossec/integrations/custom-netbox-enrichment.py

# Verificar permissões
ls -la /var/ossec/integrations/custom-netbox-enrichment.py
```

### NetBox API retornando erro 401

```bash
# Testar token diretamente
curl -H "Authorization: Token seu-token" \
  https://netbox.example.com/api/dcim/devices/?limit=1

# Verificar se variável de ambiente está setada
sudo systemctl show wazuh-manager | grep NETBOX_TOKEN
```

### Cache não está funcionando

```bash
# Testar conexão Redis
redis-cli ping

# Verificar se Python consegue conectar
python3 -c "import redis; r=redis.Redis(); print(r.ping())"

# Ver se há keys sendo criadas
watch -n 1 'redis-cli DBSIZE'
```

### Performance degradada

```python
# Ajustar TTL do cache
# Reduzir de 30min para 5min se dados mudam frequentemente
CACHE_TTL = 300

# Aumentar para 2h se dados são estáveis
CACHE_TTL = 7200

# Monitorar latência da API NetBox
import time
start = time.time()
response = requests.get(f"{NETBOX_URL}/api/dcim/devices/123/", headers=headers)
print(f"NetBox API latency: {time.time() - start:.2f}s")
```

## Próximos Passos

- [ ] Implementar enrichment para virtual machines (VMware/Proxmox)
- [ ] Adicionar geolocalização de IPs externos com GeoIP
- [ ] Integrar com CMDB adicional (ServiceNow, iTop)
- [ ] Criar dashboard dedicado para alertas enriquecidos
- [ ] Implementar auto-response baseado em criticidade
- [ ] Webhook inverso: alertar NetBox sobre devices comprometidos
- [ ] Machine learning para detectar anomalias em assets críticos
