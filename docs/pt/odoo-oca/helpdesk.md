# Módulos OCA Helpdesk

> **AI Context**: Documentação completa dos módulos de helpdesk da OCA para Odoo 19, incluindo gestão de tickets, SLA, integração com projetos e timesheet. Estes módulos substituem o Odoo Helpdesk Enterprise e fornecem funcionalidades ITSM completas integradas com NetBox (CMDB) e Wazuh (SIEM) no NEO_NETBOX_ODOO_STACK. Referência para implementação de service desk com controle de SLA, escalação automática e rastreamento de tempo.

## Visão Geral

Os módulos de **Helpdesk OCA** fornecem um sistema completo de **gestão de tickets** e **service desk** para Odoo 19, substituindo o módulo Enterprise com funcionalidades equivalentes ou superiores.

### Módulos Incluídos

| Módulo | Versão | Função | Status |
|--------|--------|--------|--------|
| helpdesk_mgmt | 19.0.1.0.0 | Gestão básica de tickets | Ativo |
| helpdesk_mgmt_sla | 19.0.1.0.0 | SLA e deadlines | Ativo |
| helpdesk_type_sla | 19.0.1.0.0 | SLA por tipo de ticket | Ativo |
| helpdesk_mgmt_project | 19.0.1.0.0 | Integração com projetos | Ativo |
| helpdesk_mgmt_timesheet | 19.0.1.0.0 | Controle de horas | Ativo |

## Arquitetura

```
┌────────────────────────────────────────────────────────┐
│              Helpdesk Management System                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐      ┌──────────────┐             │
│  │   Wazuh      │─────►│   Tickets    │             │
│  │   Alerts     │      │   (Core)     │             │
│  └──────────────┘      └──────┬───────┘             │
│                               │                      │
│  ┌──────────────┐             │                      │
│  │   NetBox     │             │                      │
│  │   Assets     │────────────►│                      │
│  └──────────────┘             │                      │
│                               │                      │
│                    ┌──────────┼──────────┐          │
│                    │          │          │          │
│              ┌─────▼─────┐ ┌─▼────┐ ┌──▼─────┐    │
│              │    SLA    │ │Teams │ │Project │    │
│              │  Tracking │ │Stages│ │ Tasks  │    │
│              └─────┬─────┘ └─┬────┘ └──┬─────┘    │
│                    │          │          │          │
│              ┌─────▼──────────▼──────────▼─────┐   │
│              │      Timesheet & Reports       │   │
│              └────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Instalação

### 1. Pré-requisitos

```bash
# Dependências Python
pip install python-dateutil
pip install pytz
```

### 2. Clone do Repositório

```bash
cd /opt/odoo/oca
git clone -b 19.0 https://github.com/OCA/helpdesk.git
```

### 3. Configuração no odoo.conf

```ini
[options]
addons_path = /mnt/extra-addons,/mnt/oca-addons/helpdesk
```

### 4. Instalação via Docker

```bash
# Reiniciar container com novo addons_path
docker-compose restart odoo

# Instalar módulos via CLI
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  -i helpdesk_mgmt,helpdesk_mgmt_sla,helpdesk_type_sla,helpdesk_mgmt_project,helpdesk_mgmt_timesheet \
  --stop-after-init
```

## Módulo: helpdesk_mgmt (Core)

### Funcionalidades

- Gestão de tickets com workflow customizável
- Múltiplas equipes (teams) de atendimento
- Estágios personalizados por equipe
- Categorias e tipos de tickets
- Prioridades e tags
- Histórico completo de atividades
- Portal do cliente para acompanhamento

### Configuração Inicial

#### 1. Criar Equipes

```python
# Via shell do Odoo
from odoo import api, SUPERUSER_ID

env = api.Environment(cr, SUPERUSER_ID, {})

# Criar equipe de Service Desk
team_servicedesk = env['helpdesk.ticket.team'].create({
    'name': 'Service Desk',
    'alias_name': 'servicedesk',
    'alias_domain': 'neo.local',
    'use_sla': True,
})

# Criar equipe de Segurança (para alertas Wazuh)
team_security = env['helpdesk.ticket.team'].create({
    'name': 'Security Operations',
    'alias_name': 'security',
    'use_sla': True,
    'default_priority': '3',  # Alta prioridade
})

