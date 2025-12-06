# Módulos OCA Stock Logistics

> **AI Context**: Documentación completa de los módulos Stock Logistics de OCA para Odoo 19, incluyendo inventário, zonas de localização e movimentação de stock. Estos módulos proporcionan funcionalidades avanzadas de gestión de stock integradas com mantenimiento e equipos en NEO_NETBOX_ODOO_STACK. Referencia para control de inventario de TI, piezas de repuesto e activos físicos.

## Visión General

Los módulos **Stock Logistics OCA** proporcionan funcionalidades avanzadas de **gestión de stock** e **almacenamiento** para Odoo 19.

### Módulos Incluidos

| Módulo | Versión | Función | Status |
|--------|--------|--------|--------|
| stock_inventory | 19.0.1.0.0 | Inventário de stock | Activo |
| stock_location_zone | 19.0.1.0.0 | Zonas de localização | Activo |
| stock_move_location | 19.0.1.0.0 | Movimentação facilitada | Activo |
| stock_storage_type | 19.0.1.0.0 | Tipos de almacenamiento | Activo |

## Arquitectura

```
┌────────────────────────────────────────────────────────┐
│             Stock Logistics System                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────┐         ┌────────────┐               │
│  │  NetBox    │────────►│   Stock    │               │
│  │  Devices   │  Sync   │  Products  │               │
│  └────────────┘         └─────┬──────┘               │
│                               │                       │
│                    ┌──────────┼──────────┐           │
│                    │          │          │           │
│              ┌─────▼─────┐ ┌─▼────┐ ┌──▼─────┐     │
│              │Inventory  │ │Zones │ │ Moves  │     │
│              │ Control   │ │Types │ │Location│     │
│              └─────┬─────┘ └─┬────┘ └──┬─────┘     │
│                    │          │          │           │
│              ┌─────▼──────────▼──────────▼─────┐    │
│              │     Maintenance Integration     │    │
│              │   (Spare Parts & Equipment)     │    │
│              └────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Instalación

### 1. Clonar el Repositorio

```bash
cd /opt/odoo/oca
git clone -b 19.0 https://github.com/OCA/stock-logistics-warehouse.git
```

### 2. Instalación via Docker

```bash
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  -i stock_inventory,stock_location_zone,stock_move_location,stock_storage_type \
  --stop-after-init
```

## Módulo: stock_inventory

### Funcionalidades

- Contagem de inventário por localização
- Ajustes de stock
- Inventário cíclico
- Reportes de acuracidade
- Histórico completo

### Configurar Localizações

```python
# Via código Python
from odoo import api, SUPERUSER_ID

env = api.Environment(cr, SUPERUSER_ID, {})

Location = env['stock.location']

# Localização principal: Almoxarifado TI
warehouse_it = Location.create({
    'name': 'IT Warehouse',
    'usage': 'internal',
    'location_id': env.ref('stock.stock_location_stock').id,
})

# Sub-localizações
locations = [
    {'name': 'Servidores', 'code': 'WH/IT/SRV'},
    {'name': 'Switches', 'code': 'WH/IT/SWT'},
    {'name': 'Roteadores', 'code': 'WH/IT/RTR'},
    {'name': 'Desktops', 'code': 'WH/IT/DSK'},
    {'name': 'Notebooks', 'code': 'WH/IT/NTB'},
    {'name': 'Peças de Reposição', 'code': 'WH/IT/SPA'},
    {'name': 'Cabos', 'code': 'WH/IT/CBL'},
]

for loc_data in locations:
    loc_data['usage'] = 'internal'
    loc_data['location_id'] = warehouse_it.id
    Location.create(loc_data)

print(f"Created {len(locations)} sub-locations")
```

### Crear Produtos de TI

```python
# Crear productos para inventario de TI
Product = env['product.product']
Category = env['product.category']

# Categoria: Hardware TI
cat_hardware = Category.create({
    'name': 'Hardware TI',
    'property_cost_method': 'fifo',
    'property_valuation': 'real_time',
})

