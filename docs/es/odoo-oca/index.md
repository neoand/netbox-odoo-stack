# Módulos OCA para Odoo 19

> **AI Context**: Este documento proporciona una visión general completa de los módulos OCA (Odoo Community Association) utilizados en el NEO_NETBOX_ODOO_STACK v2.0. Los módulos OCA son alternativas open-source de calidad empresarial a los módulos Enterprise de Odoo, ofreciendo funcionalidades avanzadas de ITSM, automatización, reportes e integraciones. Referencia para configuración de ambiente Odoo 19 con enfoque en service desk, gestión de proyectos, APIs REST e integración con NetBox/Wazuh.

## Visión General

El **NEO_NETBOX_ODOO_STACK v2.0** utiliza módulos de la **OCA (Odoo Community Association)** para proporcionar funcionalidades empresariales sin dependencia de licencias Enterprise. Esta estrategia ofrece:

- **Costo cero de licenciamiento** - Módulos 100% open-source
- **Comunidad activa** - Mantenidos por cientos de desarrolladores
- **Compatibilidad** - Probados extensivamente con Odoo 19
- **Personalización** - Código abierto facilita adaptaciones
- **Integración** - Funcionan nativamente con NetBox y Wazuh

## Módulos Instalados

### Tabla Resumen de Módulos

| Categoría | Módulo | Versión | Función Principal | Estado |
|-----------|--------|---------|-------------------|--------|
| **Helpdesk** | helpdesk_mgmt | 19.0.1.0.0 | Sistema de tickets y atención | Activo |
| | helpdesk_mgmt_sla | 19.0.1.0.0 | SLA y tiempo de respuesta | Activo |
| | helpdesk_type_sla | 19.0.1.0.0 | SLA por tipo de ticket | Activo |
| | helpdesk_mgmt_project | 19.0.1.0.0 | Integración tickets/proyectos | Activo |
| | helpdesk_mgmt_timesheet | 19.0.1.0.0 | Control de horas | Activo |
| **Project** | project_timeline | 19.0.1.0.0 | Visualización Gantt | Activo |
| | project_task_code | 19.0.1.0.0 | Códigos únicos para tareas | Activo |
| | project_template | 19.0.1.0.0 | Plantillas de proyectos | Activo |
| | project_stakeholder | 19.0.1.0.0 | Gestión de stakeholders | Activo |
| **REST API** | fastapi | 18.0.1.3.1 | Framework API REST | Activo |
| | fastapi_auth_api_key | 18.0.1.0.0 | Autenticación por API Key | Activo |
| | queue_job | 19.0.1.0.0 | Procesamiento asíncrono | Activo |
| | pydantic | 19.0.1.0.0 | Validación de datos | Activo |
| **Reporting** | report_xlsx | 19.0.1.0.0 | Exportación Excel | Activo |
| | report_csv | 19.0.1.0.0 | Exportación CSV | Activo |
| | bi_sql_editor | 19.0.1.0.0 | Query builder SQL | Activo |
| | sql_export_excel | 19.0.1.0.0 | SQL para Excel | Activo |
| **Server UX** | announcement | 19.0.1.0.0 | Anuncios en el sistema | Activo |
| | server_action_mass_edit | 19.0.1.0.0 | Edición en masa | Activo |
| | base_custom_filter | 19.0.1.0.0 | Filtros personalizados | Activo |
| | base_tier_validation | 19.0.1.0.0 | Aprobaciones multi-nivel | Activo |
| **Stock** | stock_inventory | 19.0.1.0.0 | Inventario de almacén | Activo |
| | stock_location_zone | 19.0.1.0.0 | Zonas de ubicación | Activo |
| | stock_move_location | 19.0.1.0.0 | Movimiento de inventario | Activo |
| **Maintenance** | maintenance_plan | 19.0.1.0.0 | Planes de mantenimiento | Activo |
| | maintenance_equipment_hierarchy | 19.0.1.0.0 | Jerarquía de equipos | Activo |
| | maintenance_stock | 19.0.1.0.0 | Inventario para mantenimiento | Activo |
| **Agreement** | agreement | 19.0.1.0.0 | Contratos y acuerdos | Activo |
| | agreement_sale | 19.0.1.0.0 | Contratos de ventas | Activo |

## Arquitectura de Integración

