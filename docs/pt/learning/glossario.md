# Glossário Interativo: Termos que Você Precisa Conhecer

> **"Se você não sabe o que significa, não conseguirá amar o que faz"**

---

## 📚 Índice Rápido

**[Conceitos Básicos](#conceitos-básicos)** | **[NetBox Específico](#netbox-específico)** | **[Integração](#integração)** | **[Infraestrutura](#infraestrutura)**

---

## 🎯 Conceitos Básicos

### CMDB (Configuration Management Database)

**O que é:** Base de dados que armazena informações sobre componentes de TI (hardware, software, serviços).

**Por que existe:** Imagin e uma planilha do Excel gigante que tem TUDO da sua infraestrutura: onde está cada servidor, qual software roda onde, quem é responsável por cada coisa.

**Exemplo prático:**
```
Antes do CMDB:
  - "João, onde está o servidor de email?"
  - "Deixe eu verificar... *busca por 30 min*"
  - "Ah, tá na sala do servidor, rack 5, posição 15"

Com CMDB:
  - "NetBox, onde está o servidor de email?"
  - "Mail-Server-01: Rack-05, U15, IP 192.168.1.10, responsável: Maria"
```

**Por que developers devem se importar:** É a **fonte única da verdade**. Qualquer automação que você fizer depende desses dados corretos.

---

### IPAM (IP Address Management)

**O que é:** Sistema para gerenciar endereços IP (quem usa qual IP, sub-redes, conflitos).

**A dor que resolve:** Imagine 3 planilhas diferentes com IPs. Qual está certa? Quando um servidor não conecta, como descobrir se é conflito de IP?

**Exemplo:**
```
Sem IPAM:
  ❌ Planilha-1: 192.168.1.10 → Servidor A
  ❌ Planilha-2: 192.168.1.10 → Servidor B  (DANGER!)
  ❌ Planilha-3: 192.168.1.11 → Servidor C

Com NetBox (IPAM):
  ✅ NetBox: 192.168.1.10 → Assigned to Servidor A
  ✅ NetBox mostra: IP livre 192.168.1.11 para Servidor C
  ✅ Validação automática evita conflitos
```

---

### IDCIM (Data Center Infrastructure Management)

**O que é:** Gestão da infraestrutura física do datacenter: racks, energia, cooling, cabos.

**O que inclui:**
- **Sites** (onde estão os datacenters)
- **Racks** (cada "prateleira" para equipamentos)
- **Cabos** (como está interconectado)

**Por que importa:** Sem isso, como saber qual rack tem espaço? Como mapear dependências? Como um técnico encontra o servidor no rack?

---

## 🔧 NetBox Específico

### Site

**O que é:** Representa uma localização física (ex: Datacenter São Paulo, Escritório Rio de Janeiro).

**Campos importantes:**
```yaml
name: "São Paulo HQ"
location: "Alameda Santos, 1000"
description: "Datacenter principal"
status: "Active"  # ou Planned, Staged, Retired
```

**Exemplo prático:** Site "SP-HQ" tem 5 racks, 120 servidores, 50 switches.

---

### Rack

**O que é:** Estrutura física que hospeda equipamentos. Tem unidades (U) numeradas (geralmente 42U).

**Exemplo de layout:**
```
Rack-01 (U42 no topo → U1 embaixo):
  U42: Switch Core 01
  U41: Switch Access 01
  U40: Patch Panel 01
  ...
  U20: Servidor Web 03
  ...
  U01: Patch Panel Bottom
```

**Por que developers precisam saber:** Quando um equipamento falha, você precisa saber exatamente onde está fisicamente.

---

### Device (Dispositivo)

**O que é:** Qualquer equipamento: servidor, switch, roteador, storage, etc.

**Exemplo:**
```yaml
name: "web-server-prod-01"
device_type: "Dell PowerEdge R740"
role: "Web Server"
status: "Active"
site: "SP-HQ"
rack: "Rack-15"
position: "20"  # U20
serial: "ABC123XYZ"
asset_tag: "WEB-001"
```

**Device Type vs Device:**
- **Device Type**: Template (ex: "Dell PowerEdge R740") - define specs
- **Device**: Instância real (ex: "web-server-prod-01") - usa o template

---

### Interface

**O que é:** Porta física ou virtual em um dispositivo.

**Tipos:**
- **Physical**: eth0, gig0/1, fa1/0/24
- **Virtual**: VLAN interfaces, loopback, SVI

**Exemplo:**
```yaml
name: "eth0"
type: "1000base-t"  # velocidade
enabled: true
mac_address: "00:11:22:33:44:55"
mtu: 1500
```

---

### IP Address

**O que é:** Endereço IPv4 ou IPv6 atribuído a uma interface.

**Estados:**
- **Active**: Em uso
- **Available**: Livre para usar
- **Reserved**: Reservado (não usar ainda)
- **Deprecated**: Descontinuado

**Exemplo:**
```yaml
address: "192.168.1.10/24"
status: "Active"
interface: "eth0"  # a qual interface está attached
description: "Web Server Production"
```

---

### Prefix (Prefixo de Rede)

**O que é:** Bloco de endereços de rede (ex: 192.168.0.0/24).

**Hierarquia:**
```
192.168.0.0/16 (rede classe B)
  ├── 192.168.1.0/24 (sub-rede 1)
  ├── 192.168.2.0/24 (sub-rede 2)
  └── 192.168.3.0/24 (sub-rede 3)
```

**Uso:** Organiza a rede por função ou departamento.

---

### VLAN (Virtual LAN)

**O que é:** Rede virtual isolada dentro da mesma rede física.

**Exemplo:**
```
VLAN 100: Usuários (192.168.100.0/24)
VLAN 200: Servidores (192.168.200.0/24)
VLAN 300: IoT (192.168.300.0/24)

Mesmo switch físico, mas tráfego isolado.
```

---

### VRF (Virtual Routing and Forwarding)

**O que é:** Instância virtual de roteamento. Múltiplas tabelas de roteamento na mesma rede física.

**Uso típico:**
- VRF-Production: Serviços de produção
- VRF-Development: Ambiente de desenvolvimento
- VRF-Guest: WiFi de visitantes

---

### Custom Fields

**O que é:** Campos personalizados que você cria para adicionar dados específicos do seu negócio.

**Exemplo:**
```python
# Criar custom field no NetBox
{
  'name': 'codigo_inventario',
  'type': 'text',
  'label': 'Código de Inventário',
  'required': True
}

# Usar no dispositivo
device = {
  'name': 'web-server-01',
  'custom_fields': {
    'codigo_inventario': 'INV-2024-001'
  }
}
```

**Exemplos de custom fields úteis:**
- `cost_center` (centro de custo para Odoo)
- `warranty_end` (fim da garantia)
- `responsible_team` (equipe responsável)
- `environment` (prod, homolog, dev)

---

## 🔗 Integração

### Webhook

**O que é:** HTTP POST automático que o NetBox dispara quando algo acontece.

**Fluxo:**
```
1. Usuário cria device no NetBox
2. NetBox detecta: "evento occurred!"
3. NetBox faz POST para URL configurada
4. Seu sistema recebe: {event: "create", data: {...}}
5. Seu sistema processa (ex: criar no Odoo)
```

**Payload exemplo:**
```json
{
  "event": "create",
  "timestamp": "2024-12-04T10:30:00Z",
  "data": {
    "id": 123,
    "name": "switch-core-01",
    "serial": "ABC123",
    "site": "São Paulo HQ"
  }
}
```

---

### REST API

**O que é:** Interface HTTP para ler/escrever dados do NetBox.

**Exemplo de requisição:**
```bash
# Listar devices (GET)
GET http://netbox/api/dcim/devices/

# Criar device (POST)
POST http://netbox/api/dcim/devices/
{
  "name": "servidor-teste",
  "device_type": 15,
  "role": 3,
  "status": "active"
}

# Autenticação via token
curl -H "Authorization: Token abc123def456" \
     http://netbox/api/dcim/devices/
```

---

### GraphQL

**O que é:** Linguagem de consulta que permite buscar dados de forma flexível.

**Exemplo:**
```graphql
query {
  devices {
    id
    name
    serial
    site {
      name
      location
    }
    interfaces {
      name
      enabled
      ip_addresses {
        address
      }
    }
  }
}
```

**Vantagem:** Busca exatamente o que você quer, nada mais.

---

### Plugin

**O que é:** Extensão que adiciona funcionalidades ao NetBox.

**Tipos:**
- **UI Extensions**: Abas, botões, formulários customizados
- **Data Validation**: Regras de validação personalizadas
- **Custom Scripts**: Jobs automatizados
- **Reports**: Relatórios customizados

---

### Job / Script

**O que é:** Tarefa automatizada que roda no NetBox.

**Exemplo de uso:**
- Sincronização com Odoo (nightly)
- Backup de configurações
- Validação de compliance
- Limpeza de IPs órfãos

---

## 🏗️ Infraestrutura

### Interface (Conceito de Rede)

**O que é:** Ponto de conexão entre dispositivos.

**Exemplo de conexão:**
```
Switch-Core-01: eth0
        ↕️ (cabo de rede)
Servidor-Web-01: eth0
```

**Como aparece no NetBox:**
```
Interface Connection:
  Switch-Core-01:eth0 ⟷ Servidor-Web-01:eth0
  Status: Connected
```

---

### Cable / Cable Terminations

**O que é:** Registro de cabos e onde eles estão conectados.

**Por que importa:**
- Mapeamento visual da rede
- Identificar pontos de falha
- Auditoria de cabling

---

### Power Panel / Power Port

**O que é:** Gerenciamento de energia (onde cada equipamento está plugado).

**Problema que resolve:** "O rack desligou, quais equipamentos foram afetados?"

---

### Platform

**O que é:** Sistema operacional ou plataforma (Linux, Windows, Cisco IOS, etc.).

**Uso:** Usado por plugins de automação (Ansible, etc.).

---

### Manufacturer / Device Type

**O que é:** Catálogo de hardware.

```
Manufacturer: Dell
  └─ Device Type: PowerEdge R740
      └─ Device: web-server-01
```

---

## 🔍 Dicas Práticas para Developers

### 1. Entenda a Hierarquia

```
Site
 └─ Rack (dentro do Site)
     └─ Device (no Rack)
         └─ Interface (no Device)
             └─ IP Address (na Interface)
```

**Sempre pense:** "Se eu deleto X, o que acontece com Y?"

### 2. IDs vs Nomes

```python
# ❌ RUIM: Buscar por nome (pode mudar)
device = nb.dcim.devices.get(name='servidor-web')

# ✅ BOM: Buscar por ID (único e estável)
device = nb.dcim.devices.get(id=123)

# ⚠️ ACEITÁVEL: Filtros com campos únicos
device = nb.dcim.devices.get(serial='ABC123')
```

### 3. Bulk Operations

```python
# ❌ LENTO: Um por vez
for ip in lista_ips:
    nb.ipam.ip_addresses.create(ip)

# ✅ RÁPIDO: Bulk
nb.ipam.ip_addresses.create(lista_ips)
```

### 4. Custom Fields são seus amigos

```python
# Salvar dados do Odoo no NetBox
device['custom_fields'] = {
    'odoo_id': 456,
    'custo': 15000,
    'centro_custo': 'TI-Infra'
}
```

---

## 📖 Leitura Complementar

### Documentação Oficial
- **[NetBox Docs](https://docs.netbox.dev/)** - Documentação completa
- **[PyNetBox](https://pynetbox.readthedocs.io/)** - Client Python

### Comunidades
- **[NetBox Community](https://github.com/netbox-community/netbox/discussions)**
- **[NetBox Discord](https://discord.gg/netbox)**

### Exemplos Práticos
- **[GitHub: netbox-examples](https://github.com/netbox-community/netbox/discussions)**

---

> **"Palavras são importantes. Quando todos falam a mesma língua, a comunicação flui e as soluções nascem naturalmente."**