#!/bin/bash
# 🚀 SPRINT 1 - SETUP AUTOMÁTICO
# Foundation: Centrifugo + Redis
# Data: 13-19 Dezembro 2025

set -e  # Exit on error

echo "🚀 SPRINT 1 - SETUP FOUNDATION"
echo "=================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Verificar prerequisitos
echo "Verificando prerequisitos..."
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker não encontrado! Instale Docker primeiro."
    exit 1
fi
log "Docker encontrado: $(docker --version)"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não encontrado! Instale Docker Compose primeiro."
    exit 1
fi
log "Docker Compose encontrado: $(docker-compose --version)"

# Verificar Git
if ! command -v git &> /dev/null; then
    error "Git não encontrado! Instale Git primeiro."
    exit 1
fi
log "Git encontrado: $(git --version)"

echo ""
echo "✅ Todos prerequisitos OK!"
echo ""

# Criar branch do Sprint 1
echo "Criando branch Sprint 1..."
git checkout -b feature/sprint-1-centrifugo-foundation 2>/dev/null || warn "Branch já existe"

# Criar diretórios se não existirem
mkdir -p event-service/{src,config,tests,data}

log "Diretórios criados"

# Criar .env.example
cat > event-service/.env.example << 'EOF'
# ========================================
# CENTRIFUGO CONFIGURATION
# ========================================
CENTRIFUGO_URL=http://localhost:8000
CENTRIFUGO_TOKEN=your-secure-token-key-change-in-production
CENTRIFUGO_SECRET=your-secure-secret-key-change-in-production

# ========================================
# REDIS CONFIGURATION
# ========================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password-change-in-production

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRY=3600

# ========================================
# RATE LIMITING
# ========================================
ENABLE_RATE_LIMIT=true
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX_REQUESTS=100

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=development
PORT=8002
EOF

log "Arquivo .env.example criado"

# Criar .env local
if [ ! -f event-service/.env ]; then
    cp event-service/.env.example event-service/.env
    warn "Arquivo .env criado! Edite com suas configurações."
else
    info "Arquivo .env já existe, pulando..."
fi

