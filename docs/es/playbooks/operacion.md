# Playbooks de Operación

## Provisionar nuevo sitio

1. Crear Site/Rack/Device en NetBox con tags y custom fields requeridos.
2. Reservar prefijos y VLANs; asociar VRF/tenant.
3. Disparar pipeline neo_stack para generar configuraciones.
4. Validar estado (ping/LLDP/BGP) y registrar en NetBox.

## Actualización de activo

1. Editar dispositivo/interfaz en NetBox (serial, asset_tag, ubicación).
2. Webhook actualiza Odoo (producto/activo, inventario, costo).
3. Registrar OS/ticket y estado.

## Respuesta a incidentes

- Consultar dependencias en NetBox (servicio → host → interfaz → rack).
- Revisar cambios recientes (webhooks/auditoría).
- Marcar incidente y resolución con custom fields/tags.

## Checklist post-change

- Salud de contenedores y workers.
- Diff de configuraciones aplicadas vs planificadas.
- Actualización en Odoo (costos, OS) y NetBox (tags/estado).