# Produtos
products = [
    {
        'name': 'Dell PowerEdge R740',
        'default_code': 'SRV-DELL-R740',
        'type': 'product',
        'categ_id': cat_hardware.id,
        'standard_price': 5000.00,
        'list_price': 7000.00,
        'tracking': 'serial',
    },
    {
        'name': 'Cisco Catalyst 2960',
        'default_code': 'SWT-CISCO-2960',
        'type': 'product',
        'categ_id': cat_hardware.id,
        'standard_price': 800.00,
        'list_price': 1200.00,
        'tracking': 'serial',
    },
    {
        'name': 'HDD 2TB SATA',
        'default_code': 'HDD-2TB-SATA',
        'type': 'product',
        'categ_id': cat_hardware.id,
        'standard_price': 100.00,
        'list_price': 150.00,
        'tracking': 'lot',
    },
    {
        'name': 'Memória RAM 16GB DDR4',
        'default_code': 'RAM-16GB-DDR4',
        'type': 'product',
        'categ_id': cat_hardware.id,
        'standard_price': 80.00,
        'list_price': 120.00,
        'tracking': 'none',
    },
    {
        'name': 'Cabo Ethernet Cat6 - 3m',
        'default_code': 'CBL-ETH-CAT6-3M',
        'type': 'product',
        'categ_id': cat_hardware.id,
        'standard_price': 5.00,
        'list_price': 10.00,
        'tracking': 'none',
    },
]

for prod_data in products:
    Product.create(prod_data)

print(f"Created {len(products)} products")
```

### Realizar Inventário

```python
# Crear contagem de inventário
Inventory = env['stock.inventory']
InventoryLine = env['stock.inventory.line']

# Inventário do almoxarifado TI
inventory = Inventory.create({
    'name': 'Inventário Mensal TI - Dezembro 2025',
    'location_ids': [(6, 0, [warehouse_it.id])],
    'date': fields.Date.today(),
})

# Generar linhas de inventário
inventory.action_start()

# Actualizar quantidades contadas
for line in inventory.line_ids:
    # Simular contagem
    line.product_qty = line.theoretical_qty + random.randint(-5, 5)

# Validar inventário
inventory.action_validate()

print(f"Inventory completed: {inventory.name}")
```

### Ajuste Manual de Estoque

```python
# Ajuste de stock individual
from odoo import models, fields

class StockQuant(models.Model):
    _inherit = 'stock.quant'

    def adjust_quantity(self, product_id, location_id, quantity, reason=''):
        """Ajustar quantidade de producto"""
        Quant = self.env['stock.quant']
        Product = self.env['product.product']
        Location = self.env['stock.location']

        product = Product.browse(product_id)
        location = Location.browse(location_id)

        # Buscar quant existente
        quant = Quant.search([
            ('product_id', '=', product_id),
            ('location_id', '=', location_id),
        ], limit=1)

        if quant:
            # Actualizar quantidade
            quant.inventory_quantity = quantity
            quant.action_apply_inventory()
        else:
            # Crear novo quant
            Quant.create({
                'product_id': product_id,
                'location_id': location_id,
                'inventory_quantity': quantity,
            }).action_apply_inventory()

        # Log
        product.message_post(
            body=f"Stock adjusted in {location.name}: {quantity} units. Reason: {reason}"
        )

# Usar o método
env['stock.quant'].adjust_quantity(
    product_id=product_dell_server.id,
    location_id=location_servers.id,
    quantity=10,
    reason='Recebimento de compra PO-2025-001'
)
```

## Módulo: stock_location_zone

### Funcionalidades

- Organização de localizações em zonas
- Hierarquia de zonas
- Reportes por zona
- Picking otimizado por zona

### Crear Zonas

```python
# Crear zonas de almacenamiento
Zone = env['stock.location.zone']

# Zona A: Equipamentos Activos
zone_a = Zone.create({
    'name': 'Zone A - Active Equipment',
    'location_ids': [(6, 0, [
        location_servers.id,
        location_switches.id,
        location_routers.id,
    ])],
})

