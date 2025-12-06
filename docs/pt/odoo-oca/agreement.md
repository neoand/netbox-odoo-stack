# Módulos OCA Agreement

> **AI Context**: Documentação completa dos módulos Agreement da OCA para Odoo 19, incluindo gestão de contratos, SLA comerciais e acordos de serviço. Estes módulos fornecem infraestrutura completa para gestão de contratos e acordos de nível de serviço no NEO_NETBOX_ODOO_STACK. Referência para contratos de TI, SLA com clientes, acordos de manutenção e licenciamento.

## Visão Geral

Os módulos **Agreement OCA** fornecem gestão completa de **contratos** e **acordos de serviço** para Odoo 19.

### Módulos Incluídos

| Módulo | Versão | Função | Status |
|--------|--------|--------|--------|
| agreement | 19.0.1.0.0 | Gestão de contratos base | Ativo |
| agreement_sale | 19.0.1.0.0 | Contratos de vendas | Ativo |
| agreement_serviceprofile | 19.0.1.0.0 | Perfis de serviço e SLA | Ativo |
| agreement_legal | 19.0.1.0.0 | Cláusulas legais | Ativo |

## Arquitetura

```
┌────────────────────────────────────────────────────────┐
│            Agreement Management System                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────┐         ┌────────────┐               │
│  │  Clients   │────────►│ Agreements │               │
│  │  Partners  │  Sign   │ Contracts  │               │
│  └────────────┘         └─────┬──────┘               │
│                               │                       │
│                    ┌──────────┼──────────┐           │
│                    │          │          │           │
│              ┌─────▼─────┐ ┌─▼────┐ ┌──▼─────┐     │
│              │   SLA     │ │Sales │ │ Legal  │     │
│              │ Profiles  │ │ Order│ │Clauses │     │
│              └─────┬─────┘ └─┬────┘ └──┬─────┘     │
│                    │          │          │           │
│              ┌─────▼──────────▼──────────▼─────┐    │
│              │    Helpdesk Integration        │    │
│              │   (SLA Enforcement)            │    │
│              └────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Instalação

### 1. Clone do Repositório

```bash
cd /opt/odoo/oca
git clone -b 19.0 https://github.com/OCA/contract.git
```

### 2. Instalação via Docker

```bash
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  -i agreement,agreement_sale,agreement_serviceprofile,agreement_legal \
  --stop-after-init
```

## Módulo: agreement (Base)

### Funcionalidades

- Gestão de contratos e acordos
- Múltiplas partes (cliente, fornecedor)
- Versionamento de contratos
- Anexos e documentos
- Workflow de aprovação
- Histórico completo

### Configurar Tipos de Acordo

```python
# Via código Python
from odoo import api, SUPERUSER_ID

env = api.Environment(cr, SUPERUSER_ID, {})

AgreementType = env['agreement.type']

types = [
    {
        'name': 'Contrato de Suporte Técnico',
        'domain': 'service',
        'code': 'SUP',
    },
    {
        'name': 'Acordo de Nível de Serviço (SLA)',
        'domain': 'service',
        'code': 'SLA',
    },
    {
        'name': 'Contrato de Licenciamento',
        'domain': 'license',
        'code': 'LIC',
    },
    {
        'name': 'Acordo de Manutenção',
        'domain': 'maintenance',
        'code': 'MNT',
    },
    {
        'name': 'Contrato de Fornecimento',
        'domain': 'supply',
        'code': 'FOR',
    },
]

for type_data in types:
    AgreementType.create(type_data)

print(f"Created {len(types)} agreement types")
```

### Criar Acordo Básico

```python
# Criar acordo de suporte técnico
Agreement = env['agreement']
Partner = env['res.partner']

# Buscar cliente
cliente = Partner.search([('name', '=', 'Empresa Cliente XYZ')], limit=1)
if not cliente:
    cliente = Partner.create({
        'name': 'Empresa Cliente XYZ',
        'email': 'contato@clientexyz.com',
        'phone': '+55 11 99999-9999',
        'is_company': True,
    })

