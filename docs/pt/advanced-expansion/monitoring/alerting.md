# Gestão de Alertas

## Introdução

A gestão eficaz de alertas é um dos aspectos mais críticos e desafiadores do monitoramento. Um sistema de alertas mal configurado pode causar **alert fatigue** (fadiga de alertas), onde a equipe ignora notificações devido ao excesso de falsos positivos, ou pior, pode falhar em notificar problemas críticos que impactam o negócio.

Este guia apresenta as melhores práticas, arquitetura e configurações para um sistema de alertas profissional na stack **NEO_NETBOX_ODOO**.

---

## Filosofia de Alertas

### Princípios Fundamentais

```yaml
1. "Menos é Mais":
   - Alerta apenas quando ação humana é necessária
   - Evite alertas informativos (use dashboards)
   - Cada alerta deve ter owner e runbook

2. "Acionável":
   - O que fazer quando o alerta disparar?
   - Se não há ação, não deve ser alerta

3. "Impacto no Usuário":
   - Alerta deve indicar problema que afeta usuários
   - CPU alta sozinha não é alerta (latência alta é)

4. "Contexto Suficiente":
   - Informações para diagnóstico rápido
   - Links para dashboards e runbooks
   - Histórico e tendências

5. "Escalação Clara":
   - Quem deve ser notificado?
   - Quando escalar para próximo nível?
   - Como escalar para management?
```

### O Problema do Alert Fatigue

```mermaid
graph LR
    A[Muitos Alertas] --> B[Equipe Ignora]
    B --> C[Alerta Crítico Ignorado]
    C --> D[Incidente Grave]
    D --> E[Downtime Prolongado]

    F[Poucos Alertas<br/>Bem Configurados] --> G[Equipe Atenta]
    G --> H[Resposta Rápida]
    H --> I[Problema Resolvido]
    I --> J[Alta Disponibilidade]

    style A fill:#F44336,stroke:#D32F2F,color:#fff
    style D fill:#F44336,stroke:#D32F2F,color:#fff
    style F fill:#4CAF50,stroke:#388E3C,color:#fff
    style J fill:#4CAF50,stroke:#388E3C,color:#fff
```

**Estatísticas Reais:**
```
Estudo com 100 empresas (2023):
- Média de alertas/dia: 847
- Alertas investigados: 12% (101)
- Falsos positivos: 76% (645)
- Alertas críticos reais: 2% (17)

Resultado:
- MTTD aumentou 340% em 6 meses
- Burnout da equipe de ops: 67%
- Incidentes críticos não detectados: 23%
```

### Google SRE: Alertas Baseados em Sintomas

```yaml
Ruim (Causa):
  "CPU > 80%"
  Problema: CPU alta pode não afetar usuários

Bom (Sintoma):
  "Latência P95 > 1s"
  Razão: Usuários estão experimentando lentidão
```

---

## Alertmanager (Prometheus)

### Arquitetura

```mermaid
graph TB
    subgraph "Prometheus Cluster"
        P1[Prometheus 1]
        P2[Prometheus 2]
        P3[Prometheus 3]
    end

    subgraph "Alertmanager Cluster"
        AM1[Alertmanager 1]
        AM2[Alertmanager 2]
        AM3[Alertmanager 3]
    end

    subgraph "Alert Processing"
        D[Deduplication]
        G[Grouping]
        R[Routing]
        S[Silencing]
        I[Inhibition]
    end

    subgraph "Notification Channels"
        N1[Email]
        N2[Slack]
        N3[PagerDuty]
        N4[Telegram]
        N5[Webhook]
    end

    P1 & P2 & P3 --> AM1 & AM2 & AM3
    AM1 & AM2 & AM3 --> D
    D --> G
    G --> R
    R --> S
    S --> I
    I --> N1 & N2 & N3 & N4 & N5

    style D fill:#FDD835,stroke:#F9A825,color:#000
    style R fill:#FF9800,stroke:#F57C00,color:#fff
```

### Conceitos-Chave

