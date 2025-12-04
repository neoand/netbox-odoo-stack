# Arquitetura

## Visão de alto nível

- NetBox como CMDB/IPAM central (fonte única de verdade).
- Odoo como ERP para estoque, ativos financeiros e ordens de serviço.
- neo_stack como camada de automação (CI/CD de infraestrutura, lint, provisionamento e notificações).

## Fluxos principais

1. Dados mestres em NetBox (sites, racks, devices, interfaces, IPs, VLANs, VRFs).
2. Eventos ou jobs sincronizam ativos e localizações com Odoo (produtos, lotes/serial, centros de custo).
3. neo_stack consome NetBox para gerar planos de mudança (IaC), validar drift e aplicar via pipelines.
4. Retornos de execução são registrados em NetBox (custom fields, tags) e, quando aplicável, em Odoo (custos/OS).

## Componentes e integrações

- **API NetBox (REST/GraphQL)**: leitura/escrita de objetos, webhooks.
- **Plugins NetBox**: triggers customizados, jobs agendados.
- **Odoo RPC/REST**: criação/atualização de produtos, inventário, tickets/OS.
- **CI/CD (neo_stack)**: pipelines de lint (NetBox data), geração de configs, deploy, notificações.

## Segurança e acesso

- Controle de acesso baseado em grupos/perfis no NetBox.
- Tokens/keys específicos por integração (Odoo, neo_stack).
- TLS para APIs e isolamento de rede (segredos em vault/CI).

## Observabilidade

- Logs de webhook/API para auditoria de mudanças.
- Métricas e healthchecks de containers (NetBox, Redis, Postgres, workers).
- Alertas em falhas de sync ou drift detectado.
