# Documentação do TheHive - Índice

## 📋 Sobre Esta Seção

Esta seção contém a documentação completa e didática para o **TheHive**, a plataforma open-source de resposta a incidentes (Incident Response) para SOC.

## 📚 Documentação Principal

### 📖 [thehive.md](thehive.md) - Guia Completo

Documentação abrangente dividida em 8 seções principais:

1. **Introdução ao TheHive**
   - O que é TheHive
   - Para que serve
   - Casos de uso
   - Benefícios

2. **Arquitetura e Integração**
   - Integração na stack NeoAnd
   - Arquitetura técnica
   - Relação com Cortex e MISP

3. **Instalação e Configuração**
   - Requisitos do sistema
   - Instalação detalhada (Docker e Manual)
   - Configuração inicial
   - Configuração com Docker

4. **Configuração Avançada**
   - Configuração do TheHive (application.conf)
   - Integração com Elasticsearch
   - Templates de casos
   - Usuários e permissões

5. **Casos de Uso Práticos**
   - Workflow de incident response
   - Gerenciamento de alertas
   - Colaboração em equipes
   - Relatórios e métricas

6. **Integração com NeoAnd**
   - Conexão com Cortex
   - Integração com MISP
   - Configuração com Elastic
   - Webhooks e APIs

7. **Operação e Manutenção**
   - Backup e recovery
   - Monitoramento
   - Performance tuning
   - Troubleshooting

8. **Segurança**
   - Configuração de segurança
   - Autenticação (LDAP, SAML, OAuth2)
   - Auditoria
   - Hardening

## 🚀 Quick Start

```bash
# Iniciar rapidamente com Docker
cd /opt/thehive
docker-compose up -d

# Acessar interface web
# http://localhost:9000
# Usuário: admin@thehive.local
# Senha: secret
```

## 🛠️ Comandos Essenciais

### Docker
```bash
# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f thehive

# Parar serviços
docker-compose down

# Reiniciar
docker-compose restart
```

### API REST
```bash
# Login
curl -X POST "http://localhost:9000/api/user/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@thehive.local","password":"secret"}'

# Listar casos
curl -X GET "http://localhost:9000/api/case/_search" \
  -H "Authorization: Bearer <TOKEN>"
```

## 📁 Estrutura de Arquivos

```
thehive/
├── thehive.md          # Documentação principal
├── README.md           # Este arquivo
└── scripts/            # Scripts úteis (se necessário)
```

## 🎯 Público-Alvo

- **Analistas SOC**: Operadores de centro de operações de segurança
- **Administradores**: Responsáveis pela manutenção da plataforma
- **Engenheiros**: Integradores e desenvolvedores
- **Gerentes de Segurança**: Gestores de equipes SOC

## 🔗 Links Úteis

- [Site Oficial](https://thehive-project.org/)
- [GitHub](https://github.com/TheHive-Project/TheHive)
- [Documentação](https://docs.thehive-project.org/)
- [Cortex](https://github.com/TheHive-Project/Cortex-Analyzers)
- [MISP](https://www.misp-project.org/)

## 📊 Integração na Stack NeoAnd

O TheHive integra-se perfeitamente com:

- **NetBox** → Enriquecimento com dados de rede
- **Wazuh** → Alertas automatizados via webhook
- **Odoo** → Sincronização de tickets e SLAs
- **Cortex** → Análise automatizada de IOCs
- **MISP** → Threat intelligence
- **Elasticsearch** → Consulta de logs e eventos

## 🤝 Contribuição

Para contribuir com melhorias na documentação:

1. Edite o arquivo `thehive.md`
2. Mantenha o formato e estrutura
3. Adicione exemplos práticos
4. Teste os comandos fornecidos
5. Faça commit com mensagem descritiva

## 📝 Licença

Esta documentação segue a licença do projeto NeoAnd Stack.

---

**Última atualização**: 2024-01-15
**Versão**: 1.0.0
