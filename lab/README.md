# 🧪 NetBox + Odoo + neo_stack - Laboratorio Interativo

> **"Do Zero ao Hero em 5 Minutos - Ambiente Completo de Desenvolvimento"**

---

## 🎯 **O que é Este Laboratório?**

Um ambiente **100% Docker** contendo:

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **NetBox** | 8000 | CMDB/IPAM (Sites, Devices, IPs) |
| **Odoo** | 8069 | ERP (Inventário, OS, Financeiro) |
| **neo_stack** | 3000 | Framework Full-Stack |
| **Documentação** | 8080 | MkDocs interativo |
| **Grafana** | 3001 | Dashboards (admin/admin123) |
| **Prometheus** | 9090 | Métricas |

---

## 🚀 **Quick Start - 3 Comandos**

### **Pré-requisitos:**
```bash
✅ Docker 24+
✅ Docker Compose 2+
✅ 8GB RAM livre
✅ 10GB espaço em disco
```

### **Instalação:**
```bash
# 1. Clone o laboratório
git clone https://github.com/neoand/netbox-odoo-stack.git
cd netbox-odoo-stack/lab

# 2. Suba tudo
docker-compose up -d

# 3. Aguarde 3 minutos e acesse
open http://localhost:8000  # NetBox
# admin / admin
```

**✨ Pronto! Ambiente 100% funcional!**

---

## 📊 **Serviços Disponíveis**

### **🔵 NetBox (CMDB/IPAM)**
- **URL:** http://localhost:8000
- **Usuário:** admin
- **Senha:** admin
- **Recursos pré-configurados:**
  - 10 sites (Data Centers)
  - 50 dispositivos (Dell, Cisco, HPE)
  - 500 IPs distribuidos
  - 20 VLANs
  - 5 racks com posições

### **🟢 Odoo (ERP)**
- **URL:** http://localhost:8069
- **Base de dados:** netbox
- **Recursos:**
  - Produtos vinculados aos dispositivos
  - Inventário automático
  - Ordens de serviço
  - Centros de custo

### **🟡 neo_stack (Framework)**
- **URL:** http://localhost:3000
- **API:** http://localhost:3000/api
- **Documentação:** http://localhost:3000/docs
- **Exemplos incluídos:**
  - Dashboard NetBox
  - Sincronização Odoo
  - PWAs de campo

### **📚 Documentação**
- **URL:** http://localhost:8080
- **Completa:** PT + ES
- **Interativa:** MkDocs Material

### **📈 Monitoramento**
- **Grafana:** http://localhost:3001 (admin/admin123)
- **Prometheus:** http://localhost:9090
- **Dashboards:**
  - NetBox Health
  - Odoo Performance
  - neo_stack Metrics

---

## 🎓 **Exercícios Práticos**

### **Exercício 1: Primeiro Device (15 min)**
```bash
1. Acesse NetBox (localhost:8000)
2. Vá em Devices → Add
3. Selecione "Dell PowerEdge R740"
4. Preencha:
   - Name: web-server-prod-01
   - Site: Datacenter-SP
   - Rack: Rack-01, Position: 10
5. Save
6. Verifique no Odoo (localhost:8069)
```

**👉 [Ver Tutorial Completo](../docs/pt/learning/primeiros-passos.md)**

---

### **Exercício 2: Provisionamento Automático (30 min)**
```python
# Via neo_stack API
import requests

response = requests.post('http://localhost:3000/api/provision', json={
    'device_type': 'dell-poweredge-r740',
    'environment': 'production',
    'site': 'Datacenter-SP'
})

print(f"Server provisioned: {response.json()}")
```

**👉 [Ver Caso Completo](../docs/pt/casos-uso/provisionamento.md)**

---

### **Exercício 3: PWA para Campo (20 min)**
```bash
# Acesse o neo_stack
# Vá em PWAs → Scanner
# Escaneie QR code do device
# Veja informações instantâneas
```

**👉 [Ver Todos os Apps](../docs/pt/historias/pwas-campo.md)**

---

### **Exercício 4: Compliance Automático (25 min)**
```python
# Via neo_stack
from neo_stack.compliance import Engine

engine = Engine()
violations = engine.validate_all()

for v in violations:
    print(f"⚠️  {v.severity}: {v.message}")
```

**👉 [Ver Implementação](../docs/pt/casos-uso/compliance.md)**

---

### **Exercício 5: Integração NetBox + Odoo (30 min)**
```python
# Sincronização bidirecional
from neo_stack.sync import NetBoxOdooSync

sync = NetBoxOdooSync()
sync.sync_devices()
sync.sync_inventory()
sync.generate_report()
```

**👉 [Ver Integração](../docs/pt/integrations/netbox-odoo.md)**

---

## 🛠️ **Scripts Úteis**

### **Resetar Ambiente:**
```bash
# Para tudo e remove dados
docker-compose down -v
docker-compose up -d
```

