#!/bin/bash

# 🧪 NetBox + Odoo + neo_stack Laboratory Setup
# Script de configuração automática

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════╗
║                                                      ║
║    🧪 NETBOX + ODOO + NEO_STACK LAB SETUP          ║
║                                                      ║
║    "Do Zero ao Hero em 5 Minutos"                   ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check prerequisites
echo -e "${BLUE}📋 Verificando pré-requisitos...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado!${NC}"
    echo -e "${YELLOW}   Instale o Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado!${NC}"
    echo -e "${YELLOW}   Instale o Docker Compose: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

echo -e "${GREEN}✅ Docker Compose: $($COMPOSE_CMD --version)${NC}"

# Check system resources
echo -e "${BLUE}💾 Verificando recursos do sistema...${NC}"

# Check RAM (need at least 4GB)
if command -v vm_stat &> /dev/null; then
    # macOS
    FREE_PAGES=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    FREE_MB=$((FREE_PAGES * 4096 / 1024 / 1024))
elif command -v free &> /dev/null; then
    # Linux
    FREE_MB=$(free -m | awk 'NR==2{printf "%.0f", $7}')
else
    FREE_MB=4096  # Assume 4GB if can't check
fi

if [ "$FREE_MB" -lt 4096 ]; then
    echo -e "${YELLOW}⚠️  Memória livre: ${FREE_MB}MB (recomendado: 8GB+)${NC}"
else
    echo -e "${GREEN}✅ Memória livre: ${FREE_MB}MB${NC}"
fi

# Check disk space (need at least 10GB)
DISK_AVAILABLE=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "${DISK_AVAILABLE%.*}" -lt 10 ]; then
    echo -e "${YELLOW}⚠️  Espaço em disco: ${DISK_AVAILABLE} (recomendado: 10GB+)${NC}"
else
    echo -e "${GREEN}✅ Espaço em disco: ${DISK_AVAILABLE}${NC}"
fi

# Create directories
echo -e "${BLUE}📁 Criando diretórios...${NC}"
mkdir -p data/{netbox,postgres,neo-stack,odoo,grafana,prometheus}
mkdir -p monitoring/dashboards

