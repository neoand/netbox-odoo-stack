# Módulos OCA Reporting Engine

> **AI Context**: Documentação completa dos módulos de reporting da OCA para Odoo 19, incluindo exportação Excel/CSV, query builder SQL e BI. Estes módulos fornecem ferramentas avançadas para criação de relatórios, análises e exportação de dados no NEO_NETBOX_ODOO_STACK. Referência para criação de relatórios customizados, dashboards e exportações automatizadas.

## Visão Geral

Os módulos **Reporting Engine OCA** fornecem ferramentas avançadas para criação de **relatórios**, **análises** e **exportação de dados** no Odoo 19.

### Módulos Incluídos

| Módulo | Versão | Função | Status |
|--------|--------|--------|--------|
| report_xlsx | 19.0.1.0.0 | Relatórios em Excel | Ativo |
| report_csv | 19.0.1.0.0 | Relatórios em CSV | Ativo |
| bi_sql_editor | 19.0.1.0.0 | Query builder SQL visual | Ativo |
| sql_export_excel | 19.0.1.0.0 | SQL direto para Excel | Ativo |
| report_qweb_pdf | 19.0.1.0.0 | PDFs customizados | Ativo |

## Arquitetura

```
┌────────────────────────────────────────────────────────┐
│               Reporting Engine Stack                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────┐         ┌────────────┐               │
│  │   Odoo     │────────►│  Reporting │               │
│  │   Data     │  Query  │   Engine   │               │
│  └────────────┘         └─────┬──────┘               │
│                               │                       │
│                    ┌──────────┼──────────┐           │
│                    │          │          │           │
│              ┌─────▼─────┐ ┌─▼────┐ ┌──▼─────┐     │
│              │   XLSX    │ │ CSV  │ │  PDF   │     │
│              │  Reports  │ │Export│ │Reports │     │
│              └─────┬─────┘ └─┬────┘ └──┬─────┘     │
│                    │          │          │           │
│              ┌─────▼──────────▼──────────▼─────┐    │
│              │      BI SQL Editor             │    │
│              │   (Custom Queries & Views)     │    │
│              └────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │    Export: NetBox, Wazuh, Tickets, etc.     │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Instalação

### 1. Pré-requisitos Python

```bash
# Instalar dependências
pip install xlsxwriter
pip install openpyxl
pip install pandas
```

### 2. Clone do Repositório

```bash
cd /opt/odoo/oca
git clone -b 19.0 https://github.com/OCA/reporting-engine.git
```

### 3. Instalação via Docker

```bash
# Atualizar requirements.txt
cat >> /opt/odoo/requirements.txt <<EOF
xlsxwriter>=3.0.0
openpyxl>=3.0.0
pandas>=2.0.0
EOF

# Rebuild e instalar módulos
docker-compose build odoo
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  -i report_xlsx,report_csv,bi_sql_editor,sql_export_excel \
  --stop-after-init
```

## Módulo: report_xlsx

### Funcionalidades

- Exportação de dados para Excel (.xlsx)
- Formatação rica (cores, fontes, borders)
- Múltiplas abas
- Fórmulas Excel
- Gráficos e tabelas dinâmicas

### Criar Relatório XLSX Básico

```python
# /opt/odoo/addons/neo_reports/reports/ticket_report_xlsx.py

from odoo import models

