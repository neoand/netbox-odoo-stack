# netbox-odoo-stack — Documentación (ES)

Documentación para aprender, implementar y operar integraciones NetBox + Odoo + neo_stack ([github.com/neoand/neo_stack](https://github.com/neoand/neo_stack)). Explicamos por qué, para qué y qué dolores resolvemos.

## Objetivos

- Explicar valor: CMDB/Inventario vivo, fuente única de verdad de red/infra, visibilidad de dependencias.
- Dolencias resueltas: datos dispersos en hojas de cálculo, falta de trazabilidad de cambios, conflictos de direccionamiento, ausencia de automatización de aprovisionamiento, integraciones débiles con ERP (Odoo).
- Enseñar cómo integrar NetBox con Odoo (activos, inventario, órdenes de servicio, costos) y con neo_stack (pipelines IaC/DevOps).
- Guiar setup, operación, troubleshooting y mejores prácticas.

## Estructura

- Contenido principal en ES está en `docs/es` (ver navegación de MkDocs).
- Configuración del sitio en `mkdocs.yml` (tema Material).

## Cómo usar

1. Instalar dependencias de docs: `pip install mkdocs mkdocs-material mkdocs-mermaid2`.
2. Ejecutar localmente: `mkdocs serve`.
3. Publicar (opcional): `mkdocs build` y servir `site/` o usar GitHub Pages.

## Contribución

- Abre issues/PRs con mejoras.
- Mantén este README y el principal (EN) alineados.
