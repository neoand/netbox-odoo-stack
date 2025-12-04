# Setup

## Requisitos previos

- Python 3.10+ (NetBox 4.x recomendado).
- Postgres 13+ y Redis.
- Conectividad para integraciones (API Odoo, pipelines neo_stack).
- Docker opcional para entorno de desarrollo.

## Instalación (ejemplo con Docker Compose)

```bash
git clone https://github.com/netbox-community/netbox-docker.git
cd netbox-docker
cp docker-compose.override.yml.example docker-compose.override.yml
# Ajusta variables: POSTGRES_*, REDIS_*, SUPERUSER_PASSWORD, ALLOWED_HOSTS
docker compose up -d
```

## Configuración posterior

- Crear usuario admin: `docker compose exec netbox /opt/netbox/netbox/manage.py createsuperuser`.
- Revisar salud de contenedores: `docker ps` (estado `healthy`).
- Ajustar `SUPERUSER_*` en `docker-compose.override.yml` si quieres automatizar la cuenta admin.

## Integración con Odoo y neo_stack

- Permitir conectividad segura entre NetBox y la API de Odoo.
- Configurar webhooks/REST/GraphQL en NetBox para eventos de activos.
- Para neo_stack, exponer endpoints o mensajes que alimenten pipelines IaC/DevOps.