class TicketReportXlsx(models.AbstractModel):
    _name = 'report.neo_reports.ticket_report_xlsx'
    _inherit = 'report.report_xlsx.abstract'

    def generate_xlsx_report(self, workbook, data, tickets):
        """Gerar relatório Excel de tickets"""

        # Criar planilha
        sheet = workbook.add_worksheet('Tickets')

        # Formatos
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#4F81BD',
            'font_color': 'white',
            'border': 1,
            'align': 'center',
        })

        cell_format = workbook.add_format({
            'border': 1,
            'text_wrap': True,
        })

        date_format = workbook.add_format({
            'border': 1,
            'num_format': 'yyyy-mm-dd hh:mm',
        })

        priority_high = workbook.add_format({
            'border': 1,
            'bg_color': '#FF6B6B',
        })

        priority_normal = workbook.add_format({
            'border': 1,
            'bg_color': '#FFA500',
        })

        # Cabeçalhos
        headers = [
            'Número', 'Título', 'Equipe', 'Estágio', 'Prioridade',
            'Responsável', 'Cliente', 'Data Criação', 'Data Fechamento',
            'Tempo Resolução (h)'
        ]

        for col, header in enumerate(headers):
            sheet.write(0, col, header, header_format)

        # Dados
        row = 1
        for ticket in tickets:
            # Calcular tempo de resolução
            resolution_time = ''
            if ticket.close_date and ticket.create_date:
                delta = ticket.close_date - ticket.create_date
                resolution_time = round(delta.total_seconds() / 3600, 2)

            # Formato de prioridade
            priority_format = priority_high if ticket.priority == '3' else priority_normal if ticket.priority == '2' else cell_format

            # Escrever linha
            sheet.write(row, 0, ticket.number or '', cell_format)
            sheet.write(row, 1, ticket.name, cell_format)
            sheet.write(row, 2, ticket.team_id.name, cell_format)
            sheet.write(row, 3, ticket.stage_id.name, cell_format)
            sheet.write(row, 4, dict(ticket._fields['priority'].selection)[ticket.priority], priority_format)
            sheet.write(row, 5, ticket.user_id.name if ticket.user_id else '', cell_format)
            sheet.write(row, 6, ticket.partner_id.name if ticket.partner_id else ticket.partner_email or '', cell_format)
            sheet.write(row, 7, ticket.create_date or '', date_format)
            sheet.write(row, 8, ticket.close_date or '', date_format)
            sheet.write(row, 9, resolution_time, cell_format)

            row += 1

        # Ajustar largura das colunas
        sheet.set_column('A:A', 12)  # Número
        sheet.set_column('B:B', 40)  # Título
        sheet.set_column('C:C', 20)  # Equipe
        sheet.set_column('D:D', 15)  # Estágio
        sheet.set_column('E:E', 12)  # Prioridade
        sheet.set_column('F:F', 20)  # Responsável
        sheet.set_column('G:G', 25)  # Cliente
        sheet.set_column('H:I', 18)  # Datas
        sheet.set_column('J:J', 15)  # Tempo

        # Congelar primeira linha
        sheet.freeze_panes(1, 0)

        # Auto-filtro
        sheet.autofilter(0, 0, row - 1, len(headers) - 1)
```

### Registrar Relatório

```xml
<!-- views/report_templates.xml -->
<odoo>
    <record id="action_ticket_report_xlsx" model="ir.actions.report">
        <field name="name">Tickets Report (Excel)</field>
        <field name="model">helpdesk.ticket</field>
        <field name="report_type">xlsx</field>
        <field name="report_name">neo_reports.ticket_report_xlsx</field>
        <field name="report_file">neo_reports.ticket_report_xlsx</field>
        <field name="binding_model_id" ref="helpdesk_mgmt.model_helpdesk_ticket"/>
        <field name="binding_type">report</field>
    </record>
