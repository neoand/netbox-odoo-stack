# Integración Wazuh ↔ Odoo

> **AI Context**: Este documento describe la integración para auto-ticketing entre Wazuh SIEM y Odoo Helpdesk, creando tickets automáticamente a partir de alertas de seguridad, con mapeo de prioridad, deduplicación inteligente y enriquecimiento de contexto.

## Objetivo

- **Auto-crear tickets** en Odoo Helpdesk a partir de alertas críticas de Wazuh
- **Mapear severidad** (rule_level) a prioridad del ticket
- **Deduplicar tickets** para evitar spam de alertas repetidas
- **Enriquecer tickets** con contexto técnico y enlaces para investigación
- **Automatizar asignación** de tickets a los equipos correctos
- **Integrar con SOAR** para respuesta automatizada

## Arquitectura de la Integración

```
┌──────────────────────────────────────────────────────────┐
│                  Wazuh Manager 4.12                      │
│  - Detecta eventos de seguridad                          │
│  - Evalúa rules (level 1-15)                             │
│  - Filtra alertas críticas (level >= 10)                 │
└───────────────┬──────────────────────────────────────────┘
                │
          [Integration]
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│        Wazuh → Odoo Integration Script                   │
│  /var/ossec/integrations/custom-odoo-ticket.py           │
│  1. Recibe alerta de Wazuh (JSON)                        │
│  2. Verifica duplicación (Redis/SQLite)                  │
│  3. Mapea rule_level → priority                          │
│  4. Extrae contexto (agent, rule, data)                  │
│  5. Crea ticket vía Odoo FastAPI                         │
└───────────────┬──────────────────────────────────────────┘
                │
          [FastAPI POST]
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│              Odoo 19 Community + OCA                     │
│  Módulos:                                                │
│  - helpdesk_mgmt: Tickets/Cases                          │
│  - fastapi: REST endpoints                               │
│  - queue_job: Procesamiento asíncrono                    │
└───────────────┬──────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────┐
│             Helpdesk Ticket (Creado)                     │
│  - Name: "[Wazuh] SSH brute force on srv-db-prod-01"    │
│  - Priority: High (3)                                    │
│  - Team: Security Operations                             │
│  - Tags: wazuh, authentication, critical_asset           │
│  - Description: Alert details + investigation links      │
│  - Custom fields: rule_id, rule_level, agent_id          │
└──────────────────────────────────────────────────────────┘
```

## Mapeo Rule Level → Priority

> **AI Context**: Tabla de conversión entre niveles de severidad de Wazuh y prioridades de Odoo Helpdesk.

| Wazuh Rule Level | Severidad | Odoo Priority | SLA (ejemplo) |
|------------------|------------|---------------|---------------|
| 0-3 | Info/Low | 0 (Low) | 5 días |
| 4-7 | Medium | 1 (Medium) | 2 días |
| 8-10 | High | 2 (High) | 4 horas |
| 11-12 | Critical | 3 (Urgent) | 1 hora |
| 13-15 | Emergency | 3 (Urgent) | 30 minutos |

## Implementación

### 1. Endpoint FastAPI en Odoo

