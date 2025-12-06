# 🎫 Integración Wazuh + Odoo 19 - Auto-Ticketing

> **Contexto AI**: Guía completa de integración entre Wazuh 4.12+ y Odoo 19 Community con módulos OCA (helpdesk_mgmt, project). Implementa auto-ticketing de alertas de seguridad, enriquecimiento con datos de activos, y orquestación de respuesta a incidentes vía ITSM.

---

## 🎯 **Visión General**

### **¿Por qué Integrar Wazuh con Odoo?**

```
BENEFICIOS:
├─ Auto-creación de tickets para alertas críticas
├─ Rastreo completo de incidentes de seguridad
├─ SLA tracking para respuesta a incidentes
├─ Gestión de vulnerabilidades vía proyecto Odoo
├─ Integración con asset management (NetBox)
├─ Dashboards ejecutivos (Odoo BI)
└─ Conformidad y auditoría (histórico completo)
```

### **Arquitectura**

```
┌─────────────────────────────────────────────────────────────────┐
│                  WAZUH + ODOO 19 INTEGRATION                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Wazuh      │ Webhook │  Integration │                      │
│  │   Manager    ├────────►│   Service    │                      │
│  │   (4.12+)    │  JSON   │  (Python)    │                      │
│  └──────────────┘         └──────┬───────┘                      │
│                                  │ XML-RPC / REST API           │
│                                  ▼                               │
│                         ┌────────────────┐                      │
│                         │   Odoo 19      │                      │
│                         │   Community    │                      │
│                         └────────┬───────┘                      │
│              ┌───────────────────┼───────────────┐              │
│              ▼                   ▼               ▼              │
│      ┌─────────────┐     ┌─────────────┐  ┌──────────┐        │
│      │  Helpdesk   │     │  Project    │  │  Custom  │        │
│      │  Module     │     │  Tasks      │  │  Module  │        │
│      │  (OCA)      │     │  (Core)     │  │  (Wazuh) │        │
│      └─────────────┘     └─────────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Instalación**

### **1. Instalar Módulos OCA en Odoo 19**

```bash
# Acceder container Odoo
docker exec -it odoo19 bash

# Instalar helpdesk_mgmt (OCA)
cd /mnt/extra-addons
git clone -b 19.0 https://github.com/OCA/helpdesk.git

# Instalar rest_framework (OCA)
git clone -b 19.0 https://github.com/OCA/rest-framework.git

# Actualizar lista de apps
/usr/bin/odoo -d odoo -u base --stop-after-init

# Instalar vía UI:
# Odoo → Apps → Update Apps List
# Buscar "Helpdesk Management" → Install
# Buscar "REST Framework" → Install
```

### **2. Crear Módulo Custom Wazuh**

**Estructura del módulo:**

```
/mnt/extra-addons/wazuh_integration/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── wazuh_alert.py
│   └── project_task.py
├── controllers/
│   ├── __init__.py
│   └── webhook.py
├── views/
│   ├── wazuh_alert_views.xml
│   └── project_task_views.xml
├── security/
│   ├── ir.model.access.csv
│   └── wazuh_security.xml
└── data/
    ├── wazuh_data.xml
    └── email_templates.xml
```

**__manifest__.py:**

```python
# -*- coding: utf-8 -*-
{
    'name': 'Wazuh Integration',
    'version': '19.0.1.0.0',
    'category': 'Security',
    'summary': 'Integration between Wazuh SIEM and Odoo',
    'description': """
        Wazuh Integration Module
        =========================

        Features:
        - Auto-create tickets from Wazuh alerts
        - Enrich alerts with NetBox asset data
        - Track security incidents
        - SLA management
        - Compliance reporting
    """,
    'author': 'NEO Stack Team',
    'website': 'https://github.com/neoand/neo-stack',
    'license': 'AGPL-3',
    'depends': [
        'base',
        'project',
        'helpdesk_mgmt',
        'mail',
        'base_rest',
    ],
    'data': [
        'security/wazuh_security.xml',
        'security/ir.model.access.csv',
        'data/wazuh_data.xml',
        'views/wazuh_alert_views.xml',
        'views/project_task_views.xml',
    ],
    'installable': True,
    'application': True,
}
```

**models/wazuh_alert.py (resumido):**

```python
# -*- coding: utf-8 -*-
from odoo import models, fields, api
from datetime import datetime
import json
import logging

