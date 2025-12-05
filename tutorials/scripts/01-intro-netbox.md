# 🎥 Tutorial Script: Introdução ao NetBox
## Video 01 - Primeiros Passos | Video 01 - Primeros Pasos

---

## 📝 **Informações do Vídeo**

**Duração:** 15 minutos
**Nível:** Iniciante
**Idioma:** Português (PT) / Español (ES)
**Código do Projeto:** TUT-001

---

## 🎬 **ROTEIRO**

### **1. Introdução (1:30 min)**

**[00:00 - 00:30]**
```
🎙️ NARRADOR (PT):
Olá! Bem-vindos ao nosso curso completo de NetBox + Odoo + neo_stack!
Eu sou [NOME], e nos próximos vídeos, vamos aprender desde o básico
até técnicas avançadas para transformar sua infraestrutura.

🎙️ NARRADOR (ES):
¡Hola! Bienvenidos a nuestro curso completo de NetBox + Odoo + neo_stack!
Yo soy [NOMBRE], y en los próximos videos, aprenderemos desde lo básico
hasta técnicas avanzadas para transformar su infraestructura.
```

**[00:30 - 01:00]**
```
📊 SLIDE: O que você vai aprender
- ✅ O que é NetBox e por que usar?
- ✅ Casos de uso reais no Brasil e México
- ✅ Arquitetura da solução
- ✅ Demonstração ao vivo
```

**[01:00 - 01:30]**
```
🎯 OBJETIVO DO VÍDEO:
Ao final desta lição, você entenderá:
1. O que é NetBox
2. Principais funcionalidades
3. Casos de uso práticos
4. Como instalá-lo rapidamente

📝 PRÉ-REQUISITOS:
- Conhecimento básico de redes
- Acesso a um servidor (local ou cloud)
- 15 minutos de dedicação
```

### **2. O que é NetBox? (3:00 min)**

**[01:30 - 02:00]**
```
📊 ANIMAÇÃO: NetBox Logo + Interface

🎙️ NARRADOR (PT):
NetBox é uma ferramenta de gerenciamento de infraestrutura que combina
três funções essenciais: CMDB (Configuration Management Database),
IPAM (IP Address Management) e DCIM (Data Center Infrastructure Management).

🎙️ NARRADOR (ES):
NetBox es una herramienta de gestión de infraestructura que combina
tres funciones esenciales: CMDB, IPAM y DCIM.
```

**[02:00 - 03:00]**
```
📊 DIAGRAMA: Funcionalidades
┌─────────────────────────────────┐
│         NETBOX                   │
├─────────────────────────────────┤
│  📍 Sites & Racks               │
│  💻 Devices & Components         │
│  🌐 IPs & VLANs                 │
│  🔌 Connections & Cables        │
│  📦 Inventory                   │
│  📊 Reports & Metrics           │
└─────────────────────────────────┘
```

**[03:00 - 04:00]**
```
📊 EXEMPLOS VISUAIS:
- Site: Data Center São Paulo
- Rack: Rack A1 -Andar 5
- Device: Switch Core Cisco
- IP: 192.168.1.0/24
- VLAN: VLAN 10 - Administracao

🎙️ NARRADOR:
Cada objeto se relaciona com os outros, criando uma visão completa
da sua infraestrutura.
```

**[04:00 - 04:30]**
```
💡 DIFERENCIAL:
"A diferença do NetBox para planilhas ou ferramentas simples é que
ele mantém RELACIONAMENTOS entre os objetos, permitindo análises
complexas e automações poderosas."
```

### **3. Casos de Uso Reais (4:00 min)**

**[04:30 - 05:30]**
```
📊 CASE 1: Provedor de Internet
🎙️ NARRADOR (PT):
"Um provedor de internet mexicano com 50,000 equipamentos usava
planilhas Excel. Com NetBox, reduziu 80% do tempo de inventário
e aumentou a precisão para 99.5%."

📊 SLIDE: Métricas
- Antes: 120h/mês inventário
- Depois: 24h/mês inventário
- ROI: 270% em 6 meses
```

**[05:30 - 06:30]**
```
📊 CASE 2: Empresa de TI (Brasil)
🎙️ NARRADOR (PT):
"Uma empresa de TI brasileira com 200 clientes usava NetBox para
gerenciar IPs de todos os clientes. Descobriu 15% de IPs órfãos
e recuperou blocos importantes."

📊 SLIDE: Resultados
- 15% de IPs recuperados
- 45% menos conflitos
- 30% redução em downtime
```

**[06:30 - 07:30]**
```
📊 CASE 3: Data Center
🎙️ NARRADOR (PT):
"Um data center americano integrou NetBox + Odoo e automatizou
todo o processo de provisioning: do pedido à ativação em 2 horas,
antes levava 3 dias."

📊 SLIDE: Automação
- Provisioning: 3 dias → 2 horas
- Taxa de erro: 12% → 0.5%
- Satisfação: 7.2/10 → 9.1/10
```

**[07:30 - 08:30]**
```
📊 CASE 4: Universidade
🎙️ NARRADOR (ES):
"Una universidad española usó NetBox para gestionar la red de
campus con 5,000 dispositivos. Redujo fallos de red en 60%."

📊 SLIDE: Beneficios
- Tiempo de respuesta: 4h → 45min
- Uptime: 95% → 99.7%
- Satisfacción usuarios: 6.5/10 → 8.9/10
```

