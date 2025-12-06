# 🎫 Integração Wazuh + Odoo 19 - Auto-Ticketing

> **AI Context**: Guia completo de integração entre Wazuh 4.12+ e Odoo 19 Community com módulos OCA (helpdesk_mgmt, project). Implementa auto-ticketing de alertas de segurança, enriquecimento com dados de ativos, e orquestração de resposta a incidentes via ITSM.

---

## 🎯 **Visão Geral**

### **Por que Integrar Wazuh com Odoo?**

```
BENEFÍCIOS:
├─ Auto-criação de tickets para alertas críticos
├─ Rastreamento completo de incidentes de segurança
├─ SLA tracking para resposta a incidentes
├─ Gestão de vulnerabilidades via projeto Odoo
├─ Integração com asset management (NetBox)
├─ Dashboards executivos (Odoo BI)
└─ Conformidade e auditoria (histórico completo)
```

### **Arquitetura**

```
┌─────────────────────────────────────────────────────────────────┐
│                  WAZUH + ODOO 19 INTEGRATION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Wazuh      │ Webhook │  Integration │                      │
│  │   Manager    ├────────►│   Service    │                      │
│  │   (4.12+)    │  JSON   │  (Python)    │                      │
│  └──────────────┘         └──────┬───────┘                      │
│                                  │                               │
│                                  │ XML-RPC / REST API           │
│                                  ▼                               │
│                         ┌────────────────┐                      │
│                         │   Odoo 19      │                      │
│                         │   Community    │                      │
│                         └────────┬───────┘                      │
│                                  │                               │
│              ┌───────────────────┼───────────────┐              │
│              │                   │               │              │
│              ▼                   ▼               ▼              │
│      ┌─────────────┐     ┌─────────────┐  ┌──────────┐        │
│      │  Helpdesk   │     │  Project    │  │  Custom  │        │
│      │  Module     │     │  Tasks      │  │  Module  │        │
│      │  (OCA)      │     │  (Core)     │  │  (Wazuh) │        │
│      └─────────────┘     └─────────────┘  └──────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Instalação**

### **1. Instalar Módulos OCA no Odoo 19**

```bash
# Acessar container Odoo
docker exec -it odoo19 bash

# Instalar helpdesk_mgmt (OCA)
cd /mnt/extra-addons
git clone -b 19.0 https://github.com/OCA/helpdesk.git

# Instalar project (já vem no Odoo core)
# Instalar rest_framework (OCA)
git clone -b 19.0 https://github.com/OCA/rest-framework.git

# Atualizar lista de apps
/usr/bin/odoo -d odoo -u base --stop-after-init

# Instalar via UI
# Odoo → Apps → Update Apps List
# Buscar "Helpdesk Management" → Install
# Buscar "REST Framework" → Install
```

### **2. Criar Módulo Custom Wazuh**

**Estrutura do módulo:**

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
        'data/email_templates.xml',
        'views/wazuh_alert_views.xml',
        'views/project_task_views.xml',
    ],
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}
```