# Criar equipe de Infraestrutura
team_infra = env['helpdesk.ticket.team'].create({
    'name': 'Infrastructure',
    'alias_name': 'infra',
    'use_sla': True,
})
```

#### 2. Configurar Estágios

```python
# Estágios para Service Desk
stages = [
    {'name': 'Novo', 'sequence': 1, 'is_close': False},
    {'name': 'Em Análise', 'sequence': 2, 'is_close': False},
    {'name': 'Em Progresso', 'sequence': 3, 'is_close': False},
    {'name': 'Aguardando Cliente', 'sequence': 4, 'is_close': False},
    {'name': 'Resolvido', 'sequence': 5, 'is_close': True},
    {'name': 'Cancelado', 'sequence': 6, 'is_close': True},
]

Stage = env['helpdesk.ticket.stage']
for stage_data in stages:
    stage_data['team_ids'] = [(6, 0, [team_servicedesk.id])]
    Stage.create(stage_data)
```

#### 3. Criar Categorias

```python
# Categorias de tickets
categories = [
    'Hardware',
    'Software',
    'Rede',
    'Segurança',
    'Acesso',
    'Backup',
    'Incidente',
    'Solicitação de Serviço',
]

Category = env['helpdesk.ticket.category']
for cat_name in categories:
    Category.create({'name': cat_name})
```

### Exemplo de Uso: Criar Ticket

```python
# Via código Python
from odoo import models, fields, api

class CustomTicketCreator(models.Model):
    _name = 'custom.ticket.creator'

    def create_ticket_from_email(self, subject, body, email_from):
        """Cria ticket a partir de email recebido"""
        Ticket = self.env['helpdesk.ticket']

        # Buscar ou criar parceiro
        Partner = self.env['res.partner']
        partner = Partner.search([('email', '=', email_from)], limit=1)
        if not partner:
            partner = Partner.create({
                'name': email_from.split('@')[0],
                'email': email_from,
            })

        # Criar ticket
        ticket = Ticket.create({
            'name': subject,
            'description': body,
            'partner_id': partner.id,
            'partner_email': email_from,
            'team_id': self._get_default_team(),
            'priority': '2',  # Normal
        })

        return ticket

    def _get_default_team(self):
        """Retorna equipe padrão"""
        return self.env.ref('helpdesk_mgmt.helpdesk_team_servicedesk').id
```

### API REST para Tickets

```python
# /opt/odoo/addons/neo_helpdesk_api/controllers/ticket_api.py

from odoo import http
from odoo.http import request
import json

class HelpdeskAPI(http.Controller):

    @http.route('/api/helpdesk/tickets', type='json', auth='api_key', methods=['POST'])
    def create_ticket(self, **kwargs):
        """Criar ticket via API"""
        Ticket = request.env['helpdesk.ticket']

        data = json.loads(request.httprequest.data)

        ticket = Ticket.sudo().create({
            'name': data.get('subject'),
            'description': data.get('description'),
            'partner_email': data.get('email'),
            'priority': data.get('priority', '2'),
            'team_id': data.get('team_id'),
        })

        return {
            'status': 'success',
            'ticket_id': ticket.id,
            'ticket_number': ticket.number,
        }

    @http.route('/api/helpdesk/tickets/<int:ticket_id>', type='json', auth='api_key', methods=['GET'])
    def get_ticket(self, ticket_id):
        """Obter detalhes de um ticket"""
        Ticket = request.env['helpdesk.ticket']
        ticket = Ticket.sudo().browse(ticket_id)

        if not ticket.exists():
            return {'status': 'error', 'message': 'Ticket not found'}

        return {
            'status': 'success',
            'ticket': {
                'id': ticket.id,
                'number': ticket.number,
                'name': ticket.name,
                'description': ticket.description,
                'stage': ticket.stage_id.name,
                'priority': ticket.priority,
                'create_date': ticket.create_date.isoformat(),
                'user_id': ticket.user_id.name,
            }
        }

    @http.route('/api/helpdesk/tickets/<int:ticket_id>/comment', type='json', auth='api_key', methods=['POST'])
    def add_comment(self, ticket_id, **kwargs):
        """Adicionar comentário ao ticket"""
        Ticket = request.env['helpdesk.ticket']
        ticket = Ticket.sudo().browse(ticket_id)

        data = json.loads(request.httprequest.data)

        ticket.message_post(
            body=data.get('message'),
            message_type='comment',
            subtype_xmlid='mail.mt_note',
        )

        return {'status': 'success'}