</odoo>
```

### Relatório com Múltiplas Abas

```python
class TicketMultiSheetReportXlsx(models.AbstractModel):
    _name = 'report.neo_reports.ticket_multisheet_xlsx'
    _inherit = 'report.report_xlsx.abstract'

    def generate_xlsx_report(self, workbook, data, tickets):
        """Relatório com múltiplas abas"""

        # Aba 1: Resumo
        self._generate_summary_sheet(workbook, tickets)

        # Aba 2: Detalhes
        self._generate_details_sheet(workbook, tickets)

        # Aba 3: SLA
        self._generate_sla_sheet(workbook, tickets)

        # Aba 4: Gráficos
        self._generate_charts_sheet(workbook, tickets)

    def _generate_summary_sheet(self, workbook, tickets):
        """Aba de resumo"""
        sheet = workbook.add_worksheet('Resumo')

        # Formatos
        title_format = workbook.add_format({'bold': True, 'font_size': 14})
        metric_format = workbook.add_format({'font_size': 24, 'align': 'center'})

        # Métricas
        total = len(tickets)
        open_tickets = len(tickets.filtered(lambda t: not t.stage_id.is_close))
        closed_tickets = total - open_tickets
        avg_resolution = self._calc_avg_resolution(tickets)

        # Escrever métricas
        sheet.write('A1', 'Total de Tickets', title_format)
        sheet.write('A2', total, metric_format)

        sheet.write('C1', 'Tickets Abertos', title_format)
        sheet.write('C2', open_tickets, metric_format)

        sheet.write('E1', 'Tickets Fechados', title_format)
        sheet.write('E2', closed_tickets, metric_format)

        sheet.write('G1', 'Tempo Médio (h)', title_format)
        sheet.write('G2', round(avg_resolution, 2), metric_format)

    def _generate_details_sheet(self, workbook, tickets):
        """Aba de detalhes (similar ao exemplo anterior)"""
        # Implementation...
        pass

    def _generate_sla_sheet(self, workbook, tickets):
        """Aba de SLA"""
        sheet = workbook.add_worksheet('SLA')

        # Calcular compliance de SLA
        tickets_with_sla = tickets.filtered('sla_deadline')
        total_sla = len(tickets_with_sla)
        violated = len(tickets_with_sla.filtered('sla_violated'))
        compliant = total_sla - violated
        compliance_rate = (compliant / total_sla * 100) if total_sla > 0 else 0

        # Escrever dados
        # ...

    def _generate_charts_sheet(self, workbook, tickets):
        """Aba com gráficos"""
        sheet = workbook.add_worksheet('Gráficos')

        # Criar gráfico de pizza: tickets por prioridade
        chart = workbook.add_chart({'type': 'pie'})

        # Dados por prioridade
        priorities = {'1': 0, '2': 0, '3': 0}
        for ticket in tickets:
            priorities[ticket.priority] += 1

        # Configurar gráfico
        chart.add_series({
            'name': 'Tickets por Prioridade',
            'categories': ['Gráficos', 1, 0, 3, 0],
            'values': ['Gráficos', 1, 1, 3, 1],
        })

        chart.set_title({'name': 'Distribuição de Tickets por Prioridade'})
        sheet.insert_chart('A1', chart)

    def _calc_avg_resolution(self, tickets):
        """Calcular tempo médio de resolução"""
        closed = tickets.filtered(lambda t: t.close_date and t.create_date)
        if not closed:
            return 0

        total_hours = sum([
            (t.close_date - t.create_date).total_seconds() / 3600
            for t in closed
        ])

        return total_hours / len(closed)
```

## Módulo: report_csv

### Funcionalidades

- Exportação para CSV
- Separadores customizáveis
- Encoding configurável
- Stream para grandes volumes

### Relatório CSV Básico

```python
# reports/ticket_report_csv.py

from odoo import models
import csv
from io import StringIO

class TicketReportCsv(models.AbstractModel):
    _name = 'report.neo_reports.ticket_report_csv'
    _inherit = 'report.report_csv.abstract'

    def generate_csv_report(self, data, tickets):
        """Gerar relatório CSV de tickets"""

        output = StringIO()
        writer = csv.writer(output, delimiter=';', quoting=csv.QUOTE_MINIMAL)

        # Cabeçalhos
        writer.writerow([
            'Número',
            'Título',
            'Equipe',
            'Estágio',
            'Prioridade',
            'Responsável',
            'Cliente',
            'Email',
            'Data Criação',
            'Data Fechamento',
        ])

        # Dados
        for ticket in tickets:
            writer.writerow([
                ticket.number or '',
                ticket.name,
                ticket.team_id.name,
                ticket.stage_id.name,
                dict(ticket._fields['priority'].selection)[ticket.priority],
                ticket.user_id.name if ticket.user_id else '',
                ticket.partner_id.name if ticket.partner_id else '',
                ticket.partner_email or '',
                ticket.create_date.strftime('%Y-%m-%d %H:%M:%S') if ticket.create_date else '',
                ticket.close_date.strftime('%Y-%m-%d %H:%M:%S') if ticket.close_date else '',
            ])

        return output.getvalue(), 'csv'
```

### Exportação CSV via API

```python
# FastAPI endpoint para exportar CSV
from fastapi import Response
from odoo.addons.fastapi.dependencies import odoo_env