# Zona B: Workstations
zone_b = Zone.create({
    'name': 'Zone B - Workstations',
    'location_ids': [(6, 0, [
        location_desktops.id,
        location_notebooks.id,
    ])],
})

# Zona C: Peças e Consumíveis
zone_c = Zone.create({
    'name': 'Zone C - Spare Parts & Consumables',
    'location_ids': [(6, 0, [
        location_spare_parts.id,
        location_cables.id,
    ])],
})
```

### Relatório por Zona

```python
# Relatório de stock por zona
def get_stock_by_zone(zone_id):
    """Obtener stock agrupado por zona"""
    Zone = env['stock.location.zone']
    Quant = env['stock.quant']

    zone = Zone.browse(zone_id)
    location_ids = zone.location_ids.ids

    # Buscar quants nas localizações da zona
    quants = Quant.search([
        ('location_id', 'in', location_ids),
        ('quantity', '>', 0),
    ])

    # Agrupar por producto
    stock_by_product = {}
    for quant in quants:
        product = quant.product_id
        if product.id not in stock_by_product:
            stock_by_product[product.id] = {
                'product': product.name,
                'code': product.default_code,
                'quantity': 0,
                'value': 0,
            }

        stock_by_product[product.id]['quantity'] += quant.quantity
        stock_by_product[product.id]['value'] += quant.quantity * product.standard_price

    return {
        'zone': zone.name,
        'total_products': len(stock_by_product),
        'total_quantity': sum(p['quantity'] for p in stock_by_product.values()),
        'total_value': sum(p['value'] for p in stock_by_product.values()),
        'products': list(stock_by_product.values()),
    }

# Usar
report = get_stock_by_zone(zone_a.id)
print(f"Zone: {report['zone']}")
print(f"Products: {report['total_products']}")
print(f"Total Qty: {report['total_quantity']}")
print(f"Total Value: ${report['total_value']:,.2f}")
```

## Módulo: stock_move_location

### Funcionalidades

- Movimentação simplificada entre locais
- Interface wizard
- Movimentação em massa
- Rastreamento de movimentos

### Mover Produtos Entre Localizações

```python
# Wizard para movimentação
from odoo import models, fields, api

class StockMoveLocationWizard(models.TransientModel):
    _name = 'stock.move.location.wizard'
    _description = 'Move Stock Between Locations'

    product_id = fields.Many2one('product.product', 'Product', required=True)
    from_location_id = fields.Many2one('stock.location', 'From', required=True)
    to_location_id = fields.Many2one('stock.location', 'To', required=True)
    quantity = fields.Float('Quantity', required=True, default=1.0)
    reason = fields.Text('Reason')

    def action_move(self):
        """Ejecutar movimentação"""
        self.ensure_one()

        StockMove = self.env['stock.move']
        StockPicking = self.env['stock.picking']

        # Crear picking interno
        picking_type = self.env['stock.picking.type'].search([
            ('code', '=', 'internal')
        ], limit=1)

        picking = StockPicking.create({
            'picking_type_id': picking_type.id,
            'location_id': self.from_location_id.id,
            'location_dest_id': self.to_location_id.id,
            'origin': f'Move: {self.product_id.name}',
        })

        # Crear movimento
        move = StockMove.create({
            'name': self.product_id.name,
            'product_id': self.product_id.id,
            'product_uom_qty': self.quantity,
            'product_uom': self.product_id.uom_id.id,
            'picking_id': picking.id,
            'location_id': self.from_location_id.id,
            'location_dest_id': self.to_location_id.id,
        })

        # Confirmar e processar
        picking.action_confirm()
        picking.action_assign()

        # Validar movimento
        for move_line in picking.move_line_ids:
            move_line.qty_done = move_line.product_uom_qty

        picking.button_validate()

        # Log
        self.product_id.message_post(
            body=f"""
            Stock moved:
            - From: {self.from_location_id.name}
            - To: {self.to_location_id.name}
            - Quantity: {self.quantity}
            - Reason: {self.reason or 'N/A'}
            """
        )

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'message': f'{self.quantity} units moved successfully',
                'type': 'success',
            }
        }
