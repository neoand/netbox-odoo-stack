# AI Context File - NEO_NETBOX_ODOO_STACK v2.0

> **Purpose**: This file provides comprehensive context for LLMs (Large Language Models) to understand, develop, implement, and support this project. Read this file FIRST before any other documentation.

---

## PROJECT IDENTITY

**Name**: NEO_NETBOX_ODOO_STACK
**Version**: 2.0
**Type**: Enterprise IT Infrastructure Management Platform
**License**: AGPL-3.0

### One-Line Description
Integrated CMDB + SIEM + ERP platform combining NetBox, Wazuh, and Odoo with OCA modules for complete IT infrastructure lifecycle management.

### Core Value Proposition
Transform chaotic infrastructure management into automated, compliant, and measurable operations with ROI ranging from 270% to 11,592%.

---

## TECHNOLOGY STACK

### Primary Components

| Component | Version | Purpose | Port |
|-----------|---------|---------|------|
| **Odoo** | 19 Community | ERP, ITSM, Helpdesk, Asset Management | 8069 |
| **NetBox** | 4.2 | CMDB, IPAM, Source of Truth | 8000 |
| **Wazuh** | 4.12+ | SIEM, XDR, Security Monitoring | 443, 55000 |
| **Shuffle** | Latest | SOAR, Security Automation | 3001 |
| **n8n** | Latest | Workflow Automation | 5678 |

### OCA (Odoo Community Association) Modules

```yaml
OCA_MODULES:
  helpdesk:
    - helpdesk_mgmt           # Core helpdesk (use for dev/lab)
    - helpdesk_mgmt_sla       # SLA tracking
    - helpdesk_type_sla       # SLA by ticket type
    - helpdesk_mgmt_project   # Project integration
    - helpdesk_mgmt_timesheet # Timesheet tracking
    - helpdesk_ticket_related # Related tickets

  project:
    - project_timeline        # Gantt charts
    - project_task_code       # Sequential codes
    - project_template        # Reusable templates
    - project_stakeholder     # Stakeholder management

  rest-framework:
    - fastapi                 # Modern async APIs
    - fastapi_auth_api_key    # API key authentication
    - queue_job               # Async job processing
    - pydantic                # Data validation

  reporting-engine:
    - report_xlsx             # Excel export
    - report_csv              # CSV export
    - bi_sql_editor           # BI views builder
    - sql_export_excel        # SQL to Excel

  server-ux:
    - announcement            # Internal notifications
    - server_action_mass_edit # Bulk editing
    - base_tier_validation    # Approval workflows

  stock-logistics-warehouse:
    - stock_inventory         # Inventory management
    - stock_location_zone     # Location zones
    - stock_move_location     # Bulk transfers

  maintenance:
    - maintenance_plan        # Preventive maintenance
    - maintenance_equipment_hierarchy # Equipment hierarchy
```

### Infrastructure Components

```yaml
INFRASTRUCTURE:
  databases:
    - PostgreSQL 15 (Odoo)
    - PostgreSQL 15 (NetBox)
    - OpenSearch (Wazuh Indexer)

  cache:
    - Redis 7 (Odoo sessions)
    - Redis 7 (NetBox cache)

  monitoring:
    - Prometheus (metrics)
    - Grafana (dashboards)

  documentation:
    - MkDocs Material 9.7.0
```

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NEO_NETBOX_ODOO_STACK v2.0                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐   │
│  │  NetBox 4.2 │   │ Wazuh 4.12  │   │   Odoo 19 + OCA         │   │
│  │             │   │             │   │                         │   │
│  │  • CMDB     │   │  • SIEM     │   │  • helpdesk_mgmt        │   │
│  │  • IPAM     │   │  • XDR      │   │  • project_timeline     │   │
│  │  • Webhooks │   │  • FIM      │   │  • fastapi              │   │
│  │  • Events   │   │  • SCA      │   │  • queue_job            │   │
│  └──────┬──────┘   └──────┬──────┘   │  • maintenance_*        │   │
│         │                 │          │  • report_xlsx          │   │
│         │                 │          └───────────┬─────────────┘   │
│         │                 │                      │                 │
│         └─────────────────┴──────────────────────┘                 │
│                           │                                        │
│                           ▼                                        │
│              ┌────────────────────────┐                            │
│              │      SOAR Layer        │                            │
│              │  Shuffle  |  n8n       │                            │
│              │  • Auto-ticketing      │                            │
│              │  • Asset enrichment    │                            │
│              │  • Incident response   │                            │
│              └────────────────────────┘                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## KEY INTEGRATION FLOWS

### 1. Security Alert → Ticket (Wazuh → Odoo)

