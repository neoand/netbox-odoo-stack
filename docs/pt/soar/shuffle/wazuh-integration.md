# Integração Shuffle com Wazuh

> **AI Context**: Configuração completa da integração Wazuh → Shuffle SOAR. Inclui ossec.conf, webhook format, filtros por rule_level/rule_groups e troubleshooting. Stack: Wazuh Manager → Shuffle webhook → automated response. Keywords: Wazuh Shuffle integration, webhook configuration, ossec.conf, alert filtering, SOAR automation.

## Visão Geral

Esta integração permite que o **Wazuh Manager** envie alertas automaticamente para o **Shuffle SOAR** via webhook HTTP, disparando workflows de resposta a incidentes.

### Fluxo de Integração

```
┌──────────────────┐
│  Wazuh Manager   │
│                  │
│  1. Detecta      │
│     alerta       │
│                  │
│  2. Filtra       │
│     (rule_level, │
│      groups)     │
│                  │
│  3. Formata JSON │
└────────┬─────────┘
         │ HTTP POST
         │
         ▼
┌──────────────────┐
│  Shuffle Webhook │
│                  │
│  4. Recebe alert │
│                  │
│  5. Parseia JSON │
│                  │
│  6. Executa      │
│     workflow     │
└────────┬─────────┘
         │
         ├──► NetBox (enrichment)
         │
         └──► Odoo (ticket)
```

## Pré-requisitos

### No Wazuh Manager

```bash
# Verificar conectividade
curl -X POST http://shuffle-host:3001/api/v1/hooks/webhook_test \
  -H "Content-Type: application/json" \
  -d '{"test": "connection"}'

# Verificar versão Wazuh (4.5+)
/var/ossec/bin/wazuh-control info
```

### No Shuffle

1. ✅ Shuffle instalado e rodando ([guia de setup](setup.md))
2. ✅ Workflow criado com trigger **Webhook**
3. ✅ URL do webhook copiada (ex: `http://shuffle:3001/api/v1/hooks/webhook_abc123`)

## Configuração do Wazuh

### 1. Editar ossec.conf

```bash
# Editar configuração
sudo nano /var/ossec/etc/ossec.conf
```

Adicionar bloco de integração:

```xml
<ossec_config>
  <!-- SHUFFLE SOAR INTEGRATION -->
  <integration>
    <name>shuffle</name>
    <hook_url>http://shuffle.neoand.local:3001/api/v1/hooks/webhook_abc123def456</hook_url>
    <level>7</level>
    <rule_id>554,555,5712,5710,5503</rule_id>
    <alert_format>json</alert_format>
    <options>{"data": "alert", "use_geoip": true}</options>
  </integration>

  <!-- BACKUP: Caso Shuffle esteja indisponível -->
  <integration>
    <name>custom-webhook</name>
    <hook_url>http://backup-soar.neoand.local:8080/wazuh</hook_url>
    <level>10</level>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

### 2. Parâmetros de Integração

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `<name>` | Nome da integração (fixo) | `shuffle` |
| `<hook_url>` | URL completa do webhook Shuffle | `http://shuffle:3001/api/v1/hooks/webhook_xyz` |
| `<level>` | Nível mínimo de alerta (0-15) | `7` (médio), `10` (crítico) |
| `<rule_id>` | IDs específicos (CSV) | `554,5712,5710` |
| `<group>` | Grupos de regras | `syscheck,ossec` |
| `<alert_format>` | Formato de payload | `json` (padrão) |
| `<options>` | Opções adicionais (JSON) | `{"use_geoip": true}` |

### 3. Filtros Avançados

#### Por Nível de Severidade

```xml
<!-- Apenas alertas críticos -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_critical</hook_url>
  <level>12</level>  <!-- Nível 12-15 -->
</integration>
```

**Níveis Wazuh**:
- `0-3`: Informacional
- `4-6`: Baixo
- `7-9`: Médio
- `10-12`: Alto
- `13-15`: Crítico

#### Por Grupo de Regras