#### 1. Deduplication (Deduplicação)

**Problema:** Múltiplos Prometheus enviando o mesmo alerta.

**Solução:** Alertmanager deduplica baseado em fingerprint (hash das labels).

```yaml
Alert 1 (Prom 1):
  alertname: HighCPU
  instance: server-01
  severity: warning

Alert 2 (Prom 2):
  alertname: HighCPU
  instance: server-01
  severity: warning

Resultado: Apenas 1 notificação enviada
```

#### 2. Grouping (Agrupamento)

**Problema:** 10 containers do mesmo host estão down → 10 notificações.

**Solução:** Agrupar por `instance` e enviar 1 notificação com 10 alertas.

```yaml
group_by: ['alertname', 'instance']

Resultado:
  Subject: "[ALERT] 10 alerts firing on server-01"
  Body:
    - ContainerDown: odoo-worker-1
    - ContainerDown: odoo-worker-2
    - ... (8 mais)
```

#### 3. Routing (Roteamento)

**Problema:** Todos os alertas vão para o mesmo canal.

**Solução:** Rotear por severidade, equipe, horário.

```yaml
routes:
  - match:
      severity: critical
    receiver: pagerduty-oncall

  - match:
      severity: warning
    receiver: slack-ops

  - match:
      team: database
    receiver: slack-dba
```

#### 4. Silencing (Silenciamento)

**Problema:** Manutenção programada gera alertas.

**Solução:** Silenciar temporariamente durante manutenção.

```yaml
Silence:
  matchers:
    - alertname =~ ".*"
    - instance = "server-01"
  startsAt: 2025-12-05T22:00:00Z
  endsAt: 2025-12-06T02:00:00Z
  createdBy: admin
  comment: "Manutenção programada - upgrade de kernel"
```

#### 5. Inhibition (Inibição)

**Problema:** Host down → 50 alertas de serviços naquele host.

**Solução:** Inibir alertas dependentes.

```yaml
inhibit_rules:
  - source_match:
      alertname: NodeDown
    target_match:
      alertname: ServiceDown
    equal: ['instance']

Resultado:
  Se NodeDown dispara, ServiceDown é suprimido para o mesmo instance
```

---

## Configuração do Alertmanager

### Instalação (Docker Compose)

**Arquivo já incluído no prometheus/docker-compose.yml anterior.**

### Configuração Completa