```

## Módulo: helpdesk_mgmt_sla

### Funcionalidades

- Definição de SLA por equipe
- Cálculo automático de deadlines
- Alertas de violação de SLA
- Relatórios de performance de SLA
- Pausar/Retomar contagem de SLA

### Configuração de SLA

```python
# Criar SLA para Service Desk
SLA = env['helpdesk.ticket.sla']

# SLA para tickets críticos
sla_critical = SLA.create({
    'name': 'Crítico - 4 horas',
    'team_id': team_servicedesk.id,
    'priority': '3',  # Alta prioridade
    'time_hours': 4,
    'time_days': 0,
})

# SLA para tickets normais
sla_normal = SLA.create({
    'name': 'Normal - 24 horas',
    'team_id': team_servicedesk.id,
    'priority': '2',
    'time_hours': 24,
    'time_days': 0,
})

# SLA para tickets baixa prioridade
sla_low = SLA.create({
    'name': 'Baixa - 72 horas',
    'team_id': team_servicedesk.id,
    'priority': '1',
    'time_hours': 0,
    'time_days': 3,
})
```

### Cálculo Automático de SLA

```python
# Model customizado para SLA
from odoo import models, fields, api
from datetime import datetime, timedelta

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    sla_deadline = fields.Datetime('SLA Deadline', compute='_compute_sla_deadline', store=True)
    sla_violated = fields.Boolean('SLA Violated', compute='_compute_sla_violated')
    sla_remaining_hours = fields.Float('Hours to Deadline', compute='_compute_sla_remaining')

    @api.depends('create_date', 'priority', 'team_id')
    def _compute_sla_deadline(self):
        for ticket in self:
            if not ticket.create_date or not ticket.team_id:
                ticket.sla_deadline = False
                continue

            # Buscar SLA aplicável
            SLA = self.env['helpdesk.ticket.sla']
            sla = SLA.search([
                ('team_id', '=', ticket.team_id.id),
                ('priority', '=', ticket.priority),
            ], limit=1)

            if sla:
                hours = sla.time_hours + (sla.time_days * 24)
                ticket.sla_deadline = ticket.create_date + timedelta(hours=hours)
            else:
                ticket.sla_deadline = False

    @api.depends('sla_deadline', 'stage_id')
    def _compute_sla_violated(self):
        now = fields.Datetime.now()
        for ticket in self:
            if ticket.sla_deadline and not ticket.stage_id.is_close:
                ticket.sla_violated = now > ticket.sla_deadline
            else:
                ticket.sla_violated = False

    @api.depends('sla_deadline')
    def _compute_sla_remaining(self):
        now = fields.Datetime.now()
        for ticket in self:
            if ticket.sla_deadline:
                delta = ticket.sla_deadline - now
                ticket.sla_remaining_hours = delta.total_seconds() / 3600
            else:
                ticket.sla_remaining_hours = 0
```

### Alertas de Violação de SLA

```python
# Cron job para alertas de SLA
from odoo import models, api

class HelpdeskSLAAlert(models.Model):
    _name = 'helpdesk.sla.alert'
    _description = 'SLA Alert System'

    @api.model
    def _cron_check_sla_violations(self):
        """Executado a cada hora para verificar violações de SLA"""
        Ticket = self.env['helpdesk.ticket']
        now = fields.Datetime.now()
        warning_threshold = timedelta(hours=2)

        # Tickets com SLA próximo de expirar (2h)
        tickets_warning = Ticket.search([
            ('sla_deadline', '!=', False),
            ('sla_deadline', '<=', now + warning_threshold),
            ('sla_deadline', '>', now),
            ('stage_id.is_close', '=', False),
        ])

        for ticket in tickets_warning:
            self._send_warning_email(ticket)

        # Tickets com SLA violado
        tickets_violated = Ticket.search([
            ('sla_deadline', '!=', False),
            ('sla_deadline', '<', now),
            ('stage_id.is_close', '=', False),
        ])

        for ticket in tickets_violated:
            self._escalate_ticket(ticket)

    def _send_warning_email(self, ticket):
        """Envia email de aviso de SLA"""
        template = self.env.ref('helpdesk_mgmt_sla.sla_warning_email_template')
        template.send_mail(ticket.id, force_send=True)

    def _escalate_ticket(self, ticket):
        """Escalona ticket com SLA violado"""
        # Aumentar prioridade
        if ticket.priority != '3':
            ticket.priority = '3'

        # Notificar gerente da equipe
        if ticket.team_id.manager_id:
            ticket.message_post(
                body=f"SLA VIOLADO! Ticket #{ticket.number} ultrapassou o deadline.",
                partner_ids=[ticket.team_id.manager_id.partner_id.id],
                message_type='notification',
            )

        # Criar log de violação
        self.env['helpdesk.sla.violation'].create({
            'ticket_id': ticket.id,
            'deadline': ticket.sla_deadline,
            'violation_date': fields.Datetime.now(),
        })