# Criar acordo
agreement = Agreement.create({
    'name': 'Suporte Técnico - Cliente XYZ',
    'code': 'SUP-2025-001',
    'agreement_type_id': AgreementType.search([('code', '=', 'SUP')], limit=1).id,
    'partner_id': cliente.id,
    'start_date': '2025-01-01',
    'end_date': '2025-12-31',
    'description': """
        Contrato de Suporte Técnico Nível Premium

        **Escopo**:
        - Suporte 24x7
        - Tempo de resposta: 2 horas (crítico), 8 horas (normal)
        - Manutenção preventiva mensal
        - Atualizações de sistema incluídas

        **Exclusões**:
        - Hardware não fornecido pela empresa
        - Problemas causados por terceiros
        - Personalizações não autorizadas
    """,
    'special_terms': """
        1. O cliente deverá fornecer acesso remoto seguro aos sistemas
        2. Janelas de manutenção devem ser agendadas com 7 dias de antecedência
        3. Faturamento mensal até o 5º dia útil do mês
        4. Multa de 10% por atraso no pagamento
    """,
})

print(f"Agreement created: {agreement.name} ({agreement.code})")
```

### Adicionar Cláusulas ao Acordo

```python
# Criar seções e cláusulas
Section = env['agreement.section']
Clause = env['agreement.clause']

# Seção: Definições
section_definitions = Section.create({
    'name': 'Definições',
    'agreement_id': agreement.id,
    'sequence': 1,
})

Clause.create({
    'name': 'Tempo de Resposta',
    'title': '1.1 Tempo de Resposta',
    'content': """
        Tempo de Resposta é definido como o período entre a abertura do ticket
        pelo cliente e a primeira resposta da equipe de suporte.
    """,
    'agreement_id': agreement.id,
    'section_id': section_definitions.id,
})

# Seção: Níveis de Serviço
section_sla = Section.create({
    'name': 'Níveis de Serviço',
    'agreement_id': agreement.id,
    'sequence': 2,
})

Clause.create({
    'name': 'SLA Crítico',
    'title': '2.1 Incidentes Críticos',
    'content': """
        **Definição**: Incidente que impede completamente o funcionamento do sistema.

        **Compromissos**:
        - Tempo de Resposta: 2 horas
        - Tempo de Resolução: 8 horas
        - Disponibilidade da Equipe: 24x7
    """,
    'agreement_id': agreement.id,
    'section_id': section_sla.id,
})

Clause.create({
    'name': 'SLA Normal',
    'title': '2.2 Incidentes Normais',
    'content': """
        **Definição**: Incidente que afeta parcialmente o funcionamento do sistema.

        **Compromissos**:
        - Tempo de Resposta: 8 horas úteis
        - Tempo de Resolução: 2 dias úteis
        - Disponibilidade da Equipe: Horário comercial
    """,
    'agreement_id': agreement.id,
    'section_id': section_sla.id,
})

# Seção: Faturamento
section_billing = Section.create({
    'name': 'Faturamento e Pagamento',
    'agreement_id': agreement.id,
    'sequence': 3,
})

Clause.create({
    'name': 'Valor Mensal',
    'title': '3.1 Valor do Contrato',
    'content': """
        O valor mensal do contrato é de R$ 5.000,00 (cinco mil reais),
        incluindo todos os serviços descritos neste acordo.

        Reajuste anual pelo IPCA, aplicado no aniversário do contrato.
    """,
    'agreement_id': agreement.id,
    'section_id': section_billing.id,
})
```

## Módulo: agreement_sale

### Funcionalidades

- Vincular acordos a pedidos de venda
- Geração automática de faturas
- Renovação automática
- Upsell e cross-sell

### Criar Acordo com Venda

```python
# Criar produto de serviço
Product = env['product.product']

service_product = Product.create({
    'name': 'Suporte Técnico Premium - Mensal',
    'type': 'service',
    'list_price': 5000.00,
    'default_code': 'SVC-SUPORTE-PREM',
    'invoice_policy': 'order',
    'recurring_invoice': True,
})

# Criar pedido de venda
SaleOrder = env['sale.order']

sale_order = SaleOrder.create({
    'partner_id': cliente.id,
    'date_order': '2025-01-01',
    'order_line': [(0, 0, {
        'product_id': service_product.id,
        'product_uom_qty': 12,  # 12 meses
        'price_unit': service_product.list_price,
    })],
})

# Vincular ao acordo
agreement.write({
    'sale_order_id': sale_order.id,
})

# Confirmar pedido
sale_order.action_confirm()

print(f"Sale order {sale_order.name} linked to agreement {agreement.code}")
```

### Faturamento Recorrente

```python
# Configurar faturamento recorrente
from odoo import models, fields, api