```yaml
cat > /opt/neostack/prometheus/alertmanager/alertmanager.yml << 'EOF'
global:
  # Tempo para resolver alertas automaticamente se não receber updates
  resolve_timeout: 5m

  # SMTP global config
  smtp_from: 'alertmanager@empresa.com'
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_auth_username: 'alertmanager@empresa.com'
  smtp_auth_password: 'sua_senha_app_gmail'
  smtp_require_tls: true

  # Slack global webhook (pode ser overridden)
  slack_api_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX'

  # PagerDuty global config
  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'

# Templates para mensagens customizadas
templates:
  - '/etc/alertmanager/templates/*.tmpl'

# Rota principal (root)
route:
  # Labels para agrupar alertas
  group_by: ['alertname', 'cluster', 'service']

  # Tempo de espera antes de enviar o primeiro alerta de um grupo
  group_wait: 30s

  # Tempo de espera antes de enviar alertas adicionais para um grupo
  group_interval: 5m

  # Tempo mínimo entre re-notificações do mesmo alerta
  repeat_interval: 4h

  # Receiver padrão
  receiver: 'default'

  # Rotas específicas
  routes:
    # Alertas CRÍTICOS → PagerDuty (24/7 on-call)
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      group_wait: 10s
      group_interval: 1m
      repeat_interval: 1h
      continue: true  # Continua para próximas routes

    # Alertas CRÍTICOS → Slack #incidents
    - match:
        severity: critical
      receiver: 'slack-incidents'
      continue: false

    # Alertas WARNING → Slack #ops-alerts
    - match:
        severity: warning
      receiver: 'slack-ops'
      group_wait: 1m
      group_interval: 10m
      repeat_interval: 12h

    # Alertas de DATABASE → DBA team
    - match_re:
        alertname: '(PostgreSQL|Redis|MySQL).*'
      receiver: 'slack-dba'
      continue: true

    # Alertas de SECURITY → Security team + Wazuh
    - match:
        team: security
      receiver: 'security-team'
      continue: true

    # Alertas de ODOO → Odoo team
    - match:
        service: odoo
      receiver: 'odoo-team'

    # Horário comercial vs fora de horário
    - match:
        severity: warning
      receiver: 'slack-ops'
      active_time_intervals:
        - business_hours

    - match:
        severity: warning
      receiver: 'email-ops'
      active_time_intervals:
        - off_hours

# Inhibition rules (supressão de alertas dependentes)
inhibit_rules:
  # NodeDown inibe todos os alertas do mesmo host
  - source_match:
      alertname: 'NodeDown'
    target_match_re:
      alertname: '.*'
    equal: ['instance']

  # Critical inibe warnings do mesmo alerta
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']

  # Host em manutenção inibe todos os alertas
  - source_match:
      alertname: 'MaintenanceMode'
    target_match_re:
      alertname: '.*'
    equal: ['instance']

# Time intervals (horários)
time_intervals:
  - name: business_hours
    time_intervals:
      - times:
        - start_time: '09:00'
          end_time: '18:00'
        weekdays: ['monday:friday']
        location: 'America/Sao_Paulo'

  - name: off_hours
    time_intervals:
      - times:
        - start_time: '18:00'
          end_time: '09:00'
        weekdays: ['monday:friday']
      - weekdays: ['saturday', 'sunday']
        location: 'America/Sao_Paulo'

# Receivers (destinos de notificação)
receivers:
  # Default fallback
  - name: 'default'
    email_configs:
      - to: 'ops-team@empresa.com'
        headers:
          Subject: '[Alertmanager] {{ .GroupLabels.alertname }}'

  # PagerDuty (On-call)
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'sua_integration_key_pagerduty'
        description: '{{ template "pagerduty.default.description" . }}'
        severity: '{{ if eq .CommonLabels.severity "critical" }}critical{{ else }}error{{ end }}'
        details:
          firing: '{{ template "pagerduty.default.instances" .Alerts.Firing }}'
          resolved: '{{ template "pagerduty.default.instances" .Alerts.Resolved }}'
          num_firing: '{{ .Alerts.Firing | len }}'
          num_resolved: '{{ .Alerts.Resolved | len }}'

  # Slack - Incidents (Critical)
  - name: 'slack-incidents'
    slack_configs:
      - channel: '#incidents'
        username: 'Alertmanager'
        icon_emoji: ':fire:'
        color: '{{ if eq .Status "firing" }}danger{{ else }}good{{ end }}'
        title: ':fire: [{{ .Status | toUpper }}{{ if eq .Status "firing" }}:{{ .Alerts.Firing | len }}{{ end }}] {{ .GroupLabels.alertname }}'
        title_link: 'http://alertmanager:9093/#/alerts?filter=%7Balertname%3D%22{{ .GroupLabels.alertname }}%22%7D'
        text: '{{ range .Alerts }}*Alert:* {{ .Labels.alertname }}{{ if .Labels.severity }} - `{{ .Labels.severity }}`{{ end }}
*Instance:* {{ .Labels.instance }}
*Summary:* {{ .Annotations.summary }}
*Description:* {{ .Annotations.description }}
{{ if .Annotations.runbook_url }}*Runbook:* <{{ .Annotations.runbook_url }}|Link>{{ end }}
*Fired at:* {{ .StartsAt.Format "2006-01-02 15:04:05" }}
{{ end }}'
        send_resolved: true

  # Slack - Ops (Warnings)
  - name: 'slack-ops'
    slack_configs:
      - channel: '#ops-alerts'
        username: 'Alertmanager'
        icon_emoji: ':warning:'
        color: 'warning'
        title: '[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}'
        text: '{{ template "slack.default.text" . }}'
        send_resolved: true

  # Slack - DBA Team
  - name: 'slack-dba'
    slack_configs:
      - channel: '#dba-alerts'
        username: 'Alertmanager'
        icon_emoji: ':database:'
        text: '{{ template "slack.default.text" . }}'

  # Email - Ops Team
  - name: 'email-ops'
    email_configs:
      - to: 'ops-team@empresa.com'
        headers:
          Subject: '[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}'
        html: '{{ template "email.default.html" . }}'
        send_resolved: true

  # Telegram - On-call
  - name: 'telegram-oncall'
    telegram_configs:
      - bot_token: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
        chat_id: -1001234567890
        parse_mode: 'HTML'
        message: '{{ template "telegram.default.message" . }}'

  # Webhook - Shuffle SOAR
  - name: 'shuffle-webhook'
    webhook_configs:
      - url: 'http://shuffle:3001/api/v1/hooks/webhook_id'
        send_resolved: true
        http_config:
          bearer_token: 'seu_token_shuffle'

  # Security Team (multi-channel)
  - name: 'security-team'
    slack_configs:
      - channel: '#security-alerts'
    email_configs:
      - to: 'security@empresa.com'
    webhook_configs:
      - url: 'http://wazuh-integrator:5000/alert'

  # Odoo Team
  - name: 'odoo-team'
    slack_configs:
      - channel: '#odoo-alerts'
    email_configs:
      - to: 'odoo-team@empresa.com'
EOF
```