@router.get("/tickets/export/csv")
def export_tickets_csv(env=Depends(odoo_env)):
    """Exportar tickets para CSV"""
    Ticket = env["helpdesk.ticket"]
    tickets = Ticket.search([], limit=10000)

    # Gerar CSV
    output = StringIO()
    writer = csv.writer(output)

    # Cabeçalhos
    writer.writerow(['ID', 'Number', 'Name', 'Team', 'Stage', 'Priority'])

    # Dados
    for ticket in tickets:
        writer.writerow([
            ticket.id,
            ticket.number,
            ticket.name,
            ticket.team_id.name,
            ticket.stage_id.name,
            ticket.priority,
        ])

    csv_content = output.getvalue()

    return Response(
        content=csv_content,
        media_type='text/csv',
        headers={
            'Content-Disposition': 'attachment; filename=tickets.csv'
        }
    )
```

## Módulo: bi_sql_editor

### Funcionalidades

- Query builder SQL visual
- Criar views materializadas
- Relatórios baseados em SQL
- Agendamento de atualização
- Exportação para Excel/CSV

### Criar Query SQL Customizada

```python
# Via interface web ou programaticamente
from odoo import api, SUPERUSER_ID

env = api.Environment(cr, SUPERUSER_ID, {})

BiSqlView = env['bi.sql.view']

# Query de performance de tickets
query_tickets_performance = BiSqlView.create({
    'name': 'Tickets Performance',
    'technical_name': 'bi_tickets_performance',
    'query': """
        SELECT
            t.id,
            t.number,
            t.name,
            team.name as team_name,
            stage.name as stage_name,
            t.priority,
            t.create_date,
            t.close_date,
            EXTRACT(EPOCH FROM (COALESCE(t.close_date, NOW()) - t.create_date))/3600 as resolution_hours,
            CASE
                WHEN t.sla_deadline IS NOT NULL AND t.close_date > t.sla_deadline THEN TRUE
                WHEN t.sla_deadline IS NOT NULL AND t.close_date IS NULL AND NOW() > t.sla_deadline THEN TRUE
                ELSE FALSE
            END as sla_violated,
            u.name as user_name
        FROM helpdesk_ticket t
        LEFT JOIN helpdesk_ticket_team team ON t.team_id = team.id
        LEFT JOIN helpdesk_ticket_stage stage ON t.stage_id = stage.id
        LEFT JOIN res_users u ON t.user_id = u.id
        WHERE t.create_date >= CURRENT_DATE - INTERVAL '90 days'
    """,
    'state': 'draft',
})

# Criar view materializada
query_tickets_performance.button_create_sql_view()
query_tickets_performance.button_create_ui()
```

### Query Complexa: Dashboard Executivo

```python
# Query para dashboard executivo
query_dashboard = BiSqlView.create({
    'name': 'Executive Dashboard',
    'technical_name': 'bi_executive_dashboard',
    'query': """
        WITH ticket_metrics AS (
            SELECT
                DATE_TRUNC('month', create_date) as month,
                team_id,
                COUNT(*) as total_tickets,
                COUNT(*) FILTER (WHERE stage_id IN (SELECT id FROM helpdesk_ticket_stage WHERE is_close = TRUE)) as closed_tickets,
                COUNT(*) FILTER (WHERE priority = '3') as high_priority,
                AVG(EXTRACT(EPOCH FROM (COALESCE(close_date, NOW()) - create_date))/3600) as avg_resolution_hours,
                COUNT(*) FILTER (WHERE sla_violated = TRUE) as sla_violations
            FROM helpdesk_ticket
            WHERE create_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', create_date), team_id
        )
        SELECT
            tm.month,
            team.name as team_name,
            tm.total_tickets,
            tm.closed_tickets,
            ROUND((tm.closed_tickets::numeric / NULLIF(tm.total_tickets, 0)) * 100, 2) as closure_rate,
            tm.high_priority,
            ROUND(tm.avg_resolution_hours, 2) as avg_resolution_hours,
            tm.sla_violations,
            ROUND(((tm.total_tickets - tm.sla_violations)::numeric / NULLIF(tm.total_tickets, 0)) * 100, 2) as sla_compliance
        FROM ticket_metrics tm
        LEFT JOIN helpdesk_ticket_team team ON tm.team_id = team.id
        ORDER BY tm.month DESC, team.name
    """,
    'state': 'draft',
})