```xml
<!-- Apenas ataques de rede -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_network</hook_url>
  <level>5</level>
  <group>attack,ids</group>
</integration>

<!-- Apenas mudanças de arquivos -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_fim</hook_url>
  <group>syscheck</group>
</integration>
```

**Grupos comuns**:
- `attack`: Ataques detectados
- `ids`: Detecção de intrusão
- `syscheck`: File Integrity Monitoring
- `rootcheck`: Rootkit detection
- `malware`: Malware detectado
- `authentication_failed`: Falhas de autenticação
- `vulnerability-detector`: CVEs

#### Por Rule ID Específico

```xml
<!-- Malware, brute force, privilege escalation -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_security</hook_url>
  <rule_id>554,555,5712,5710,40111</rule_id>
</integration>
```

**Rule IDs críticos**:
| Rule ID | Descrição |
|---------|-----------|
| 554 | Malware detectado (rootcheck) |
| 555 | Rootkit detectado |
| 5712 | Brute force SSH (múltiplas tentativas) |
| 5710 | Autenticação SSH bem-sucedida (possível brute force) |
| 5503 | Brute force PAM (Linux) |
| 40111 | Vulnerabilidade crítica (CVE) |
| 60103 | Vulnerabilidade alta |

#### Combinando Filtros

```xml
<!-- Alertas médios+ de malware E ataques -->
<integration>
  <name>shuffle</name>
  <hook_url>http://shuffle:3001/api/v1/hooks/webhook_combined</hook_url>
  <level>7</level>
  <group>malware,attack</group>
</integration>
```

### 4. Opções Adicionais

```xml
<options>
  {
    "data": "alert",           # Incluir dados completos do alerta
    "use_geoip": true,         # Enriquecer com geolocalização
    "custom_alert": {
      "organization": "NeoAnd",
      "environment": "production"
    }
  }
</options>
```

### 5. Validar e Aplicar Configuração

```bash
# Validar sintaxe XML
sudo /var/ossec/bin/wazuh-control configcheck

# Reiniciar Wazuh Manager
sudo systemctl restart wazuh-manager

# Verificar logs de integração
sudo tail -f /var/ossec/logs/integrations.log
```

## Formato do Payload JSON

### Estrutura Completa

```json
{
  "timestamp": "2025-12-05T14:32:10.123-0300",
  "rule": {
    "level": 12,
    "description": "Malware detected (rootcheck)",
    "id": "554",
    "firedtimes": 3,
    "mail": true,
    "groups": ["malware", "rootcheck"],
    "pci_dss": ["11.4"],
    "gdpr": ["IV_35.7.d"]
  },
  "agent": {
    "id": "001",
    "name": "web-server-01",
    "ip": "192.168.1.50"
  },
  "manager": {
    "name": "wazuh-manager"
  },
  "id": "1701788730.123456",
  "full_log": "/var/www/uploads/malware.php contains malicious code",
  "decoder": {
    "name": "rootcheck"
  },
  "data": {
    "file": "/var/www/uploads/malware.php",
    "title": "PHP webshell detected"
  },
  "location": "rootcheck",
  "GeoLocation": {
    "city_name": "São Paulo",
    "country_name": "Brazil",
    "location": {
      "lat": -23.55,
      "lon": -46.63
    }
  }
}
```

### Campos Importantes

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `rule.id` | string | ID da regra disparada | `"554"` |
| `rule.level` | int | Severidade (0-15) | `12` |
| `rule.description` | string | Descrição do alerta | `"Malware detected"` |
| `rule.groups[]` | array | Categorias do alerta | `["malware", "rootcheck"]` |
| `agent.id` | string | ID do agente Wazuh | `"001"` |
| `agent.name` | string | Hostname do agente | `"web-server-01"` |
| `agent.ip` | string | IP do agente | `"192.168.1.50"` |
| `data.*` | object | Dados específicos da regra | `{"file": "/path"}` |
| `GeoLocation.*` | object | Geolocalização do IP | `{"country": "BR"}` |

## Configuração do Shuffle Workflow