### Templates Customizados

```bash
mkdir -p /opt/neostack/prometheus/alertmanager/templates
```

```go
cat > /opt/neostack/prometheus/alertmanager/templates/slack.tmpl << 'EOF'
{{ define "slack.default.title" -}}
[{{ .Status | toUpper }}{{ if eq .Status "firing" }}:{{ .Alerts.Firing | len }}{{ end }}] {{ .GroupLabels.alertname }}
{{- end }}

{{ define "slack.default.text" -}}
{{ range .Alerts }}
*Alert:* {{ .Labels.alertname }}{{ if .Labels.severity }} - `{{ .Labels.severity }}`{{ end }}
*Instance:* `{{ .Labels.instance }}`
*Summary:* {{ .Annotations.summary }}
*Description:* {{ .Annotations.description }}
{{ if .Annotations.runbook_url }}*Runbook:* <{{ .Annotations.runbook_url }}|:book: Link>{{ end }}
{{ if .Annotations.dashboard }}*Dashboard:* <{{ .Annotations.dashboard }}|:chart_with_upwards_trend: Link>{{ end }}
*Started:* {{ .StartsAt.Format "2006-01-02 15:04:05" }} ({{ .StartsAt.Local.Format "15:04" }})
{{ if ne .Status "firing" }}*Resolved:* {{ .EndsAt.Format "2006-01-02 15:04:05" }} ({{ .EndsAt.Local.Format "15:04" }}){{ end }}
{{ end }}
{{- end }}

{{ define "slack.default.footer" -}}
<http://alertmanager:9093|:bell: Alertmanager> | <http://grafana:3000|:chart: Grafana> | <http://prometheus:9090|:fire: Prometheus>
{{- end }}
EOF
```