query_dashboard.button_create_sql_view()
query_dashboard.button_create_ui()
```

### Agendar Atualização Automática

```python
# Criar cron job para atualizar view materializada
Cron = env['ir.cron']

Cron.create({
    'name': 'Refresh BI Views',
    'model_id': env.ref('bi_sql_editor.model_bi_sql_view').id,
    'state': 'code',
    'code': """
views = env['bi.sql.view'].search([('state', '=', 'sql_valid')])
for view in views:
    view.button_refresh_materialized_view()
    """,
    'interval_number': 1,
    'interval_type': 'hours',
    'numbercall': -1,
    'active': True,
})
```

## Módulo: sql_export_excel

### Funcionalidades

- SQL direto para Excel
- Queries ad-hoc
- Templates de exportação
- Scheduled exports

### Exportar Query para Excel

```python
# Model customizado para export
from odoo import models, fields, api
import xlsxwriter
from io import BytesIO
import base64

class SqlExportExcel(models.TransientModel):
    _name = 'sql.export.excel'
    _description = 'SQL to Excel Export'

    name = fields.Char('Export Name', required=True)
    sql_query = fields.Text('SQL Query', required=True)
    file_data = fields.Binary('Excel File', readonly=True)
    file_name = fields.Char('File Name', readonly=True)

    def action_export(self):
        """Executar query e exportar para Excel"""
        self.ensure_one()

        # Executar query
        self.env.cr.execute(self.sql_query)
        results = self.env.cr.fetchall()
        columns = [desc[0] for desc in self.env.cr.description]

        # Criar Excel
        output = BytesIO()
        workbook = xlsxwriter.Workbook(output)
        sheet = workbook.add_worksheet('Results')

        # Formatos
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#4F81BD',
            'font_color': 'white',
        })

        # Cabeçalhos
        for col, header in enumerate(columns):
            sheet.write(0, col, header, header_format)

        # Dados
        for row, record in enumerate(results, start=1):
            for col, value in enumerate(record):
                sheet.write(row, col, value)

        workbook.close()

        # Salvar arquivo
        file_data = base64.b64encode(output.getvalue())
        file_name = f"{self.name}.xlsx"

        self.write({
            'file_data': file_data,
            'file_name': file_name,
        })

        return {
            'type': 'ir.actions.act_window',
            'res_model': 'sql.export.excel',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }
```

## Integração com NetBox/Wazuh

### Relatório de Dispositivos NetBox

```python
class NetboxDeviceReportXlsx(models.AbstractModel):
    _name = 'report.neo_reports.netbox_device_report_xlsx'
    _inherit = 'report.report_xlsx.abstract'

    def generate_xlsx_report(self, workbook, data, devices):
        """Relatório de dispositivos do NetBox"""
        sheet = workbook.add_worksheet('Devices')

        # Formatos
        header_format = workbook.add_format({'bold': True, 'bg_color': '#2E86AB', 'font_color': 'white'})
        active_format = workbook.add_format({'bg_color': '#90EE90'})
        inactive_format = workbook.add_format({'bg_color': '#FFB6B6'})

        # Cabeçalhos
        headers = ['Name', 'Device Type', 'Site', 'Rack', 'Serial', 'Status', 'Primary IP', 'Last Updated']
        for col, header in enumerate(headers):
            sheet.write(0, col, header, header_format)

        # Dados
        row = 1
        for device in devices:
            status_format = active_format if device.status == 'active' else inactive_format

            sheet.write(row, 0, device.name)
            sheet.write(row, 1, device.device_type)
            sheet.write(row, 2, device.site_name)
            sheet.write(row, 3, device.rack_name or '')
            sheet.write(row, 4, device.serial_no or '')
            sheet.write(row, 5, device.status, status_format)
            sheet.write(row, 6, device.primary_ip or '')
            sheet.write(row, 7, device.write_date.strftime('%Y-%m-%d %H:%M'))

            row += 1

        # Ajustar colunas
        sheet.set_column('A:A', 25)
        sheet.set_column('B:B', 30)
        sheet.set_column('C:D', 20)
        sheet.set_column('E:E', 15)
        sheet.set_column('F:F', 12)
        sheet.set_column('G:H', 18)
