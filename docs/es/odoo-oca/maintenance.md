# Módulos OCA Maintenance

> **AI Context**: Documentación completa de los módulos de mantenimiento de OCA para Odoo 19, incluyendo planos de mantenimiento, hierarquia de equipos e integração com stock. Estos módulos transforman o Odoo en un CMMS (Computerized Maintenance Management System) completo, integrado com NetBox (CMDB) e Wazuh (SIEM) en NEO_NETBOX_ODOO_STACK. Referencia para gestión de activos de TI, mantenimiento preventiva e correctiva.

## Visión General

Los módulos **Maintenance OCA** transforman o Odoo 19 en un **CMMS completo** para gestión de equipos e mantenimiento.

### Módulos Incluidos

| Módulo | Versión | Función | Status |
|--------|--------|--------|--------|
| maintenance_plan | 19.0.1.0.0 | Planos de mantenimiento preventiva | Activo |
| maintenance_equipment_hierarchy | 19.0.1.0.0 | Hierarquia de equipos | Activo |
| maintenance_stock | 19.0.1.0.0 | Integração com stock | Activo |
| maintenance_team | 19.0.1.0.0 | Equipes de mantenimiento | Activo |

## Arquitectura

```
┌────────────────────────────────────────────────────────┐
│           CMMS - Maintenance Management                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────┐         ┌────────────┐               │
│  │  NetBox    │────────►│ Equipment  │               │
│  │  (CMDB)    │  Sync   │ Inventory  │               │
│  └────────────┘         └─────┬──────┘               │
│                               │                       │
│  ┌────────────┐               │                       │
│  │  Wazuh     │───────────────┤                       │
│  │  Alerts    │  Auto-create  │                       │
│  └────────────┘               │                       │
│                               │                       │
│                    ┌──────────┼──────────┐           │
│                    │          │          │           │
│              ┌─────▼─────┐ ┌─▼────┐ ┌──▼─────┐     │
│              │Preventive │ │Stock │ │ Teams  │     │
│              │  Plans    │ │Parts │ │Workflow│     │
│              └─────┬─────┘ └─┬────┘ └──┬─────┘     │
│                    │          │          │           │
│              ┌─────▼──────────▼──────────▼─────┐    │
│              │    Maintenance Requests        │    │
│              │   (Corrective & Preventive)    │    │
│              └────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Instalación

### 1. Clonar el Repositorio

```bash
cd /opt/odoo/oca
git clone -b 19.0 https://github.com/OCA/maintenance.git
```

### 2. Instalación via Docker

```bash
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  -i maintenance_plan,maintenance_equipment_hierarchy,maintenance_stock,maintenance_team \
  --stop-after-init
```

## Configuración Inicial

### 1. Categorias de Equipamentos

```python
# Via código Python
from odoo import api, SUPERUSER_ID

env = api.Environment(cr, SUPERUSER_ID, {})

Category = env['maintenance.equipment.category']

categories = [
    {'name': 'Servidores', 'technician_user_id': env.ref('base.user_admin').id},
    {'name': 'Switches', 'technician_user_id': env.ref('base.user_admin').id},
    {'name': 'Roteadores', 'technician_user_id': env.ref('base.user_admin').id},
    {'name': 'Firewalls', 'technician_user_id': env.ref('base.user_admin').id},
    {'name': 'Access Points', 'technician_user_id': env.ref('base.user_admin').id},
    {'name': 'Desktops', 'technician_user_id': env.ref('base.user_admin').id},
    {'name': 'Notebooks', 'technician_user_id': env.ref('base.user_admin').id},
    {'name': 'Impressoras', 'technician_user_id': env.ref('base.user_admin').id},
    {'name': 'UPS/Nobreak', 'technician_user_id': env.ref('base.user_admin').id},
]

for cat_data in categories:
    Category.create(cat_data)

print(f"Created {len(categories)} categories")
```

### 2. Equipes de Manutenção

```python
# Crear equipes
Team = env['maintenance.team']

teams = [
    {'name': 'Infrastructure Team', 'color': 1},
    {'name': 'Network Team', 'color': 2},
    {'name': 'Security Team', 'color': 3},
    {'name': 'Support Team', 'color': 4},
]

for team_data in teams:
    Team.create(team_data)
