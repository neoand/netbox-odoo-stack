# Instalação e Configuração do Cortex

Este guia detalha a instalação e configuração completa do Cortex para produção.

## Pré-requisitos

### Hardware Mínimo

=== "Ambiente de Teste"
    ```yaml
    CPU: 2 cores (x86_64)
    RAM: 4 GB
    Disco: 20 GB SSD
    Network: 100 Mbps
    ```

=== "Produção Pequena"
    ```yaml
    CPU: 4 cores (x86_64)
    RAM: 8 GB
    Disco: 100 GB SSD
    Network: 1 Gbps
    ```

=== "Produção Alta Demanda"
    ```yaml
    CPU: 8+ cores (x86_64)
    RAM: 16+ GB
    Disco: 500+ GB NVMe SSD
    Network: 10 Gbps
    ```

### Software Obrigatório

| Software | Versão | Verificação |
|----------|--------|-------------|
| Docker | 20.10+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |
| Linux | Ubuntu 20.04+, Debian 11+, RHEL 8+ | `cat /etc/os-release` |
| curl | Qualquer | `curl --version` |

### Preparação do Sistema

#### 1. Atualizar Sistema

=== "Ubuntu/Debian"
    ```bash
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git vim net-tools
    ```

=== "RHEL/Rocky/Alma"
    ```bash
    sudo dnf update -y
    sudo dnf install -y curl wget git vim net-tools
    ```

#### 2. Instalar Docker

=== "Ubuntu/Debian"
    ```bash
    # Remover versões antigas
    sudo apt remove docker docker-engine docker.io containerd runc

    # Instalar dependências
    sudo apt install -y ca-certificates curl gnupg lsb-release

    # Adicionar repositório oficial Docker
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io \
        docker-compose-plugin

    # Iniciar Docker
    sudo systemctl enable docker
    sudo systemctl start docker

    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    newgrp docker
    ```

=== "RHEL/Rocky/Alma"
    ```bash
    # Remover versões antigas
    sudo dnf remove docker docker-client docker-common \
        docker-latest docker-engine

    # Adicionar repositório
    sudo dnf install -y dnf-plugins-core
    sudo dnf config-manager --add-repo \
        https://download.docker.com/linux/rhel/docker-ce.repo

    # Instalar Docker
    sudo dnf install -y docker-ce docker-ce-cli containerd.io \
        docker-compose-plugin

    # Iniciar Docker
    sudo systemctl enable docker
    sudo systemctl start docker

    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    newgrp docker
    ```

#### 3. Verificar Instalação

```bash
# Verificar Docker
docker --version
# Saída esperada: Docker version 24.0.x

# Verificar Docker Compose
docker compose version
# Saída esperada: Docker Compose version v2.x.x

# Testar Docker
docker run hello-world
```

#### 4. Configurar Limites do Sistema

```bash
# Aumentar limites para Elasticsearch
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# Aumentar file descriptors
sudo tee -a /etc/security/limits.conf <<EOF
*  soft  nofile  65536
*  hard  nofile  65536
*  soft  nproc   4096
*  hard  nproc   4096
EOF

# Aplicar mudanças
sudo sysctl -p
```

## Instalação via Docker Compose

### Estrutura de Diretórios

```bash
# Criar estrutura de diretórios
sudo mkdir -p /opt/cortex/{data,logs,analyzers,responders}
sudo mkdir -p /opt/cortex/elasticsearch/{data,logs}
sudo mkdir -p /opt/cortex/config

# Definir permissões
sudo chown -R 1000:1000 /opt/cortex/elasticsearch
sudo chown -R $(whoami):$(whoami) /opt/cortex/{data,logs,config}
```

### Arquivo de Configuração Principal

Crie `/opt/cortex/config/application.conf`:

