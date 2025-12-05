# 🎭 Visualização 3D Interativa - Arquitetura NetBox + Odoo + neo_stack

> **" Veja a mágica acontecer em 3D "**

---

## 🎯 **O que é?**

Visualização 3D interativa da arquitetura completa NetBox + Odoo + neo_stack:

- ✅ **Componentes 3D** - Cada serviço como objeto 3D
- ✅ **Fluxo de dados animado** - Partículas mostrando integração
- ✅ **Tooltips informativos** - Clique para detalhes
- ✅ **Múltiplas visões** - Overview, por componente, fluxo
- ✅ **Interativo** - Mouse para navegar e explorar

---

## 🚀 **Como Usar**

### **Método 1: Navegador (Recomendado)**
```bash
# Abra o arquivo no browser
open visualization-3d/index.html

# Ou via servidor local
cd visualization-3d
python3 -m http.server 9000
# Acesse: http://localhost:9000
```

### **Método 2: Laboratorio Docker**
```bash
# No laboratório, acesso direto:
http://localhost:9000
```

---

## 🎮 **Controles**

### **Mouse:**
- **Clique** - Selecionar componente
- **Arraste** - Rotacionar visualização
- **Scroll** - Zoom in/out
- **Hover** - Ver tooltip

### **Botões:**
- **Visão Geral** - Vista completa da arquitetura
- **NetBox** - Focar no NetBox
- **Odoo** - Focar no Odoo
- **neo_stack** - Focar no framework
- **Fluxo de Dados** - Vista de fluxo

---

## 🎨 **Componentes Visualizados**

### **🔵 NetBox (Azul)**
- **Posição:** Esquerda (-8, 0, 0)
- **Porta:** 8000
- **Tecnologia:** Django + PostgreSQL
- **Função:** CMDB/IPAM
- **Dados:** 2,547 dispositivos, 15,892 IPs

### **🟢 Odoo (Verde)**
- **Posição:** Direita (8, 0, 0)
- **Porta:** 8069
- **Tecnologia:** Python + XML-RPC
- **Função:** ERP
- **Dados:** Inventário, OS, Financeiro

### **🟡 neo_stack (Roxo)**
- **Posição:** Frente (0, 0, -8)
- **Porta:** 3000
- **Tecnologia:** Nuxt.js + FastAPI
- **Função:** Framework Full-Stack
- **Dados:** Dashboard PWA, APIs

### **🔴 PostgreSQL (Vermelho)**
- **Posição:** Base (0, -5, 0)
- **Porta:** 5432
- **Tecnologia:** PostgreSQL 15
- **Função:** Base de dados
- **Dados:** Todos os sistemas

### **🟠 Redis (Laranja)**
- **Posição:** Topo (0, 5, 0)
- **Porta:** 6379
- **Tecnologia:** Redis 7
- **Função:** Cache + Queue
- **Dados:** Performance, mensagens

---

## 📊 **Fluxo de Dados Animado**

### **Partículas Coloridas:**
- 🔵 **Azul** - NetBox ↔ neo_stack
- 🟢 **Verde** - Odoo ↔ neo_stack
- 🟣 **Roxo** - neo_stack ↔ Database
- 🟡 **Amarelo** - Redis ↔ neo_stack
- 🔴 **Vermelho** - Database ↔ Todos

### **Como Funciona:**
1. **Origem** - Componente fonte
2. **Animação** - Partícula viaja pela conexão
3. **Destino** - Componente destino
4. **Loop** - Animação contínua

---

## 💎 **Métricas em Tempo Real**

### **Painel Superior Direito:**
- **Dispositivos:** 2,547 (ativos)
- **IPs Gerenciados:** 15,892
- **VLANs:** 234
- **Compliance:** 98.7%
- **Uptime:** 99.99%

### **Atualizações:**
- Simuladas para demonstração
- Em produção: conectadas ao Prometheus
- Atualização automática a cada 5s

---

## 🎯 **Casos de Uso**

### **1. Apresentações Executivas**
```bash
# Use a vista "Visão Geral"
# Mostre a arquitetura completa
# Destaque as integrações
```

### **2. Treinamentos Técnicos**
```bash
# Use as vistas específicas
# Explique cada componente
# Mostre o fluxo de dados
```

### **3. Documentação Visual**
```bash
# Screenshots para docs
# GIFs animados
# Material de marketing
```

### **4. Onboarding**
```bash
# Novos desenvolvedores
# Entendem a arquitetura rapido
# Visual e intuitivo
```

---

## 🛠️ **Customização**

### **Alterar Cores:**
```javascript
// No arquivo index.html, linha ~180
const components = {
    netbox: {
        color: 0x3498db,  // Azul
        // ...
    },
    odoo: {
        color: 0x2ecc71,  // Verde
        // ...
    }
};
```

### **Adicionar Componente:**
```javascript
// 1. Adicionar aos components
const components = {
    // ... componentes existentes
    monitoring: {
        name: 'Prometheus',
        // ...
        color: 0xe67e22,
        position: { x: 6, y: 3, z: 6 }
    }
};

// 2. Auto-criado na inicialização
Object.keys(components).forEach(key => {
    createComponent(key, components[key]);
});
```

