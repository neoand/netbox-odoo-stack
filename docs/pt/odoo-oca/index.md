# Módulos OCA para Odoo 19

> **AI Context**: Este documento fornece uma visão geral completa dos módulos OCA (Odoo Community Association) utilizados no NEO_NETBOX_ODOO_STACK v2.0. Os módulos OCA são alternativas open-source de qualidade empresarial aos módulos Enterprise do Odoo, oferecendo funcionalidades avançadas de ITSM, automação, relatórios e integrações. Referência para configuração de ambiente Odoo 19 com foco em service desk, gerenciamento de projetos, APIs REST e integração com NetBox/Wazuh.

## Visão Geral

O **NEO_NETBOX_ODOO_STACK v2.0** utiliza módulos da **OCA (Odoo Community Association)** para fornecer funcionalidades empresariais sem dependência de licenças Enterprise. Esta estratégia oferece:

- **Custo zero de licenciamento** - Módulos 100% open-source
- **Comunidade ativa** - Mantidos por centenas de desenvolvedores
- **Compatibilidade** - Testados extensivamente com Odoo 19
- **Customização** - Código aberto facilita adaptações
- **Integração** - Funcionam nativamente com NetBox e Wazuh

## Módulos Instalados

### Tabela Resumida de Módulos

| Categoria | Módulo | Versão | Função Principal | Status |
|-----------|--------|--------|------------------|--------|
| **Helpdesk** | helpdesk_mgmt | 19.0.1.0.0 | Sistema de tickets e atendimento | Ativo |
| | helpdesk_mgmt_sla | 19.0.1.0.0 | SLA e tempo de resposta | Ativo |
| | helpdesk_type_sla | 19.0.1.0.0 | SLA por tipo de ticket | Ativo |
| | helpdesk_mgmt_project | 19.0.1.0.0 | Integração tickets/projetos | Ativo |
| | helpdesk_mgmt_timesheet | 19.0.1.0.0 | Controle de horas | Ativo |
| **Project** | project_timeline | 19.0.1.0.0 | Visualização Gantt | Ativo |
| | project_task_code | 19.0.1.0.0 | Códigos únicos para tarefas | Ativo |
| | project_template | 19.0.1.0.0 | Templates de projetos | Ativo |
| | project_stakeholder | 19.0.1.0.0 | Gestão de stakeholders | Ativo |
| **REST API** | fastapi | 18.0.1.3.1 | Framework API REST | Ativo |
| | fastapi_auth_api_key | 18.0.1.0.0 | Autenticação por API Key | Ativo |
| | queue_job | 19.0.1.0.0 | Processamento assíncrono | Ativo |
| | pydantic | 19.0.1.0.0 | Validação de dados | Ativo |
| **Reporting** | report_xlsx | 19.0.1.0.0 | Exportação Excel | Ativo |
| | report_csv | 19.0.1.0.0 | Exportação CSV | Ativo |
| | bi_sql_editor | 19.0.1.0.0 | Query builder SQL | Ativo |
| | sql_export_excel | 19.0.1.0.0 | SQL para Excel | Ativo |
| **Server UX** | announcement | 19.0.1.0.0 | Anúncios no sistema | Ativo |
| | server_action_mass_edit | 19.0.1.0.0 | Edição em massa | Ativo |
| | base_custom_filter | 19.0.1.0.0 | Filtros customizados | Ativo |
| | base_tier_validation | 19.0.1.0.0 | Aprovações multi-nível | Ativo |
| **Stock** | stock_inventory | 19.0.1.0.0 | Inventário de estoque | Ativo |
| | stock_location_zone | 19.0.1.0.0 | Zonas de localização | Ativo |
| | stock_move_location | 19.0.1.0.0 | Movimentação de estoque | Ativo |
| **Maintenance** | maintenance_plan | 19.0.1.0.0 | Planos de manutenção | Ativo |
| | maintenance_equipment_hierarchy | 19.0.1.0.0 | Hierarquia de equipamentos | Ativo |
| | maintenance_stock | 19.0.1.0.0 | Estoque para manutenção | Ativo |
| **Agreement** | agreement | 19.0.1.0.0 | Contratos e acordos | Ativo |
| | agreement_sale | 19.0.1.0.0 | Contratos de vendas | Ativo |