class Agreement(models.Model):
    _inherit = 'agreement'

    recurring_invoice = fields.Boolean('Recurring Invoice', default=False)
    recurring_interval = fields.Integer('Interval', default=1)
    recurring_rule_type = fields.Selection([
        ('daily', 'Day(s)'),
        ('weekly', 'Week(s)'),
        ('monthly', 'Month(s)'),
        ('yearly', 'Year(s)'),
    ], string='Recurrence', default='monthly')
    next_invoice_date = fields.Date('Next Invoice Date')

    @api.model
    def _cron_recurring_create_invoice(self):
        """Cron job para criar faturas recorrentes"""
        today = fields.Date.today()

        agreements = self.search([
            ('recurring_invoice', '=', True),
            ('next_invoice_date', '<=', today),
            ('end_date', '>=', today),
        ])

        for agreement in agreements:
            agreement._create_recurring_invoice()

    def _create_recurring_invoice(self):
        """Criar fatura recorrente"""
        self.ensure_one()

        if not self.sale_order_id:
            return

        Invoice = self.env['account.move']

        # Criar fatura
        invoice = Invoice.create({
            'move_type': 'out_invoice',
            'partner_id': self.partner_id.id,
            'invoice_date': fields.Date.today(),
            'invoice_origin': f"{self.code} - {self.name}",
            'invoice_line_ids': [(0, 0, {
                'product_id': line.product_id.id,
                'quantity': line.product_uom_qty,
                'price_unit': line.price_unit,
                'name': f"{self.name} - {fields.Date.today().strftime('%B %Y')}",
            }) for line in self.sale_order_id.order_line],
        })

        # Atualizar próxima data
        from dateutil.relativedelta import relativedelta

        if self.recurring_rule_type == 'daily':
            self.next_invoice_date = self.next_invoice_date + relativedelta(days=self.recurring_interval)
        elif self.recurring_rule_type == 'weekly':
            self.next_invoice_date = self.next_invoice_date + relativedelta(weeks=self.recurring_interval)
        elif self.recurring_rule_type == 'monthly':
            self.next_invoice_date = self.next_invoice_date + relativedelta(months=self.recurring_interval)
        elif self.recurring_rule_type == 'yearly':
            self.next_invoice_date = self.next_invoice_date + relativedelta(years=self.recurring_interval)

        self.message_post(
            body=f"Recurring invoice created: {invoice.name}"
        )

        return invoice
```

## Módulo: agreement_serviceprofile

### Funcionalidades

- Perfis de serviço predefinidos
- SLA associado ao perfil
- Métricas de performance
- Templates de acordo

### Criar Perfis de Serviço

```python
# Criar perfis de serviço
ServiceProfile = env['agreement.serviceprofile']

profiles = [
    {
        'name': 'Bronze - Suporte Básico',
        'code': 'BRONZE',
        'response_time': 24.0,  # horas
        'resolution_time': 72.0,  # horas
        'availability': '9x5',
        'monthly_price': 1500.00,
        'description': """
            **Incluído**:
            - Suporte via email
            - Horário comercial (9h-18h, Seg-Sex)
            - Tempo de resposta: 24h
            - Tempo de resolução: 72h
        """,
    },
    {
        'name': 'Silver - Suporte Intermediário',
        'code': 'SILVER',
        'response_time': 8.0,
        'resolution_time': 24.0,
        'availability': '12x5',
        'monthly_price': 3000.00,
        'description': """
            **Incluído**:
            - Suporte via email e telefone
            - Horário estendido (8h-20h, Seg-Sex)
            - Tempo de resposta: 8h
            - Tempo de resolução: 24h
            - Acesso remoto autorizado
        """,
    },
    {
        'name': 'Gold - Suporte Premium',
        'code': 'GOLD',
        'response_time': 4.0,
        'resolution_time': 12.0,
        'availability': '24x7',
        'monthly_price': 5000.00,
        'description': """
            **Incluído**:
            - Suporte via email, telefone e chat
            - Disponibilidade 24x7
            - Tempo de resposta: 4h
            - Tempo de resolução: 12h
            - Acesso remoto autorizado
            - Gerente de conta dedicado
            - Relatórios mensais
        """,
    },
]

for profile_data in profiles:
    ServiceProfile.create(profile_data)

print(f"Created {len(profiles)} service profiles")
```

### Aplicar Perfil ao Acordo

```python
# Criar acordo com perfil de serviço
gold_profile = ServiceProfile.search([('code', '=', 'GOLD')], limit=1)