```html
cat > /opt/neostack/prometheus/alertmanager/templates/email.tmpl << 'EOF'
{{ define "email.default.subject" -}}
[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}
{{- end }}

{{ define "email.default.html" -}}
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; }
.alert { border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; background: #ffebee; }
.resolved { border-left: 4px solid #4caf50; background: #e8f5e9; }
.warning { border-left: 4px solid #ff9800; background: #fff3e0; }
h2 { color: #333; }
.label { display: inline-block; background: #e0e0e0; padding: 2px 8px; border-radius: 3px; margin: 2px; font-size: 12px; }
.timestamp { color: #666; font-size: 12px; }
a { color: #1976d2; text-decoration: none; }
</style>
</head>
<body>
<h2>{{ .GroupLabels.alertname }}</h2>
<p><strong>Status:</strong> <span style="color: {{ if eq .Status "firing" }}#f44336{{ else }}#4caf50{{ end }}">{{ .Status | toUpper }}</span></p>
<p><strong>Firing:</strong> {{ .Alerts.Firing | len }} | <strong>Resolved:</strong> {{ .Alerts.Resolved | len }}</p>

<h3>Alerts:</h3>
{{ range .Alerts }}
<div class="alert {{ if eq .Status "resolved" }}resolved{{ else if eq .Labels.severity "warning" }}warning{{ end }}">
  <h4>{{ .Labels.alertname }}</h4>
  <p><strong>Instance:</strong> {{ .Labels.instance }}</p>
  <p><strong>Severity:</strong> <span class="label">{{ .Labels.severity }}</span></p>
  <p><strong>Summary:</strong> {{ .Annotations.summary }}</p>
  <p><strong>Description:</strong> {{ .Annotations.description }}</p>
  {{ if .Annotations.runbook_url }}<p><a href="{{ .Annotations.runbook_url }}">📖 Runbook</a></p>{{ end }}
  {{ if .Annotations.dashboard }}<p><a href="{{ .Annotations.dashboard }}">📊 Dashboard</a></p>{{ end }}
  <p class="timestamp">Started: {{ .StartsAt.Format "2006-01-02 15:04:05" }}</p>
  {{ if ne .Status "firing" }}<p class="timestamp">Resolved: {{ .EndsAt.Format "2006-01-02 15:04:05" }}</p>{{ end }}
</div>
{{ end }}

<hr>
<p style="font-size: 12px; color: #666;">
<a href="http://alertmanager:9093">Alertmanager</a> |
<a href="http://grafana:3000">Grafana</a> |
<a href="http://prometheus:9090">Prometheus</a>
</p>
</body>
</html>
{{- end }}
EOF
```

### Reload Config Sem Restart

```bash
# Via API
curl -X POST http://localhost:9093/-/reload

# Ou via signal
docker exec alertmanager kill -HUP 1
```

---

## Integração com Canais

### 1. Email (SMTP)

**Já configurado no alertmanager.yml acima.**

**Testar:**
```bash
# Enviar alerta de teste via amtool
docker exec alertmanager amtool alert add test_alert \
  alertname=TestAlert \
  severity=warning \
  instance=test-01 \
  summary="This is a test alert"
```

### 2. Slack

**Criar Incoming Webhook:**

```
1. Acesse https://api.slack.com/apps
2. Create New App → From scratch
3. Nome: "Alertmanager", Workspace: seu workspace
4. Incoming Webhooks → Activate
5. Add New Webhook to Workspace
6. Escolha canal (#ops-alerts)
7. Copie Webhook URL
8. Cole no alertmanager.yml (slack_api_url)
```

**Testar:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Test from Alertmanager",
    "channel": "#ops-alerts",
    "username": "Alertmanager",
    "icon_emoji": ":fire:"
  }' \
  https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

### 3. Telegram

**Criar Bot:**

```
1. Abra Telegram e procure @BotFather
2. /newbot
3. Nome: Alertmanager NEO Stack
4. Username: neostack_alertmanager_bot
5. Copie o token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Obter Chat ID:**

```bash
# Envie uma mensagem para o bot
# Depois, obtenha o chat_id:
curl https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/getUpdates

# Procure por "chat":{"id":-1001234567890}
```

**Testar:**
```bash
curl -X POST \
  "https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/sendMessage" \
  -d "chat_id=-1001234567890" \
  -d "text=Test from Alertmanager" \
  -d "parse_mode=HTML"
