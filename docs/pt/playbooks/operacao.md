# Playbooks de Operação

## Provisionamento de novo site

1. Criar Site/Rack/Device no NetBox com tags e custom fields obrigatórios.
2. Reservar prefixos e VLANs; associar VRF/tenant.
3. Disparar pipeline neo_stack para gerar configurações.
4. Validar estado (ping/LLDP/BGP) e registrar status no NetBox.

## Atualização de ativo

1. Editar device/interface no NetBox (serial, asset_tag, localização).
2. Webhook atualiza Odoo (produto/ativo, estoque, custo).
3. Registrar OS/ticket associado e status de conclusão.

## Resposta a incidentes

- Consultar dependências no NetBox (serviço → host → interface → rack).
- Validar mudanças recentes (webhooks/auditoria).
- Usar custom fields para marcar incidente e resolução.

## Checklist pós-change

- Confirmação de saúde dos containers e workers.
- Diff de configurações aplicado vs planejado.
- Atualização de Odoo (custos, OS) e NetBox (tags/status).