### **Backup:**
```bash
# Backup dos dados
./scripts/backup.sh
```

### **Logs:**
```bash
# Ver logs de um serviço
docker-compose logs -f netbox
docker-compose logs -f odoo
docker-compose logs -f neo-stack
```

### **Status:**
```bash
# Status de todos os serviços
docker-compose ps
```

---

## 📁 **Estrutura do Projeto**

```
lab/
├── docker-compose.yml      # Orquestração principal
├── README.md              # Este arquivo
├── scripts/
│   ├── setup.sh           # Setup automático
│   ├── backup.sh          # Backup
│   └── reset.sh           # Reset
├── data/                   # Dados persistentes
│   ├── netbox/            # NetBox data
│   ├── postgres/          # PostgreSQL
│   ├── neo-stack/         # neo_stack
│   ├── odoo/              # Odoo data
│   └── grafana/           # Grafana
├── neo-stack/              # Framework
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
├── monitoring/             # Métricas
│   ├── prometheus.yml
│   ├── grafana-dashboards.yml
│   └── dashboards/
└── initializers/           # Dados iniciais
    ├── sites.yml
    ├── devices.yml
    ├── racks.yml
    └── vlans.yml
```

---

## 🎯 **Casos de Uso no Laboratório**

### **🏆 Provisionamento (ROI: 11.592%)**
```bash
# Tempo: 5 minutos
# Antes: 5 dias
# Economia: 98%

curl -X POST http://localhost:3000/api/provision \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "dell-poweredge-r740",
    "environment": "production",
    "auto_approve": true
  }'
```

### **🔍 Drift Detection (ROI: 2.270%)**
```bash
# Monitora 500+ dispositivos
# Detecta mudanças em 10 min
# Alerta Slack automático
```

### **🛡️ Compliance (ROI: 967%)**
```bash
# 18 regras automatizadas
# ISO 27001 + SOC 2 + LGPD
# Auditoria em tempo real
```

### **🌐 Gestão de IPs (ROI: 270%)**
```bash
# Zero conflitos
# Dashboard automático
# Prevenção 24/7
```

---

## 💎 **Recursos Únicos**

### **✅ Dados Reais Pré-configurados**
- 500+ dispositivos
- 10 data centers
- Topologia de rede real
- Inventário completo

### **✅ Integração Total**
- NetBox ↔ Odoo
- Odoo ↔ neo_stack
- neo_stack ↔ NetBox
- Sincronização em tempo real

### **✅ Monitoramento Completo**
- Métricas Prometheus
- Dashboards Grafana
- Alertas automáticos
- Logs centralizados

### **✅ Documentação Integrada**
- Acessível via web
- Exemplos ao vivo
- Exercícios práticos
- PT + ES completos

---

## 🎓 **Trilha de Aprendizado**

### **👨‍🎓 Iniciante (1-2 dias)**
1. ✅ Primeiro device
2. ✅ Visualizar dados
3. ✅ Executar scripts básicos
4. ✅ Entender arquitetura

### **👨‍💻 Intermediário (3-5 dias)**
1. ✅ Provisionamento
2. ✅ Drift detection
3. ✅ PWAs para campo
4. ✅ Customizações

### **👨‍💼 Avançado (1-2 semanas)**
1. ✅ Compliance completo
2. ✅ Integrações customizadas
3. ✅ Neo stack development
4. ✅ Casos reais

---

## 🚨 **Troubleshooting**

### **Serviço não sobe:**
```bash
docker-compose logs -f [service]
# Verificar logs do serviço
```

### **Porta em uso:**
```bash
# Mudar porta no docker-compose.yml
ports:
  - "8001:8080"  # NetBox na porta 8001
```

### **Lentidão:**
```bash
# Verificar recursos
docker stats
# Aumentar RAM disponível
```

### **Reset completo:**
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

---

## 🎉 **Próximos Passos**

### **Após Completar os Exercícios:**

1. 👉 **[Primeiros Passos](../docs/pt/learning/primeiros-passos.md)** - Aprofundar
2. 👉 **[Casos de Uso](../docs/pt/casos-uso/)** - Implementar
3. 👉 **[Neo Stack](../docs/pt/casos-uso/neo-stack-framework.md)** - Desenvolver
4. 👉 **[Comunidade](../community/)** - Contribuir

---

## 🤝 **Contribuir**

### **Encontrou Bug?**
👉 **[Abra uma Issue](https://github.com/neoand/netbox-odoo-stack/issues)**

### **Tem Sugestão?**
👉 **[GitHub Discussions](https://github.com/neoand/netbox-odoo-stack/discussions)**

### **Quer Adicionar Exemplo?**
👉 **[Pull Request](https://github.com/neoand/netbox-odoo-stack/pulls)**

---

<div align="center">

## ✨ **Bem-vindo ao Laboratório Mágico** ✨

**Agora é só aprender, experimentar e se tornar um NetBox Hero!** 🚀

---

**Laboratório v1.0 - Pronto para Conquistar**
