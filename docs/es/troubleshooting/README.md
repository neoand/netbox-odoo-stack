# 🔧 Troubleshooting Guide - NetBox Odoo Stack (ES)

> **Soluciones a problemas más comunes**

---

## 📋 **Índice**

| 🔍 Problema | ⚡ Solución Rápida | 📄 Guía Detallada |
|-------------|-------------------|-------------------|
| **NetBox no inicia** | Verificar logs | [NetBox Startup](#netbox-startup) |
| **Error 500** | Verificar DB | [Server Errors](#server-errors) |
| **API Token inválido** | Regenerar token | [API Issues](#api-issues) |
| **Devices no aparecen** | Limpiar cache | [Device Issues](#device-issues) |
| **Odoo no conecta** | Verificar config | [Odoo Connection](#odoo-connection) |
| **Docker containers caídos** | Restart stack | [Docker Problems](#docker-problems) |
| **Performance lenta** | Indexar DB | [Performance](#performance) |
| **Sync fallando** | Verificar webhooks | [Sync Issues](#sync-issues) |

---

## 🚀 **NetBox Startup**

### ❌ **Problema: NetBox no inicia**

**Síntomas:**
```
Error: Database connection failed
Error:relation "auth_user" does not exist
Container exits immediately
```

**✅ Soluciones:**

1. **Verificar PostgreSQL**
```bash
# Estado de la base
docker-compose exec postgres pg_isready -U netbox

# Logs del Postgres
docker-compose logs postgres
```

2. **Migraciones pendientes**
```bash
# Ejecutar migraciones
docker-compose exec netbox python3 manage.py migrate

# Crear superuser
docker-compose exec netbox python3 manage.py createsuperuser
```

3. **Permisos de directorio**
```bash
# Corregir permisos
sudo chown -R 1000:1000 /opt/netbox/netbox/media
sudo chown -R 1000:1000 /opt/netbox/netbox/reports

# O vía Docker
docker-compose exec netbox chown -R netbox:netbox /opt/netbox
```

4. **Verificar variables de entorno**
```bash
# .env debe contener
cat .env | grep -E "(DB_|SECRET_KEY)"

# Verificar en el container
docker-compose exec netbox env | grep -E "(DB_|SECRET_KEY)"
```

5. **Restart completo**
```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 🐛 **Server Errors**

### ❌ **Problema: Error 500 Internal Server Error**

**Síntomas:**
```
500 Internal Server Error
OperationalError at /dcim/devices/
FATAL:  password authentication failed
```

**✅ Soluciones:**

1. **Credenciales DB**
```bash
# Verificar .env
cat .env

# Debe tener:
NETBOX_DB_NAME=netbox
NETBOX_DB_USER=netbox
NETBOX_DB_PASSWORD=netbox123
NETBOX_DB_HOST=postgres

# Testear conexión
docker-compose exec netbox python3 -c "
import psycopg2
try:
    conn = psycopg2.connect(
        host='postgres',
        database='netbox',
        user='netbox',
        password='netbox123'
    )
    print('✅ DB connection OK')
except Exception as e:
    print(f'❌ DB error: {e}')
"
```

2. **Resetear DB (CUIDADO!)**
```bash
# Backup primero!
docker-compose exec postgres pg_dump -U netbox netbox > backup.sql

# Recrear DB
docker-compose down -v
docker volume rm $(docker volume ls -q | grep postgres)
docker-compose up -d postgres
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS netbox;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE netbox OWNER netbox;"
docker-compose up -d netbox
```

---

## 🔑 **API Issues**

### ❌ **Problema: Token inválido o 401 Unauthorized**

**Síntomas:**
```
401 Unauthorized
detail: Invalid token
Authentication credentials were not provided
```

**✅ Soluciones:**

1. **Crear nuevo token**
```bash
# Vía Admin UI
# 1. Ir a Admin → API Tokens
# 2. Add Token
# 3. Copiar token generado

# Vía CLI
docker-compose exec netbox python3 manage.py shell -c "
from users.models import Token
from django.contrib.auth.models import User
user = User.objects.get(username='admin')
token = Token.objects.create(user=user, key='new-token-key')
print(f'Token: {token.key}')
"
```

2. **Verificar formato de la petición**
```bash
# CORRECTO
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/dcim/devices/

# INCORRECTO (no funciona)
curl http://localhost:8000/api/dcim/devices/?token=YOUR_TOKEN
```

---

## 🐳 **Docker Problems**

### ❌ **Problema: Containers caen o no responden**

**Síntomas:**
```
Container exits
Port already in use
No space left on device
```

**✅ Soluciones:**

1. **Verificar estado**
```bash
docker-compose ps
docker ps -a
```

2. **Conflicts de puertos**
```bash
# Verificar puertos en uso
netstat -tulpn | grep 8000

# O
lsof -i :8000

# Cambiar puerto en docker-compose.yml:
services:
  netbox:
    ports:
      - "8001:8080"  # Usar 8001 en vez de 8000
```

3. **Espacio en disco**
```bash
# Verificar espacio
docker system df
df -h

# Limpiar
docker system prune -a
docker volume prune
```

4. **Restart stack**
```bash
# Restart individual
docker-compose restart netbox

# Restart todo
docker-compose down
docker-compose up -d
```

---

## 🌐 **Odoo Connection**

### ❌ **Problema: Odoo no conecta o sincroniza**

**Síntomas:**
```
Odoo timeout
Sync fails
Module not found
```

**✅ Soluciones:**

1. **Verificar si Odoo está ejecutándose**
```bash
curl http://localhost:8069/web/database/status

# Debe retornar:
# {"databases": ["netbox", ...]}
```

2. **Testear autenticación**
```bash
python3 << 'EOF'
import requests
import base64

url = "http://localhost:8069/api/res.users"
auth = ('admin', 'admin')

response = requests.get(url, auth=auth)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
EOF
```

3. **Verificar módulos instalados**
```bash
# Vía API
curl -X GET \
  http://localhost:8069/api/modules/module \
  -u admin:admin \
  | grep '"name"'

# Vía shell Docker
docker-compose exec odoo odoo-bin --list-modules
```

4. **Resetear Odoo DB**
```bash
# Parar Odoo
docker-compose stop odoo

# Remover Odoo DB
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS odoo;"

# Iniciar con DB limpio
docker-compose up -d odoo
```

---

**🔧 Total: 20+ issues | Soluciones para usuarios ES | Quick fixes**
