# netbox-odoo-stack — Documentação (PT)

Documentação para aprender, implementar e operar integrações NetBox + Odoo + neo_stack ([github.com/neoand/neo_stack](https://github.com/neoand/neo_stack)). Explicamos por que, para que e quais dores resolvemos.

## Objetivos

- Explicar valor: CMDB/Inventário vivo, fonte única de verdade de rede/infra, visibilidade de dependências.
- Mostrar dores resolvidas: dados espalhados em planilhas, falta de rastreabilidade de mudanças, conflitos de endereçamento, ausência de automação de provisionamento, falta de integrações com ERP (Odoo).
- Ensinar como integrar NetBox com Odoo (ativos, estoque, ordens de serviço, custos) e com neo_stack (pipelines IaC/DevOps).
- Guiar setup, operação, troubleshooting e melhores práticas.

## Estrutura

- Conteúdo principal em PT está em `docs/pt` (ver navegação do MkDocs).
- Configuração do site em `mkdocs.yml` (tema Material).

## Como usar

1. Instale dependências de docs: `pip install mkdocs mkdocs-material mkdocs-mermaid2`.
2. Rodar local: `mkdocs serve`.
3. Publicar (opcional): `mkdocs build` e sirva `site/` ou use GitHub Pages.

## Contribuição

- Abra issues/PRs com melhorias.
- Mantenha este README e o principal (EN) alinhados.
