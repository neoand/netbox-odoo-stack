# Ruta de aprendizaje

## Fundamentos

- Conceptos de CMDB/IPAM (NetBox): Sites, Racks, Devices, Interfaces, Prefijos, VLANs, VRFs.
- APIs REST/GraphQL de NetBox, webhooks y plugins.
- Conceptos de ERP Odoo: productos, inventario, órdenes de servicio, centros de costo.

## Práctica guiada

1. Levantar NetBox con Docker y crear el primer sitio/rack/dispositivo.
2. Configurar un webhook que envíe payload a un worker mock.
3. Prototipo de sync Device → Producto en Odoo.
4. Integrar pipeline neo_stack que lea NetBox y genere un plan Ansible/Terraform.

## Avanzado

- Lint y validación de datos (scripts/jobs NetBox).
- Detección de drift y compliance continua.
- Observabilidad: métricas, tracing, alertas para integraciones.
- Hardening y RBAC para integraciones.

## Recursos recomendados

- Documentación oficial NetBox (API/Plugins/GraphQL).
- Docs de Odoo RPC/REST y ejemplos de módulos.
- Guía de netbox-docker y wiki de operaciones.
- Repositorio neo_stack para pipelines de referencia.