```python
# addons/wazuh_integration/controllers/wazuh_webhook.py
from odoo.addons.fastapi import routing
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
import logging

_logger = logging.getLogger(__name__)


class WazuhAlertData(BaseModel):
    """Modelo para datos específicos de la alerta"""
    srcip: Optional[str] = None
    srcuser: Optional[str] = None
    dstip: Optional[str] = None
    dstuser: Optional[str] = None
    command: Optional[str] = None
    url: Optional[str] = None


class WazuhRule(BaseModel):
    """Modelo para rule de Wazuh"""
    id: str = Field(..., description="Rule ID (ej., '5710')")
    level: int = Field(..., ge=0, le=15)
    description: str
    groups: List[str] = []
    firedtimes: Optional[int] = None
    mitre: Optional[Dict] = None


class WazuhAgent(BaseModel):
    """Modelo para agent de Wazuh"""
    id: str
    name: str
    ip: Optional[str] = None


class WazuhAlert(BaseModel):
    """Payload completo de la alerta Wazuh"""
    timestamp: str
    rule: WazuhRule
    agent: WazuhAgent
    data: Optional[WazuhAlertData] = None
    location: Optional[str] = None
    full_log: Optional[str] = None
    decoder: Optional[Dict] = None


@routing.post("/wazuh/alerts")
async def receive_wazuh_alert(alert: WazuhAlert, env: "Env"):
    """
    Endpoint para recibir alertas de Wazuh y crear tickets.
    URL: https://odoo.example.com/fastapi/wazuh/alerts
    """
    _logger.info(f"Alerta Wazuh recibida: Rule {alert.rule.id} - Level {alert.rule.level}")

    # Mapear level a priority
    priority = _map_level_to_priority(alert.rule.level)

    # Verificar deduplicación
    dedup_key = f"{alert.rule.id}:{alert.agent.id}"
    if _is_duplicate_alert(env, dedup_key):
        _logger.info(f"Alerta duplicada omitida: {dedup_key}")
        return {
            "status": "skipped",
            "reason": "duplicate",
            "dedup_key": dedup_key
        }

    # Crear ticket vía queue_job (asíncrono)
    ticket_id = env["helpdesk.ticket"].with_delay().create_from_wazuh_alert(
        alert.dict()
    )

    return {
        "status": "accepted",
        "ticket_id": ticket_id,
        "priority": priority
    }


def _map_level_to_priority(rule_level: int) -> str:
    """Mapear Wazuh rule level a Odoo priority"""
    if rule_level >= 11:
        return "3"  # Urgent
    elif rule_level >= 8:
        return "2"  # High
    elif rule_level >= 4:
        return "1"  # Medium
    else:
        return "0"  # Low


def _is_duplicate_alert(env, dedup_key: str, window_minutes: int = 60) -> bool:
    """
    Verificar si la alerta ya fue procesada recientemente.
    Usa ir.config_parameter para almacenar último timestamp.
    """
    param_name = f"wazuh.last_alert.{dedup_key}"
    last_alert_ts = env['ir.config_parameter'].sudo().get_param(param_name)

    if last_alert_ts:
        from datetime import datetime, timedelta
        last_time = datetime.fromisoformat(last_alert_ts)
        if datetime.now() - last_time < timedelta(minutes=window_minutes):
            return True

    # Actualizar timestamp
    env['ir.config_parameter'].sudo().set_param(
        param_name,
        datetime.now().isoformat()
    )
    return False
```

### 2. Modelo Odoo para Tickets Wazuh

