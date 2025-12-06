# 📝 Changelog - Wazuh Documentation v2.0

> **AI Context**: Registro de alterações da documentação Wazuh para o NEO Stack v2.0. Atualização completa para Wazuh 4.12+ com novas integrações SOAR (Shuffle/n8n) e Odoo 19.

---

## 🎉 **v2.0.0** - 2025-12-05

### ✅ **Atualizações Principais**

#### **1. Atualização para Wazuh 4.12+**

- ✅ README.md atualizado com versão 4.12
- ✅ Novos recursos documentados:
  - **eBPF FIM** (File Integrity Monitoring com eBPF no Linux)
  - **CTI Links** diretos para threat intelligence
  - **Hot Reload** de configurações sem reiniciar
  - **OpenSearch 2.x** como backend de indexação
  - **AWS Security Hub** integration
  - **Azure Sentinel** integration

#### **2. Novos Arquivos Criados**

##### **Regras Customizadas**
- 📄 `/rules/custom-rules.md` (23KB)
  - Regras XML completas para o NEO Stack
  - Detecção de anomalias NetBox
  - Integração Odoo (authentication, data access, module installation)
  - Triggers SOAR para Shuffle
  - Webhooks para n8n
  - Exemplos de payloads
  - Scripts de teste
  - Dashboard Kibana/OpenSearch

##### **Integração Shuffle SOAR**
- 📄 `/integrations/shuffle.md` (18KB)
  - Parceria oficial Wazuh-Shuffle (Set/2025)
  - Instalação Docker completa
  - 3 workflows prontos:
    1. Malware Auto-Response
    2. Vulnerability Remediation
    3. Brute Force Auto-Block
  - Apps integrados (NetBox, Odoo, VirusTotal, Slack)
  - Código Python para app NetBox custom
  - Troubleshooting completo
  - Métricas Prometheus

##### **Integração n8n**
- 📄 `/integrations/n8n.md` (22KB)
  - Workflow automation open source
  - Instalação Docker com PostgreSQL + Redis
  - Workflow completo: Auto-Ticketing Odoo
    - 6 nodes configurados (Webhook → Parse → NetBox → Extract → Odoo → Slack)
    - JSON completo exportável
  - Workflow: Vulnerability Report Generator (com geração de PDF)
  - Troubleshooting detalhado
  - Métricas e monitoramento

##### **Integração Odoo 19**
- 📄 `/integrations/odoo.md` (19KB)
  - Módulo Odoo custom completo: `wazuh_integration`
  - Estrutura completa do módulo Python
  - Model `wazuh.alert` com todos os campos
  - Controller webhook para receber alertas
  - Auto-criação de tickets com lógica de prioridade
  - Views XML para dashboard
  - Integração com OCA modules (helpdesk_mgmt, project)
  - Email templates
  - Security groups

#### **3. Conteúdo Atualizado**

##### **README.md**
- ✅ Título atualizado: "Wazuh 4.12+"
- ✅ Seção "AI Context" adicionada
- ✅ Capacidades principais atualizadas com novos recursos
- ✅ Integrações expandidas (Shuffle, n8n, Odoo 19)
- ✅ Comandos de instalação atualizados (Ubuntu 22.04, GPG keys)
- ✅ Hot reload documentado
- ✅ Changelog v2.0.0 adicionado

#### **4. Estrutura de Diretórios**

```
docs/pt/wazuh/
├── README.md                    # ✅ Atualizado v2.0
├── introduction.md              # Original mantido
├── features.md                  # Original mantido
├── use-cases.md                 # Original mantido
├── rules/
│   └── custom-rules.md          # ✅ NOVO - 23KB
├── integrations/
│   ├── stack.md                 # Original mantido
│   ├── shuffle.md               # ✅ NOVO - 18KB
│   ├── n8n.md                   # ✅ NOVO - 22KB
│   └── odoo.md                  # ✅ NOVO - 19KB
├── mobile-development/
│   └── README.md                # Original mantido
├── community/
│   └── README.md                # Original mantido
└── CHANGELOG_v2.0.md            # ✅ NOVO - Este arquivo
```

---

## 📊 **Estatísticas**

### **Arquivos Criados**
- 4 novos arquivos
- ~82KB de documentação técnica nova
- 100+ exemplos de código
- 3 workflows completos
- 1 módulo Odoo completo

