# Playbooks SOAR - Catálogo

> **AI Context**: Catálogo completo de playbooks de resposta a incidentes para NEO_NETBOX_ODOO_STACK. Automações prontas para malware, brute force, compliance. Keywords: SOAR playbooks, incident response, automation catalog, security playbooks, Wazuh response.

## Visão Geral

**Playbooks** são workflows automatizados de resposta a incidentes específicos, contendo:
- **Triggers**: Condições que iniciam o playbook
- **Ações**: Passos automatizados
- **Decisões**: Pontos de aprovação manual
- **Métricas**: KPIs de sucesso

## Catálogo de Playbooks

### Resposta a Ameaças

| Playbook | Rule IDs | Severidade | Complexidade | Tempo Médio |
|----------|----------|------------|--------------|-------------|
| [Malware Response](malware-response.md) | 554, 555 | Crítica | Média | 5-15 min |
| [Brute Force Response](brute-force.md) | 5712, 5710 | Alta | Baixa | 2-5 min |
| Ransomware Detection | 60200+ | Crítica | Alta | 10-30 min |
| Privilege Escalation | 80790+ | Alta | Média | 5-10 min |

### Compliance

| Playbook | Framework | Frequência | Complexidade |
|----------|-----------|------------|--------------|
| [PCI-DSS Compliance](compliance.md) | PCI-DSS | Diária | Média |
| CIS Benchmark Check | CIS | Semanal | Alta |
| GDPR Data Access Log | GDPR | Contínua | Baixa |
| ISO 27001 Evidence | ISO 27001 | Mensal | Média |

### Operações

| Playbook | Descrição | Automação | Manual |
|----------|-----------|-----------|--------|
| Vulnerability Patching | CVE crítico → patch | 70% | 30% |
| User Deprovisioning | Desligar user → revoke access | 90% | 10% |
| Backup Validation | Verificar backups diários | 100% | 0% |
| Certificate Renewal | SSL expirando → renovar | 80% | 20% |

## Anatomia de um Playbook

```
┌─────────────────────────────────────────────────┐
│                   PLAYBOOK                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. TRIGGER (Automático)                        │
│     ├─ Rule ID / Alert Level                    │
│     └─ Condições específicas                    │
│                                                 │
│  2. ENRICHMENT (Automático)                     │
│     ├─ NetBox: Contexto do asset               │
│     ├─ Threat Intel: IOCs conhecidos           │
│     └─ CMDB: Criticidade de negócio            │
│                                                 │
│  3. DECISÃO (Automático + Manual)               │
│     ├─ Regras automáticas (if/else)            │
│     └─ Aprovação humana quando necessário      │
│                                                 │
│  4. RESPOSTA (Automático)                       │
│     ├─ Contenção (isolar, bloquear)            │
│     ├─ Documentação (ticket, log)              │
│     └─ Notificação (email, Slack)              │
│                                                 │
│  5. VALIDAÇÃO (Manual)                          │
│     ├─ Verificar efetividade                   │
│     └─ Fechar ticket                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Métricas de Playbooks

### KPIs Operacionais

| Métrica | Descrição | Meta | Como Medir |
|---------|-----------|------|------------|
| **MTTD** | Mean Time To Detect | < 5 min | Timestamp alerta |
| **MTTR** | Mean Time To Respond | < 30 min | Timestamp ação |
| **Taxa Automação** | % alertas tratados automaticamente | > 70% | Workflows/Alertas |
| **Falsos Positivos** | % alertas não-incidentes | < 10% | Tickets fechados sem ação |
| **Cobertura** | % alertas com playbook | > 80% | Playbooks ativos/Rules |

### Exemplo de Medição

```python
# Script: playbook-metrics.py
import requests
from datetime import datetime, timedelta

def calculate_mttr(workflow_executions):
    """Calcula MTTR médio"""
    times = []
    for exec in workflow_executions:
        start = datetime.fromisoformat(exec['started_at'])
        end = datetime.fromisoformat(exec['finished_at'])
        times.append((end - start).total_seconds() / 60)

    return sum(times) / len(times) if times else 0

# Query workflows últimas 24h
workflows = requests.get('http://n8n:5678/api/v1/executions?limit=100').json()

mttr = calculate_mttr(workflows)
print(f"MTTR: {mttr:.2f} minutos")
```

## Implementação de Playbooks

### Passo 1: Escolher Plataforma

```bash
# Opção A: Shuffle (Enterprise)
cd /opt/neoand-netbox-odoo-stack/shuffle
# Importar workflow JSON

# Opção B: n8n (Prototipagem)
cd /opt/neoand-netbox-odoo-stack/n8n
# Importar workflow JSON
```

### Passo 2: Importar Playbook

```bash
# Via API (n8n)
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d @playbook-malware-response.json

# Via UI
# 1. Workflows → Import
# 2. Cole JSON
# 3. Ativar workflow
```

### Passo 3: Configurar Credenciais

```bash
# Odoo API Key
# NetBox Token
# Slack Webhook
# etc.
```

### Passo 4: Testar

```bash
# Enviar alerta simulado
curl -X POST http://localhost:5678/webhook/malware-alert \
  -H "Content-Type: application/json" \
  -d @test-alert.json

# Verificar execução
# UI → Executions → Ver detalhes
```

### Passo 5: Monitorar

```bash
# Logs de execução
docker logs n8n | grep "Workflow.*malware"

# Métricas
curl http://localhost:5678/api/v1/executions?workflowId=123
```

## Estrutura da Documentação

1. **[Resposta a Malware](malware-response.md)**
   - Detecção → Isolamento → Análise → Remediação

2. **[Resposta a Brute Force](brute-force.md)**
   - Detecção → Bloqueio → Investigação → Relatório

3. **[Automação de Compliance](compliance.md)**
   - Coleta → Validação → Relatório → Evidências

## Roadmap de Playbooks

### Q1 2026
- ✅ Malware Response
- ✅ Brute Force Response
- ✅ PCI-DSS Compliance
- 🔄 Ransomware Detection
- 🔄 DDoS Mitigation

### Q2 2026
- 📅 APT Detection
- 📅 Data Exfiltration
- 📅 Insider Threat
- 📅 Supply Chain Attack

### Q3 2026
- 📅 Cloud Security (AWS/Azure)
- 📅 Container Security (K8s)
- 📅 IoT Security

## Contribuindo

### Criar Novo Playbook

1. Copiar template:
```bash
cp playbook-template.md playbooks/my-playbook.md
```

2. Definir:
   - Trigger (Rule IDs)
   - Fluxo de resposta
   - Ações automatizadas
   - Pontos de decisão manual

3. Implementar workflow (Shuffle ou n8n)

4. Testar em ambiente staging

5. Documentar métricas de sucesso

## Recursos Adicionais

- [NIST Incident Response Guide](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf)
- [SANS Incident Handler's Handbook](https://www.sans.org/white-papers/33901/)
- [Wazuh Use Cases](https://documentation.wazuh.com/current/user-manual/capabilities/index.html)

## Próximos Passos

1. **Implementar playbooks**: Escolha casos críticos primeiro
2. **Medir resultados**: Configure dashboards de métricas
3. **Iterar e melhorar**: Ajuste playbooks baseado em feedback

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**Playbooks ativos**: 3 (Malware, Brute Force, Compliance)