```python
# addons/wazuh_integration/models/helpdesk_ticket.py
from odoo import models, fields, api
from odoo.addons.queue_job.job import job
import logging

_logger = logging.getLogger(__name__)


class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    # Campos personalizados para Wazuh
    wazuh_alert_id = fields.Char(string="Wazuh Alert ID", index=True)
    wazuh_rule_id = fields.Char(string="Wazuh Rule ID")
    wazuh_rule_level = fields.Integer(string="Wazuh Rule Level")
    wazuh_agent_id = fields.Char(string="Wazuh Agent ID")
    wazuh_agent_name = fields.Char(string="Wazuh Agent Name")
    wazuh_agent_ip = fields.Char(string="Wazuh Agent IP")
    wazuh_timestamp = fields.Datetime(string="Alert Timestamp")
    wazuh_full_log = fields.Text(string="Full Log")
    wazuh_dashboard_url = fields.Char(
        string="Wazuh Dashboard",
        compute="_compute_wazuh_dashboard_url"
    )

    # Flags de integración
    is_wazuh_alert = fields.Boolean(string="Is Wazuh Alert", default=False)
    auto_created = fields.Boolean(string="Auto Created", default=False)

    @api.depends('wazuh_rule_id', 'wazuh_agent_id')
    def _compute_wazuh_dashboard_url(self):
        """Generar enlace para Wazuh dashboard"""
        wazuh_url = self.env['ir.config_parameter'].sudo().get_param('wazuh.dashboard_url')
        for ticket in self:
            if ticket.wazuh_rule_id and wazuh_url:
                # Link para filtro de alertas del rule + agent
                ticket.wazuh_dashboard_url = (
                    f"{wazuh_url}/app/wazuh#/overview/"
                    f"?tab=general&tabView=panels"
                    f"&_a=(filters:!((query:(match:(rule.id:(query:'{ticket.wazuh_rule_id}'))))))"
                )
            else:
                ticket.wazuh_dashboard_url = False

    @job
    @api.model
    def create_from_wazuh_alert(self, alert_data: dict) -> int:
        """
        Job asíncrono para crear ticket a partir de alerta Wazuh.
        """
        rule = alert_data.get('rule', {})
        agent = alert_data.get('agent', {})
        data = alert_data.get('data', {})

        # Determinar equipo responsable basado en grupos de la rule
        team_id = self._determine_team_from_rule_groups(rule.get('groups', []))

        # Construir nombre del ticket
        ticket_name = f"[Wazuh] {rule.get('description')} on {agent.get('name')}"

        # Construir descripción detallada
        description = self._build_ticket_description(alert_data)

        # Determinar tags
        tags = self._extract_tags_from_alert(alert_data)

        # Crear ticket
        ticket_values = {
            'name': ticket_name,
            'description': description,
            'team_id': team_id,
            'priority': self._map_level_to_priority(rule.get('level', 0)),
            'tag_ids': [(6, 0, tags)],
            'is_wazuh_alert': True,
            'auto_created': True,

            # Campos Wazuh
            'wazuh_alert_id': f"{agent.get('id')}:{rule.get('id')}:{alert_data.get('timestamp')}",
            'wazuh_rule_id': rule.get('id'),
            'wazuh_rule_level': rule.get('level'),
            'wazuh_agent_id': agent.get('id'),
            'wazuh_agent_name': agent.get('name'),
            'wazuh_agent_ip': agent.get('ip'),
            'wazuh_timestamp': alert_data.get('timestamp'),
            'wazuh_full_log': alert_data.get('full_log'),
        }

        ticket = self.create(ticket_values)
        _logger.info(f"Ticket {ticket.id} creado desde alerta Wazuh {rule.get('id')}")

        # Notificar equipo vía email/Slack
        ticket._notify_team()

        return ticket.id

    def _determine_team_from_rule_groups(self, rule_groups: list) -> int:
        """
        Determinar equipo de helpdesk basado en los grupos de la rule.
        """
        # Mapeo de grupos a equipos
        group_to_team = {
            'authentication_failures': 'team_security',
            'attack': 'team_security',
            'web': 'team_devops',
            'syslog': 'team_sysadmin',
            'windows': 'team_windows',
            'ossec': 'team_security',
        }

        # Buscar primer match
        for group in rule_groups:
            team_xmlid = group_to_team.get(group)
            if team_xmlid:
                try:
                    team = self.env.ref(f'helpdesk_mgmt.{team_xmlid}')
                    return team.id
                except:
                    pass

        # Fallback: equipo predeterminado
        default_team = self.env.ref('helpdesk_mgmt.team_security', raise_if_not_found=False)
        return default_team.id if default_team else False

    def _build_ticket_description(self, alert_data: dict) -> str:
        """
        Construir descripción HTML del ticket con todos los detalles.
        """
        rule = alert_data.get('rule', {})
        agent = alert_data.get('agent', {})
        data = alert_data.get('data', {})

        description = f"""
<h3>Alerta de Seguridad Wazuh</h3>

<h4>Detalles de la Alerta</h4>
<ul>
    <li><strong>Rule ID:</strong> {rule.get('id')}</li>
    <li><strong>Rule Level:</strong> {rule.get('level')} / 15</li>
    <li><strong>Descripción:</strong> {rule.get('description')}</li>
    <li><strong>Grupos:</strong> {', '.join(rule.get('groups', []))}</li>
    <li><strong>Timestamp:</strong> {alert_data.get('timestamp')}</li>
</ul>

<h4>Asset Afectado</h4>
<ul>
    <li><strong>Agent ID:</strong> {agent.get('id')}</li>
    <li><strong>Agent Name:</strong> {agent.get('name')}</li>
    <li><strong>Dirección IP:</strong> {agent.get('ip')}</li>
</ul>

<h4>Datos del Evento</h4>
<ul>
    <li><strong>IP Origen:</strong> {data.get('srcip', 'N/A')}</li>
    <li><strong>Usuario Origen:</strong> {data.get('srcuser', 'N/A')}</li>
    <li><strong>IP Destino:</strong> {data.get('dstip', 'N/A')}</li>
    <li><strong>Ubicación:</strong> {alert_data.get('location', 'N/A')}</li>
</ul>

<h4>Acciones de Investigación</h4>
<ol>
    <li>Revisar detalles completos del log en Wazuh Dashboard</li>
    <li>Verificar estado del agente y alertas recientes</li>
    <li>Verificar si es un falso positivo</li>
    <li>Consultar NetBox para criticidad del asset y propietario</li>
    <li>Escalar al SOC si se confirma amenaza</li>
</ol>

<h4>Log Completo</h4>
<pre>{alert_data.get('full_log', 'N/A')}</pre>
"""
        return description

    def _extract_tags_from_alert(self, alert_data: dict) -> list:
        """
        Extraer/crear tags basadas en la alerta.
        """
        rule_groups = alert_data.get('rule', {}).get('groups', [])
        tag_names = ['wazuh'] + rule_groups

        # Buscar o crear tags
        tag_ids = []
        for tag_name in tag_names:
            tag = self.env['helpdesk.ticket.tag'].search([('name', '=', tag_name)], limit=1)
            if not tag:
                tag = self.env['helpdesk.ticket.tag'].create({'name': tag_name})
            tag_ids.append(tag.id)

        return tag_ids

    def _map_level_to_priority(self, rule_level: int) -> str:
        """Mapear Wazuh level a Odoo priority"""
        if rule_level >= 11:
            return "3"
        elif rule_level >= 8:
            return "2"
        elif rule_level >= 4:
            return "1"
        else:
            return "0"

    def _notify_team(self):
        """
        Notificar equipo responsable sobre nuevo ticket crítico.
        """
        if self.priority in ['2', '3']:  # High o Urgent
            # Email
            template = self.env.ref('wazuh_integration.email_template_wazuh_alert')
            template.send_mail(self.id, force_send=True)

            # Slack (si está configurado)
            slack_webhook = self.env['ir.config_parameter'].sudo().get_param('wazuh.slack_webhook')
            if slack_webhook:
                self._send_slack_notification(slack_webhook)

    def _send_slack_notification(self, webhook_url: str):
        """Enviar notificación a Slack"""
        import requests
        import json

        priority_emoji = {
            '0': ':information_source:',
            '1': ':warning:',
            '2': ':rotating_light:',
            '3': ':fire:',
        }

        message = {
            "text": f"{priority_emoji.get(self.priority, '')} Nueva Alerta Wazuh",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"{self.name}"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Prioridad:*\n{self.priority}"},
                        {"type": "mrkdwn", "text": f"*Agent:*\n{self.wazuh_agent_name}"},
                        {"type": "mrkdwn", "text": f"*Rule:*\n{self.wazuh_rule_id}"},
                        {"type": "mrkdwn", "text": f"*Level:*\n{self.wazuh_rule_level}/15"},
                    ]
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Ver Ticket"},
                            "url": f"https://odoo.example.com/web#id={self.id}&model=helpdesk.ticket"
                        },
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Wazuh Dashboard"},
                            "url": self.wazuh_dashboard_url
                        }
                    ]
                }
            ]
        }

        try:
            requests.post(webhook_url, data=json.dumps(message), headers={'Content-Type': 'application/json'})
        except Exception as e:
            _logger.error(f"Fallo al enviar notificación Slack: {e}")
```