```

## Módulo: maintenance_equipment_hierarchy

### Funcionalidades

- Hierarquia pai/filho de equipos
- Visualização em árvore
- Propagação de mantenimientos
- Relacionamentos complexos

### Crear Equipamentos com Hierarquia

```python
# Crear equipos com relação hierárquica
Equipment = env['maintenance.equipment']

# Equipamento pai: Rack
rack_datacenter_1 = Equipment.create({
    'name': 'Rack DC-01',
    'category_id': env.ref('maintenance.equipment_category_rack').id,
    'location': 'Datacenter Principal - Sala A',
    'serial_no': 'RACK-DC01-001',
})

# Equipamentos filhos: Servidores no rack
servers = [
    {
        'name': 'SRV-WEB-01',
        'category_id': Category.search([('name', '=', 'Servidores')]).id,
        'parent_id': rack_datacenter_1.id,
        'serial_no': 'DELL-R740-SN001',
        'model': 'Dell PowerEdge R740',
        'location': 'Rack DC-01 - U10-U12',
    },
    {
        'name': 'SRV-DB-01',
        'category_id': Category.search([('name', '=', 'Servidores')]).id,
        'parent_id': rack_datacenter_1.id,
        'serial_no': 'DELL-R740-SN002',
        'model': 'Dell PowerEdge R740',
        'location': 'Rack DC-01 - U13-U15',
    },
    {
        'name': 'SRV-APP-01',
        'category_id': Category.search([('name', '=', 'Servidores')]).id,
        'parent_id': rack_datacenter_1.id,
        'serial_no': 'HP-DL380-SN001',
        'model': 'HP ProLiant DL380',
        'location': 'Rack DC-01 - U16-U18',
    },
]

for server_data in servers:
    Equipment.create(server_data)

# Switch no rack
switch_core = Equipment.create({
    'name': 'SW-CORE-01',
    'category_id': Category.search([('name', '=', 'Switches')]).id,
    'parent_id': rack_datacenter_1.id,
    'serial_no': 'CISCO-C9300-SN001',
    'model': 'Cisco Catalyst 9300',
    'location': 'Rack DC-01 - U20',
})

print(f"Created rack with {len(servers) + 1} child equipments")
```

### Hierarquia Complexa: Campus

```python
# Crear hierarquia complexa de campus
campus = Equipment.create({
    'name': 'Campus Sede',
    'category_id': env.ref('maintenance.equipment_category_building').id,
    'location': 'Av. Principal, 1000',
})

# Prédios
building_a = Equipment.create({
    'name': 'Prédio A',
    'parent_id': campus.id,
    'location': 'Campus Sede - Prédio A',
})

building_b = Equipment.create({
    'name': 'Prédio B',
    'parent_id': campus.id,
    'location': 'Campus Sede - Prédio B',
})

# Andares do Prédio A
for floor in range(1, 6):
    floor_equipment = Equipment.create({
        'name': f'Prédio A - {floor}º Andar',
        'parent_id': building_a.id,
        'location': f'Campus Sede - Prédio A - {floor}º Andar',
    })

    # Access Points por andar
    for ap in range(1, 5):
        Equipment.create({
            'name': f'AP-A{floor}-{ap:02d}',
            'category_id': Category.search([('name', '=', 'Access Points')]).id,
            'parent_id': floor_equipment.id,
            'serial_no': f'AP-{floor}{ap:02d}',
            'model': 'Ubiquiti UniFi AP',
            'location': f'Prédio A - {floor}º Andar - Zona {ap}',
        })
```

## Módulo: maintenance_plan

### Funcionalidades

- Manutenções preventivas agendadas
- Recorrência customizável
- Geração automática de requests
- Templates de mantenimiento

### Crear Planos de Manutenção

```python
# Crear planos de mantenimiento preventiva
Plan = env['maintenance.plan']

# Plano 1: Limpeza mensal de servidores
plan_server_cleaning = Plan.create({
    'name': 'Limpeza Mensal - Servidores',
    'equipment_category_id': Category.search([('name', '=', 'Servidores')]).id,
    'interval': 1,
    'interval_type': 'month',
    'maintenance_kind_id': env.ref('maintenance.maintenance_kind_preventive').id,
    'duration': 2.0,  # 2 horas
    'note': """
        Procedimento de limpeza mensal:
        1. Desligar servidor (se possível)
        2. Remover poeira com ar comprimido
        3. Verificar ventoinhas
        4. Verificar temperatura
        5. Religar e testar
    """,
})