```
┌─────────────────────────────────────────────────────────────┐
│                    NEO_NETBOX_ODOO_STACK                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌────────────┐ │
│  │   NetBox    │◄────►│   Odoo 19   │◄────►│   Wazuh    │ │
│  │   (CMDB)    │      │   + OCA     │      │   (SIEM)   │ │
│  └─────────────┘      └─────────────┘      └────────────┘ │
│         │                    │                     │        │
│         │              ┌─────┴─────┐              │        │
│         │              │           │              │        │
│         │         ┌────▼───┐  ┌───▼────┐         │        │
│         │         │FastAPI │  │Queue   │         │        │
│         │         │REST API│  │Jobs    │         │        │
│         │         └────┬───┘  └───┬────┘         │        │
│         │              │          │              │        │
│         └──────────────┼──────────┼──────────────┘        │
│                        │          │                       │
│              ┌─────────▼──────────▼────────┐             │
│              │   Módulos OCA Odoo 19       │             │
│              ├─────────────────────────────┤             │
│              │ • Helpdesk (Tickets/SLA)    │             │
│              │ • Project (Timeline/Tasks)  │             │
│              │ • Maintenance (CMMS)        │             │
│              │ • Stock (Inventory)         │             │
│              │ • Reporting (BI/Excel)      │             │
│              │ • Agreement (Contracts)     │             │
│              └─────────────────────────────┘             │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Instalación General

### 1. Estructura de Directorios

```bash
/opt/odoo/
├── odoo/                    # Core Odoo 19
├── addons/                  # Módulos personalizados
└── oca/                     # Módulos OCA
    ├── helpdesk/
    ├── project/
    ├── rest-framework/
    ├── reporting-engine/
    ├── server-ux/
    ├── stock-logistics-warehouse/
    ├── maintenance/
    └── agreement/
```

### 2. Instalación vía Docker

Agregue al `docker-compose.yml`:

```yaml
services:
  odoo:
    image: odoo:19.0
    container_name: neo_odoo
    depends_on:
      - db
    ports:
      - "8069:8069"
    volumes:
      - odoo-data:/var/lib/odoo
      - ./config:/etc/odoo
      - ./addons:/mnt/extra-addons
      - ./oca:/mnt/oca-addons
    environment:
      - HOST=db
      - USER=odoo
      - PASSWORD=${ODOO_DB_PASSWORD}
    command: --addons-path=/mnt/extra-addons,/mnt/oca-addons
```

### 3. Clone de los Repositorios OCA

```bash
#!/bin/bash
# Script: install_oca_modules.sh

OCA_BASE="/opt/odoo/oca"
ODOO_VERSION="19.0"

# Crear estructura
mkdir -p $OCA_BASE
cd $OCA_BASE

# Helpdesk
git clone -b $ODOO_VERSION https://github.com/OCA/helpdesk.git

# Project
git clone -b $ODOO_VERSION https://github.com/OCA/project.git

# REST Framework
git clone -b $ODOO_VERSION https://github.com/OCA/rest-framework.git

# Reporting Engine
git clone -b $ODOO_VERSION https://github.com/OCA/reporting-engine.git

# Server UX
git clone -b $ODOO_VERSION https://github.com/OCA/server-ux.git

# Stock Logistics
git clone -b $ODOO_VERSION https://github.com/OCA/stock-logistics-warehouse.git

# Maintenance
git clone -b $ODOO_VERSION https://github.com/OCA/maintenance.git

# Agreement
git clone -b $ODOO_VERSION https://github.com/OCA/contract.git

echo "Módulos OCA instalados con éxito!"
```

### 4. Configuración del odoo.conf

```ini
[options]
addons_path = /mnt/extra-addons,/mnt/oca-addons/helpdesk,/mnt/oca-addons/project,/mnt/oca-addons/rest-framework,/mnt/oca-addons/reporting-engine,/mnt/oca-addons/server-ux,/mnt/oca-addons/stock-logistics-warehouse,/mnt/oca-addons/maintenance,/mnt/oca-addons/contract

admin_passwd = ${ODOO_ADMIN_PASSWORD}
db_host = db
db_port = 5432
db_user = odoo
db_password = ${ODOO_DB_PASSWORD}
db_name = neonetbox_odoo

# Performance
workers = 4
max_cron_threads = 2
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_request = 8192
limit_time_cpu = 600
limit_time_real = 1200

# Logging
log_level = info
log_handler = :INFO
logfile = /var/log/odoo/odoo.log
```

## Activación de los Módulos

### Vía Interfaz Web

1. Acceda: `http://localhost:8069`
2. Navegue: **Apps** > **Update Apps List**
3. Remueva filtro: **Apps**
4. Busque por módulo OCA deseado
5. Haga clic en **Install**

