# 📚 Quick References - NetBox Odoo Stack

> **Guia rápido para desenvolvedores empressados**

---

## 🎯 **Catálogo de Referências Rápidas**

### ⚡ **NetBox CLI**
```bash
# Comandos essenciais
nb-cli site list
nb-cli device add --name="Switch-01"
nb-cli vlan create --vid=100 --name="VLAN-100"
```

**[👉 Ver Cheat Sheet Completo](netbox-cli.md)**

### 🔌 **API Endpoints**
```python
# GET devices
GET /api/dcim/devices/

# POST new device
POST /api/dcim/devices/
{
  "name": "Server-01",
  "device_type": 1
}
```

**[👉 Ver API Reference](api-endpoints.md)**

### 🐳 **Docker Commands**
```bash
# Lab Docker
docker-compose up -d
docker-compose logs -f netbox
docker-compose down
```

**[👉 Ver Docker Cheat Sheet](docker-commands.md)**

### 🐍 **Python Scripts**
```python
# Add device
from pynetbox import api

nb = api("http://netbox:8000", token="YOUR_TOKEN")
site = nb.dcim.sites.get(name="São Paulo")

device = nb.dcim.devices.create(
    name="Switch-01",
    device_type=1,
    site=site.id
)
```

**[👉 Ver Code Snippets](python-scripts.md)**

---

## 📋 **Índice Completo**

| Ref | 📄 Arquivo | 🎯 Foco | ⏱️ Tempo |
|-----|------------|---------|----------|
| 1️⃣ | [NetBox CLI](netbox-cli.md) | Comandos linha de comando | 5 min |
| 2️⃣ | [API Endpoints](api-endpoints.md) | REST/GraphQL endpoints | 10 min |
| 3️⃣ | [Docker Commands](docker-commands.md) | Containers e lab | 3 min |
| 4️⃣ | [Python Scripts](python-scripts.md) | Scripts úteis | 15 min |
| 5️⃣ | [Odoo Integration](odoo-integration.md) | NetBox ↔ Odoo | 10 min |
| 6️⃣ | [Neo Stack](neo-stack.md) | Framework rápido | 10 min |
| 7️⃣ | [Device Types](device-types.md) | 500+ tipos | 5 min |
| 8️⃣ | [Configuration](configuration.md) | Settings | 8 min |
| 9️⃣ | [Common Tasks](common-tasks.md) | Day-to-day | 12 min |

---

## 🚀 **Quick Start**

```bash
# 1. NetBox CLI
pip install pynetbox-cli
nb-cli --help

# 2. Python API
pip install pynetbox requests

# 3. Docker Lab
git clone repo
cd lab && docker-compose up -d

# 4. Acessar
# NetBox: http://localhost:8000
# Odoo: http://localhost:8069
```

---

## 💡 **Dicas Rápidas**

### ✅ **DO**
- Sempre teste em ambiente dev primeiro
- Use tokens para API (não usuário/senha)
- Faça backup antes de mudanças grandes
- Documente customizações
- Monitore logs

### ❌ **DON'T**
- Não altere DB diretamente
- Não compartilhe tokens
- Não pule tests
- Não ignore warnings
- Não forget versionamento

---

## 🔗 **Links Úteis**

- 📖 [Documentação Completa](../README.md)
- 🎓 [Tutoriais](../learning/primeiros-passos.md)
- 💻 [API Guide](../dev/api-guide.md)
- 🐛 [Troubleshooting](../troubleshooting/)
- 🤝 [Comunidade](https://github.com/neoand/netbox-odoo-stack/discussions)

---

**⏰ Total: 9 Cheat Sheets | 68 comandos | 200+ exemplos**