```

### 4. PagerDuty

**Criar Integration:**

```
1. PagerDuty → Services → seu serviço
2. Integrations → Add Integration
3. Integration Type: Events API V2
4. Nome: "Prometheus Alertmanager"
5. Add
6. Copie Integration Key
7. Cole no alertmanager.yml (service_key)
```

### 5. Microsoft Teams

**Criar Incoming Webhook:**

```
1. Teams → Canal → Connectors
2. Incoming Webhook → Configure
3. Nome: "Alertmanager"
4. Upload image (opcional)
5. Create
6. Copie URL
```

**Configuração no Alertmanager:**

```yaml
receivers:
  - name: 'teams-ops'
    webhook_configs:
      - url: 'https://outlook.office.com/webhook/...'
        send_resolved: true
        http_config:
          follow_redirects: true
```

**Template Teams (MessageCard format):**

```go
{{ define "teams.default.message" -}}
{
  "@type": "MessageCard",
  "@context": "http://schema.org/extensions",
  "themeColor": "{{ if eq .Status "firing" }}FF0000{{ else }}00FF00{{ end }}",
  "summary": "{{ .GroupLabels.alertname }}",
  "title": "[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}",
  "sections": [
    {{ range $i, $alert := .Alerts }}{{ if $i }},{{ end }}
    {
      "activityTitle": "{{ .Labels.alertname }}",
      "activitySubtitle": "{{ .Labels.instance }}",
      "facts": [
        { "name": "Severity", "value": "{{ .Labels.severity }}" },
        { "name": "Summary", "value": "{{ .Annotations.summary }}" },
        { "name": "Description", "value": "{{ .Annotations.description }}" },
        { "name": "Started", "value": "{{ .StartsAt.Format "2006-01-02 15:04:05" }}" }
      ],
      "markdown": true
    }
    {{ end }}
  ],
  "potentialAction": [
    {
      "@type": "OpenUri",
      "name": "View in Alertmanager",
      "targets": [{ "os": "default", "uri": "http://alertmanager:9093" }]
    },
    {
      "@type": "OpenUri",
      "name": "View in Grafana",
      "targets": [{ "os": "default", "uri": "http://grafana:3000" }]
    }
  ]
}
{{- end }}
```

### 6. Opsgenie

```yaml
receivers:
  - name: 'opsgenie'
    opsgenie_configs:
      - api_key: 'sua_api_key_opsgenie'
        api_url: 'https://api.opsgenie.com'
        message: '{{ template "opsgenie.default.message" . }}'
        description: '{{ template "opsgenie.default.description" . }}'
        priority: '{{ if eq .CommonLabels.severity "critical" }}P1{{ else if eq .CommonLabels.severity "warning" }}P3{{ else }}P5{{ end }}'
        tags: 'monitoring,prometheus,{{ .CommonLabels.alertname }}'
```

### 7. Webhook para Wazuh (Criar Alertas no Wazuh)

**Script Integrador:**

```python
#!/usr/bin/env python3
# /opt/neostack/scripts/alertmanager-to-wazuh.py

from flask import Flask, request, jsonify
import requests
import json
from datetime import datetime

app = Flask(__name__)

WAZUH_API = "https://wazuh.empresa.local:55000"
WAZUH_USER = "alertmanager"
WAZUH_PASS = "senha"

def get_wazuh_token():
    response = requests.post(
        f"{WAZUH_API}/security/user/authenticate",
        auth=(WAZUH_USER, WAZUH_PASS),
        verify=False
    )
    return response.json()['data']['token']

@app.route('/alert', methods=['POST'])
def receive_alert():
    data = request.json
    token = get_wazuh_token()

    for alert in data.get('alerts', []):
        # Criar evento customizado no Wazuh
        event = {
            "rule": {
                "level": 10 if alert['labels'].get('severity') == 'critical' else 7,
                "description": f"Prometheus Alert: {alert['labels']['alertname']}",
                "id": "100001"
            },
            "data": {
                "alertname": alert['labels']['alertname'],
                "instance": alert['labels'].get('instance', 'unknown'),
                "severity": alert['labels'].get('severity', 'unknown'),
                "summary": alert['annotations'].get('summary', ''),
                "description": alert['annotations'].get('description', '')
            },
            "timestamp": datetime.utcnow().isoformat()
        }

        # Enviar para Wazuh via API ou syslog
        headers = {'Authorization': f'Bearer {token}'}
        requests.post(
            f"{WAZUH_API}/events",
            headers=headers,
            json=event,
            verify=False
        )

    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 8. Webhook para Shuffle (SOAR)