# Plano 2: Backup semanal de configurações
plan_config_backup = Plan.create({
    'name': 'Backup Configurações - Network',
    'equipment_category_id': Category.search([('name', '=', 'Switches')]).id,
    'interval': 1,
    'interval_type': 'week',
    'maintenance_kind_id': env.ref('maintenance.maintenance_kind_preventive').id,
    'duration': 0.5,
    'note': """
        Backup de configurações:
        1. Conectar via SSH
        2. Ejecutar: show running-config
        3. Guardar em repositório Git
        4. Verificar integridade
    """,
})

# Plano 3: Teste de UPS trimestral
plan_ups_test = Plan.create({
    'name': 'Teste de UPS - Trimestral',
    'equipment_category_id': Category.search([('name', '=', 'UPS/Nobreak')]).id,
    'interval': 3,
    'interval_type': 'month',
    'maintenance_kind_id': env.ref('maintenance.maintenance_kind_preventive').id,
    'duration': 1.0,
    'note': """
        Teste de UPS:
        1. Verificar nível de carga da bateria
        2. Simular queda de energia
        3. Medir tempo de autonomia
        4. Verificar alarmes
        5. Testar switchover
    """,
})

# Plano 4: Atualização de firmware semestral
plan_firmware_update = Plan.create({
    'name': 'Atualização Firmware - Switches',
    'equipment_category_id': Category.search([('name', '=', 'Switches')]).id,
    'interval': 6,
    'interval_type': 'month',
    'maintenance_kind_id': env.ref('maintenance.maintenance_kind_preventive').id,
    'duration': 3.0,
    'note': """
        Atualização de firmware:
        1. Backup da configuração atual
        2. Download do firmware mais recente
        3. Verificar release notes
        4. Agendar janela de mantenimiento
        5. Aplicar atualização
        6. Verificar funcionamento
        7. Documentar versão instalada
    """,
})
```

### Aplicar Plano a Equipamentos

```python
# Aplicar plano a equipo específico
equipment = Equipment.search([('name', '=', 'SRV-WEB-01')], limit=1)

equipment.write({
    'maintenance_plan_ids': [(4, plan_server_cleaning.id)]
})

# Aplicar plano a todos equipos de uma categoria
servers = Equipment.search([
    ('category_id', '=', Category.search([('name', '=', 'Servidores')]).id)
])

for server in servers:
    server.write({
        'maintenance_plan_ids': [(4, plan_server_cleaning.id)]
    })

print(f"Plan applied to {len(servers)} servers")
```

### Generar Manutenções Preventivas

```python
# Generar maintenance requests a partir dos planos
from odoo import models, fields, api

class MaintenancePlan(models.Model):
    _inherit = 'maintenance.plan'

    def _cron_generate_requests(self):
        """Cron job para gerar requests automaticamente"""
        plans = self.search([('active', '=', True)])

        for plan in plans:
            # Buscar equipos vinculados ao plano
            equipments = self.env['maintenance.equipment'].search([
                ('maintenance_plan_ids', 'in', [plan.id]),
                ('active', '=', True),
            ])

            for equipment in equipments:
                # Verificar se já existe request pendente
                existing = self.env['maintenance.request'].search([
                    ('equipment_id', '=', equipment.id),
                    ('maintenance_plan_id', '=', plan.id),
                    ('stage_id.done', '=', False),
                ], limit=1)

                if existing:
                    continue

                # Verificar se deve gerar (baseado em data da última mantenimiento)
                last_request = self.env['maintenance.request'].search([
                    ('equipment_id', '=', equipment.id),
                    ('maintenance_plan_id', '=', plan.id),
                    ('stage_id.done', '=', True),
                ], order='close_date desc', limit=1)

                should_generate = False
                if not last_request:
                    should_generate = True
                else:
                    # Calcular próxima data
                    from dateutil.relativedelta import relativedelta
                    next_date = last_request.close_date

                    if plan.interval_type == 'day':
                        next_date += relativedelta(days=plan.interval)
                    elif plan.interval_type == 'week':
                        next_date += relativedelta(weeks=plan.interval)
                    elif plan.interval_type == 'month':
                        next_date += relativedelta(months=plan.interval)
                    elif plan.interval_type == 'year':
                        next_date += relativedelta(years=plan.interval)

                    if fields.Date.today() >= next_date.date():
                        should_generate = True

                # Generar request
                if should_generate:
                    self.env['maintenance.request'].create({
                        'name': f"{plan.name} - {equipment.name}",
                        'equipment_id': equipment.id,
                        'maintenance_plan_id': plan.id,
                        'maintenance_type': 'preventive',
                        'schedule_date': fields.Datetime.now(),
                        'duration': plan.duration,
                        'description': plan.note,
                        'maintenance_team_id': equipment.maintenance_team_id.id,
                    })

                    equipment.message_post(
                        body=f"Preventive maintenance scheduled: {plan.name}"
                    )
