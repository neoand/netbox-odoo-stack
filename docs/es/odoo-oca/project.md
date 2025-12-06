# Módulos OCA Project

> **AI Context**: Documentación completa de los módulos de gestión de proyectos de OCA para Odoo 19, incluyendo timeline, códigos de tareas, templates y stakeholders. Estos módulos extienden el módulo Project nativo de Odoo con funcionalidades avanzadas de planificación, visualización y organización de proyectos. Referencia para implementación de gestión de proyectos integrada con helpdesk, timesheet y recursos en NEO_NETBOX_ODOO_STACK.

## Visión General

Los módulos **Project OCA** extienden el módulo nativo de proyectos de Odoo 19 con funcionalidades avanzadas de gestión, visualización y organización de proyectos y tareas.

### Módulos Incluidos

| Módulo | Versión | Función | Estado |
|--------|---------|---------|--------|
| project_timeline | 19.0.1.0.0 | Visualización Gantt/Timeline | Activo |
| project_task_code | 19.0.1.0.0 | Códigos secuenciales para tareas | Activo |
| project_template | 19.0.1.0.0 | Templates reutilizables de proyectos | Activo |
| project_stakeholder | 19.0.1.0.0 | Gestión de stakeholders | Activo |
| project_task_material | 19.0.1.0.0 | Materiales usados en tareas | Activo |
| project_stage_closed | 19.0.1.0.0 | Control de etapas cerradas | Activo |

## Arquitectura

```
┌────────────────────────────────────────────────────────┐
│               Project Management System                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐      ┌──────────────┐             │
│  │   Helpdesk   │─────►│   Projects   │             │
│  │   Tickets    │      │   (Core)     │             │
│  └──────────────┘      └──────┬───────┘             │
│                               │                      │
│                    ┌──────────┼──────────┐          │
│                    │          │          │          │
│              ┌─────▼─────┐ ┌─▼────┐ ┌──▼─────┐    │
│              │ Timeline  │ │Tasks │ │Template│    │
│              │   Gantt   │ │Codes │ │Projects│    │
│              └─────┬─────┘ └─┬────┘ └──┬─────┘    │
│                    │          │          │          │
│              ┌─────▼──────────▼──────────▼─────┐   │
│              │  Stakeholders & Materials      │   │
│              └────────────────────────────────┘   │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │          Timesheet & Resources               │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Instalación

### 1. Clonar el Repositorio

```bash
cd /opt/odoo/oca
git clone -b 19.0 https://github.com/OCA/project.git
```

### 2. Configuración en odoo.conf

```ini
[options]
addons_path = /mnt/extra-addons,/mnt/oca-addons/project
```

### 3. Instalación vía Docker

```bash
# Reiniciar contenedor
docker-compose restart odoo

# Instalar módulos
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  -i project_timeline,project_task_code,project_template,project_stakeholder \
  --stop-after-init
```

## Módulo: project_timeline

### Funcionalidades

- Visualización Gantt de tareas y proyectos
- Arrastrar y soltar para reprogramar tareas
- Visualización de dependencias entre tareas
- Colores por estado/prioridad
- Zoom y filtros temporales

### Configuración de Fechas

```python
# Habilitar campos de fecha en tareas
from odoo import models, fields, api

class ProjectTask(models.Model):
    _inherit = 'project.task'

    date_start = fields.Datetime('Start Date')
    date_end = fields.Datetime('End Date')
    duration_hours = fields.Float('Duration (hours)', compute='_compute_duration', store=True)

    @api.depends('date_start', 'date_end')
    def _compute_duration(self):
        for task in self:
            if task.date_start and task.date_end:
                delta = task.date_end - task.date_start
                task.duration_hours = delta.total_seconds() / 3600
            else:
                task.duration_hours = 0

    @api.onchange('date_start', 'duration_hours')
    def _onchange_duration(self):
        """Calcular fecha final basado en la duración"""
        if self.date_start and self.duration_hours:
            from datetime import timedelta
            self.date_end = self.date_start + timedelta(hours=self.duration_hours)
