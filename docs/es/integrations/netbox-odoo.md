# Integración NetBox ↔ Odoo

## Objetivo

- Alinear inventario técnico (NetBox) con inventario financiero/operativo (Odoo).
- Sincronizar ubicación, estado, costos y órdenes de servicio.

## Datos mapeados (ejemplos)

- NetBox Device → Producto/Activo en Odoo
- NetBox Site/Rack → Ubicación/Almacén en Odoo
- NetBox Interface/IP → Campos técnicos (custom fields) en Odoo
- Tags/Custom Fields → Categorías, centro de costo, SLA

## Estrategias de integración

1. **Webhook de NetBox → Odoo**

   - Disparar en create/update/delete de Devices, IPs, Interfaces, Racks.
   - Worker traduce payload y llama API RPC/REST de Odoo.

1. **Jobs programados**

   - Tareas periódicas para reconciliación (diff nocturno NetBox ↔ Odoo).
   - Reportar divergencias y abrir OS/ticket en Odoo.

1. **Fuente única de verdad**

   - NetBox gobierna atributos técnicos; Odoo gobierna atributos financieros/operativos.
   - Definir política de resolución de conflictos.

## Consideraciones

- Identificadores únicos: `asset_tag` en NetBox alineado a `default_code` en Odoo.
- Serial/MAC como claves auxiliares para evitar duplicados.
- Permisos: tokens separados por integración.
- Reprocesar fallos de webhook (cola/worker) y aplicar idempotencia.