### **Tecnologias Documentadas**
- Wazuh 4.12+
- OpenSearch 2.x
- Shuffle SOAR (parceria oficial Set/2025)
- n8n workflow automation
- Odoo 19 Community
- OCA modules (helpdesk_mgmt, project, rest_framework)
- NetBox 4.2
- Python 3.11+
- XML-RPC
- REST APIs
- Webhooks
- Docker Compose

### **Exemplos Incluídos**

#### **Regras Wazuh (XML)**
- 30+ regras customizadas
- Grupos: neo_stack, netbox, odoo, soar
- IDs: 200000-230999
- MITRE ATT&CK mappings
- Compliance tags (PCI-DSS, GDPR, LGPD)

#### **Workflows**
- 3 workflows Shuffle (JSON completo)
- 2 workflows n8n (JSON + Python)
- 1 módulo Odoo completo (Python + XML)

#### **Código Python**
- App NetBox para Shuffle (~150 linhas)
- Modelo Odoo WazuhAlert (~400 linhas)
- Controller webhook Odoo (~50 linhas)
- Script geração PDF relatórios (~100 linhas)

#### **Configurações**
- ossec.conf para Shuffle
- ossec.conf para n8n
- ossec.conf hot reload
- docker-compose.yml Shuffle
- docker-compose.yml n8n
- __manifest__.py Odoo

---

## 🎯 **Próximas Versões Planejadas**

### **v2.1.0** (Q1 2026)
- [ ] Tradução completa ES (95% já feito)
- [ ] Videos tutoriais PT/ES
- [ ] Hands-on labs interativos
- [ ] Atualizar introduction.md para 4.12
- [ ] Atualizar features.md com eBPF FIM
- [ ] Atualizar use-cases.md com SOAR

### **v2.2.0** (Q2 2026)
- [ ] Certificação Wazuh Partner
- [ ] Marketplace de plugins customizados
- [ ] AI-powered threat hunting
- [ ] Kubernetes operator
- [ ] Dashboards Grafana
- [ ] Integration com TheHive

---

## 🔗 **Links Importantes**

### **Documentação Original**
- [Wazuh 4.12 Docs](https://documentation.wazuh.com/current/)
- [Shuffle Docs](https://shuffler.io/docs)
- [n8n Docs](https://docs.n8n.io/)
- [Odoo 19 Docs](https://www.odoo.com/documentation/19.0/)

### **GitHub Repositories**
- [Wazuh](https://github.com/wazuh/wazuh)
- [Shuffle](https://github.com/Shuffle/Shuffle)
- [n8n](https://github.com/n8n-io/n8n)
- [OCA Helpdesk](https://github.com/OCA/helpdesk)
- [OCA REST Framework](https://github.com/OCA/rest-framework)

### **NEO Stack**
- [NEO Stack GitHub](https://github.com/neoand/neo-stack)
- [AI_CONTEXT.md](../../AI_CONTEXT.md)
- [CLAUDE.md](../../CLAUDE.md)

---

## 👥 **Contribuidores**

- **NEO Stack Team** - Documentação completa v2.0
- **Claude Code (Anthropic)** - AI-assisted documentation
- **Wazuh Community** - Base documentation
- **OCA (Odoo Community Association)** - Odoo modules

---

## 📄 **Licença**

Esta documentação está sob licença **CC BY-SA 4.0** (Creative Commons Attribution-ShareAlike 4.0 International).

O código-fonte (regras Wazuh, módulos Odoo, workflows) está sob licença **AGPL-3.0**.

---

## 🙏 **Agradecimentos**

- **Wazuh Inc.** - Pela plataforma SIEM open source incrível
- **Shuffle** - Pela parceria oficial e integração nativa
- **n8n** - Pela plataforma de automação flexível
- **Odoo S.A.** - Pelo ERP/ITSM open source
- **OCA** - Pelos módulos community de alta qualidade
- **NetBox Labs** - Pela ferramenta CMDB essencial

---

**Status: ✅ Documentação v2.0 Completa | Wazuh 4.12+ | SOAR Ready | Production-Grade**

---

**Total: 4 arquivos novos | 82KB documentação | 100+ exemplos | AI-First | Bilíngue PT/ES**
