# n8n - Plataforma de Automação Low-Code

> **AI Context**: Introdução ao n8n como alternativa flexível ao Shuffle para automação SOAR. Focado em facilidade de uso e prototipagem rápida. Stack: Wazuh → n8n → Odoo/NetBox. Keywords: n8n, workflow automation, low-code, SOAR alternative, Wazuh webhooks, rapid prototyping.

## Visão Geral

**n8n** (n-eight-n) é uma plataforma de automação low-code open-source que pode ser usada como alternativa ao Shuffle para orquestração de resposta a incidentes.

### Por Que n8n?

- **Curva de aprendizado suave**: Interface intuitiva, fácil para iniciantes
- **Prototipagem rápida**: Criar workflows em minutos, não horas
- **400+ integrações nativas**: Odoo, HTTP, PostgreSQL, etc.
- **Comunidade ativa**: 40k+ stars no GitHub
- **Self-hosted**: Controle total dos dados

## Shuffle vs n8n

| Aspecto | Shuffle | n8n |
|---------|---------|-----|
| **Foco** | Security Operations | Automação geral |
| **Interface** | Específica SOAR | Drag-and-drop visual |
| **Curva aprendizado** | Íngreme (conceitos SOAR) | Suave (intuitivo) |
| **Wazuh** | Integração oficial | Via webhook HTTP |
| **Debugging** | Médio (logs) | Excelente (UI visual) |
| **Performance** | Alta | Muito alta |
| **Comunidade** | 10k users (SecOps) | 40k users (geral) |
| **Best for** | SOC enterprise | Prototipagem rápida |

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   N8N COMPONENTS                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┐      ┌──────────────┐          │
│  │   Frontend    │◄────►│   Backend    │          │
│  │  (Vue.js UI)  │      │  (Node.js)   │          │
│  └───────────────┘      └──────┬───────┘          │
│                                 │                   │
│  ┌───────────────┐      ┌──────▼───────┐          │
│  │   Database    │◄────►│   Queue      │          │
│  │  (PostgreSQL) │      │   (Redis)    │          │
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

#### 1. Frontend (UI)
- **Porta**: 5678
- **Função**: Interface visual para criar workflows
- **Stack**: Vue.js 3
- **Acesso**: http://localhost:5678

#### 2. Backend (Engine)
- **Função**: Execução de workflows, gerenciamento de credenciais
- **Stack**: Node.js + TypeScript
- **API**: RESTful

#### 3. Database
- **Tipo**: PostgreSQL (ou SQLite para dev)
- **Função**: Armazenar workflows, execuções, credenciais
- **Persistência**: Volume Docker

#### 4. Queue (Opcional)
- **Tipo**: Redis ou BullMQ
- **Função**: Fila de execuções para alta carga
- **Uso**: Produção com >100 execuções/min

## Conceitos Fundamentais

### Workflows
Automação visual com nós conectados.

```
Trigger → Node 1 → Node 2 → Node 3
```

**Exemplo prático**:
```
Webhook (Wazuh) → HTTP Request (NetBox) → HTTP Request (Odoo) → Send Email
```

### Nodes
Blocos de construção de workflows.

**Tipos principais**:
- **Trigger Nodes**: Iniciam workflow (Webhook, Schedule, Manual)
- **Regular Nodes**: Ações intermediárias (HTTP, Function, IF)
- **Output Nodes**: Enviam resultados (Email, Slack, Database)

### Executions
Histórico de execuções de workflows.

**Características**:
- Inspeção visual de dados em cada nó
- Retry automático em caso de falha
- Logs detalhados

### Credentials
Armazenamento seguro de API keys e tokens.

**Tipos**:
- HTTP Basic Auth
- OAuth2
- API Key
- Custom credentials

## Vantagens do n8n

### Para Analistas de Segurança
✅ **Interface visual**: Ver fluxo de dados entre sistemas
✅ **Debugging fácil**: Inspeção de cada nó em tempo real
✅ **Templates prontos**: Library com 1000+ workflows
✅ **Documentação rica**: Exemplos práticos para cada node

### Para Desenvolvedores
✅ **JavaScript nativo**: Function nodes com sintaxe familiar
✅ **Extensível**: Criar custom nodes facilmente
✅ **API completa**: Automação via código
✅ **Webhooks flexíveis**: Múltiplos webhooks por workflow

### Para Gestão
✅ **Open-source**: Licença Sustainable Use (free para self-hosted)
✅ **ROI rápido**: Prototipagem em horas, não dias
✅ **Métricas**: Dashboards de execuções e performance
✅ **Escalável**: Queue Redis para alta carga

## Limitações e Considerações

