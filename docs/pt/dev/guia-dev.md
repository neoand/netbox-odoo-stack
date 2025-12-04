# Guia de Dev & Operação

## Stack de ferramentas

- NetBox 4.x
- Postgres, Redis
- Docker/Compose para dev
- Python 3.10+, Poetry/pipenv ou venv
- CI/CD (neo_stack), GitHub Actions

## Setup de ambiente local

1. Criar venv: `python -m venv .venv && source .venv/bin/activate`.
2. Instalar deps de docs: `pip install mkdocs mkdocs-material mkdocs-mermaid2`.
3. Para NetBox: seguir `docs/pt/setup.md` (docker-compose) ou instalação manual.
4. Configurar variáveis `.env` (tokens NetBox/Odoo, DB, Redis).

## Convenções de código

- PEP8/ruff para Python; `pre-commit` recomendado.
- Tipagem gradual (mypy quando aplicável).
- Estruturar jobs/plugins de NetBox com testes unitários.
- Logs estruturados e correlação de requests.

## Fluxo de contribuição

- Branch feature -> PR -> revisão -> merge.
- Adicionar docs e exemplos em `docs/` para cada integração ou job novo.
- Testes: unitários + integração (mock de APIs Odoo/NetBox quando possível).

## Observabilidade e suporte

- Healthchecks dos containers (NetBox, workers) expostos.
- Dashboards para filas de webhook/eventos.
- Alertas de falha de sincronização ou lint crítico.
