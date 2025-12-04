# Arquitectura

## Vista de alto nivel

- NetBox como CMDB/IPAM central (fuente única de verdad).
- Odoo como ERP para inventario financiero, activos y órdenes de servicio.
- neo_stack como capa de automatización (CI/CD de infraestructura, lint, provisionamiento, notificaciones).

## Flujos principales

1. Datos maestros en NetBox (sitios, racks, dispositivos, interfaces, IPs, VLANs, VRFs).
2. Eventos o jobs sincronizan activos y ubicaciones con Odoo (productos, lotes/serie, centros de costo).
3. neo_stack consume NetBox para generar planes de cambio (IaC), validar drift y aplicar via pipelines.
4. Resultados se registran en NetBox (custom fields, tags) y en Odoo (costos/OS) según aplique.

## Componentes

- **API NetBox (REST/GraphQL)**: lectura/escritura y webhooks.
- **Plugins NetBox**: triggers personalizados, jobs programados.
- **Odoo RPC/REST**: creación/actualización de productos, inventario, tickets/OS.
- **CI/CD (neo_stack)**: pipelines de lint, generación de configs, despliegue y notificaciones.

## Seguridad

- Control de acceso por grupos/perfiles en NetBox.
- Tokens por integración (Odoo, neo_stack).
- TLS y aislamiento de red; secretos en vault/CI.

## Observabilidad

- Logs de webhook/API para auditoría.
- Métricas y healthchecks de contenedores (NetBox, Redis, Postgres, workers).
- Alertas ante fallas de sync o drift detectado.
