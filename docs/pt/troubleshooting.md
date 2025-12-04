# Troubleshooting

## Sintomas comuns

- Webhook falha (HTTP 4xx/5xx) ao enviar para worker/Odoo.
- Dados divergentes entre NetBox e Odoo (ativos duplicados, localização incorreta).
- Pipelines neo_stack quebrando por dados inválidos (prefixo duplicado, VLAN fora do range).

## Passos rápidos

1. Conferir saúde dos containers: `docker compose ps` e logs de `netbox`, `worker`, `postgres`, `redis`.
2. Revisar fila de webhooks e reprocessar mensagens.
3. Rodar lint/validações de dados no NetBox (scripts/jobs planejados).
4. Checar tokens/segredos e conectividade (firewall, DNS, TLS).

## Ferramentas úteis

- `manage.py clearsessions` e `collectstatic` para problemas de sessão/UI.
- Scripts de sync para reconciliar inventário.
- Dashboard de métricas/alertas (apm/logging) para identificar padrão de falha.

## Quando escalar

- Falhas recorrentes de sync com impacto financeiro (estoque/OS) ou de produção.
- Corrupção de dados ou perda de consistência (prefixos/IPs duplicados críticos).
- Bugs no NetBox ou Odoo que exigem patch/upstream.