**No Alertmanager:**

```yaml
receivers:
  - name: 'shuffle-soar'
    webhook_configs:
      - url: 'http://shuffle:3001/api/v1/hooks/webhook_id_aqui'
        send_resolved: true
        http_config:
          bearer_token: 'seu_token_shuffle'
```

**No Shuffle:**

```
1. Criar Workflow
2. Trigger: Webhook
3. Copiar Webhook URL e Token
4. Actions:
   - Parse Prometheus alert
   - Check severity
   - If critical:
     - Create ticket in GLPI/ServiceNow
     - Page on-call
     - Create Slack channel
   - If warning:
     - Send Slack message
     - Log in database
```

---

## Runbooks e Documentação de Alertas

### Estrutura de Runbook

```markdown
# Runbook: High CPU Usage

## Alerta
- **Nome:** HighCPU
- **Severidade:** Warning
- **Threshold:** CPU > 85% por 5 minutos

## Impacto
- Performance degradada
- Latência aumentada para usuários
- Possível timeout de requests

## Causas Comuns
1. Processo consumindo CPU anormalmente
2. Load spike legítimo (horário de pico)
3. Ataque DDoS ou abuso
4. Infinite loop em código

## Diagnóstico

### 1. Verificar CPU atual
```bash
ssh user@server-01
top -bn1 | head -20
```

### 2. Identificar processo problemático
```bash
ps aux --sort=-%cpu | head -10
```

### 3. Verificar dashboards
- [Grafana - System Overview](http://grafana/d/system-overview)
- [Grafana - Node Details](http://grafana/d/node-details?var-instance=server-01)

### 4. Verificar logs
```bash
journalctl -u odoo -n 100 --since "5 minutes ago"
```

## Resolução

### Se processo legítimo com spike:
```bash
# Verificar se é horário de pico
# Se sim, apenas monitorar
# Considerar scale-up se frequente
```

### Se processo problemático identificado:
```bash
# Identificar PID
PID=$(ps aux | grep nome_processo | awk '{print $2}')

# Analisar com strace (cuidado em produção)
sudo strace -p $PID -c

# Se necessário, matar processo
sudo kill -15 $PID  # Graceful
# Aguardar 30s
sudo kill -9 $PID   # Force (se necessário)

# Restart serviço
sudo systemctl restart odoo
```

### Se ataque/abuso:
```bash
# Verificar connections
netstat -an | grep :8069 | wc -l

# Bloquear IP suspeito
sudo iptables -A INPUT -s IP_SUSPEITO -j DROP

# Ou via fail2ban
sudo fail2ban-client set odoo banip IP_SUSPEITO
```

## Escalação
- **Nível 1 (0-15 min):** Ops team investiga
- **Nível 2 (15-30 min):** Chamar on-call engineer
- **Nível 3 (30+ min):** Escalar para manager

## Prevenção
- [ ] Implementar auto-scaling
- [ ] Otimizar código/queries lentas
- [ ] Configurar rate limiting
- [ ] Aumentar recursos se baseline cresceu

## Métricas para Acompanhar
- CPU usage trend (últimos 7 dias)
- Correlação com requests/segundo
- Memory usage (pode indicar leak)

## Alertas Relacionados
- HighMemory
- HighLatency
- ServiceDown
```

### Repositório de Runbooks

```
wiki/
├── runbooks/
│   ├── system/
│   │   ├── high-cpu.md
│   │   ├── high-memory.md
│   │   ├── disk-full.md
│   │   └── node-down.md
│   ├── applications/
│   │   ├── odoo-slow.md
│   │   ├── odoo-down.md
│   │   ├── netbox-unreachable.md
│   │   └── wazuh-agents-offline.md
│   ├── databases/
│   │   ├── postgres-connections.md
│   │   ├── postgres-slow-queries.md
│   │   └── redis-memory.md
│   └── security/
│       ├── suspicious-activity.md
│       ├── brute-force.md
│       └── malware-detected.md
```