```

## Integração com Maintenance

### Peças de Reposição para Equipamentos

```python
# Vincular productos a equipos
from odoo import models, fields

class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    spare_part_ids = fields.Many2many(
        'product.product',
        'equipment_spare_part_rel',
        'equipment_id',
        'product_id',
        string='Spare Parts'
    )

    def action_check_spare_parts_stock(self):
        """Verificar stock de peças"""
        self.ensure_one()

        report = []
        for product in self.spare_part_ids:
            qty = product.qty_available
            status = 'OK' if qty > 0 else 'OUT OF STOCK'

            report.append({
                'product': product.name,
                'code': product.default_code,
                'qty_available': qty,
                'status': status,
            })

        return {
            'type': 'ir.actions.act_window',
            'name': f'Spare Parts Stock - {self.name}',
            'res_model': 'spare.parts.stock.report',
            'view_mode': 'tree',
            'context': {'default_data': report},
        }


class MaintenanceRequest(models.Model):
    _inherit = 'maintenance.request'

    consumed_part_ids = fields.One2many(
        'maintenance.consumed.part',
        'request_id',
        'Consumed Parts'
    )
    total_parts_cost = fields.Float(
        'Parts Cost',
        compute='_compute_parts_cost'
    )

    @api.depends('consumed_part_ids.cost')
    def _compute_parts_cost(self):
        for request in self:
            request.total_parts_cost = sum(request.consumed_part_ids.mapped('cost'))

    def action_consume_parts(self):
        """Consumir peças do stock"""
        self.ensure_one()

        production_location = self.env.ref('stock.location_production')

        for consumed in self.consumed_part_ids:
            # Crear movimento de stock
            self.env['stock.quant'].adjust_quantity(
                product_id=consumed.product_id.id,
                location_id=consumed.location_id.id,
                quantity=-consumed.quantity,
                reason=f'Consumed in maintenance: {self.name}'
            )

        self.message_post(
            body=f'Consumed {len(self.consumed_part_ids)} spare parts (Total: ${self.total_parts_cost:.2f})'
        )


class MaintenanceConsumedPart(models.Model):
    _name = 'maintenance.consumed.part'
    _description = 'Consumed Spare Part'

    request_id = fields.Many2one('maintenance.request', 'Request', required=True)
    product_id = fields.Many2one('product.product', 'Product', required=True)
    location_id = fields.Many2one('stock.location', 'Location', required=True)
    quantity = fields.Float('Quantity', default=1.0)
    unit_cost = fields.Float('Unit Cost', related='product_id.standard_price')
    cost = fields.Float('Total Cost', compute='_compute_cost', store=True)

    @api.depends('quantity', 'unit_cost')
    def _compute_cost(self):
        for part in self:
            part.cost = part.quantity * part.unit_cost
```

## Integração com NetBox

### Sincronizar Dispositivos como Produtos

```python
# Sincronizar dispositivos do NetBox para stock
import requests
import os

class NetboxStockSync(models.Model):
    _name = 'netbox.stock.sync'
    _description = 'NetBox Stock Synchronization'

    @api.model
    def sync_devices_to_stock(self):
        """Sincronizar dispositivos do NetBox para productos"""
        netbox_url = os.getenv('NETBOX_URL', 'http://netbox:8000')
        netbox_token = os.getenv('NETBOX_TOKEN')

        # Buscar devices do NetBox
        response = requests.get(
            f"{netbox_url}/api/dcim/devices/",
            headers={'Authorization': f'Token {netbox_token}'},
            params={'status': 'inventory', 'limit': 1000}
        )

        if response.status_code != 200:
            raise Exception(f"NetBox API error: {response.status_code}")

        devices = response.json()['results']

        Product = self.env['product.product']
        Location = self.env['stock.location']

        # Localização para devices em inventário
        inventory_location = Location.search([
            ('name', '=', 'NetBox Inventory')
        ], limit=1)

        if not inventory_location:
            inventory_location = Location.create({
                'name': 'NetBox Inventory',
                'usage': 'internal',
                'location_id': self.env.ref('stock.stock_location_stock').id,
            })

        created = 0
        updated = 0

        for device in devices:
            # Buscar ou criar producto
            product = Product.search([
                ('default_code', '=', device['name'])
            ], limit=1)

            values = {
                'name': device['display'],
                'default_code': device['name'],
                'type': 'product',
                'tracking': 'serial',
                'netbox_id': device['id'],
            }

            if product:
                product.write(values)
                updated += 1
            else:
                product = Product.create(values)
                created += 1

            # Ajustar stock (1 unidade)
            self.env['stock.quant'].adjust_quantity(
                product_id=product.id,
                location_id=inventory_location.id,
                quantity=1,
                reason=f'Synced from NetBox: {device["name"]}'
            )

        return {
            'status': 'success',
            'created': created,
            'updated': updated,
            'total': len(devices),
        }
