# Troubleshooting

## Síntomas comunes

- Webhook falla (HTTP 4xx/5xx) al enviar a worker/Odoo.
- Datos divergentes entre NetBox y Odoo (activos duplicados, ubicación incorrecta).
- Pipelines neo_stack fallan por datos inválidos (prefijo duplicado, VLAN fuera de rango).

## Pasos rápidos

1. Revisar salud de contenedores: `docker compose ps` y logs de `netbox`, `worker`, `postgres`, `redis`.
2. Revisar cola de webhooks y reprocesar mensajes.
3. Ejecutar lint/validaciones de datos en NetBox (scripts/jobs).
4. Verificar tokens/secretos y conectividad (firewall, DNS, TLS).

## Herramientas útiles

- `manage.py clearsessions` y `collectstatic` para problemas de sesión/UI.
- Scripts de sincronización para reconciliar inventario.
- Dashboards de métricas/alertas para identificar patrones de fallo.

## Cuándo escalar

- Fallos recurrentes de sincronización con impacto financiero o productivo.
- Corrupción de datos o pérdida de consistencia crítica.
- Bugs en NetBox u Odoo que requieren patch/upstream.
