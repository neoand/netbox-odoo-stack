# Instalación y Configuración de n8n

> **AI Context**: Guía completa de instalación de n8n SOAR vía Docker Compose. Incluye PostgreSQL, Redis, webhooks y credenciales. Stack: Docker + PostgreSQL + n8n. Keywords: n8n setup, Docker Compose, SOAR installation, PostgreSQL, Redis queue, webhook configuration.

## Prerrequisitos

### Hardware
- **CPU**: 2 cores (recomendado)
- **RAM**: 2GB mínimo, 4GB recomendado
- **Storage**: 10GB SSD
- **Red**: Puerto 5678 disponible

### Software
```bash
# Versiones mínimas
docker --version   # Docker 24.0+
docker-compose --version  # Docker Compose 2.20+

# Verificar recursos
docker info | grep -E 'CPUs|Total Memory'
```

### Dependencias
- ✅ Docker Engine instalado
- ✅ Docker Compose instalado
- ✅ Acceso root/sudo
- ✅ Internet (para descarga de imágenes)

## Instalación vía Docker Compose

### Estructura de Directorios

```bash
# Crear estructura
mkdir -p /opt/neoand-netbox-odoo-stack/n8n/{data,.n8n}
cd /opt/neoand-netbox-odoo-stack/n8n

# Estructura final
/opt/neoand-netbox-odoo-stack/n8n/
├── docker-compose.yml
├── .env
├── data/                  # PostgreSQL data
└── .n8n/                  # n8n data (workflows, credenciales)
```

### Archivo docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  n8n-postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    hostname: n8n-postgres
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-n8n}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-n8n_secure_pass}
      - POSTGRES_DB=${POSTGRES_DB:-n8n}
    volumes:
      - ./data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - n8n-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-n8n}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Queue (Opcional para producción)
  n8n-redis:
    image: redis:7-alpine
    container_name: n8n-redis
    hostname: n8n-redis
    ports:
      - "6380:6379"
    networks:
      - n8n-network
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - n8n-redis-data:/data

  # n8n Application
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    hostname: n8n
    environment:
      # Database
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=n8n-postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB:-n8n}
      - DB_POSTGRESDB_USER=${POSTGRES_USER:-n8n}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD:-n8n_secure_pass}

      # n8n Configuration
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-NeoAndSecure2025!}
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://${N8N_HOST:-localhost}:5678/
      - GENERIC_TIMEZONE=${TIMEZONE:-America/Sao_Paulo}

      # Execution
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_MODE=regular
      - EXECUTIONS_TIMEOUT=300
      - EXECUTIONS_TIMEOUT_MAX=3600
      - EXECUTIONS_DATA_SAVE_ON_ERROR=all
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_SAVE_ON_PROGRESS=true
      - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

      # Queue (si usa Redis)
      - QUEUE_BULL_REDIS_HOST=n8n-redis
      - QUEUE_BULL_REDIS_PORT=6379
      - EXECUTIONS_MODE=${EXECUTIONS_MODE:-regular}

      # Security
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:-change-this-to-random-string}
      - N8N_USER_MANAGEMENT_DISABLED=true

      # Logging
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console,file
      - N8N_LOG_FILE_LOCATION=/home/node/.n8n/logs/
    ports:
      - "5678:5678"
    volumes:
      - ./.n8n:/home/node/.n8n
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - n8n-network
    depends_on:
      n8n-postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "wget --spider -q http://localhost:5678/healthz || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # n8n Worker (Opcional - para modo queue)
  n8n-worker:
    image: n8nio/n8n:latest
    container_name: n8n-worker
    hostname: n8n-worker
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=n8n-postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB:-n8n}
      - DB_POSTGRESDB_USER=${POSTGRES_USER:-n8n}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD:-n8n_secure_pass}
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=n8n-redis
      - QUEUE_BULL_REDIS_PORT=6379
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:-change-this-to-random-string}
    command: worker
    volumes:
      - ./.n8n:/home/node/.n8n
    networks:
      - n8n-network
    depends_on:
      - n8n-postgres
      - n8n-redis
    restart: unless-stopped
    profiles:
      - queue  # Iniciar solo con: docker-compose --profile queue up

