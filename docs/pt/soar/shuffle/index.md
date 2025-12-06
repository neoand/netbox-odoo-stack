# Shuffle - Plataforma SOAR Oficial Wazuh

> **AI Context**: Introdução ao Shuffle, plataforma SOAR oficialmente integrada ao Wazuh. Focada em automação de resposta a incidentes de segurança com interface drag-and-drop. Stack: Wazuh → Shuffle → Odoo/NetBox. Keywords: Shuffle, SOAR, Wazuh integration, security automation, workflows, SecOps.

## Visão Geral

**Shuffle** é uma plataforma SOAR (Security Orchestration, Automation and Response) open-source com integração oficial ao Wazuh. Projetada para equipes de segurança automatizarem resposta a incidentes através de workflows visuais.

### Características Principais

- **Integração Oficial Wazuh**: App nativo para receber alertas
- **400+ Apps Prontos**: Odoo, NetBox, Slack, TheHive, MISP
- **Workflow Visual**: Drag-and-drop sem necessidade de código
- **Escalável**: Suporta milhares de execuções simultâneas
- **Cloud ou On-premise**: Deploy flexível

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                 SHUFFLE COMPONENTS                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┐      ┌──────────────┐          │
│  │   Frontend    │◄────►│   Backend    │          │
│  │  (React UI)   │      │  (Golang)    │          │
│  └───────────────┘      └──────┬───────┘          │
│                                 │                   │
│  ┌───────────────┐      ┌──────▼───────┐          │
│  │   Database    │◄────►│   Orborus    │          │
│  │  (OpenSearch) │      │  (Executor)  │          │
│  └───────────────┘      └──────────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘
         ▲                           │
         │                           ▼
    ┌────┴────┐              ┌──────────────┐
    │  Wazuh  │              │ Integrações  │
    │ Webhook │              │ Odoo/NetBox  │
    └─────────┘              └──────────────┘
