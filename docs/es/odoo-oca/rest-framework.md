# Módulos OCA REST Framework

> **AI Context**: Documentación completa de los módulos REST Framework de OCA para Odoo 19, incluyendo FastAPI, autenticación por API key, queue jobs e Pydantic. Estos módulos proporcionan infraestructura moderna de APIs REST para integración de Odoo con sistemas externos como NetBox e Wazuh en NEO_NETBOX_ODOO_STACK. Referencia para creación de endpoints REST, procesamiento asíncrono e validación de datos.

## Visión General

Los módulos **REST Framework OCA** proporcionan infraestructura moderna para crear **APIs REST** en Odoo 19, utilizando **FastAPI** como framework principal e incluyendo sistema de **colas asíncronas** e **validación de datos**.

### Módulos Incluidos

| Módulo | Versión | Función | Status |
|--------|--------|--------|--------|
| fastapi | 18.0.1.3.1 | Framework FastAPI en Odoo | Activo |
| fastapi_auth_api_key | 18.0.1.0.0 | Autenticación por API Key | Activo |
| queue_job | 19.0.1.0.0 | Procesamiento asíncrono | Activo |
| pydantic | 19.0.1.0.0 | Validación de esquemas | Activo |

## Arquitectura

```
┌────────────────────────────────────────────────────────┐
│                  REST Framework Stack                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────┐         ┌────────────┐               │
│  │  External  │────────►│  FastAPI   │               │
│  │  Clients   │  HTTP   │  Endpoints │               │
│  └────────────┘         └─────┬──────┘               │
│                               │                       │
│                    ┌──────────┼──────────┐           │
│                    │          │          │           │
│              ┌─────▼─────┐ ┌─▼────┐ ┌──▼─────┐     │
│              │ API Key   │ │Queue │ │Pydantic│     │
│              │   Auth    │ │Jobs  │ │Schemas │     │
│              └─────┬─────┘ └─┬────┘ └──┬─────┘     │
│                    │          │          │           │
│              ┌─────▼──────────▼──────────▼─────┐    │
│              │      Odoo Business Logic       │    │
│              │  (Models, Controllers, etc.)   │    │
│              └────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │    Integrations: NetBox, Wazuh, etc.        │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Instalación

### 1. Prerequisitos Python

```bash
# Instalar dependências
pip install fastapi>=0.104.0
pip install pydantic>=2.0.0
pip install uvicorn[standard]
pip install python-multipart
```

### 2. Clone dos Repositorios

```bash
cd /opt/odoo/oca
git clone -b 19.0 https://github.com/OCA/rest-framework.git
```

### 3. Configuración no odoo.conf

```ini
[options]
addons_path = /mnt/extra-addons,/mnt/oca-addons/rest-framework

# Workers necessários para FastAPI
workers = 4
max_cron_threads = 2
```

### 4. Instalación via Docker

```bash
# Actualizar requirements.txt do container
cat >> /opt/odoo/requirements.txt <<EOF
fastapi>=0.104.0
pydantic>=2.0.0
uvicorn[standard]
EOF

# Rebuild do container
docker-compose build odoo

# Instalar módulos
docker exec -it neo_odoo odoo shell -d neonetbox_odoo \
  -i fastapi,fastapi_auth_api_key,queue_job,pydantic \
  --stop-after-init
```

## Módulo: fastapi

### Funcionalidades

- Criação de endpoints REST modernos
- Documentación automática (Swagger/OpenAPI)
- Validación automática de request/response
- Suporte a async/await
- Type hints e auto-completion

### Crear App FastAPI

```python
# /opt/odoo/addons/neo_api/fastapi_app.py

from odoo.addons.fastapi.dependencies import odoo_env
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

# Router principal
router = APIRouter(prefix="/api/v1")


# Schemas Pydantic
class TicketCreate(BaseModel):
    name: str
    description: str | None = None
    priority: str = "2"
    team_id: int


class TicketResponse(BaseModel):
    id: int
    number: str
    name: str
    stage: str
    priority: str
    create_date: str

    class Config:
        from_attributes = True