```
Wazuh Alert → Shuffle/n8n → NetBox Enrichment → Odoo Helpdesk Ticket
     │              │              │                    │
     │              │              │                    ▼
     │              │              │            helpdesk.ticket
     │              │              │            (or project.task)
     │              │              ▼
     │              │        Asset context:
     │              │        - Location
     │              │        - Criticality
     │              │        - Owner
     │              ▼
     │         Workflow:
     │         - VirusTotal check
     │         - IP reputation
     │         - Auto-response
     ▼
  rule_level >= 7
  rule_groups: [vulnerability, compliance, malware]
```

### 2. Asset Sync (NetBox → Odoo)

```
NetBox Device → Webhook → queue_job → Odoo Equipment
     │              │          │            │
     │              │          │            ▼
     │              │          │     maintenance.equipment
     │              │          │     (or product.product)
     │              │          ▼
     │              │     Async processing
     │              │     with retry logic
     │              ▼
     │         Event types:
     │         - device.created
     │         - device.updated
     │         - device.deleted
     ▼
  Custom fields:
  - asset_tag → default_code
  - serial → serial_no
  - site → location_id
```

### 3. Compliance Report (All Systems)

```
NetBox (assets) + Wazuh (SCA) + Odoo (tickets) → BI Dashboard
        │              │              │               │
        │              │              │               ▼
        │              │              │         Grafana/Kibana
        │              │              ▼
        │              │        Open tickets
        │              │        by compliance issue
        │              ▼
        │         SCA results:
        │         - CIS benchmarks
        │         - PCI-DSS
        │         - ISO 27001
        ▼
   Asset inventory:
   - Total devices
   - By criticality
   - By location
```

---

## FILE STRUCTURE

```
neo_netbox_odoo_stack/
├── AI_CONTEXT.md                    # THIS FILE - Read first
├── CLAUDE.md                        # Claude Code specific context
├── README.md                        # Project overview
├── docker-compose.yml               # Main orchestration
├── .env.example                     # Environment template
│
├── docs/
│   ├── pt/                          # Portuguese documentation
│   │   ├── README.md
│   │   ├── 00-getting-started/      # Quick start
│   │   ├── 01-architecture/         # System design
│   │   ├── 02-installation/         # Setup guides
│   │   ├── 03-odoo-oca/             # Odoo + OCA modules
│   │   ├── 04-netbox/               # NetBox configuration
│   │   ├── 05-wazuh/                # Wazuh SIEM
│   │   ├── 06-integrations/         # System integrations
│   │   ├── 07-soar/                 # Shuffle + n8n
│   │   ├── 08-operations/           # Day-2 operations
│   │   ├── 09-development/          # Dev guides
│   │   ├── 10-api-reference/        # API documentation
│   │   └── 99-appendix/             # Quick refs, glossary
│   │
│   └── es/                          # Spanish documentation (mirror)
│
├── lab/
│   └── docker-compose.yml           # Main lab environment
│
├── labs/
│   ├── security/                    # Security-focused lab
│   ├── iot-ot/                      # IoT/OT lab
│   └── cloud/                       # Cloud simulation lab
│
├── addons/
│   ├── oca/                         # OCA modules (git submodules)
│   │   ├── helpdesk/
│   │   ├── project/
│   │   ├── rest-framework/
│   │   ├── queue/
│   │   ├── server-ux/
│   │   ├── reporting-engine/
│   │   ├── stock-logistics-warehouse/
│   │   ├── maintenance/
│   │   └── agreement/
│   │
│   └── custom/                      # Custom integration modules
│       ├── wazuh_integration/
│       ├── netbox_sync/
│       └── neo_stack_core/
│
├── config/
│   ├── wazuh/                       # Wazuh configurations
│   ├── prometheus/                  # Prometheus config
│   └── grafana/                     # Grafana dashboards
│
├── scripts/
│   ├── setup/                       # Installation scripts
│   ├── backup/                      # Backup scripts
│   └── migration/                   # Migration tools
│
└── tests/
    ├── integration/                 # Integration tests
    └── e2e/                         # End-to-end tests
```

---

## CODING STANDARDS

### Python (Odoo/FastAPI)

```python
# Use type hints
def process_alert(alert: dict, asset_id: int | None = None) -> dict:
    """
    Process Wazuh alert and create ticket.

    Args:
        alert: Wazuh alert data
        asset_id: Optional NetBox asset ID for enrichment

    Returns:
        dict with ticket_id and status
    """
    pass

# Use Pydantic for validation
from pydantic import BaseModel

class WazuhAlert(BaseModel):
    rule_id: str
    rule_level: int
    rule_description: str
    srcip: str | None = None
    hostname: str | None = None

# Use queue_job for async operations
from odoo.addons.queue_job.job import job

@job
def sync_netbox_asset(self, device_id: int):
    """Async job to sync NetBox device to Odoo."""
    pass
```