### Vía CLI

```bash
# Instalar helpdesk completo
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  --addons-path=/mnt/oca-addons \
  --load=helpdesk_mgmt,helpdesk_mgmt_sla,helpdesk_type_sla

# Instalar REST framework
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  --load=fastapi,queue_job,pydantic

# Instalar reporting
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  --load=report_xlsx,bi_sql_editor
```

## Integración con NetBox y Wazuh

### 1. FastAPI para Integración

```python
# /opt/odoo/addons/neo_integration/controllers/netbox_api.py

from odoo import http
from odoo.addons.fastapi.dependencies import authenticated_partner

@http.route('/api/netbox/devices', auth='api_key', methods=['GET'])
def sync_netbox_devices(self):
    """Sincroniza dispositivos de NetBox con Odoo Maintenance"""
    import requests

    netbox_url = "http://netbox:8000/api/dcim/devices/"
    headers = {"Authorization": f"Token {NETBOX_TOKEN}"}

    response = requests.get(netbox_url, headers=headers)
    devices = response.json()['results']

    Equipment = http.request.env['maintenance.equipment']

    for device in devices:
        Equipment.sudo().create({
            'name': device['name'],
            'serial_no': device['serial'],
            'model': device['device_type']['model'],
            'location': device['site']['name'],
            'category_id': self._get_category(device['device_role']['slug']),
        })

    return {"status": "success", "imported": len(devices)}
```

### 2. Alertas de Wazuh para Tickets

```python
# /opt/odoo/addons/neo_integration/models/wazuh_alert.py

from odoo import models, fields, api

class WazuhAlert(models.Model):
    _name = 'wazuh.alert'
    _description = 'Alerta de Seguridad Wazuh'

    alert_id = fields.Char('ID de Alerta', required=True)
    rule_id = fields.Char('ID de Regla')
    level = fields.Integer('Nivel de Severidad')
    description = fields.Text('Descripción')
    agent_name = fields.Char('Nombre del Agente')
    timestamp = fields.Datetime('Fecha y Hora')
    ticket_id = fields.Many2one('helpdesk.ticket', string='Ticket Relacionado')

    @api.model
    def create_ticket_from_alert(self, alert_data):
        """Crea ticket automáticamente a partir de alerta Wazuh"""
        Ticket = self.env['helpdesk.ticket']

        # Crear ticket si severidad >= 7
        if alert_data.get('level', 0) >= 7:
            ticket = Ticket.create({
                'name': f"[SECURITY] {alert_data['rule_description']}",
                'description': alert_data['full_log'],
                'priority': '3' if alert_data['level'] >= 10 else '2',
                'team_id': self._get_security_team(),
                'channel_id': self._get_wazuh_channel(),
            })

            alert_data['ticket_id'] = ticket.id

        return self.create(alert_data)
```

## Documentación Detallada

Cada categoría de módulo posee documentación específica:

- **[Helpdesk](helpdesk.md)** - Sistema de tickets, SLA, timesheet
- **[Project](project.md)** - Gestión de proyectos, timeline, plantillas
- **[REST Framework](rest-framework.md)** - FastAPI, queue jobs, pydantic
- **[Reporting Engine](reporting-engine.md)** - Excel, CSV, BI SQL
- **[Server UX](server-ux.md)** - Anuncios, acciones en masa, filtros
- **[Stock Logistics](stock-logistics.md)** - Inventario, zonas, movimiento
- **[Maintenance](maintenance.md)** - CMMS, planes, jerarquía
- **[Agreement](agreement.md)** - Contratos, SLA, ventas

## Troubleshooting General

### Problema: Módulo no aparece en la lista

```bash
# Actualizar lista de módulos
docker exec -it neo_odoo odoo shell -d neonetbox_odoo -c /etc/odoo/odoo.conf \
  --update=base --stop-after-init

# Verificar paths en el contenedor
docker exec -it neo_odoo ls -la /mnt/oca-addons
```

### Problema: Error de dependencias

```python
# Verificar dependencias de un módulo
import ast

with open('/mnt/oca-addons/helpdesk/helpdesk_mgmt/__manifest__.py') as f:
    manifest = ast.literal_eval(f.read())
    print(manifest['depends'])

# Instalar dependencias primero
# odoo --install-module base,web,mail antes de instalar helpdesk_mgmt
```