```

### Componentes

#### 1. Frontend
- **Porta**: 3001
- **Função**: Interface visual para criar workflows
- **Stack**: React.js, Material-UI
- **Acesso**: http://localhost:3001

#### 2. Backend
- **Porta**: 3000 (API interna)
- **Função**: Gerenciar workflows, autenticação, API
- **Stack**: Golang
- **API**: RESTful + WebSocket

#### 3. Orborus
- **Função**: Executor de workflows (worker)
- **Escalável**: Múltiplas instâncias
- **Isolamento**: Containers Docker para cada app

#### 4. Database
- **Tipo**: OpenSearch (fork do Elasticsearch)
- **Função**: Armazenar workflows, execuções, logs
- **Persistência**: Volume Docker

## Conceitos Fundamentais

### Workflows
Conjunto de ações automatizadas disparadas por um trigger.

```
Trigger → Action 1 → Action 2 → Action 3 → Result
```

**Exemplo prático**:
```
Wazuh Alert → Get Host Info (NetBox) → Create Ticket (Odoo) → Send Notification (Slack)
```

### Apps
Integrações pré-construídas com serviços externos.

**Apps principais no nosso stack**:
- **Wazuh**: Receber alertas
- **Odoo**: Criar/atualizar tickets
- **NetBox**: Consultar assets
- **HTTP**: Requisições customizadas
- **Tools**: Manipulação de dados

### Actions
Operações individuais dentro de um workflow.

**Tipos de ações**:
- **Trigger**: Inicia o workflow (webhook, schedule)
- **Apps**: Executam integrações
- **Conditions**: Decisões lógicas (if/else)
- **Filters**: Transformação de dados
- **Loops**: Iterações

### Executions
Instância de execução de um workflow.

**Estados**:
- `EXECUTING`: Em execução
- `FINISHED`: Concluído com sucesso
- `FAILED`: Falhou
- `ABORTED`: Cancelado manualmente

## Vantagens do Shuffle

### Para Equipes de Segurança
✅ **Integração nativa Wazuh**: Menos configuração, mais confiabilidade
✅ **Foco em SecOps**: Apps e templates focados em segurança
✅ **Comunidade ativa**: 10k+ stars no GitHub
✅ **Documentação rica**: Exemplos práticos de SOC

### Para Desenvolvedores
✅ **API completa**: Automação via código
✅ **Python/Bash**: Suporte a scripts customizados
✅ **Webhooks bidirecionais**: Integração com qualquer serviço
✅ **Logs detalhados**: Debug facilitado

### Para Gestão
✅ **Open-source**: Sem custos de licença
✅ **On-premise**: Dados sensíveis não saem do ambiente
✅ **Métricas**: Dashboards de automação
✅ **Compliance**: Auditoria de ações automatizadas

## Limitações e Considerações

### Curva de Aprendizado
- Interface pode parecer complexa inicialmente
- Conceitos de workflows requerem familiarização
- Debugging pode ser trabalhoso

### Performance
- OpenSearch consome RAM (~2GB mínimo)
- Execuções paralelas limitadas por recursos
- Cold start em apps pode causar delay

### Manutenção
- Atualizações podem quebrar workflows
- Apps de terceiros nem sempre estáveis
- Backup de workflows é manual (export JSON)

## Casos de Uso Recomendados

### 1. SOC Automation
```
Alertas Wazuh → Enrichment → Ticket → Resposta
```
**Complexidade**: Média
**ROI**: Alto
**Setup**: 2-4 horas

### 2. Threat Hunting
```
IOC Feed → Busca em logs → Correlação → Report
```
**Complexidade**: Alta
**ROI**: Médio
**Setup**: 1-2 dias

### 3. Compliance Reporting
```
Schedule → Coleta de evidências → Validação → PDF
```
**Complexidade**: Baixa
**ROI**: Alto
**Setup**: 4-8 horas

## Alternativas

| Plataforma | Quando Escolher |
|-----------|-----------------|
| **Shuffle** | Integração oficial Wazuh, ambiente enterprise |
| **[n8n](../n8n/index.md)** | Prototipagem rápida, fácil aprendizado |
| **TheHive/Cortex** | Gestão de casos mais complexa |
| **Demisto (Palo Alto)** | Budget disponível, suporte comercial |

## Estrutura da Documentação

1. **[Instalação e Configuração](setup.md)**
   - Docker Compose completo
   - Configuração inicial
   - Criação de API keys

2. **[Integração com Wazuh](wazuh-integration.md)**
   - Configuração em ossec.conf
   - Webhook URL format
   - Filtros e alertas

3. **[Workflows de Exemplo](workflows.md)**
   - Alerta → Enrichment → Ticket
   - Auto-block malicious IP
   - Compliance report

## Quick Start

### Instalação Rápida
```bash
# Clone o repositório do projeto
cd /opt/neoand-netbox-odoo-stack

# Inicie o Shuffle
docker-compose -f docker-compose.soar.yml up -d shuffle

# Aguarde ~30 segundos
docker logs -f shuffle-backend
```

### Primeiro Acesso
1. Abra http://localhost:3001
2. Crie conta admin (primeiro usuário)
3. Configure API key em Settings
4. Importe workflow de exemplo

### Teste Básico
```bash
# Envie webhook teste para Shuffle
curl -X POST http://localhost:3001/api/v1/hooks/webhook_EXAMPLE \
  -H "Content-Type: application/json" \
  -d '{
    "rule_id": "554",
    "rule_level": 12,
    "description": "Malware detectado - TESTE"
  }'

# Verifique execução na UI
# Workflows → Executions
```

## Recursos Adicionais

### Documentação Oficial
- [Shuffle Docs](https://shuffler.io/docs)
- [Wazuh + Shuffle Guide](https://documentation.wazuh.com/current/proof-of-concept-guide/poc-integrate-shuffle-soar.html)
- [API Reference](https://shuffler.io/docs/API)

### Comunidade
- [GitHub](https://github.com/Shuffle/Shuffle)
- [Discord](https://discord.gg/B2CBzUm)
- [YouTube Tutorials](https://www.youtube.com/@shuffleautomation)

### Templates Prontos
- [Wazuh Response Workflows](https://github.com/Shuffle/workflows)
- [Security Operations](https://shuffler.io/workflows?tags=security)

## Próximos Passos

1. **[Instalar Shuffle](setup.md)**: Configure o ambiente completo
2. **[Conectar Wazuh](wazuh-integration.md)**: Receba alertas automaticamente
3. **[Criar Workflows](workflows.md)**: Automatize respostas a incidentes

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**Compatibilidade**: Shuffle 1.3.0+, Wazuh 4.5+