### 3. Script de Integración en Wazuh

```python
#!/var/ossec/framework/python/bin/python3
# /var/ossec/integrations/custom-odoo-ticket.py

import sys
import json
import os
import requests
import logging
from datetime import datetime

# Configuración
ODOO_URL = os.getenv('ODOO_URL', 'https://odoo.example.com')
ODOO_API_KEY = os.getenv('ODOO_API_KEY')  # Token de autenticación
MIN_RULE_LEVEL = int(os.getenv('MIN_RULE_LEVEL', 10))  # Solo alertas >= 10

# Logging
LOG_FILE = '/var/ossec/logs/integrations.log'
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('odoo-ticket')


def should_create_ticket(alert_json: dict) -> bool:
    """
    Determinar si debe crear ticket basado en criterios.
    """
    rule_level = alert_json.get('rule', {}).get('level', 0)

    # Filtrar por level mínimo
    if rule_level < MIN_RULE_LEVEL:
        logger.debug(f"Alert level {rule_level} por debajo del umbral {MIN_RULE_LEVEL}")
        return False

    # Filtrar rules específicas (blacklist)
    rule_id = alert_json.get('rule', {}).get('id')
    blacklisted_rules = ['1002', '5502']  # Rules muy frecuentes
    if rule_id in blacklisted_rules:
        logger.debug(f"Rule {rule_id} está en blacklist")
        return False

    # Filtrar por grupos (whitelist)
    rule_groups = alert_json.get('rule', {}).get('groups', [])
    critical_groups = ['attack', 'authentication_failures', 'exploit_attempt']
    if not any(group in critical_groups for group in rule_groups):
        logger.debug(f"No hay grupos críticos en {rule_groups}")
        return False

    return True


def create_odoo_ticket(alert_json: dict) -> dict:
    """
    Enviar alerta a Odoo vía FastAPI.
    """
    endpoint = f"{ODOO_URL}/fastapi/wazuh/alerts"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ODOO_API_KEY}'
    }

    try:
        response = requests.post(
            endpoint,
            json=alert_json,
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        result = response.json()

        logger.info(f"Ticket creado: {result}")
        return result

    except requests.exceptions.RequestException as e:
        logger.error(f"Fallo al crear ticket Odoo: {e}")
        return {'status': 'error', 'message': str(e)}


def main():
    """
    Punto de entrada.
    """
    try:
        # Leer alerta del stdin
        input_str = sys.stdin.read()
        alert_json = json.loads(input_str)

        logger.info(f"Procesando alerta: Rule {alert_json.get('rule', {}).get('id')}")

        # Verificar si debe crear ticket
        if not should_create_ticket(alert_json):
            logger.info("Alerta filtrada, no se creó ticket")
            sys.exit(0)

        # Crear ticket
        result = create_odoo_ticket(alert_json)

        if result.get('status') == 'accepted':
            logger.info(f"Ticket creado exitosamente: {result.get('ticket_id')}")
        else:
            logger.warning(f"Resultado de creación de ticket: {result}")

        sys.exit(0)

    except Exception as e:
        logger.error(f"Error en main: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
```