```

## Módulo: helpdesk_type_sla

### Funcionalidades

- SLA específico por tipo de ticket
- Suporte a múltiplos SLAs por ticket
- SLA com condições (categoria, prioridade, tipo)

### Configuração de SLA por Tipo

```python
# Criar tipos de ticket
TicketType = env['helpdesk.ticket.type']

type_incident = TicketType.create({
    'name': 'Incidente',
    'default_priority': '3',
})

type_request = TicketType.create({
    'name': 'Solicitação de Serviço',
    'default_priority': '2',
})

# SLA para incidentes
SLA.create({
    'name': 'Incidente Crítico - 2h',
    'team_id': team_servicedesk.id,
    'ticket_type_id': type_incident.id,
    'priority': '3',
    'time_hours': 2,
})

# SLA para solicitações
SLA.create({
    'name': 'Solicitação Normal - 48h',
    'team_id': team_servicedesk.id,
    'ticket_type_id': type_request.id,
    'priority': '2',
    'time_hours': 48,
})
```

## Módulo: helpdesk_mgmt_project

### Funcionalidades

- Conversão de tickets em tarefas de projeto
- Vinculação de tickets a projetos existentes
- Sincronização de status ticket/tarefa
- Visibilidade de tarefas no ticket

### Converter Ticket em Tarefa

```python
# Model customizado
from odoo import models, api

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    project_task_ids = fields.One2many('project.task', 'ticket_id', string='Tasks')
    project_task_count = fields.Integer(compute='_compute_task_count')

    @api.depends('project_task_ids')
    def _compute_task_count(self):
        for ticket in self:
            ticket.project_task_count = len(ticket.project_task_ids)

    def action_convert_to_task(self):
        """Converte ticket em tarefa de projeto"""
        self.ensure_one()

        Task = self.env['project.task']

        # Buscar projeto padrão da equipe
        project = self.team_id.default_project_id
        if not project:
            raise UserError('Configure um projeto padrão para a equipe.')

        # Criar tarefa
        task = Task.create({
            'name': self.name,
            'description': self.description,
            'project_id': project.id,
            'user_ids': [(6, 0, [self.user_id.id])] if self.user_id else [],
            'partner_id': self.partner_id.id,
            'ticket_id': self.id,
            'priority': self.priority,
        })

        # Atualizar ticket
        self.message_post(
            body=f"Ticket convertido em tarefa: <a href='/web#id={task.id}&model=project.task'>{task.name}</a>"
        )

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'project.task',
            'res_id': task.id,
            'view_mode': 'form',
            'target': 'current',
        }
```

## Módulo: helpdesk_mgmt_timesheet

### Funcionalidades

- Registro de horas trabalhadas em tickets
- Relatórios de tempo por técnico/equipe
- Integração com faturamento (opcional)
- Controle de horas estimadas vs reais

### Registrar Horas no Ticket

```python
# Adicionar timesheet ao ticket
from odoo import models, fields

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    timesheet_ids = fields.One2many('account.analytic.line', 'ticket_id', string='Timesheets')
    total_hours = fields.Float('Total Hours', compute='_compute_total_hours')

    @api.depends('timesheet_ids.unit_amount')
    def _compute_total_hours(self):
        for ticket in self:
            ticket.total_hours = sum(ticket.timesheet_ids.mapped('unit_amount'))

    def action_add_timesheet(self):
        """Abrir wizard para adicionar horas"""
        return {
            'type': 'ir.actions.act_window',
            'name': 'Adicionar Horas',
            'res_model': 'account.analytic.line',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_ticket_id': self.id,
                'default_project_id': self.project_id.id,
                'default_user_id': self.env.user.id,
            }
        }