# Endpoints
@router.get("/tickets", response_model=List[TicketResponse])
def list_tickets(env=Depends(odoo_env)):
    """Listar todos os tickets"""
    Ticket = env["helpdesk.ticket"]
    tickets = Ticket.search([], limit=100)

    return [
        TicketResponse(
            id=t.id,
            number=t.number,
            name=t.name,
            stage=t.stage_id.name,
            priority=t.priority,
            create_date=t.create_date.isoformat(),
        )
        for t in tickets
    ]


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, env=Depends(odoo_env)):
    """Obtener ticket específico"""
    Ticket = env["helpdesk.ticket"]
    ticket = Ticket.browse(ticket_id)

    if not ticket.exists():
        raise HTTPException(status_code=404, detail="Ticket not found")

    return TicketResponse(
        id=ticket.id,
        number=ticket.number,
        name=ticket.name,
        stage=ticket.stage_id.name,
        priority=ticket.priority,
        create_date=ticket.create_date.isoformat(),
    )


@router.post("/tickets", response_model=TicketResponse, status_code=201)
def create_ticket(ticket_data: TicketCreate, env=Depends(odoo_env)):
    """Crear novo ticket"""
    Ticket = env["helpdesk.ticket"]

    ticket = Ticket.create({
        'name': ticket_data.name,
        'description': ticket_data.description,
        'priority': ticket_data.priority,
        'team_id': ticket_data.team_id,
    })

    return TicketResponse(
        id=ticket.id,
        number=ticket.number,
        name=ticket.name,
        stage=ticket.stage_id.name,
        priority=ticket.priority,
        create_date=ticket.create_date.isoformat(),
    )


@router.patch("/tickets/{ticket_id}/stage")
def update_ticket_stage(ticket_id: int, stage_id: int, env=Depends(odoo_env)):
    """Actualizar estágio do ticket"""
    Ticket = env["helpdesk.ticket"]
    ticket = Ticket.browse(ticket_id)

    if not ticket.exists():
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.write({'stage_id': stage_id})

    return {"status": "success", "message": "Stage updated"}


@router.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: int, env=Depends(odoo_env)):
    """Eliminar ticket"""
    Ticket = env["helpdesk.ticket"]
    ticket = Ticket.browse(ticket_id)

    if not ticket.exists():
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.unlink()

    return {"status": "success", "message": "Ticket deleted"}
```

### Registrar App en Odoo

```python
# /opt/odoo/addons/neo_api/__manifest__.py

{
    'name': 'NEO API',
    'version': '19.0.1.0.0',
    'category': 'API',
    'depends': ['fastapi', 'helpdesk_mgmt'],
    'data': [],
    'installable': True,
}


# /opt/odoo/addons/neo_api/models/fastapi_app.py

from odoo import models
from odoo.addons.fastapi.context import odoo_env_ctx

class FastapiApp(models.Model):
    _inherit = 'fastapi.app'

    def _get_app(self):
        if self.app_name == "neo_api":
            from ..fastapi_app import router
            return router
        return super()._get_app()
```

### Documentación Automática

Acesse:
- **Swagger UI**: `http://localhost:8069/api/docs`
- **ReDoc**: `http://localhost:8069/api/redoc`
- **OpenAPI JSON**: `http://localhost:8069/api/openapi.json`

## Módulo: fastapi_auth_api_key

### Funcionalidades

- Autenticación por API Key
- Múltiplas chaves por usuario
- Controle de expiração
- Logs de uso

### Crear API Keys

```python
# Via shell de Odoo
from odoo import api, SUPERUSER_ID

env = api.Environment(cr, SUPERUSER_ID, {})

# Crear API Key para integración NetBox
User = env['res.users']
user = User.search([('login', '=', 'admin')], limit=1)

ApiKey = env['auth.api.key']
api_key = ApiKey.create({
    'name': 'NetBox Integration',
    'user_id': user.id,
    'scope_ids': [(6, 0, [])],  # Todos os escopos
})

print(f"API Key: {api_key.key}")
print(f"Use in header: X-API-Key: {api_key.key}")
```

### Proteger Endpoints

```python
# Usar dependency de autenticación
from odoo.addons.fastapi.dependencies import authenticated_partner
from fastapi import Depends, Security

@router.get("/protected/data")
def protected_endpoint(
    partner=Security(authenticated_partner),
    env=Depends(odoo_env)
):
    """Endpoint protegido por API Key"""
    return {
        "message": "Access granted",
        "partner": partner.name,
        "email": partner.email,
    }
```

### Configurar Scopes

```python
# Crear scopes de permissão
Scope = env['auth.api.key.scope']

scopes = [
    {'name': 'tickets:read', 'description': 'Read tickets'},
    {'name': 'tickets:write', 'description': 'Create/Update tickets'},
    {'name': 'projects:read', 'description': 'Read projects'},
    {'name': 'projects:write', 'description': 'Create/Update projects'},
]

for scope_data in scopes:
    Scope.create(scope_data)
```

