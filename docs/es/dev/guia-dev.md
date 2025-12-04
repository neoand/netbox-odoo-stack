# Guía de Dev y Operación

## Stack de herramientas

- NetBox 4.x
- Postgres, Redis
- Docker/Compose para dev
- Python 3.10+, Poetry/pipenv o venv
- CI/CD (neo_stack), GitHub Actions

## Setup local

1. Crear venv: `python -m venv .venv && source .venv/bin/activate`.
2. Instalar deps de docs: `pip install mkdocs mkdocs-material mkdocs-mermaid2`.
3. Para NetBox: sigue `docs/es/setup.md` (docker-compose) o instalación manual.
4. Configurar `.env` con tokens NetBox/Odoo y accesos a DB/Redis.

## Convenciones

- PEP8/ruff para Python; `pre-commit` recomendado.
- Tipado gradual (mypy donde aplique).
- Jobs/plugins de NetBox con pruebas unitarias.
- Logs estructurados y correlación de requests.

## Flujo de contribución

- Rama feature → PR → revisión → merge.
- Añadir docs y ejemplos en `docs/` para cada integración/job.
- Pruebas unitarias e integración (mock de APIs Odoo/NetBox cuando sea posible).

## Observabilidad

- Healthchecks de contenedores y workers.
- Dashboards de colas/eventos de webhook.
- Alertas ante fallas de sync o lint crítico.
