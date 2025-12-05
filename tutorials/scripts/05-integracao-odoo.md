# 🎥 Tutorial Script: Integração com Odoo
## Video 05 - Integração Avançada | Video 05 - Integración Avanzada

---

## 📝 **Informações do Vídeo**

**Duração:** 35 minutos
**Nível:** Intermediário
**Pré-requisito:** Vídeos 01-04
**Idioma:** Português (PT) / Español (ES)
**Código do Projeto:** TUT-005

---

## 🎬 **ROTEIRO DETALHADO**

### **1. Introdução (2:00 min)**

**[00:00 - 00:30]**
```
🎙️ NARRADOR (PT):
No vídeo de hoje, vamos integrar NetBox com Odoo, criando uma ponte
automática entre sua infraestrutura e seu ERP. Isso vai permitir:
sincronização de ativos, workflow de compras automatizado e
gestão financeira da sua infraestrutura.

🎙️ NARRADOR (ES):
En el video de hoy, integraremos NetBox con Odoo, creando un puente
automático entre su infraestructura y su ERP. Esto permitirá...
```

**[00:30 - 01:30]**
```
📊 SLIDE: Objetivos do Vídeo

1. ✅ Instalar conector NetBox-Odoo
2. ✅ Configurar sincronização bidirecional
3. ✅ Criar workflow de compra automatizado
4. ✅ Demonstrar dashboard integrado
5. ✅ Configurar webhooks
6. ✅ Best practices de integração

🎯 PRÉ-REQUISITOS:
- NetBox instalado (vídeo 01-04)
- Odoo instalado
- PostgreSQL configurado
- 35 minutos
```

**[01:30 - 02:00]**
```
💡 POR QUE INTEGRAR?

📊 DADOS ISOLADOS vs DADOS INTEGRADOS:

ISOLADO:
- NetBox: Inventário técnico
- Odoo: Dados financeiros
- Planilhas: Controles paralelos
- RESULTADO: Inconsistências, retrabalho

INTEGRADO:
- NetBox: Fonte da verdade técnica
- Odoo: Workflow automático
- Integração: Dados únicos
- RESULTADO: Eficiência, precisão, automação
```

### **2. Arquitetura da Integração (4:00 min)**

**[02:00 - 03:00]**
```
📊 DIAGRAMA: Arquitetura

┌─────────────────┐       ┌─────────────────┐
│   NetBox CMDB   │◄─────►│   Odoo ERP      │
│                 │       │                 │
│ - Sites/Racks   │       │ - Assets        │
│ - Devices       │       │ - Inventory     │
│ - IPs/VLANs     │       │ - Purchases     │
│ - Connections   │       │ - Invoices      │
└────────┬────────┘       └────────┬────────┘
         │                          │
         ▼                          ▼
┌─────────────────────────────────────────┐
│          neo_stack Framework             │
│                                         │
│ - API Gateway      - Webhook Handler    │
│ - Sync Engine      - Data Mapper        │
│ - Queue Manager    - Event Trigger      │
└─────────────────────────────────────────┘
```

**[03:00 - 04:00]**
```
📊 FLUXO DE DADOS:

CENÁRIO 1: Novo Dispositivo
1. Técnico adiciona dispositivo no NetBox
2. Evento disparado no NetBox
3. neo_stack detecta mudança
4. Envia dados para Odoo
5. Odoo cria ativo automaticamente
6. Notificação enviada ao financeiro

CENÁRIO 2: Ativo em Odoo
1. Compra aprovada no Odoo
2. neo_stack detecta mudança
3. Criar registro no NetBox
4. Atualizar status
5. Notificar recebimento
```

**[04:00 - 06:00]**
```
📊 COMPARATIVE TABLE:

┌─────────────────┬──────────────────┬──────────────────┐
│  FUNCIONALIDADE │     MANUAL       │    INTEGRADO     │
├─────────────────┼──────────────────┼──────────────────┤
│ Cadastro        │ 20 min           │ 2 min            │
│ Atualizações    │ 15 min           │ Automático       │
│ Relatórios      │ 45 min           │ 5 min            │
│ Conciliação     │ 60 min           │ 0 min            │
│ Erros           │ 15%              │ 0.5%             │
│ Custo/h         │ R$ 50            │ R$ 5             │
│ ROI             │ -                │ 850%             │
└─────────────────┴──────────────────┴──────────────────┘

🎙️ NARRADOR:
Com integração, você economiza 85% do tempo, reduz erros em 97%
e tem ROI de 850% no primeiro ano!
```

### **3. Instalação do Conector (6:00 min)**

**[06:00 - 08:00]**
```
🖥️ DEMO: Instalação

[TELA: Terminal]

$ git clone https://github.com/neoand/netbox-odoo-connector.git
$ cd netbox-odoo-connector

$ python -m venv venv
$ source venv/bin/activate

$ pip install -r requirements.txt

🎙️ NARRADOR:
Vamos instalar o conector oficial. São apenas 4 comandos
e 2 minutos!

📝 ARQUIVO: requirements.txt
netbox-client==3.5.0
odoo-client==2.1.0
redis==4.5.0
celery==5.2.0
python-dotenv==0.19.0
```