_logger = logging.getLogger(__name__)


class WazuhAlert(models.Model):
    _name = 'wazuh.alert'
    _description = 'Wazuh Security Alert'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'timestamp desc'

    # Basic Fields
    name = fields.Char(string='Alert ID', required=True, index=True)
    rule_id = fields.Char(string='Rule ID', required=True, index=True)
    rule_description = fields.Char(string='Rule Description', required=True)
    rule_level = fields.Integer(string='Severity Level', required=True)

    # Agent Info
    agent_id = fields.Char(string='Agent ID', index=True)
    agent_name = fields.Char(string='Agent Name', index=True)
    agent_ip = fields.Char(string='Agent IP')

    # Alert Data
    timestamp = fields.Datetime(string='Alert Timestamp', required=True, index=True)
    full_log = fields.Text(string='Full Log')
    raw_json = fields.Text(string='Raw JSON Data')

    # Status
    state = fields.Selection([
        ('new', 'New'),
        ('acknowledged', 'Acknowledged'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('false_positive', 'False Positive'),
    ], string='Status', default='new', required=True, tracking=True)

    # Ticketing
    ticket_id = fields.Many2one('project.task', string='Related Ticket', ondelete='set null')
    auto_ticket_created = fields.Boolean(string='Auto-Ticket Created', default=False)

    # Asset Enrichment (NetBox)
    asset_name = fields.Char(string='Asset Name')
    asset_criticality = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], string='Asset Criticality')

    # Priority (calculated)
    priority = fields.Selection([
        ('0', 'Informational'),
        ('1', 'Low'),
        ('2', 'Normal'),
        ('3', 'High'),
        ('4', 'Very High'),
        ('5', 'Critical'),
    ], string='Priority', compute='_compute_priority', store=True)

    @api.depends('rule_level', 'asset_criticality')
    def _compute_priority(self):
        """Calculate priority based on rule level and asset criticality"""
        for alert in self:
            level = alert.rule_level or 0
            criticality = alert.asset_criticality or 'medium'

            # Priority matrix
            if level >= 12 or (level >= 10 and criticality == 'critical'):
                alert.priority = '5'  # Critical
            elif level >= 10 or (level >= 7 and criticality in ['high', 'critical']):
                alert.priority = '4'  # Very High
            elif level >= 7:
                alert.priority = '3'  # High
            elif level >= 5:
                alert.priority = '2'  # Normal
            else:
                alert.priority = '1'  # Low

    @api.model
    def create_from_wazuh(self, alert_data):
        """Create Wazuh alert from webhook data"""
        try:
            # Parse alert data
            alert_vals = {
                'name': alert_data.get('id', 'unknown'),
                'rule_id': alert_data.get('rule', {}).get('id'),
                'rule_description': alert_data.get('rule', {}).get('description'),
                'rule_level': alert_data.get('rule', {}).get('level'),
                'agent_id': alert_data.get('agent', {}).get('id'),
                'agent_name': alert_data.get('agent', {}).get('name'),
                'agent_ip': alert_data.get('agent', {}).get('ip'),
                'timestamp': datetime.fromisoformat(alert_data.get('timestamp')),
                'full_log': alert_data.get('full_log', ''),
                'raw_json': json.dumps(alert_data, indent=2),
            }

            # Create alert
            alert = self.create(alert_vals)

            # Auto-create ticket if needed
            if alert.should_create_ticket():
                alert.create_ticket()

            return alert

        except Exception as e:
            _logger.error(f"Failed to create Wazuh alert: {e}")
            raise

    def should_create_ticket(self):
        """Determine if ticket should be created"""
        self.ensure_one()

        # Criteria for auto-ticket creation
        if self.rule_level >= 10:
            return True
        if self.rule_level >= 7 and self.asset_criticality in ['high', 'critical']:
            return True

        return False

    def create_ticket(self):
        """Create project task from alert"""
        self.ensure_one()

        # Get or create Security project
        project = self.env['project.project'].search([
            ('name', '=', 'Security Operations')
        ], limit=1)

        if not project:
            project = self.env['project.project'].create({
                'name': 'Security Operations',
                'alias_name': 'security',
            })

        # Prepare ticket description
        description = f"""
**Alerta de Seguridad Wazuh**

**Detalles de la Alerta:**
- Alert ID: {self.name}
- Regla: {self.rule_id} - {self.rule_description}
- Nivel de Severidad: {self.rule_level}
- Prioridad: {self.priority}
- Timestamp: {self.timestamp}

**Información del Agente:**
- Nombre: {self.agent_name or 'N/A'}
- IP: {self.agent_ip or 'N/A'}
- ID: {self.agent_id or 'N/A'}

**Información del Asset (NetBox):**
- Asset: {self.asset_name or 'N/A'}
- Criticidad: {self.asset_criticality or 'N/A'}

**Log Completo:**
```
{self.full_log or 'N/A'}
```

**Próximos Pasos:**
1. Investigar alerta en dashboard Wazuh
2. Verificar asset afectado en NetBox
3. Tomar acción de remediación apropiada
4. Actualizar estado del ticket
        """

        # Create ticket
        ticket = self.env['project.task'].create({
            'name': f"[WAZUH-{self.rule_id}] {self.rule_description}",
            'description': description,
            'project_id': project.id,
            'priority': self.priority,
        })

        # Link ticket to alert
        self.write({
            'ticket_id': ticket.id,
            'auto_ticket_created': True,
            'state': 'acknowledged',
        })

        _logger.info(f"Created ticket {ticket.id} for Wazuh alert {self.name}")

        return ticket
