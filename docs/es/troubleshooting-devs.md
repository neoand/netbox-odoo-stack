# Troubleshooting para Desarrolladores Principiantes

> **"Todo error es una oportunidad de aprender. Estos son los errores más comunes y cómo resolverlos rápidamente."**

---

## 🚀 Problemas de Setup

### ❌ Error: "Cannot connect to NetBox"

**Síntomas:**
```bash
requests.exceptions.ConnectionError:
HTTPSConnectionPool(host='localhost', port=8080):
Max retries exceeded with url: /api/
```

**Causa más común:** NetBox no está corriendo o puerto bloqueado.

**Solución paso a paso:**

```bash
# 1. Verificar si containers están corriendo
docker compose ps

# Si no están:
docker compose up -d

# 2. Verificar logs si aún falla
docker compose logs netbox

# 3. Verificar si el puerto está abierto
netstat -tulpn | grep 8080

# Si nada corre, verificar firewall:
sudo ufw status  # Linux
sudo pfctl -s info  # macOS

# 4. Probar localmente
curl http://localhost:8080
# Debe retornar HTML, no "Connection refused"
```

**✅ Solución definitiva:**
```bash
# Rebuild completo
docker compose down -v
docker compose pull
docker compose up -d --force-recreate

# Aguardar "healthy"
docker compose ps
# Status debe ser "healthy", no "starting"
```

---

### ❌ Error: "Authentication failure" en la API

**Síntomas:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Causa:** Token no enviado o token inválido.

**Solución:**

```python
# ✅ CORRECTO
nb = pynetbox.api(
    'http://localhost:8080',
    token='TU_TOKEN_AQUI'  # ← sin Bearer, sin "Token"
)

# ❌ MALO
nb = pynetbox.api(
    'http://localhost:8080',
    token='Bearer TU_TOKEN'  # ← no uses "Bearer"
)

# ❌ MALO
nb = pynetbox.api(
    'http://localhost:8080',
    token='Token TU_TOKEN'  # ← no uses "Token"
)
```

**Cómo crear token:**

1. Accede a interfaz web: http://localhost:8080
2. Admin → Tokens → Add
3. Llena:
   ```
   Token: (déjalo vacío, se generará)
   Label: Dev Token
   Description: Para desarrollo
   Expiration: (opcional)
   ```
4. **Copia el token generado** (¡solo aparece una vez!)
5. Usa en el código

---

### ❌ Error: "500 Internal Server Error" en la API

**Síntomas:**
```json
{
  "detail": "Internal server error"
}
```

**Solución:**

```bash
# 1. Verificar logs detallados
docker compose logs netbox | tail -100

# 2. Común: PostgreSQL no disponible
docker compose logs postgres

# Si PostgreSQL falla, reinicia:
docker compose restart postgres
sleep 5
docker compose restart netbox

# 3. Verificar conectividad
docker compose exec netbox psql -h postgres -U netbox -d netbox -c "SELECT 1;"

# 4. ¿Migración pendiente?
docker compose exec netbox /opt/netbox/netbox/manage.py migrate
```

---

## 🔍 Problemas de Datos

### ❌ Error: "Object has no attribute 'id'"

**Síntomas:**
```python
device = nb.dcim.devices.get(name='servidor-xpto')
print(device.site.id)  # ← Error aquí
AttributeError: 'str' object has no attribute 'id'
```

**Causa:** `site` retorna un **diccionario** (o ID), no objeto.

**Solución:**

```python
# ❌ MALO
site_id = device.site.id

# ✅ CORRECTO (si es objeto)
site_id = device.site.id

# ✅ CORRECTO (si es dict)
site_id = device.site['id']

# ✅ CORRECTO (si es ID, buscar objeto completo)
site = nb.dcim.sites.get(device.site)
site_id = site.id

# 🔍 DEBUG: Ver el tipo
print(type(device.site))  # <class 'int'> o <class 'dict'>

# 🔍 DEBUG: Ver el contenido
print(device.site)  # {'id': 1, 'name': 'SP-HQ'} o solo 1
```