### 1. Criar Workflow "Wazuh Alert Handler"

#### Trigger: Webhook

```json
{
  "name": "wazuh_webhook",
  "type": "WEBHOOK",
  "id": "trigger_1"
}
```

**URL gerada**:
```
http://shuffle.neoand.local:3001/api/v1/hooks/webhook_abc123def456
```

### 2. Adicionar Action: Parse Alert

```json
{
  "name": "Parse Wazuh Alert",
  "app_name": "Shuffle Tools",
  "app_version": "1.2.0",
  "action": "execute_python",
  "parameters": [
    {
      "name": "code",
      "value": "import json\n\n# Executar trigger\nalert = json.loads($webhook.#.body$)\n\n# Extrair campos importantes\nresult = {\n    'rule_id': alert['rule']['id'],\n    'rule_level': alert['rule']['level'],\n    'description': alert['rule']['description'],\n    'agent_name': alert['agent']['name'],\n    'agent_ip': alert['agent']['ip'],\n    'timestamp': alert['timestamp'],\n    'full_log': alert.get('full_log', '')\n}\n\nprint(json.dumps(result))"
    }
  ]
}
```

### 3. Adicionar Condition: Filtrar Severidade

```json
{
  "name": "Check Severity",
  "app_name": "Shuffle Tools",
  "app_version": "1.2.0",
  "action": "filter_list",
  "parameters": [
    {
      "name": "list",
      "value": "$parse_alert.rule_level$"
    },
    {
      "name": "field",
      "value": "rule_level"
    },
    {
      "name": "check",
      "value": ">="
    },
    {
      "name": "value",
      "value": "10"
    }
  ],
  "branches": {
    "true": "create_ticket",
    "false": "log_only"
  }
}
```

### 4. Test Workflow

```bash
# Enviar alerta teste
curl -X POST http://shuffle.neoand.local:3001/api/v1/hooks/webhook_abc123 \
  -H "Content-Type: application/json" \
  -d '{
  "timestamp": "2025-12-05T14:32:10.123-0300",
  "rule": {
    "level": 12,
    "description": "Malware detected - TEST",
    "id": "554",
    "groups": ["malware"]
  },
  "agent": {
    "id": "001",
    "name": "test-server",
    "ip": "192.168.1.99"
  },
  "full_log": "TEST: Malware simulation"
}'
```

**Verificar execução**:
1. Shuffle UI → Workflows → Wazuh Alert Handler
2. Tab **Executions**
3. Verificar status: `FINISHED` (sucesso) ou `FAILED` (erro)

## Testes de Integração

### Teste 1: Regra SSH Brute Force

```bash
# No agente Wazuh, gerar tentativas SSH falhas
for i in {1..10}; do
  ssh invalid_user@localhost
done

# Verificar alerta no Wazuh
sudo tail -f /var/ossec/logs/alerts/alerts.json | grep 5712

# Verificar recebimento no Shuffle
docker logs shuffle-backend | grep webhook
```

### Teste 2: File Integrity Monitoring

```bash
# No agente, modificar arquivo monitorado
echo "teste" | sudo tee -a /etc/passwd

# Wazuh detectará mudança (rule 550)
sudo tail -f /var/ossec/logs/alerts/alerts.json | grep 550

# Shuffle deve receber webhook
```

### Teste 3: Malware Detection (Simulado)

```bash
# Criar arquivo de teste EICAR (não é malware real)
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > /tmp/eicar.txt

# Wazuh pode detectar via rootcheck
sudo /var/ossec/bin/rootcheck -d

# Verificar alerta
sudo tail -f /var/ossec/logs/alerts/alerts.json | grep -i eicar
```

## Troubleshooting

### Problema: Webhook não recebe alertas

**Diagnóstico**:
```bash
# 1. Verificar logs de integração Wazuh
sudo tail -f /var/ossec/logs/integrations.log
# Procurar por erros de conexão

# 2. Testar conectividade
sudo curl -X POST http://shuffle:3001/api/v1/hooks/webhook_xyz \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 3. Verificar se integração está ativa
sudo grep -A 10 "<integration>" /var/ossec/etc/ossec.conf
```

