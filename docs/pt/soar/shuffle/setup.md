# Instalação e Configuração do Shuffle

> **AI Context**: Guia completo de instalação do Shuffle SOAR via Docker Compose. Inclui configuração inicial, API keys, webhooks e troubleshooting. Stack: Docker + OpenSearch + Shuffle. Keywords: Shuffle setup, Docker Compose, SOAR installation, webhook configuration, API keys.

## Pré-requisitos

### Hardware
- **CPU**: 4 cores (recomendado)
- **RAM**: 6GB mínimo, 8GB recomendado
- **Storage**: 20GB SSD
- **Rede**: Portas 3000, 3001, 3002 disponíveis

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
mkdir -p /opt/neoand-netbox-odoo-stack/shuffle/{data,apps}
cd /opt/neoand-netbox-odoo-stack/shuffle

# Estrutura final
/opt/neoand-netbox-odoo-stack/shuffle/
├── docker-compose.yml
├── .env
├── data/                  # OpenSearch data
└── apps/                  # Custom apps (opcional)
```

### Arquivo docker-compose.yml

```yaml
version: '3.8'

services:
  # OpenSearch (Database)
  shuffle-opensearch:
    image: opensearchproject/opensearch:2.11.0
    container_name: shuffle-opensearch
    hostname: shuffle-opensearch
    environment:
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - "OPENSEARCH_JAVA_OPTS=-Xms2g -Xmx2g"
      - "DISABLE_SECURITY_PLUGIN=true"
      - cluster.routing.allocation.disk.threshold_enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - ./data:/usr/share/opensearch/data
    ports:
      - "9200:9200"
    networks:
      - shuffle-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Shuffle Backend
  shuffle-backend:
    image: ghcr.io/shuffle/shuffle-backend:latest
    container_name: shuffle-backend
    hostname: shuffle-backend
    environment:
      - DATASTORE_EMULATOR_HOST=shuffle-opensearch:9200
      - SHUFFLE_OPENSEARCH_URL=http://shuffle-opensearch:9200
      - SHUFFLE_APP_HOTLOAD_FOLDER=/shuffle-apps
      - SHUFFLE_FILE_LOCATION=/shuffle-files
      - SHUFFLE_ELASTIC=true
      - ORG_ID=${ORG_ID:-default}
      - SHUFFLE_LOGS_DISABLED=false
      - BASE_URL=http://localhost:3001
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./apps:/shuffle-apps
      - shuffle-files:/shuffle-files
    ports:
      - "3000:3000"
      - "3001:3001"
    networks:
      - shuffle-network
    depends_on:
      shuffle-opensearch:
        condition: service_healthy
    restart: unless-stopped

  # Shuffle Frontend
  shuffle-frontend:
    image: ghcr.io/shuffle/shuffle-frontend:latest
    container_name: shuffle-frontend
    hostname: shuffle-frontend
    environment:
      - BACKEND_HOSTNAME=shuffle-backend
    ports:
      - "3002:80"
    networks:
      - shuffle-network
    depends_on:
      - shuffle-backend
    restart: unless-stopped

  # Orborus (Workflow Executor)
  shuffle-orborus:
    image: ghcr.io/shuffle/shuffle-orborus:latest
    container_name: shuffle-orborus
    hostname: shuffle-orborus
    environment:
      - SHUFFLE_WORKER_VERSION=latest
      - ENVIRONMENT_NAME=onprem
      - BASE_URL=http://shuffle-backend:3000
      - SHUFFLE_BASE_IMAGE_NAME=ghcr.io/shuffle
      - SHUFFLE_BASE_IMAGE_REGISTRY=ghcr.io
      - SHUFFLE_BASE_IMAGE_TAG_SUFFIX="-1.3.0"
      - CLEANUP=true
      - DOCKER_API_VERSION=1.43
      - ORG_ID=${ORG_ID:-default}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - shuffle-network
    depends_on:
      - shuffle-backend
    restart: unless-stopped

networks:
  shuffle-network:
    driver: bridge

volumes:
  shuffle-files:
```

### Arquivo .env

```bash
# .env
# ORG ID (mantenha default para single-tenant)
ORG_ID=default

# OpenSearch
OPENSEARCH_JAVA_OPTS=-Xms2g -Xmx2g

# URLs (ajuste se usar proxy reverso)
BASE_URL=http://localhost:3001
BACKEND_HOSTNAME=shuffle-backend

# Logging
SHUFFLE_LOGS_DISABLED=false

# Cleanup (remover containers órfãos)
CLEANUP=true
```

### Deploy

```bash
# Navegar para o diretório
cd /opt/neoand-netbox-odoo-stack/shuffle

# Iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Acompanhar logs
docker-compose logs -f shuffle-backend
```

**Output esperado**:
```
shuffle-opensearch    running
shuffle-backend       running
shuffle-frontend      running
shuffle-orborus       running
```

### Verificação de Saúde

```bash
# OpenSearch
curl -X GET "http://localhost:9200/_cluster/health?pretty"
# Esperado: status: "yellow" ou "green"

# Backend
curl -X GET "http://localhost:3000/api/v1/health"
# Esperado: {"success": true}

# Frontend
curl -I http://localhost:3002
# Esperado: HTTP/1.1 200 OK
```

## Configuração Inicial

### 1. Primeiro Acesso

```bash
# Abrir navegador
open http://localhost:3001  # macOS
xdg-open http://localhost:3001  # Linux
```

**Tela inicial**: Criar primeira conta (admin)

```
Email: admin@neoand.local
Username: admin
Password: NeoAndSecure2025!
```

> **IMPORTANTE**: Esta conta tem privilégios totais. Guarde as credenciais com segurança!

### 2. Configurar API Key

#### Via Interface Web

1. Login → Settings (ícone engrenagem)
2. **API Keys** → Generate New Key
3. Nome: `wazuh-integration`
4. Copiar chave (não será exibida novamente!)

```
API Key: 6f8a9b7c-1234-5678-90ab-cdef12345678
```

#### Via API (Alternativa)

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3001/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "NeoAndSecure2025!"
  }' | jq -r '.session_token')

# Gerar API key
curl -X POST http://localhost:3001/api/v1/orgs/${ORG_ID}/generate_apikey \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "wazuh-integration"
  }' | jq
```

### 3. Criar Webhook para Wazuh

#### Via Interface Web

1. **Workflows** → Create New Workflow
2. Nome: `Wazuh Alert Handler`
3. Adicionar trigger: **Webhook**
4. Copiar URL do webhook

```
Webhook URL: http://localhost:3001/api/v1/hooks/webhook_abc123def456
```

#### Via API

```bash
# Criar workflow
WORKFLOW_ID=$(curl -X POST http://localhost:3001/api/v1/workflows \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wazuh Alert Handler",
    "description": "Recebe alertas do Wazuh Manager"
  }' | jq -r '.id')

# Adicionar trigger webhook
curl -X POST http://localhost:3001/api/v1/workflows/${WORKFLOW_ID}/triggers \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger_type": "WEBHOOK",
    "name": "wazuh_webhook"
  }' | jq
```

### 4. Configurar Apps (Odoo + NetBox)

#### App: HTTP (para Odoo)

```json
{
  "name": "Odoo API",
  "large_image": "",
  "app_version": "1.0.0",
  "authentication": [
    {
      "name": "url",
      "example": "https://odoo.neoand.local"
    },
    {
      "name": "api_key",
      "example": "your-odoo-api-key"
    },
    {
      "name": "database",
      "example": "neoand_prod"
    }
  ]
}
```

**Configuração na UI**:
1. Apps → HTTP → Authenticate
2. URL: `https://odoo.neoand.local`
3. Headers:
   ```
   X-Odoo-Database: neoand_prod
   X-Odoo-API-Key: your-odoo-api-key
   ```

#### App: HTTP (para NetBox)

```json
{
  "name": "NetBox API",
  "app_version": "1.0.0",
  "authentication": [
    {
      "name": "url",
      "example": "https://netbox.neoand.local"
    },
    {
      "name": "token",
      "example": "your-netbox-token"
    }
  ]
}
```

**Configuração na UI**:
1. Apps → HTTP → Authenticate
2. URL: `https://netbox.neoand.local`
3. Headers:
   ```
   Authorization: Token your-netbox-token
   Content-Type: application/json
   ```

## Configuração Avançada

### Proxy Reverso (Nginx)

```nginx
# /etc/nginx/sites-available/shuffle
server {
    listen 80;
    server_name shuffle.neoand.local;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Habilitar configuração
sudo ln -s /etc/nginx/sites-available/shuffle /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL/TLS (Let's Encrypt)

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d shuffle.neoand.local

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Escalabilidade (Múltiplos Orborus)

```yaml
# docker-compose.yml (trecho)
services:
  shuffle-orborus-1:
    image: ghcr.io/shuffle/shuffle-orborus:latest
    container_name: shuffle-orborus-1
    environment:
      - WORKER_ID=worker-1
    # ... restante da config

  shuffle-orborus-2:
    image: ghcr.io/shuffle/shuffle-orborus:latest
    container_name: shuffle-orborus-2
    environment:
      - WORKER_ID=worker-2
    # ... restante da config
```

### Backup Automático

```bash
#!/bin/bash
# /opt/scripts/shuffle-backup.sh

BACKUP_DIR="/backup/shuffle"
DATE=$(date +%Y%m%d-%H%M%S)

# Backup workflows (via API)
curl -X GET http://localhost:3001/api/v1/workflows \
  -H "Authorization: Bearer ${SHUFFLE_API_KEY}" \
  | jq > ${BACKUP_DIR}/workflows-${DATE}.json