### 4. Configuración en Wazuh

**Archivo: `/var/ossec/etc/ossec.conf`**

```xml
<ossec_config>
  <integration>
    <name>custom-odoo-ticket</name>
    <hook_url>/var/ossec/integrations/custom-odoo-ticket.py</hook_url>
    <level>10</level>  <!-- Solo alertas >= 10 -->
    <alert_format>json</alert_format>
    <!-- Filtrar por grupos críticos -->
    <group>attack,authentication_failures,exploit_attempt</group>
  </integration>
</ossec_config>
```

**Variables de entorno:**

```bash
# /etc/systemd/system/wazuh-manager.service.d/override.conf
[Service]
Environment="ODOO_URL=https://odoo.example.com"
Environment="ODOO_API_KEY=tu-api-key-aqui"
Environment="MIN_RULE_LEVEL=10"
```

**Deploy:**

```bash
# Copiar script
sudo cp custom-odoo-ticket.py /var/ossec/integrations/
sudo chmod 750 /var/ossec/integrations/custom-odoo-ticket.py
sudo chown root:wazuh /var/ossec/integrations/custom-odoo-ticket.py

# Instalar dependencias
sudo /var/ossec/framework/python/bin/pip3 install requests

# Reiniciar Wazuh
sudo systemctl restart wazuh-manager
```