```

### Relatório de Alertas Wazuh

```python
class WazuhAlertReportXlsx(models.AbstractModel):
    _name = 'report.neo_reports.wazuh_alert_report_xlsx'
    _inherit = 'report.report_xlsx.abstract'

    def generate_xlsx_report(self, workbook, data, alerts):
        """Relatório de alertas do Wazuh"""
        sheet = workbook.add_worksheet('Wazuh Alerts')

        # Formatos
        header_format = workbook.add_format({'bold': True, 'bg_color': '#FF6B35', 'font_color': 'white'})
        critical_format = workbook.add_format({'bg_color': '#FF0000', 'font_color': 'white'})
        high_format = workbook.add_format({'bg_color': '#FF6B6B'})
        medium_format = workbook.add_format({'bg_color': '#FFA500'})

        # Cabeçalhos
        headers = ['Alert ID', 'Rule ID', 'Level', 'Description', 'Agent', 'Timestamp', 'Ticket']
        for col, header in enumerate(headers):
            sheet.write(0, col, header, header_format)

        # Dados
        row = 1
        for alert in alerts:
            # Formato por severidade
            if alert.level >= 12:
                level_format = critical_format
            elif alert.level >= 9:
                level_format = high_format
            else:
                level_format = medium_format

            sheet.write(row, 0, alert.alert_id)
            sheet.write(row, 1, alert.rule_id)
            sheet.write(row, 2, alert.level, level_format)
            sheet.write(row, 3, alert.description)
            sheet.write(row, 4, alert.agent_name)
            sheet.write(row, 5, alert.timestamp.strftime('%Y-%m-%d %H:%M:%S'))
            sheet.write(row, 6, alert.ticket_id.number if alert.ticket_id else '')

            row += 1

        sheet.set_column('A:B', 15)
        sheet.set_column('C:C', 8)
        sheet.set_column('D:D', 50)
        sheet.set_column('E:E', 20)
        sheet.set_column('F:F', 18)
        sheet.set_column('G:G', 15)
```

## Dashboards Interativos

### Query para Dashboard de Tickets

```sql
-- View materializada para dashboard
CREATE MATERIALIZED VIEW dashboard_tickets AS
SELECT
    DATE_TRUNC('day', t.create_date) as date,
    team.name as team,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE stage.is_close = TRUE) as closed,
    COUNT(*) FILTER (WHERE t.priority = '3') as high_priority,
    COUNT(*) FILTER (WHERE t.sla_violated = TRUE) as sla_violations,
    AVG(EXTRACT(EPOCH FROM (COALESCE(t.close_date, NOW()) - t.create_date))/3600) as avg_resolution_hours
FROM helpdesk_ticket t
LEFT JOIN helpdesk_ticket_team team ON t.team_id = team.id
LEFT JOIN helpdesk_ticket_stage stage ON t.stage_id = stage.id
WHERE t.create_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', t.create_date), team.name
ORDER BY date DESC;

CREATE INDEX idx_dashboard_tickets_date ON dashboard_tickets(date);
```

## Troubleshooting

### Problema: Excel não gerando

```bash
# Verificar xlsxwriter
docker exec -it neo_odoo python3 -c "import xlsxwriter; print(xlsxwriter.__version__)"

# Reinstalar
pip uninstall xlsxwriter
pip install xlsxwriter==3.0.0
```

### Problema: Query SQL falhando

```python
# Testar query manualmente
env.cr.execute("SELECT * FROM helpdesk_ticket LIMIT 1")
result = env.cr.fetchone()
print(result)

# Verificar permissões
env.cr.execute("SELECT has_table_privilege('helpdesk_ticket', 'SELECT')")
print(env.cr.fetchone())
```

### Problema: Materializada view não atualizando

```sql
-- Forçar refresh manual
REFRESH MATERIALIZED VIEW CONCURRENTLY bi_tickets_performance;

-- Verificar última atualização
SELECT schemaname, matviewname, last_refresh
FROM pg_matviews
WHERE matviewname LIKE 'bi_%';
```

## Recursos Adicionais

- **Repositório OCA**: https://github.com/OCA/reporting-engine
- **XlsxWriter Docs**: https://xlsxwriter.readthedocs.io/
- **BI SQL Editor**: https://github.com/OCA/reporting-engine/tree/19.0/bi_sql_editor

---

**Próximo**: [Server UX](server-ux.md)
