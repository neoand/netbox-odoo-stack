# Módulos OCA Server UX

> **AI Context**: Documentación completa de los módulos Server UX de OCA para Odoo 19, incluyendo anúncios, ações em massa, filtros personalizados e validações multi-nível. Estos módulos mejoran a experiencia do usuario e productividad en la interfaz de Odoo en NEO_NETBOX_ODOO_STACK. Referencia para personalización de interface, automatizaciones e workflows de aprobación.

## Visión General

Los módulos **Server UX OCA** proporcionan melhorias na **experiencia do usuario** e **productividad** da interface de Odoo 19.

### Módulos Incluidos

| Módulo | Versión | Función | Status |
|--------|--------|--------|--------|
| announcement | 19.0.1.0.0 | Anúncios no sistema | Activo |
| server_action_mass_edit | 19.0.1.0.0 | Edição em massa | Activo |
| base_custom_filter | 19.0.1.0.0 | Filtros personalizados | Activo |
| base_tier_validation | 19.0.1.0.0 | Aprovações multi-nível | Activo |
| mass_editing | 19.0.1.0.0 | Edição em lote avançada | Activo |

## Instalación

### 1. Clonar el Repositorio

```bash
cd /opt/odoo/oca
git clone -b 19.0 https://github.com/OCA/server-ux.git
```

### 2. Instalación via Docker

```bash
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  -i announcement,server_action_mass_edit,base_custom_filter,base_tier_validation \
  --stop-after-init
```

## Módulo: announcement

### Funcionalidades

- Anúncios de sistema visíveis para todos
- Anúncios por usuario/grupo
- Agendamento de exibição
- Diferentes tipos (info, warning, danger)
- Confirmação de leitura

### Crear Anúncios

```python
# Via código Python
from odoo import api, SUPERUSER_ID
from datetime import datetime, timedelta

env = api.Environment(cr, SUPERUSER_ID, {})

Announcement = env['announcement']

# Anúncio de mantenimiento programada
maintenance_announcement = Announcement.create({
    'name': 'Manutenção Programada - NetBox',
    'content': """
        <h3>Manutenção Programada</h3>
        <p>O sistema NetBox passará por mantenimiento no dia <strong>15/12/2025</strong> das 02:00 às 04:00.</p>
        <p>Durante este período, a sincronização de dispositivos pode estar temporariamente indisponível.</p>
        <p><strong>Impacto:</strong> Médio</p>
        <p><strong>Contato:</strong> infra@empresa.com</p>
    """,
    'notification_type': 'warning',
    'date_begin': datetime(2025, 12, 14, 0, 0),
    'date_end': datetime(2025, 12, 15, 6, 0),
    'user_ids': [],  # Vazio = todos os usuarios
    'in_date': True,
})

# Anúncio de nova feature
feature_announcement = Announcement.create({
    'name': 'Nova Feature: Integração Wazuh',
    'content': """
        <h3>🎉 Nova Funcionalidade Disponível!</h3>
        <p>Agora os alertas do Wazuh são automaticamente convertidos em tickets do Helpdesk.</p>
        <p><strong>Benefícios:</strong></p>
        <ul>
            <li>Resposta mais rápida a incidentes de segurança</li>
            <li>Rastreamento completo de resoluções</li>
            <li>SLA automático para alertas críticos</li>
        </ul>
        <p>Veja a <a href="/docs/wazuh-integration">documentação completa</a> para mais detalhes.</p>
    """,
    'notification_type': 'success',
    'date_begin': datetime.now(),
    'date_end': datetime.now() + timedelta(days=7),
    'in_date': True,
})

# Anúncio crítico para equipe de segurança
security_announcement = Announcement.create({
    'name': 'ALERTA: Vulnerabilidade Crítica Detectada',
    'content': """
        <h3>⚠️ ALERTA DE SEGURANÇA</h3>
        <p>Foi detectada uma vulnerabilidade crítica (CVE-2025-XXXXX) nos servidores Linux.</p>
        <p><strong>Ação Imediata Necessária:</strong></p>
        <ol>
            <li>Verificar todos os servidores afetados no NetBox</li>
            <li>Aplicar patch de segurança</li>
            <li>Reportar conclusão até 17:00 de hoje</li>
        </ol>
        <p><strong>Severidade:</strong> CRÍTICA</p>
    """,
    'notification_type': 'danger',
    'date_begin': datetime.now(),
    'date_end': datetime.now() + timedelta(days=1),
    'user_ids': [(6, 0, env.ref('base.group_system').users.ids)],
    'in_date': True,
})
```