### **Alterar Posições:**
```javascript
// Edite a propriedade position
position: { x: 10, y: 0, z: 0 }
```

---

## 🎨 **Tecnologias Utilizadas**

### **Three.js:**
- Renderização 3D
- Geometrias e materiais
- Animações
- Interações

### **JavaScript ES6+:**
- Modules
- Async/Await
- Classes
- Arrow functions

### **Web APIs:**
- Canvas 2D
- WebGL
- RequestAnimationFrame
- Event Listeners

---

## 📱 **Responsividade**

### **Desktop (1200px+):**
- ✅ Experiência completa
- ✅ Todos os controles visíveis
- ✅ Performance otimizada

### **Tablet (768px - 1200px):**
- ✅ Adaptável
- ⚠️ Controles menores
- ✅ Funcionalidade mantida

### **Mobile (320px - 768px):**
- ✅ Básico funcional
- ⚠️ Interface simplificada
- ⚠️ Controles touch

---

## 🎬 **Demos Interativas**

### **Demo 1: Provisionamento**
1. Clique em "neo_stack"
2. Observe partículas azuis → NetBox
3. Veja sincronização com Odoo
4. Fluxo completo automatizado

### **Demo 2: Compliance Check**
1. Vá para vista "Flow"
2. Observe monitoramento contínuo
3. Partículas laranjas = Redis cache
4. Verde = tudo OK

### **Demo 3: Drift Detection**
1. Clique em "NetBox"
2. Foco no componente
3. Partículas vermelhas = alertas
4. Integração com neo_stack

---

## 🚀 **Integração com Laboratorio**

### **URLs Conectadas:**
- NetBox: http://localhost:8000
- Odoo: http://localhost:8069
- neo_stack: http://localhost:3000
- Grafana: http://localhost:3001
- **Visualização 3D: http://localhost:9000**

### **Dados Reais:**
```javascript
// Conectar com Prometheus
const prometheusURL = 'http://localhost:9090/api/v1/query?query=';

// Buscar métricas
fetch(prometheusURL + 'netbox_devices_total')
    .then(response => response.json())
    .then(data => updateStats(data));
```

---

## 💻 **Desenvolvimento**

### **Estrutura:**
```
visualization-3d/
├── index.html          # Página principal
├── README.md           # Esta documentação
└── assets/             # Assets (futuro)
    ├── textures/
    ├── models/
    └── sounds/
```

### **Comandos:**
```bash
# Servidor local
cd visualization-3d
python3 -m http.server 9000

# Build para produção
# (Minificar e otimizar)
```

### **Contribuir:**
1. Fork o repositório
2. Crie branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Pull Request

---

## 🎯 **Roadmap**

### **v1.1 - Próximas Funcionalidades**
- [ ] **Sons ambientes** - Audio ambiente
- [ ] **Modo noturno** - Tema escuro/claro
- [ ] **Animações avançadas** - Mais efeitos
- [ ] **Exportar imagens** - Screenshot automático

### **v1.2 - Integrações**
- [ ] **Dados reais** - Conectar com Prometheus
- [ ] **Alertas visuais** - Piscar em incidentes
- [ ] **Filtros** - Por tipo, status, etc.
- [ ] **Tour guiado** - Auto-navegação

### **v2.0 - VR/AR**
- [ ] **VR Support** - Oculus/Meta Quest
- [ ] **AR Mobile** - Visualizar data center
- [ ] **Holograma** - Projeção 3D
- [ ] ** Colaborativo** - Múltiplos usuários

---

## 📸 **Screenshots**

### **Visão Geral**
```
    🔵 NetBox    🟢 Odoo
         \       /
          \     /
        🟡 neo_stack
           |
        🔴 PostgreSQL
           |
        🟠 Redis
```

### **Fluxo de Dados**
```
🔵→🟡→🟢 = Sincronização
🟡↔🔴 = Database
🟡→🟠 = Cache
```

---

## 🤝 **Comunidade**

### **Discord:**
👉 **[Junte-se ao Canal](https://discord.gg/netbox-3d)**

### **GitHub:**
👉 **[Issues e Sugestões](https://github.com/neoand/netbox-odoo-stack/issues)**

### **LinkedIn:**
👉 **[NetBox 3D Community](https://linkedin.com/groups/netbox-3d)**

---

## 🎓 **Recursos de Aprendizado**

### **Three.js:**
- 📚 [Documentação Oficial](https://threejs.org/docs/)
- 🎥 [Tutorial YouTube](https://youtube.com/threejs)
- 💻 [Exemplos](https://threejs.org/examples/)

### **WebGL:**
- 📖 [WebGL Fundamentals](https://webglfundamentals.org/)
- 🎮 [WebGL Academy](https://webglacademy.com/)

---

## 📜 **Licença**

MIT License - Livre para uso e modificação

---

## 🏆 **Créditos**

**Desenvolvido com ❤️ pela equipe NetBox + Odoo + neo_stack**

**Especial thanks:**
- Three.js team
- WebGL community
- NetBox community

---

<div align="center">

## ✨ **Explore a Arquitetura em 3D!** ✨

**[👉 Abrir Visualização](index.html)**

---

**Visualização 3D v1.0 - Revolucionando a Documentação**
