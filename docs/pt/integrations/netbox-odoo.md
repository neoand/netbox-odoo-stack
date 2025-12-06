# Integração NetBox ↔ Odoo

> **AI Context**: Este documento descreve a integração bidirecional entre NetBox (CMDB/IPAM) e Odoo 19 Community + OCA, sincronizando inventário técnico com gestão de ativos, manutenção e helpdesk. Inclui webhooks, APIs REST/FastAPI, e código Python funcional.

## Objetivo

- Manter **inventário técnico** (NetBox) alinhado ao **inventário financeiro/operacional** (Odoo)
- Sincronizar devices → maintenance.equipment para gestão de ativos
- Automatizar criação de ordens de manutenção baseadas em mudanças de status
- Enriquecer tickets de helpdesk com contexto técnico do NetBox

## Arquitetura da Integração

```
┌─────────────────────────────────────────────────────────────────┐
│                       NetBox (CMDB/IPAM)                        │
│  - Devices (switches, servers, firewalls)                       │
│  - Sites, Racks, Locations                                      │
│  - Interfaces, IPs, VLANs                                       │
│  - Custom Fields (warranty_end, owner_team, criticality)       │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
         [Webhook]                      [REST API]
               │                              │
               ▼                              ▼
     ┌─────────────────┐           ┌─────────────────┐
     │  Integration    │◄─────────►│   Odoo FastAPI  │
     │  Worker (n8n/   │   sync    │   (rest-frame-  │
     │  Shuffle/Python)│           │    work OCA)    │
     └────────┬────────┘           └────────┬────────┘
              │                             │
              └──────────┬──────────────────┘
                         ▼
              ┌──────────────────────┐
              │   Odoo 19 Community   │
              │  + OCA Modules        │
              │  - maintenance        │
              │  - helpdesk_mgmt      │
              │  - queue_job          │
              └──────────────────────┘
```

## Mapeamento de Dados

> **AI Context**: Tabela de correspondência entre entidades do NetBox e modelos do Odoo 19, com campos críticos para sincronização.

| NetBox Entity | Odoo Model | Campos Mapeados | Direção |
|---------------|------------|-----------------|---------|
| **Device** | `maintenance.equipment` | name, serial_number, location, status | NetBox → Odoo |
| Device.custom_fields | equipment custom fields | warranty_end, purchase_date, cost_center | NetBox → Odoo |
| Device.status | equipment.maintenance_state | active/offline → normal/maintenance | Bidirecional |
| **Site** | `stock.location` ou tag | name, physical_address | NetBox → Odoo |
| **Rack** | `stock.location` (child) | name, site_id | NetBox → Odoo |
| **Interface** | Custom field em equipment | name, mac_address, ip_addresses | NetBox → Odoo |
| **Maintenance Request** | `maintenance.request` | equipment_id, description, priority | Odoo → NetBox |
| **IP Address** | Custom field em equipment | address, dns_name, vrf | NetBox → Odoo |
| **Device Tags** | `equipment.category_id` tags | environment (prod/dev), criticality | NetBox → Odoo |

## Módulos OCA Necessários

### 1. base_rest / fastapi (REST Framework)

```bash
# Instalar dependências
pip install fastapi pydantic pynetbox

# Instalar módulos OCA
docker exec -it odoo19 odoo -d odoo -i base_rest,base_rest_demo --stop-after-init
# OU
docker exec -it odoo19 odoo -d odoo -i fastapi --stop-after-init
```

**Configuração FastAPI endpoint:**

```python
# addons/custom_netbox_sync/controllers/netbox_webhook.py
from odoo.addons.fastapi import routing
from pydantic import BaseModel
from typing import Optional
import logging

_logger = logging.getLogger(__name__)

class NetBoxWebhookPayload(BaseModel):
    event: str  # created, updated, deleted
    model: str  # dcim.device, ipam.ipaddress
    data: dict
    timestamp: str
    username: str

@routing.post("/netbox/webhook")
async def receive_netbox_webhook(payload: NetBoxWebhookPayload, env: "Env"):
    """
    Endpoint para receber webhooks do NetBox.
    URL: https://odoo.example.com/fastapi/netbox/webhook
    """
    _logger.info(f"NetBox webhook received: {payload.event} on {payload.model}")

    # Processar via queue_job para não bloquear webhook
    if payload.model == "dcim.device":
        env["maintenance.equipment"].with_delay().sync_from_netbox(payload.data)

    return {"status": "accepted", "job_queued": True}
```