### Validar Scope no Endpoint

```python
from odoo.addons.fastapi.dependencies import authenticated_partner_with_scope

@router.post("/tickets")
def create_ticket(
    ticket_data: TicketCreate,
    partner=Security(authenticated_partner_with_scope, scopes=["tickets:write"]),
    env=Depends(odoo_env)
):
    """Crear ticket (requer scope tickets:write)"""
    # Implementation...
    pass
```

## Módulo: queue_job

### Funcionalidades

- Procesamiento asíncrono de tareas
- Retry automático em caso de falha
- Priorização de jobs
- Monitor de execução
- Agendamento de jobs

### Crear Job Assíncrono

```python
# Decorator @job para métodos
from odoo import models, api
from odoo.addons.queue_job.job import job

class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    @job
    def send_notification_email(self):
        """Envía email em background"""
        self.ensure_one()

        template = self.env.ref('helpdesk_mgmt.ticket_notification_template')
        template.send_mail(self.id, force_send=True)

        return f"Email sent for ticket {self.number}"

    def action_send_notification(self):
        """Trigger para enfileirar job"""
        # Enfileirar com delay
        self.with_delay(priority=10).send_notification_email()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'message': 'Notification scheduled',
                'type': 'success',
            }
        }
```

### Sincronização NetBox em Background

```python
# Job de sincronização pesada
from odoo import models, api
from odoo.addons.queue_job.job import job
import requests
import os

class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    @job(default_channel='root.netbox', retry_pattern={1: 60, 5: 300})
    def sync_from_netbox_async(self):
        """Sincroniza equipos do NetBox em background"""
        netbox_url = os.getenv('NETBOX_URL', 'http://netbox:8000')
        netbox_token = os.getenv('NETBOX_TOKEN')

        # Buscar devices
        response = requests.get(
            f"{netbox_url}/api/dcim/devices/",
            headers={'Authorization': f'Token {netbox_token}'},
            params={'limit': 1000}
        )

        if response.status_code != 200:
            raise Exception(f"NetBox API error: {response.status_code}")

        devices = response.json()['results']

        # Procesar cada device
        created = 0
        updated = 0

        for device in devices:
            existing = self.search([('netbox_id', '=', device['id'])], limit=1)

            values = {
                'name': device['display'],
                'serial_no': device.get('serial'),
                'model': device['device_type']['model'],
                'netbox_id': device['id'],
            }

            if existing:
                existing.write(values)
                updated += 1
            else:
                self.create(values)
                created += 1

        return {
            'status': 'success',
            'created': created,
            'updated': updated,
            'total': len(devices),
        }

    @api.model
    def action_sync_netbox_background(self):
        """Iniciar sincronização em background"""
        # Enfileirar job com prioridade alta
        self.with_delay(priority=5, description='Sync NetBox Devices').sync_from_netbox_async()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'message': 'NetBox sync started in background',
                'type': 'info',
            }
        }
```

### Configurar Channels

```python
# Crear channels personalizados
Channel = env['queue.job.channel']

channels = [
    {'name': 'root.netbox', 'parent_id': env.ref('queue_job.channel_root').id},
    {'name': 'root.wazuh', 'parent_id': env.ref('queue_job.channel_root').id},
    {'name': 'root.email', 'parent_id': env.ref('queue_job.channel_root').id},
]

for channel_data in channels:
    Channel.create(channel_data)
```

### Monitor de Jobs

```python
# View para monitorar jobs
@router.get("/jobs/status")
def get_jobs_status(env=Depends(odoo_env)):
    """Status dos jobs na fila"""
    Job = env['queue.job']

    pending = Job.search_count([('state', '=', 'pending')])
    running = Job.search_count([('state', '=', 'started')])
    failed = Job.search_count([('state', '=', 'failed')])
    done = Job.search_count([('state', '=', 'done')])

    return {
        'pending': pending,
        'running': running,
        'failed': failed,
        'done': done,
        'total': pending + running + failed + done,
    }


@router.get("/jobs/failed")
def get_failed_jobs(env=Depends(odoo_env)):
    """Listar jobs com falha"""
    Job = env['queue.job']

    failed_jobs = Job.search([('state', '=', 'failed')], limit=50, order='date_created desc')

    return [
        {
            'id': job.id,
            'name': job.name,
            'model': job.model_name,
            'method': job.method_name,
            'exc_info': job.exc_info,
            'date_created': job.date_created.isoformat(),
        }
        for job in failed_jobs
    ]


@router.post("/jobs/{job_id}/retry")
def retry_job(job_id: int, env=Depends(odoo_env)):
    """Retentar job com falha"""
    Job = env['queue.job']
    job = Job.browse(job_id)

    if not job.exists():
        raise HTTPException(status_code=404, detail="Job not found")

    job.requeue()

    return {"status": "success", "message": "Job requeued"}
```

