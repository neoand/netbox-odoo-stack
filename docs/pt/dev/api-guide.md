# Guia Prático de APIs NetBox

> **"API é o que conecta o NetBox ao resto do mundo. Dominar isso é dominar a automação."**

---

## 🎯 O que você vai aprender

- ✅ **Leitura** eficiente de dados (filters, includes, excludes)
- ✅ **Criação** e **atualização** de objetos
- ✅ **Operações em lote** (bulk)
- ✅ **Pagination** e performance
- ✅ **Custom fields** e extensões
- ✅ **Webhooks** e eventos
- ✅ **GraphQL** vs REST

---

## 🔑 Autenticação

### 1. Obter Token

```bash
# Via interface web (recomendado)
# Admin → Tokens → Add

# Ou via API
curl -X POST "http://localhost:8080/api/auth/token/" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Resposta:**
```json
{
  "token": "0123456789abcdef0123456789abcdef01234567",
  "key": "0123456789abcdef0123456789abcdef01234567"
}
```

### 2. Usar Token

```python
import pynetbox

nb = pynetbox.api(
    'http://localhost:8080',
    token='0123456789abcdef0123456789abcdef01234567'
)

# Ou curl direto
curl -H "Authorization: Token 0123456789abcdef..." \
  http://localhost:8080/api/dcim/devices/
```

---

## 📖 Leitura de Dados

### 1. Listar Todos os Objetos (.all())

```python
# ⚠️ CUIDADO: pode ser lento com muitos objetos
devices = nb.dcim.devices.all()

for device in devices:
    print(f"{device.name}: {device.serial}")
```

**Melhor usar quando:**
- Você sabe que são poucos registros (<100)
- Precisa fazer loop completo

---

### 2. Filtrar (.filter())

```python
# Filtrar por campo exato
devices_ativos = nb.dcim.devices.filter(status='active')

# Filtrar por múltiplos campos
devices_sp = nb.dcim.devices.filter(
    site__name='São Paulo',
    status='active'
)

# Filtros avançados
# Contém (LIKE)
devices = nb.dcim.devices.filter(name__ic='web')

# Inicia com
devices = nb.dcim.devices.filter(name__sw='web-')

# Termina com
devices = nb.dcim.devices.filter(name__ew='-prod')

# Múltiplos valores (IN)
devices = nb.dcim.devices.filter(
    status=['active', 'planned']
)

# Operações
devices_mais_de_10 = nb.dcim.devices.filter(u_height__gt=10)
devices_menos_de_5 = nb.dcim.devices.filter(u_height__lt=5)

# Exemplos de lookup:
# __exact ou __eq: =
# __iex: case-insensitive
# __ic: contains
# __sw: starts with
# __ew: ends with
# __gt: >
# __gte: >=
# __lt: <
# __lte: <=
```

---

### 3. Buscar Objeto Específico (.get())

```python
# Buscar por ID (mais rápido)
device = nb.dcim.devices.get(id=123)

# Buscar por campos únicos
device = nb.dcim.devices.get(name='web-server-01')

# ❌ ERRO: múltiplos resultados
# device = nb.dcim.devices.get(status='active')  # pode retornar vários

# ✅ CORRETO: usar filtro se não souber se é único
if nb.dcim.devices.filter(name='web-server-01'):
    device = nb.dcim.devices.get(name='web-server-01')
else:
    print("Não encontrado")

# Buscar relacionamentos
device = nb.dcim.devices.get(name='web-server-01')
print(device.site.name)  # Acessar dados relacionados
print(device.rack.name)
print(device.device_type.model)
```

---

### 4. Incluir/Excluir Campos (.only(), .omit())

```python
# ✅ BOM: reduzir payload
devices = nb.dcim.devices.only('id', 'name', 'status')

# ✅ BOM: excluir campos grandes
devices = nb.dcim.devices.omit('description', 'comments')

# ❌ RUIM: sem otimização (traz tudo)
devices = nb.dcim.devices.all()

# Útil para:
# - Listas grandes de dispositivos
# - Dashboards (precisa só de nome + status)
# - APIs públicas (reduzir tamanho)
```

---

## ✏️ Criação e Atualização

### 1. Criar Objeto (.create())

```python
# Exemplo: Criar dispositivo
device_type = nb.dcim.device_types.get(slug='dell-r740')
site = nb.dcim.sites.get(name='São Paulo')
role = nb.dcim.device_types.get(role='server')

device = nb.dcim.devices.create({
    'name': 'web-server-prod-01',
    'device_type': device_type.id,
    'site': site.id,
    'role': role.id,
    'status': 'active',
    'serial': 'ABC123XYZ',
    'asset_tag': 'WEB-001',
    'position': 10,  # U10
    'custom_fields': {
        'cost_center': 'TI-Infra',
        'environment': 'production'
    }
})