**[08:00 - 10:00]**
```
🖥️ DEMO: Configuração

[TELA: Arquivo .env]

# NetBox Configuration
NETBOX_URL=http://localhost:8000
NETBOX_TOKEN=seu_token_aqui

# Odoo Configuration
ODOO_URL=http://localhost:8069
ODOO_DB=netbox
ODOO_USER=admin
ODOO_PASSWORD=admin123

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Sync Settings
SYNC_INTERVAL=300  # 5 minutes
SYNC_DIRECTION=bidirectional
AUTO_CREATE_ASSETS=true

🎙️ NARRADOR:
Configuramos as credenciais de ambos os sistemas.
Agora vamos definir o que sincronizar.
```

**[10:00 - 12:00]**
```
🖥️ DEMO: Mapeamento de Campos

[TELA: Arquivo mapping.yml]

netbox_to_odoo:
  devices:
    - netbox_field: name
      odoo_field: name
      required: true
    - netbox_field: device_type
      odoo_field: category_id
      transform: map_type
    - netbox_field: serial_number
      odoo_field: serial_number
    - netbox_field: status
      odoo_field: state
      transform: map_status

odoo_to_netbox:
  assets:
    - odoo_field: product_id
      netbox_field: device_type
      transform: map_product
    - odoo_field: cost
      netbox_field: custom_fields.cost
    - odoo_field: purchase_date
      netbox_field: custom_fields.purchase_date

transforms:
  map_type:
    "Switch": 1
    "Router": 2
    "Server": 3
    "Firewall": 4
```

### **4. Sincronização Bidirecional (8:00 min)**

**[12:00 - 14:00]**
```
🖥️ DEMO: Configurar Sync

[TELA: Interface Web]

1. Acessar: http://localhost:3000/admin
2. Login com admin
3. Ir em "Sync Rules"
4. Clicar "Add Rule"

Sync Rule: "Device → Asset"
Direction: NetBox → Odoo
Trigger: On Create/Update
Active: ✓

Filter:
  - Device Type: Switch, Router, Server
  - Status: Active, Inventory
  - Location: Any

Mapping:
  Site → Location
  Rack → Rack
  Device → Product
```

**[14:00 - 16:00]**
```
🖥️ DEMO: Testar Sync

[TELA: NetBox]

1. Criar novo dispositivo:
   - Name: Switch-Test-001
   - Device Type: Cisco Catalyst 2960X
   - Site: São Paulo HQ
   - Rack: Rack-01

2. Verificar Odoo:

[TELA: Odoo]

3. Menu: "Assets" → "Assets"
4. Procurar por "Switch-Test-001"
5. ✅ ATIVO CRIADO AUTOMATICAMENTE!

📊 DADOS SINCRONIZADOS:
- Nome: Switch-Test-001
- Categoria: Switches
- Serial: [capturado do NetBox]
- Location: São Paulo HQ
- Data: 2024-12-04
```

**[16:00 - 18:00]**
```
🖥️ DEMO: Sync Reverso

[TELA: Odoo]

1. Criar compra no Odoo:
   - Product: Server Dell PowerEdge R740
   - Quantity: 2
   - Supplier: Dell Brazil
   - Cost: $2,500 each

2. Confirmar Purchase Order
3. Receive Products

4. Verificar NetBox:

[TELA: NetBox]

5. Menu: "Devices" → "Devices"
6. Filtrar: "Recently Added"
7. ✅ 2 SERVERS ADICIONADOS!

📊 DADOS CRIADOS:
- Name: Server-Dell-R740-001 (auto-generated)
- Device Type: Server
- Location: Receiving Area
- Status: Inventory
- Custom Fields: Purchase Info
```

**[18:00 - 20:00]**
```
🖥️ DEMO: Configurar Webhook

[TELA: NetBox]

1. Menu: "Administration" → "Webhooks"
2. Click "Add"
3. Configurar:

Webhook: "Device Created"
URL: http://neo-stack:3000/webhooks/netbox
HTTP Method: POST
Body Template:
{
  "event": "device.created",
  "timestamp": "{{ timestamp }}",
  "data": {
    "name": "{{ name }}",
    "device_type": "{{ device_type }}",
    "serial": "{{ serial }}",
    "site": "{{ site }}"
  }
}

🎙️ NARRADOR:
Webhooks permitem ações em tempo real!
```

### **5. Workflow Automatizado (10:00 min)**

**[20:00 - 23:00]**
```
🖥️ DEMO: Workflow Purchase

[TELA: Odoo]

CENÁRIO: Compra de equipamentos via Odoo

1. Employee solicita compra:
   - IT Team precisa de 5 switches
   - Justificativa: Expansão rede
   - Orçamento: $5,000

2. Manager aprova:
   - Verificação no NetBox
   - Available rack space ✓
   - Power capacity ✓
   - VLAN capacity ✓
   - APPROVED!

3. Purchase process:
   - RFQ enviado a 3 fornecedores
   - Cotação recebida
   - Melhor preço selecionado
   - PO criada
```