### Odoo Module Structure

```
custom_module/
├── __manifest__.py      # Module metadata
├── __init__.py          # Python imports
├── models/
│   ├── __init__.py
│   └── my_model.py      # Business logic
├── views/
│   └── my_view.xml      # UI definitions
├── security/
│   └── ir.model.access.csv  # Access rights
├── data/
│   └── data.xml         # Default data
└── README.md            # Module documentation
```

### Documentation Standards

```markdown
# Title (H1 - one per file)

> **AI Context**: Brief description for LLMs

## Section (H2)

### Subsection (H3)

#### Code Example
```language
// Code with comments
```

#### Configuration
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| param1    | str  | ""      | Description |

#### Related
- [Link to related doc](./path.md)
```

---

## COMMON TASKS FOR AI ASSISTANTS

### Task 1: Add New Integration

1. Create module in `addons/custom/`
2. Implement FastAPI endpoint in `controllers/`
3. Add queue_job for async processing
4. Create Odoo model for data storage
5. Document in `docs/*/06-integrations/`

### Task 2: Create Wazuh Rule + Response

1. Define rule in `config/wazuh/rules/`
2. Create Shuffle/n8n workflow
3. Map to Odoo ticket/project
4. Document in `docs/*/05-wazuh/`

### Task 3: Add OCA Module

1. Add as git submodule to `addons/oca/`
2. Update `docker-compose.yml` volume
3. Install via Odoo Apps
4. Document in `docs/*/03-odoo-oca/`

### Task 4: Translate Documentation

1. Copy from `docs/pt/` to `docs/es/`
2. Translate content maintaining structure
3. Update `mkdocs.yml` navigation
4. Verify links work in both languages

---

## ENVIRONMENT VARIABLES

```bash
# Odoo
ODOO_DB_PASSWORD=secure_password
ODOO_ADMIN_PASSWORD=admin_secure

# NetBox
NETBOX_DB_PASSWORD=secure_password
NETBOX_SECRET_KEY=long_random_string
NETBOX_API_TOKEN=generated_token

# Wazuh
WAZUH_INDEXER_PASSWORD=secure_password
WAZUH_API_USER=wazuh-api
WAZUH_API_PASSWORD=secure_password

# SOAR
SHUFFLE_WEBHOOK_URL=https://shuffle/api/v1/hooks/xxx
N8N_USER=admin
N8N_PASSWORD=secure_password

# Monitoring
GRAFANA_PASSWORD=secure_password
```

---

## API ENDPOINTS QUICK REFERENCE

### Odoo FastAPI

```
POST /api/v1/wazuh/alert      # Receive Wazuh alert
POST /api/v1/netbox/webhook   # Receive NetBox webhook
GET  /api/v1/assets           # List assets
GET  /api/v1/tickets          # List tickets
POST /api/v1/tickets          # Create ticket
```

### NetBox REST API

```
GET  /api/dcim/devices/       # List devices
POST /api/dcim/devices/       # Create device
GET  /api/ipam/ip-addresses/  # List IPs
POST /api/extras/webhooks/    # Configure webhook
```

### Wazuh API

```
GET  /security/user/authenticate  # Get token
GET  /agents                      # List agents
GET  /sca/{agent_id}              # SCA results
GET  /vulnerability/{agent_id}    # Vulnerabilities
```

---

## TROUBLESHOOTING QUICK GUIDE

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Odoo 500 error | Missing OCA dependency | Check `__manifest__.py` depends |
| NetBox webhook not firing | Event rule not active | Enable in Admin > Event Rules |
| Wazuh alerts not reaching Shuffle | Integration not configured | Check `/var/ossec/etc/ossec.conf` |
| queue_job not processing | Jobrunner not running | Start `odoo-queue-job` service |

### Log Locations

```bash
# Odoo
/var/log/odoo/odoo-server.log
docker logs odoo19

# NetBox
docker logs netbox

# Wazuh
/var/ossec/logs/ossec.log
/var/ossec/logs/alerts/alerts.json

# Shuffle
docker logs shuffle-backend

# n8n
docker logs n8n
```

---

## CONTACT & SUPPORT

- **Documentation**: `/docs/pt/` (Portuguese) or `/docs/es/` (Spanish)
- **Issues**: GitHub Issues
- **Community**: OCA, Wazuh Community, NetBox Community

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12 | Odoo 19, Wazuh 4.12, NetBox 4.2, OCA modules |
| 1.0 | 2024 | Initial release with Odoo 17, Wazuh 4.7 |

---

**Last Updated**: 2025-12-05
**Maintained By**: NEO Stack Team
**AI Context Version**: 2.0
