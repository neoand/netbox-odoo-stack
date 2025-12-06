# SOAR - Security Orchestration, Automation and Response

> **AI Context**: Documentação principal do módulo SOAR do NEO_NETBOX_ODOO_STACK v2.0. Compara Shuffle (integração oficial Wazuh) vs n8n (alternativa flexível) para automação de resposta a incidentes. Stack: Wazuh → SOAR → Odoo (tickets) + NetBox (enrichment). Keywords: SOAR, Shuffle, n8n, automação segurança, orquestração, playbooks.

## Visão Geral

O módulo SOAR do **NEO_NETBOX_ODOO_STACK** automatiza a resposta a incidentes de segurança detectados pelo Wazuh, criando tickets no Odoo e enriquecendo dados com informações do NetBox.

### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    WAZUH MANAGER                        │
│  - Detecta alertas de segurança                         │
│  - Filtra por rule_level, rule_groups                   │
│  - Envia webhook para SOAR                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├───► Shuffle (Oficial)
                 │     └─► Workflows visuais
                 │
                 └───► n8n (Alternativa)
                       └─► Low-code automation
                 │
    ┌────────────┴────────────────┐
    │                             │
    ▼                             ▼
┌─────────┐                  ┌──────────┐
│  ODOO   │                  │  NETBOX  │
│ Tickets │                  │ Enrich   │
└─────────┘                  └──────────┘
```

## Comparativo: Shuffle vs n8n

| Característica | Shuffle | n8n |
|---------------|---------|-----|
| **Integração Wazuh** | Oficial, nativa | Via webhook HTTP |
| **Interface** | Drag-and-drop simples | Low-code avançado |
| **Comunidade** | Focada em SecOps | Geral (automação) |
| **Complexidade** | Média | Baixa |
| **Apps prontos** | 400+ (foco segurança) | 400+ (geral) |
| **Curva aprendizado** | Íngreme | Suave |
| **Performance** | Alta | Muito alta |
| **Licença** | AGPL-3.0 | Fair-code (Sustainable Use) |
| **Recomendado para** | Ambientes enterprise | Prototipagem rápida |

## Casos de Uso

### 1. Resposta Automática a Malware
**Trigger**: Wazuh detecta malware (rule_id 554)
- Enriquecer dados do host via NetBox
- Criar ticket crítico no Odoo
- Isolar host na rede (opcional)
- Notificar equipe via Slack/email

### 2. Proteção Contra Brute Force
**Trigger**: Múltiplas tentativas SSH falhas (rule_id 5712)
- Bloquear IP via firewall (iptables/pfSense)
- Criar ticket no Odoo
- Adicionar IP à watchlist do Wazuh
- Gerar relatório de IOCs

### 3. Compliance Automation
**Trigger**: Mudança de configuração detectada
- Validar contra baseline (CIS, PCI-DSS)
- Criar evidência no Odoo
- Gerar relatório de conformidade
- Agendar revisão trimestral

### 4. Gestão de Vulnerabilidades
**Trigger**: CVE crítico detectado
- Consultar NetBox para assets afetados
- Criar tickets de patching no Odoo
- Priorizar por criticidade de negócio
- Rastrear SLA de correção

## Fluxo Típico de Resposta

```
1. DETECÇÃO (Wazuh)
   └─► Alert gerado (JSON)
       ├─ rule_id
       ├─ rule_level (gravidade)
       ├─ rule_groups (categoria)
       └─ data (contexto)

2. ORQUESTRAÇÃO (SOAR)
   └─► Workflow executado
       ├─ Enrichment (NetBox)
       ├─ Decisão (rule engine)
       └─ Ações paralelas

3. RESPOSTA (Integrada)
   ├─► Odoo: Ticket criado
   ├─► NetBox: Contexto obtido
   ├─► Firewall: IP bloqueado
   └─► Slack: Time notificado

4. RASTREAMENTO
   └─► Métricas coletadas
       ├─ MTTD (Mean Time To Detect)
       ├─ MTTR (Mean Time To Respond)
       └─ Taxa de automação