agreement_premium = Agreement.create({
    'name': 'Suporte Premium - Cliente ABC',
    'code': 'SUP-2025-002',
    'agreement_type_id': AgreementType.search([('code', '=', 'SLA')], limit=1).id,
    'partner_id': cliente.id,
    'serviceprofile_id': gold_profile.id,
    'start_date': '2025-01-01',
    'end_date': '2025-12-31',
    'description': gold_profile.description,
})

print(f"Agreement with profile: {agreement_premium.name}")
```

## Módulo: agreement_legal

### Funcionalidades

- Biblioteca de cláusulas legais
- Templates de cláusulas
- Versionamento de termos
- Conformidade legal

### Criar Biblioteca de Cláusulas

```python
# Criar cláusulas padrão reutilizáveis
ClauseTemplate = env['agreement.clause.template']

templates = [
    {
        'name': 'Confidencialidade',
        'title': 'Cláusula de Confidencialidade',
        'content': """
            As partes se comprometem a manter sigilo sobre todas as informações
            confidenciais trocadas durante a vigência deste contrato, incluindo
            mas não limitado a: dados técnicos, processos, estratégias comerciais,
            informações financeiras e dados de clientes.

            O descumprimento desta cláusula sujeitará a parte infratora às
            penalidades previstas em lei, incluindo indenização por danos materiais
            e morais.
        """,
        'category': 'legal',
    },
    {
        'name': 'LGPD - Proteção de Dados',
        'title': 'Cláusula LGPD',
        'content': """
            As partes declaram estar cientes e em conformidade com a Lei Geral de
            Proteção de Dados (LGPD - Lei 13.709/2018).

            **Compromissos**:
            - Tratar dados pessoais apenas para finalidades legítimas
            - Implementar medidas de segurança adequadas
            - Notificar incidentes de segurança em até 72 horas
            - Respeitar direitos dos titulares de dados
            - Manter registro de operações de tratamento

            Em caso de violação, a parte responsável arcará com todas as multas
            e penalidades aplicadas pela ANPD.
        """,
        'category': 'legal',
    },
    {
        'name': 'Rescisão',
        'title': 'Cláusula de Rescisão',
        'content': """
            Este contrato poderá ser rescindido nas seguintes condições:

            **a) Por acordo mútuo**: Mediante notificação prévia de 30 dias.

            **b) Por justa causa**:
            - Inadimplência superior a 30 dias
            - Descumprimento de cláusulas essenciais
            - Falência ou recuperação judicial

            **c) Sem justa causa**: Mediante pagamento de multa equivalente a
            50% do valor das parcelas remanescentes.

            Em caso de rescisão, deverá ser realizada a prestação de contas final
            e devolução de materiais/acessos no prazo de 15 dias.
        """,
        'category': 'legal',
    },
    {
        'name': 'Força Maior',
        'title': 'Cláusula de Força Maior',
        'content': """
            Nenhuma das partes será responsabilizada por atrasos ou falhas no
            cumprimento de suas obrigações decorrentes de eventos de força maior,
            incluindo mas não limitado a:

            - Desastres naturais
            - Guerras ou atos terroristas
            - Greves gerais
            - Epidemias ou pandemias
            - Atos governamentais que impeçam a execução do contrato

            A parte afetada deverá notificar a outra parte imediatamente,
            informando a natureza do evento e o prazo estimado de duração.
        """,
        'category': 'legal',
    },
    {
        'name': 'Propriedade Intelectual',
        'title': 'Cláusula de Propriedade Intelectual',
        'content': """
            Todos os direitos de propriedade intelectual sobre os trabalhos,
            desenvolvimentos, documentações e materiais criados durante a
            vigência deste contrato pertencem exclusivamente ao CONTRATANTE.

            O CONTRATADO cede, de forma definitiva e irrevogável, todos os
            direitos patrimoniais sobre os trabalhos realizados, incluindo
            direitos autorais, patentes, marcas e segredos comerciais.

            O CONTRATADO não poderá utilizar, reproduzir ou comercializar
            qualquer trabalho desenvolvido sem autorização expressa e por
            escrito do CONTRATANTE.
        """,
        'category': 'legal',
    },
]

for template_data in templates:
    ClauseTemplate.create(template_data)

print(f"Created {len(templates)} clause templates")
```

### Aplicar Cláusulas ao Acordo

```python
# Adicionar cláusulas legais ao acordo
legal_section = Section.create({
    'name': 'Cláusulas Legais',
    'agreement_id': agreement.id,
    'sequence': 10,
})