**Soluções**:
- Verificar firewall: `sudo iptables -L | grep 3001`
- Verificar DNS: `nslookup shuffle.neoand.local`
- Verificar URL do webhook (copiar novamente do Shuffle)

### Problema: Alertas duplicados

**Sintoma**: Mesmo alerta dispara múltiplas vezes

**Causa**: `firedtimes` incrementando na mesma regra

**Solução**:
```xml
<!-- Adicionar opção max_firedtimes -->
<integration>
  <name>shuffle</name>
  <hook_url>...</hook_url>
  <level>7</level>
  <max_log>1</max_log>  <!-- Enviar apenas primeira vez -->
</integration>
```

### Problema: Payload vazio no Shuffle

**Diagnóstico**:
```bash
# Verificar logs do Shuffle
docker logs shuffle-backend | grep -A 20 webhook_abc123
```

**Causa**: Formato de alerta incorreto

**Solução**:
```xml
<!-- Garantir formato JSON -->
<integration>
  <alert_format>json</alert_format>  <!-- NÃO usar 'splunk' ou 'full' -->
</integration>
```

### Problema: Timeout de webhook

**Sintoma**:
```
integrations.log: ERROR: Unable to send alert to Shuffle (timeout)
```

**Solução**:
```bash
# Aumentar timeout no Wazuh (default: 5s)
# Editar /var/ossec/etc/internal_options.conf
sudo nano /var/ossec/etc/internal_options.conf

# Adicionar:
integrator.timeout=15  # 15 segundos

# Reiniciar
sudo systemctl restart wazuh-manager
```

### Problema: Shuffle não parseia JSON

**Diagnóstico**:
```python
# No workflow Shuffle, adicionar debug
import json
print("Raw body:", $webhook.#.body$)
print("Type:", type($webhook.#.body$))

alert = json.loads($webhook.#.body$)
print("Parsed:", alert)
```

**Solução**: Verificar se body está como string, não objeto:
```python
# Se body já é objeto (parsed):
alert = $webhook.#.body$

# Se body é string:
alert = json.loads($webhook.#.body$)
```

## Monitoramento da Integração

### Métricas Wazuh

```bash
# Alertas enviados para Shuffle (últimas 24h)
sudo grep "shuffle" /var/ossec/logs/integrations.log | \
  grep "$(date +%Y/%m/%d)" | wc -l

# Taxa de sucesso
sudo grep "shuffle.*successfully" /var/ossec/logs/integrations.log | wc -l
sudo grep "shuffle.*ERROR" /var/ossec/logs/integrations.log | wc -l
```

### Métricas Shuffle

```bash
# Webhooks recebidos
docker logs shuffle-backend | grep "Webhook execution" | wc -l

# Workflows executados com sucesso
docker logs shuffle-backend | grep "Workflow.*FINISHED" | wc -l

# Workflows com erro
docker logs shuffle-backend | grep "Workflow.*FAILED" | wc -l
```

### Dashboard (Opcional)

```bash
# Exportar métricas para Prometheus
# /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: 'shuffle'
    static_configs:
      - targets: ['shuffle.neoand.local:3001']
    metrics_path: '/api/v1/metrics'
```

## Próximos Passos

1. **[Criar Workflows Avançados](workflows.md)**: Automatize respostas complexas
2. **[Playbooks](../playbooks/index.md)**: Implemente resposta a malware, brute force, etc.
3. **[n8n Alternative](../n8n/wazuh-integration.md)**: Compare com abordagem n8n

## Recursos Adicionais

- [Wazuh Integrations Docs](https://documentation.wazuh.com/current/user-manual/manager/manual-integration.html)
- [Shuffle Webhook Trigger](https://shuffler.io/docs/triggers#webhook)
- [Wazuh Rule IDs](https://documentation.wazuh.com/current/user-manual/ruleset/rules-classification.html)

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**Testado com**: Wazuh 4.5.4, Shuffle 1.3.0