### 2. queue_job (Processamento Assíncrono)

```bash
docker exec -it odoo19 odoo -d odoo -i queue_job --stop-after-init
```

**Configuração:**

```python
# addons/custom_netbox_sync/models/maintenance_equipment.py
from odoo import models, fields, api
from odoo.addons.queue_job.job import job
import pynetbox
import logging

_logger = logging.getLogger(__name__)

class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    netbox_id = fields.Integer(string="NetBox Device ID", index=True)
    netbox_url = fields.Char(compute="_compute_netbox_url")
    netbox_status = fields.Selection([
        ('active', 'Active'),
        ('offline', 'Offline'),
        ('planned', 'Planned'),
        ('staged', 'Staged'),
        ('failed', 'Failed'),
        ('decommissioning', 'Decommissioning'),
    ], string="NetBox Status")

    # Custom fields mapeados do NetBox
    asset_tag = fields.Char(string="Asset Tag")
    rack_location = fields.Char(string="Rack Location")
    primary_ip = fields.Char(string="Primary IP")
    management_ip = fields.Char(string="Management IP")
    warranty_end = fields.Date(string="Warranty End Date")
    criticality = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], string="Criticality")

    @api.depends('netbox_id')
    def _compute_netbox_url(self):
        netbox_base_url = self.env['ir.config_parameter'].sudo().get_param('netbox.base_url')
        for record in self:
            if record.netbox_id and netbox_base_url:
                record.netbox_url = f"{netbox_base_url}/dcim/devices/{record.netbox_id}/"
            else:
                record.netbox_url = False

    @job
    def sync_from_netbox(self, device_data: dict):
        """
        Job assíncrono para sincronizar device do NetBox.
        device_data: payload do webhook NetBox
        """
        netbox_id = device_data.get('id')
        equipment = self.search([('netbox_id', '=', netbox_id)], limit=1)

        values = {
            'name': device_data.get('name'),
            'serial_no': device_data.get('serial'),
            'netbox_id': netbox_id,
            'netbox_status': device_data.get('status', {}).get('value'),
            'asset_tag': device_data.get('asset_tag'),
            'primary_ip': device_data.get('primary_ip4', {}).get('address') if device_data.get('primary_ip4') else None,
        }

        # Mapear custom fields
        custom_fields = device_data.get('custom_fields', {})
        if custom_fields.get('warranty_end'):
            values['warranty_end'] = custom_fields['warranty_end']
        if custom_fields.get('criticality'):
            values['criticality'] = custom_fields['criticality']

        # Mapear status para maintenance_state
        status_map = {
            'active': 'normal',
            'offline': 'maintenance',
            'failed': 'failure',
        }
        values['maintenance_state'] = status_map.get(device_data.get('status', {}).get('value'), 'normal')

        if equipment:
            equipment.write(values)
            _logger.info(f"Updated equipment {equipment.name} from NetBox")
        else:
            equipment = self.create(values)
            _logger.info(f"Created equipment {equipment.name} from NetBox")

        return equipment.id

    @job
    def sync_to_netbox(self):
        """
        Sincronizar mudanças do Odoo de volta para o NetBox.
        """
        netbox_url = self.env['ir.config_parameter'].sudo().get_param('netbox.url')
        netbox_token = self.env['ir.config_parameter'].sudo().get_param('netbox.token')

        if not all([netbox_url, netbox_token, self.netbox_id]):
            _logger.warning("NetBox sync failed: missing config or netbox_id")
            return False

        nb = pynetbox.api(netbox_url, token=netbox_token)
        device = nb.dcim.devices.get(self.netbox_id)

        if not device:
            _logger.error(f"Device {self.netbox_id} not found in NetBox")
            return False

        # Atualizar campos permitidos
        update_fields = {}

        # Mapear maintenance_state de volta para status NetBox
        state_to_status = {
            'normal': 'active',
            'maintenance': 'offline',
            'failure': 'failed',
        }
        if self.maintenance_state in state_to_status:
            update_fields['status'] = state_to_status[self.maintenance_state]

        # Atualizar custom fields
        if self.warranty_end:
            update_fields['custom_fields'] = update_fields.get('custom_fields', {})
            update_fields['custom_fields']['warranty_end'] = self.warranty_end.isoformat()

        device.update(update_fields)
        _logger.info(f"Synced equipment {self.name} to NetBox device {self.netbox_id}")
        return True
```

