# Troubleshooting para Desenvolvedores Iniciantes

> **"Todo erro é uma oportunidade de aprender. Estes são os erros mais comuns e como resolver rapidamente."**

---

## 🚀 Problemas de Setup

### ❌ Erro: "Cannot connect to NetBox"

**Sintomas:**
```bash
requests.exceptions.ConnectionError:
HTTPSConnectionPool(host='localhost', port=8080):
Max retries exceeded with url: /api/
```

**Causa mais comum:** NetBox não está rodando ou porta bloqueada.

**Solução passo a passo:**

```bash
# 1. Verificar se containers estão rodando
docker compose ps

# Se não estão:
docker compose up -d

# 2. Verificar logs se ainda falhar
docker compose logs netbox

# 3. Verificar se a porta está aberta
netstat -tulpn | grep 8080

# Se nada rodar, verificar firewall:
sudo ufw status  # Linux
sudo pfctl -s info  # macOS

# 4. Testar localmente
curl http://localhost:8080
# Deve retornar HTML, não "Connection refused"
```

**✅ Solução definitiva:**
```bash
# Rebuild completo
docker compose down -v
docker compose pull
docker compose up -d --force-recreate

# Aguardar "healthy"
docker compose ps
# Status deve ser "healthy", não "starting"
```

---

### ❌ Erro: "Authentication failure" na API

**Sintomas:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Causa:** Token não enviado ou token inválido.

**Solução:**

```python
# ✅ CORRETO
nb = pynetbox.api(
    'http://localhost:8080',
    token='SEU_TOKEN_AQUI'  # ← sem Bearer, sem "Token"
)

# ❌ ERRADO
nb = pynetbox.api(
    'http://localhost:8080',
    token='Bearer SEU_TOKEN'  # ← não use "Bearer"
)

# ❌ ERRADO
nb = pynetbox.api(
    'http://localhost:8080',
    token='Token SEU_TOKEN'  # ← não use "Token"
)
```

**Como criar token:**

1. Acesse interface web: http://localhost:8080
2. Admin → Tokens → Add
3. Preencha:
   ```
   Token: (deixe vazio, será gerado)
   Label: Dev Token
   Description: Para desenvolvimento
   Expiration: (opcional)
   ```
4. **Copie o token gerado** ( só aparece uma vez!)
5. Use no código

---

### ❌ Erro: "500 Internal Server Error" na API

**Sintomas:**
```json
{
  "detail": "Internal server error"
}
```

**Solução:**

```bash
# 1. Verificar logs detalhados
docker compose logs netbox | tail -100

# 2. Comum: PostgreSQL indisponível
docker compose logs postgres

# Se PostgreSQL falhar, reinicia:
docker compose restart postgres
sleep 5
docker compose restart netbox

# 3. Verificar conectividade
docker compose exec netbox psql -h postgres -U netbox -d netbox -c "SELECT 1;"

# 4. Migração pendente?
docker compose exec netbox /opt/netbox/netbox/manage.py migrate
```

---

## 🔍 Problemas de Dados

### ❌ Erro: "Object has no attribute 'id'"

**Sintomas:**
```python
device = nb.dcim.devices.get(name='servidor-xpto')
print(device.site.id)  # ← Erro aqui
AttributeError: 'str' object has no attribute 'id'
```

**Causa:** `site` retorna um **dicionário** (ou ID), não objeto.

**Solução:**

```python
# ❌ ERRADO
site_id = device.site.id

# ✅ CORRETO (se for objeto)
site_id = device.site.id

# ✅ CORRETO (se for dict)
site_id = device.site['id']

# ✅ CORRETO (se for ID, buscar objeto completo)
site = nb.dcim.sites.get(device.site)
site_id = site.id

# 🔍 DEBUG: Veja o tipo
print(type(device.site))  # <class 'int'> ou <class 'dict'>

# 🔍 DEBUG: Veja o conteúdo
print(device.site)  # {'id': 1, 'name': 'SP-HQ'} ou apenas 1
```

---

### ❌ Erro: "Related object not found"

**Sintomas:**
```python
nb.dcim.devices.create({
    'name': 'teste',
    'device_type': 'Dell-R740',  # ← ERRO: deve ser ID, não nome
})
pynetbox.RequestError: related object not found
```

**Causa:** Tentativa de usar **nome** quando deveria usar **ID**.

**Solução:**

```python
# ❌ ERRADO (nome)
device_type = 'Dell-R740'

# ✅ CORRETO (buscar ID por nome)
device_type_obj = nb.dcim.device_types.get(slug='dell-r740')
device_type_id = device_type_obj.id

# Ou buscar por fabricante e modelo
device_type_obj = nb.dcim.device_types.get(
    manufacturer__name='Dell',
    model='PowerEdge R740'
)

# Depois criar device:
nb.dcim.devices.create({
    'name': 'teste',
    'device_type': device_type_obj.id,  ← usar ID
    'site': site_obj.id,
    'role': role_obj.id,
})
```