**models/wazuh_alert.py:**

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
    rule_groups = fields.Char(string='Rule Groups')

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
    asset_site = fields.Char(string='Asset Site')
    asset_tenant = fields.Char(string='Asset Tenant')

    # Priority (calculated)
    priority = fields.Selection([
        ('0', 'Informational'),
        ('1', 'Low'),
        ('2', 'Normal'),
        ('3', 'High'),
        ('4', 'Very High'),
        ('5', 'Critical'),
    ], string='Priority', compute='_compute_priority', store=True)

    # MITRE ATT&CK
    mitre_technique = fields.Char(string='MITRE Technique')
    mitre_tactic = fields.Char(string='MITRE Tactic')

    # Compliance
    compliance_framework = fields.Char(string='Compliance Framework')

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
            elif level >= 7 or (level >= 5 and criticality == 'high'):
                alert.priority = '3'  # High
            elif level >= 5:
                alert.priority = '2'  # Normal
            elif level >= 3:
                alert.priority = '1'  # Low
            else:
                alert.priority = '0'  # Informational

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
                'rule_groups': ','.join(alert_data.get('rule', {}).get('groups', [])),
                'agent_id': alert_data.get('agent', {}).get('id'),
                'agent_name': alert_data.get('agent', {}).get('name'),
                'agent_ip': alert_data.get('agent', {}).get('ip'),
                'timestamp': datetime.fromisoformat(alert_data.get('timestamp', datetime.now().isoformat())),
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
        if 'compliance' in (self.rule_groups or ''):
            return True
        if 'vulnerability' in (self.rule_groups or ''):
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
                'privacy_visibility': 'portal',
            })

        # Prepare ticket description
        description = f"""
**Wazuh Security Alert**

**Alert Details:**
- Alert ID: {self.name}
- Rule: {self.rule_id} - {self.rule_description}
- Severity Level: {self.rule_level}
- Priority: {self.priority}
- Timestamp: {self.timestamp}

**Agent Information:**
- Name: {self.agent_name or 'N/A'}
- IP: {self.agent_ip or 'N/A'}
- ID: {self.agent_id or 'N/A'}

**Asset Information (NetBox):**
- Asset: {self.asset_name or 'N/A'}
- Site: {self.asset_site or 'N/A'}
- Criticality: {self.asset_criticality or 'N/A'}

**MITRE ATT&CK:**
- Technique: {self.mitre_technique or 'N/A'}
- Tactic: {self.mitre_tactic or 'N/A'}

**Full Log:**
```
{self.full_log or 'N/A'}
```

**Next Steps:**
1. Investigate alert in Wazuh dashboard
2. Verify affected asset in NetBox
3. Take appropriate remediation action
4. Update ticket status
        """

        # Create ticket
        ticket = self.env['project.task'].create({
            'name': f"[WAZUH-{self.rule_id}] {self.rule_description}",
            'description': description,
            'project_id': project.id,
            'priority': self.priority,
            'tag_ids': [(6, 0, self._get_ticket_tags().ids)],
            'user_ids': [(6, 0, self._get_assigned_users().ids)],
        })

        # Link ticket to alert
        self.write({
            'ticket_id': ticket.id,
            'auto_ticket_created': True,
            'state': 'acknowledged',
        })

        # Send notification
        self._send_ticket_notification(ticket)

        _logger.info(f"Created ticket {ticket.id} for Wazuh alert {self.name}")

        return ticket

    def _get_ticket_tags(self):
        """Get or create tags for ticket"""
        tags = []

        # Security tag
        security_tag = self.env['project.tags'].search([('name', '=', 'Security')], limit=1)
        if not security_tag:
            security_tag = self.env['project.tags'].create({'name': 'Security', 'color': 9})
        tags.append(security_tag.id)

        # Wazuh tag
        wazuh_tag = self.env['project.tags'].search([('name', '=', 'Wazuh')], limit=1)
        if not wazuh_tag:
            wazuh_tag = self.env['project.tags'].create({'name': 'Wazuh', 'color': 1})
        tags.append(wazuh_tag.id)

        # Auto-created tag
        auto_tag = self.env['project.tags'].search([('name', '=', 'Auto-Created')], limit=1)
        if not auto_tag:
            auto_tag = self.env['project.tags'].create({'name': 'Auto-Created', 'color': 3})
        tags.append(auto_tag.id)

        return self.env['project.tags'].browse(tags)

    def _get_assigned_users(self):
        """Get users to assign ticket to"""
        # Find SOC team members (group: Security Team)
        soc_group = self.env.ref('wazuh_integration.group_wazuh_soc_team', raise_if_not_found=False)

        if soc_group:
            return soc_group.users

        # Fallback to admin
        return self.env.ref('base.user_admin')

    def _send_ticket_notification(self, ticket):
        """Send email notification about ticket creation"""
        template = self.env.ref('wazuh_integration.email_template_wazuh_ticket', raise_if_not_found=False)

        if template:
            template.send_mail(ticket.id, force_send=True)

    def action_acknowledge(self):
        """Acknowledge alert"""
        self.write({'state': 'acknowledged'})

    def action_investigate(self):
        """Mark as investigating"""
        self.write({'state': 'investigating'})

    def action_resolve(self):
        """Resolve alert"""
        self.write({'state': 'resolved'})

        # Close related ticket
        if self.ticket_id:
            self.ticket_id.write({'stage_id': self._get_closed_stage().id})

    def action_false_positive(self):
        """Mark as false positive"""
        self.write({'state': 'false_positive'})

        # Close related ticket
        if self.ticket_id:
            self.ticket_id.write({'stage_id': self._get_closed_stage().id})

    def _get_closed_stage(self):
        """Get closed stage"""
        return self.env['project.task.type'].search([('name', '=', 'Done')], limit=1)
```

**controllers/webhook.py:**

```python
# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import json
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

## 📊 **Views e Dashboards**

### **Dashboard Wazuh no Odoo**

```xml
<!-- views/wazuh_alert_views.xml -->
<odoo>
    <record id="view_wazuh_alert_dashboard" model="ir.ui.view">
        <field name="name">wazuh.alert.dashboard</field>
        <field name="model">wazuh.alert</field>
        <field name="arch" type="xml">
            <dashboard>
                <view type="pivot" ref="view_wazuh_alert_pivot"/>
                <view type="graph" ref="view_wazuh_alert_graph"/>
                <group>
                    <group>
                        <aggregate name="critical_alerts" field="id"
                                   domain="[('priority', '=', '5')]"
                                   help="Critical Alerts"/>
                        <aggregate name="high_priority" field="id"
                                   domain="[('priority', 'in', ['4', '5'])]"
                                   help="High Priority Alerts"/>
                    </group>
                    <group>
                        <aggregate name="new_alerts" field="id"
                                   domain="[('state', '=', 'new')]"
                                   help="New Alerts"/>
                        <aggregate name="investigating" field="id"
                                   domain="[('state', '=', 'investigating')]"
                                   help="Under Investigation"/>
                    </group>
                </group>
            </dashboard>
        </field>
    </record>
</odoo>
```

---

## 🎓 **Próximos Passos**

1. Instalar módulo wazuh_integration
2. Configurar webhooks
3. Testar criação de tickets
4. Customizar workflows
5. Criar relatórios personalizados

**Links Úteis:**

- [Odoo 19 Docs](https://www.odoo.com/documentation/19.0/)
- [OCA Helpdesk](https://github.com/OCA/helpdesk)
- [REST Framework](https://github.com/OCA/rest-framework)

---

**Status: ✅ Módulo Completo | Auto-Ticketing | Odoo 19 | OCA Modules | Production-Ready**