# Backup OpenSearch data
docker exec shuffle-opensearch \
  curl -X PUT "http://localhost:9200/_snapshot/backup/snapshot_${DATE}?wait_for_completion=true"

# Compactar
tar -czf ${BACKUP_DIR}/shuffle-full-${DATE}.tar.gz \
  ${BACKUP_DIR}/workflows-${DATE}.json \
  /opt/neoand-netbox-odoo-stack/shuffle/data

# Remover backups > 30 dias
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

echo "[$(date)] Backup concluído: shuffle-full-${DATE}.tar.gz"
```

```bash
# Adicionar ao cron
crontab -e
0 2 * * * /opt/scripts/shuffle-backup.sh >> /var/log/shuffle-backup.log 2>&1
```

## Troubleshooting

### Problema: OpenSearch não inicia

**Sintoma**:
```
shuffle-opensearch | ERROR: [1] bootstrap checks failed
shuffle-opensearch | [1]: max virtual memory areas vm.max_map_count [65530] is too low
```

**Solução**:
```bash
# Temporário
sudo sysctl -w vm.max_map_count=262144

# Permanente
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Problema: Backend crashloop

**Sintoma**:
```
shuffle-backend | panic: Failed to connect to OpenSearch
```

**Solução**:
```bash
# Verificar se OpenSearch está saudável
curl http://localhost:9200/_cluster/health

# Reiniciar serviços na ordem
docker-compose restart shuffle-opensearch
sleep 30
docker-compose restart shuffle-backend
```

### Problema: Workflows não executam

**Sintoma**: Workflows ficam em estado "EXECUTING" indefinidamente

**Solução**:
```bash
# Verificar logs do Orborus
docker logs shuffle-orborus

# Verificar socket Docker
ls -la /var/run/docker.sock

# Dar permissão (se necessário)
sudo chmod 666 /var/run/docker.sock

# Reiniciar Orborus
docker-compose restart shuffle-orborus
```

### Problema: Webhooks retornam 404

**Sintoma**:
```bash
curl http://localhost:3001/api/v1/hooks/webhook_xyz
# {"success": false, "reason": "Webhook not found"}
```

**Solução**:
1. Verificar URL completa na UI (Workflows → Webhook trigger)
2. Confirmar que workflow está ativo (toggle switch)
3. Verificar logs:
```bash
docker logs shuffle-backend | grep webhook
```

### Problema: Alta utilização de CPU

**Sintoma**: Orborus consome 100% CPU constantemente

**Solução**:
```bash
# Limpar containers órfãos
docker ps -a | grep shuffle-worker | awk '{print $1}' | xargs docker rm -f

# Limitar workers simultâneos
# docker-compose.yml
environment:
  - MAX_WORKERS=5  # Adicionar esta linha

# Reiniciar
docker-compose restart shuffle-orborus
```

## Validação da Instalação

### Checklist Completo

```bash
#!/bin/bash
# validate-shuffle.sh

echo "=== Validação Shuffle SOAR ==="

# 1. Serviços
echo "[1/6] Verificando serviços..."
docker-compose ps | grep -q "Up" && echo "✓ Containers rodando" || echo "✗ Containers com problema"

# 2. OpenSearch
echo "[2/6] Verificando OpenSearch..."
curl -s http://localhost:9200/_cluster/health | grep -q "green\|yellow" && \
  echo "✓ OpenSearch saudável" || echo "✗ OpenSearch com problema"

# 3. Backend
echo "[3/6] Verificando Backend..."
curl -s http://localhost:3000/api/v1/health | grep -q "success" && \
  echo "✓ Backend respondendo" || echo "✗ Backend não responde"

# 4. Frontend
echo "[4/6] Verificando Frontend..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 | grep -q "200" && \
  echo "✓ Frontend acessível" || echo "✗ Frontend inacessível"

# 5. Workflow teste
echo "[5/6] Criando workflow teste..."
# (requer API key configurada)

# 6. Webhook teste
echo "[6/6] Testando webhook..."
# (requer workflow ativo)

echo "=== Validação concluída ==="
```

## Próximos Passos

1. **[Integrar com Wazuh](wazuh-integration.md)**: Configure ossec.conf para enviar alertas
2. **[Criar Workflows](workflows.md)**: Importe templates prontos
3. **[Playbooks](../playbooks/index.md)**: Automatize resposta a incidentes

## Recursos Adicionais

- [Shuffle Architecture](https://shuffler.io/docs/architecture)
- [API Documentation](https://shuffler.io/docs/API)
- [Troubleshooting Guide](https://github.com/Shuffle/Shuffle/wiki/Troubleshooting)

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**Testado com**: Shuffle 1.3.0, Docker 24.0.7, Ubuntu 22.04