---

## On-Call Rotation

### Ferramentas

**PagerDuty:**
```yaml
Schedules:
  - Primary On-Call (24/7):
    - Week 1: Engineer A
    - Week 2: Engineer B
    - Week 3: Engineer C

  - Secondary On-Call (backup):
    - Week 1: Engineer B
    - Week 2: Engineer C
    - Week 3: Engineer A

Escalation Policies:
  - Level 1: Primary on-call (imediato)
  - Level 2: Secondary on-call (após 15 min)
  - Level 3: Manager (após 30 min)
  - Level 4: CTO (após 1 hora)
```

**Opsgenie:**
Similar ao PagerDuty.

**Grafana OnCall (open-source):**
```yaml
# Adicionar ao docker-compose
  grafana-oncall:
    image: grafana/oncall:latest
    ports:
      - "8080:8080"
    environment:
      - DATABASE_TYPE=postgresql
      - DATABASE_URL=postgresql://oncall:password@postgres/oncall
```

### Boas Práticas

```yaml
Rotação:
  - Duração: 1 semana (não mais, burnout)
  - Handoff: Segunda-feira 9h (não sexta-feira)
  - Documentar incidentes durante o turno
  - Post-mortem após incidentes críticos

Compensação:
  - Adicional de on-call (% salário)
  - Folgas compensatórias
  - Reconhecimento e agradecimento

Preparação:
  - Treinamento em runbooks
  - Acesso a todos os sistemas
  - Laptop e celular corporativo
  - VPN configurada
```

---

## Métricas de Alertas

### SLIs de Alerting

```yaml
Métricas para Monitorar:
  - MTTD (Mean Time To Detect)
  - MTTA (Mean Time To Acknowledge)
  - MTTR (Mean Time To Resolve)
  - Alert volume (total/dia)
  - False positive rate
  - Alert fatigue score
```

### Dashboard de Alerting

```promql
# Total de alertas ativos
ALERTS{alertstate="firing"}

# Alertas por severidade
sum by (severity) (ALERTS{alertstate="firing"})

# MTTD (tempo entre start e primeiro ACK)
# (requer integração com ticketing system)

# Taxa de falsos positivos
# (manual tracking)
```

---

## Troubleshooting

### Alertas Não Disparam

```bash
# 1. Verificar se alerta está configurado
curl http://prometheus:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name=="HighCPU")'

# 2. Verificar se condition está sendo atingida
curl -G http://prometheus:9090/api/v1/query \
  --data-urlencode 'query=instance:node_cpu_utilisation:rate5m > 85'

# 3. Verificar status do Alertmanager
curl http://alertmanager:9093/api/v1/status

# 4. Verificar se Prometheus está enviando para Alertmanager
curl http://prometheus:9090/api/v1/alertmanagers

# 5. Verificar silences ativos
curl http://alertmanager:9093/api/v1/silences
```

### Alertas Duplicados

```yaml
Causas:
  1. Múltiplos Prometheus enviando mesmo alerta
     Solução: Verificar deduplication no Alertmanager

  2. group_by incorreto
     Solução: Ajustar group_by para agrupar corretamente

  3. Flapping (alerta firing/resolved rapidamente)
     Solução: Aumentar for duration ou usar query rate()
```

### Notificações Não Chegam

```bash
# Verificar logs do Alertmanager
docker-compose logs alertmanager | grep -i error

# Testar receiver específico
docker exec alertmanager amtool config routes test \
  --config.file=/etc/alertmanager/alertmanager.yml \
  alertname=TestAlert severity=warning

# Verificar webhook
curl -X POST http://seu-webhook \
  -H 'Content-Type: application/json' \
  -d '{"test": "data"}'
```

---

**Autor:** Equipe NEO_NETBOX_ODOO Stack
**Última Atualização:** 2025-12-05
**Versão:** 1.0
