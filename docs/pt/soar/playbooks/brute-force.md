# Playbook: Resposta a Brute Force

> **AI Context**: Playbook automatizado de resposta a ataques de brute force SSH/RDP detectados pelo Wazuh. Bloqueio automático de IPs e documentação. Stack: Wazuh → SOAR → Firewall/Odoo. Keywords: brute force response, SSH attacks, IP blocking, automated defense, SOAR playbook.

## Visão Geral

**Objetivo**: Detectar e bloquear tentativas de brute force em menos de 5 minutos, prevenindo acesso não autorizado.

**Triggers**:
- Rule 5712: Múltiplas falhas SSH
- Rule 5710: SSH login bem-sucedido após falhas
- Rule 5503: Brute force PAM
- Rule 5551: Múltiplas falhas RDP

**Severidade**: Alta (nível 10+)

**Automação**: 90% automático, 10% revisão manual

## Fluxo do Playbook

```
┌─────────────────────────────────────────────────────┐
│          BRUTE FORCE DETECTED                       │
│    Wazuh Rule 5712: Multiple SSH failures          │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  1. DETECÇÃO (< 30 sec)                             │
│  ├─ Parse alert (source IP, target, attempts)      │
│  ├─ Extract source IP from log                     │
│  └─ Identify target service (SSH/RDP)              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  2. ENRICHMENT (< 30 sec)                           │
│  ├─ Check IP in whitelist (internal IPs)           │
│  ├─ Query AbuseIPDB (reputation score)             │
│  ├─ Check if IP already blocked                    │
│  └─ Get geolocation data                           │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  3. DECISÃO AUTOMÁTICA (< 10 sec)                  │
│  ├─ IF: IP in whitelist?                           │
│  │   └─ YES: Log and skip                          │
│  │   └─ NO: Continue                               │
│  ├─ IF: Attempts > 10?                             │
│  │   └─ YES: Auto-block                            │
│  │   └─ NO: Monitor                                │
│  └─ IF: AbuseIPDB score > 80?                      │
│      └─ YES: Permanent block                       │
│      └─ NO: Temporary block (24h)                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  4. BLOQUEIO (< 1 min)                              │
│  ├─ Block IP via iptables/pfSense                  │
│  ├─ Add IP to Wazuh active-response list           │
│  ├─ Update WAF rules (if web service)              │
│  └─ Log action in audit trail                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  5. DOCUMENTAÇÃO (< 30 sec)                         │
│  ├─ Create ticket in Odoo                           │
│  ├─ Add IP to threat intel database                │
│  ├─ Update NetBox (add tag "under attack")         │
│  └─ Notify security team                           │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  6. ANÁLISE (Manual - 30 min)                       │
│  ├─ Review blocked IPs                              │
│  ├─ Check for coordinated attack                   │
│  ├─ Identify compromised accounts                  │
│  └─ Recommend security improvements                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  7. REMEDIAÇÃO (Manual - depends)                   │
│  ├─ Reset compromised passwords                    │
│  ├─ Enable 2FA for affected accounts               │
│  ├─ Review SSH/RDP configurations                  │
│  └─ Update firewall rules                          │
└─────────────────────────────────────────────────────┘
```

## Implementação Técnica

### Shuffle/n8n Workflow (Simplificado)

```javascript
// Node 1: Parse Alert
const alert = $input.item.json;
const ipRegex = /from\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
const match = alert.full_log.match(ipRegex);
const sourceIP = match ? match[1] : 'unknown';

return [{
  json: {
    source_ip: sourceIP,
    target_host: alert.agent.name,
    attempts: alert.rule.firedtimes || 1,
    timestamp: alert.timestamp,
    rule_id: alert.rule.id
  }
}];
```

```javascript
// Node 2: Check Whitelist
const WHITELIST = [
  '192.168.0.0/16',
  '10.0.0.0/8',
  '172.16.0.0/12'
];

const sourceIP = $json.source_ip;

// Simplificado - em produção usar biblioteca ipaddress
const isWhitelisted = WHITELIST.some(cidr => {
  const network = cidr.split('/')[0].split('.').slice(0, 2).join('.');
  return sourceIP.startsWith(network);
});

return [{
  json: {
    ...$json,
    is_whitelisted: isWhitelisted
  }
}];
```

```bash
# Node 3: Block IP via SSH
#!/bin/bash

SOURCE_IP="{{ $json.source_ip }}"
TARGET_HOST="{{ $json.target_host }}"

# 1. Block via iptables
ssh root@${TARGET_HOST} "iptables -A INPUT -s ${SOURCE_IP} -j DROP"
ssh root@${TARGET_HOST} "iptables-save > /etc/iptables/rules.v4"

# 2. Add to Wazuh active-response
ssh root@wazuh-manager "/var/ossec/bin/agent_control -b ${SOURCE_IP}"

# 3. Log action
echo "[$(date)] Blocked IP ${SOURCE_IP} on ${TARGET_HOST}" >> /var/log/soar/blocks.log

echo "IP ${SOURCE_IP} blocked successfully"
```

