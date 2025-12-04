# Integración NetBox ↔ neo_stack

## Objetivo

- Usar NetBox como fuente de datos para pipelines IaC/DevOps en neo_stack.
- Automatizar provisionamiento, validación de drift y compliance.

## Flujo recomendado

1. Modelar datos de red/infra en NetBox (prefijos, VLANs, dispositivos, interfaces, racks, relaciones).
2. Pipeline de neo_stack lee NetBox (REST/GraphQL) y genera planes/aplicaciones (Terraform/Ansible/etc.).
3. Publicar resultados en NetBox (custom fields, tags, estado) y notificaciones.

## Validaciones clave

- Lint de datos: prefijos solapados, VLANs duplicadas, convenciones de nombres.
- Dependencias: servicio → app → host → interfaz → IP → rack.
- Drift detection: estado real vs modelo en NetBox.

## Buenas prácticas

- Contratos de datos (schemas) para endpoints usados por neo_stack.
- Webhooks para eventos críticos (ej.: nuevo prefijo → pipeline de reservas).
- Idempotencia y retries en pipelines.
- Versionar templates y mapeos junto con los schemas de NetBox.

## Próximos pasos

- Catálogo de jobs de neo_stack que consumen NetBox.
- Matriz de validaciones y KPIs de conformidad.
- Ejemplo de pipeline end-to-end (commit → lint NetBox → plan → apply → feedback).