```

### Dependencias entre Tareas

```python
# Agregar dependencias
class ProjectTask(models.Model):
    _inherit = 'project.task'

    predecessor_ids = fields.Many2many(
        'project.task',
        'task_dependency_rel',
        'task_id',
        'predecessor_id',
        string='Predecessors',
        help='Tasks that must be completed before this task can start'
    )

    successor_ids = fields.Many2many(
        'project.task',
        'task_dependency_rel',
        'predecessor_id',
        'task_id',
        string='Successors',
        help='Tasks that depend on this task'
    )

    @api.constrains('predecessor_ids')
    def _check_predecessor_recursion(self):
        """Prevenir dependencias circulares"""
        for task in self:
            if task in task.predecessor_ids:
                raise ValidationError('Una tarea no puede depender de sí misma.')

            # Verificar dependencias indirectas
            visited = set()
            to_check = list(task.predecessor_ids)

            while to_check:
                current = to_check.pop()
                if current.id in visited:
                    continue
                if current == task:
                    raise ValidationError('Dependencia circular detectada!')
                visited.add(current.id)
                to_check.extend(current.predecessor_ids)
```

### View Gantt Personalizada

```xml
<!-- views/project_task_views.xml -->
<record id="view_task_gantt_timeline" model="ir.ui.view">
    <field name="name">project.task.gantt.timeline</field>
    <field name="model">project.task</field>
    <field name="arch" type="xml">
        <gantt
            date_start="date_start"
            date_stop="date_end"
            default_group_by="user_ids"
            color="priority"
            decoration-danger="priority == '3'"
            decoration-warning="priority == '2'"
            decoration-info="priority == '1'">

            <field name="name"/>
            <field name="project_id"/>
            <field name="user_ids"/>
            <field name="priority"/>
            <field name="stage_id"/>
        </gantt>
    </field>
</record>
```

## Módulo: project_task_code

### Funcionalidades

- Códigos secuenciales automáticos para tareas
- Formato personalizable (ej: PROJ-001, TSK-2024-001)
- Secuencias por proyecto
- Búsqueda rápida por código

### Configuración de Secuencias

```python
# Agregar código secuencial
from odoo import models, fields, api

class ProjectTask(models.Model):
    _inherit = 'project.task'

    code = fields.Char('Task Code', readonly=True, copy=False)

    @api.model_create_multi
    def create(self, vals_list):
        """Generar código automáticamente en la creación"""
        for vals in vals_list:
            if not vals.get('code'):
                project_id = vals.get('project_id')
                if project_id:
                    project = self.env['project.project'].browse(project_id)
                    vals['code'] = self._generate_task_code(project)
                else:
                    vals['code'] = self._generate_task_code()

        return super().create(vals_list)

    def _generate_task_code(self, project=None):
        """Generar código secuencial"""
        if project and project.task_code_sequence_id:
            return project.task_code_sequence_id.next_by_id()
        else:
            # Secuencia global
            return self.env['ir.sequence'].next_by_code('project.task') or '/'

    @api.depends('code')
    def _compute_display_name(self):
        """Incluir código en el nombre de visualización"""
        for task in self:
            if task.code:
                task.display_name = f"[{task.code}] {task.name}"
            else:
                task.display_name = task.name
```

### Secuencias por Proyecto

```python
# Agregar secuencia personalizada al proyecto
class ProjectProject(models.Model):
    _inherit = 'project.project'

    task_code_prefix = fields.Char('Task Code Prefix', default='TSK')
    task_code_sequence_id = fields.Many2one('ir.sequence', 'Task Code Sequence')

    @api.model_create_multi
    def create(self, vals_list):
        """Crear secuencia al crear proyecto"""
        projects = super().create(vals_list)

        for project in projects:
            if not project.task_code_sequence_id:
                sequence = self.env['ir.sequence'].create({
                    'name': f'Task Sequence - {project.name}',
                    'code': f'project.task.{project.id}',
                    'prefix': f'{project.task_code_prefix}-%(year)s-',
                    'padding': 4,
                    'number_increment': 1,
                })
                project.task_code_sequence_id = sequence.id

        return projects
```

### Búsqueda por Código

```xml
<!-- views/project_task_search.xml -->
<record id="view_task_search_code" model="ir.ui.view">
    <field name="name">project.task.search.code</field>
    <field name="model">project.task</field>
    <field name="inherit_id" ref="project.view_task_search_form"/>
    <field name="arch" type="xml">
        <search>
            <field name="code" string="Task Code" filter_domain="[('code', 'ilike', self)]"/>
        </search>
    </field>