print(f"Device criado: {device.id}")
```

**Ordem de criação recomendada:**

```python
# 1. Preparar dados
manufacturer = nb.dcim.manufacturers.create({'name': 'Dell'})
device_type = nb.dcim.device_types.create({
    'manufacturer': manufacturer.id,
    'model': 'PowerEdge R740',
    'slug': 'dell-r740'
})
site = nb.dcim.sites.create({
    'name': 'São Paulo',
    'slug': 'sp-hq'
})
rack = nb.dcim.racks.create({
    'site': site.id,
    'name': 'Rack-01'
})
device = nb.dcim.devices.create({
    'device_type': device_type.id,
    'site': site.id,
    'rack': rack.id,
    'name': 'web-01',
    'position': 20  # U20
})
```

---

### 2. Atualizar Objeto

```python
# Método 1: Update direto
device = nb.dcim.devices.get(name='web-server-prod-01')
device.serial = 'NEW-SERIAL-123'
device.save()

# Método 2: Bulk update
nb.dcim.devices.filter(site__name='São Paulo').update({
    'status': 'active'
})

# Método 3: Atualizar custom fields
device['custom_fields']['environment'] = 'production'
device.save()
```

---

### 3. Deletar Objeto

```python
device = nb.dcim.devices.get(id=123)

# Deletar
device.delete()

# Bulk delete
nb.dcim.devices.filter(status='retired').delete()
```

---

## 📦 Operações em Lote (Bulk)

### 1. Bulk Create

```python
# Criar múltiplos dispositivos
device_type = nb.dcim.device_types.get(slug='dell-r740')
site = nb.dcim.sites.get(name='São Paulo')

devices_data = [
    {
        'name': f'web-server-{i:02d}',
        'device_type': device_type.id,
        'site': site.id,
        'status': 'active'
    }
    for i in range(1, 11)
]

created_devices = nb.dcim.devices.create(devices_data)
print(f"Criados {len(created_devices)} dispositivos")
```

---

### 2. Bulk Update

```python
# Atualizar status em lote
devices_to_update = nb.dcim.devices.filter(
    site__name='São Paulo',
    status='planned'
)

devices_to_update.update({
    'status': 'active'
})
```

---

### 3. Bulk Delete

```python
# Deletar dispositivos antigos
nb.dcim.devices.filter(
    status='retired',
    last_updated__lt='2023-01-01'
).delete()
```

---

## 📄 Paginação

### 1. Manual

```python
from pynetbox.core.query import RequestOptions

# Buscar com offset/limit
devices = nb.dcim.devices.all()
devices.limit = 50  # 50 por página

while True:
    batch = list(devices)
    if not batch:
        break

    for device in batch:
        print(device.name)

    if not devices.has_next:
        break
```

### 2. Automática (iteração)

```python
# PyNetBox itera automaticamente com paginação
for device in nb.dcim.devices.all():
    print(device.name)
    # Internamente, busca páginas conforme necessário
```

---

## 🔗 Relacionamentos

### 1. Forward Relationships (parent → child)

```python
device = nb.dcim.devices.get(name='web-server-01')

# Buscar interfaces do device
interfaces = device.interfaces.all()
for iface in interfaces:
    print(f"{iface.name}: {iface.connected_endpoint}")

# Buscar IPs da interface
for iface in interfaces:
    ips = nb.ipam.ip_addresses.filter(interface_id=iface.id)
    for ip in ips:
        print(f"  IP: {ip.address}")
```

---

### 2. Reverse Relationships (child → parent)

```python
# Buscar dispositivos por site
site = nb.dcim.sites.get(name='São Paulo')
devices = site.devices.all()

# Buscar dispositivos por rack
rack = nb.dcim.racks.get(name='Rack-01')
devices = rack.devices.all()

# Buscar IP por interface
interface = nb.dcim.interfaces.get(id=123)
ip_addresses = interface.ip_addresses.all()
```

---

### 3. Many-to-Many

```python
# Tags são many-to-many
device = nb.dcim.devices.get(name='web-server-01')

# Adicionar tag
tag = nb.extras.tags.create({
    'name': 'production',
    'slug': 'prod'
})
device.tags.append(tag)
device.save()

# Ver tags
for tag in device.tags:
    print(tag.name)
```

---

## ⚙️ Custom Fields

### 1. Criar Custom Field

```python
# Campo de texto
cost_center = nb.extras.custom_fields.create({
    'name': 'cost_center',
    'type': 'text',
    'label': 'Centro de Custo',
    'required': False,
    'weight': 100
})

