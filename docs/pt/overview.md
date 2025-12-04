# Visão geral — NetBox + Odoo + neo_stack

## Por que

- Fonte única da verdade (CMDB viva) para rede, DC e ativos.
- Reduz inconsistências de inventário (IPs duplicados, VLANs conflitantes).
- Viabiliza automação: dados estruturados alimentam pipelines (neo_stack) e ERP (Odoo).

## Para quê

- Planejamento e operação de rede/infra.
- Integração com Odoo: ativos, estoque, ordens de serviço, custos.
- Integração com neo_stack: provisionamento, drift detection, compliance.

## Dores resolvidas

- Planilhas soltas, sem rastreabilidade.
- Mudanças sem histórico/approval.
- Falta de visibilidade de dependências (serviço → app → host → IP → rack).
- Retrabalho em suporte por falta de dados consistentes.

## Componentes principais (NetBox)

- DCIM: Sites, Racks, Devices, Interfaces.
- IPAM: Prefixos, IPs, VLANs, VRFs.
- Circuits/Providers.
- Tenancy/Tags/Custom fields.
- Webhooks/Plugins/REST & GraphQL.

## Integrações alvo

- Odoo: produtos/ativos, localização, tickets/OS, custos, estoque.
- neo_stack: pipelines IaC/DevOps (Terraform/Ansible/etc.), lint/validação, PRs de mudança, notificações.