```

## Reportes

### Relatório de Acuracidade de Inventário

```python
# SQL View para acuracidade
from odoo import models, fields, tools

class StockAccuracyReport(models.Model):
    _name = 'stock.accuracy.report'
    _description = 'Stock Accuracy Report'
    _auto = False

    location_id = fields.Many2one('stock.location', 'Location', readonly=True)
    product_id = fields.Many2one('product.product', 'Product', readonly=True)
    theoretical_qty = fields.Float('Theoretical', readonly=True)
    actual_qty = fields.Float('Actual', readonly=True)
    difference = fields.Float('Difference', readonly=True)
    accuracy_pct = fields.Float('Accuracy %', readonly=True)

    def init(self):
        tools.drop_view_if_exists(self.env.cr, 'stock_accuracy_report')
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW stock_accuracy_report AS (
                SELECT
                    ROW_NUMBER() OVER () as id,
                    inv.location_id,
                    inv.product_id,
                    SUM(inv.theoretical_qty) as theoretical_qty,
                    SUM(inv.product_qty) as actual_qty,
                    SUM(inv.product_qty - inv.theoretical_qty) as difference,
                    CASE
                        WHEN SUM(inv.theoretical_qty) = 0 THEN 100
                        ELSE 100 - (ABS(SUM(inv.product_qty - inv.theoretical_qty)) / NULLIF(SUM(inv.theoretical_qty), 0) * 100)
                    END as accuracy_pct
                FROM stock_inventory_line inv
                WHERE inv.inventory_id IN (
                    SELECT id FROM stock_inventory
                    WHERE state = 'done'
                    AND date >= CURRENT_DATE - INTERVAL '90 days'
                )
                GROUP BY inv.location_id, inv.product_id
            )
        """)
```

## Troubleshooting

### Problema: Estoque negativo

```python
# Encontrar productos com stock negativo
Quant = env['stock.quant']
negative_quants = Quant.search([('quantity', '<', 0)])

for quant in negative_quants:
    print(f"{quant.product_id.name} @ {quant.location_id.name}: {quant.quantity}")

    # Ajustar para zero
    quant.inventory_quantity = 0
    quant.action_apply_inventory()
```

### Problema: Movimentos travados

```sql
-- Verificar pickings pendentes
SELECT
    sp.name,
    sp.state,
    sp.create_date,
    pt.name as picking_type
FROM stock_picking sp
LEFT JOIN stock_picking_type pt ON sp.picking_type_id = pt.id
WHERE sp.state NOT IN ('done', 'cancel')
AND sp.create_date < NOW() - INTERVAL '7 days'
ORDER BY sp.create_date;

-- Cancelar pickings antigos (se apropriado)
UPDATE stock_picking
SET state = 'cancel'
WHERE state NOT IN ('done', 'cancel')
AND create_date < NOW() - INTERVAL '30 days';
```

## Recursos Adicionales

- **Repositorio OCA**: https://github.com/OCA/stock-logistics-warehouse
- **Documentación**: https://github.com/OCA/stock-logistics-warehouse/tree/19.0

---

**Siguiente**: [Maintenance](maintenance.md)
