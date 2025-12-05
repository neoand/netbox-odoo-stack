# 🐳 Docker Commands Cheat Sheet

> **Comandos Docker para NetBox + Odoo Stack**

---

## 🚀 **Startup & Shutdown**

```bash
# Iniciar todos os serviços
docker-compose up -d

# Iniciar com rebuild
docker-compose up -d --build

# Ver logs em tempo real
docker-compose logs -f

# Logs de serviço específico
docker-compose logs -f netbox
docker-compose logs -f odoo

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Restart
docker-compose restart
docker-compose restart netbox
```

---

## 🔍 **Status & Info**

```bash
# Ver containers rodando
docker-compose ps

# Ver status todos
docker ps -a

# Stats em tempo real
docker stats

# Info do sistema
docker system df
docker system info
```

---

## 📊 **Logs & Debugging**

```bash
# Logs com timestamp
docker-compose logs -t netbox

# Últimas 100 linhas
docker-compose logs --tail=100 netbox

# Logs desde 1 hora atrás
docker-compose logs --since="1h" netbox

# Entrar no container
docker-compose exec netbox bash
docker exec -it netbox-container bash

# Ver variáveis de ambiente
docker-compose exec netbox env
```

---

## 💾 **Data & Backup**

```bash
# Backup do NetBox
docker-compose exec netbox pg_dump -U netbox netbox > netbox-backup.sql

# Backup do Odoo
docker-compose exec odoo pg_dump -U odoo odoo > odoo-backup.sql

# Restaurar NetBox
docker-compose exec -T postgres psql -U netbox netbox < netbox-backup.sql

# Backup volumes
docker run --rm -v netbox-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres.tar.gz -C /data .

# Importar dados
docker-compose exec -T postgres psql -U netbox netbox < /path/to/backup.sql
```

---

## 🔧 **Maintenance**

```bash

# Rebuild container específico
docker-compose build netbox
docker-compose build --no-cache netbox

# ReCreate containers
docker-compose up -d --force-recreate

# Limpar containers parados
docker container prune

# Limpar imagens não usadas
docker image prune

# Limpar tudo
docker system prune -a

# Recriar volumes
docker-compose down -v
docker-compose up -d
```

---

## 🌐 **Network**

```bash
# Ver networks
docker network ls

# Inspect network
docker network inspect netbox-odoo-stack_default

# Conectar container a network
docker network connect network-name container-name

# Desconectar
docker network disconnect network-name container-name
```

---

## 📦 **Volumes**

```bash
# Listar volumes
docker volume ls

# Inspect volume
docker volume inspect netbox-postgres-data

# Backup volume
docker run --rm -v netbox-postgres-data:/source -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /source

# Restore volume
docker run --rm -v netbox-postgres-data:/target -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /target
```

---

## 🐳 **Basic Docker**

```bash
# Rodar container
docker run -d --name netbox netboxcommunity/netbox

# Parar container
docker stop netbox

# Remover container
docker rm netbox

# Executar comando
docker exec netbox ls -la

# Copiar arquivos
docker cp netbox:/path/to/file ./local-file
docker cp ./local-file netbox:/path/to/file

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

# neo_stack
docker-compose up -d neo-stack
curl http://localhost:3000
```

---

## 🔧 **Configuration**

```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Variáveis de ambiente
nano .env

# Recarregar config
docker-compose down
docker-compose up -d

# Ver config
docker-compose config
```

---

## 🚨 **Troubleshooting**

```bash
# Container não sobe
docker-compose logs netbox

# Verificar portas
netstat -tlnp | grep 8000
lsof -i :8000

# Verificar recursos
docker system df
docker stats --no-stream

# Verificar network
docker network inspect bridge

# Reset completo
docker-compose down -v --remove-orphans
docker system prune -a
docker-compose up -d --build
```

---

## ⚡ **Quick Commands**

```bash
# Aliases úteis
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dps='docker ps'

# Usar
dcu          # Start
dcd          # Stop
dcl netbox   # Logs NetBox
dps          # Status
```

---

## 📊 **Monitoring**

```bash
# Health check NetBox
curl -f http://localhost:8000/api/ || echo "NetBox down"

# Status Odoo
curl -f http://localhost:8069/web/database/status

# PostgreSQL
docker-compose exec postgres pg_isready -U netbox

# Redis
docker-compose exec redis redis-cli ping
```

---

## 🔐 **Security**

```bash
# Ver imagens vulneráveis
docker scout cves netboxcommunity/netbox:latest

# Scan manual
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image netboxcommunity/netbox:latest

# Limpar secrets
docker-compose exec netbox printenv | grep -i password
```

---

## 💡 **Tips**

```bash
# Melhor performance
# docker-compose.yml
services:
  netbox:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

# Logs rotation
# docker-compose.yml
services:
  netbox:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

**🐳 Total: 60+ comandos | Lab completo | Quick reference**