### Anúncios por Grupo

```python
# Crear anúncio apenas para equipe de helpdesk
helpdesk_group = env.ref('helpdesk_mgmt.group_helpdesk_user')

helpdesk_announcement = Announcement.create({
    'name': 'Novo Procedimento: Escalação de Tickets',
    'content': """
        <h3>Novo Procedimento de Escalação</h3>
        <p>A partir de hoje, tickets com SLA próximo de expirar (< 2h) devem ser escalados automaticamente.</p>
        <p><strong>Processo:</strong></p>
        <ol>
            <li>Sistema envia notificação automática</li>
            <li>Ticket é marcado com prioridade ALTA</li>
            <li>Gerente da equipe é notificado</li>
        </ol>
    """,
    'notification_type': 'info',
    'date_begin': datetime.now(),
    'date_end': datetime.now() + timedelta(days=30),
    'user_ids': [(6, 0, helpdesk_group.users.ids)],
})
```

### Widget no Dashboard

```xml
<!-- views/announcement_dashboard.xml -->
<odoo>
    <record id="announcement_dashboard_view" model="ir.ui.view">
        <field name="name">announcement.dashboard</field>
        <field name="model">announcement</field>
        <field name="arch" type="xml">
            <kanban class="o_announcement_kanban">
                <field name="name"/>
                <field name="content"/>
                <field name="notification_type"/>
                <field name="date_begin"/>
                <field name="date_end"/>
                <templates>
                    <t t-name="kanban-box">
                        <div t-attf-class="oe_kanban_card oe_kanban_global_click announcement_#{record.notification_type.raw_value}">
                            <div class="oe_kanban_content">
                                <div class="o_kanban_record_title">
                                    <field name="name"/>
                                </div>
                                <div class="o_kanban_record_body">
                                    <field name="content" widget="html"/>
                                </div>
                                <div class="o_kanban_record_bottom">
                                    <div class="oe_kanban_bottom_left">
                                        <field name="date_begin"/> - <field name="date_end"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </t>
                </templates>
            </kanban>
        </field>
    </record>
</odoo>
```

## Módulo: server_action_mass_edit

### Funcionalidades

- Editar múltiplos registros simultaneamente
- Ações em massa customizadas
- Actualizar campos em lote
- Validações customizadas

### Crear Ação de Edição em Massa

```python
# Model para ação de edição em massa
from odoo import models, fields, api

class MassEditingWizard(models.TransientModel):
    _name = 'mass.editing.wizard'
    _description = 'Mass Edit Wizard'

    model_id = fields.Many2one('ir.model', 'Model', required=True)
    field_ids = fields.Many2many('ir.model.fields', string='Fields to Update')

    # Campos comuns para tickets
    priority = fields.Selection([
        ('1', 'Low'),
        ('2', 'Normal'),
        ('3', 'High'),
    ], 'Priority')
    stage_id = fields.Many2one('helpdesk.ticket.stage', 'Stage')
    user_id = fields.Many2one('res.users', 'Assign to')
    team_id = fields.Many2one('helpdesk.ticket.team', 'Team')

    update_priority = fields.Boolean('Update Priority')
    update_stage = fields.Boolean('Update Stage')
    update_user = fields.Boolean('Update User')
    update_team = fields.Boolean('Update Team')

    def action_apply(self):
        """Aplicar edições em massa"""
        self.ensure_one()

        # Obtener registros selecionados
        active_ids = self.env.context.get('active_ids', [])
        active_model = self.env.context.get('active_model')

        if not active_ids or not active_model:
            raise UserError('No records selected')

        records = self.env[active_model].browse(active_ids)

        # Preparar valores para atualizar
        values = {}

        if self.update_priority and self.priority:
            values['priority'] = self.priority

        if self.update_stage and self.stage_id:
            values['stage_id'] = self.stage_id.id

        if self.update_user and self.user_id:
            values['user_id'] = self.user_id.id

        if self.update_team and self.team_id:
            values['team_id'] = self.team_id.id

        # Actualizar registros
        if values:
            records.write(values)

            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'message': f'{len(records)} records updated successfully',
                    'type': 'success',
                }
            }
```