# Campo de seleção
environment = nb.extras.custom_fields.create({
    'name': 'environment',
    'type': 'select',
    'choices': [
        {'value': 'production', 'label': 'Production'},
        {'value': 'staging', 'label': 'Staging'},
        {'value': 'development', 'label': 'Development'}
    ],
    'required': True
})

# Campo booleano
high_availability = nb.extras.custom_fields.create({
    'name': 'high_availability',
    'type': 'boolean',
    'label': 'Alta Disponibilidade'
})
```

---

### 2. Usar Custom Fields

```python
# Ao criar
device = nb.dcim.devices.create({
    'name': 'web-server-01',
    'custom_fields': {
        'cost_center': 'TI-Infra',
        'environment': 'production',
        'high_availability': True
    }
})

# Ao ler
device = nb.dcim.devices.get(name='web-server-01')
print(device.custom_fields['cost_center'])
print(device.custom_fields['environment'])

# Ao atualizar
device['custom_fields']['cost_center'] = 'TI-Development'
device.save()
```

---

## 🔔 Webhooks

### 1. Configurar Webhook

```python
# Via API
webhook = nb.extras.webhooks.create({
    'name': 'Device Created',
    'events': ['object_created'],
    'http_method': 'POST',
    'target_url': 'http://localhost:5000/webhook',
    'body_template': '''
{
    "event": "{{ event }}",
    "timestamp": "{{ timestamp }}",
    "data": {
        "device_id": "{{ data.id }}",
        "device_name": "{{ data.name }}",
        "site": "{{ data.site.name }}",
        "serial": "{{ data.serial }}"
    }
}
'''
})
```

---

### 2. Receber Webhook

```python
from flask import Flask, request, jsonify
import pynetbox