</record>
```

## Módulo: project_template

### Funcionalidades

- Crear templates de proyectos reutilizables
- Incluir tareas predefinidas en el template
- Copiar estructura completa (etapas, tags, etc.)
- Templates para diferentes tipos de proyecto

### Crear Template de Proyecto

```python
# Model de template
from odoo import models, fields, api

class ProjectTemplate(models.Model):
    _name = 'project.template'
    _description = 'Project Template'

    name = fields.Char('Template Name', required=True)
    description = fields.Text('Description')
    task_template_ids = fields.One2many('project.task.template', 'project_template_id', 'Task Templates')
    stage_ids = fields.Many2many('project.task.type', string='Stages')
    tag_ids = fields.Many2many('project.tags', string='Tags')

    def action_create_project(self):
        """Crear proyecto a partir del template"""
        self.ensure_one()

        # Crear proyecto
        project = self.env['project.project'].create({
            'name': f"{self.name} - {fields.Date.today()}",
            'description': self.description,
            'type_ids': [(6, 0, self.stage_ids.ids)],
        })

        # Crear tareas del template
        for task_template in self.task_template_ids:
            task_template.create_task(project)

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'project.project',
            'res_id': project.id,
            'view_mode': 'form',
            'target': 'current',
        }


class ProjectTaskTemplate(models.Model):
    _name = 'project.task.template'
    _description = 'Project Task Template'
    _order = 'sequence, id'

    name = fields.Char('Task Name', required=True)
    description = fields.Html('Description')
    project_template_id = fields.Many2one('project.template', 'Project Template', required=True, ondelete='cascade')
    sequence = fields.Integer('Sequence', default=10)
    user_id = fields.Many2one('res.users', 'Assigned to')
    tag_ids = fields.Many2many('project.tags', string='Tags')
    planned_hours = fields.Float('Planned Hours')
    stage_id = fields.Many2one('project.task.type', 'Stage')

    def create_task(self, project):
        """Crear tarea real a partir del template"""
        self.ensure_one()

        return self.env['project.task'].create({
            'name': self.name,
            'description': self.description,
            'project_id': project.id,
            'user_ids': [(6, 0, [self.user_id.id])] if self.user_id else [],
            'tag_ids': [(6, 0, self.tag_ids.ids)],
            'planned_hours': self.planned_hours,
            'stage_id': self.stage_id.id if self.stage_id else False,
        })
```

### Ejemplo: Template de Onboarding

```python
# Script para crear template de onboarding
from odoo import api, SUPERUSER_ID

env = api.Environment(cr, SUPERUSER_ID, {})

# Crear template
template = env['project.template'].create({
    'name': 'Onboarding de Empleado',
    'description': 'Template para onboarding de nuevos empleados',
})

# Tareas del template
tasks = [
    {
        'name': 'Crear cuenta de email',
        'description': 'Crear cuenta corporativa en el dominio @empresa.com',
        'sequence': 1,
        'planned_hours': 0.5,
    },
    {
        'name': 'Configurar workstation',
        'description': 'Instalar OS, aplicaciones y configurar acceso a la red',
        'sequence': 2,
        'planned_hours': 2,
    },
    {
        'name': 'Crear accesos a los sistemas',
        'description': 'Odoo, NetBox, Wazuh, etc.',
        'sequence': 3,
        'planned_hours': 1,
    },
    {
        'name': 'Capacitación inicial',
        'description': 'Presentación de la empresa y procedimientos',
        'sequence': 4,
        'planned_hours': 4,
    },
    {
        'name': 'Documentación entregada',
        'description': 'Políticas, manuales y documentos firmados',
        'sequence': 5,
        'planned_hours': 1,
    },
]

for task_data in tasks:
    task_data['project_template_id'] = template.id
    env['project.task.template'].create(task_data)

print(f"Template creado: {template.name}")
```

## Módulo: project_stakeholder

### Funcionalidades

- Gestión de stakeholders del proyecto
- Definir roles (sponsor, cliente, equipo, etc.)
- Control de permisos por stakeholder
- Notificaciones dirigidas

### Agregar Stakeholders

```python
# Model de stakeholder
from odoo import models, fields