### Server Action para Atualização em Massa

```python
# Crear server action via código
ServerAction = env['ir.actions.server']

# Ação: Atribuir tickets em massa
action_assign_tickets = ServerAction.create({
    'name': 'Assign Selected Tickets to Me',
    'model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'binding_model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'binding_view_types': 'list',
    'state': 'code',
    'code': """
for record in records:
    record.user_id = env.user
    """,
})

# Ação: Cerrar tickets resolvidos
action_close_tickets = ServerAction.create({
    'name': 'Close Selected Tickets',
    'model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'binding_model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'binding_view_types': 'list',
    'state': 'code',
    'code': """
closed_stage = env['helpdesk.ticket.stage'].search([('is_close', '=', True)], limit=1)
if closed_stage:
    for record in records:
        record.stage_id = closed_stage.id
        record.close_date = fields.Datetime.now()
    """,
})

# Ação: Mudar prioridade para ALTA
action_high_priority = ServerAction.create({
    'name': 'Set High Priority',
    'model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'binding_model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'binding_view_types': 'list',
    'state': 'code',
    'code': """
for record in records:
    record.priority = '3'
    record.message_post(body='Priority changed to HIGH via mass action')
    """,
})
```

### Ação com Validación

```python
# Ação com validación de permissão
action_approve_tickets = ServerAction.create({
    'name': 'Approve Selected Tickets',
    'model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'binding_model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'binding_view_types': 'list',
    'state': 'code',
    'code': """
# Verificar se usuario é gerente
if not env.user.has_group('helpdesk_mgmt.group_helpdesk_manager'):
    raise UserError('Only managers can approve tickets')

approved_stage = env['helpdesk.ticket.stage'].search([('name', '=', 'Approved')], limit=1)
if not approved_stage:
    raise UserError('Approved stage not found')

for record in records:
    if record.stage_id.name != 'Pending Approval':
        continue

    record.stage_id = approved_stage.id
    record.message_post(
        body=f'Ticket approved by {env.user.name}',
        message_type='notification',
    )
    """,
})
```

## Módulo: base_custom_filter

### Funcionalidades

- Filtros salvos personalizados
- Compartilhar filtros entre usuarios
- Filtros favoritos
- Filtros por grupo

### Crear Filtros Customizados

```python
# Via código Python
Filter = env['ir.filters']

# Filtro: Meus tickets abertos
my_open_tickets = Filter.create({
    'name': 'My Open Tickets',
    'model_id': 'helpdesk.ticket',
    'user_id': env.user.id,
    'domain': "[('user_id', '=', uid), ('stage_id.is_close', '=', False)]",
    'context': "{}",
    'sort': "[]",
    'is_default': True,
})

# Filtro: Tickets urgentes (compartilhado)
urgent_tickets = Filter.create({
    'name': 'Urgent Tickets',
    'model_id': 'helpdesk.ticket',
    'user_id': False,  # Compartilhado com todos
    'domain': "[('priority', '=', '3'), ('stage_id.is_close', '=', False)]",
    'context': "{'search_default_priority': 1}",
    'sort': "[('create_date', 'desc')]",
})

# Filtro: Tickets com SLA violado
sla_violated_filter = Filter.create({
    'name': 'SLA Violated',
    'model_id': 'helpdesk.ticket',
    'domain': "[('sla_violated', '=', True), ('stage_id.is_close', '=', False)]",
    'context': "{}",
    'sort': "[('sla_deadline', 'asc')]",
})

# Filtro: Tickets criados esta semana
this_week_filter = Filter.create({
    'name': 'Created This Week',
    'model_id': 'helpdesk.ticket',
    'domain': "[('create_date', '>=', context_today() - relativedelta(weeks=1))]",
    'context': "{}",
    'sort': "[('create_date', 'desc')]",
})
```

### Filtros Avançados