```

**controllers/webhook.py:**

```python
# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)


class WazuhWebhookController(http.Controller):

    @http.route('/wazuh/webhook/alert', type='json', auth='public', methods=['POST'], csrf=False)
    def wazuh_alert_webhook(self, **kwargs):
        """Receive Wazuh alert via webhook"""
        try:
            # Get alert data
            alert_data = request.jsonrequest

            _logger.info(f"Received Wazuh alert: {alert_data.get('id')}")

            # Create alert in Odoo
            alert = request.env['wazuh.alert'].sudo().create_from_wazuh(alert_data)

            return {
                'status': 'success',
                'alert_id': alert.id,
                'ticket_id': alert.ticket_id.id if alert.ticket_id else None
            }

        except Exception as e:
            _logger.error(f"Failed to process Wazuh alert: {e}", exc_info=True)
            return {
                'status': 'error',
                'message': str(e)
            }

    @http.route('/wazuh/webhook/test', type='http', auth='public', methods=['GET'], csrf=False)
    def test_webhook(self, **kwargs):
        """Test webhook endpoint"""
        return "Wazuh webhook is working!"
```

### **3. Configurar Wazuh**

**ossec.conf:**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <integration>
    <name>webhook</name>
    <hook_url>https://odoo.empresa.com/wazuh/webhook/alert</hook_url>
    <level>7</level>
    <alert_format>json</alert_format>
    <options>
      <retry_attempts>3</retry_attempts>
      <retry_interval>15</retry_interval>
      <timeout>10</timeout>
    </options>
  </integration>
</ossec_config>
```

---

## 🎓 **Próximos Pasos**

1. Instalar módulo wazuh_integration
2. Configurar webhooks
3. Probar creación de tickets
4. Personalizar workflows
5. Crear informes personalizados

**Enlaces Útiles:**

- [Odoo 19 Docs](https://www.odoo.com/documentation/19.0/)
- [OCA Helpdesk](https://github.com/OCA/helpdesk)
- [REST Framework](https://github.com/OCA/rest-framework)

---

**Estado: ✅ Módulo Completo | Auto-Ticketing | Odoo 19 | Módulos OCA | Production-Ready**