```

## Integração com Wazuh

### Criar Tickets Automaticamente de Alertas

```python
# /opt/odoo/addons/neo_wazuh_helpdesk/models/wazuh_alert.py

from odoo import models, fields, api
import requests
import json

class WazuhHelpdeskIntegration(models.Model):
    _name = 'wazuh.helpdesk.integration'
    _description = 'Wazuh to Helpdesk Integration'

    @api.model
    def webhook_receive_alert(self, alert_data):
        """Recebe webhook do Wazuh e cria ticket"""
        Ticket = self.env['helpdesk.ticket']

        # Apenas alertas com severidade >= 7
        if alert_data.get('rule', {}).get('level', 0) < 7:
            return {'status': 'ignored', 'reason': 'Low severity'}

        # Verificar se já existe ticket para este alerta
        existing = Ticket.search([
            ('wazuh_alert_id', '=', alert_data.get('id')),
        ], limit=1)

        if existing:
            return {'status': 'duplicate', 'ticket_id': existing.id}

        # Determinar prioridade
        level = alert_data.get('rule', {}).get('level', 0)
        if level >= 12:
            priority = '3'  # Crítico
        elif level >= 9:
            priority = '2'  # Alto
        else:
            priority = '1'  # Normal

        # Criar ticket
        ticket = Ticket.create({
            'name': f"[WAZUH] {alert_data['rule']['description']}",
            'description': self._format_alert_description(alert_data),
            'team_id': self._get_security_team(),
            'priority': priority,
            'category_id': self._get_security_category(),
            'wazuh_alert_id': alert_data.get('id'),
            'wazuh_rule_id': alert_data.get('rule', {}).get('id'),
            'wazuh_agent_name': alert_data.get('agent', {}).get('name'),
        })

        return {'status': 'created', 'ticket_id': ticket.id, 'ticket_number': ticket.number}

    def _format_alert_description(self, alert_data):
        """Formata descrição do ticket a partir do alerta"""
        rule = alert_data.get('rule', {})
        agent = alert_data.get('agent', {})
        data = alert_data.get('data', {})

        description = f"""
**Alerta de Segurança Wazuh**

**Regra**: {rule.get('description')}
**ID da Regra**: {rule.get('id')}
**Nível**: {rule.get('level')}
**Agente**: {agent.get('name')} ({agent.get('ip')})

**Detalhes**:
```
{json.dumps(data, indent=2)}
```

**Timestamp**: {alert_data.get('timestamp')}
        """
        return description

    def _get_security_team(self):
        """Retorna equipe de segurança"""
        team = self.env['helpdesk.ticket.team'].search([
            ('name', '=', 'Security Operations')
        ], limit=1)
        return team.id if team else False

    def _get_security_category(self):
        """Retorna categoria de segurança"""
        category = self.env['helpdesk.ticket.category'].search([
            ('name', '=', 'Segurança')
        ], limit=1)
        return category.id if category else False
```

### Webhook no Wazuh

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <integration>
    <name>custom-webhook</name>
    <hook_url>http://odoo:8069/api/wazuh/alert</hook_url>
    <level>7</level>
    <api_key>YOUR_ODOO_API_KEY</api_key>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

## Integração com NetBox

### Vincular Tickets a Dispositivos

```python
# Adicionar campo de device ao ticket
from odoo import models, fields

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    netbox_device_id = fields.Char('NetBox Device ID')
    netbox_device_name = fields.Char('Device Name', compute='_compute_netbox_device')
    netbox_device_url = fields.Char('Device URL', compute='_compute_netbox_device')

    @api.depends('netbox_device_id')
    def _compute_netbox_device(self):
        for ticket in self:
            if ticket.netbox_device_id:
                device_info = self._fetch_netbox_device(ticket.netbox_device_id)
                ticket.netbox_device_name = device_info.get('name')
                ticket.netbox_device_url = device_info.get('url')
            else:
                ticket.netbox_device_name = False
                ticket.netbox_device_url = False

    def _fetch_netbox_device(self, device_id):
        """Busca informações do device no NetBox"""
        import os
        netbox_url = os.getenv('NETBOX_URL', 'http://netbox:8000')
        netbox_token = os.getenv('NETBOX_TOKEN')

        response = requests.get(
            f"{netbox_url}/api/dcim/devices/{device_id}/",
            headers={'Authorization': f'Token {netbox_token}'}
        )

        if response.status_code == 200:
            data = response.json()
            return {
                'name': data['display'],
                'url': f"{netbox_url}/dcim/devices/{device_id}/",
            }
        return {}