# Criar package.json para event-service
cat > event-service/package.json << 'EOF'
{
  "name": "neo-event-service",
  "version": "1.0.0",
  "description": "NEO_STACK Event Service - Real-time messaging",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build": "tsc",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "keywords": [
    "centrifugo",
    "redis",
    "real-time",
    "websockets",
    "events",
    "neo-stack"
  ],
  "author": "NeoAnd",
  "license": "MIT",
  "dependencies": {
    "centrifugo": "^3.2.0",
    "redis": "^4.6.0",
    "jsonwebtoken": "^9.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "prom-client": "^15.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/cors": "^2.8.0",
    "typescript": "^5.0.0",
    "nodemon": "^3.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
EOF

log "package.json criado"

# Instalar dependências
info "Instalando dependências Node.js..."
cd event-service
npm install
cd ..

log "Dependências instaladas"

# Criar Docker Compose para Sprint 1
cat > event-service/docker-compose.sprint1.yml << 'EOF'
version: '3.8'

services:
  # Centrifugo Server
  centrifugo:
    image: centrifugo/centrifugo:v3.2.0
    container_name: neo-centrifugo
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./config/centrifugo.json:/centrifugo.json:ro
      - centrifugo_data:/app/data
    environment:
      - CENTRIFUGO_CONFIG=/centrifugo.json
      - GIN_MODE=release
    command: >
      centrifugo
      --config=/centrifugo.json
      --log_level=info
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Redis Primary
  redis:
    image: redis:7.2-alpine
    container_name: neo-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./config/redis.conf:/usr/local/etc/redis/redis.conf:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Redis Exporter (for monitoring)
  redis-exporter:
    image: oliver006/redis_exporter:v1.53.0
    container_name: neo-redis-exporter
    restart: unless-stopped
    ports:
      - "9121:9121"
    environment:
      - REDIS_ADDR=redis://redis:6379
    depends_on:
      - redis

volumes:
  centrifugo_data:
  redis_data:
EOF

log "Docker Compose Sprint 1 criado"

# Criar configuração do Centrifugo
cat > event-service/config/centrifugo.json << 'EOF'
{
  "address": "0.0.0.0",
  "port": 8000,
  "worker_num": 0,
  "engine": "redis",
  "redis_host": "redis",
  "redis_port": 6379,
  "redis_password": "",
  "redis_db": 0,
  "password": "",
  "secret": "sprint1-secret-key-change-in-production",
  "token": "sprint1-token-key-change-in-production",
  "publish": true,
  "subscribe_to_connection": true,
  "history_size": 10,
  "history_ttl": 3600,
  "metrics_interval": 60,
  "client_request_limit": 100,
  "max_message_size": 65536,
  "websocket_path": "/connection/websocket",
  "allowed_origins": [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003"
  ],
  "compression": true,
  "namespaces": [
    {
      "name": "tenant",
      "channel_prefix": "tenant:"
    },
    {
      "name": "admin",
      "channel_prefix": "admin:"
    },
    {
      "name": "system",
      "channel_prefix": "system:"
    }
  ],
  "presence": true,
  "anonymous": false
}
EOF

log "Configuração Centrifugo criada"

# Criar configuração do Redis
cat > event-service/config/redis.conf << 'EOF'
# Redis Configuration for Sprint 1
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
tcp-keepalive 300
timeout 0
tcp-backlog 511
EOF

log "Configuração Redis criada"

# Criar script de health check
cat > event-service/scripts/health-check.sh << 'EOF'
#!/bin/bash
# Health Check Script

echo "Checking Centrifugo..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Centrifugo: OK"
else
    echo "❌ Centrifugo: FAILED"
fi

echo "Checking Redis..."
if docker exec neo-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: FAILED"
fi

echo "Checking Docker services..."
docker-compose -f docker-compose.sprint1.yml ps
EOF

chmod +x event-service/scripts/health-check.sh

log "Script de health check criado"

# Criar README Sprint 1
cat > event-service/SPRINT1_README.md << 'EOF'
# 🚀 Sprint 1 - Foundation Setup

## Quick Start

### 1. Configurar Ambiente
```bash
# Copiar e editar .env
cp .env.example .env
nano .env  # Editar JWT_SECRET, CENTRIFUGO_SECRET, etc.
```

### 2. Iniciar Serviços
```bash
# Iniciar Centrifugo + Redis
docker-compose -f docker-compose.sprint1.yml up -d

# Verificar status
./scripts/health-check.sh
```

### 3. Testar Conectividade
```bash
# Testar Centrifugo
curl http://localhost:8000/health

# Testar Redis
docker exec neo-redis redis-cli ping
```

### 4. Testar WebSocket
```bash
# Instalar wscat
npm install -g wscat

# Conectar
wscat -c ws://localhost:8000/connection/websocket

# No prompt, digite:
# {"method":"subscribe","params":{"channel":"tenant:123:deployments"}}
```

## Deliverables Sprint 1

- [ ] Centrifugo rodando em http://localhost:8000
- [ ] Redis respondendo em localhost:6379
- [ ] Health checks passing
- [ ] Multi-tenant channels funcionando
- [ ] JWT middleware implementado
- [ ] Documentação completa

## Equipes

- **DevOps**: Ana Silva, Carlos Santos
- **Backend**: João Oliveira, Maria Costa, Pedro Lima
- **Frontend**: Julia Mendes, Roberto Alves, Sandra Dias, Tiago Rocha
- **Tech Lead**: NeoAnd

## Cronograma

- **Dia 1 (13 Dez)**: Setup Centrifugo + Redis
- **Dia 2 (14 Dez)**: Configurações avançadas
- **Dia 3 (15 Dez)**: Multi-tenant structure
- **Dia 4 (16 Dez)**: Monitoring
- **Dia 5 (17 Dez)**: Auth middleware
- **Dia 6 (18 Dez)**: Testing
- **Dia 7 (19 Dez)**: Finalização + Demo

## Comandos Úteis

```bash
# Ver logs
docker-compose -f docker-compose.sprint1.yml logs -f centrifugo

# Parar serviços
docker-compose -f docker-compose.sprint1.yml down

# Reiniciar
docker-compose -f docker-compose.sprint1.yml restart

# Status
docker-compose -f docker-compose.sprint1.yml ps
```

## Suporte

- **Slack**: #sprint-1-centrifugo
- **Email**: sprint1@neo-stack.com
- **Tech Lead**: NeoAnd (24/7)
EOF

log "README Sprint 1 criado"

echo ""
echo "✅ SPRINT 1 SETUP COMPLETO!"
echo "=================================="
echo ""
info "Próximos passos:"
echo "  1. Editar .env com suas configurações"
echo "  2. Executar: docker-compose -f docker-compose.sprint1.yml up -d"
echo "  3. Verificar: ./scripts/health-check.sh"
echo ""
info "Documentação: event-service/SPRINT1_README.md"
echo ""
warn "Lembre-se: Commit suas mudanças na branch feature/sprint-1-centrifugo-foundation"
echo ""
log "Boa sorte no Sprint 1! 🚀"