### 3. maintenance (Gestão de Equipamentos)

Módulo nativo do Odoo 19 Community, já incluído. Modelos principais:

- `maintenance.equipment`: Equipamentos/Ativos
- `maintenance.request`: Solicitações de manutenção
- `maintenance.team`: Times de manutenção

## Webhooks NetBox → Odoo

### Configuração no NetBox

**Passo 1: Criar Webhook via UI**

```
NetBox Admin → System → Webhooks → Add
```

- **Name**: `Odoo Equipment Sync`
- **Enabled**: ✓
- **Events**: `Creations`, `Updates`, `Deletions`
- **URL**: `https://odoo.example.com/fastapi/netbox/webhook`
- **HTTP Method**: `POST`
- **HTTP Content Type**: `application/json`
- **Secret**: `seu-secret-compartilhado`
- **SSL Verification**: ✓ (production)
- **Object Types**: `dcim > device`

**Passo 2: Configurar via API (Automação)**

```python
import pynetbox
import os

NETBOX_URL = os.getenv('NETBOX_URL', 'https://netbox.example.com')
NETBOX_TOKEN = os.getenv('NETBOX_TOKEN')
ODOO_WEBHOOK_URL = os.getenv('ODOO_WEBHOOK_URL', 'https://odoo.example.com/fastapi/netbox/webhook')
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET')

nb = pynetbox.api(NETBOX_URL, token=NETBOX_TOKEN)

# Criar webhook
webhook_data = {
    'name': 'Odoo Equipment Sync',
    'enabled': True,
    'type_create': True,
    'type_update': True,
    'type_delete': True,
    'payload_url': ODOO_WEBHOOK_URL,
    'http_method': 'POST',
    'http_content_type': 'application/json',
    'secret': WEBHOOK_SECRET,
    'ssl_verification': True,
}

webhook = nb.extras.webhooks.create(**webhook_data)
print(f"Webhook created: {webhook.id}")

# Associar ao content type dcim.device
from pynetbox.core.query import ContentTypes
content_types = nb.extras.content_types.filter(model='device')
device_ct = [ct for ct in content_types if ct.app_label == 'dcim'][0]

webhook.content_types = [device_ct.id]
webhook.save()
print(f"Webhook configured for dcim.device")
```

### Validação de Webhook (Segurança)

```python
# addons/custom_netbox_sync/controllers/netbox_webhook.py
import hmac
import hashlib
from fastapi import Header, HTTPException

def verify_netbox_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verificar assinatura HMAC do webhook NetBox.
    """
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha512
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)

@routing.post("/netbox/webhook")
async def receive_netbox_webhook(
    payload: NetBoxWebhookPayload,
    env: "Env",
    x_hook_signature: str = Header(None)
):
    webhook_secret = env['ir.config_parameter'].sudo().get_param('netbox.webhook_secret')

    if webhook_secret and x_hook_signature:
        import json
        payload_bytes = json.dumps(payload.dict()).encode('utf-8')
        if not verify_netbox_signature(payload_bytes, x_hook_signature, webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid signature")

    # Processar webhook...
    if payload.model == "dcim.device":
        env["maintenance.equipment"].with_delay().sync_from_netbox(payload.data)

    return {"status": "accepted"}
```

## Webhooks Odoo → NetBox

### Trigger em Mudanças de Estado

```python
# addons/custom_netbox_sync/models/maintenance_equipment.py

class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    def write(self, vals):
        res = super().write(vals)

        # Disparar sync para NetBox quando campos relevantes mudarem
        sync_fields = ['maintenance_state', 'warranty_end', 'location_id', 'criticality']
        if any(field in vals for field in sync_fields):
            for record in self:
                if record.netbox_id:
                    record.with_delay().sync_to_netbox()

        return res

    @api.model
    def create(self, vals):
        equipment = super().create(vals)

        # Se foi criado manualmente no Odoo, criar no NetBox também
        if not equipment.netbox_id and vals.get('create_in_netbox'):
            equipment.with_delay().create_in_netbox()

        return equipment
```

## Sincronização Bidirecional

### Job de Reconciliação (Nightly)