# Set permissions
echo -e "${BLUE}🔒 Configurando permissões...${NC}"
chmod 755 data/*

# Create .env file
echo -e "${BLUE}⚙️  Criando arquivo .env...${NC}"
cat > .env << EOF
# NetBox Configuration
NETBOX_DB_NAME=netbox
NETBOX_DB_USER=netbox
NETBOX_DB_PASSWORD=netbox123
NETBOX_DB_HOST=postgres
NETBOX_SECRET_KEY=secret-key-development-$(date +%s)

# Odoo Configuration
ODOO_DB_HOST=postgres
ODOO_DB_PORT=5432
ODOO_DB_USER=netbox
ODOO_DB_PASSWORD=netbox123
ODOO_DB_NAME=odoo

# neo_stack Configuration
NEO_STACK_DB_URL=postgresql://netbox:netbox123@postgres:5432/neo_stack
NEO_STACK_REDIS_URL=redis://redis:6379/0
NEO_STACK_NETBOX_API=http://netbox:8080/api
NEO_STACK_ODOO_URL=http://odoo:8069

# Grafana Configuration
GRAFANA_ADMIN_PASSWORD=admin123

# Timezone
TZ=America/Sao_Paulo
EOF

echo -e "${GREEN}✅ Arquivo .env criado${NC}"

# Pull images
echo -e "${BLUE}📦 Baixando imagens Docker (isso pode levar alguns minutos)...${NC}"
$COMPOSE_CMD pull

# Build neo_stack if needed
if [ -f "neo-stack/Dockerfile" ]; then
    echo -e "${BLUE}🔨 Construindo imagem neo_stack...${NC}"
    $COMPOSE_CMD build neo-stack
fi

# Start services
echo -e "${GREEN}🚀 Iniciando serviços...${NC}"
echo -e "${YELLOW}   Isso pode levar 2-3 minutos na primeira vez${NC}"
$COMPOSE_CMD up -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"

# Function to check service health
check_service() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service está pronto!${NC}"
            return 0
        fi
        echo -ne "${YELLOW}   Aguardando $service... ($attempt/$max_attempts)\r${NC}"
        sleep 5
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ $service não respondeu a tempo${NC}"
    return 1
}

# Check each service
sleep 10  # Initial wait
check_service "NetBox" "http://localhost:8000" || echo -e "${YELLOW}   Continue aguardando...${NC}"
sleep 5
check_service "Odoo" "http://localhost:8069" || echo -e "${YELLOW}   Continue aguardando...${NC}"
sleep 5
check_service "neo_stack" "http://localhost:3000" || echo -e "${YELLOW}   Continue aguardando...${NC}"
sleep 5
check_service "Documentação" "http://localhost:8080" || echo -e "${YELLOW}   Continue aguardando...${NC}"

# Show success message
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║       🎉 LABORATÓRIO INICIADO COM SUCESSO! 🎉        ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 SERVIÇOS DISPONÍVEIS:${NC}"
echo ""
echo -e "   🔵 NetBox (CMDB/IPAM)"
echo -e "      ${YELLOW}URL:${NC} http://localhost:8000"
echo -e "      ${YELLOW}Login:${NC} admin"
echo -e "      ${YELLOW}Senha:${NC} admin"
echo ""
echo -e "   🟢 Odoo (ERP)"
echo -e "      ${YELLOW}URL:${NC} http://localhost:8069"
echo -e "      ${YELLOW}Base:${NC} netbox"
echo ""
echo -e "   🟡 neo_stack (Framework)"
echo -e "      ${YELLOW}URL:${NC} http://localhost:3000"
echo -e "      ${YELLOW}API:${NC} http://localhost:3000/api"
echo -e "      ${YELLOW}Docs:${NC} http://localhost:3000/docs"
echo ""
echo -e "   📚 Documentação"
echo -e "      ${YELLOW}URL:${NC} http://localhost:8080"
echo ""
echo -e "   📈 Grafana (Dashboards)"
echo -e "      ${YELLOW}URL:${NC} http://localhost:3001"
echo -e "      ${YELLOW}Login:${NC} admin"
echo -e "      ${YELLOW}Senha:${NC} admin123"
echo ""
echo -e "   🎭 Visualização 3D"
echo -e "      ${YELLOW}URL:${NC} http://localhost:9000"
echo ""
echo -e "${CYAN}📖 PRÓXIMOS PASSOS:${NC}"
echo ""
echo -e "   1. 📖 Leia o README: ${YELLOW}cat README.md${NC}"
echo -e "   2. 🎓 Faça o tutorial: ${YELLOW}http://localhost:8080${NC}"
echo -e "   3. 💻 Experimente: ${YELLOW}http://localhost:8000${NC}"
echo -e "   4. 🎯 Casos de uso: ${YELLOW}http://localhost:8080/casos-uso/${NC}"
echo ""
echo -e "${CYAN}🛠️  COMANDOS ÚTEIS:${NC}"
echo ""
echo -e "   ${YELLOW}Ver logs:${NC}        $COMPOSE_CMD logs -f [serviço]"
echo -e "   ${YELLOW}Parar tudo:${NC}      $COMPOSE_CMD down"
echo -e "   ${YELLOW}Restart:${NC}        $COMPOSE_CMD restart"
echo -e "   ${YELLOW}Status:${NC}         $COMPOSE_CMD ps"
echo -e "   ${YELLOW}Backup:${NC}         ./scripts/backup.sh"
echo -e "   ${YELLOW}Reset:${NC}          ./scripts/reset.sh"
echo ""
echo -e "${PURPLE}💡 DICA: Salve este arquivo (F12) para acesso rápido!${NC}"
echo ""

# Optional: Open browser
if command -v open &> /dev/null; then
    echo -e "${CYAN}🌐 Deseja abrir o browser? (y/n)${NC}"
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        open http://localhost:8000
    fi
elif command -v xdg-open &> /dev/null; then
    echo -e "${CYAN}🌐 Deseja abrir o browser? (y/n)${NC}"
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        xdg-open http://localhost:8000
    fi
fi

echo ""
echo -e "${GREEN}✨ Aproveite o laboratório! ✨${NC}"
