# Setup

## Pré-requisitos

- Python 3.10+ (NetBox 4.x recomendado).
- Postgres 13+ e Redis.
- Acesso de rede para integrações (Odoo API, pipelines neo_stack).
- Docker opcional para ambiente de dev.

## Instalação (exemplo Docker Compose)

```bash
git clone https://github.com/netbox-community/netbox-docker.git
cd netbox-docker
cp docker-compose.override.yml.example docker-compose.override.yml
# Ajuste env vars: POSTGRES_*, REDIS_*, SUPERUSER_PASSWORD, ALLOWED_HOSTS
docker compose up -d
```

## Configuração pós-instalação

- Criar usuário admin: `docker compose exec netbox /opt/netbox/netbox/manage.py createsuperuser`.
- Validar saúde dos containers: `docker ps` (estado `healthy`).
- Ajustar variáveis `SUPERUSER_*` no `docker-compose.override.yml` para automação do admin.

## Integração com Odoo e neo_stack

- Libere conectividade (firewall/VPN) entre NetBox e Odoo API.
- Configure webhooks/REST/GraphQL no NetBox para disparar eventos de criação/atualização de ativos.
- Para neo_stack, exponha endpoints ou mensagens (ex.: webhook) que alimentem pipelines IaC/DevOps.