---

### ❌ Error: "Related object not found"

**Síntomas:**
```python
nb.dcim.devices.create({
    'name': 'test',
    'device_type': 'Dell-R740',  # ← ERROR: debe ser ID, no nombre
})
pynetbox.RequestError: related object not found
```

**Causa:** Intento de usar **nombre** cuando debería usar **ID**.

**Solución:**

```python
# ❌ MALO (nombre)
device_type = 'Dell-R740'

# ✅ CORRECTO (buscar ID por nombre)
device_type_obj = nb.dcim.device_types.get(slug='dell-r740')
device_type_id = device_type_obj.id

# Usar el ID en la creación
device = nb.dcim.devices.create({
    'name': 'test',
    'device_type': device_type_id,  # ← Usar el ID
})
```

**Lista de campos que necesitan IDs en lugar de nombres:**

| Campo | Tipo de Valor | Ejemplo |
|-------|--------------|---------|
| `device_type` | ID | `123` |
| `site` | ID | `1` |
| `rack` | ID | `45` |
| `device_role` | ID | `2` |
| `manufacturer` | ID | `5` |

---

### ❌ Error: "Object does not exist"

**Síntomas:**
```python
device = nb.dcim.devices.get(name='no-existe')
print(device.name)
AttributeError: 'NoneType' object has no attribute 'name'
```

**Causa:** Objeto no encontrado (retorna `None`).

**Solución:**

```python
# ❌ MALO: No verificar si existe
device = nb.dcim.devices.get(name='no-existe')
print(device.name)  # ← Error si no existe

# ✅ CORRECTO: Verificar antes de usar
device = nb.dcim.devices.get(name='no-existe')
if device:
    print(device.name)
else:
    print("Dispositivo no encontrado")

# ✅ CORRECTO: Usar filter para múltiples
devices = nb.dcim.devices.filter(name='no-existe')
if devices:
    device = devices[0]
else:
    print("No encontrado")
```

---

## 🌐 Problemas de API

### ❌ Error: "404 Not Found"

**Síntomas:**
```json
{
  "detail": "Not found."
}
```

**Causas comunes:**
1. Endpoint incorrecto
2. ID inexistente
3. Permisos insuficientes

**Solución:**

```python
# Verificar URL correcta
# ❌ MALO: endpoint incorrecto
response = requests.get('http://localhost:8080/api/device/123')

# ✅ CORRECTO: endpoint correcto
response = requests.get('http://localhost:8080/api/dcim/devices/123/')

# Verificar que el objeto existe
device = nb.dcim.devices.get(id=123)
if not device:
    print("ID 123 no existe")

# Verificar permisos
# Token debe tener permisos de lectura para dcim.device
```

---

### ❌ Error: "Validation error"

**Síntomas:**
```json
{
  "name": ["This field is required."],
  "device_type": ["Invalid value."]
}
```

**Causa:** Datos enviados no cumplen validaciones del modelo.

**Solución:**

```python
# ❌ MALO: Datos incompletos
device = nb.dcim.devices.create({
    'name': 'test'  # Falta device_type, site, etc.
})

# ✅ CORRETO: Datos completos
device = nb.dcim.devices.create({
    'name': 'test',
    'device_type': 123,  # ID válido
    'site': 1,  # ID válido
    'device_role': 2,  # ID válido
})

# ✅ CORRECTO: Verificar tipos
data = {
    'name': 'test',
    'device_type': '123',  # ❌ String en lugar de int
}
if not isinstance(data['device_type'], int):
    data['device_type'] = int(data['device_type'])

device = nb.dcim.devices.create(data)
```

**Validaciones comunes:**