**Tip:** Sempre use `.get()` ou `.filter()` para obter IDs antes de criar.

---

### ❌ Erro: "Custom field validation failed"

**Sintomas:**
```json
{
  "custom_fields": {
    "cost_center": "TI-123"
  }
}
# Retorna: "custom field 'cost_center' does not exist"
```

**Causa:** Custom field não existe ou tipo incorreto.

**Solução:**

```python
# 1. Listar custom fields existentes
fields = nb.extras.custom_fields.all()
for field in fields:
    print(f"{field.name}: {field.type}")

# 2. Criar custom field (se não existir)
field = nb.extras.custom_fields.create({
    'name': 'cost_center',
    'type': 'text',
    'label': 'Centro de Custo',
    'required': False,
    'weight': 100
})

# 3. Usar no device
nb.dcim.devices.create({
    'name': 'teste',
    'custom_fields': {
        'cost_center': 'TI-123'  ← value deve bater com o tipo
    }
})

# ⚠️ Tipos de custom field:
# - text: string
# - integer: int
# - boolean: True/False
# - date: '2024-12-01'
# - select: um dos choices
# - multiselect: lista de choices
```

---

## 🔄 Problemas de Integração

### ❌ Erro: Webhook não dispara

**Sintomas:** NetBox registra mudança, mas webhook não envia POST.

**Diagnóstico:**

```bash
# 1. Verificar se webhook está configurado
curl -H "Authorization: Token SEU_TOKEN" \
  http://localhost:8080/api/extras/webhooks/

# 2. Verificar eventos registrados
# No NetBox UI: Admin → Webhooks → Logs

# 3. Testar manualmente o webhook
curl -X POST http://SEU_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": "payload"}'
```

**Solução comum:**

```python
# Webhook configurado errado?
{
    "name": "Test Webhook",
    "events": ["create", "update"],  ← events, não event
    "type_create": true,  ← ❌ errado
    "type_update": true   ← ❌ errado
}

# ✅ CORRETO
{
    "name": "Test Webhook",
    "events": ["object_created", "object_updated"],
    "http_method": "POST",
    "payload_url": "http://localhost:5000/webhook"
}
```

---

### ❌ Erro: "Rate limit exceeded"

**Sintomas:**
```json
{
  "detail": "Request was throttled."
}
```

**Causa:** Muita requisição muito rápida.

**Solução:**

```python
# Usar rate limiting automático
import time
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

session = requests.Session()

retry = Retry(
    total=3,
    backoff_factor=1,  # espera 1s, 2s, 4s
    status_forcelist=[429, 500, 502, 503, 504],
)

adapter = HTTPAdapter(max_retries=retry)
session.mount('http://', adapter)
session.mount('https://', adapter)

# Ou PyNetBox: usar threading
nb = pynetbox.api('http://localhost:8080', token='token')
nb.http_timeout = 30

# Para bulk operations, use threading:
from concurrent.futures import ThreadPoolExecutor

def criar_device(device_data):
    return nb.dcim.devices.create(device_data)

devices_data = [...]  # lista grande
with ThreadPoolExecutor(max_workers=3) as executor:
    executor.map(criar_device, devices_data)
```

---

## 🗃️ Problemas de Banco de Dados

### ❌ Erro: "relation does not exist"

**Sintomas:**
```sql
SELECT * FROM dcim_device;
ERROR: relation "dcim_device" does not exist
```

**Causa:** Migrações não rodaram ou versão incorreta.

**Solução:**

```bash
# 1. Verificar versão do NetBox
docker compose exec netbox /opt/netbox/netbox/manage.py showmigrations

# 2. Rodar migrações
docker compose exec netbox /opt/netbox/netbox/manage.py migrate

# 3. Se falhar, verificar schema
docker compose exec netbox /opt/netbox/netbox/manage.py dbshell

# No PostgreSQL:
\dt  # listar tabelas
\q   # sair
```

---

### ❌ Erro: "duplicate key value violates unique constraint"

**Sintomas:**
```sql
INSERT INTO dcim_device (name) VALUES ('servidor-01');
ERROR: duplicate key value violates unique constraint "dcim_device_name_key"
```

**Causa:** Tentativa de criar registro duplicado.

**Solução:**

```python
# ❌ ERRADO (criar sem verificar)
nb.dcim.devices.create({'name': 'servidor-01'})

# ✅ CORRETO (verificar se existe)
existing = nb.dcim.devices.get(name='servidor-01')
if not existing:
    nb.dcim.devices.create({'name': 'servidor-01'})
else:
    print("Device já existe")

# Ou usar get_or_create (se disponível)
try:
    device = nb.dcim.devices.get(name='servidor-01')
except pynetbox.RequestError:
    device = nb.dcim.devices.create({'name': 'servidor-01'})
```

---

## 📊 Problemas de Performance

### ❌ Erro: "Query takes forever"

**Sintomas:** `.all()` demora muito ou dá timeout.

**Causa:** Buscando muitos objetos sem paginação.