```

## Módulo: maintenance_stock

### Funcionalidades

- Vincular piezas de repuesto a equipos
- Consumo de peças em mantenimientos
- Controle de custos
- Alertas de stock baixo

### Configurar Peças de Reposição

```python
# Vincular productos a equipos como piezas de repuesto
Product = env['product.product']

# Produto: HDD 2TB
hdd_2tb = Product.search([('default_code', '=', 'HDD-2TB-SATA')], limit=1)

# Vincular a servidores
servers = Equipment.search([
    ('category_id', '=', Category.search([('name', '=', 'Servidores')]).id)
])

for server in servers:
    server.write({
        'spare_part_ids': [(4, hdd_2tb.id)]
    })
```

### Consumir Peças em Manutenção

```python
# Model para consumo de peças
from odoo import models, fields, api

class MaintenanceRequest(models.Model):
    _inherit = 'maintenance.request'

    consumed_part_ids = fields.One2many(
        'maintenance.consumed.part',
        'request_id',
        'Consumed Parts'
    )
    total_parts_cost = fields.Float(
        'Total Parts Cost',
        compute='_compute_parts_cost',
        store=True
    )

    @api.depends('consumed_part_ids.total_cost')
    def _compute_parts_cost(self):
        for request in self:
            request.total_parts_cost = sum(
                request.consumed_part_ids.mapped('total_cost')
            )

    def action_consume_parts(self):
        """Consumir peças do stock"""
        self.ensure_one()

        if not self.consumed_part_ids:
            raise UserError('No parts to consume')

        # Localização de consumo (mantenimiento)
        maintenance_location = self.env.ref('stock.location_production')

        for part in self.consumed_part_ids:
            # Crear movimento de stock
            stock_move = self.env['stock.move'].create({
                'name': f"Consumption: {self.name}",
                'product_id': part.product_id.id,
                'product_uom_qty': part.quantity,
                'product_uom': part.product_id.uom_id.id,
                'location_id': part.source_location_id.id,
                'location_dest_id': maintenance_location.id,
                'origin': self.name,
            })

            stock_move._action_confirm()
            stock_move._action_assign()
            stock_move.move_line_ids.qty_done = part.quantity
            stock_move._action_done()

            # Marcar como consumido
            part.consumed = True

        self.message_post(
            body=f"Consumed {len(self.consumed_part_ids)} parts. Total cost: ${self.total_parts_cost:.2f}"
        )

        return True


class MaintenanceConsumedPart(models.Model):
    _name = 'maintenance.consumed.part'
    _description = 'Consumed Spare Part in Maintenance'

    request_id = fields.Many2one(
        'maintenance.request',
        'Maintenance Request',
        required=True,
        ondelete='cascade'
    )
    product_id = fields.Many2one(
        'product.product',
        'Product',
        required=True,
        domain=[('type', '=', 'product')]
    )
    source_location_id = fields.Many2one(
        'stock.location',
        'Source Location',
        required=True,
        domain=[('usage', '=', 'internal')]
    )
    quantity = fields.Float('Quantity', required=True, default=1.0)
    unit_cost = fields.Float('Unit Cost', related='product_id.standard_price')
    total_cost = fields.Float('Total Cost', compute='_compute_total_cost', store=True)
    consumed = fields.Boolean('Consumed', default=False)

    @api.depends('quantity', 'unit_cost')
    def _compute_total_cost(self):
        for part in self:
            part.total_cost = part.quantity * part.unit_cost

    @api.onchange('product_id')
    def _onchange_product_id(self):
        """Preencher automaticamente localização com maior stock"""
        if self.product_id:
            Quant = self.env['stock.quant']
            quants = Quant.search([
                ('product_id', '=', self.product_id.id),
                ('quantity', '>', 0),
            ], order='quantity desc', limit=1)

            if quants:
                self.source_location_id = quants[0].location_id