# Buscar templates
confidentiality = ClauseTemplate.search([('name', '=', 'Confidencialidade')], limit=1)
lgpd = ClauseTemplate.search([('name', '=', 'LGPD - Proteção de Dados')], limit=1)
rescission = ClauseTemplate.search([('name', '=', 'Rescisão')], limit=1)

# Criar cláusulas a partir dos templates
for seq, template in enumerate([confidentiality, lgpd, rescission], start=1):
    Clause.create({
        'name': template.name,
        'title': f'{10}.{seq} {template.title}',
        'content': template.content,
        'agreement_id': agreement.id,
        'section_id': legal_section.id,
    })
```

## Integração com Helpdesk

### Aplicar SLA do Acordo nos Tickets

```python
# Vincular acordo ao ticket e aplicar SLA
from odoo import models, fields, api

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    agreement_id = fields.Many2one('agreement', 'Agreement')
    serviceprofile_id = fields.Many2one(
        'agreement.serviceprofile',
        'Service Profile',
        related='agreement_id.serviceprofile_id',
        store=True
    )

    @api.onchange('partner_id')
    def _onchange_partner_agreement(self):
        """Buscar acordo ativo do cliente"""
        if self.partner_id:
            today = fields.Date.today()
            agreement = self.env['agreement'].search([
                ('partner_id', '=', self.partner_id.id),
                ('start_date', '<=', today),
                ('end_date', '>=', today),
                ('agreement_type_id.code', 'in', ['SUP', 'SLA']),
            ], limit=1)

            if agreement:
                self.agreement_id = agreement.id

                # Aplicar SLA do perfil
                if agreement.serviceprofile_id:
                    from datetime import timedelta
                    self.sla_deadline = fields.Datetime.now() + timedelta(
                        hours=agreement.serviceprofile_id.response_time
                    )

    @api.model
    def create(self, vals):
        """Override create para aplicar acordo automaticamente"""
        ticket = super().create(vals)

        if ticket.partner_id and not ticket.agreement_id:
            ticket._onchange_partner_agreement()

        return ticket
```

### Validar Escopo do Acordo

```python
# Validar se ticket está no escopo do acordo
class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    out_of_scope = fields.Boolean('Out of Scope', compute='_compute_scope')

    @api.depends('agreement_id', 'category_id')
    def _compute_scope(self):
        """Verificar se ticket está no escopo do acordo"""
        for ticket in self:
            if not ticket.agreement_id:
                ticket.out_of_scope = False
                continue

            # Verificar se categoria está no escopo
            # (assumindo que há um campo many2many de categorias no acordo)
            if hasattr(ticket.agreement_id, 'covered_category_ids'):
                covered = ticket.agreement_id.covered_category_ids
                if covered and ticket.category_id not in covered:
                    ticket.out_of_scope = True
                else:
                    ticket.out_of_scope = False
            else:
                ticket.out_of_scope = False

    @api.constrains('out_of_scope')
    def _check_out_of_scope(self):
        """Alertar quando ticket está fora do escopo"""
        for ticket in self:
            if ticket.out_of_scope:
                ticket.message_post(
                    body="""
                        ⚠️ ATENÇÃO: Este ticket pode estar FORA DO ESCOPO do acordo.
                        Verifique os termos do contrato antes de prosseguir.
                    """,
                    message_type='notification',
                )
```

## Relatórios

### Relatório de Performance do Acordo

```python
# SQL View para performance de acordo
from odoo import models, fields, tools

class AgreementPerformanceReport(models.Model):
    _name = 'agreement.performance.report'
    _description = 'Agreement Performance Report'
    _auto = False

    agreement_id = fields.Many2one('agreement', 'Agreement', readonly=True)
    partner_id = fields.Many2one('res.partner', 'Client', readonly=True)
    total_tickets = fields.Integer('Total Tickets', readonly=True)
    within_sla = fields.Integer('Within SLA', readonly=True)
    sla_compliance = fields.Float('SLA Compliance %', readonly=True)
    avg_response_time = fields.Float('Avg Response Time (h)', readonly=True)
    avg_resolution_time = fields.Float('Avg Resolution Time (h)', readonly=True)

    def init(self):
        tools.drop_view_if_exists(self.env.cr, 'agreement_performance_report')
        self.env.cr.execute("""
            CREATE OR REPLACE VIEW agreement_performance_report AS (
                SELECT
                    a.id AS id,
                    a.id AS agreement_id,
                    a.partner_id,
                    COUNT(t.id) AS total_tickets,
                    COUNT(t.id) FILTER (WHERE t.sla_violated = FALSE) AS within_sla,
                    (COUNT(t.id) FILTER (WHERE t.sla_violated = FALSE)::float / NULLIF(COUNT(t.id), 0)) * 100 AS sla_compliance,
                    AVG(EXTRACT(EPOCH FROM (t.first_response_date - t.create_date))/3600) AS avg_response_time,
                    AVG(EXTRACT(EPOCH FROM (t.close_date - t.create_date))/3600) AS avg_resolution_time
                FROM agreement a
                LEFT JOIN helpdesk_ticket t ON t.agreement_id = a.id
                WHERE t.create_date >= a.start_date
                AND t.create_date <= a.end_date
                GROUP BY a.id, a.partner_id
            )
        """)