## Deduplicación Avanzada

### Usando Redis para Dedup Window

```python
# Alternativa mejor para deduplicación con Redis
import redis
import hashlib

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def get_dedup_key(alert_json: dict) -> str:
    """Generar clave única para deduplicación"""
    rule_id = alert_json.get('rule', {}).get('id')
    agent_id = alert_json.get('agent', {}).get('id')
    srcip = alert_json.get('data', {}).get('srcip', '')

    key_str = f"{rule_id}:{agent_id}:{srcip}"
    return hashlib.md5(key_str.encode()).hexdigest()

def is_duplicate(alert_json: dict, window_seconds: int = 3600) -> bool:
    """Verificar si alerta es duplicada dentro de la ventana de tiempo"""
    dedup_key = get_dedup_key(alert_json)
    redis_key = f"wazuh:dedup:{dedup_key}"

    # Verificar si existe
    if redis_client.exists(redis_key):
        # Incrementar contador
        count = redis_client.incr(redis_key)
        logger.info(f"Alerta duplicada #{count} para {dedup_key}")
        return True

    # Primera ocurrencia - crear con TTL
    redis_client.setex(redis_key, window_seconds, 1)
    return False
```

## Troubleshooting

### Los tickets no se están creando

```bash
# Verificar logs Wazuh
tail -f /var/ossec/logs/integrations.log

# Verificar si integration está habilitada
grep -A 5 "custom-odoo-ticket" /var/ossec/etc/ossec.conf

# Probar manualmente
echo '{"rule":{"id":"5710","level":12,"description":"Test","groups":["attack"]},"agent":{"id":"001","name":"test","ip":"10.0.0.1"},"timestamp":"2025-12-05T10:00:00Z"}' | \
  sudo -u wazuh /var/ossec/integrations/custom-odoo-ticket.py
```

### Odoo API retorna 401

```bash
# Verificar API key
curl -H "Authorization: Bearer $ODOO_API_KEY" \
  https://odoo.example.com/fastapi/wazuh/alerts

# Regenerar API key en Odoo
# Settings → Technical → API Keys
```

### Tickets duplicados

```python
# Ajustar ventana de deduplicación
# En custom-odoo-ticket.py o en el endpoint FastAPI
DEDUP_WINDOW = 7200  # 2 horas en vez de 1 hora

# Verificar Redis
redis-cli KEYS "wazuh:dedup:*"
redis-cli TTL "wazuh:dedup:abc123"
```

### Rendimiento: muchos tickets siendo creados

```xml
<!-- Aumentar level mínimo -->
<integration>
    <level>12</level>  <!-- Solo críticos -->
</integration>
```

```python
# Agregar más filtros en should_create_ticket()
def should_create_ticket(alert_json: dict) -> bool:
    # Ignorar horarios de mantenimiento
    from datetime import datetime
    hour = datetime.now().hour
    if 2 <= hour <= 6:  # Ventana de mantenimiento
        return False

    # Ignorar ambientes de desarrollo
    agent_name = alert_json.get('agent', {}).get('name', '')
    if 'dev' in agent_name or 'test' in agent_name:
        return False

    return True
```

## Próximos Pasos

- [ ] Implementar auto-assignment basado en calendario on-call
- [ ] Integrar con PagerDuty para escalamiento
- [ ] Dashboard de métricas (MTTR, tickets por severidad)
- [ ] Machine learning para clasificación de falsos positivos
- [ ] Auto-close de tickets resueltos por SOAR
- [ ] SLA tracking basado en prioridad
- [ ] Integración con Change Management (RFC antes de remediation)
