# netbox-odoo-stack — Docs (EN/PT/ES)

Documentation for integrating NetBox with Odoo and neo_stack ([github.com/neoand/neo_stack](https://github.com/neoand/neo_stack)). The goal is to explain **why**, **what pains we solve**, and **how** to operate and automate the stack.

## What this repository covers

- Value: live CMDB/IPAM, single source of truth for network/infra, dependency visibility.
- Pains solved: scattered spreadsheets, no change traceability, address conflicts, no provisioning automation, weak ERP (Odoo) integration.
- Integrations: NetBox ↔ Odoo (assets, inventory, work orders, costs) and NetBox ↔ neo_stack (IaC/DevOps pipelines).
- Guidance: setup, operations, troubleshooting, best practices.

## Documentation structure

- `docs/pt`: conteúdo em português (PT). See localized README in `docs/pt/README.md`.
- `docs/es`: contenido en español (ES). See localized README in `docs/es/README.md`.
- Site is configured via `mkdocs.yml` with the Material theme.

## Quickstart (docs)

```bash
pip install mkdocs mkdocs-material mkdocs-mermaid2
mkdocs serve
```

Build for publishing:

```bash
mkdocs build
```

Then serve `site/` (or use GitHub Pages).

## Contributing

- Open issues/PRs with proposals and corrections.
- Keep docs in all supported languages aligned (EN root, PT/ES localized README files).

## Related

- neo_stack repo: [github.com/neoand/neo_stack](https://github.com/neoand/neo_stack)