app = Flask(__name__)
nb = pynetbox.api('http://netbox', token='TOKEN_NETBOX')

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    data = request.json

    if data['event'] == 'object_created':
        device_name = data['data']['device_name']
        serial = data['data']['serial']
        site = data['data']['site']

        # Fazer algo: notificar Slack, criar no Odoo, etc.
        print(f"Device criado: {device_name} (S/N: {serial}) em {site}")

    return jsonify({'status': 'received'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## 📊 GraphQL

### 1. Query Básica

```python
query = '''
query {
  devices {
    id
    name
    status
    site {
      name
      location
    }
    device_type {
      manufacturer {
        name
      }
      model
    }
  }
}
'''

result = nb.graphql.query(query)
devices = result['data']['devices']

for device in devices:
    print(f"{device['name']}: {device['device_type']['manufacturer']['name']}")
```

### 2. Query com Filtros

```python
query = '''
query getDevice($name: String!) {
  devices(name: $name) {
    id
    name
    interfaces {
      name
      ip_addresses {
        address
      }
    }
  }
}
'''

result = nb.graphql.query(
    query,
    variables={'name': 'web-server-01'}
)
```

---

## 📚 Melhores Práticas

### 1. Performance

```python
# ✅ BOM: Filtrar e usar apenas campos necessários
devices = nb.dcim.devices.filter(
    site__name='São Paulo'
).only('id', 'name', 'status')

# ✅ BOM: Bulk operations
nb.dcim.devices.create(list_of_devices)

# ✅ BOM: Use get() quando souber o ID
device = nb.dcim.devices.get(id=123)

# ❌ RUIM: Trazer tudo e filtrar em Python
all_devices = nb.dcim.devices.all()
sp_devices = [d for d in all_devices if d.site.name == 'São Paulo']

# ❌ RUIM: Many queries
for site in nb.dcim.sites.all():
    print(f"{site.name}: {len(site.devices.all())}")
```

---

### 2. Error Handling

```python
import pynetbox

try:
    device = nb.dcim.devices.get(name='non-existent')
except pynetbox.RequestError as e:
    if e.req.status_code == 404:
        print("Device não encontrado")
    else:
        print(f"Erro: {e}")
except Exception as e:
    print(f"Erro inesperado: {e}")
```

---

### 3. Caching

```python
from functools import lru_cache

class NetBoxCache:
    def __init__(self, nb_api):
        self.nb = nb_api
        self._sites = None
        self._device_types = None

    @property
    def sites(self):
        if self._sites is None:
            self._sites = list(self.nb.dcim.sites.only('id', 'name'))
        return self._sites

    @property
    def device_types(self):
        if self._device_types is None:
            self._device_types = list(self.nb.dcim.device_types.only('id', 'model'))
        return self._device_types

# Uso
nb_cache = NetBoxCache(nb)
for site in nb_cache.sites:  # Só baixa uma vez
    print(site.name)
```

---

## 🧪 Exemplos Completos

### Exemplo 1: Sincronização com Odoo

```python
def sync_netbox_to_odoo():
    """
    Sincroniza devices do NetBox com produtos do Odoo
    """
    import xmlrpc.client

    # Conectar ao Odoo
    odoo = xmlrpc.client.ServerProxy('http://odoo:8069/xmlrpc/2/common')
    uid = odoo.authenticate('db', 'user', 'password', {})

    # Buscar devices no NetBox
    devices = nb.dcim.devices.filter(status='active')

    for device in devices:
        # Preparar dados para Odoo
        product_data = {
            'name': device.name,
            'default_code': device.asset_tag or f"NB-{device.id}",
            'serial_number': device.serial,
            'categ_id': [2, 'Hardware'],  # ID da categoria
            'type': 'product',
            'tracking': 'serial',
            'custom_fields': {
                'netbox_id': device.id,
                'site': device.site.name,
                'rack': device.rack.name if device.rack else None,
                'position': device.position
            }
        }

        # Buscar se já existe
        existing = odoo.execute_kw(
            'db', uid, 'password',
            'product.product', 'search_read',
            [[['default_code', '=', product_data['default_code']]]]
        )

        if existing:
            # Atualizar
            odoo.execute_kw(
                'db', uid, 'password',
                'product.product', 'write',
                [[existing[0]['id']], product_data]
            )
            print(f"Atualizado: {device.name}")
        else:
            # Criar
            product_id = odoo.execute_kw(
                'db', uid, 'password',
                'product.product', 'create',
                [product_data]
            )
            print(f"Criado: {device.name} (Odoo ID: {product_id})")

sync_netbox_to_odoo()
```

---

### Exemplo 2: Validação de Compliance

```python
def validate_device_compliance():
    """
    Verifica se devices seguem as políticas da empresa
    """
    violations = []

    devices = nb.dcim.devices.all()

    for device in devices:
        # Regra 1: Todo device deve ter asset_tag
        if not device.asset_tag:
            violations.append({
                'device': device.name,
                'rule': 'asset_tag_required',
                'severity': 'HIGH',
                'message': 'Device sem código de inventário'
            })

        # Regra 2: Device de produção deve estar em rack válido
        if device.status.value == 'active':
            if not device.rack:
                violations.append({
                    'device': device.name,
                    'rule': 'production_in_rack',
                    'severity': 'CRITICAL',
                    'message': 'Device ativo sem rack definido'
                })

        # Regra 3: Nome deve seguir padrão
        import re
        if not re.match(r'^[a-z]+-[a-z]+-\d+$', device.name):
            violations.append({
                'device': device.name,
                'rule': 'naming_convention',
                'severity': 'MEDIUM',
                'message': 'Nome não segue padrão: tipo-recurso-numero'
            })

    # Report
    if violations:
        print(f"❌ {len(violations)} violações encontradas:\n")
        for v in violations:
            print(f"[{v['severity']}] {v['device']}: {v['message']}")
    else:
        print("✅ Todos os devices em compliance")

    return violations

violations = validate_device_compliance()
```

---

### Exemplo 3: Geração de Configuração

```python
from jinja2 import Template

def generate_switch_config(device_id):
    """
    Gera configuração de switch baseado nos dados do NetBox
    """
    device = nb.dcim.devices.get(id=device_id)

    # Buscar interfaces configuradas
    interfaces = nb.dcim.interfaces.filter(
        device_id=device.id,
        enabled=True
    )

    # Template Jinja2
    template = Template('''
hostname {{ device.name }}

interface Loopback0
 ip address {{ device.loopback_ip }}/32

{% for interface in interfaces %}
interface {{ interface.name }}
 description {{ interface.description or 'Configured via NetBox' }}
{% if interface.untagged_vlan %}
 switchport access vlan {{ interface.untagged_vlan.vid }}
{% endif %}
{% if interface.mode == 'tagged' %}
 switchport trunk allowed vlan {{ interface.tagged_vlans|join(',') }}
{% endif %}
 no shutdown

{% endfor %}

ip route 0.0.0.0/0 {{ device.default_gateway }}
    ''')

    config = template.render(
        device=device,
        interfaces=interfaces
    )

    return config

# Gerar configuração
config = generate_switch_config(123)
print(config)
```

---

## 📖 Recursos

### Documentação
- **[PyNetBox Docs](https://pynetbox.readthedocs.io/)**
- **[NetBox API Reference](https://docs.netbox.dev/en/stable/api-guide/)**
- **[REST API Quickstart](https://docs.netbox.dev/en/stable/integrations/api/)**

### Exemplos
- **[NetBox Labs Scripts](https://github.com/netbox-community/netbox/scripts)**
- **[NetBox Docker Scripts](https://github.com/netbox-community/netbox-docker/tree/main/scripts)**

---

> **"API é o espelho do sistema. Quanto mais você a usa, mais você entende o NetBox."**