### Problema: Conflicto de versiones

```bash
# Verificar versión de Odoo
docker exec -it neo_odoo odoo --version

# Verificar versión del módulo OCA
cat /mnt/oca-addons/helpdesk/helpdesk_mgmt/__manifest__.py | grep version

# Cambiar branch si necesario
cd /opt/odoo/oca/helpdesk
git checkout 19.0
```

## Monitoreo con Wazuh

### Regla Personalizada para Logs Odoo

```xml
<!-- /var/ossec/etc/rules/local_rules.xml -->
<group name="odoo,">
  <rule id="100010" level="3">
    <decoded_as>odoo</decoded_as>
    <description>Evento de módulo OCA de Odoo</description>
  </rule>

  <rule id="100011" level="5">
    <if_sid>100010</if_sid>
    <match>ERROR</match>
    <description>Error de módulo OCA de Odoo</description>
  </rule>

  <rule id="100012" level="10">
    <if_sid>100010</if_sid>
    <match>CRITICAL</match>
    <description>Error crítico de módulo OCA de Odoo</description>
  </rule>
</group>
```

## Performance y Optimización

### 1. Cache de Queries

```python
# Usar computed fields con store=True
from odoo import fields, models, api

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    @api.depends('create_date', 'close_date')
    def _compute_resolution_time(self):
        for ticket in self:
            if ticket.close_date:
                delta = ticket.close_date - ticket.create_date
                ticket.resolution_time = delta.total_seconds() / 3600
            else:
                ticket.resolution_time = 0

    resolution_time = fields.Float(
        'Tiempo de Resolución (horas)',
        compute='_compute_resolution_time',
        store=True,  # Almacena en la base para queries rápidas
    )
```

### 2. Índices en PostgreSQL

```sql
-- Crear índices para búsquedas rápidas
CREATE INDEX idx_helpdesk_ticket_create_date
ON helpdesk_ticket(create_date);

CREATE INDEX idx_helpdesk_ticket_team_stage
ON helpdesk_ticket(team_id, stage_id);

CREATE INDEX idx_maintenance_equipment_category
ON maintenance_equipment(category_id);
```

### 3. Queue Jobs para Procesos Largos

```python
from odoo import models, api
from odoo.addons.queue_job.job import job

class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    @job
    def sync_from_netbox(self):
        """Sincroniza equipos de NetBox en background"""
        # Proceso largo ejecutado vía queue_job
        self._sync_netbox_devices()

    def action_sync_netbox(self):
        """Trigger para sincronización"""
        self.with_delay().sync_from_netbox()
```

## Backup y Restore

### Backup de Módulos OCA

```bash
#!/bin/bash
# Script: backup_oca.sh

BACKUP_DIR="/opt/backups/oca"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup de código
tar -czf $BACKUP_DIR/oca_modules_$DATE.tar.gz /opt/odoo/oca/

# Backup de base de datos (datos de los módulos)
docker exec neo_db pg_dump -U odoo -d neonetbox_odoo \
  -t 'helpdesk_*' -t 'project_*' -t 'maintenance_*' \
  > $BACKUP_DIR/oca_data_$DATE.sql

echo "Backup completado: $DATE"
```

## Recursos Adicionales

### Enlaces OCA Oficiales

- **Repositorio Principal**: https://github.com/OCA
- **Documentación**: https://odoo-community.org/
- **Helpdesk**: https://github.com/OCA/helpdesk
- **Project**: https://github.com/OCA/project
- **REST Framework**: https://github.com/OCA/rest-framework
- **Reporting**: https://github.com/OCA/reporting-engine

### Comunidad

- **Foro**: https://discuss.odoo.com/c/oca
- **Slack**: https://odoo-community.org/slack
- **Stack Overflow**: Tag [odoo] + [oca]

### Contribuyendo

```bash
# Fork del repositorio
git clone https://github.com/TU_USUARIO/helpdesk.git

# Crear branch para feature
git checkout -b feature/nueva-funcionalidad

# Commit siguiendo patrón OCA
git commit -m "[ADD] helpdesk_mgmt: nueva funcionalidad X"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

## Próximos Pasos

1. Explore la documentación específica de cada módulo
2. Configure integraciones con NetBox y Wazuh
3. Personalice workflows conforme su necesidad
4. Implemente monitoreo vía Wazuh
5. Configure backups automatizados

---

**Versión**: 2.0
**Última actualización**: 2025-12-05
**Mantenido por**: Equipo NEO Stack
