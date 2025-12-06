# Instalação e Configuração do n8n

> **AI Context**: Guia completo de instalação do n8n SOAR via Docker Compose. Inclui PostgreSQL, Redis, webhooks e credenciais. Stack: Docker + PostgreSQL + n8n. Keywords: n8n setup, Docker Compose, SOAR installation, PostgreSQL, Redis queue, webhook configuration.

## Pré-requisitos

### Hardware
- **CPU**: 2 cores (recomendado)
- **RAM**: 2GB mínimo, 4GB recomendado
- **Storage**: 10GB SSD
- **Rede**: Porta 5678 disponível

### Software
```bash
# Versões mínimas
docker --version   # Docker 24.0+
docker-compose --version  # Docker Compose 2.20+

# Verificar recursos
docker info | grep -E 'CPUs|Total Memory'
```

### Dependências
- ✅ Docker Engine instalado
- ✅ Docker Compose instalado
- ✅ Acesso root/sudo
- ✅ Internet (para download de imagens)

## Instalação via Docker Compose

### Estrutura de Diretórios

```bash
# Criar estrutura
mkdir -p /opt/neoand-netbox-odoo-stack/n8n/{data,.n8n}
cd /opt/neoand-netbox-odoo-stack/n8n

# Estrutura final
/opt/neoand-netbox-odoo-stack/n8n/
├── docker-compose.yml
├── .env
├── data/                  # PostgreSQL data
└── .n8n/                  # n8n data (workflows, credentials)
```

### Arquivo docker-compose.yml

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

  # Redis Queue (Opcional para produção)
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

      # Queue (se usar Redis)
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

  # n8n Worker (Opcional - para queue mode)
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
      - queue  # Iniciar apenas com: docker-compose --profile queue up

networks:
  n8n-network:
    driver: bridge

volumes:
  n8n-redis-data:
```

### Arquivo .env

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

# Security - IMPORTANTE: Gerar chave aleatória!
# Execute: openssl rand -hex 32
N8N_ENCRYPTION_KEY=your_random_32_char_encryption_key_here

# Execution Mode (regular ou queue)
EXECUTIONS_MODE=regular
```

### Gerar Encryption Key Segura

```bash
# Gerar chave aleatória de 64 caracteres
openssl rand -hex 32

# Exemplo de output:
# 7f8a9b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a

# Adicionar ao .env
echo "N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env
```

### Deploy

```bash
# Navegar para o diretório
cd /opt/neoand-netbox-odoo-stack/n8n

# Definir permissões corretas
sudo chown -R 1000:1000 ./.n8n
sudo chmod -R 755 ./.n8n

# Iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Acompanhar logs
docker-compose logs -f n8n
```

**Output esperado**:
```
n8n-postgres    running (healthy)
n8n-redis       running
n8n             running (healthy)
```

### Verificação de Saúde

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

## Configuração Inicial

### 1. Primeiro Acesso

```bash
# Abrir navegador
open http://localhost:5678  # macOS
xdg-open http://localhost:5678  # Linux
```

**Tela inicial**: Criar primeiro usuário (owner)

```
Email: admin@neoand.local
First Name: Admin
Last Name: NeoAnd
Password: NeoAndSecure2025!
```

> **NOTA**: Com `N8N_USER_MANAGEMENT_DISABLED=true`, apenas um usuário é criado.

### 2. Configurar Credenciais Globais

#### Credencial: Odoo API

1. **Settings** (canto superior direito) → **Credentials**
2. **New Credential** → **HTTP Header Auth**
3. Preencher:
   ```
   Name: Odoo API (NeoAnd)
   Header Name: X-Odoo-API-Key
   Header Value: your-odoo-api-key-here
   ```
4. Adicionar outra header:
   ```
   Header Name: X-Odoo-Database
   Header Value: neoand_prod
   ```

#### Credencial: NetBox API

1. **New Credential** → **HTTP Header Auth**
2. Preencher:
   ```
   Name: NetBox API (NeoAnd)
   Header Name: Authorization
   Header Value: Token your-netbox-token-here
   ```

#### Credencial: Slack (Opcional)

1. **New Credential** → **Slack API**
2. Obter Bot Token em https://api.slack.com/apps
3. Preencher:
   ```
   Name: Slack NeoAnd SOC
   Access Token: xoxb-your-slack-bot-token
   ```

### 3. Criar Webhook para Wazuh

#### Via Interface Web

1. **Workflows** → **Add Workflow** (botão +)
2. Nome: `Wazuh Alert Handler`
3. Adicionar node: **Webhook**
4. Configurar Webhook node:
   ```
   HTTP Method: POST
   Path: wazuh-alerts
   Authentication: None (adicionar depois)
   Response Mode: Last Node
   Response Code: 200
   ```
5. Copiar **Production URL**:
   ```
   http://localhost:5678/webhook/wazuh-alerts
   ```

#### Webhook com Autenticação

```
Path: wazuh-alerts
Authentication: Header Auth
Header Name: X-API-Key
Header Value: wazuh-secret-key-123
```

**Configurar em Wazuh**:
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

# Verificar timezone no workflow
# Node: Function
return [{
  json: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    now: new Date().toLocaleString('pt-BR')
  }
}];
```

### 5. Configurar Retention de Execuções

```bash
# Editar docker-compose.yml
environment:
  # Manter execuções por 30 dias
  - EXECUTIONS_DATA_MAX_AGE=720  # horas (30 dias)
  - EXECUTIONS_DATA_PRUNE=true

  # Limitar total de execuções salvas
  - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
  - EXECUTIONS_DATA_SAVE_ON_ERROR=all
  - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