networks:
  n8n-network:
    driver: bridge

volumes:
  n8n-redis-data:
```

### Archivo .env

```bash
# .env

# PostgreSQL
POSTGRES_USER=n8n
POSTGRES_PASSWORD=n8n_secure_pass_change_me
POSTGRES_DB=n8n

# n8n Authentication
N8N_USER=admin
N8N_PASSWORD=NeoAndSecure2025!

# n8n Configuration
N8N_HOST=localhost
WEBHOOK_URL=http://localhost:5678/
TIMEZONE=America/Sao_Paulo

# Security - IMPORTANTE: ¡Generar clave aleatoria!
# Ejecutar: openssl rand -hex 32
N8N_ENCRYPTION_KEY=your_random_32_char_encryption_key_here

# Execution Mode (regular o queue)
EXECUTIONS_MODE=regular
```

### Generar Encryption Key Segura

```bash
# Generar clave aleatoria de 64 caracteres
openssl rand -hex 32

# Ejemplo de output:
# 7f8a9b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a

# Agregar al .env
echo "N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env
```

### Deploy

```bash
# Navegar al directorio
cd /opt/neoand-netbox-odoo-stack/n8n

# Definir permisos correctos
sudo chown -R 1000:1000 ./.n8n
sudo chmod -R 755 ./.n8n

# Iniciar servicios
docker-compose up -d

# Verificar status
docker-compose ps

# Seguir logs
docker-compose logs -f n8n
```

**Output esperado**:
```
n8n-postgres    running (healthy)
n8n-redis       running
n8n             running (healthy)
```

### Verificación de Salud

```bash
# PostgreSQL
docker exec n8n-postgres pg_isready -U n8n
# Esperado: n8n-postgres:5432 - accepting connections

# Redis
docker exec n8n-redis redis-cli ping
# Esperado: PONG

# n8n
curl http://localhost:5678/healthz
# Esperado: {"status":"ok"}

# n8n UI
curl -I http://localhost:5678
# Esperado: HTTP/1.1 200 OK
```

## Configuración Inicial

### 1. Primer Acceso

```bash
# Abrir navegador
open http://localhost:5678  # macOS
xdg-open http://localhost:5678  # Linux
```

**Pantalla inicial**: Crear primer usuario (owner)

```
Email: admin@neoand.local
First Name: Admin
Last Name: NeoAnd
Password: NeoAndSecure2025!
```

> **NOTA**: Con `N8N_USER_MANAGEMENT_DISABLED=true`, solo se crea un usuario.

### 2. Configurar Credenciales Globales

#### Credencial: Odoo API

1. **Settings** (esquina superior derecha) → **Credentials**
2. **New Credential** → **HTTP Header Auth**
3. Llenar:
   ```
   Name: Odoo API (NeoAnd)
   Header Name: X-Odoo-API-Key
   Header Value: your-odoo-api-key-here
   ```
4. Agregar otro header:
   ```
   Header Name: X-Odoo-Database
   Header Value: neoand_prod
   ```

#### Credencial: NetBox API

1. **New Credential** → **HTTP Header Auth**
2. Llenar:
   ```
   Name: NetBox API (NeoAnd)
   Header Name: Authorization
   Header Value: Token your-netbox-token-here
   ```

#### Credencial: Slack (Opcional)

1. **New Credential** → **Slack API**
2. Obtener Bot Token en https://api.slack.com/apps
3. Llenar:
   ```
   Name: Slack NeoAnd SOC
   Access Token: xoxb-your-slack-bot-token
   ```

### 3. Crear Webhook para Wazuh

#### Vía Interfaz Web

1. **Workflows** → **Add Workflow** (botón +)
2. Nombre: `Wazuh Alert Handler`
3. Agregar node: **Webhook**
4. Configurar Webhook node:
   ```
   HTTP Method: POST
   Path: wazuh-alerts
   Authentication: None (agregar después)
   Response Mode: Last Node
   Response Code: 200
   ```
5. Copiar **Production URL**:
   ```
   http://localhost:5678/webhook/wazuh-alerts
   ```

#### Webhook con Autenticación

```
Path: wazuh-alerts
Authentication: Header Auth
Header Name: X-API-Key
Header Value: wazuh-secret-key-123
```

**Configurar en Wazuh**:
```bash
curl -X POST http://n8n:5678/webhook/wazuh-alerts \
  -H "X-API-Key: wazuh-secret-key-123" \
  -H "Content-Type: application/json" \
  -d '{"alert": "data"}'