```python
# addons/custom_netbox_sync/models/netbox_sync_job.py
from odoo import models, api
from odoo.addons.queue_job.job import job
import pynetbox
import logging

_logger = logging.getLogger(__name__)

class NetBoxSyncJob(models.TransientModel):
    _name = 'netbox.sync.job'
    _description = 'NetBox Reconciliation Job'

    @api.model
    @job
    def reconcile_devices(self):
        """
        Job de reconciliação completa NetBox ↔ Odoo.
        Executar nightly via cron.
        """
        netbox_url = self.env['ir.config_parameter'].sudo().get_param('netbox.url')
        netbox_token = self.env['ir.config_parameter'].sudo().get_param('netbox.token')

        nb = pynetbox.api(netbox_url, token=netbox_token)

        # 1. Buscar todos devices ativos no NetBox
        netbox_devices = nb.dcim.devices.filter(status='active')
        netbox_ids = {device.id: device for device in netbox_devices}

        # 2. Buscar todos equipments com netbox_id no Odoo
        odoo_equipments = self.env['maintenance.equipment'].search([
            ('netbox_id', '!=', False)
        ])
        odoo_netbox_ids = {eq.netbox_id: eq for eq in odoo_equipments}

        # 3. Identificar divergências
        stats = {
            'in_netbox_only': [],
            'in_odoo_only': [],
            'conflicts': [],
            'synced': 0
        }

        # Devices no NetBox que não estão no Odoo
        for nb_id in set(netbox_ids.keys()) - set(odoo_netbox_ids.keys()):
            stats['in_netbox_only'].append(nb_id)
            # Criar no Odoo
            device = netbox_ids[nb_id]
            self.env['maintenance.equipment'].sync_from_netbox(dict(device))
            stats['synced'] += 1

        # Equipments no Odoo que não existem mais no NetBox
        for nb_id in set(odoo_netbox_ids.keys()) - set(netbox_ids.keys()):
            stats['in_odoo_only'].append(nb_id)
            equipment = odoo_netbox_ids[nb_id]
            # Política: manter no Odoo mas marcar como inativo
            equipment.write({'active': False})

        # Comparar campos para detectar conflicts
        for nb_id in set(netbox_ids.keys()) & set(odoo_netbox_ids.keys()):
            device = netbox_ids[nb_id]
            equipment = odoo_netbox_ids[nb_id]

            # Verificar se serial numbers divergem
            if device.serial != equipment.serial_no:
                stats['conflicts'].append({
                    'netbox_id': nb_id,
                    'field': 'serial',
                    'netbox_value': device.serial,
                    'odoo_value': equipment.serial_no
                })
                # Política: NetBox vence
                equipment.write({'serial_no': device.serial})

        _logger.info(f"Reconciliation complete: {stats}")

        # Criar relatório
        self._create_reconciliation_report(stats)

        return stats

    def _create_reconciliation_report(self, stats):
        """
        Criar ticket/log com resultados da reconciliação.
        """
        # Criar ticket no helpdesk se houver conflitos
        if stats['conflicts']:
            self.env['helpdesk.ticket'].create({
                'name': f"NetBox Sync Conflicts - {len(stats['conflicts'])} items",
                'description': f"Conflicts detected:\n{stats['conflicts']}",
                'team_id': self.env.ref('helpdesk_mgmt.team_it').id,
                'priority': '2',
            })
```

**Configurar Cron:**

```xml
<!-- addons/custom_netbox_sync/data/cron.xml -->
<odoo>
    <data noupdate="1">
        <record id="cron_netbox_reconcile" model="ir.cron">
            <field name="name">NetBox: Reconcile Devices</field>
            <field name="model_id" ref="model_netbox_sync_job"/>
            <field name="state">code</field>
            <field name="code">model.reconcile_devices()</field>
            <field name="interval_number">1</field>
            <field name="interval_type">days</field>
            <field name="numbercall">-1</field>
            <field name="active" eval="True"/>
            <field name="doall" eval="False"/>
            <field name="nextcall" eval="(DateTime.now() + timedelta(days=1)).replace(hour=2, minute=0)"/>
        </record>
    </data>
</odoo>
```

## Custom Fields Mapping

### NetBox Custom Fields