```

### Dashboard de Contratos

```python
# Dashboard de contratos ativos
class AgreementDashboard(models.Model):
    _name = 'agreement.dashboard'
    _description = 'Agreement Dashboard'

    @api.model
    def get_dashboard_data(self):
        """Dados para dashboard de contratos"""
        today = fields.Date.today()

        # Contratos ativos
        active_agreements = self.env['agreement'].search_count([
            ('start_date', '<=', today),
            ('end_date', '>=', today),
        ])

        # Contratos próximos ao vencimento (30 dias)
        from datetime import timedelta
        expiring_soon = self.env['agreement'].search_count([
            ('end_date', '>=', today),
            ('end_date', '<=', today + timedelta(days=30)),
        ])

        # Receita mensal recorrente (MRR)
        agreements = self.env['agreement'].search([
            ('start_date', '<=', today),
            ('end_date', '>=', today),
            ('recurring_invoice', '=', True),
        ])

        mrr = sum([
            line.price_subtotal for agreement in agreements
            for line in agreement.sale_order_id.order_line
        ]) if agreements else 0

        # Compliance médio de SLA
        performance = self.env['agreement.performance.report'].search([])
        avg_compliance = sum(performance.mapped('sla_compliance')) / len(performance) if performance else 0

        return {
            'active_agreements': active_agreements,
            'expiring_soon': expiring_soon,
            'mrr': mrr,
            'avg_sla_compliance': round(avg_compliance, 2),
        }
```

## Troubleshooting

### Problema: Faturamento recorrente não gerando

```python
# Verificar acordos com faturamento recorrente
agreements = env['agreement'].search([
    ('recurring_invoice', '=', True),
    ('next_invoice_date', '!=', False),
])

for agreement in agreements:
    print(f"{agreement.name}: Next invoice = {agreement.next_invoice_date}")

# Forçar geração manual
agreement._create_recurring_invoice()
```

### Problema: SLA não aplicando nos tickets

```python
# Verificar vinculação de acordo ao cliente
partner = env['res.partner'].browse(PARTNER_ID)
agreements = env['agreement'].search([
    ('partner_id', '=', partner.id),
    ('start_date', '<=', fields.Date.today()),
    ('end_date', '>=', fields.Date.today()),
])

print(f"Active agreements for {partner.name}: {len(agreements)}")
for agreement in agreements:
    print(f"  - {agreement.name} ({agreement.code})")
    print(f"    Profile: {agreement.serviceprofile_id.name if agreement.serviceprofile_id else 'N/A'}")
```

## Recursos Adicionais

- **Repositório OCA**: https://github.com/OCA/contract
- **Documentação**: https://github.com/OCA/contract/tree/19.0

---

## Conclusão

A documentação completa dos módulos OCA está finalizada. Para navegar:

1. **[Visão Geral](index.md)** - Introdução e instalação geral
2. **[Helpdesk](helpdesk.md)** - Sistema de tickets e SLA
3. **[Project](project.md)** - Gestão de projetos
4. **[REST Framework](rest-framework.md)** - APIs e integrações
5. **[Reporting](reporting-engine.md)** - Relatórios e BI
6. **[Server UX](server-ux.md)** - Melhorias de interface
7. **[Stock Logistics](stock-logistics.md)** - Gestão de estoque
8. **[Maintenance](maintenance.md)** - CMMS completo
9. **[Agreement](agreement.md)** - Contratos e SLA

**Versão**: 2.0
**Última atualização**: 2025-12-05
**Mantido por**: Equipe NEO Stack