```hocon
# Cortex Configuration
play.http.secret.key = "CHANGE_ME_PLEASE_USE_LONG_RANDOM_STRING"

# Elasticsearch Configuration
search {
  index = cortex
  uri = "http://elasticsearch:9200"

  # Configurações de conexão
  keepalive = 1m
  pagesize = 50
  nbshards = 5
  nbreplicas = 1

  # Aguardar Elasticsearch ficar disponível
  connectionRequestTimeout = 120000
}

# Autenticação
auth {
  # Métodos disponíveis: local, ldap, oauth2, pki
  providers = [
    {
      name = local
      # Auto criar primeira organização
      defaultUserDomain = "cortex.local"
    }
  ]

  # Múltiplas tentativas antes de bloquear
  multifactor.enabled = false
}

# Analyzers e Responders
analyzer {
  # Diretórios de analyzers
  urls = [
    "https://download.thehive-project.org/analyzers.json"
  ]

  # Configurações de execução
  fork-join-executor {
    parallelism-min = 2
    parallelism-factor = 2.0
    parallelism-max = 4
  }
}

responder {
  # Diretórios de responders
  urls = [
    "https://download.thehive-project.org/responders.json"
  ]

  # Configurações de execução
  fork-join-executor {
    parallelism-min = 2
    parallelism-factor = 2.0
    parallelism-max = 4
  }
}

# Job execution
job {
  runner = [docker]

  # Timeout padrão para jobs (10 minutos)
  timeout = 10 minutes

  # Configuração Docker
  dockerjob {
    # Auto pull de imagens
    auto_pull = true

    # Registry de analyzers/responders
    image_registry = "docker.io/cortexneurons"

    # Rede Docker
    network = "bridge"
  }
}

# Configuração de cache
cache {
  job = 10 minutes
  user = 5 minutes
  organization = 5 minutes
}

# Streaming de resultados
stream.longpolling.refresh = 1 second

# CORS
play.filters.enabled += play.filters.cors.CORSFilter
play.filters.cors {
  pathPrefixes = ["/api"]
  allowedOrigins = ["*"]
  allowedHttpMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  allowedHttpHeaders = ["Accept", "Content-Type", "Authorization"]
}
```

!!! warning "Secret Key"
    Gere uma secret key forte:
    ```bash
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1
    ```

### Docker Compose File

Crie `/opt/cortex/docker-compose.yml`:

```yaml
version: "3.8"

services:
  elasticsearch:
    image: elasticsearch:7.17.18
    container_name: cortex-elasticsearch
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - cluster.name=cortex-cluster
      - node.name=cortex-node-1
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
      - xpack.security.enabled=false
      - xpack.monitoring.enabled=false
      - xpack.ml.enabled=false
      - xpack.graph.enabled=false
      - xpack.watcher.enabled=false
      - http.cors.enabled=true
      - http.cors.allow-origin="*"
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
      - elasticsearch_logs:/usr/share/elasticsearch/logs
    networks:
      - cortex_network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  cortex:
    image: thehiveproject/cortex:3.1.7
    container_name: cortex
    restart: unless-stopped
    depends_on:
      elasticsearch:
        condition: service_healthy
    ports:
      - "9001:9001"
    environment:
      - job_directory=/opt/cortex/jobs
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./config/application.conf:/etc/cortex/application.conf:ro
      - cortex_jobs:/opt/cortex/jobs
      - cortex_data:/opt/cortex/data
      - cortex_logs:/var/log/cortex
    networks:
      - cortex_network
    command:
      - "--no-config"
      - "--no-config-secret"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9001/api/status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 90s

networks:
  cortex_network:
    driver: bridge

volumes:
  elasticsearch_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/cortex/elasticsearch/data
  elasticsearch_logs:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/cortex/elasticsearch/logs
  cortex_jobs:
    driver: local
  cortex_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/cortex/data
  cortex_logs:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/cortex/logs
```

### Iniciar Serviços

```bash
# Navegar para diretório
cd /opt/cortex

# Iniciar serviços
docker compose up -d

# Verificar logs
docker compose logs -f cortex

# Aguardar mensagem: "Cortex started"
```

### Verificar Instalação

```bash
# Verificar containers
docker compose ps
# Todos devem estar "healthy"

# Testar API
curl http://localhost:9001/api/status
# Saída esperada: {"status":"OK"}

# Verificar Elasticsearch
curl http://localhost:9200/_cluster/health?pretty
# status: yellow ou green
```