## Arquitetura de Integração

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

## Instalação Geral

### 1. Estrutura de Diretórios

```bash
/opt/odoo/
├── odoo/                    # Core Odoo 19
├── addons/                  # Módulos custom
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

### 2. Instalação via Docker

Adicione ao `docker-compose.yml`:

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

### 3. Clone dos Repositórios OCA

```bash
#!/bin/bash
# Script: install_oca_modules.sh

OCA_BASE="/opt/odoo/oca"
ODOO_VERSION="19.0"

# Criar estrutura
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

echo "Módulos OCA instalados com sucesso!"
```

### 4. Configuração do odoo.conf

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

## Ativação dos Módulos

### Via Interface Web

1. Acesse: `http://localhost:8069`
2. Navegue: **Apps** > **Update Apps List**
3. Remova filtro: **Apps**
4. Busque por módulo OCA desejado
5. Clique em **Install**

### Via CLI

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

## Integração com NetBox e Wazuh

### 1. FastAPI para Integração

```python
# /opt/odoo/addons/neo_integration/controllers/netbox_api.py

from odoo import http
from odoo.addons.fastapi.dependencies import authenticated_partner

@http.route('/api/netbox/devices', auth='api_key', methods=['GET'])
def sync_netbox_devices(self):
    """Sincroniza dispositivos do NetBox com Odoo Maintenance"""
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

### 2. Wazuh Alertas para Tickets

```python
# /opt/odoo/addons/neo_integration/models/wazuh_alert.py

from odoo import models, fields, api

class WazuhAlert(models.Model):
    _name = 'wazuh.alert'
    _description = 'Wazuh Security Alert'

    alert_id = fields.Char('Alert ID', required=True)
    rule_id = fields.Char('Rule ID')
    level = fields.Integer('Severity Level')
    description = fields.Text('Description')
    agent_name = fields.Char('Agent Name')
    timestamp = fields.Datetime('Timestamp')
    ticket_id = fields.Many2one('helpdesk.ticket', string='Related Ticket')

    @api.model
    def create_ticket_from_alert(self, alert_data):
        """Cria ticket automaticamente a partir de alerta Wazuh"""
        Ticket = self.env['helpdesk.ticket']

        # Criar ticket se severidade >= 7
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

## Documentação Detalhada

Cada categoria de módulo possui documentação específica:

- **[Helpdesk](helpdesk.md)** - Sistema de tickets, SLA, timesheet
- **[Project](project.md)** - Gestão de projetos, timeline, templates
- **[REST Framework](rest-framework.md)** - FastAPI, queue jobs, pydantic
- **[Reporting Engine](reporting-engine.md)** - Excel, CSV, BI SQL
- **[Server UX](server-ux.md)** - Anúncios, ações em massa, filtros
- **[Stock Logistics](stock-logistics.md)** - Inventário, zonas, movimentação
- **[Maintenance](maintenance.md)** - CMMS, planos, hierarquia
- **[Agreement](agreement.md)** - Contratos, SLA, vendas

## Troubleshooting Geral

### Problema: Módulo não aparece na lista

```bash
# Atualizar lista de módulos
docker exec -it neo_odoo odoo shell -d neonetbox_odoo -c /etc/odoo/odoo.conf \
  --update=base --stop-after-init

# Verificar paths no container
docker exec -it neo_odoo ls -la /mnt/oca-addons
```

### Problema: Erro de dependências

```python
# Verificar dependências de um módulo
import ast

with open('/mnt/oca-addons/helpdesk/helpdesk_mgmt/__manifest__.py') as f:
    manifest = ast.literal_eval(f.read())
    print(manifest['depends'])

# Instalar dependências primeiro
# odoo --install-module base,web,mail antes de instalar helpdesk_mgmt
```

### Problema: Conflito de versões