```

## Configuração Avançada

### Mode: Queue (Alta Performance)

Para ambientes com >100 execuções/minuto:

```bash
# Editar .env
EXECUTIONS_MODE=queue

# Iniciar com worker
docker-compose --profile queue up -d

# Escalar workers
docker-compose --profile queue up -d --scale n8n-worker=3
```

**Quando usar**:
- ✅ >100 execuções/minuto
- ✅ Workflows longos (>1 minuto)
- ✅ Múltiplos workflows simultâneos

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

        # WebSocket support
        proxy_read_timeout 86400;
    }
}
```

```bash
# Habilitar
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Atualizar .env
N8N_HOST=n8n.neoand.local
WEBHOOK_URL=http://n8n.neoand.local/
```

### SSL/TLS (Let's Encrypt)

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d n8n.neoand.local

# Atualizar .env
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

# Backup .n8n directory (workflows, credentials)
tar -czf ${BACKUP_DIR}/n8n-data-${DATE}.tar.gz \
  /opt/neoand-netbox-odoo-stack/n8n/.n8n

# Remover backups > 30 dias
find ${BACKUP_DIR} -name "*.gz" -mtime +30 -delete

echo "[$(date)] Backup concluído: n8n-${DATE}"
```

```bash
# Adicionar ao cron
crontab -e
0 3 * * * /opt/scripts/n8n-backup.sh >> /var/log/n8n-backup.log 2>&1
```

### Monitoramento com Prometheus

```yaml
# docker-compose.yml (adicionar)
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

### Problema: PostgreSQL não inicia

**Sintoma**:
```
n8n-postgres | ERROR: database files are incompatible with server
```

**Solução**:
```bash
# Remover dados corrompidos
docker-compose down
sudo rm -rf ./data/*

# Recriar database
docker-compose up -d n8n-postgres

# Aguardar inicialização
docker logs -f n8n-postgres
```

### Problema: n8n não conecta ao PostgreSQL

**Sintoma**:
```
n8n | Error: Connection to database failed
```

**Solução**:
```bash
# Verificar se PostgreSQL está saudável
docker exec n8n-postgres pg_isready -U n8n

# Verificar variáveis de ambiente
docker exec n8n env | grep DB_

# Reiniciar n8n
docker-compose restart n8n
```

### Problema: Webhook retorna 404

**Sintoma**:
```bash
curl http://localhost:5678/webhook/test
# {"code":404,"message":"The requested webhook is not registered"}
```

**Solução**:
1. Verificar se workflow está **ativo** (toggle switch na UI)
2. Verificar path exato (case-sensitive)
3. Verificar logs:
```bash
docker logs n8n | grep webhook
```

### Problema: Execuções não salvam

**Sintoma**: Executions tab vazia mesmo após executar workflows

**Solução**:
```bash
# Editar docker-compose.yml
environment:
  - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
  - EXECUTIONS_DATA_SAVE_ON_ERROR=all
  - EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# Reiniciar
docker-compose restart n8n
```

### Problema: Alta utilização de disco

**Causa**: Execuções antigas não sendo removidas

**Solução**:
```bash
# Habilitar prune automático
environment:
  - EXECUTIONS_DATA_PRUNE=true
  - EXECUTIONS_DATA_MAX_AGE=168  # 7 dias

# Manual cleanup (via PostgreSQL)
docker exec n8n-postgres psql -U n8n -d n8n -c \
  "DELETE FROM execution_entity WHERE finished_at < NOW() - INTERVAL '7 days';"
```

### Problema: Timeout em workflows longos

**Sintoma**:
```
Error: Workflow execution timed out after 300 seconds
```

**Solução**:
```bash
# Aumentar timeout
environment:
  - EXECUTIONS_TIMEOUT=600  # 10 minutos
  - EXECUTIONS_TIMEOUT_MAX=3600  # 1 hora

# Reiniciar
docker-compose restart n8n
```

## Validação da Instalação

```bash
#!/bin/bash
# validate-n8n.sh

echo "=== Validação n8n SOAR ==="

# 1. Serviços
echo "[1/5] Verificando serviços..."
docker-compose ps | grep -q "Up" && \
  echo "✓ Containers rodando" || echo "✗ Containers com problema"

# 2. PostgreSQL
echo "[2/5] Verificando PostgreSQL..."
docker exec n8n-postgres pg_isready -U n8n &>/dev/null && \
  echo "✓ PostgreSQL conectável" || echo "✗ PostgreSQL com problema"

# 3. n8n UI
echo "[3/5] Verificando n8n UI..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5678 | grep -q "200" && \
  echo "✓ n8n UI acessível" || echo "✗ n8n UI inacessível"

# 4. Health endpoint
echo "[4/5] Verificando health..."
curl -s http://localhost:5678/healthz | grep -q "ok" && \
  echo "✓ n8n saudável" || echo "✗ n8n com problema"

# 5. Webhook teste
echo "[5/5] Testando webhook..."
# (requer workflow ativo)

echo "=== Validação concluída ==="
```

## Próximos Passos

1. **[Integrar com Wazuh](wazuh-integration.md)**: Configure ossec.conf para enviar alertas
2. **[Criar Workflows](workflows.md)**: Importe templates prontos
3. **[Playbooks](../playbooks/index.md)**: Automatize resposta a incidentes

## Recursos Adicionais

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Docker Setup](https://docs.n8n.io/hosting/installation/docker/)
- [n8n Community Forum](https://community.n8n.io/)

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**Testado com**: n8n 1.19.0, Docker 24.0.7, PostgreSQL 15