**[23:00 - 26:00]**
```
🖥️ DEMO: Receiving Flow

1. Equipment received:
   - Scanner código barras
   - Registro automático:
     * Serial: [scan]
     * Asset tag: AT-2024-001
     * Location: Receiving
     * Status: Quarantine

2. Technical inspection:
   - Test connectivity ✓
   - Check serial ✓
   - Update firmware ✓
   - Configure → Production ✓

3. Auto-deployment:
   - NetBox auto-adds device
   - Assign IP address
   - Configure VLAN
   - Document connections
   - Update documentation
   - Notify stakeholders

🎙️ NARRADOR:
De solicitação a produção em 2 dias!
```

**[26:00 - 28:00]**
```
🖥️ DEMO: Depreciation

[TELA: Odoo]

1. Assets automaticamente:
   - Categoria: Network Equipment
   - Vida útil: 5 anos
   - Método: Linear
   - Valor residual: 10%

2. Cálculo automático:
   - Valor inicial: $2,500
   - Depreciação/mês: $37.50
   - Valor atual: $2,162.50 (9 meses)
   - Próxima revisão: 2029-01-01

3. Reporting:
   - Relatório mensal automático
   - Dashboard CFO
   - Alerta replacement: 2029-01-01
```

**[28:00 - 30:00]**
```
🖥️ DEMO: Alerts & Notifications

[TELA: Email + Slack]

EMAIL EXEMPLO:
---
Assunto: [ALERT] - Ativo próximo do fim da vida útil

Prezado(a) [Nome],

O ativo abaixo está próximo do fim da vida útil:

Asset: Switch-Core-01
Serial: FCW2140L0JC
Data compra: 2019-12-01
Vida útil: 5 anos
Próxima revisão: 2024-12-01
Valor atual: $850

Ação recomendada: Planejar substituição
Impacto: Alto (dispositivo crítico)

---
```

### **6. Dashboard Integrado (3:00 min)**

**[30:00 - 32:00]**
```
🖥️ DEMO: Dashboard

[TELA: Grafana Dashboard]

📊 MÉTRICAS:
┌─────────────────────────────────┐
│ Asset Summary                   │
├─────────────────────────────────┤
│ Total Assets: 1,247             │
│ Active: 1,089 (87%)             │
│ Inactive: 158 (13%)             │
│                                 │
│ By Category:                    │
│ Switches: 345                   │
│ Servers: 267                    │
│ Routers: 123                    │
│ Others: 512                     │
└─────────────────────────────────┘

📊 FINANCIAL:
┌─────────────────────────────────┐
│ Asset Value                     │
├─────────────────────────────────┤
│ Total Invested: $2.4M           │
│ Current Value: $1.8M            │
│ Depreciation: $600K             │
│ This Year: $240K                │
└─────────────────────────────────┘
```

**[32:00 - 33:00]**
```
📊 DRILL-DOWN:
- Click em "Switches" → Lista detalhada
- Click em asset → Histórico completo
- Click em valor → Breakdown por location
- Click em depreciação → Projeção futuro

🎙️ NARRADOR:
Dashboard integrado dá visibilidade completa:
técnica + financeira + operacional!
```

### **7. Conclusão e Próximos Passos (2:00 min)**

**[33:00 - 35:00]**
```
🎯 RESUMO:
✅ Instalado conector NetBox-Odoo
✅ Configurado sync bidirecional
✅ Criado workflow purchase automatizado
✅ Configurado webhooks
✅ Dashboard integrado funcionando

📚 PRÓXIMOS VÍDEOS:
- Video 06: API e Automação
- Video 07: GraphQL Queries
- Video 08: Scripts Python

💡 DICAS:
1. Sempre teste em ambiente dev
2. Backup antes de configurar sync
3. Monitore logs primeiro mês
4. Documente seus mappings

🎓 EXERCÍCIOS:
1. Configure sync para sua empresa
2. Crie workflow customizado
3. Teste webhooks
4. Build seu dashboard

💬 DÚVIDAS?
Discord: #integracao-odoo
Email: suporte@netbox-curso.com
```

---

## 📚 **Materiais Complementares**

### **Código-fonte**
- 📂 GitHub: [github.com/curso-netbox/05-integracao-odoo](https://github.com/curso-netbox/05-integracao-odoo)
- 🐳 Docker Compose: Inclui NetBox + Odoo + Conector
- 📝 Scripts: download na descrição

### **Templates**
- 📄 mapping.yml: Mapeamento básico
- 📄 webhook.json: Webhooks pré-configurados
- 📄 sync-rules.yml: Regras de sincronização
- 📄 dashboard.json: Grafana dashboard

### **Links Úteis**
- 🔗 NetBox API Docs
- 🔗 Odoo API Reference
- 🔗 neo_stack Documentation
- 🔗 PostgreSQL Sync Best Practices

---

**© 2024 NetBox-Odoo Tutorial Series | Video 05**