```python
# Script para criar custom fields no NetBox via API
import pynetbox

nb = pynetbox.api('https://netbox.example.com', token='seu-token')

custom_fields = [
    {
        'name': 'warranty_end',
        'label': 'Warranty End Date',
        'type': 'date',
        'content_types': ['dcim.device'],
        'required': False,
        'description': 'End date of warranty (synced with Odoo)'
    },
    {
        'name': 'odoo_equipment_id',
        'label': 'Odoo Equipment ID',
        'type': 'integer',
        'content_types': ['dcim.device'],
        'required': False,
        'description': 'Link to Odoo maintenance.equipment'
    },
    {
        'name': 'criticality',
        'label': 'Business Criticality',
        'type': 'select',
        'content_types': ['dcim.device'],
        'required': True,
        'choices': ['low', 'medium', 'high', 'critical'],
        'default': 'medium'
    },
    {
        'name': 'cost_center',
        'label': 'Cost Center',
        'type': 'text',
        'content_types': ['dcim.device'],
        'required': False
    },
]

for cf_data in custom_fields:
    try:
        cf = nb.extras.custom_fields.create(**cf_data)
        print(f"Created custom field: {cf.name}")
    except Exception as e:
        print(f"Error creating {cf_data['name']}: {e}")
```

### Odoo Custom Fields

```xml
<!-- addons/custom_netbox_sync/data/custom_fields.xml -->
<odoo>
    <data>
        <!-- Custom fields em maintenance.equipment -->
        <record id="field_equipment_netbox_id" model="ir.model.fields">
            <field name="name">x_netbox_id</field>
            <field name="field_description">NetBox Device ID</field>
            <field name="model_id" ref="maintenance.model_maintenance_equipment"/>
            <field name="ttype">integer</field>
            <field name="index">True</field>
        </record>

        <record id="field_equipment_criticality" model="ir.model.fields">
            <field name="name">x_criticality</field>
            <field name="field_description">Criticality</field>
            <field name="model_id" ref="maintenance.model_maintenance_equipment"/>
            <field name="ttype">selection</field>
            <field name="selection">[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')]</field>
        </record>

        <record id="field_equipment_primary_ip" model="ir.model.fields">
            <field name="name">x_primary_ip</field>
            <field name="field_description">Primary IP</field>
            <field name="model_id" ref="maintenance.model_maintenance_equipment"/>
            <field name="ttype">char</field>
        </record>
    </data>
</odoo>
```

## Troubleshooting

### Webhook não está chegando

```bash
# Verificar logs do NetBox
docker logs netbox | grep webhook

# Testar conectividade
curl -X POST https://odoo.example.com/fastapi/netbox/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"test","model":"dcim.device","data":{},"timestamp":"2025-12-05T10:00:00Z","username":"test"}'

# Verificar no Odoo se endpoint está registrado
docker exec -it odoo19 odoo shell -d odoo
>>> env['ir.http']._get_fastapi_routers()
```

### Jobs não estão sendo processados

```python
# No Odoo shell
docker exec -it odoo19 odoo shell -d odoo

# Verificar queue_job
>>> env['queue.job'].search([('state', '=', 'failed')])
>>> job = env['queue.job'].search([('state', '=', 'failed')], limit=1)
>>> print(job.exc_info)  # Ver erro

# Reprocessar job
>>> job.requeue()

# Verificar workers rodando
>>> env['queue.job'].search([('state', '=', 'started')])
```

### Conflitos de sincronização

```python
# Forçar sync de um device específico
device_id = 123
nb = pynetbox.api('https://netbox.example.com', token='seu-token')
device = nb.dcim.devices.get(device_id)

# No Odoo
equipment = env['maintenance.equipment'].search([('netbox_id', '=', device_id)])
equipment.sync_from_netbox(dict(device))

# Reverter - sync Odoo → NetBox
equipment.sync_to_netbox()
```

### Performance de reconciliação

```python
# Otimizar query com filtros
netbox_devices = nb.dcim.devices.filter(
    status='active',
    site='datacenter-sp',
    role='server'
)

# Batch create no Odoo
equipment_vals = []
for device in netbox_devices:
    equipment_vals.append({
        'name': device.name,
        'netbox_id': device.id,
        # ...
    })

env['maintenance.equipment'].create(equipment_vals)
```

## Próximos Passos

- [ ] Implementar módulo custom `netbox_sync` completo
- [ ] Adicionar suporte a IP addresses e interfaces
- [ ] Sincronizar racks com stock.location hierarchy
- [ ] Dashboard de status da sincronização
- [ ] Alertas de divergências via email/Slack
- [ ] Documentar integração com helpdesk_mgmt (enriquecer tickets)
- [ ] Implementar soft-delete em vez de arquivar equipments