```python
# Filtro complexo: Tickets críticos não atribuídos
critical_unassigned = Filter.create({
    'name': 'Critical Unassigned',
    'model_id': 'helpdesk.ticket',
    'domain': """[
        ('priority', '=', '3'),
        ('user_id', '=', False),
        ('stage_id.is_close', '=', False),
        '|',
            ('sla_deadline', '<=', (context_today() + relativedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S')),
            ('sla_deadline', '=', False)
    ]""",
    'context': "{}",
    'sort': "[('create_date', 'asc')]",
})

# Filtro: Tickets da minha equipe aguardando cliente
team_waiting_customer = Filter.create({
    'name': 'Team - Waiting Customer',
    'model_id': 'helpdesk.ticket',
    'domain': """[
        ('team_id', 'in', [team.id for team in user.helpdesk_team_ids]),
        ('stage_id.name', '=', 'Waiting Customer'),
        ('write_date', '<=', (context_today() - relativedelta(days=3)).strftime('%Y-%m-%d'))
    ]""",
    'context': "{}",
    'sort': "[('write_date', 'asc')]",
})
```

## Módulo: base_tier_validation

### Funcionalidades

- Aprovações multi-nível
- Workflow de aprobación customizável
- Notificações automáticas
- Histórico de aprovações

### Configurar Níveis de Aprovação

```python
# Agregar tier validation a tickets
from odoo import models, fields, api

class HelpdeskTicket(models.Model):
    _name = 'helpdesk.ticket'
    _inherit = ['helpdesk.ticket', 'tier.validation']

    # Configuración de tiers
    _tier_validation_manual_config = False

    @api.model
    def _get_under_validation_exceptions(self):
        """Campos que podem ser editados durante validação"""
        res = super()._get_under_validation_exceptions()
        res.append('description')
        res.append('tag_ids')
        return res


# Definir tiers de aprobación
TierDefinition = env['tier.definition']

# Tier 1: Gerente de equipe (para tickets > $10,000)
tier_manager = TierDefinition.create({
    'model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'name': 'Manager Approval',
    'sequence': 10,
    'reviewer_group_id': env.ref('helpdesk_mgmt.group_helpdesk_manager').id,
    'python_code': """
result = False
if record.estimated_cost > 10000:
    result = True
    """,
    'definition_type': 'domain',
})

# Tier 2: Diretor (para tickets > $50,000)
tier_director = TierDefinition.create({
    'model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'name': 'Director Approval',
    'sequence': 20,
    'reviewer_group_id': env.ref('base.group_system').id,
    'python_code': """
result = False
if record.estimated_cost > 50000:
    result = True
    """,
    'definition_type': 'domain',
})

# Tier 3: CEO (para tickets > $100,000)
tier_ceo = TierDefinition.create({
    'model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'name': 'CEO Approval',
    'sequence': 30,
    'reviewer_id': env.ref('base.user_admin').id,
    'python_code': """
result = False
if record.estimated_cost > 100000:
    result = True
    """,
    'definition_type': 'domain',
})
```

### Workflow de Aprovação

```python
# Agregar métodos de aprobación
class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    def action_request_validation(self):
        """Solicitar aprobación"""
        self.ensure_one()

        # Verificar se precisa de aprobación
        if not self.need_validation:
            raise UserError('This ticket does not require validation')

        # Iniciar processo
        self.request_validation()

        # Notificar aprovadores
        self._notify_approvers()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'message': 'Validation request sent to approvers',
                'type': 'success',
            }
        }

    def _notify_approvers(self):
        """Notificar aprovadores via email"""
        self.ensure_one()

        template = self.env.ref('neo_helpdesk.email_template_approval_request')

        for review in self.review_ids.filtered(lambda r: r.status == 'pending'):
            if review.reviewer_id:
                template.send_mail(
                    self.id,
                    email_values={'email_to': review.reviewer_id.email},
                    force_send=True,
                )

    def action_approve(self):
        """Aprovar ticket"""
        self.ensure_one()

        # Verificar permissão
        if not self._can_approve():
            raise UserError('You are not authorized to approve this ticket')

        # Aprovar
        self.validate_tier()

        # Log
        self.message_post(
            body=f'Ticket approved by {self.env.user.name}',
            message_type='notification',
        )

        # Se todas aprovações concluídas, mover para próximo estágio
        if self.validated:
            approved_stage = self.env['helpdesk.ticket.stage'].search([
                ('name', '=', 'Approved')
            ], limit=1)
            if approved_stage:
                self.stage_id = approved_stage.id

    def _can_approve(self):
        """Verificar se usuario pode aprovar"""
        pending_reviews = self.review_ids.filtered(
            lambda r: r.status == 'pending' and r.reviewer_id == self.env.user
        )
        return bool(pending_reviews)
```

