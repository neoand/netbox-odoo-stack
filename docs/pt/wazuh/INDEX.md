# 📚 Índice - Documentação Wazuh 4.12+ (NEO Stack v2.0)

> **AI Context**: Índice completo da documentação Wazuh para o NEO Stack v2.0. Atualizado para Wazuh 4.12+ com integrações SOAR (Shuffle/n8n) e Odoo 19. Use este arquivo como referência rápida para navegação.

---

## 📖 **Documentação Principal**

### **1. Introdução e Overview**

| Arquivo | Descrição | Tamanho | Status |
|---------|-----------|---------|--------|
| [README.md](README.md) | Ponto de entrada principal, overview completo | 20KB | ✅ v2.0 |
| [introduction.md](introduction.md) | Introdução detalhada ao Wazuh | 39KB | ✅ Original |
| [features.md](features.md) | Recursos e capacidades do Wazuh | 62KB | ✅ Original |
| [use-cases.md](use-cases.md) | Casos de uso práticos e exemplos | 75KB | ✅ Original |

---

## 🔧 **Regras e Configurações**

### **2. Regras Customizadas**

| Arquivo | Descrição | Recursos Incluídos | Status |
|---------|-----------|-------------------|--------|
| [rules/custom-rules.md](rules/custom-rules.md) | Regras XML customizadas para NEO Stack | 30+ regras, MITRE ATT&CK, Compliance | ✅ v2.0 NEW |

**Conteúdo:**
- ✅ Regras NetBox (ID 200000-200999)
  - Authentication failures
  - Asset modifications
  - IP assignment anomalies
  - VLAN changes
- ✅ Regras Odoo (ID 210000-210999)
  - Failed login/brute force
  - Helpdesk ticket tracking
  - Critical data access/export
  - Module installation (security risk)
  - Database backup monitoring
- ✅ Triggers Shuffle (ID 220000-220999)
  - Malware response workflow
  - Vulnerability remediation
  - Brute force blocking
  - Data exfiltration detection
  - Compliance violation
- ✅ Webhooks n8n (ID 230000-230999)
  - Odoo ticket creation
  - NetBox enrichment
  - Teams/Slack notifications
  - Asset status updates
  - Scheduled reports

---

## 🔗 **Integrações**

### **3. Integrações SOAR e ITSM**

| Arquivo | Tecnologia | Descrição | Status |
|---------|-----------|-----------|--------|
| [integrations/shuffle.md](integrations/shuffle.md) | Shuffle SOAR | Parceria oficial Set/2025 | ✅ v2.0 NEW |
| [integrations/n8n.md](integrations/n8n.md) | n8n Automation | Workflow automation 400+ nodes | ✅ v2.0 NEW |
| [integrations/odoo.md](integrations/odoo.md) | Odoo 19 | Auto-ticketing + módulo custom | ✅ v2.0 NEW |
| [integrations/stack.md](integrations/stack.md) | NEO Stack | NetBox + Wazuh + Odoo completo | ✅ Original |

#### **3.1 Shuffle SOAR** (18KB)

**Recursos:**
- ✅ Instalação Docker completa
- ✅ Configuração Wazuh → Shuffle webhook
- ✅ App Wazuh oficial (instalação CLI + UI)
- ✅ 3 Workflows prontos:
  1. **Malware Auto-Response**: Detecta, isola, coleta evidências, cria ticket
  2. **Vulnerability Remediation**: Auto-patch CVEs críticas
  3. **Brute Force Auto-Block**: Bloqueia IPs atacantes no firewall
- ✅ App NetBox custom (código Python completo)
- ✅ Integração com VirusTotal, Slack, Teams
- ✅ Troubleshooting detalhado
- ✅ Métricas Prometheus

**JSON Workflows:**
- `malware_response.json` (completo)
- `vulnerability_remediation.py` (código Python)
- `brute_force_block` (diagrama visual)

#### **3.2 n8n Workflow Automation** (22KB)

**Recursos:**
- ✅ Instalação Docker (n8n + PostgreSQL + Redis)
- ✅ Configuração environment (.env completo)
- ✅ Workflow 1: Auto-Ticketing Odoo
  - 6 nodes configurados
  - JSON completo exportável
  - Enriquecimento NetBox
  - Notificação Slack
- ✅ Workflow 2: Vulnerability Report Generator
  - Schedule trigger (diário)
  - Query Wazuh API
  - Geração PDF (reportlab)
  - Email report
- ✅ Código Python para geração de PDF
- ✅ Troubleshooting (webhook 404, credenciais)
- ✅ Monitoramento (logs, métricas Prometheus)