## Módulo: pydantic

### Funcionalidades

- Schemas de validación de datos
- Type hints e validação automática
- Conversão de modelos Odoo para Pydantic
- Serialização customizada

### Schemas Complexos

```python
# Schemas para API completa
from pydantic import BaseModel, Field, validator, EmailStr
from datetime import datetime
from typing import List, Optional
from enum import Enum


class Priority(str, Enum):
    LOW = "1"
    NORMAL = "2"
    HIGH = "3"


class TeamBase(BaseModel):
    id: int
    name: str


class UserBase(BaseModel):
    id: int
    name: str
    email: EmailStr | None = None


class StageBase(BaseModel):
    id: int
    name: str
    is_close: bool


class TicketDetail(BaseModel):
    id: int
    number: str
    name: str
    description: str | None = None
    priority: Priority
    create_date: datetime
    close_date: datetime | None = None

    # Relações
    team: TeamBase
    stage: StageBase
    user: UserBase | None = None
    partner_email: EmailStr | None = None

    # Campos computados
    is_open: bool
    days_open: int | None = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

    @validator('days_open', always=True)
    def compute_days_open(cls, v, values):
        """Calcular dias em aberto"""
        if values.get('is_open'):
            create_date = values.get('create_date')
            if create_date:
                delta = datetime.now() - create_date
                return delta.days
        return None


class TicketCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: str | None = Field(None, max_length=5000)
    priority: Priority = Priority.NORMAL
    team_id: int = Field(..., gt=0)
    partner_email: EmailStr | None = None

    @validator('name')
    def validate_name(cls, v):
        """Validar que o nome não é vazio"""
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class TicketUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=3, max_length=200)
    description: str | None = None
    priority: Priority | None = None
    stage_id: int | None = Field(None, gt=0)
    user_id: int | None = Field(None, gt=0)

    class Config:
        # Permitir partial updates
        extra = 'forbid'
```

### Convertir Odoo para Pydantic

```python
# Helper para conversão
def odoo_ticket_to_pydantic(ticket) -> TicketDetail:
    """Convierte registro Odoo para schema Pydantic"""
    return TicketDetail(
        id=ticket.id,
        number=ticket.number,
        name=ticket.name,
        description=ticket.description,
        priority=ticket.priority,
        create_date=ticket.create_date,
        close_date=ticket.close_date,
        team=TeamBase(id=ticket.team_id.id, name=ticket.team_id.name),
        stage=StageBase(
            id=ticket.stage_id.id,
            name=ticket.stage_id.name,
            is_close=ticket.stage_id.is_close,
        ),
        user=UserBase(
            id=ticket.user_id.id,
            name=ticket.user_id.name,
            email=ticket.user_id.email,
        ) if ticket.user_id else None,
        partner_email=ticket.partner_email,
        is_open=not ticket.stage_id.is_close,
    )


# Usar no endpoint
@router.get("/tickets/{ticket_id}", response_model=TicketDetail)
def get_ticket_detail(ticket_id: int, env=Depends(odoo_env)):
    """Obtener detalhes completos do ticket"""
    Ticket = env["helpdesk.ticket"]
    ticket = Ticket.browse(ticket_id)

    if not ticket.exists():
        raise HTTPException(status_code=404, detail="Ticket not found")

    return odoo_ticket_to_pydantic(ticket)
```

## Integração Completa: Wazuh Webhook

### Endpoint para Recibir Alertas