class ProjectStakeholder(models.Model):
    _name = 'project.stakeholder'
    _description = 'Project Stakeholder'

    project_id = fields.Many2one('project.project', 'Project', required=True, ondelete='cascade')
    partner_id = fields.Many2one('res.partner', 'Contact', required=True)
    role_id = fields.Many2one('project.stakeholder.role', 'Role', required=True)
    notify_on_change = fields.Boolean('Notify on Changes', default=True)
    can_view_tasks = fields.Boolean('Can View Tasks', default=True)
    can_create_tasks = fields.Boolean('Can Create Tasks', default=False)


class ProjectStakeholderRole(models.Model):
    _name = 'project.stakeholder.role'
    _description = 'Stakeholder Role'

    name = fields.Char('Role Name', required=True, translate=True)
    description = fields.Text('Description')
    default_notify = fields.Boolean('Notify by Default', default=True)


class ProjectProject(models.Model):
    _inherit = 'project.project'

    stakeholder_ids = fields.One2many('project.stakeholder', 'project_id', 'Stakeholders')
    stakeholder_count = fields.Integer(compute='_compute_stakeholder_count')

    @api.depends('stakeholder_ids')
    def _compute_stakeholder_count(self):
        for project in self:
            project.stakeholder_count = len(project.stakeholder_ids)

    def action_notify_stakeholders(self, message):
        """Notificar todos stakeholders"""
        self.ensure_one()

        stakeholders = self.stakeholder_ids.filtered('notify_on_change')
        partner_ids = stakeholders.mapped('partner_id').ids

        self.message_post(
            body=message,
            partner_ids=partner_ids,
            message_type='notification',
            subtype_xmlid='mail.mt_comment',
        )
```

### Roles Por Defecto

```python
# Crear roles por defecto
roles_data = [
    {'name': 'Sponsor', 'description': 'Patrocinador del proyecto', 'default_notify': True},
    {'name': 'Cliente', 'description': 'Cliente final', 'default_notify': True},
    {'name': 'Gerente de Proyecto', 'description': 'Responsable de la gestión', 'default_notify': True},
    {'name': 'Miembro del Equipo', 'description': 'Colaborador del proyecto', 'default_notify': False},
    {'name': 'Observador', 'description': 'Solo visualización', 'default_notify': False},
]

Role = env['project.stakeholder.role']
for role_data in roles_data:
    Role.create(role_data)
```

## Módulo: project_task_material

### Funcionalidades

- Registrar materiales usados en tareas
- Integración con inventario de stock
- Control de costos por material
- Reporte de consumo

### Agregar Materiales a la Tarea

```python
# Model de material
from odoo import models, fields, api

class ProjectTaskMaterial(models.Model):
    _name = 'project.task.material'
    _description = 'Task Material'

    task_id = fields.Many2one('project.task', 'Task', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', 'Product', required=True)
    quantity = fields.Float('Quantity', default=1.0)
    unit_price = fields.Float('Unit Price', related='product_id.standard_price', readonly=True)
    total_price = fields.Float('Total', compute='_compute_total_price', store=True)

    @api.depends('quantity', 'unit_price')
    def _compute_total_price(self):
        for material in self:
            material.total_price = material.quantity * material.unit_price


class ProjectTask(models.Model):
    _inherit = 'project.task'

    material_ids = fields.One2many('project.task.material', 'task_id', 'Materials')
    material_cost = fields.Float('Total Material Cost', compute='_compute_material_cost', store=True)

    @api.depends('material_ids.total_price')
    def _compute_material_cost(self):
        for task in self:
            task.material_cost = sum(task.material_ids.mapped('total_price'))

    def action_consume_materials(self):
        """Consumir materiales del stock"""
        self.ensure_one()

        StockMove = self.env['stock.move']
        stock_location = self.env.ref('stock.stock_location_stock')
        production_location = self.env.ref('stock.location_production')

        for material in self.material_ids:
            StockMove.create({
                'name': f"Material for {self.code or self.name}",
                'product_id': material.product_id.id,
                'product_uom_qty': material.quantity,
                'product_uom': material.product_id.uom_id.id,
                'location_id': stock_location.id,
                'location_dest_id': production_location.id,
                'origin': self.code or self.name,
            })._action_confirm()
```

## Integración con Helpdesk

### Convertir Ticket en Proyecto

```python
# Agregar al modelo de ticket
from odoo import models, api

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    def action_convert_to_project(self):
        """Convierte ticket complejo en proyecto"""
        self.ensure_one()

        # Crear proyecto
        project = self.env['project.project'].create({
            'name': f"[TICKET-{self.number}] {self.name}",
            'description': self.description,
            'partner_id': self.partner_id.id,
            'user_id': self.user_id.id,
        })

        # Crear tarea inicial
        self.env['project.task'].create({
            'name': self.name,
            'description': self.description,
            'project_id': project.id,
            'user_ids': [(6, 0, [self.user_id.id])] if self.user_id else [],
            'ticket_id': self.id,
        })

        # Agregar stakeholders
        if self.partner_id:
            self.env['project.stakeholder'].create({
                'project_id': project.id,
                'partner_id': self.partner_id.id,
                'role_id': self.env.ref('project_stakeholder.role_client').id,
            })

        # Actualizar ticket
        self.write({
            'project_id': project.id,
            'stage_id': self.env.ref('helpdesk_mgmt.stage_in_progress').id,
        })

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'project.project',
            'res_id': project.id,
            'view_mode': 'form',
            'target': 'current',
        }