**Workflows Exportáveis:**
- `wazuh_to_odoo_ticketing.json` (completo)
- `vulnerability_report_generator.json` (com Python)

#### **3.3 Odoo 19 Auto-Ticketing** (19KB)

**Recursos:**
- ✅ Módulo Odoo custom: `wazuh_integration`
- ✅ Estrutura completa do módulo:
  - `__manifest__.py` (dependências OCA)
  - `models/wazuh_alert.py` (400 linhas)
  - `controllers/webhook.py` (50 linhas)
  - `views/wazuh_alert_views.xml` (dashboard)
  - `security/` (access rights)
- ✅ Model `wazuh.alert` com:
  - Campos básicos (rule, agent, timestamp)
  - Status workflow (new → acknowledged → resolved)
  - Asset enrichment (NetBox data)
  - Priority calculation (automático)
  - MITRE ATT&CK fields
  - Compliance tracking
- ✅ Auto-criação de tickets com lógica:
  - Rule level >= 10: SEMPRE criar ticket
  - Level >= 7 + asset crítico: criar ticket
  - Compliance violations: criar ticket
  - Vulnerabilities: criar ticket
- ✅ Integração com OCA modules:
  - `helpdesk_mgmt`
  - `project` (core)
  - `base_rest` (REST API)
- ✅ Email templates (notificações)
- ✅ Security groups (SOC team)
- ✅ Dashboard XML (pivot, graph, aggregates)

**Código Pronto:**
- Módulo Odoo completo (Python + XML)
- Webhook controller (JSON endpoint)
- Priority matrix (rule level × asset criticality)

---

## 📱 **Mobile e Community**

### **4. Recursos Adicionais**

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| [mobile-development/README.md](mobile-development/README.md) | Apps móveis (React Native/Flutter) | ✅ Original |
| [community/README.md](community/README.md) | Comunidade, canais, contribuição | ✅ Original |
| [CHANGELOG_v2.0.md](CHANGELOG_v2.0.md) | Registro de mudanças v2.0 | ✅ v2.0 NEW |

---

## 🎯 **Guias Rápidos (Quick Start)**

### **5. Instalação e Configuração Rápida**

#### **5.1 Wazuh 4.12 (Docker)**

```bash
# Clonar e subir
git clone -b 4.12 https://github.com/wazuh/wazuh-docker.git
cd wazuh-docker/single-node
docker-compose -f generate-indexer-certs.yml run --rm generator
docker-compose up -d

# Instalar agente (Ubuntu 22.04)
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --dearmor | sudo tee /usr/share/keyrings/wazuh.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | sudo tee /etc/apt/sources.list.d/wazuh.list
sudo apt-get update && sudo apt-get install wazuh-agent=4.12.0-1
```