## Configuração Inicial

### 1. Primeira Organização e Usuário

```bash
# Acessar container Cortex
docker exec -it cortex bash

# Criar primeira organização e superadmin
curl -X POST http://localhost:9001/api/maintenance/migrate
```

Acesse `http://seu-servidor:9001` no navegador.

**Tela de Configuração Inicial:**

1. **Update Database**: Clique para criar schema inicial
2. **Create Administrator**:
   - Username: `admin`
   - Name: `Administrator`
   - Password: `SENHA_FORTE_AQUI`
   - Organization: `cortex`

!!! warning "Segurança"
    **ALTERE IMEDIATAMENTE** a senha padrão após primeiro login!

### 2. Configurar Organizações

No Cortex, organizações isolam completamente dados e configurações.

**Criar Nova Organização:**

1. Login como admin
2. Menu: **Organizations** > **Add Organization**
3. Preencher:
   - Name: `security-team`
   - Description: `SOC Team`
4. Criar usuários para a organização

**Boas Práticas:**

- Uma organização por equipe/cliente
- Não compartilhar usuários entre organizações
- Usar prefixos descritivos (ex: `team-`, `client-`)

### 3. Criar Usuários

**Via Web Interface:**

1. **Organizations** > Selecionar organização
2. **Users** > **Add User**
3. Preencher:
   - Login: `analyst1`
   - Name: `John Analyst`
   - Password: Gerada automaticamente
   - Roles: `read`, `analyze`, `orgadmin`

**Roles Disponíveis:**

| Role | Permissões |
|------|------------|
| `read` | Visualizar jobs e reports |
| `analyze` | Executar analyzers |
| `orgadmin` | Administrar organização |
| `superadmin` | Administrar todo Cortex |

**Via API:**

```bash
# Obter API key do admin
ADMIN_KEY="sua_api_key_aqui"

# Criar usuário
curl -X POST http://localhost:9001/api/user \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "analyst2@security-team",
    "name": "Jane Analyst",
    "roles": ["read", "analyze"],
    "organization": "security-team",
    "password": "SENHA_FORTE_TEMPORARIA"
  }'
```

### 4. Gerar API Keys

**Para integração com TheHive e outras ferramentas:**

1. Login no usuário
2. **Profile** (canto superior direito)
3. **API Key** > **Create API Key**
4. Copiar e armazenar com segurança

**Via API:**

```bash
curl -X POST http://localhost:9001/api/user/analyst1@security-team/key/renew \
  -H "Authorization: Bearer $ADMIN_KEY"
```

!!! danger "Segurança de API Keys"
    - Nunca commite API keys em repositórios
    - Use variáveis de ambiente ou vault
    - Rotacione keys regularmente
    - Revogue keys não utilizadas

## Instalação de Analyzers

Analyzers são containers Docker baixados sob demanda.

### Habilitar Analyzers

**Via Web Interface:**

1. **Organization Settings** > **Analyzers**
2. Lista de analyzers disponíveis aparece
3. Para cada analyzer desejado:
   - Clique no nome
   - **Enable** (toggle)
   - Configure parâmetros necessários
   - **Save**

### Configurar Analyzers com API Keys

Muitos analyzers requerem API keys de serviços externos.

#### VirusTotal

```yaml
Analyzer: VirusTotal_GetReport_3_0
Configuração:
  - key: SUA_API_KEY_VIRUSTOTAL
  - polling_interval: 60
  - auto_extract_artifacts: true
```

**Obter API Key:** https://www.virustotal.com/gui/my-apikey

#### Shodan

```yaml
Analyzer: Shodan_Info_1_0
Configuração:
  - key: SUA_API_KEY_SHODAN
```

**Obter API Key:** https://account.shodan.io/

#### AbuseIPDB

```yaml
Analyzer: AbuseIPDB_1_0
Configuração:
  - key: SUA_API_KEY_ABUSEIPDB
```

**Obter API Key:** https://www.abuseipdb.com/api

#### MISP