```

## Relatórios e Dashboards

### Dashboard de Performance

```python
# View customizada para dashboard
from odoo import models, fields, api

class HelpdeskDashboard(models.Model):
    _name = 'helpdesk.dashboard'
    _description = 'Helpdesk Dashboard'
    _auto = False

    team_id = fields.Many2one('helpdesk.ticket.team', 'Team')
    total_tickets = fields.Integer('Total Tickets')
    open_tickets = fields.Integer('Open Tickets')
    closed_tickets = fields.Integer('Closed Tickets')
    avg_resolution_time = fields.Float('Avg Resolution Time (hours)')
    sla_compliance = fields.Float('SLA Compliance %')

    def init(self):
        tools.drop_view_if_exists(self.env.cr, 'helpdesk_dashboard')
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW helpdesk_dashboard AS (
                SELECT
                    team_id AS id,
                    team_id,
                    COUNT(*) AS total_tickets,
                    SUM(CASE WHEN stage_id.is_close = FALSE THEN 1 ELSE 0 END) AS open_tickets,
                    SUM(CASE WHEN stage_id.is_close = TRUE THEN 1 ELSE 0 END) AS closed_tickets,
                    AVG(EXTRACT(EPOCH FROM (close_date - create_date))/3600) AS avg_resolution_time,
                    (SUM(CASE WHEN sla_violated = FALSE THEN 1 ELSE 0 END)::float / COUNT(*)) * 100 AS sla_compliance
                FROM helpdesk_ticket t
                JOIN helpdesk_ticket_stage stage_id ON t.stage_id = stage_id.id
                GROUP BY team_id
            )
        """)
```

## Troubleshooting

### Problema: SLA não calculando

```bash
# Verificar cron jobs ativos
docker exec -it neo_odoo odoo shell -d neonetbox_odoo -c /etc/odoo/odoo.conf

# No shell:
from odoo import api, SUPERUSER_ID
env = api.Environment(cr, SUPERUSER_ID, {})

# Listar crons de helpdesk
crons = env['ir.cron'].search([('name', 'ilike', 'helpdesk')])
for cron in crons:
    print(f"{cron.name}: Active={cron.active}, Next Run={cron.nextcall}")

# Forçar execução manual
cron = env.ref('helpdesk_mgmt_sla.ir_cron_sla_check')
cron.method_direct_trigger()
```

### Problema: Emails não enviando

```python
# Verificar configuração de email
Server = env['ir.mail_server']
servers = Server.search([])
for server in servers:
    print(f"Server: {server.name}, SMTP: {server.smtp_host}:{server.smtp_port}")

# Testar envio
try:
    Server.sudo().send_email(
        email_from='helpdesk@neo.local',
        email_to='test@example.com',
        subject='Test',
        body='Test email from Odoo Helpdesk'
    )
    print("Email sent successfully!")
except Exception as e:
    print(f"Error: {e}")
```

### Problema: Performance lenta

```sql
-- Criar índices no PostgreSQL
CREATE INDEX idx_helpdesk_ticket_team_stage ON helpdesk_ticket(team_id, stage_id);
CREATE INDEX idx_helpdesk_ticket_sla_deadline ON helpdesk_ticket(sla_deadline) WHERE sla_deadline IS NOT NULL;
CREATE INDEX idx_helpdesk_ticket_create_date ON helpdesk_ticket(create_date);
CREATE INDEX idx_helpdesk_ticket_user ON helpdesk_ticket(user_id);
```

## Recursos Adicionais

- **Repositório OCA**: https://github.com/OCA/helpdesk
- **Documentação**: https://github.com/OCA/helpdesk/tree/19.0
- **Issues**: https://github.com/OCA/helpdesk/issues
- **Comunidade**: https://discuss.odoo.com/c/oca/helpdesk

---

**Próximo**: [Project Management](project.md)