**Ref:** [README.md - Quick Start](README.md#quick-start)

#### **5.2 Shuffle SOAR**

```bash
git clone https://github.com/Shuffle/Shuffle.git
cd Shuffle
cp .env.example .env
# Editar .env
docker-compose up -d
```

**Ref:** [integrations/shuffle.md - Instalação](integrations/shuffle.md#instalação)

#### **5.3 n8n Automation**

```bash
mkdir ~/n8n-docker && cd ~/n8n-docker
# Criar docker-compose.yml (ver doc)
docker-compose up -d
```

**Ref:** [integrations/n8n.md - Instalação](integrations/n8n.md#instalação)

#### **5.4 Módulo Odoo**

```bash
docker exec -it odoo19 bash
cd /mnt/extra-addons
git clone -b 19.0 https://github.com/OCA/helpdesk.git
# Copiar módulo wazuh_integration
odoo -d odoo -u wazuh_integration
```

**Ref:** [integrations/odoo.md - Instalação](integrations/odoo.md#instalação)

---

## 📊 **Dashboards e Visualizações**

### **6. Dashboards Disponíveis**

| Dashboard | Plataforma | Localização | Status |
|-----------|-----------|-------------|--------|
| Custom Rules Monitoring | OpenSearch/Kibana | rules/custom-rules.md | ✅ v2.0 |
| SOAR Triggers | Shuffle | integrations/shuffle.md | ✅ v2.0 |
| Workflow Executions | n8n | integrations/n8n.md | ✅ v2.0 |
| Security Tickets | Odoo 19 | integrations/odoo.md | ✅ v2.0 |
| Stack Integration | Kibana | integrations/stack.md | ✅ Original |

**Queries Prontas:**

```json
// Top Custom Rules Triggered
{
  "query": "rule.id:20* OR rule.id:21* OR rule.id:22* OR rule.id:23*",
  "aggregation": "terms",
  "field": "rule.id"
}

// SOAR Workflows
{
  "query": "rule.groups:shuffle_workflow OR rule.groups:n8n_webhook",
  "aggregation": "terms"
}

// Odoo Auto-Tickets
{
  "query": "rule.id:210010",
  "aggregation": "count"
}
```

---

## 🧪 **Scripts e Testes**

### **7. Scripts Úteis**

#### **7.1 Testar Regras Wazuh**

```bash
#!/bin/bash
# test-neo-rules.sh

# Testar regra NetBox
/var/ossec/bin/wazuh-logtest << EOF
{"service":"netbox","event_type":"authentication_failure","srcip":"192.168.1.50"}
EOF

# Testar brute force Odoo
for i in {1..6}; do
  /var/ossec/bin/wazuh-logtest << EOF
{"service":"odoo","event_type":"login_failed","srcip":"203.0.113.45"}
EOF
  sleep 1
done
```

**Ref:** [rules/custom-rules.md - Testes](rules/custom-rules.md#testes-de-regras)

#### **7.2 Testar Webhook n8n**

```bash
curl -X POST https://n8n.empresa.com/webhook/wazuh-alerts \
  -H "Content-Type: application/json" \
  -d '{
    "rule": {"id": "100400", "description": "Test alert"},
    "agent": {"name": "test-host", "ip": "192.168.1.100"}
  }'
```

**Ref:** [integrations/n8n.md - Troubleshooting](integrations/n8n.md#troubleshooting)

#### **7.3 Testar Conexão Odoo**

```python
import xmlrpc.client

url = "https://odoo.empresa.com"
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate('odoo19', 'admin', 'admin', {})
print(f"UID: {uid}")
```

**Ref:** [integrations/odoo.md - Troubleshooting](integrations/odoo.md#troubleshooting)

---

## 🔍 **Referências Técnicas**

### **8. Referências e Links**

#### **Documentação Oficial**
- [Wazuh 4.12 Docs](https://documentation.wazuh.com/current/)
- [Wazuh Rules Syntax](https://documentation.wazuh.com/current/user-manual/ruleset/)
- [Shuffle Documentation](https://shuffler.io/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Odoo 19 Developer](https://www.odoo.com/documentation/19.0/developer/)

#### **GitHub Repositories**
- [Wazuh Core](https://github.com/wazuh/wazuh)
- [Wazuh Docker](https://github.com/wazuh/wazuh-docker)
- [Shuffle](https://github.com/Shuffle/Shuffle)
- [n8n](https://github.com/n8n-io/n8n)
- [OCA Helpdesk](https://github.com/OCA/helpdesk)
- [OCA REST Framework](https://github.com/OCA/rest-framework)

#### **Frameworks de Segurança**
- [MITRE ATT&CK](https://attack.mitre.org/)
- [PCI-DSS v4.0](https://www.pcisecuritystandards.org/)
- [GDPR](https://gdpr.eu/)
- [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [NIST CSF](https://www.nist.gov/cyberframework)

#### **Community**
- [Wazuh Discord](https://discord.gg/wazuh)
- [Shuffle Discord](https://discord.gg/B2CBzUm)
- [n8n Community](https://community.n8n.io/)
- [OCA Discuss](https://github.com/OCA/maintainer-tools/discussions)

---

## 📈 **Estatísticas da Documentação**

### **9. Métricas v2.0**

```
TOTAIS:
├─ Arquivos Totais: 11 arquivos
├─ Documentação Principal: 4 arquivos (196KB)
├─ Regras Customizadas: 1 arquivo (23KB)
├─ Integrações: 4 arquivos (82KB)
├─ Mobile/Community: 2 arquivos (52KB)
└─ Changelog/Índice: 2 arquivos (15KB)

NOVOS v2.0:
├─ Arquivos Criados: 4
├─ Linhas de Código: ~2000
├─ Exemplos XML: 30+ regras
├─ Workflows: 5 completos
├─ Scripts: 10+
└─ Diagramas: 5

TECNOLOGIAS:
├─ Wazuh 4.12+
├─ OpenSearch 2.x
├─ Shuffle SOAR
├─ n8n (400+ nodes)
├─ Odoo 19 Community
├─ OCA Modules
├─ NetBox 4.2
├─ Python 3.11+
└─ Docker / Docker Compose
```

---

## 🎓 **Trilhas de Aprendizado**

### **10. Caminhos Sugeridos**

#### **10.1 Iniciante (Básico)**

1. Ler [README.md](README.md) - Overview completo
2. Seguir [Quick Start](#51-wazuh-412-docker) - Instalação Docker
3. Explorar [introduction.md](introduction.md) - Conceitos básicos
4. Ver [use-cases.md](use-cases.md) - Casos de uso práticos

**Tempo estimado:** 4-6 horas

#### **10.2 Intermediário (Regras e Configurações)**

1. Revisar [features.md](features.md) - Recursos avançados
2. Estudar [rules/custom-rules.md](rules/custom-rules.md) - Regras XML
3. Testar regras no lab (wazuh-logtest)
4. Configurar hot reload (Wazuh 4.12+)

**Tempo estimado:** 8-12 horas

#### **10.3 Avançado (Integrações SOAR)**

1. Instalar [Shuffle](integrations/shuffle.md) - SOAR oficial
2. Configurar [n8n](integrations/n8n.md) - Workflow automation
3. Implementar [Odoo](integrations/odoo.md) - Auto-ticketing
4. Integrar [Stack completa](integrations/stack.md) - NetBox + Wazuh + Odoo

**Tempo estimado:** 16-24 horas

#### **10.4 Expert (Development)**

1. Criar workflows customizados (Shuffle/n8n)
2. Desenvolver módulos Odoo (Python)
3. Contribuir para community (GitHub)
4. Build mobile apps ([mobile-development](mobile-development/README.md))

**Tempo estimado:** 40+ horas

---

## 🆘 **Suporte e Ajuda**

### **11. Onde Buscar Ajuda**

| Tipo de Problema | Canal | Tempo Resposta |
|------------------|-------|----------------|
| Bug Wazuh | [GitHub Issues](https://github.com/wazuh/wazuh/issues) | 1-3 dias |
| Dúvida Técnica | [Wazuh Discord](https://discord.gg/wazuh) | 1-4 horas |
| Shuffle Workflow | [Shuffle Discord](https://discord.gg/B2CBzUm) | 1-4 horas |
| n8n Workflow | [n8n Community](https://community.n8n.io/) | 2-24 horas |
| Odoo Module | [OCA Discuss](https://github.com/OCA/maintainer-tools/discussions) | 1-3 dias |
| NEO Stack | [GitHub Issues](https://github.com/neoand/neo-stack/issues) | 1-2 dias |

---

## ✅ **Checklist de Implementação**

### **12. Production Deployment**

#### **Pré-requisitos**
- [ ] Docker 24+ instalado
- [ ] Docker Compose 2.x instalado
- [ ] Certificados SSL configurados
- [ ] DNS configurados (wazuh.empresa.com, n8n.empresa.com, etc.)
- [ ] Firewall rules configuradas

#### **Wazuh**
- [ ] Wazuh Manager 4.12+ rodando
- [ ] OpenSearch 2.x configurado
- [ ] Agentes instalados e conectados
- [ ] Regras customizadas implantadas
- [ ] Hot reload habilitado
- [ ] Backup configurado

#### **SOAR**
- [ ] Shuffle instalado e configurado
- [ ] Workflows importados e testados
- [ ] n8n instalado e configurado
- [ ] Webhooks testados
- [ ] Credenciais configuradas (NetBox, Odoo, Slack)

#### **ITSM**
- [ ] Odoo 19 rodando
- [ ] Módulo wazuh_integration instalado
- [ ] OCA modules instalados (helpdesk_mgmt, project)
- [ ] Projetos criados (Security Operations)
- [ ] Usuários e permissões configurados

#### **Integrações**
- [ ] NetBox 4.2 integrado
- [ ] Odoo auto-ticketing funcionando
- [ ] Notificações Slack/Teams configuradas
- [ ] Dashboards criados

#### **Monitoramento**
- [ ] Métricas Prometheus habilitadas
- [ ] Dashboards Grafana configurados
- [ ] Logs centralizados
- [ ] Alertas configurados

---

## 📝 **Notas de Versão**

### **Versões Suportadas**

| Componente | Versão Mínima | Versão Recomendada | Status |
|------------|---------------|-------------------|--------|
| Wazuh | 4.10.0 | 4.12.0+ | ✅ Suportado |
| OpenSearch | 2.0 | 2.11+ | ✅ Suportado |
| Shuffle | 1.3.0 | 1.4.0+ | ✅ Suportado |
| n8n | 1.0.0 | 1.19+ | ✅ Suportado |
| Odoo | 18.0 | 19.0 | ✅ Suportado |
| NetBox | 4.0 | 4.2+ | ✅ Suportado |
| Python | 3.10 | 3.11+ | ✅ Suportado |
| Docker | 23.0 | 24.0+ | ✅ Suportado |

---

**Status: ✅ Índice Completo | v2.0 | Atualizado 2025-12-05**

**Total: 11 arquivos | 368KB documentação | 100+ exemplos | AI-First | Production-Ready**
