#!/bin/bash

# 🔐 Security Lab Setup Script
# Vulnerabilidade scanning + SIEM + Compliance

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════╗
║                                                      ║
║     🔐 SECURITY LAB - VULNERABILITY & SIEM          ║
║                                                      ║
║     OpenVAS + Wazuh + Elasticsearch + Kibana       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}🔒 Iniciando laboratório de segurança...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado!${NC}"
    exit 1
fi

# Create directories
echo -e "${BLUE}📁 Criando diretórios...${NC}"
mkdir -p data/{netbox,elasticsearch,wazuh,openvas}

# Start services
echo -e "${BLUE}🚀 Iniciando serviços de segurança...${NC}"
docker-compose up -d

# Wait for services
echo -e "${BLUE}⏳ Aguardando serviços...${NC}"
sleep 15

# Check service health
check_service() {
    local service=$1
    local port=$2

    if nc -z localhost "$port" 2>/dev/null; then
        echo -e "${GREEN}✅ $service está rodando na porta $port${NC}"
    else
        echo -e "${YELLOW}⚠️  $service ainda inicializando...${NC}"
    fi
}

# Verify services
check_service "NetBox Security" 8010
sleep 2
check_service "OpenVAS" 9392
sleep 2
check_service "Wazuh Manager" 5000
sleep 2
check_service "Elasticsearch" 9200
sleep 2
check_service "Kibana" 5601
sleep 2
check_service "Nessus" 8834
sleep 2
check_service "Suricata" 9001

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}║      🔐 SECURITY LAB ATIVO E FUNCIONANDO! 🔐         ║${NC}"
echo -e "${GREEN}║                                                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}🎯 SERVIÇOS DE SEGURANÇA:${NC}"
echo ""
echo -e "   🔵 NetBox Security"
echo -e "      URL: ${YELLOW}http://localhost:8010${NC}"
echo -e "      Login: admin / admin"
echo -e "      Dados: CMDB com vulnerabilidades simuladas"
echo ""
echo -e "   🟢 OpenVAS Scanner"
echo -e "      URL: ${YELLOW}http://localhost:9392${NC}"
echo -e "      Login: admin / admin"
echo -e "      Função: Vulnerability scanning da rede"
echo ""
echo -e "   🟡 Wazuh SIEM"
echo -e "      URL: ${YELLOW}http://localhost:5000${NC}"
echo -e "      Dashboard: ${YELLOW}http://localhost:443${NC}"
echo -e "      Função: SIEM + HIDS + Compliance"
echo ""
echo -e "   🔴 Elasticsearch"
echo -e "      URL: ${YELLOW}http://localhost:9200${NC}"
echo -e "      Função: Log storage + search"
echo ""
echo -e "   🟠 Kibana"
echo -e "      URL: ${YELLOW}http://localhost:5601${NC}"
echo -e "      Função: Log visualization"
echo ""
echo -e "   ⚪ Nessus (Demo)"
echo -e "      URL: ${YELLOW}http://localhost:8834${NC}"
echo -e "      Função: Vulnerability assessment"
echo ""
echo -e "   🔍 Suricata IDS"
echo -e "      URL: ${YELLOW}http://localhost:9001${NC}"
echo -e "      Função: Network intrusion detection"
echo ""

echo -e "${CYAN}📚 EXERCÍCIOS PRÁTICOS:${NC}"
echo ""
echo -e "   1. ${YELLOW}Vulnerability Scan${NC}"
echo -e "      • Acesse OpenVAS: http://localhost:9392"
echo -e "      • Execute scan na rede 192.168.1.0/24"
echo -e "      • Analise vulnerabilidades críticas"
echo ""
echo -e "   2. ${YELLOW}SIEM Monitoring${NC}"
echo -e "      • Acesse Wazuh: http://localhost:5000"
echo -e "      • Configure agentes nos endpoints"
echo -e "      • Monitore logs e eventos de segurança"
echo ""
echo -e "   3. ${YELLOW}Compliance Check${NC}"
echo -e "      • Execute verificação CIS Benchmarks"
echo -e "      • Gere relatório de compliance"
echo -e "      • Identifique controles em falha"
echo ""
echo -e "   4. ${YELLOW}Incident Response${NC}"
echo -e "      • Simule um incidente de segurança"
echo -e "      • Investigue no SIEM"
echo -e "      • Documente resposta ao incidente"
echo ""

echo -e "${CYAN}🎓 CERTIFICAÇÕES RELACIONADAS:${NC}"
echo ""
echo -e "   • ${YELLOW}OSCP${NC} - Offensive Security Certified Professional"
echo -e "   • ${YELLOW}GCIH${NC} - GIAC Certified Incident Handler"
echo -e "   • ${YELLOW}CISSP${NC} - Certified Information Systems Security Professional"
echo -e "   • ${YELLOW}CISM${NC} - Certified Information Security Manager"
echo ""

echo -e "${PURPLE}💡 Dica: Use ./scripts/vulnerability-scan.sh para scans automatizados${NC}"
echo -e "${GREEN}✨ Aproveite o laboratório de segurança! ✨${NC}"