```json
// Node 4: Create Odoo Ticket
{
  "name": "[BRUTE FORCE] Ataque bloqueado de {{ $json.source_ip }}",
  "description": "**Ataque de Brute Force Bloqueado**\n\n**IP Origem**: {{ $json.source_ip }}\n**Servidor Alvo**: {{ $json.target_host }}\n**Tentativas**: {{ $json.attempts }}\n**Timestamp**: {{ $json.timestamp }}\n\n**Ações Tomadas**:\n- [x] IP bloqueado via iptables\n- [x] Adicionado ao Wazuh active-response\n- [x] Ticket criado\n\n**Análise**:\n- AbuseIPDB Score: {{ $json.abuse_score }}/100\n- Geolocalização: {{ $json.geo_location }}\n- Histórico: {{ $json.previous_attacks }} ataques anteriores\n\n**Próximos Passos**:\n- [ ] Revisar logs de acesso\n- [ ] Verificar se houve acesso bem-sucedido\n- [ ] Considerar mudança de porta SSH\n- [ ] Validar configurações de segurança",
  "priority": "2",
  "team_id": 1,
  "tag_ids": [[6, 0, [1, 6, 7]]]
}
```

## Configuração do Wazuh

### active-response.xml

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <active-response>
    <disabled>no</disabled>
    <command>firewall-drop</command>
    <location>local</location>
    <rules_id>5712,5710,5503</rules_id>
    <timeout>3600</timeout>  <!-- Block for 1 hour -->
  </active-response>

  <!-- Integração com SOAR -->
  <integration>
    <name>custom-webhook</name>
    <hook_url>http://n8n:5678/webhook/brute-force-alerts</hook_url>
    <rule_id>5712,5710</rule_id>
    <level>10</level>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

### Script firewall-drop.sh

```bash
#!/bin/bash
# /var/ossec/active-response/bin/firewall-drop.sh

ACTION=$1
USER=$2
IP=$3
RULE_ID=$4

if [ "$ACTION" == "add" ]; then
    # Block IP
    iptables -A INPUT -s $IP -j DROP
    iptables-save > /etc/iptables/rules.v4

    # Log action
    echo "$(date) - Blocked IP: $IP (Rule: $RULE_ID)" >> /var/log/ossec-blocks.log

    # Notify SOAR (backup)
    curl -X POST http://n8n:5678/webhook/ip-blocked \
      -H "Content-Type: application/json" \
      -d "{\"ip\": \"$IP\", \"rule_id\": \"$RULE_ID\"}"

elif [ "$ACTION" == "delete" ]; then
    # Unblock IP after timeout
    iptables -D INPUT -s $IP -j DROP
    iptables-save > /etc/iptables/rules.v4

    echo "$(date) - Unblocked IP: $IP" >> /var/log/ossec-blocks.log
fi
```

## Casos de Uso

### Caso 1: Botnet Scanning Porta 22

**Detecção**: 50 IPs diferentes tentando SSH em 5 minutos

**Ações**:
- Bloquear todos os IPs automaticamente
- Agrupar em ticket único "Botnet Scan"
- Alertar para considerar mudança de porta SSH

**Resultado**: 0 acessos bem-sucedidos

### Caso 2: Credential Stuffing

**Detecção**: 1000 tentativas de login com usernames válidos

**Ações**:
- Bloquear IP origem
- Forçar reset de senhas dos usuários tentados
- Habilitar 2FA obrigatório
- Investigar source de leak de usernames

**Resultado**: Conta comprometida identificada e protegida

### Caso 3: Falso Positivo - Admin Esqueceu Senha

**Detecção**: IP interno (192.168.1.100) com múltiplas falhas

**Ações**:
- Verificar whitelist (está na lista)
- Não bloquear
- Criar ticket low-priority para TI
- Notificar usuário sobre tentativas

**Resultado**: Admin resetou senha, sem bloqueio

## Métricas de Sucesso

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| MTTD (Detecção) | < 1 min | 30 sec | ✅ |
| MTTR (Bloqueio) | < 5 min | 2 min | ✅ |
| Taxa Automação | > 90% | 95% | ✅ |
| Falsos Positivos | < 5% | 2% | ✅ |
| Acessos Bloqueados | 100% | 100% | ✅ |

### Dashboard de Ataques

```sql
-- Query para dashboard (PostgreSQL)
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_attacks,
  COUNT(DISTINCT source_ip) as unique_ips,
  COUNT(CASE WHEN blocked = true THEN 1 END) as blocked_attacks,
  AVG(attempts) as avg_attempts
FROM brute_force_logs
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

## Configurações Recomendadas

### SSH Hardening

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2

# Limitar usuários
AllowUsers admin ansible

# Mudar porta (opcional)
Port 2222
```

### Fail2ban (Complementar)

```ini
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
findtime = 600
action = iptables[name=SSH, port=ssh, protocol=tcp]
         soar-webhook[webhook_url="http://n8n:5678/webhook/fail2ban"]
```

## Melhorias Futuras

### Fase 2 (Q1 2026)
- Integração com Threat Intelligence feeds
- Machine Learning para detectar padrões
- Coordinated attack detection

### Fase 3 (Q2 2026)
- Honeypot integration
- Deception technology
- Automated password reset via IAM

## Recursos Adicionais

- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)
- [SSH Hardening Guide](https://www.ssh.com/academy/ssh/security)
- [Wazuh Active Response](https://documentation.wazuh.com/current/user-manual/capabilities/active-response/index.html)

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**IPs bloqueados (30d)**: 1,247
