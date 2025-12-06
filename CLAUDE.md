# CLAUDE.md - Claude Code Project Context

> **Este arquivo fornece contexto específico para Claude Code trabalhar neste projeto.**

---

## Visão Geral do Projeto

Este é o **NEO_NETBOX_ODOO_STACK v2.0**, uma plataforma integrada de gestão de infraestrutura de TI que combina:

- **Odoo 19 Community** + módulos OCA (ERP, ITSM, Helpdesk)
- **NetBox 4.2** (CMDB, IPAM)
- **Wazuh 4.12** (SIEM, XDR)
- **Shuffle + n8n** (SOAR)

## Localização dos Arquivos Principais

```
/Users/andersongoliveira/neo_netbox_odoo_stack/neoand-netbox-odoo-stack/
├── AI_CONTEXT.md          # Contexto completo para LLMs
├── docker-compose.yml     # Orquestração (em lab/)
├── mkdocs.yml             # Configuração documentação
├── docs/pt/               # Documentação em Português
├── docs/es/               # Documentação em Espanhol
├── addons/                # Módulos Odoo (OCA + custom)
└── config/                # Configurações dos serviços
```

## Comandos Úteis

```bash
# Subir o ambiente
cd lab && docker-compose up -d

# Logs
docker logs -f odoo19
docker logs -f netbox
docker logs -f wazuh-manager

# Documentação local
cd /path/to/project && mkdocs serve

# Instalar módulo OCA
docker exec -it odoo19 odoo -d odoo -i helpdesk_mgmt --stop-after-init
```

## Padrões de Código

### Python/Odoo
- Python 3.11+
- Type hints obrigatórios
- Pydantic para validação
- queue_job para async

### Documentação
- MkDocs Material
- Bilíngue: PT (principal) + ES
- AI-first: contexto claro para LLMs
- Exemplos de código em todos os guias

## Tarefas Prioritárias

1. **Documentação ES incompleta**: Wazuh 95% faltando, Quick-refs 65% faltando
2. **Módulos OCA**: Documentar instalação e configuração de cada um
3. **Integrações**: Criar módulos custom wazuh_integration e netbox_sync
4. **SOAR**: Documentar workflows Shuffle e n8n

## Decisões Técnicas Tomadas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Odoo Version | 19 | AI nativo, OWL framework |
| Helpdesk | Híbrido | helpdesk_mgmt dev, project.task prod |
| SOAR | Shuffle + n8n | Ambos documentados |
| Linguagens Doc | PT + ES | Times BR e MX |

## Links Importantes

- [Odoo 19 Docs](https://www.odoo.com/documentation/19.0/)
- [OCA GitHub](https://github.com/OCA)
- [NetBox Docs](https://netboxlabs.com/docs/netbox/)
- [Wazuh Docs](https://documentation.wazuh.com/)
- [Shuffle Docs](https://shuffler.io/docs)
- [n8n Docs](https://docs.n8n.io/)

## Contexto AI-First

Este projeto é **AI-First**, significando:

1. **Documentação estruturada** para consumo por LLMs
2. **Contexto claro** em cada arquivo (seções AI Context)
3. **Exemplos completos** que podem ser copiados
4. **Arquivos de contexto** (AI_CONTEXT.md, CLAUDE.md)
5. **Comentários explicativos** no código

Ao criar ou modificar documentação, sempre inclua:

```markdown
> **AI Context**: [Breve descrição do propósito desta seção]
```

## Estrutura de Documentação

```
docs/
├── pt/                              # Português (Brasil)
│   ├── 00-getting-started/          # Início rápido
│   ├── 01-architecture/             # Arquitetura
│   ├── 02-installation/             # Instalação
│   ├── 03-odoo-oca/                 # Odoo + OCA
│   │   ├── index.md
│   │   ├── helpdesk/
│   │   ├── project/
│   │   ├── rest-framework/
│   │   └── ...
│   ├── 04-netbox/                   # NetBox
│   ├── 05-wazuh/                    # Wazuh SIEM
│   ├── 06-integrations/             # Integrações
│   ├── 07-soar/                     # SOAR (Shuffle/n8n)
│   ├── 08-operations/               # Operações
│   ├── 09-development/              # Desenvolvimento
│   ├── 10-api-reference/            # APIs
│   └── 99-appendix/                 # Apêndices
│
└── es/                              # Español (México) - Espelho
```

## Ao Modificar Este Projeto

1. **Sempre** atualize PT e ES simultaneamente
2. **Sempre** mantenha AI_CONTEXT.md atualizado
3. **Sempre** inclua exemplos de código funcionais
4. **Sempre** documente APIs com request/response examples
5. **Sempre** use tabelas para referências rápidas

## Não Fazer

- ❌ Criar documentação só em um idioma
- ❌ Código sem type hints
- ❌ Documentação sem exemplos
- ❌ Alterar docker-compose sem documentar
- ❌ Ignorar padrões OCA para módulos Odoo