```

### 4. Configurar Timezone

```bash
# Editar .env
TIMEZONE=America/Sao_Paulo

# Reiniciar n8n
docker-compose restart n8n

# Verificar timezone en workflow
# Node: Function
return [{
  json: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    now: new Date().toLocaleString('pt-BR')
  }
}];
```

### 5. Configurar Retención de Ejecuciones

```bash
# Editar docker-compose.yml
environment:
  # Mantener ejecuciones por 30 días
  - EXECUTIONS_DATA_MAX_AGE=720  # horas (30 días)
  - EXECUTIONS_DATA_PRUNE=true

  # Limitar total de ejecuciones guardadas
  - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
  - EXECUTIONS_DATA_SAVE_ON_ERROR=all
  - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
```

## Configuración Avanzada

### Mode: Queue (Alto Rendimiento)

Para entornos con >100 ejecuciones/minuto:

```bash
# Editar .env
EXECUTIONS_MODE=queue

# Iniciar con worker
docker-compose --profile queue up -d

# Escalar workers
docker-compose --profile queue up -d --scale n8n-worker=3
```

**Cuándo usar**:
- ✅ >100 ejecuciones/minuto
- ✅ Workflows largos (>1 minuto)
- ✅ Múltiples workflows simultáneos

### Proxy Reverso (Nginx)

```nginx
# /etc/nginx/sites-available/n8n
server {
    listen 80;
    server_name n8n.neoand.local;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Soporte WebSocket
        proxy_read_timeout 86400;
    }
}
```

```bash
# Habilitar
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Actualizar .env
N8N_HOST=n8n.neoand.local
WEBHOOK_URL=http://n8n.neoand.local/
```

### SSL/TLS (Let's Encrypt)

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificado
sudo certbot --nginx -d n8n.neoand.local

# Actualizar .env
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.neoand.local/

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Backup Automático

```bash
#!/bin/bash
# /opt/scripts/n8n-backup.sh

BACKUP_DIR="/backup/n8n"
DATE=$(date +%Y%m%d-%H%M%S)

# Backup PostgreSQL
docker exec n8n-postgres pg_dump -U n8n n8n | gzip > \
  ${BACKUP_DIR}/n8n-db-${DATE}.sql.gz

# Backup .n8n directory (workflows, credenciales)
tar -czf ${BACKUP_DIR}/n8n-data-${DATE}.tar.gz \
  /opt/neoand-netbox-odoo-stack/n8n/.n8n

# Remover backups > 30 días
find ${BACKUP_DIR} -name "*.gz" -mtime +30 -delete