```

## Integração com NetBox

### Sincronizar Equipamentos do NetBox

```python
# Sincronização bidirecional com NetBox
import requests
import os

class NetboxMaintenanceSync(models.Model):
    _name = 'netbox.maintenance.sync'
    _description = 'NetBox Maintenance Synchronization'

    @api.model
    def sync_devices_from_netbox(self):
        """Sincronizar dispositivos do NetBox para Maintenance"""
        netbox_url = os.getenv('NETBOX_URL', 'http://netbox:8000')
        netbox_token = os.getenv('NETBOX_TOKEN')

        response = requests.get(
            f"{netbox_url}/api/dcim/devices/",
            headers={'Authorization': f'Token {netbox_token}'},
            params={'status': 'active', 'limit': 1000}
        )

        if response.status_code != 200:
            raise Exception(f"NetBox API error: {response.status_code}")

        devices = response.json()['results']

        Equipment = self.env['maintenance.equipment']
        Category = self.env['maintenance.equipment.category']

        created = 0
        updated = 0

        for device in devices:
            # Mapear device_role para categoria
            category_name = device['device_role']['name']
            category = Category.search([('name', '=', category_name)], limit=1)

            if not category:
                category = Category.create({'name': category_name})

            # Buscar equipo existente
            equipment = Equipment.search([
                ('netbox_id', '=', device['id'])
            ], limit=1)

            values = {
                'name': device['name'],
                'category_id': category.id,
                'location': device['site']['name'],
                'serial_no': device.get('serial', ''),
                'model': device['device_type']['model'],
                'netbox_id': device['id'],
                'netbox_url': f"{netbox_url}/dcim/devices/{device['id']}/",
            }

            if equipment:
                equipment.write(values)
                updated += 1
            else:
                Equipment.create(values)
                created += 1

        return {
            'status': 'success',
            'created': created,
            'updated': updated,
            'total': len(devices),
        }

    @api.model
    def push_maintenance_to_netbox(self, equipment_id):
        """Enviar datos de mantenimiento para custom field no NetBox"""
        equipment = self.env['maintenance.equipment'].browse(equipment_id)

        if not equipment.netbox_id:
            return {'status': 'error', 'message': 'No NetBox ID'}

        netbox_url = os.getenv('NETBOX_URL', 'http://netbox:8000')
        netbox_token = os.getenv('NETBOX_TOKEN')

        # Buscar última mantenimiento
        last_maintenance = self.env['maintenance.request'].search([
            ('equipment_id', '=', equipment.id),
            ('stage_id.done', '=', True),
        ], order='close_date desc', limit=1)

        # Próxima mantenimiento agendada
        next_maintenance = self.env['maintenance.request'].search([
            ('equipment_id', '=', equipment.id),
            ('maintenance_type', '=', 'preventive'),
            ('stage_id.done', '=', False),
        ], order='schedule_date asc', limit=1)

        custom_fields = {
            'last_maintenance': last_maintenance.close_date.isoformat() if last_maintenance else None,
            'next_maintenance': next_maintenance.schedule_date.isoformat() if next_maintenance else None,
            'maintenance_status': 'OK' if not next_maintenance else 'Scheduled',
        }

        # Actualizar NetBox
        response = requests.patch(
            f"{netbox_url}/api/dcim/devices/{equipment.netbox_id}/",
            headers={
                'Authorization': f'Token {netbox_token}',
                'Content-Type': 'application/json',
            },
            json={'custom_fields': custom_fields}
        )

        if response.status_code == 200:
            return {'status': 'success'}
        else:
            return {'status': 'error', 'message': response.text}