### **4. Arquitetura da Solução (3:00 min)**

**[08:30 - 09:30]**
```
📊 DIAGRAMA: Stack Completo

    ┌─────────────────┐
    │   NetBox CMDB   │
    │   IPAM/DCIM     │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │   Odoo ERP      │
    │ Inventory/Assets│
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  neo_stack      │
    │  Framework      │
    │  API/Frontend   │
    └─────────────────┘

🎙️ NARRADOR:
Cada componente tem sua função específica e juntos criam
uma solução completa para sua infraestrutura.
```

**[09:30 - 10:30]**
```
📊 FLUXO DE DADOS:
1. 📥 NetBox: Coleta dados da rede
2. 🔄 Sincronização: Dados para Odoo
3. 💰 Odoo: Gestão financeira/operacional
4. 🚀 neo_stack: Interface web/mobile
5. 📱 PWA: Acesso móvel para técnicos

🎙️ NARRADOR:
Este é o fluxo básico. Veremos em detalhes nos próximos vídeos
como cada peça se conecta.
```

**[10:30 - 11:30]**
```
📊 TECNOLOGIAS:
- Backend: Python/Django
- Database: PostgreSQL
- Frontend: Bootstrap/jQuery
- API: REST & GraphQL
- Docker: Containers
- PWA: Progressive Web Apps

🎙️ NARRADOR:
Tudo open source, sem vendor lock-in, fácil de adaptar
às suas necessidades.
```

### **5. Demonstração Rápida (3:30 min)**

**[11:30 - 13:00]**
```
🖥️ DEMO: Navegação Rápida

[TELA: NetBox Interface]

🎙️ NARRADOR:
Vamos dar uma olhada rápida na interface:

1. Menu lateral: Todos os módulos
2. Search global: Busca potente
3. Dashboard: Visão geral
4. Lista: Visualização em tabela
5. Detalhes: Informações completas
6. Relacionamentos: Objetos conectados

[DEMO: Criar um Site]
- Clique em "Sites" → "Add"
- Nome: "São Paulo HQ"
- URL: "https://sp-hq.company.com"
- Save!
```

**[13:00 - 14:00]**
```
🖥️ DEMO: Criar Rack

🎙️ NARRADOR:
Agora vamos adicionar um rack dentro do site:

- Site: São Paulo HQ
- Rack: "Rack-01"
- U Altura: 42U
- Tipo: "Standard Server Rack"

[DEMO: Adicionar Switch]

- Dispositivo: "Switch-Core-01"
- Tipo: "Cisco Catalyst 2960X"
- Posição: U1
- Uplink: Para Router Principal
```

**[14:00 - 15:00]**
```
🎙️ NARRADOR (PT):
Perfeito! Criamos um site, um rack e adicionamos um switch
em menos de 2 minutos. No próximo vídeo, vamos configurar
IPs e VLANs.

🎙️ NARRADOR (ES):
¡Perfecto! Creamos un sitio, un rack y agregamos un switch
en menos de 2 minutos. En el próximo video, configuraremos
IPs y VLANs.

🎯 PRÓXIMO VÍDEO:
"Configuração Inicial" - Vamos configurar sites, racks e VLANs

📝 EXERCÍCIO:
Instale o NetBox no seu ambiente e crie seu primeiro site!
Links na descrição.

💬 DÚVIDAS?
Deixe nos comentários ou acesse nosso Discord!
Link na descrição.
```

---

## 📚 **Recursos do Vídeo**

### **Links na Descrição**
- 🐳 Docker Hub: [netbox-community/netbox](https://hub.docker.com/r/netboxcommunity/netbox)
- 📖 Documentação Oficial: [docs.netbox.dev](https://docs.netbox.dev)
- 💻 Código-fonte: [github.com/netbox-community/netbox](https://github.com/netbox-community/netbox)
- 💬 Discord: [discord.gg/netbox](https://discord.gg/netbox)
- 📧 Email: contato@netbox-curso.com

### **Slides Download**
- 📄 PDF: [link-slides-pdf]
- 🎨 Keynote: [link-keynote]
- 📊 PowerPoint: [link-pptx]

### **Código do Projeto**
- 📂 GitHub: [github.com/curso-netbox/01-intro](https://github.com/curso-netbox/01-intro)
- 🐳 Docker Compose: `docker-compose.yml`

### **Exercícios**
1. Instalar NetBox via Docker
2. Criar primeiro site
3. Adicionar rack
4. Adicionar dispositivo
5. Responder quiz (link no YouTube)

### **Leitura Complementar**
- 📘 NetBox Official Documentation
- 📗 Django Framework Basics
- 📙 PostgreSQL Introduction
- 📕 CMDB Best Practices

---

## 🏷️ **Tags**
#NetBox #Odoo #DCIM #IPAM #CMDB #Infraestrutura #Tutorial #Português #Español #DevOps #NetworkManagement #DataCenter

---

## 📊 **Métricas do Vídeo**

### **Objetivos de Performance**
- **Taxa de retenção:** > 75%
- **Avaliação média:** > 4.5/5
- **Comentários positivos:** > 80%
- **Taxa de conversão:** > 15%

### **KPIs de Engajamento**
- Likes:Target 500
- Comentários:Target 100
- Shares:Target 50
- Inscrições:Target 200

---

**© 2024 NetBox-Odoo Tutorial Series | Todos os direitos reservados**