echo "[$(date)] Backup completado: n8n-${DATE}"
```

```bash
# Agregar al cron
crontab -e
0 3 * * * /opt/scripts/n8n-backup.sh >> /var/log/n8n-backup.log 2>&1
```

### Monitoreo con Prometheus

```yaml
# docker-compose.yml (agregar)
  n8n-exporter:
    image: n8nio/n8n-prometheus-exporter:latest
    container_name: n8n-exporter
    environment:
      - N8N_API_URL=http://n8n:5678/api/v1
      - N8N_API_KEY=${N8N_API_KEY}
    ports:
      - "9100:9100"
    networks:
      - n8n-network
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n-exporter:9100']
```

## Troubleshooting

### Problema: PostgreSQL no inicia

**Síntoma**:
```
n8n-postgres | ERROR: database files are incompatible with server
```

**Solución**:
```bash
# Remover datos corruptos
docker-compose down
sudo rm -rf ./data/*

# Recrear database
docker-compose up -d n8n-postgres

# Esperar inicialización
docker logs -f n8n-postgres
```

### Problema: n8n no conecta a PostgreSQL

**Síntoma**:
```
n8n | Error: Connection to database failed
```

**Solución**:
```bash
# Verificar si PostgreSQL está saludable
docker exec n8n-postgres pg_isready -U n8n

# Verificar variables de entorno
docker exec n8n env | grep DB_

# Reiniciar n8n
docker-compose restart n8n
```

### Problema: Webhook retorna 404

**Síntoma**:
```bash
curl http://localhost:5678/webhook/test
# {"code":404,"message":"The requested webhook is not registered"}
```

**Solución**:
1. Verificar si workflow está **activo** (toggle switch en UI)
2. Verificar path exacto (case-sensitive)
3. Verificar logs:
```bash
docker logs n8n | grep webhook
```

### Problema: Ejecuciones no se guardan

**Síntoma**: Tab Executions vacío incluso después de ejecutar workflows

**Solución**:
```bash
# Editar docker-compose.yml
environment:
  - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
  - EXECUTIONS_DATA_SAVE_ON_ERROR=all
  - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# Reiniciar
docker-compose restart n8n
```

### Problema: Alta utilización de disco

**Causa**: Ejecuciones antiguas no siendo removidas

**Solución**:
```bash
# Habilitar prune automático
environment:
  - EXECUTIONS_DATA_PRUNE=true
  - EXECUTIONS_DATA_MAX_AGE=168  # 7 días

# Cleanup manual (vía PostgreSQL)
docker exec n8n-postgres psql -U n8n -d n8n -c \
  "DELETE FROM execution_entity WHERE finished_at < NOW() - INTERVAL '7 days';"
```

### Problema: Timeout en workflows largos

**Síntoma**:
```
Error: Workflow execution timed out after 300 seconds
```

**Solución**:
```bash
# Aumentar timeout
environment:
  - EXECUTIONS_TIMEOUT=600  # 10 minutos
  - EXECUTIONS_TIMEOUT_MAX=3600  # 1 hora

# Reiniciar
docker-compose restart n8n
```

## Validación de la Instalación

```bash
#!/bin/bash
# validate-n8n.sh

echo "=== Validación n8n SOAR ==="

# 1. Servicios
echo "[1/5] Verificando servicios..."
docker-compose ps | grep -q "Up" && \
  echo "✓ Containers ejecutándose" || echo "✗ Containers con problema"

# 2. PostgreSQL
echo "[2/5] Verificando PostgreSQL..."
docker exec n8n-postgres pg_isready -U n8n &>/dev/null && \
  echo "✓ PostgreSQL conectable" || echo "✗ PostgreSQL con problema"

# 3. n8n UI
echo "[3/5] Verificando n8n UI..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5678 | grep -q "200" && \
  echo "✓ n8n UI accesible" || echo "✗ n8n UI inaccesible"

# 4. Health endpoint
echo "[4/5] Verificando health..."
curl -s http://localhost:5678/healthz | grep -q "ok" && \
  echo "✓ n8n saludable" || echo "✗ n8n con problema"

# 5. Webhook prueba
echo "[5/5] Probando webhook..."
# (requiere workflow activo)

echo "=== Validación completada ==="
```

## Próximos Pasos

1. **[Integrar con Wazuh](wazuh-integration.md)**: Configure ossec.conf para enviar alertas
2. **[Crear Workflows](workflows.md)**: Importe templates listos
3. **[Playbooks](../playbooks/index.md)**: Automatice respuesta a incidentes

## Recursos Adicionales

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Docker Setup](https://docs.n8n.io/hosting/installation/docker/)
- [n8n Community Forum](https://community.n8n.io/)

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Probado con**: n8n 1.19.0, Docker 24.0.7, PostgreSQL 15
