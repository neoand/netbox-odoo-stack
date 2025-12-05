# 🔧 Troubleshooting Guide - NetBox Odoo Stack

> **Soluções para problemas mais comuns**

---

## 📋 **Índice**

| 🔍 Problema | ⚡ Solução Rápida | 📄 Guia Detalhado |
|-------------|-------------------|-------------------|
| **NetBox não inicia** | Verificar logs | [NetBox Startup](#netbox-startup) |
| **Erro 500** | Verificar DB | [Server Errors](#server-errors) |
| **API Token inválido** | Regenar token | [API Issues](#api-issues) |
| **Devices não aparecem** | Limpar cache | [Device Issues](#device-issues) |
| **Odoo não conecta** | Verificar config | [Odoo Connection](#odoo-connection) |
| **Docker containers down** | Restart stack | [Docker Problems](#docker-problems) |
| **Performance lenta** | Index DB | [Performance](#performance) |
| **Sync falhando** | Verificar webhooks | [Sync Issues](#sync-issues) |

---

## 🚀 **NetBox Startup**

### ❌ **Problema: NetBox não inicia**

**Sintomas:**
```
Error: Database connection failed
Error:relation "auth_user" does not exist
Container exits immediately
```

**✅ Soluções:**

1. **Verificar PostgreSQL**
```bash
# Status do banco
docker-compose exec postgres pg_isready -U netbox

# Logs do Postgres
docker-compose logs postgres
```

2. **Migrations pendentes**
```bash
# Executar migrations
docker-compose exec netbox python3 manage.py migrate

# Criar superuser
docker-compose exec netbox python3 manage.py createsuperuser
```

3. **Permissões de diretório**
```bash
# Corrigir permissões
sudo chown -R 1000:1000 /opt/netbox/netbox/media
sudo chown -R 1000:1000 /opt/netbox/netbox/reports

# Ou via Docker
docker-compose exec netbox chown -R netbox:netbox /opt/netbox
```

4. **Verificar variáveis de ambiente**
```bash
# .env deve conter
cat .env | grep -E "(DB_|SECRET_KEY)"

# Verificar no container
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

**Sintomas:**
```
500 Internal Server Error
OperationalError at /dcim/devices/
FATAL:  password authentication failed
```

**✅ Soluções:**

1. **Credenciais DB**
```bash
# Verificar .env
cat .env

# Deve ter:
NETBOX_DB_NAME=netbox
NETBOX_DB_USER=netbox
NETBOX_DB_PASSWORD=netbox123
NETBOX_DB_HOST=postgres

# Testar conexão
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

2. **Resetar DB (CUIDADO!)**
```bash
# Backup primeiro!
docker-compose exec postgres pg_dump -U netbox netbox > backup.sql

# Recriar DB
docker-compose down -v
docker volume rm $(docker volume ls -q | grep postgres)
docker-compose up -d postgres
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS netbox;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE netbox OWNER netbox;"
docker-compose up -d netbox
```

3. **Verificar logs detalhados**
```bash
# Logs com traceback
docker-compose logs -f --tail=100 netbox

#ou
docker-compose exec netbox tail -f /opt/netbox/logs/django.log
```

---

## 🔑 **API Issues**

### ❌ **Problema: Token inválido ou 401 Unauthorized**

**Sintomas:**
```
401 Unauthorized
detail: Invalid token
Authentication credentials were not provided
```

**✅ Soluções:**

1. **Criar novo token**
```bash
# Via Admin UI
# 1. Ir em Admin → API Tokens
# 2. Add Token
# 3. Copiar token gerado

# Via CLI
docker-compose exec netbox python3 manage.py shell -c "
from users.models import Token
from django.contrib.auth.models import User
user = User.objects.get(username='admin')
token = Token.objects.create(user=user, key='new-token-key')
print(f'Token: {token.key}')
"
```

2. **Verificar formato da requisição**
```bash
# CORRETO
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/dcim/devices/

# INCORRETO (não funciona)
curl http://localhost:8000/api/dcim/devices/?token=YOUR_TOKEN
```

3. **Verificar permissões do token**
```bash
# O token deve ter write se for criar/alterar
# O token deve ter read para consultas

# Via API
GET /api/users/tokens/
```

4. **Token expirado (se configurado)**
```bash
# Token sem expiração
# Em Admin → API Tokens → Edit → Set "Expires" = Never
```

---

## 💻 **Device Issues**

### ❌ **Problema: Devices não aparecem ou estão duplicados**

**Sintomas:**
```
Lista vazia
Devices duplicados
Filtros não funcionam
```

**✅ Soluções:**

1. **Limpar cache**
```bash
docker-compose exec netbox python3 manage.py shell -c "
from django.core.cache import cache
cache.clear()
print('Cache cleared')
"
```

2. **Reindex search**
```bash
docker-compose exec netbox python3 manage.py search_index --rebuild
```

3. **Verificar queries SQL**
```bash
# Habilitar debug SQL temporariamente
# settings.py ou .env
DEBUG=True
DJANGO_SQL_LOGGING=True

# Ou no shell
docker-compose exec netbox python3 manage.py shell -c "
from django.db import connection
connection.queries
"
```

4. **Duplicados - verificar unique constraints**
```bash
# Device names devem ser únicos por site
# Verificar:
docker-compose exec netbox python3 manage.py shell -c "
from dcim.models import Device
dups = Device.objects.values('name', 'site').annotate(count=Count('id')).filter(count__gt=1)
print(list(dups))
"
```

---

## 🐳 **Docker Problems**

### ❌ **Problema: Containers caem ou não respondem**

**Sintomas:**
```
Container exits
Port already in use
No space left on device
```

**✅ Soluções:**

1. **Verificar status**
```bash
docker-compose ps
docker ps -a
```

2. **Port conflicts**
```bash
# Verificar portas em uso
netstat -tulpn | grep 8000

# Ou
lsof -i :8000

# Mudar porta no docker-compose.yml:
services:
  netbox:
    ports:
      - "8001:8080"  # Usar 8001 ao invés de 8000
```

3. **Espaço em disco**
```bash
# Verificar espaço
docker system df
df -h

# Limpar
docker system prune -a
docker volume prune

# Limpar logs
docker-compose exec netbox truncate -s 0 /opt/netbox/logs/django.log
```

4. **Restart stack**
```bash
# Restart individual
docker-compose restart netbox

# Restart tudo
docker-compose down
docker-compose up -d
```

5. **Verificar recursos**
```bash
docker stats
```

---

## 🌐 **Odoo Connection**

### ❌ **Problema: Odoo não conecta ou sincroniza**

**Sintomas:**
```
Odoo timeout
Sync fails
Module not found
```

**✅ Soluções:**

1. **Verificar se Odoo está rodando**
```bash
curl http://localhost:8069/web/database/status

# Deve retornar:
# {"databases": ["netbox", ...]}
```

2. **Testar autenticação**
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
# Via API
curl -X GET \
  http://localhost:8069/api/modules/module \
  -u admin:admin \
  | grep '"name"'

# Via shell Docker
docker-compose exec odoo odoo-bin --list-modules
```

4. **Resetar Odoo DB**
```bash
# Parar Odoo
docker-compose stop odoo

# Remove Odoo DB
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS odoo;"

# Iniciar com DB limpo
docker-compose up -d odoo
```

---

## ⚡ **Performance Issues**

### ❌ **Problema: NetBox muito lento**

**Sintomas:**
```
Paginas demoram para carregar
API timeout
Database queries lentas
```

**✅ Soluções:**

1. **Indexar banco**
```bash
# Criar índices customizados
docker-compose exec netbox python3 manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_device_name ON dcim_device(name);')
    cursor.execute('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interface_device ON dcim_interface(device_id);')
    print('Indexes created')
"
```

2. **Configurar Redis (cache)**
```yaml
# docker-compose.yml
services:
  netbox:
    depends_on:
      - redis
    environment:
      CACHE_REDIS_HOST: redis
      CACHE_REDIS_PORT: 6379
      CACHE_REDIS_DB: 0
```

3. **Aumentar limite de conexões DB**
```yaml
# docker-compose.yml
postgres:
  command: postgres -c max_connections=200
```

4. **Verificar queries lentas**
```bash
# Habilitar slow query log
docker-compose exec postgres psql -U netbox -c "
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
"
```

5. **Restart com mais recursos**
```yaml
# docker-compose.yml
services:
  netbox:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

---

## 🔄 **Sync Issues**

### ❌ **Problema: NetBox ↔ Odoo sync falha**

**Sintomas:**
```
Webhook timeouts
Sync incomplete
Data inconsistent
```

**✅ Soluções:**

1. **Testar webhook**
```bash
# Enviar webhook manualmente
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"event": "device.create", "data": {"name": "test"}}' \
  http://your-webhook-endpoint/webhooks/netbox
```

2. **Verificar logs de sync**
```python
# Handler com logging
import logging
logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    try:
        payload = request.json
        logger.info(f"Received webhook: {payload['event']}")
        # Process webhook
        return jsonify({'status': 'ok'})
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500
```

3. **Verificar rate limits**
```python
# Implementar retry logic
import time
import requests

def sync_with_retry(data, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
```

4. **Monitorar sync status**
```python
# Dashboard de sync
@app.route('/sync/dashboard')
def sync_dashboard():
    metrics = get_sync_metrics()
    return render_template('sync.html', metrics=metrics)

# Verificar últimos sync
def get_sync_metrics():
    return {
        'last_sync': last_sync_time,
        'success_rate': success_count / total_attempts * 100,
        'errors': recent_errors
    }
```

---

## 🗄️ **Database Issues**

### ❌ **Problema: Database corruption ou locked**

**Sintomas:**
```
Database locked
Disk full
Corruption detected
```

**✅ Soluções:**

1. **Verificar integridade**
```bash
# Check database
docker-compose exec postgres psql -U netbox -c "
  SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
  FROM pg_stat_user_tables
  ORDER BY n_tup_ins DESC;
"
```

2. **Vacuum e analyze**
```bash
# Auto-vacuum
docker-compose exec postgres psql -U netbox -c "
  VACUUM ANALYZE;
"

# Manual vacuum
docker-compose exec postgres psql -U netbox -c "
  VACUUM (VERBOSE, ANALYZE);
"
```

3. **Backup antes de repair**
```bash
# Backup completo
docker-compose exec postgres pg_dump -U netbox netbox > emergency_backup.sql

# Se realmente corrupto:
docker-compose exec postgres psql -U netbox -c "
  REINDEX DATABASE netbox;
  VACUUM FULL;
"
```

4. **Verificar logs DB**
```bash
docker-compose logs postgres | grep ERROR
```

---

## 🔍 **Debug Mode**

### **Habilitar debug para troubleshooting**

```bash
# .env
DEBUG=True
LOGGING_LEVEL=DEBUG
DJANGO_SQL_LOGGING=True

# Restart
docker-compose restart netbox
```

### **Django Shell para inspeção**

```bash
# Entrar no shell
docker-compose exec netbox python3 manage.py shell

# Exemplos de queries
from dcim.models import Device, Site
from django.db.models import Count

# Devices por site
devices = Device.objects.values('site__name').annotate(count=Count('id'))
print(list(devices))

# Sites ativos
active_sites = Site.objects.filter(status='active')
print(active_sites.values_list('name', flat=True))

# Interface counts
from dcim.models import Interface
interfaces = Interface.objects.filter(enabled=True).count()
print(f"Active interfaces: {interfaces}")
```

---

## 📞 **Support & Resources**

### **Links úteis:**
- 📖 [NetBox Documentation](https://docs.netbox.dev)
- 🐛 [NetBox GitHub Issues](https://github.com/netbox-community/netbox/issues)
- 💬 [NetBox Discord](https://discord.gg/netbox)
- 📧 [Mailing List](https://groups.google.com/forum/#!forum/netbox-discuss)

### **Log locations:**
```
NetBox: /opt/netbox/logs/
PostgreSQL: docker-compose logs postgres
Docker: ~/.docker/logs/
```

### **Arquivos importantes:**
```
docker-compose.yml - Configuration
.env - Environment variables
data/ - Persistent data
logs/ - Application logs
```

---

**🔧 Total: 20+ issues | Solutions for PT-BR users | Quick fixes**
