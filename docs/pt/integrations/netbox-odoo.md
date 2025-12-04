# Integração NetBox ↔ Odoo

## Objetivo

- Manter inventário técnico (NetBox) alinhado ao inventário financeiro/estoque (Odoo).
- Sincronizar localização física, status, custos e histórico de ordens de serviço.

## Dados mapeados (exemplos)

- NetBox Device → Odoo Produto/Ativo
- NetBox Site/Rack → Odoo Localização/Armazém
- NetBox Interface/IP → Campos técnicos em Odoo (custom fields)
- Tags/Custom Fields → Categorias, centro de custo, SLA

## Estratégias de integração

1. **Webhook do NetBox → Odoo**

- Disparar em create/update/delete de Devices, IPs, Interfaces, Racks.
- Worker recebe evento, traduz para modelo Odoo e chama API RPC/REST.

1. **Jobs/Agendamentos**

- Tarefas periódicas para reconciliação (ex.: nightly diff NetBox ↔ Odoo).
- Reportar divergências e abrir OS/ticket no Odoo.

1. **Single Source of Truth**

- NetBox mantém atributos técnicos; Odoo mantém atributos financeiros/operacionais.
- Em caso de conflito, defina política (ex.: NetBox vence para atributos técnicos).

## Considerações práticas

- Códigos únicos: use `asset_tag` no NetBox alinhado ao `default_code` no Odoo.
- Serial e MAC como chaves auxiliares para evitar duplicidades.
- Controle de permissões: tokens de API separados por integração.
- Monitorar falhas de webhook e reprocessar mensagens (fila/worker).

## Próximos passos

- Definir schema de custom fields em ambos os lados.
- Criar POC com webhook → worker → Odoo (RPC) cobrindo create/update/delete.
- Medir latência e confiabilidade; adicionar retries/idempotência.
