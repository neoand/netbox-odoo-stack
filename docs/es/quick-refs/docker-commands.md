# 🐳 Docker Commands Cheat Sheet (ES)

> **Comandos Docker para NetBox + Odoo Stack**

---

## 🚀 **Inicio & Cierre**

```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar con rebuild
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Logs de servicio específico
docker-compose logs -f netbox
docker-compose logs -f odoo

# Parar servicios
docker-compose down

# Parar y remover volúmenes
docker-compose down -v

# Reiniciar
docker-compose restart
docker-compose restart netbox
```

---

## 🔍 **Estado & Info**

```bash
# Ver containers ejecutándose
docker-compose ps

# Ver estado todos
docker ps -a

# Stats en tiempo real
docker stats

# Info del sistema
docker system df
docker system info
```

---

## 📊 **Logs & Debugging**

```bash
# Logs con timestamp
docker-compose logs -t netbox

# Últimas 100 líneas
docker-compose logs --tail=100 netbox

# Logs desde 1 hora atrás
docker-compose logs --since="1h" netbox

# Entrar al container
docker-compose exec netbox bash
docker exec -it netbox-container bash

# Ver variables de entorno
docker-compose exec netbox env
```

---

## 💾 **Data & Backup**

```bash
# Backup del NetBox
docker-compose exec netbox pg_dump -U netbox netbox > netbox-backup.sql

# Backup del Odoo
docker-compose exec odoo pg_dump -U odoo odoo > odoo-backup.sql

# Restaurar NetBox
docker-compose exec -T postgres psql -U netbox netbox < netbox-backup.sql
```

---

## 🔧 **Mantenimiento**

```bash
# Rebuild container específico
docker-compose build netbox
docker-compose build --no-cache netbox

# ReCrear containers
docker-compose up -d --force-recreate

# Limpiar containers parados
docker container prune

# Limpiar imágenes no usadas
docker image prune

# Limpiar todo
docker system prune -a

# Recrear volúmenes
docker-compose down -v
docker-compose up -d
```

---

## 🐳 **Docker Básico**

```bash
# Ejecutar container
docker run -d --name netbox netboxcommunity/netbox

# Parar container
docker stop netbox

# Remover container
docker rm netbox

# Ejecutar comando
docker exec netbox ls -la

# Ver logs
docker logs -f netbox
```

---

## 🔌 **Lab Services**

```bash
# NetBox
docker-compose up -d netbox
curl http://localhost:8000

# Odoo
docker-compose up -d odoo
curl http://localhost:8069

# PostgreSQL
docker-compose up -d postgres
psql -h localhost -U netbox

# Redis
docker-compose up -d redis
redis-cli ping
```

---

## ⚡ **Comandos Rápidos**

```bash
# Aliases útiles
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dps='docker ps'

# Usar
dcu          # Iniciar
dcd          # Parar
dcl netbox   # Logs NetBox
dps          # Estado
```

---

**🐳 Total: 60+ comandos | Lab completo | Quick reference**