```python
# Nombre único
nb.dcim.devices.create({'name': 'servidor-01'})  # Ok
nb.dcim.devices.create({'name': 'servidor-01'})  # ❌ Error: ya existe

# ID debe existir
nb.dcim.devices.create({
    'name': 'test',
    'device_type': 99999  # ❌ Error: device_type no existe
})

# Campos requeridos
nb.dcim.devices.create({
    'name': 'test'
    # ❌ Falta device_type, site, device_role
})
```

---

### ❌ Error: "Rate limit exceeded"

**Síntomas:**
```json
{
  "detail": "Request was throttled."
}
```

**Causa:** Demasiadas peticiones muy rápido.

**Solución:**

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

# O PyNetBox: usar threading
nb = pynetbox.api('http://localhost:8080', token='token')
nb.http_timeout = 30

# Para bulk operations, usar threading:
from concurrent.futures import ThreadPoolExecutor

def crear_device(device_data):
    return nb.dcim.devices.create(device_data)

devices_data = [...]  # lista grande
with ThreadPoolExecutor(max_workers=3) as executor:
    executor.map(crear_device, devices_data)
```

---

## 🗃️ Problemas de Base de Datos

### ❌ Error: "relation does not exist"

**Síntomas:**
```sql
SELECT * FROM dcim_device;
ERROR: relation "dcim_device" does not exist
```

**Causa:** Migraciones no corrieron o versión incorrecta.

**Solución:**

```bash
# 1. Verificar versión de NetBox
docker compose exec netbox /opt/netbox/netbox/manage.py showmigrations

# 2. Correr migraciones
docker compose exec netbox /opt/netbox/netbox/manage.py migrate

# 3. Si falla, verificar schema
docker compose exec netbox /opt/netbox/netbox/manage.py dbshell

# En PostgreSQL:
\dt  # listar tablas
\q   # salir
```

---

### ❌ Error: "duplicate key value violates unique constraint"

**Síntomas:**
```sql
INSERT INTO dcim_device (name) VALUES ('servidor-01');
ERROR: duplicate key value violates unique constraint "dcim_device_name_key"
```

**Causa:** Intento de crear objeto con nombre ya existente.

**Solución:**

```python
# Verificar si ya existe antes de crear
existing = nb.dcim.devices.filter(name='servidor-01')
if existing:
    print("Ya existe")
else:
    device = nb.dcim.devices.create({'name': 'servidor-01'})

# O usar try/except
try:
    device = nb.dcim.devices.create({'name': 'servidor-01'})
except pynetbox.RequestError as e:
    if 'unique constraint' in str(e):
        print("Ya existe")
```

---

## 🔐 Problemas de Permisos

### ❌ Error: "Permission denied"

**Síntomas:**
```python
nb.dcim.devices.create({'name': 'test'})
pynetbox.RequestError: 403 Forbidden
```

**Causa:** Token no tiene permisos.

**Solución:**

```python
# 1. Verificar permisos del token
# UI: Admin → Tokens → Edit tu token
# Verificar "Object Permissions" para dcim.device

# 2. O crear token con todos los permisos
token = nb.extras.tokens.create({
    'description': 'Token completo para desarrollo'
})
# Marcar "Write" y "Admin" para todos los módulos

# 3. O asignar a grupo con permisos
# UI: Admin → Groups → Add
#      → Permissions → marcar permisos
#      → Users → agregar usuarios

# 4. Verificar si objeto tiene restricciones
device = nb.dcim.devices.get(id=123)
print(device)  # Si no aparece, sin permiso
```

---

## 🧪 Debugging: Herramientas Esenciales

### 1. Debug PyNetBox

```python
import logging

# Activar debug
logging.basicConfig(level=logging.DEBUG)
nb = pynetbox.api('http://localhost:8080', token='token')

# Ahora todas las peticiones aparecen en los logs:
# DEBUG:pynetbox.core.query: GET http://localhost:8080/api/dcim/devices/
```

### 2. Inspeccionar Payload

```python
# Ver petición HTTP que se envía
import requests