### Segurança
- Credenciais em PostgreSQL (criptografadas, mas atenção)
- Webhooks públicos por padrão (configurar autenticação)
- Logs podem conter dados sensíveis

### Performance
- Node.js single-threaded (usar queue para paralelismo)
- Workflows longos podem travar UI
- PostgreSQL pode virar gargalo (>10k execuções/dia)

### Manutenção
- Atualizações podem quebrar custom nodes
- Community nodes nem sempre mantidos
- Backup manual de workflows (export JSON)

## Casos de Uso Recomendados

### 1. Prototipagem de SOAR
```
Teste rápido de integrações antes de implementar no Shuffle
```
**Complexidade**: Baixa
**ROI**: Alto
**Setup**: 30 minutos

### 2. Automações Simples
```
Wazuh → Check IP → Create Ticket → Notify
```
**Complexidade**: Baixa
**ROI**: Muito alto
**Setup**: 1-2 horas

### 3. Integrações Customizadas
```
Múltiplas fontes de dados → Enriquecimento → Decisão → Ação
```
**Complexidade**: Média
**ROI**: Alto
**Setup**: 4-8 horas

## Quando Escolher n8n

### Use n8n se:
- ✅ Você precisa prototipar rapidamente
- ✅ Equipe prefere interfaces visuais
- ✅ Orçamento limitado (menos recursos de hardware)
- ✅ Integrações além de segurança (marketing, vendas)
- ✅ Facilidade de uso > features avançadas

### Use Shuffle se:
- ✅ Foco exclusivo em SecOps
- ✅ Integração oficial Wazuh importante
- ✅ Equipe experiente em SOAR
- ✅ Complexidade de workflows alta
- ✅ Enterprise com budget para infraestrutura

## Estrutura da Documentação

1. **[Instalação e Configuração](setup.md)**
   - Docker Compose completo
   - Configuração de credenciais
   - Webhook setup

2. **[Integração com Wazuh](wazuh-integration.md)**
   - Configuração em ossec.conf
   - Webhook authentication
   - Filtros e parsing

3. **[Workflows de Exemplo](workflows.md)**
   - Alerta → Enrichment → Ticket
   - Auto-remediation
   - Compliance checks

## Quick Start

### Instalação Rápida
```bash
# Clone o repositório do projeto
cd /opt/neoand-netbox-odoo-stack

# Inicie o n8n
docker-compose -f docker-compose.soar.yml up -d n8n

# Aguarde ~10 segundos
docker logs -f n8n
```

### Primeiro Acesso
1. Abra http://localhost:5678
2. Crie conta owner (primeiro usuário)
3. Crie workflow "Test Wazuh"
4. Adicione node **Webhook**
5. Copie URL do webhook

### Teste Básico
```bash
# Envie webhook teste para n8n
curl -X POST http://localhost:5678/webhook-test/wazuh \
  -H "Content-Type: application/json" \
  -d '{
    "rule": {
      "id": "554",
      "level": 12,
      "description": "Malware detectado - TESTE"
    },
    "agent": {
      "name": "test-server",
      "ip": "192.168.1.99"
    }
  }'

# Verifique execução na UI
# Executions → Ver detalhes
```

## Diferencial: Debugging Visual

### Shuffle
```
Logs textuais:
[2025-12-05 15:00:00] Workflow started
[2025-12-05 15:00:01] Action 1 executed
[2025-12-05 15:00:02] Error in Action 2: Connection timeout
```

### n8n
```
Interface visual mostra:
┌──────────┐   ✓   ┌──────────┐   ✗   ┌──────────┐
│ Webhook  │──────►│ NetBox   │──────►│  Odoo    │
└──────────┘       └──────────┘       └──────────┘
    200 OK         {device: {...}}    Connection timeout

# Clique em cada nó para ver dados JSON completos
```

## Recursos Adicionais

### Documentação Oficial
- [n8n Docs](https://docs.n8n.io/)
- [Workflow Templates](https://n8n.io/workflows/)
- [API Reference](https://docs.n8n.io/api/)

### Comunidade
- [GitHub](https://github.com/n8n-io/n8n)
- [Forum](https://community.n8n.io/)
- [Discord](https://discord.gg/n8n)

### Templates de Segurança
- [Security Automation](https://n8n.io/workflows/?categories=Security)
- [Incident Response](https://n8n.io/workflows/?search=incident)

## Próximos Passos

1. **[Instalar n8n](setup.md)**: Configure o ambiente completo
2. **[Conectar Wazuh](wazuh-integration.md)**: Receba alertas automaticamente
3. **[Criar Workflows](workflows.md)**: Automatize respostas a incidentes

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**Compatibilidade**: n8n 1.19.0+, Wazuh 4.5+