```yaml
Analyzer: MISP_2_1
Configuração:
  - url: https://seu-misp.example.com
  - key: SUA_API_KEY_MISP
  - cert_check: true
  - cert_path: /path/to/cert.pem (opcional)
```

#### MaxMind GeoIP

```yaml
Analyzer: MaxMind_GeoIP_4_0
Configuração:
  - account_id: SEU_ACCOUNT_ID
  - license_key: SUA_LICENSE_KEY
```

**Obter Licença:** https://www.maxmind.com/en/geolite2/signup

### Configuração via application.conf

Alternativa: configurar todas API keys em arquivo:

```hocon
# Adicionar ao /opt/cortex/config/application.conf

analyzer {
  config {
    VirusTotal_GetReport_3_0 {
      key = "VIRUSTOTAL_API_KEY"
      polling_interval = 60
    }

    Shodan_Info_1_0 {
      key = "SHODAN_API_KEY"
    }

    AbuseIPDB_1_0 {
      key = "ABUSEIPDB_API_KEY"
    }

    MISP_2_1 {
      url = "https://misp.example.com"
      key = "MISP_API_KEY"
      cert_check = true
    }

    MaxMind_GeoIP_4_0 {
      account_id = "MAXMIND_ACCOUNT"
      license_key = "MAXMIND_LICENSE"
    }
  }
}
```

**Reiniciar Cortex após mudanças:**

```bash
docker compose restart cortex
```

### Analyzers Recomendados para Começar

=== "Gratuitos (Sem API Key)"
    ```yaml
    - FileInfo_8_0
    - Yara_2_0
    - Abuse_Finder_3_0
    - CIRCLPassiveDNS_2_0
    - CERTatPassiveTotal_2_0
    - URLhaus_2_0
    - PhishTank_2_1
    - ThreatCrowd_2_0
    ```

=== "Gratuitos (Com API Key)"
    ```yaml
    - VirusTotal_GetReport_3_0
    - VirusTotal_Scan_3_0
    - AbuseIPDB_1_0
    - Shodan_Info_1_0
    - OTXQuery_2_0 (AlienVault)
    - GoogleSafeBrowsing_2_0
    - EmailRep_1_0
    - MaxMind_GeoIP_4_0
    ```

=== "Pagos"
    ```yaml
    - JoeSandbox_File_Analysis_2_0
    - RecordedFuture_2_1
    - DomainTools_Iris_2_0
    - PassiveTotal_2_0
    - HybridAnalysis (limitado gratuito)
    ```

## Instalação de Responders

### Habilitar Responders

Processo similar a analyzers:

1. **Organization Settings** > **Responders**
2. Localizar responder desejado
3. **Enable** e configurar

### Responders Essenciais

#### Mailer (Notificação Email)

```yaml
Responder: Mailer_1_0
Configuração:
  - smtp_host: smtp.gmail.com
  - smtp_port: 587
  - smtp_user: alerts@example.com
  - smtp_password: SENHA_APP
  - from: SOC Team <soc@example.com>
  - use_tls: true
```

#### MISP Sighting

```yaml
Responder: MISP_Sighting_2_0
Configuração:
  - url: https://misp.example.com
  - key: MISP_API_KEY
  - cert_check: true
```

#### Wazuh Active Response

```yaml
Responder: Wazuh_1_0
Configuração:
  - wazuh_manager: wazuh-manager.local
  - wazuh_api_user: cortex
  - wazuh_api_pass: SENHA_WAZUH
  - wazuh_api_port: 55000
  - use_https: true
```

## Configuração Avançada

### Elasticsearch Cluster (Produção)

Para alta disponibilidade:

```yaml
# docker-compose-cluster.yml
version: "3.8"

services:
  es01:
    image: elasticsearch:7.17.18
    environment:
      - node.name=es01
      - cluster.name=cortex-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms4g -Xmx4g"
    volumes:
      - es01_data:/usr/share/elasticsearch/data
    networks:
      - cortex_network

  es02:
    image: elasticsearch:7.17.18
    environment:
      - node.name=es02
      - cluster.name=cortex-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms4g -Xmx4g"
    volumes:
      - es02_data:/usr/share/elasticsearch/data
    networks:
      - cortex_network

  es03:
    image: elasticsearch:7.17.18
    environment:
      - node.name=es03
      - cluster.name=cortex-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms4g -Xmx4g"
    volumes:
      - es03_data:/usr/share/elasticsearch/data
    networks:
      - cortex_network

  cortex:
    image: thehiveproject/cortex:3.1.7
    depends_on:
      - es01
      - es02
      - es03
    ports:
      - "9001:9001"
    environment:
      - job_directory=/opt/cortex/jobs
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./config/application-cluster.conf:/etc/cortex/application.conf:ro
    networks:
      - cortex_network

volumes:
  es01_data:
  es02_data:
  es03_data:

networks:
  cortex_network:
```

Atualizar `application.conf`:

```hocon
search {
  uri = "http://es01:9200,http://es02:9200,http://es03:9200"
  # ... resto da configuração
}
```

### Autenticação LDAP

Para integração com Active Directory:

```hocon
auth {
  providers = [
    {
      name = ldap
      serverName = "ldap-auth"

      host = ["ldap://dc.example.com:389"]
      bindDN = "cn=cortex,ou=services,dc=example,dc=com"
      bindPW = "SENHA_LDAP"
      baseDN = "ou=users,dc=example,dc=com"
      filter = "(objectClass=user)"

      mapping {
        login = "sAMAccountName"
        name = "cn"
        email = "mail"
        groups = "memberOf"
      }
    },
    {
      name = local
      defaultUserDomain = "cortex.local"
    }
  ]
}
```

### Rate Limiting

Configurar limites por analyzer:

```hocon
analyzer {
  config {
    VirusTotal_GetReport_3_0 {
      key = "API_KEY"
      rate_limit {
        max_requests = 4
        per_seconds = 60
      }
    }
  }
}
```

### Docker Network Customizado

Para isolar analyzers:

```yaml
# docker-compose.yml
services:
  cortex:
    networks:
      - cortex_network
      - analyzer_network

networks:
  cortex_network:
    driver: bridge
  analyzer_network:
    driver: bridge
    internal: true  # Sem acesso internet
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## Hardening de Segurança

### 1. Firewall

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow from 10.0.0.0/8 to any port 9001 proto tcp comment 'Cortex API'
sudo ufw enable

# FirewallD (RHEL/Rocky)
sudo firewall-cmd --permanent --add-rich-rule='
  rule family="ipv4"
  source address="10.0.0.0/8"
  port protocol="tcp" port="9001"
  accept'
sudo firewall-cmd --reload
```

### 2. HTTPS com Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/cortex
upstream cortex {
    server 127.0.0.1:9001;
}