```bash
# Verificar versão do Odoo
docker exec -it neo_odoo odoo --version

# Verificar versão do módulo OCA
cat /mnt/oca-addons/helpdesk/helpdesk_mgmt/__manifest__.py | grep version

# Trocar branch se necessário
cd /opt/odoo/oca/helpdesk
git checkout 19.0
```

## Monitoramento com Wazuh

### Regra Customizada para Logs Odoo

```xml
<!-- /var/ossec/etc/rules/local_rules.xml -->
<group name="odoo,">
  <rule id="100010" level="3">
    <decoded_as>odoo</decoded_as>
    <description>Odoo OCA module event</description>
  </rule>

  <rule id="100011" level="5">
    <if_sid>100010</if_sid>
    <match>ERROR</match>
    <description>Odoo OCA module error</description>
  </rule>

  <rule id="100012" level="10">
    <if_sid>100010</if_sid>
    <match>CRITICAL</match>
    <description>Odoo OCA module critical error</description>
  </rule>
</group>
```

## Performance e Otimização

### 1. Cache de Queries

```python
# Usar computed fields com store=True
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
        'Resolution Time (hours)',
        compute='_compute_resolution_time',
        store=True,  # Armazena no banco para queries rápidas
    )
```

### 2. Índices no PostgreSQL

```sql
-- Criar índices para pesquisas rápidas
CREATE INDEX idx_helpdesk_ticket_create_date
ON helpdesk_ticket(create_date);

CREATE INDEX idx_helpdesk_ticket_team_stage
ON helpdesk_ticket(team_id, stage_id);

CREATE INDEX idx_maintenance_equipment_category
ON maintenance_equipment(category_id);
```

### 3. Queue Jobs para Processos Longos

```python
from odoo import models, api
from odoo.addons.queue_job.job import job

class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    @job
    def sync_from_netbox(self):
        """Sincroniza equipamentos do NetBox em background"""
        # Processo longo executado via queue_job
        self._sync_netbox_devices()

    def action_sync_netbox(self):
        """Trigger para sincronização"""
        self.with_delay().sync_from_netbox()
```

## Backup e Restore

### Backup de Módulos OCA

```bash
#!/bin/bash
# Script: backup_oca.sh

BACKUP_DIR="/opt/backups/oca"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup de código
tar -czf $BACKUP_DIR/oca_modules_$DATE.tar.gz /opt/odoo/oca/

# Backup de banco (dados dos módulos)
docker exec neo_db pg_dump -U odoo -d neonetbox_odoo \
  -t 'helpdesk_*' -t 'project_*' -t 'maintenance_*' \
  > $BACKUP_DIR/oca_data_$DATE.sql

echo "Backup concluído: $DATE"
```

## Recursos Adicionais

### Links OCA Oficiais

- **Repositório Principal**: https://github.com/OCA
- **Documentação**: https://odoo-community.org/
- **Helpdesk**: https://github.com/OCA/helpdesk
- **Project**: https://github.com/OCA/project
- **REST Framework**: https://github.com/OCA/rest-framework
- **Reporting**: https://github.com/OCA/reporting-engine

### Comunidade

- **Forum**: https://discuss.odoo.com/c/oca
- **Slack**: https://odoo-community.org/slack
- **Stack Overflow**: Tag [odoo] + [oca]

### Contribuindo

```bash
# Fork do repositório
git clone https://github.com/SEU_USER/helpdesk.git

# Criar branch para feature
git checkout -b feature/nova-funcionalidade

# Commit seguindo padrão OCA
git commit -m "[ADD] helpdesk_mgmt: nova funcionalidade X"

# Push e criar PR
git push origin feature/nova-funcionalidade
```

## Próximos Passos

1. Explore a documentação específica de cada módulo
2. Configure integrações com NetBox e Wazuh
3. Customize workflows conforme sua necessidade
4. Implemente monitoramento via Wazuh
5. Configure backups automatizados

---

**Versão**: 2.0
**Última atualização**: 2025-12-05
**Mantido por**: Equipe NEO Stack