```python
# API completa para Wazuh
from pydantic import BaseModel, Field
from typing import Dict, Any

class WazuhRule(BaseModel):
    id: str
    description: str
    level: int
    mitre_id: List[str] | None = None


class WazuhAgent(BaseModel):
    id: str
    name: str
    ip: str | None = None


class WazuhAlertData(BaseModel):
    rule: WazuhRule
    agent: WazuhAgent
    timestamp: datetime
    full_log: str
    data: Dict[str, Any] | None = None


@router.post("/webhooks/wazuh/alert")
def receive_wazuh_alert(
    alert: WazuhAlertData,
    partner=Security(authenticated_partner_with_scope, scopes=["webhooks:write"]),
    env=Depends(odoo_env)
):
    """Recibir alerta do Wazuh e criar ticket"""

    # Apenas alertas >= nível 7
    if alert.rule.level < 7:
        return {"status": "ignored", "reason": "Low severity"}

    # Verificar duplicata
    Ticket = env["helpdesk.ticket"]
    existing = Ticket.search([
        ('wazuh_alert_id', '=', alert.rule.id),
        ('wazuh_agent_name', '=', alert.agent.name),
        ('create_date', '>=', (datetime.now() - timedelta(hours=1)).isoformat()),
    ], limit=1)

    if existing:
        return {"status": "duplicate", "ticket_id": existing.id}

    # Determinar prioridade
    priority = "3" if alert.rule.level >= 12 else "2" if alert.rule.level >= 9 else "1"

    # Crear ticket
    ticket = Ticket.create({
        'name': f"[WAZUH-{alert.rule.level}] {alert.rule.description}",
        'description': f"""
**Alerta de Segurança**

**Agente**: {alert.agent.name} ({alert.agent.ip or 'N/A'})
**Regra**: {alert.rule.id} - {alert.rule.description}
**Nível**: {alert.rule.level}
**Timestamp**: {alert.timestamp}

**Log Completo**:
```
{alert.full_log}
```
        """,
        'priority': priority,
        'team_id': env.ref('helpdesk_mgmt.team_security').id,
        'wazuh_alert_id': alert.rule.id,
        'wazuh_agent_name': alert.agent.name,
    })

    # Enfileirar notificação
    ticket.with_delay(priority=10).send_notification_email()

    return {
        "status": "created",
        "ticket_id": ticket.id,
        "ticket_number": ticket.number,
    }
```

## Performance e Otimização

### Cache de Responses

```python
from functools import lru_cache
from fastapi import Request

@lru_cache(maxsize=128)
def get_teams_cached():
    """Cache de equipes por 5 minutos"""
    # Implementation...
    pass


@router.get("/teams")
async def list_teams(request: Request, env=Depends(odoo_env)):
    """Listar equipes (cached)"""
    return get_teams_cached()
```

### Pagination

```python
from pydantic import BaseModel
from typing import Generic, TypeVar, List

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int


@router.get("/tickets", response_model=PaginatedResponse[TicketResponse])
def list_tickets_paginated(
    page: int = 1,
    page_size: int = 50,
    env=Depends(odoo_env)
):
    """Listar tickets com paginação"""
    Ticket = env["helpdesk.ticket"]

    # Total
    total = Ticket.search_count([])

    # Itens da página
    offset = (page - 1) * page_size
    tickets = Ticket.search([], limit=page_size, offset=offset)

    items = [odoo_ticket_to_pydantic(t) for t in tickets]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )
```

## Troubleshooting

### Problema: FastAPI não iniciando

```bash
# Verificar logs
docker logs neo_odoo | grep -i fastapi

# Testar manualmente
docker exec -it neo_odoo python3 -c "import fastapi; print(fastapi.__version__)"

# Reinstalar
pip uninstall fastapi pydantic
pip install fastapi==0.104.0 pydantic==2.0.0
```

### Problema: Queue Jobs não executando

```bash
# Verificar job runner
docker exec -it neo_odoo odoo shell -d neonetbox_odoo

# No shell:
from odoo import api, SUPERUSER_ID
env = api.Environment(cr, SUPERUSER_ID, {})

# Listar jobs pendentes
jobs = env['queue.job'].search([('state', '=', 'pending')])
print(f"Pending jobs: {len(jobs)}")

# Forzar execução
for job in jobs:
    try:
        job.process()
        print(f"Processed: {job.name}")
    except Exception as e:
        print(f"Error: {e}")
```

### Problema: Autenticación falhando

```python
# Verificar API Key
api_key = env['auth.api.key'].search([('key', '=', 'YOUR_KEY')])
print(f"Key: {api_key.name}, Active: {api_key.active}, User: {api_key.user_id.name}")

# Testar via curl
curl -H "X-API-Key: YOUR_KEY" http://localhost:8069/api/v1/tickets
```

## Recursos Adicionales

- **Repositorio OCA**: https://github.com/OCA/rest-framework
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Pydantic Docs**: https://docs.pydantic.dev/
- **Queue Job**: https://github.com/OCA/queue

---

**Siguiente**: [Reporting Engine](reporting-engine.md)