server {
    listen 443 ssl http2;
    server_name cortex.example.com;

    ssl_certificate /etc/letsencrypt/live/cortex.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cortex.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    location / {
        proxy_pass http://cortex;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. Limitar Acesso Docker Socket

```yaml
# docker-compose.yml
services:
  cortex:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro  # Read-only
```

Ou usar Docker socket proxy:

```yaml
services:
  docker-proxy:
    image: tecnativa/docker-socket-proxy
    container_name: docker-proxy
    environment:
      - CONTAINERS=1
      - IMAGES=1
      - NETWORKS=1
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - cortex_network

  cortex:
    environment:
      - DOCKER_HOST=tcp://docker-proxy:2375
    # Remover volume docker.sock
```

### 4. Secrets Management

Use Docker secrets para senhas:

```yaml
# docker-compose.yml
services:
  cortex:
    secrets:
      - cortex_secret_key
      - es_password

secrets:
  cortex_secret_key:
    file: ./secrets/cortex_secret.txt
  es_password:
    file: ./secrets/es_password.txt
```

```hocon
# application.conf
play.http.secret.key = ${?CORTEX_SECRET_KEY}

search {
  uri = "http://elasticsearch:9200"
  user = "elastic"
  password = ${?ES_PASSWORD}
}
```

### 5. Backup Automático

Script de backup:

```bash
#!/bin/bash
# /opt/cortex/backup.sh

BACKUP_DIR="/backup/cortex"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup Elasticsearch
docker exec cortex-elasticsearch \
  curl -X PUT "localhost:9200/_snapshot/backup/snapshot_$DATE?wait_for_completion=true"

# Backup configs
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" /opt/cortex/config/

# Manter apenas 7 dias
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Cron job:

```bash
0 2 * * * /opt/cortex/backup.sh >> /var/log/cortex-backup.log 2>&1
```

## Troubleshooting

### Elasticsearch não inicia

**Sintoma:** Container reinicia constantemente

**Soluções:**

```bash
# Verificar logs
docker compose logs elasticsearch

# Se erro "max virtual memory areas vm.max_map_count"
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# Se erro de permissões
sudo chown -R 1000:1000 /opt/cortex/elasticsearch/data

# Se erro de memória
# Reduzir heap size em docker-compose.yml
# ES_JAVA_OPTS=-Xms1g -Xmx1g
```

### Cortex não conecta ao Elasticsearch

**Sintoma:** Cortex mostra "Waiting for Elasticsearch"

**Soluções:**

```bash
# Verificar conectividade
docker exec cortex curl http://elasticsearch:9200/_cluster/health

# Verificar network
docker network inspect cortex_cortex_network

# Aumentar timeout no application.conf
search {
  connectionRequestTimeout = 300000  # 5 minutos
}
```

### Analyzers não executam

**Sintoma:** Jobs ficam em "Waiting" indefinidamente

**Soluções:**

```bash
# Verificar Docker socket
docker exec cortex ls -l /var/run/docker.sock

# Testar pull manual
docker pull cortexneurons/virustotal:3.0

# Verificar logs
docker compose logs cortex | grep -i analyzer

# Aumentar timeout
# application.conf
job.timeout = 30 minutes
```

### Rate Limit Errors

**Sintoma:** Analyzer falha com "Rate limit exceeded"

**Soluções:**

```hocon
# application.conf
analyzer.config {
  VirusTotal_GetReport_3_0 {
    rate_limit {
      max_requests = 4
      per_seconds = 60
    }
  }
}
```

### Disco Cheio

**Sintoma:** Elasticsearch para de responder

**Soluções:**

```bash
# Verificar uso de disco
df -h /opt/cortex/elasticsearch/data

# Limpar índices antigos
curl -X DELETE "http://localhost:9200/cortex_job_*_old"

# Configurar ILM (Index Lifecycle Management)
# Ver documentação Elasticsearch
```

### Performance Ruim

**Sintoma:** Análises demoram muito

**Soluções:**

```hocon
# Aumentar workers paralelos
analyzer {
  fork-join-executor {
    parallelism-min = 4
    parallelism-factor = 3.0
    parallelism-max = 16
  }
}

# Usar SSD/NVMe para Elasticsearch
# Aumentar RAM do Elasticsearch
ES_JAVA_OPTS=-Xms8g -Xmx8g
```

## Verificação de Instalação Completa

Execute estes comandos para validar:

```bash
# Status de todos serviços
docker compose ps

# Health checks
curl http://localhost:9001/api/status
curl http://localhost:9200/_cluster/health

# Listar analyzers habilitados
curl -H "Authorization: Bearer SUA_API_KEY" \
  http://localhost:9001/api/analyzer

# Teste de análise
curl -X POST http://localhost:9001/api/analyzer/FileInfo_8_0/run \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": "test.txt",
    "dataType": "filename",
    "tlp": 2
  }'
```

## Próximos Passos

Após instalação bem-sucedida:

1. **[Configurar Analyzers](analyzers.md)** - Configure analyzers específicos
2. **[Configurar Responders](responders.md)** - Configure resposta automatizada
3. **[Integrar com TheHive](integration-thehive.md)** - Conecte ao TheHive
4. **[Integrar com Stack](integration-stack.md)** - Integre com Wazuh, MISP, etc

## Recursos

- **Documentação Oficial:** https://docs.strangebee.com/cortex/installation/
- **Docker Images:** https://hub.docker.com/u/thehiveproject
- **GitHub:** https://github.com/TheHive-Project/Cortex
- **Community:** https://chat.thehive-project.org