**Solução:**

```python
# ❌ ERRADO (buscar tudo de uma vez)
devices = nb.dcim.devices.all()  # 10.000 devices!
for device in devices:  ← demorou 5 minutos
    print(device.name)

# ✅ CORRETO (paginação)
from pynetbox.core.query import RequestOptions

devices = nb.dcim.devices.all()
while True:
    batch = list(devices)
    if not batch:
        break

    for device in batch:
        print(device.name)

    if not devices.has_next:
        break

# ✅ MELHOR (filtrar apenas o necessário)
devices = nb.dcim.devices.filter(
    site__name='São Paulo',  ← filtrar por site
    status='active'          ← filtrar por status
)

# ✅ IDEAL (usar apenas campos necessários)
devices = nb.dcim.devices.filter(
    site__name='São Paulo'
).only('id', 'name', 'status')  ← só campos que precisa

# ✅ MELHOR AINDA (buscar por ID se souber)
device = nb.dcim.devices.get(id=123)  ← instantâneo
```

---

## 🔐 Problemas de Permissão

### ❌ Erro: "Permission denied"

**Sintomas:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Causa:** Token sem permissões ou usuário sem direito.

**Solução:**

```python
# 1. Ver permissões do token
# UI: Admin → Tokens → (seu token) → Permissions

# 2. Permissões mínimas para leitura:
# - dcim.view_site
# - dcim.view_rack
# - dcim.view_device
# - ipam.view_prefix
# - ipam.view_ipaddress

# 3. Para escrita:
# - dcim.add_device
# - dcim.change_device
# - etc.

# 4. Criar grupo de permissões
# UI: Admin → Groups → Add
#      → Permissions → marcar permissões
#      → Users → adicionar usuários

# 5. Verificar se objeto tem restriçóes
device = nb.dcim.devices.get(id=123)
print(device)  # Se não aparece, sem permissão
```

---

## 🧪 Debugging: Ferramentas Essenciais

### 1. Debug PyNetBox

```python
import logging

# Ativar debug
logging.basicConfig(level=logging.DEBUG)
nb = pynetbox.api('http://localhost:8080', token='token')

# Agora todas as requisições aparecem nos logs:
# DEBUG:pynetbox.core.query: GET http://localhost:8080/api/dcim/devices/
```

### 2. Inspecionar Payload

```python
# Ver requisição HTTP sendo enviada
import requests

session = requests.Session()
session.auth = ('Token', 'token')

response = session.get('http://localhost:8080/api/dcim/devices/')
print(response.request.headers)
print(response.request.body)
```

### 3. Validar Dados

```python
def validate_device_data(data):
    required_fields = ['name', 'device_type', 'site']
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Campo obrigatório: {field}")

    if 'name' in data and len(data['name']) > 50:
        raise ValueError("Nome muito longo")

    # Validar que IDs são inteiros
    int_fields = ['device_type', 'site', 'role']
    for field in int_fields:
        if field in data and not isinstance(data[field], int):
            print(f"⚠️ {field} deve ser ID (int), não {type(data[field])}")

# Antes de criar
validate_device_data(device_data)
device = nb.dcim.devices.create(device_data)
```

---

## 📞 Quando Pedir Ajuda

### Antes de abrir issue:

✅ **Já tentou**:
- [ ] Reiniciar containers
- [ ] Verificar logs
- [ ] Testar com curl/hTTPie
- [ ] Ler documentação oficial
- [ ] Procurar no Google
- [ ] Procurar no GitHub Discussions

✅ **Informações que incluir**:
- Versão do NetBox (`docker compose exec netbox /opt/netbox/netbox/manage.py --version`)
- Logs completos
- Código mínimo que reproduz o erro
- Python version (`python --version`)

### Canais de Ajuda
1. **[GitHub Discussions](https://github.com/netbox-community/netbox/discussions)** - Melhor para bugs
2. **[Discord](https://discord.gg/netbox)** - Melhor para dúvidas rápidas
3. **[Stack Overflow](https://stackoverflow.com/questions/tagged/netbox)** - Search primeiro!

---

## 🎯 Checklist de Diagnóstico

```bash
# ✅ Execute sempre antes de reported bug:

# 1. NetBox healthy?
docker compose ps

# 2. Versão correta?
docker compose exec netbox /opt/netbox/netbox/manage.py --version

# 3. Conectividade ok?
curl -I http://localhost:8080

# 4. API responde?
curl -H "Authorization: Token SEU_TOKEN" \
  http://localhost:8080/api/

# 5. Token tem permissões?
curl -H "Authorization: Token SEU_TOKEN" \
  http://localhost:8080/api/dcim/sites/

# 6. Logs sem erro?
docker compose logs netbox | tail -20

# 7. Banco ok?
docker compose exec postgres psql -U netbox -d netbox -c "SELECT 1;"
```

**Se todos passarem → o problema é no seu código!**

---

> **"Erro que não debugamos vira lenda urbana. Erro que debugamos vira conhecimento compartilhado."**