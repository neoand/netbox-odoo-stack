# Trilha de aprendizado

## Fundamentos

- Conceitos de CMDB/IPAM (NetBox): Sites, Racks, Devices, Interfaces, Prefixos, VLANs, VRFs.
- APIs REST/GraphQL do NetBox, webhooks e plugins.
- Conceitos de ERP Odoo: produtos, inventário, ordens de serviço, centros de custo.

## Prática guiada

1. Subir NetBox via Docker e criar o primeiro site/rack/device.
2. Configurar webhook simples que envia payload para um worker mock.
3. Criar protótipo de sync Device → Produto no Odoo.
4. Integrar pipeline neo_stack que lê NetBox e gera um plano Ansible/Terraform.

## Avançado

- Lint e validação de dados (scripts/jobs NetBox).
- Drift detection e compliance contínua.
- Observabilidade: métricas, tracing, alertas para integrações.
- Hardening e RBAC para integrações.

## Recursos recomendados

- Documentação oficial NetBox (API/Plugins/GraphQL).
- Odoo RPC/REST docs e exemplos de módulos.
- Guia do netbox-docker e wiki de operações.
- Repositório neo_stack para pipelines de referência.