```

## Estrutura da Documentação

### Shuffle (Integração Oficial Wazuh)
- [Introdução ao Shuffle](shuffle/index.md)
- [Instalação e Configuração](shuffle/setup.md)
- [Integração com Wazuh](shuffle/wazuh-integration.md)
- [Workflows de Exemplo](shuffle/workflows.md)

### n8n (Alternativa Flexível)
- [Introdução ao n8n](n8n/index.md)
- [Instalação e Configuração](n8n/setup.md)
- [Integração com Wazuh](n8n/wazuh-integration.md)
- [Workflows de Exemplo](n8n/workflows.md)

### Playbooks
- [Catálogo de Playbooks](playbooks/index.md)
- [Resposta a Malware](playbooks/malware-response.md)
- [Resposta a Brute Force](playbooks/brute-force.md)
- [Automação de Compliance](playbooks/compliance.md)

## Pré-requisitos

### Infraestrutura
- Docker Engine 24.0+
- Docker Compose 2.20+
- 4GB RAM disponível
- 20GB storage SSD

### Serviços
- ✅ Wazuh Manager operacional
- ✅ Odoo com módulo Helpdesk instalado
- ✅ NetBox configurado com API token
- ✅ Redis (cache para SOAR)
- ✅ PostgreSQL (persistência)

### Rede
```yaml
# docker-compose.yml (trecho)
networks:
  soar_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

## Métricas de Sucesso

### KPIs Operacionais
| Métrica | Meta | Medição |
|---------|------|---------|
| MTTD (Detecção) | < 5 min | Timestamp alerta Wazuh |
| MTTR (Resposta) | < 30 min | Timestamp ação SOAR |
| Taxa automação | > 70% | Workflows executados/alertas |
| Falsos positivos | < 10% | Tickets fechados como "não-incidente" |

### Monitoramento
```bash
# Verificar workflows ativos
curl http://localhost:3001/api/v1/workflows

# Métricas Shuffle
docker logs shuffle-backend | grep "Workflow executed"

# Métricas n8n
docker logs n8n | grep "Workflow execution"
```

## Começando

### Opção 1: Shuffle (Recomendado para Enterprise)
```bash
cd shuffle/
docker-compose up -d
# Acesse: http://localhost:3001
```

### Opção 2: n8n (Recomendado para Prototipagem)
```bash
cd n8n/
docker-compose up -d
# Acesse: http://localhost:5678
```

## Roadmap

### Fase 1 (Atual)
- ✅ Integração Wazuh → Shuffle
- ✅ Integração Wazuh → n8n
- ✅ Criação de tickets no Odoo
- ✅ Enrichment via NetBox

### Fase 2 (Q1 2026)
- 🔄 Integração com TheHive (SIRP)
- 🔄 Machine Learning para priorização
- 🔄 Playbooks avançados (ransomware)

### Fase 3 (Q2 2026)
- 📅 Integração MISP (threat intel)
- 📅 Automação de patching
- 📅 Red team automation

## Suporte e Comunidade

### Documentação
- [Shuffle Docs](https://shuffler.io/docs)
- [n8n Docs](https://docs.n8n.io/)
- [Wazuh SOAR Integration](https://documentation.wazuh.com/current/proof-of-concept-guide/poc-integrate-soar-tools.html)

### Troubleshooting
- Logs: `docker-compose logs -f`
- Health check: `curl http://localhost:3001/api/v1/health`
- Comunidade: GitHub Issues do projeto

## Próximos Passos

1. **Escolha sua plataforma**: [Shuffle](shuffle/index.md) ou [n8n](n8n/index.md)
2. **Instale o ambiente**: Siga o guia de setup
3. **Configure a integração**: Conecte ao Wazuh
4. **Importe playbooks**: Use os templates prontos
5. **Teste e ajuste**: Adapte à sua realidade

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**Mantenedor**: Equipe NEO_NETBOX_ODOO_STACK
