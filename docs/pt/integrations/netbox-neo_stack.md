# Integração NetBox ↔ neo_stack

## Objetivo

- Usar NetBox como fonte de dados para pipelines IaC/DevOps do neo_stack.
- Automatizar provisionamento, validação de drift e compliance usando dados confiáveis.

## Fluxo recomendado

1. Dados de rede/infra são modelados no NetBox (prefixos, VLANs, devices, interfaces, racks, relacionamentos).
2. Pipeline do neo_stack lê NetBox (REST/GraphQL) e gera planos/aplicações (Terraform/Ansible/etc.).
3. Resultados e diffs são publicados de volta no NetBox (custom fields, tags, status) e em canais de notificação.

## Checks essenciais

- Lint de dados: prefixos sobrepostos, VLANs duplicadas, requisitos de naming convention.
- Validação de dependências: serviço → app → host → interface → IP → rack.
- Drift detection: comparação de estado real (facts) vs modelo no NetBox.

## Boas práticas

- Definir contratos de dados (schemas) para endpoints NetBox usados pelo neo_stack.
- Adicionar webhooks para eventos críticos (ex.: novo prefixo → trigger pipeline de reservas).
- Garantir idempotência e retries em pipelines.
- Versionar templates e mapeamentos (Jinja/Ansible/Terraform) junto com schemas de NetBox.

## Próximos passos

- Catálogo de jobs do neo_stack que consomem NetBox.
- Matriz de validações (lint) e indicadores de conformidade.
- Exemplo de pipeline end-to-end (commit → lint NetBox → gerar plano → aplicar → feedback).