session = requests.Session()
session.auth = ('Token', 'token')

response = session.get('http://localhost:8080/api/dcim/devices/')
print(response.request.headers)
print(response.request.body)
```

### 3. Validar Datos

```python
def validate_device_data(data):
    required_fields = ['name', 'device_type', 'site']
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Campo obligatorio: {field}")

    if 'name' in data and len(data['name']) > 50:
        raise ValueError("Nombre muy largo")

    # Validar que IDs son enteros
    int_fields = ['device_type', 'site', 'role']
    for field in int_fields:
        if field in data and not isinstance(data[field], int):
            print(f"⚠️ {field} debe ser ID (int), no {type(data[field])}")

# Antes de crear
validate_device_data(device_data)
device = nb.dcim.devices.create(device_data)
```

---

## 📞 Cuando Pedir Ayuda

### Antes de abrir issue:

✅ **Ya intentaste**:
- [ ] Reiniciar containers
- [ ] Verificar logs
- [ ] Probar con curl/HTTPie
- [ ] Leer documentación oficial
- [ ] Buscar en Google
- [ ] Buscar en GitHub Discussions

✅ **Información que incluir**:
- Versión de NetBox (`docker compose exec netbox /opt/netbox/netbox/manage.py --version`)
- Logs completos
- Código mínimo que reproduce el error
- Python version (`python --version`)

### Canales de Ayuda
1. **[GitHub Discussions](https://github.com/netbox-community/netbox/discussions)** - Mejor para bugs
2. **[Discord](https://discord.gg/netbox)** - Mejor para dudas rápidas
3. **[Stack Overflow](https://stackoverflow.com/questions/tagged/netbox)** - ¡Buscar primero!

---

## 🎯 Checklist de Diagnóstico

```bash
# ✅ Ejecuta siempre antes de reportar bug:

# 1. NetBox healthy?
docker compose ps

# 2. ¿Versión correcta?
docker compose exec netbox /opt/netbox/netbox/manage.py --version

# 3. ¿Conectividad ok?
curl -I http://localhost:8080

# 4. ¿API responde?
curl -H "Authorization: Token TU_TOKEN" \
  http://localhost:8080/api/

# 5. ¿Token tiene permisos?
curl -H "Authorization: Token TU_TOKEN" \
  http://localhost:8080/api/dcim/sites/

# 6. ¿Logs sin error?
docker compose logs netbox | tail -20

# 7. ¿Base de datos ok?
docker compose exec postgres psql -U netbox -d netbox -c "SELECT 1;"
```

**Si todos pasan → ¡el problema está en tu código!**

---

## 🛠️ Comandos Útiles

```bash
# Ver todos los dispositivos
curl -H "Authorization: Token TOKEN" http://localhost:8080/api/dcim/devices/

# Ver configuración actual
docker compose config

# Reiniciar solo NetBox
docker compose restart netbox

# Ver uso de recursos
docker stats

# Limpiar cache de Docker (si hay problemas)
docker system prune -a

# Ejecutar shell en container
docker compose exec netbox bash

# Ver migraciones aplicadas
docker compose exec netbox /opt/netbox/netbox/manage.py showmigrations

# Crear superusuario
docker compose exec netbox /opt/netbox/netbox/manage.py createsuperuser
```

---

## 📚 Recursos

- **[PyNetBox Documentation](https://pynetbox.readthedocs.io/)** - Cliente Python oficial
- **[NetBox API Docs](https://docs.netbox.dev/en/stable/api-guide/)** - Documentación completa de API
- **[GitHub Issues](https://github.com/netbox-community/netbox/issues)** - Reportar bugs
- **[NetBox Discussions](https://github.com/netbox-community/netbox/discussions)** - Preguntas y ayuda

---

> **"Error que no debugueamos se vuelve leyenda urbana. Error que debugueamos se vuelve conocimiento compartido."**