## Módulo: mass_editing

### Funcionalidades

- Edição em lote com wizard
- Templates de edição
- Log de alterações
- Rollback de mudanças

### Configurar Mass Edit

```python
# Crear configuração de mass edit
MassEdit = env['mass.object']

# Configuración para tickets
ticket_mass_edit = MassEdit.create({
    'name': 'Helpdesk Ticket Mass Edit',
    'model_id': env.ref('helpdesk_mgmt.model_helpdesk_ticket').id,
    'ref_ir_act_window_id': env.ref('helpdesk_mgmt.helpdesk_ticket_action').id,
    'mass_edit_line_ids': [
        (0, 0, {
            'field_id': env['ir.model.fields']._get('helpdesk.ticket', 'priority').id,
        }),
        (0, 0, {
            'field_id': env['ir.model.fields']._get('helpdesk.ticket', 'stage_id').id,
        }),
        (0, 0, {
            'field_id': env['ir.model.fields']._get('helpdesk.ticket', 'user_id').id,
        }),
        (0, 0, {
            'field_id': env['ir.model.fields']._get('helpdesk.ticket', 'team_id').id,
        }),
    ],
})
```

## Integração com NetBox/Wazuh

### Anúncio Automático de Alertas Críticos

```python
# Crear anúncio automaticamente quando alerta crítico é recebido
class WazuhAlert(models.Model):
    _inherit = 'wazuh.alert'

    @api.model
    def create(self, vals):
        """Override create para anúncios automáticos"""
        alert = super().create(vals)

        # Se alerta é crítico (level >= 12), criar anúncio
        if alert.level >= 12:
            self.env['announcement'].create({
                'name': f'CRITICAL ALERT: {alert.description}',
                'content': f"""
                    <h3>⚠️ ALERTA CRÍTICO DE SEGURANÇA</h3>
                    <p><strong>Agente:</strong> {alert.agent_name}</p>
                    <p><strong>Regra:</strong> {alert.rule_id}</p>
                    <p><strong>Descrição:</strong> {alert.description}</p>
                    <p><strong>Ticket:</strong> <a href="/web#id={alert.ticket_id.id}&model=helpdesk.ticket">#{alert.ticket_id.number}</a></p>
                """,
                'notification_type': 'danger',
                'date_begin': fields.Datetime.now(),
                'date_end': fields.Datetime.now() + timedelta(hours=24),
                'user_ids': [(6, 0, self.env.ref('base.group_system').users.ids)],
            })

        return alert
```

## Troubleshooting

### Problema: Anúncios não aparecendo

```python
# Verificar anúncios activos
announcements = env['announcement'].search([
    ('in_date', '=', True),
    '|',
        ('user_ids', '=', False),
        ('user_ids', 'in', [env.user.id])
])
for ann in announcements:
    print(f"{ann.name}: {ann.date_begin} - {ann.date_end}")
```

### Problema: Mass edit não funcionando

```bash
# Verificar permissões
docker exec -it neo_odoo odoo shell -d neonetbox_odoo

# No shell:
user = env.user
print(f"User: {user.name}")
print(f"Groups: {[g.name for g in user.groups_id]}")

# Verificar acesso ao modelo
access = env['ir.model.access'].check('helpdesk.ticket', 'write', raise_exception=False)
print(f"Write access: {access}")
```

## Recursos Adicionales

- **Repositorio OCA**: https://github.com/OCA/server-ux
- **Documentación**: https://github.com/OCA/server-ux/tree/19.0

---

**Siguiente**: [Stock Logistics](stock-logistics.md)