```

## Integración con NetBox

### Sincronizar Proyectos con NetBox

```python
# Vincular proyectos a sites/localizaciones de NetBox
from odoo import models, fields
import requests
import os

class ProjectProject(models.Model):
    _inherit = 'project.project'

    netbox_site_id = fields.Integer('NetBox Site ID')
    netbox_site_name = fields.Char('Site Name', compute='_compute_netbox_site')

    @api.depends('netbox_site_id')
    def _compute_netbox_site(self):
        for project in self:
            if project.netbox_site_id:
                site_info = self._fetch_netbox_site(project.netbox_site_id)
                project.netbox_site_name = site_info.get('name')
            else:
                project.netbox_site_name = False

    def _fetch_netbox_site(self, site_id):
        """Busca información del site en NetBox"""
        netbox_url = os.getenv('NETBOX_URL', 'http://netbox:8000')
        netbox_token = os.getenv('NETBOX_TOKEN')

        response = requests.get(
            f"{netbox_url}/api/dcim/sites/{site_id}/",
            headers={'Authorization': f'Token {netbox_token}'}
        )

        if response.status_code == 200:
            return response.json()
        return {}

    def action_sync_devices_to_tasks(self):
        """Crear tareas para cada device en el site de NetBox"""
        self.ensure_one()

        if not self.netbox_site_id:
            raise UserError('Configure el Site ID de NetBox primero.')

        netbox_url = os.getenv('NETBOX_URL', 'http://netbox:8000')
        netbox_token = os.getenv('NETBOX_TOKEN')

        # Buscar devices del site
        response = requests.get(
            f"{netbox_url}/api/dcim/devices/",
            params={'site_id': self.netbox_site_id},
            headers={'Authorization': f'Token {netbox_token}'}
        )

        if response.status_code == 200:
            devices = response.json()['results']

            Task = self.env['project.task']
            for device in devices:
                Task.create({
                    'name': f"Configurar {device['name']}",
                    'description': f"Device Type: {device['device_type']['display']}\nSerial: {device.get('serial', 'N/A')}",
                    'project_id': self.id,
                    'netbox_device_id': device['id'],
                })

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'message': f'{len(devices)} tareas creadas desde NetBox',
                    'type': 'success',
                }
            }
```

## Reportes

### Reporte de Performance de Proyecto

```python
# SQL View para dashboard
from odoo import models, fields, tools