```

## Integração com Wazuh

### Crear Manutenções Corretivas de Alertas

```python
# Crear maintenance request automaticamente de alerta Wazuh
class WazuhAlert(models.Model):
    _inherit = 'wazuh.alert'

    maintenance_request_id = fields.Many2one(
        'maintenance.request',
        'Maintenance Request'
    )

    @api.model
    def create(self, vals):
        """Override create para gerar maintenance request"""
        alert = super().create(vals)

        # Se alerta é de hardware (ex: temperatura, disco)
        hardware_rules = ['553', '554', '555']  # IDs de regras Wazuh

        if alert.rule_id in hardware_rules and alert.level >= 7:
            # Buscar equipo pelo nome do agente
            equipment = self.env['maintenance.equipment'].search([
                ('name', '=', alert.agent_name)
            ], limit=1)

            if equipment:
                # Crear maintenance request
                request = self.env['maintenance.request'].create({
                    'name': f"[WAZUH] {alert.description}",
                    'equipment_id': equipment.id,
                    'maintenance_type': 'corrective',
                    'priority': '3' if alert.level >= 12 else '2',
                    'description': f"""
                        Alerta de Hardware Wazuh:

                        **Regra**: {alert.rule_id}
                        **Nível**: {alert.level}
                        **Agente**: {alert.agent_name}
                        **Descrição**: {alert.description}

                        **Log Completo**:
                        ```
                        {alert.full_log}
                        ```
                    """,
                    'schedule_date': fields.Datetime.now(),
                })

                alert.maintenance_request_id = request.id

                equipment.message_post(
                    body=f"Maintenance request created from Wazuh alert: {request.name}"
                )

        return alert
```

## Reportes

### Dashboard de Manutenção

```python
# SQL View para dashboard
from odoo import models, fields, tools

class MaintenanceDashboard(models.Model):
    _name = 'maintenance.dashboard'
    _description = 'Maintenance Dashboard'
    _auto = False

    equipment_id = fields.Many2one('maintenance.equipment', 'Equipment', readonly=True)
    category_id = fields.Many2one('maintenance.equipment.category', 'Category', readonly=True)
    total_requests = fields.Integer('Total Requests', readonly=True)
    preventive_requests = fields.Integer('Preventive', readonly=True)
    corrective_requests = fields.Integer('Corrective', readonly=True)
    avg_duration = fields.Float('Avg Duration (hours)', readonly=True)
    total_cost = fields.Float('Total Cost', readonly=True)
    mtbf = fields.Float('MTBF (days)', readonly=True)

    def init(self):
        tools.drop_view_if_exists(self.env.cr, 'maintenance_dashboard')
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW maintenance_dashboard AS (
                SELECT
                    e.id AS id,
                    e.id AS equipment_id,
                    e.category_id,
                    COUNT(r.id) AS total_requests,
                    COUNT(r.id) FILTER (WHERE r.maintenance_type = 'preventive') AS preventive_requests,
                    COUNT(r.id) FILTER (WHERE r.maintenance_type = 'corrective') AS corrective_requests,
                    AVG(r.duration) AS avg_duration,
                    SUM(r.total_parts_cost) AS total_cost,
                    AVG(EXTRACT(EPOCH FROM (r.request_date - LAG(r.request_date) OVER (PARTITION BY e.id ORDER BY r.request_date)))/86400) AS mtbf
                FROM maintenance_equipment e
                LEFT JOIN maintenance_request r ON r.equipment_id = e.id
                WHERE r.stage_id IN (SELECT id FROM maintenance_stage WHERE done = TRUE)
                GROUP BY e.id, e.category_id
            )
        """)
```

## Troubleshooting

### Problema: Planos não gerando requests

```python
# Verificar planos activos
plans = env['maintenance.plan'].search([('active', '=', True)])
for plan in plans:
    print(f"Plan: {plan.name}, Interval: {plan.interval} {plan.interval_type}")

# Forzar geração manual
plan._cron_generate_requests()
```

### Problema: Estoque de peças não descontando

```python
# Verificar movimentos de stock
request = env['maintenance.request'].browse(REQUEST_ID)
for part in request.consumed_part_ids:
    moves = env['stock.move'].search([
        ('product_id', '=', part.product_id.id),
        ('origin', '=', request.name),
    ])
    for move in moves:
        print(f"Move: {move.name}, State: {move.state}, Qty: {move.product_uom_qty}")
```

## Recursos Adicionales

- **Repositorio OCA**: https://github.com/OCA/maintenance
- **Documentación**: https://github.com/OCA/maintenance/tree/19.0

---

**Siguiente**: [Agreement](agreement.md)
