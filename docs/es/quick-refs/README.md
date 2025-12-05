# 📚 Quick References - NetBox Odoo Stack

> **Guía rápida para desarrolladores apresurados**

---

## 🎯 **Catálogo de Referencias Rápidas**

### ⚡ **NetBox CLI**
```bash
# Comandos esenciales
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

| Ref | 📄 Archivo | 🎯 Foco | ⏱️ Tiempo |
|-----|------------|---------|-----------|
| 1️⃣ | [NetBox CLI](netbox-cli.md) | Comandos línea de comando | 5 min |
| 2️⃣ | [API Endpoints](api-endpoints.md) | REST/GraphQL endpoints | 10 min |
| 3️⃣ | [Docker Commands](docker-commands.md) | Containers y lab | 3 min |
| 4️⃣ | [Python Scripts](python-scripts.md) | Scripts útiles | 15 min |
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

# 4. Acceder
# NetBox: http://localhost:8000
# Odoo: http://localhost:8069
```

---

## 💡 **Tips Rápidos**

### ✅ **HACER**
- Siempre probar en entorno dev primero
- Usar tokens para API (no usuario/contraseña)
- Hacer backup antes de cambios grandes
- Documentar customizaciones
- Monitorear logs

### ❌ **NO HACER**
- No alterar DB directamente
- No compartir tokens
- No saltar tests
- No ignorar warnings
- No forget versionado

---

## 🔗 **Enlaces Útiles**

- 📖 [Documentación Completa](../README.md)
- 🎓 [Tutoriales](../learning/primeros-pasos.md)
- 💻 [API Guide](../dev/api-guide.md)
- 🐛 [Troubleshooting](../troubleshooting/)
- 🤝 [Comunidad](https://github.com/neoand/netbox-odoo-stack/discussions)

---

**⏰ Total: 9 Cheat Sheets | 68 comandos | 200+ ejemplos**