class ProjectPerformanceReport(models.Model):
    _name = 'project.performance.report'
    _description = 'Project Performance Report'
    _auto = False

    project_id = fields.Many2one('project.project', 'Project', readonly=True)
    total_tasks = fields.Integer('Total Tasks', readonly=True)
    completed_tasks = fields.Integer('Completed Tasks', readonly=True)
    progress_percentage = fields.Float('Progress %', readonly=True)
    total_hours_planned = fields.Float('Planned Hours', readonly=True)
    total_hours_spent = fields.Float('Spent Hours', readonly=True)
    budget_variance = fields.Float('Budget Variance', readonly=True)

    def init(self):
        tools.drop_view_if_exists(self.env.cr, 'project_performance_report')
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW project_performance_report AS (
                SELECT
                    p.id AS id,
                    p.id AS project_id,
                    COUNT(t.id) AS total_tasks,
                    SUM(CASE WHEN stage.fold = TRUE THEN 1 ELSE 0 END) AS completed_tasks,
                    (SUM(CASE WHEN stage.fold = TRUE THEN 1 ELSE 0 END)::float / NULLIF(COUNT(t.id), 0)) * 100 AS progress_percentage,
                    SUM(t.planned_hours) AS total_hours_planned,
                    SUM(t.effective_hours) AS total_hours_spent,
                    SUM(t.planned_hours) - SUM(t.effective_hours) AS budget_variance
                FROM project_project p
                LEFT JOIN project_task t ON t.project_id = p.id
                LEFT JOIN project_task_type stage ON t.stage_id = stage.id
                GROUP BY p.id
            )
        """)
```

### Exportar Timeline a Excel

```python
# Usar report_xlsx
from odoo import models

class ProjectTaskXlsx(models.AbstractModel):
    _name = 'report.project_timeline.report_task_timeline_xlsx'
    _inherit = 'report.report_xlsx.abstract'

    def generate_xlsx_report(self, workbook, data, tasks):
        sheet = workbook.add_worksheet('Timeline')

        # Formatos
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3'})
        date_format = workbook.add_format({'num_format': 'yyyy-mm-dd hh:mm'})

        # Encabezados
        headers = ['Code', 'Task', 'Project', 'Assigned', 'Start Date', 'End Date', 'Duration (h)', 'Status']
        for col, header in enumerate(headers):
            sheet.write(0, col, header, header_format)

        # Datos
        row = 1
        for task in tasks:
            sheet.write(row, 0, task.code or '')
            sheet.write(row, 1, task.name)
            sheet.write(row, 2, task.project_id.name)
            sheet.write(row, 3, ', '.join(task.user_ids.mapped('name')))
            sheet.write(row, 4, task.date_start or '', date_format)
            sheet.write(row, 5, task.date_end or '', date_format)
            sheet.write(row, 6, task.duration_hours)
            sheet.write(row, 7, task.stage_id.name)
            row += 1

        # Ajustar anchos
        sheet.set_column('A:A', 12)
        sheet.set_column('B:B', 40)
        sheet.set_column('C:C', 25)
        sheet.set_column('D:D', 20)
        sheet.set_column('E:F', 18)
        sheet.set_column('G:G', 12)
        sheet.set_column('H:H', 15)
```

## Troubleshooting

### Problema: Timeline no cargando

```bash
# Verificar si el módulo web_timeline está instalado
docker exec -it neo_odoo odoo shell -d neonetbox_odoo

# En el shell:
from odoo import api, SUPERUSER_ID
env = api.Environment(cr, SUPERUSER_ID, {})

timeline = env['ir.module.module'].search([('name', '=', 'web_timeline')])
print(f"Web Timeline: {timeline.state}")

if timeline.state != 'installed':
    timeline.button_immediate_install()
```

### Problema: Códigos de tarea duplicados

```sql
-- Verificar duplicados
SELECT code, COUNT(*)
FROM project_task
WHERE code IS NOT NULL
GROUP BY code
HAVING COUNT(*) > 1;

-- Recrear secuencias
UPDATE ir_sequence
SET number_next = (
    SELECT MAX(CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)) + 1
    FROM project_task
    WHERE code LIKE 'TSK-%'
)
WHERE code = 'project.task';
```

### Problema: Template no creando tareas

```python
# Debug del template
template = env['project.template'].browse(TEMPLATE_ID)
print(f"Template: {template.name}")
print(f"Tasks: {len(template.task_template_ids)}")

for task_template in template.task_template_ids:
    print(f"  - {task_template.name} (seq: {task_template.sequence})")

# Forzar creación manual
project = env['project.project'].create({'name': 'Test Project'})
for task_template in template.task_template_ids:
    task = task_template.create_task(project)
    print(f"Created: {task.name}")
```

## Recursos Adicionales

- **Repositorio OCA**: https://github.com/OCA/project
- **Documentación**: https://github.com/OCA/project/tree/19.0
- **Issues**: https://github.com/OCA/project/issues

---

**Siguiente**: [REST Framework](rest-framework.md)
