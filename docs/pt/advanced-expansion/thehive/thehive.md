# TheHive: Plataforma Completa de Incident Response para SOC

## 1. Introdução ao TheHive

### 1.1 O que é TheHive

O **TheHive** é uma plataforma open-source de resposta a incidentes (Incident Response) projetada para centros de operações de segurança (SOC). Desenvolvida pela **TheHive Project**, em parceria com o **Cortex**, oferece uma solução completa para gestão, análise e colaboração em investigações de segurança.

O TheHive permite que analistas de segurança:
- Criem casos (cases) para documentar incidentes
- Gerenciem alertas e evidências
- Colaborem em equipes durante investigações
- Executem análises automatizadas
- Gerem relatórios profissionais
- Integrem com múltiplas fontes de dados

### 1.2 Para que serve

O TheHive serve como um **hub centralizado** para todas as atividades relacionadas à resposta a incidentes, permitindo:

**Gestão de Incidentes:**
- Criação e acompanhamento de casos de segurança
- Classificação por severidade, tipo e status
- Tracking de timeline de eventos
- Documentação detalhada de evidências

**Colaboração:**
- Atribuição de tarefas entre analistas
- Comentários e anotações em tempo real
- Assignação de casos por especialidade
- WorkFlow colaborativo estruturado

**Análise Automatizada:**
- Integração com Cortex para análise automatizada
- Playbooks personalizáveis
- Execução de enriquecimento de dados
- Automação de tarefas repetitivas

**Auditoria e Compliance:**
- Log completo de todas as ações
- Histórico de alterações em casos
- Exportação para relatórios
- Satisfação de requisitos de auditoria

### 1.3 Casos de Uso

**1. Investigação de Phishing**
```
Um alerta de phishing é recebido do email gateway:
1. TheHive recebe o alerta via webhook ou API
2. Um caso é automaticamente criado com o cabeçalho do email
3. O Cortex analisa o link malicioso e o IP de origem
4. Os analistas adicionam evidências e comentários
5. O caso é encerrado com recomendações de mitigação
```

**2. Detecção de Malware**
```
Alerta de SIEM detecta possível malware:
1. Evento do Wazuh/SIEM é convertido em alerta no TheHive
2. Arquivo suspect é analisado automaticamente pelo Cortex
3. Hash do malware é verificado em threat intelligence
4. Escopo de infecção é determinado
5. Resposta é coordenada e documentada
```

**3. Incidente de Data Breach**
```
Suspeita de vazamento de dados:
1. Caso crítico é criado no TheHive
2. Equipe de resposta é notificada automaticamente
3. Evidências digitais são coletadas e analisadas
4. Timeline do incidente é reconstruída
5. Relatório final é gerado para compliance
```

### 1.4 Benefícios

**Para o SOC:**
- Centralização de todas as atividades de IR
- Melhoria na produtividade dos analistas
- Redução do tempo médio de resposta (MTTR)
- Padronização de processos de investigação

**Para a Organização:**
- Redução de custos operacionais
- Melhoria na detecção e resposta
- Conformidade com regulamentações
- Aprimoramento contínuio da postura de segurança

**Para Analistas:**
- Interface intuitiva e user-friendly
- Colaboração eficiente em equipe
- Acesso rápido a informações relevantes
- Automação de tarefas manuais

## 2. Arquitetura e Integração

### 2.1 Como se integra na stack NeoAnd

Na stack **NeoAnd**, o TheHive atua como o **brain center** do sistema de segurança, integrando-se com:

```
┌─────────────────────────────────────────────────────────────┐
│                     Stack NeoAnd - SOC                     │
├─────────────────────────────────────────────────────────────┤
│  NetBox (CMDB)  │  Odoo (ITSM)  │  Wazuh (SIEM/XDR)       │
│                 │               │                         │
│  - Inventário   │  - Tickets    │  - Logs                 │
│  - Topologia    │  - SLA        │  - Alertas              │
│  - IPs          │  - Change Mgmt│  - Compliance           │
└─────────────────┴───────────────┴─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  TheHive (Incident Response Platform)                      │
│  - Casos de segurança                                      │
│  - Colaboração                                             │
│  - Investigações                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Cortex (SOAR) │   │  MISP (TI)    │
│               │   │               │
│ - Análises    │   │ - Indicators  │
│ - Automação   │   │ - Threat Intel│
│ - Playbooks   │   │ - Sharing     │
└───────────────┘   └───────────────┘
```

**Integração com NeoAnd Stack:**

1. **NetBox** → TheHive
   - Sincronização de ativos da rede
   - Enriquecimento de casos com informações de rede
   - Mapeamento de topologia de ataque

2. **Wazuh** → TheHive
   - Webhooks enviam alertas automaticamente
   - Criação de casos a partir de detecções
   - Enriquecimento com logs e eventos

3. **Odoo** → TheHive
   - Criação de tickets de problemas
   - Sincronização de SLAs
   - Gestão de mudanças relacionadas

### 2.2 Arquitetura Técnica

O TheHive possui uma arquitetura modular e escalável:

**Componentes Principais:**

1. **TheHive Core Application**
   - Backend: Scala/Play Framework
   - Frontend: TypeScript/Angular
   - Database: Elasticsearch
   - Cache: Redis

2. **Cortex (Analyzer Engine)**
   - Micro-serviços para análise
   - Workers para execução
   - Suporte a múltiplos analyzers
   - API REST para integração

3. **MISP (Threat Intelligence)**
   - Sistema de threat sharing
   - Base de indicadores de comprometimento (IOCs)
   - Integração via API

**Diagrama de Arquitetura:**

```
┌─────────────────────────────────────────────────────────────┐
│                   THE HIVE ECOSYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Analysts   │      │   Web UI     │                   │
│  │ (Analistas)  │◄────►│ (Interface)  │                   │
│  └──────────────┘      └──────┬───────┘                   │
│                                │                            │
│                         ┌──────▼───────┐                   │
│                         │ TheHive Core │                   │
│                         │   (Scala)    │                   │
│                         └──────┬───────┘                   │
│                                │                            │
│  ┌──────────────┐      ┌──────▼───────┐  ┌─────────────┐  │
│  │  Cortex      │◄────►│ Elasticsearch │  │    MISP     │  │
│  │ (Analyzers)  │      │   (Database)  │  │ (Threat Intel)│ │
│  └──────────────┘      └──────┬───────┘  └─────────────┘  │
│                                │                            │
│                         ┌──────▼───────┐                   │
│                         │    Redis     │                   │
│                         │    (Cache)   │                   │
│                         └──────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Relação com Cortex e MISP

**TheHive + Cortex (SOAR):**

O Cortex é o motor de análise automatizada do TheHive. Principais características:

- **Analyzers**: Programas que analisam artefatos (IPs, domínios, hashes, emails, URLs)
- **Responders**: Scripts que executam ações automáticas (bloquear IP, desabilitar usuário, etc.)
- **Playbooks**: Sequências de análises automatizadas

Exemplo de Playbook:
```yaml
Playbook: Análise de Email Phishing
1. Verificar reputação do domínio (VirusTotal)
2. Analisar URL maliciosa (URLhaus)
3. Extrair e verificar anexos
4. Consultar IP de origem (AbuseIPDB)
5. Verificar se domínio está em MISP
6. Executar análise de hash de anexos (MalwareBazaar)
7. Gerar relatório automatizado
```

**TheHive + MISP (Threat Intelligence):**

MISP fornece threat intelligence para enriquecer análises:

- **Indicators**: IOCs (IP, domínios, hashes, URLs)
- **Threat Attributes**: Atributos relacionados a ameaças
- **Galaxy Clusters**: Agrupamentos de inteligência
- **Sharing Groups**: Grupos para compartilhamento

Exemplo de uso:
```python
# TheHive consulta MISP para verificar IOCs
ioc = "malicious-domain.com"
misp_event = misp_controller.search(ioc)

if misp_event:
    # IOC encontrado - adicionar ao caso
    case.add_artifact(ioc, source="MISP")
    case.add_tag("known-malicious")
```

## 3. Instalação e Configuração

### 3.1 Requisitos do Sistema

**Requisitos Mínimos:**

- **CPU**: 2 cores
- **RAM**: 4GB
- **Disco**: 20GB SSD
- **SO**: Ubuntu 20.04+ / Debian 10+ / CentOS 8+

**Requisitos Recomendados (Produção):**

- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Disco**: 100GB+ SSD
- **SO**: Ubuntu 22.04 LTS

**Componentes Necessários:**

1. **TheHive Application**
   - Java 11 ou superior
   - Docker & Docker Compose (recomendado)

2. **Elasticsearch**
   - Versão 7.x (TheHive 4.x)
   - Java 11+
   - Mínimo 2GB RAM alocados

3. **Cortex (Opcional, mas recomendado)**
   - Java 11+
   - Workers para análise

4. **MISP (Opcional)**
   - Para threat intelligence
   - MariaDB/MySQL
   - PHP 7.4+

### 3.2 Processo de Instalação Detalhado

**Método 1: Instalação com Docker (Recomendado)**

```bash
# 1. Instalar Docker e Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose

# 2. Criar estruturasudo mkdir -p de diretórios
 /opt/thehive/{data,logs,elasticsearch,cortex}
sudo chown -R 1000:1000 /opt/thehive/elasticsearch

# 3. Criar docker-compose.yml
cat > /opt/thehive/docker-compose.yml << 'EOF'
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.9
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms2g -Xmx2g
      - xpack.security.enabled=false
    volumes:
      - ./elasticsearch:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - thehivenet

  cortex:
    image: thehiveproject/cortex:3.1.0
    environment:
      - cortex.cassandra.cluster.nodes=cassandra
    depends_on:
      - cassandra
    ports:
      - "9001:9001"
    networks:
      - thehivenet

  cassandra:
    image: cassandra:3.11.14
    environment:
      - MAX_HEAP_SIZE=1G
      - HEAP_NEWSIZE=256M
    volumes:
      - ./cortex:/var/lib/cassandra
    networks:
      - thehivenet

  thehive:
    image: thehiveproject/thehive:4.1.7
    depends_on:
      - elasticsearch
      - cortex
    environment:
      - PLAY_SECURE_SECRET=changeme-very-long-secret
      - PLAY_HTTP_SECRET_KEY=changeme-very-long-secret
      - PLAY_SESSION_SECRET=changeme-very-long-secret
      - THEHIVE_CLUSTER_NODES=elasticsearch:9300
      - CORTEX_URL=http://cortex:9000
    ports:
      - "9000:9000"
    volumes:
      - ./data:/opt/thehive/data
      - ./logs:/opt/thehive/logs
    networks:
      - thehivenet

networks:
  thehivenet:
    driver: bridge
EOF

# 4. Iniciar serviços
cd /opt/thehive
docker-compose up -d

# 5. Verificar status
docker-compose ps
```

**Método 2: Instalação Manual (Ubuntu)**

```bash
# 1. Instalar Java 11
sudo apt update
sudo apt install -y openjdk-11-jdk

# 2. Instalar Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update
sudo apt install -y elasticsearch

# 3. Configurar Elasticsearch
sudo tee /etc/elasticsearch/elasticsearch.yml > /dev/null << 'EOF'
cluster.name: thehive
network.host: 127.0.0.1
http.port: 9200
discovery.type: single-node
EOF

sudo systemctl enable elasticsearch
sudo

# 4 systemctl start elasticsearch. Baixar e instalar TheHive
cd /tmp
wget https://github.com/TheHive-Project/TheHive/releases/download/4.1.7/thehive-4.1.7.zip
unzip thehive-4.1.7.zip
sudo mv thehive-4.1.7 /opt/thehive

# 5. Configurar TheHive
sudo tee /opt/thehive/conf/application.conf > /dev/null << 'EOF'
# Database
db {
  default {
    driverClass = org.postgresql.Driver
    url = "jdbc:postgresql://localhost:5432/thehive"
    user = thehive
    password = thehivepassword
    poolInitialSize = 5
    poolMaxSize = 20
  }
}

# Elasticsearch
elasticSearch {
  # Configuration options
}

# Cortex
cortex {
  # URL do Cortex
}

# Play Framework
play {
  http.secret.key = "changeme-very-long-secret"
}
EOF

# 6. Criar usuário do sistema
sudo useradd -r -s /bin/bash thehive
sudo chown -R thehive:thehive /opt/thehive

# 7. Criar serviço systemd
sudo tee /etc/systemd/system/thehive.service > /dev/null << 'EOF'
[Unit]
Description=TheHive
After=network.target elasticsearch.service

[Service]
Type=play
User=thehive
Group=thehive
ExecStart=/opt/thehive/bin/thehive
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable thehive
sudo systemctl start thehive
```

### 3.3 Configuração Inicial

**Primeiro Acesso:**

1. **Abrir Interface Web**
   - URL: `http://localhost:9000`
   - Usuário padrão: `admin@thehive.local`
   - Senha: `secret`

2. **Alterar Senha Padrão**
   ```bash
   # Login via API (primeira configuração)
   curl -X POST "http://localhost:9000/api/user/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin@thehive.local","password":"secret"}'

   # Alterar senha via interface
   # Navegar para: Admin > Users > admin@thehive.local > Change Password
   ```

3. **Configurar Organizacao**
   ```yaml
   Organization Config:
   - Name: "Sua Empresa"
   - Description: "SOC da Empresa"
   - Slug: "empresa-soc"
   - Header: "Logo da Empresa"
   ```

**Configuração Básica:**

```bash
# Arquivo: /opt/thehive/conf/application.conf

# 1. Configuração de Segurança
play {
  http.secret.key = "CHANGE-THIS-SECRET-32-CHARS-MIN"
  session.maxAge = 604800  # 7 dias
}

# 2. Configuração do Elasticsearch
elasticSearch {
  index = "thehive"
  cluster = "thehive"
  nodes = ["127.0.0.1:9300"]
}

# 3. Configuração do Cortex
cortex {
  # URL do Cortex
  url = "http://localhost:9000"
  # Timeout para jobs
  jobTimeout = 300
  # Retry attempts
  maxRetryOnError = 3
}

# 4. Configuração de Email
mail {
  smtp {
    host = "smtp.empresa.com"
    port = 587
    username = "thehive@empresa.com"
    password = "senha"
    tls = true
  }
}
```

### 3.4 Configuração com Docker

**docker-compose.yml Completo:**

```yaml
version: '3.8'

services:
  # Elasticsearch
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.9
    container_name: thehive-elasticsearch
    environment:
      - node.name=es01
      - cluster.name=thehive-cluster
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - ES_JAVA_OPTS=-Xms4g -Xmx4g
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - thehive-network
    restart: unless-stopped

  # PostgreSQL (Opcional, para dados estruturados)
  postgres:
    image: postgres:13
    container_name: thehive-postgres
    environment:
      - POSTGRES_DB=thehive
      - POSTGRES_USER=thehive
      - POSTGRES_PASSWORD=securepassword
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - thehive-network
    restart: unless-stopped

  # Cortex
  cortex:
    image: thehiveproject/cortex:3.1.0
    container_name: thehive-cortex
    environment:
      - cortex.cassandra.cluster.nodes=cassandra
      - cortex.cassandra.keyspace=cortex
    depends_on:
      - cassandra
    ports:
      - "9001:9001"
    networks:
      - thehive-network
    restart: unless-stopped

  # Cassandra (Para Cortex)
  cassandra:
    image: cassandra:3.11.14
    container_name: thehive-cassandra
    environment:
      - MAX_HEAP_SIZE=2G
      - HEAP_NEWSIZE=512M
    volumes:
      - cassandra-data:/var/lib/cassandra/data
    networks:
      - thehive-network
    restart: unless-stopped

  # TheHive
  thehive:
    image: thehiveproject/thehive:4.1.7
    container_name: thehive-app
    depends_on:
      - elasticsearch
    environment:
      - THEHIVE_CLUSTER_NODES=elasticsearch:9300
      - CORTEX_URL=http://cortex:9000
      - PLAY_SECURE_SECRET=$(openssl rand -base64 32)
      - PLAY_HTTP_SECRET_KEY=$(openssl rand -base64 32)
      - PLAY_SESSION_SECRET=$(openssl rand -base64 32)
    ports:
      - "9000:9000"
    volumes:
      - thehive-data:/opt/thehive/data
      - thehive-logs:/opt/thehive/logs
    networks:
      - thehive-network
    restart: unless-stopped

  # Nginx (Reverse Proxy)
  nginx:
    image: nginx:alpine
    container_name: thehive-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - thehive
      - cortex
    networks:
      - thehive-network
    restart: unless-stopped

volumes:
  elasticsearch-data:
    driver: local
  postgres-data:
    driver: local
  cassandra-data:
    driver: local
  thehive-data:
    driver: local
  thehive-logs:
    driver: local

networks:
  thehive-network:
    driver: bridge
```

**Nginx Reverse Proxy Config:**

```nginx
# /etc/nginx/conf.d/thehive.conf

upstream thehive_backend {
    server thehive:9000;
}

upstream cortex_backend {
    server cortex:9000;
}

server {
    listen 80;
    server_name thehive.empresa.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name thehive.empresa.com;

    ssl_certificate /etc/nginx/ssl/thehive.crt;
    ssl_certificate_key /etc/nginx/ssl/thehive.key;

    # Proxy para TheHive
    location / {
        proxy_pass http://thehive_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy para Cortex
    location /cortex/ {
        proxy_pass http://cortex_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 4. Configuração Avançada

### 4.1 Configuração do TheHive

**application.conf Detalhado:**

```hocon
# =====================================================
# CONFIGURAÇÃO AVANÇADA DO THEHIVE
# =====================================================

# 1. Configuração do Play Framework
play {
  # Chave secreta (OBRIGATÓRIO: 32+ caracteres)
  http.secret.key = "sua-chave-secreta-32-caracteres-minimo-1234567890"
  session.maxAge = 604800  # 7 dias em segundos

  # Configurações de HTTP
  http {
    client = "thehive"
    port = 9000
    address = "0.0.0.0"
  }

  # Configurações de i18n
  i18n.langs = ["en", "fr", "es", "pt"]
  i18n.defaultLang = "pt"
}

# 2. Configuração do Logger
play.logger.rootLevel = INFO
play.logger.level = DEBUG

# 3. Configuração do Akka
akka {
  loglevel = "INFO"
  stdout-loglevel = "INFO"

  # Configurações de atores
  actor {
    default-dispatcher {
      type = Dispatcher
      executor = "fork-join-executor"
      fork-join-executor {
        parallelism-min = 8
        parallelism-factor = 2.0
        parallelism-max = 8
      }
    }
  }
}

# 4. Configuração do Database (Elasticsearch)
db {
  default {
    # Configurações de pool
    poolInitialSize = 5
    poolMaxSize = 20
    poolConnectionTimeoutMillis = 1000
    poolConnectionValidationQuery = "SELECT 1"
    poolAutoCommit = true
    poolKeepAliveConnection = true

    # Configurações de HikariCP
    hikariCP {
      maximumPoolSize = 20
      minimumIdle = 5
      idleTimeout = 600000
      connectionTimeout = 30000
      validationTimeout = 5000
      leakDetectionThreshold = 60000
    }
  }
}

# 5. Configuração do Elasticsearch
elasticSearch {
  # Nome do cluster
  cluster = "thehive-cluster"

  # Nome do índice
  index = "thehive"

  # Lista de nós (Formato: host:port:schema)
  nodes = [
    "127.0.0.1:9300:http"
  ]

  # Configurações de índice
  index.number_of_shards = 1
  index.number_of_replicas = 0
  index.refresh_interval = 30s

  # Configurações de mapeamento
  mapping {
    # Limites de campos
    total_fields.limit = 2000
    depth.limit = 10
    nested_fields.limit = 50
    nested_objects.limit = 10000

    # Limites de string
    ignore_malformed = true
    coerce = true
  }

  # Configurações de busca
  search {
    # Timeout para buscas
    timeout = 30s

    # Número de resultados por página
    page.size = 50

    # Número máximo de resultados
    max.result.window = 100000
  }

  # Configurações de backup
  snapshot {
    enabled = true
    repository = "thehive-backups"
    schedule = "0 0 * * *"  # Daily at midnight
  }
}

# 6. Configuração do Cortex
cortex {
  # URL do Cortex
  url = "http://localhost:9000"

  # Timeout para jobs (em segundos)
  jobTimeout = 300

  # Número máximo de tentativas
  maxRetryOnError = 3

  # Intervalo de polling (em segundos)
  jobPollingInterval = 5

  # Bulk size para análise
  bulkSize = 50

  # Tabela de servidores
  servers = [
    {
      name = "local"
      url = "http://localhost:9000"
      # Token de autenticação (se configurado)
      # http://<user>:<password>@<host>:<port>
    }
  ]
}

# 7. Configuração de Storage
storage {
  # Localização do armazenamento
  path = "/opt/thehive/data"

  # Tamanho máximo de arquivo (em bytes)
  # 100MB = 104857600 bytes
  maxAttachmentSize = 104857600

  # Chunk size para upload (em bytes)
  chunkSize = 1048576  # 1MB

  # Adapters
  adapters {
    # Adapter para sistema de arquivos local
    local {
      enabled = true
      path = "/opt/thehive/data/attachments"
    }

    # Adapter para S3 (opcional)
    s3 {
      enabled = false
      bucket = "thehive-attachments"
      region = "us-east-1"
      accessKey = ""
      secretKey = ""
      # SSE-KMS encryption
      kmsKeyId = ""
    }
  }
}

# 8. Configuração de Email
mail {
  enabled = true

  smtp {
    host = "smtp.empresa.com"
    port = 587
    username = "thehive@empresa.com"
    password = "senha-super-secreta"

    # TLS/SSL
    tls = true
    ssl = false

    # Timeout
    connectionTimeout = 5000
    timeout = 10000

    # Segurança adicional
    security = "starttls"
  }

  # Templates de email
  templates {
    caseCreated {
      subject = "[TheHive] Novo caso criado: {{ case.title }}"
      body = """
        <h2>Novo Caso Criado</h2>
        <p><strong>Título:</strong> {{ case.title }}</p>
        <p><strong>ID:</strong> {{ case.id }}</p>
        <p><strong>Severidade:</strong> {{ case.severity }}</p>
        <p><strong>Criado por:</strong> {{ case.createdBy }}</p>
        <p><a href="{{ baseUrl }}/case/{{ case.id }}">Ver caso</a></p>
      """
    }

    caseAssigned {
      subject = "[TheHive] Caso atribuído: {{ case.title }}"
      body = """
        <h2>Caso Atribuído</h2>
        <p>O caso <strong>{{ case.title }}</strong> foi atribuído a você.</p>
        <p><a href="{{ baseUrl }}/case/{{ case.id }}">Ver caso</a></p>
      """
    }
  }
}

# 9. Configuração de Cache
cache {
  # Provider
  defaultCache = "redis"

  # Configuração do Redis
  redis {
    host = "127.0.0.1"
    port = 6379
    database = 0
    timeout = 2000

    # Cluster Redis (se aplicável)
    # nodes = ["redis1:6379", "redis2:6379"]
  }

  # TTL padrão (em segundos)
  defaultTTL = 3600
}

# 10. Configuração de Stream (para WebSockets)
stream {
  # Buffer size
  bufferSize = 32

  # Max connections
  maxConnections = 1000

  # Ping interval
  pingInterval = 30
}
```

### 4.2 Integração com Elasticsearch

**Configuração Detalhada do Elasticsearch:**

```yaml
# elasticsearch.yml

# Cluster e nó
cluster.name: thehive-cluster
node.name: thehive-es-node-1

# Paths
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# Network
network.host: 0.0.0.0
http.port: 9200
transport.tcp.port: 9300

# Discovery
discovery.type: single-node

# Memory
bootstrap.memory_lock: true

# Configurações de performance
indices.memory.index_buffer_size: 30%
indices.queries.cache.size: 10%
indices.fielddata.cache.size: 20%

# Configurações de índices
index.number_of_shards: 1
index.number_of_replicas: 0
index.refresh_interval: 30s
index.max_result_window: 100000
index.mapping.total_fields.limit: 2000

# Configurações de thread pool
thread_pool.write.queue_size: 1000
thread_pool.search.queue_size: 1000

# Configurações de GC
-XX:MaxGCPauseMillis=200
-XX:+UseConcMarkSweepGC
-XX:+UseParNewGC

# JVM Options
-Xms4g
-Xmx4g
```

**Ajustes de Performance para Elasticsearch:**

```bash
# 1. Configurar limites do sistema
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 2. Limites do usuário
echo 'elasticsearch - nofile 65535' | sudo tee -a /etc/security/limits.conf

# 3. Verificar configuração
curl -X GET "localhost:9200/_cluster/settings?include_defaults=true"
```

**Monitoramento do Elasticsearch:**

```bash
# Health check
curl -X GET "localhost:9200/_cluster/health?pretty"

# Status dos nós
curl -X GET "localhost:9200/_nodes/stats?pretty"

# Informações dos índices
curl -X GET "localhost:9200/_cat/indices?v&s=index"

# Estatísticas de busca
curl -X GET "localhost:9200/_search/stats?pretty"
```

### 4.3 Configuração de Templates de Casos

**Criar Template de Caso:**

Via API REST:

```bash
curl -X POST "http://localhost:9000/api/case/_search" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "_name": "Create Case Template"
    },
    "pipeline": [
      {
        "_name": "Create Case",
        "title": "Investigação de Phishing",
        "description": "Template para casos de phishing",
        "severity": 2,
        "tags": ["phishing", "email", "social-engineering"],
        "customFields": [
          {
            "name": "phishing_target",
            "value": "TBD"
          },
          {
            "name": "email_subject",
            "value": ""
          }
        ]
      }
    ]
  }'
```

Via Interface Web:

1. **Criar Template**:
   - Admin → Case Templates → New Template
   - Preencher campos:
     ```
     Nome: Investigação de Phishing
     Título: Phishing - {{ email_subject }}
     Descrição: Template para casos de phishing
     Severidade: 2 (Medium)
     Tags: phishing, email, security-awareness
     ```

2. **Configurar Custom Fields**:
   ```yaml
   Custom Fields:
     - phishing_target:
         type: string
         required: true
         description: "Email ou pessoa alvo do phishing"

     - email_subject:
         type: string
         required: true
         description: "Assunto do email malicioso"

     - email_sender:
         type: string
         description: "Remetente do email"

     - attack_vector:
         type: enum
         values: ["attachment", "link", "credential-harvesting"]
         default: "link"
   ```

3. **Configurar Tasks Padrão**:
   ```
   Tasks:
     1. Análise Inicial
        - Assignee: @analyst
        - Due: +24h
        - Description: Análise inicial do email

     2. Coleta de Evidências
        - Assignee: @analyst
        - Due: +48h
        - Description: Coletar cabeçalho completo, anexos

     3. Análise Técnica
        - Assignee: @forensics
        - Due: +72h
        - Description: Análise técnica do payload

     4. Resposta
        - Assignee: @security-lead
        - Due: +96h
        - Description: Executar ações de resposta
   ```

### 4.4 Configuração de Usuários e Permissões

**Roles Padrão:**

1. **admin** - Administrador (full access)
2. **org-admin** - Admin da organização
3. **analyst** - Analista (create/manage cases)
4. **observer** - Observador (read-only)

**Criar Usuário:**

```bash
# Via API
curl -X POST "http://localhost:9000/api/user" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "analista@empresa.com",
    "name": "João Silva",
    "roles": ["analyst"],
    "permissions": [
      "case:create",
      "case:read",
      "case:update"
    ],
    "organization": "Empresa SOC"
  }'
```

**Configurar Permissões Granulares:**

```json
{
  "users": [
    {
      "login": "senior-analyst@empresa.com",
      "name": "Maria Santos",
      "roles": ["analyst"],
      "permissions": {
        "case": {
          "create": true,
          "read": ["*"],
          "update": ["*"],
          "delete": true
        },
        "task": {
          "create": true,
          "assign": true,
          "complete": true
        },
        "log": {
          "create": true
        },
        "observable": {
          "create": true,
          "read": ["*"],
          "bulk": true
        },
        "cortex": {
          "job": {
            "create": true,
            "read": ["*"],
            "delete": ["own"]
          }
        }
      },
      "shares": ["SOC-Team"],
      "timezone": "America/Sao_Paulo",
      "language": "pt"
    }
  ]
}
```

**Configurar Organizações/Teams:**

```bash
# Criar organização
curl -X POST "http://localhost:9000/api/organisation" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SOC Equipe 1",
    "description": "Primeira equipe do SOC",
    "shares": ["Security", "IR"]
  }'

# Criar sharing group
curl -X POST "http://localhost:9000/api/share-group" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security Team",
    "description": "Equipe de segurança",
    "organisation": "SOC Equipe 1",
    "shares": [
      {
        "resourceType": "case",
        "canRead": true,
        "canWrite": true
      },
      {
        "resourceType": "observable",
        "canRead": true,
        "canWrite": false
      }
    ]
  }'
```

## 5. Casos de Uso Práticos

### 5.1 Workflow de Incident Response

**Estágios do Incident Response:**

```
┌─────────────┐
│   DETECT    │  ← Detecção via SIEM, Wazuh, MISP
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ANALYZE   │  ← Análise inicial do incidente
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CONTAIN    │  ← Contenção do incidente
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  ERADICATE  │  ← Erradicação da ameaça
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  RECOVER    │  ← Recuperação do ambiente
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ LEARN/REVIEW│  ← Lições aprendidas
└─────────────┘
```

**Exemplo Prático: Incidente de Malware**

```yaml
# Caso: Detecção de Ransomware em Endpoint

Case ID: CASE-2024-0001
Title: "Detecção de Ransomware - HOST-01"
Severity: 4 (High)
Status: "Open"
Assignee: "analista-soc"

Tasks:
  1. Análise Inicial
     - Verificar alertas do SIEM
     - Identificar arquivo malicioso
     - Timeline: 2024-01-15 09:23:15

  2. Coleta de Evidências
     - Download do arquivo malicioso
     - Preservação de logs
     - Captura de memória (se necessário)

  3. Análise Técnica
     - Hash do arquivo: a1b2c3d4e5f6...
     - Análise automatizada via Cortex
     - IOC Extraction

  4. Containment
     - Isolar HOST-01 da rede
     - Bloquear domínios de C2
     - Bloquear hashes em EDR

  5. Eradicação
     - Remover malware
     - Limpar chaves de registro
     - Patch de vulnerabilidade

  6. Recovery
     - Restaurar de backup
     - Verificar integridade
     - Monitoramento intensivo

  7. Lessons Learned
     - Relatório post-mortem
     - Atualização de regras SIEM
     - Treinamento de usuário
```

**Automatizando o Workflow com Playbooks:**

```json
{
  "playbook_name": "Malware Response - Automated Triage",
  "description": "Playbook automatizado para resposta a malware",

  "steps": [
    {
      "step": 1,
      "action": "collect_evidence",
      "automation": {
        "cortex_analyzers": [
          "VirusTotal_GetReport",
          "MalwareBazaar_GetReport"
        ],
        "tasks": [
          "Download suspicious file",
          "Extract file metadata",
          "Calculate file hash"
        ]
      }
    },
    {
      "step": 2,
      "action": "enrich_iocs",
      "automation": {
        "misp_lookup": true,
        "threat_intel": [
          "AbuseIPDB",
          "ThreatCrowd",
          "OTX"
        ]
      }
    },
    {
      "step": 3,
      "action": "containment",
      "automation": {
        "responders": [
          "BlockHash-EDR",
          "BlockIP-Firewall"
        ],
        "tasks": [
          "Isolate endpoint",
          "Disable user account",
          "Block network indicators"
        ]
      }
    },
    {
      "step": 4,
      "action": "notification",
      "automation": {
        "email": {
          "to": ["security-team@empresa.com"],
          "template": "malware_alert"
        },
        "slack": {
          "channel": "#security-alerts",
          "message": "Malware detected and contained"
        }
      }
    }
  ]
}
```

### 5.2 Gerenciamento de Alertas

**Integração com Wazuh para Alertas:**

```bash
# Configurar webhook no Wazuh
# Arquivo: /var/ossec/etc/ossec.conf

<ossec_config>
  <integration>
    <name>thehive</name>
    <hook_url>http://thehive.empresa.com/api/alert</hook_url>
    <level>10</level>
    <rule_id>100200,100201,100202</rule_id>
    <api_token>seu-token-thehive</api_token>
    <timeout>10</timeout>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

**Script de Integração Personalizado:**

```python
#!/3
"""
Scriptusr/bin/env python para envio de alertas do Wazuh para TheHive
"""

import json
import requests
import os
from datetime import datetime

THEHIVE_URL = "http://thehive.empresa.com"
THEHIVE_TOKEN = os.environ.get("THEHIVE_API_TOKEN")
WAZUH_ALERT_FILE = "/var/ossec/logs/alerts/alerts.json"

def parse_wazuh_alert(alert):
    """Converte alerta do Wazuh para formato TheHive"""
    return {
        "title": f"Security Alert - {alert.get('rule', {}).get('description', 'Unknown')}",
        "description": json.dumps(alert, indent=2),
        "severity": map_wazuh_severity_to_thehive(alert.get('rule', {}).get('level', 0)),
        "tags": ["wazuh", alert.get('rule', {}).get('group', 'general')],
        "tlp": 2,  # AMBER
        " PAP": 2,  # AMBER
        "source": "wazuh",
        "caseTemplate": "Default",
        "observables": extract_observables(alert)
    }

def map_wazuh_severity_to_thehive(level):
    """Mapeia severidade do Wazuh para TheHive"""
    mapping = {
        (0, 3): 1,  # Low
        (4, 6): 2,  # Medium
        (7, 9): 3,  # High
        (10, 15): 4  # Critical
    }
    for (min_val, max_val), severity in mapping.items():
        if min_val <= level <= max_val:
            return severity
    return 1

def extract_observables(alert):
    """Extrai IOCs do alerta"""
    observables = []

    # IP de origem
    if 'srcip' in alert.get('data', {}):
        observables.append({
            "dataType": "ip",
            "data": alert['data']['srcip'],
            "message": "Source IP",
            "tlp": 2,
            "pap": 2
        })

    # IP de destino
    if 'dstip' in alert.get('data', {}):
        observables.append({
            "dataType": "ip",
            "data": alert['data']['dstip'],
            "message": "Destination IP",
            "tlp": 2,
            "pap": 2
        })

    # Domínio
    if 'hostname' in alert.get('data', {}):
        observables.append({
            "dataType": "domain",
            "data": alert['data']['hostname'],
            "message": "Hostname",
            "tlp": 2,
            "pap": 2
        })

    return observables

def send_alert_to_thehive(case_data):
    """Envia alerta para o TheHive"""
    headers = {
        "Authorization": f"Bearer {THEHIVE_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/case",
        headers=headers,
        json=case_data
    )

    if response.status_code == 201:
        print(f"[SUCCESS] Case created: {response.json()['id']}")
        return response.json()
    else:
        print(f"[ERROR] Failed to create case: {response.text}")
        return None

def main():
    """Processa alertas do Wazuh"""
    try:
        with open(WAZUH_ALERT_FILE, 'r') as f:
            alerts = json.load(f)

        for alert in alerts:
            if 'Rule' in alert:
                case_data = parse_wazuh_alert(alert)
                send_alert_to_thehive(case_data)

    except Exception as e:
        print(f"[ERROR] {str(e)}")

if __name__ == "__main__":
    main()
```

### 5.3 Colaboração em Equipes

**Atribuição Automática de Casos:**

```python
#!/usr/bin/env python3
"""
Script para atribuição automática de casos baseada em carga de trabalho
"""

import requests
import json

THEHIVE_URL = "http://thehive.empresa.com/api"

def get_team_workload(team_id):
    """Obtém carga de trabalho da equipe"""
    headers = {"Authorization": "Bearer <TOKEN>"}

    response = requests.get(
        f"{THEHIVE_URL}/user/_stats",
        headers=headers
    )

    if response.status_code == 200:
        return response.json()
    return {}

def assign_case_to_least_busy_analyst(case_id):
    """Atribui caso ao analista menos ocupado"""
    team_workload = get_team_workload()

    # Ordenar analistas por número de casos ativos
    sorted_analysts = sorted(
        team_workload.items(),
        key=lambda x: x[1]['active_cases']
    )

    least_busy_analyst = sorted_analysts[0][0]

    # Atribuir caso
    headers = {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

    data = {
        "assignee": least_busy_analyst
    }

    response = requests.patch(
        f"{THEHIVE_URL}/case/{case_id}",
        headers=headers,
        json=data
    )

    return response.status_code == 200

# Cron job para execução automática
# 0 */6 * * * /usr/local/bin/auto-assign-cases.py
```

**Templates de Comentário:**

```yaml
Comment Templates:
  - name: "Initial Triage"
    template: |
      ## Análise Inicial
      - Alerta recebido: {timestamp}
      - Severidade: {severity}
      - Sistema afetado: {asset}
      - Status: Em investigação

  - name: "Containment Actions"
    template: |
      ## Ações de Contenção
      - Endpoint isolado da rede: ✅
      - Conta de usuário bloqueada: ✅
      - Hash do malware bloqueado: ✅
      - IP de C2 bloqueado no firewall: ✅

  - name: "Evidence Collection"
    template: |
      ## Coleta de Evidências
      - Artefatos coletados:
        * {file_path_1}
        * {file_path_2}
      - Logs preservados:
        * {log_source_1}
        * {log_source_2}
      - Chain of custody: Mantida

  - name: "Eradication"
    template: |
      ## Erradicação
      - Malware removido: ✅
      - Vulnerabilidade corrigida: ✅
      - Chaves de registro limpas: ✅
      - Restore point criado: ✅

  - name: "Recovery"
    template: |
      ## Recuperação
      - Sistema restaurado de backup: ✅
      - Monitoramento intensivo ativo: ✅
      - Validação de integridade: ✅
      - Sistema liberado para produção: {timestamp}

  - name: "Lessons Learned"
    template: |
      ## Lições Aprendidas
      ### O que funcionou bem:
      - {success_item_1}
      - {success_item_2}

      ### O que precisa melhorar:
      - {improvement_item_1}
      - {improvement_item_2}

      ### Ações de follow-up:
      - [ ] {action_1} - Due: {date}
      - [ ] {action_2} - Due: {date}

      ### Atualizações necessárias:
      - Regras SIEM: {rule_updates}
      - Procedimentos: {procedure_updates}
```

**Configuração de Notificações:**

```bash
# Webhook para Slack
curl -X POST "http://localhost:9000/api/notification/webhook" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Slack - Security Alerts",
    "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "type": "slack",
    "httpMethod": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonTemplate": {
      "text": "🚨 Novo caso criado: {{ case.title }}",
      "attachments": [
        {
          "color": "danger",
          "fields": [
            {
              "title": "ID do Caso",
              "value": "{{ case.id }}",
              "short": true
            },
            {
              "title": "Severidade",
              "value": "{{ case.severity }}",
              "short": true
            },
            {
              "title": "Analista",
              "value": "{{ case.assignee }}",
              "short": true
            }
          ]
        }
      ]
    },
    "subscriptions": [
      {
        "type": "case",
        "operation": "create",
        "filter": {
          "severity": [3, 4]
        }
      }
    ]
  }'
```

### 5.4 Relatórios e Métricas

**Gerar Relatório de Caso:**

```bash
# Via API
curl -X GET "http://localhost:9000/api/case/CASE-2024-0001/_report" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Accept: text/markdown" \
  -o case-report.md

# Via interface web
# 1. Abrir caso
# 2. Clicar em "Report" (canto superior direito)
# 3. Selecionar formato (PDF, Markdown, HTML)
# 4. Gerar relatório
```

**Exemplo de Relatório Markdown:**

```markdown
# RELATÓRIO DE INCIDENTE DE SEGURANÇA

**ID do Caso:** CASE-2024-0001
**Título:** Detecção de Ransomware - HOST-01
**Data de Criação:** 2024-01-15 09:30:00
**Status:** Closed
**Severidade:** High (4)
**Analista Responsável:** João Silva

---

## RESUMO EXECUTIVO

Em 15 de janeiro de 2024, às 09:23:15, o sistema Wazuh detectou atividade suspeita no endpoint HOST-01, caracterizada como tentativa de ransomware. O incidente foi rapidamente identificado, contido e resolvido sem impacto significativo aos negócios.

**Tempo Total de Resolução:** 4 horas e 23 minutos

---

## TIMELINE DO INCIDENTE

| Timestamp | Evento | Responsável |
|-----------|--------|-------------|
| 2024-01-15 09:23:15 | Detecção inicial pelo Wazuh | Sistema |
| 2024-01-15 09:25:30 | Caso criado no TheHive | Sistema |
| 2024-01-15 09:27:00 | Atribuição ao analista | SOC Lead |
| 2024-01-15 09:45:00 | Isolamento do endpoint | Analista |
| 2024-01-15 10:30:00 | Coleta de evidências concluída | Forense |
| 2024-01-15 12:15:00 | Erradicação do malware | Analista |
| 2024-01-15 13:30:00 | Sistema restaurado | SysAdmin |
| 2024-01-15 13:53:00 | Caso encerrado | Analista |

---

## EVIDÊNCIAS COLETADAS

### Observáveis

1. **IP Malicioso**
   - Tipo: ip
   - Valor: 185.220.101.42
   - Fonte: Wazuh Alert
   - Status: Bloqueado no firewall

2. **Hash do Arquivo**
   - Tipo: hash
   - Valor: a1b2c3d4e5f6789012345678901234567890abcd
   - Tipo de hash: SHA256
   - Status: Bloqueado no EDR

3. **Domínio de C2**
   - Tipo: domain
   - Valor: malicious-c2-domain.com
   - Status: Notificado ao registrar

### Análises Executadas

- **VirusTotal**: Detetado como ransomware (17/71 engines)
- **MalwareBazaar**: Amostra conhecida - família Conti
- **AbuseIPDB**: IP reportado 1.247 vezes por atividades maliciosas

---

## AÇÕES TOMADAS

### Contenção
- [x] Endpoint HOST-01 isolado da rede
- [x] Conta de usuário temporariamente desabilitada
- [x] IP malicioso bloqueado no firewall
- [x] Hash do malware bloqueado no EDR

### Erradicação
- [x] Malware removido do sistema
- [x] Chaves de registro maliciosas removidas
- [x] Tarefas agendadas maliciosas eliminadas
- [x] Patch MS17-010 aplicado

### Recuperação
- [x] Sistema restaurado de backup de 14/01/2024
- [x] Validação de integridade dos arquivos
- [x] Monitoramento intensivo por 24h
- [x] Sistema liberado para produção

---

## IMPACTO

- **Sistemas Afetados:** 1 endpoint (HOST-01)
- **Dados Afetados:** Nenhum (detectado antes da criptografia)
- **Tempo de Indisponibilidade:** 4 horas e 23 minutos
- **Usuários Afetados:** 1 usuário (João da Silva - Vendas)
- **Impacto Financeiro:** Baixo (< R$ 5.000)

---

## LIÇÕES APRENDIDAS

### O que funcionou bem:
1. Detecção precoce pelo Wazuh
2. Resposta rápida da equipe SOC
3. Playbooks bem definidos
4. Integração eficiente entre ferramentas

### O que precisa melhorar:
1. Tempo de análise automatizada pode ser reduzido
2. Necessário treinamento adicional para usuários finais
3. Atualizar regras SIEM para detecção de atividades similares

### Ações de Follow-up:
- [ ] Realizar phishing simulation para equipe de Vendas - Due: 2024-02-15
- [ ] Revisar e atualizar playbook de ransomware - Due: 2024-01-30
- [ ] Implementar regra adicional no Wazuh - Due: 2024-01-22

---

## RECOMENDAÇÕES

1. **Técnicas:**
   - Manter todos os sistemas atualizados com patches de segurança
   - Revisar políticas de backup (tarefa diária)
   - Implementar EDR em todos os endpoints

2. **Processos:**
   - Revisar procedimentos de resposta a incidentes
   - Realizar tabletop exercises trimestrais
   - Atualizar playbook de ransomware

3. **Pessoas:**
   - Treinamento de awareness em segurança
   - Capacitação contínua da equipe SOC
   - Simulações de phishing regulares

---

**Relatório gerado em:** 2024-01-15 14:00:00
**Por:** João Silva - Analista SOC
**Revisado por:** Maria Santos - SOC Lead
**Aprovado por:** Pedro Oliveira - CISO
```

**Métricas e KPIs do SOC:**

```python
#!/usr/bin/env python3
"""
Script para gerar métricas de desempenho do SOC
"""

import requests
import json
from datetime import datetime, timedelta

def get_case_metrics(date_from, date_to):
    """Obtém métricas de casos"""
    headers = {"Authorization": "Bearer <TOKEN>"}

    # Buscar casos
    response = requests.post(
        f"{THEHIVE_URL}/api/case/_search",
        headers=headers,
        json={
            "range": {
                "field": "_createdAt",
                "from": date_from,
                "to": date_to
            }
        }
    )

    if response.status_code == 200:
        cases = response.json()
        return analyze_cases(cases)
    return {}

def analyze_cases(cases):
    """Analisa casos e calcula métricas"""
    total_cases = len(cases)

    # Contar por severidade
    severity_count = {
        1: 0,  # Low
        2: 0,  # Medium
        3: 0,  # High
        4: 0   # Critical
    }

    # Calcular MTTR (Mean Time To Resolve)
    resolution_times = []

    for case in cases:
        severity_count[case.get('severity', 1)] += 1

        if case.get('status') == 'Closed':
            created = datetime.fromisoformat(case['_createdAt'])
            closed = datetime.fromisoformat(case['_closedAt'])
            resolution_time = (closed - created).total_seconds() / 3600
            resolution_times.append(resolution_time)

    mttr = sum(resolution_times) / len(resolution_times) if resolution_times else 0

    # Classificar por tipo
    case_types = {}
    for case in cases:
        case_type = case.get('caseTemplate', 'Default')
        case_types[case_type] = case_types.get(case_type, 0) + 1

    return {
        'total_cases': total_cases,
        'severity_breakdown': severity_count,
        'mttr_hours': round(mttr, 2),
        'case_types': case_types,
        'closed_cases': len([c for c in cases if c.get('status') == 'Closed']),
        'open_cases': len([c for c in cases if c.get('status') == 'Open'])
    }

def generate_dashboard():
    """Gera dashboard de métricas"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)

    metrics = get_case_metrics(
        start_date.isoformat(),
        end_date.isoformat()
    )

    print("=== DASHBOARD SOC - ÚLTIMOS 30 DIAS ===\n")
    print(f"Total de Casos: {metrics['total_cases']}")
    print(f"Casos Fechados: {metrics['closed_cases']}")
    print(f"Casos Abertos: {metrics['open_cases']}")
    print(f"MTTR (tempo médio de resolução): {metrics['mttr_hours']:.2f} horas")

    print("\n=== Breakdown por Severidade ===")
    for severity, count in metrics['severity_breakdown'].items():
        severity_label = {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical'}
        print(f"{severity_label[severity]}: {count}")

    print("\n=== Casos por Tipo ===")
    for case_type, count in metrics['case_types'].items():
        print(f"{case_type}: {count}")

if __name__ == "__main__":
    generate_dashboard()
```

## 6. Integração com NeoAnd

### 6.1 Conexão com Cortex para Análise Automatizada

**Configurar Cortex:**

```yaml
# application.conf (Cortex)

# Database (Cassandra)
db {
  default {
    cluster = ["127.0.0.1"]
    keyspace = "cortex"
  }
}

# Elasticsearch
elasticSearch {
  cluster = "thehive-cluster"
  index = "cortex"
  nodes = ["127.0.0.1:9300"]
}

# Job Executor
jobExecutor {
  # Número de workers
  workers = 2

  # Timeout
  command = {
    timeout = 300
  }

  # Queue
  queue {
    size = 100
  }
}

# Configuração de Analyzers
analyzer {
  # Cache
  cache {
    ttl = 3600
  }

  # Timeout padrão
  timeout = 300

  # Max執行時間
  maxExecutionTime = 600
}
```

**Instalar e Configurar Analyzers:**

```bash
# 1. Listar analyzers disponíveis
curl -X GET "http://localhost:9001/api/analyzer/_list" \
  -H "Authorization: Bearer <TOKEN>"

# 2. Instalar VirusTotal Analyzer
cat > /opt/cortex/analyzers/VirusTotal_GetReport.json << 'EOF'
{
  "name": "VirusTotal_GetReport",
  "version": "0.1.0",
  "author": "TheHive Project",
  "description": "Consultar reporte do VirusTotal",
  "dataTypeList": ["hash", "url", "domain", "ip"],
  "command": [
    "/usr/bin/python3",
    "/opt/cortex/analyzers/VirusTotal_GetReport/VirusTotal_GetReport.py",
    "-v",
    "--hash",
    "$hash$",
    "--url",
    "$url$",
    "--domain",
    "$domain$",
    "--ip",
    "$ip$"
  ],
  "configuration": [
    {
      "name": "virusTotal_key",
      "description": "Chave da API do VirusTotal",
      "type": "string",
      "multi": false,
      "required": true
    }
  ]
}
EOF

# 3. Criar diretório do analyzer
mkdir -p /opt/cortex/analyzers/VirusTotal_GetReport

# 4. Download do script do analyzer
wget -O /opt/cortex/analyzers/VirusTotal_GetReport/VirusTotal_GetReport.py \
  https://raw.githubusercontent.com/TheHive-Project/Cortex-Analyzers/master/analyzers/VirusTotal_GetReport/VirusTotal_GetReport.py

chmod +x /opt/cortex/analyzers/VirusTotal_GetReport/VirusTotal_GetReport.py

# 5. Reiniciar Cortex
docker-compose restart cortex
```

**Exemplo de Script de Análise Customizado:**

```python
#!/usr/bin/env python3
"""
Analyzer customizado para integração NeoAnd Stack
Analisa IOCs e correlaciona com NetBox e Wazuh
"""

import json
import sys
import requests
from datetime import datetime

def main():
    try:
        # Ler parâmetros
        data = json.load(sys.stdin)
        observable = data.get("data", "")
        observable_type = data.get("dataType", "")

        # Processar baseado no tipo
        result = {}
        if observable_type == "ip":
            result = analyze_ip(observable)
        elif observable_type == "domain":
            result = analyze_domain(observable)
        elif observable_type == "hash":
            result = analyze_hash(observable)

        # Retornar resultado
        print(json.dumps({
            "success": True,
            "full": result,
            "summary": result.get("summary", "")
        }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

def analyze_ip(ip):
    """Analisa IP usando múltiplas fontes"""
    result = {
        "observable": ip,
        "type": "ip",
        "timestamp": datetime.now().isoformat(),
        "sources": []
    }

    # 1. Consultar NetBox para assets
    netbox_url = "http://netbox.empresa.com/api/ipam/ip-addresses/"
    netbox_response = requests.get(f"{netbox_url}?address={ip}")

    if netbox_response.status_code == 200:
        ip_data = netbox_response.json()
        result["sources"].append({
            "name": "NetBox",
            "data": ip_data.get("results", []),
            "found": len(ip_data.get("results", [])) > 0
        })

    # 2. Consultar Wazuh para logs
    wazuh_url = "http://wazuh.empresa.com:1514"
    wazuh_query = {
        "query": f"srcip:{ip}",
        "time_range": "24h"
    }
    wazuh_response = requests.post(f"{wazuh_url}/search", json=wazuh_query)

    if wazuh_response.status_code == 200:
        log_data = wazuh_response.json()
        result["sources"].append({
            "name": "Wazuh",
            "alerts": len(log_data.get("hits", [])),
            "found": len(log_data.get("hits", [])) > 0
        })

    # 3. Verificar reputação (AbuseIPDB)
    abuseipdb_url = "http://api.abuseipdb.com/api/v2/check"
    headers = {
        "Key": "YOUR-API-KEY",
        "Accept": "application/json"
    }
    params = {"ipAddress": ip, "maxAgeInDays": 90}
    abuse_response = requests.get(abuseipdb_url, headers=headers, params=params)

    if abuse_response.status_code == 200:
        abuse_data = abuse_response.json()
        result["sources"].append({
            "name": "AbuseIPDB",
            "data": abuse_data,
            "malicious": abuse_data.get("data", {}).get("abuseConfidencePercentage", 0)
        })

    # Gerar summary
    result["summary"] = generate_summary(result)

    return result

def analyze_domain(domain):
    """Analisa domínio"""
    # Similar ao analyze_ip, mas para domínios
    pass

def analyze_hash(hash_value):
    """Analisa hash de arquivo"""
    # Similar ao analyze_ip, mas para hashes
    pass

def generate_summary(result):
    """Gera resumo da análise"""
    sources_count = len(result["sources"])
    sources_with_data = sum(1 for s in result["sources"] if s.get("found", False))

    summary = f"Análise completa de {result['observable']}. "
    summary += f"Dados encontrados em {sources_with_data}/{sources_count} fontes."

    return summary

if __name__ == "__main__":
    main()
```

### 6.2 Integração com MISP para Threat Intelligence

**Configurar Integração MISP:**

```bash
# 1. Instalar PyMISP
pip3 install pymisp

# 2. Configurar MISP no TheHive
cat > /opt/thehive/conf/misp.conf << 'EOF'
misp {
  url = "http://misp.empresa.com"
  key = "YOUR-MISP-API-KEY"
  verifySSL = false
  timeout = 30

  # Configurações de atualização
  refresh {
    # Intervalo em horas
    interval = 24

    # Organizações para sincronizar
    orgs = ["YOUR-ORG", "SHARING-GROUP"]
  }

  # Filtros
  filters {
    # Tags para incluir
    includeTags = ["tlp:white", "tlp:green"]

    # Tags para excluir
    excludeTags = ["not-connected"]

    # Tipos de atributos
    types = ["ip-src", "ip-dst", "domain", "url", "md5", "sha256"]
  }
}
EOF

# 3. Reiniciar TheHive
docker-compose restart thehive
```

**Script de Sync com MISP:**

```python
#!/usr/bin/env python3
"""
Script para sincronizar IOCs do MISP com TheHive
"""

import requests
import json
from pymisp import PyMISP

def sync_misp_to_thehive():
    # Conectar ao MISP
    misp = PyMISP("http://misp.empresa.com", "YOUR-API-KEY", False)

    # Buscar IOCs recentes
    events = misp.search(
        published=True,
        returnFormat="json",
        limit=50
    )

    thehive_url = "http://thehive.empresa.com/api"
    headers = {"Authorization": "Bearer <THEHIVE-TOKEN>"}

    for event in events.get("response", []):
        for attribute in event.get("Event", {}).get("Attribute", []):
            observable = {
                "dataType": map_misp_type_to_thehive(attribute["type"]),
                "data": attribute["value"],
                "message": f"MISP Event {event['Event']['id']}",
                "tlp": map_tlp(attribute.get("tag", [])),
                "pap": 2,
                "tags": ["misp", "threat-intel"]
            }

            # Adicionar ao TheHive
            response = requests.post(
                f"{thehive_url}/observable",
                headers=headers,
                json=observable
            )

            if response.status_code == 201:
                print(f"Added: {observable['dataType']}: {observable['data']}")

def map_misp_type_to_thehive(misp_type):
    """Mapeia tipo MISP para tipo TheHive"""
    mapping = {
        "ip-src": "ip",
        "ip-dst": "ip",
        "domain": "domain",
        "url": "url",
        "md5": "hash",
        "sha1": "hash",
        "sha256": "hash",
        "email-src": "mail"
    }
    return mapping.get(misp_type, "other")

def map_tlp(tags):
    """Mapeia tags TLP"""
    for tag in tags:
        if "tlp:white" in tag:
            return 0
        elif "tlp:green" in tag:
            return 1
        elif "tlp:amber" in tag:
            return 2
        elif "tlp:red" in tag:
            return 3
    return 2  # Default to amber

if __name__ == "__main__":
    sync_misp_to_thehive()
```

### 6.3 Configuração com Elastic para SIEM

**Configurar Filebeat para Coletar Logs:**

```yaml
# /etc/filebeat/filebeat.yml

filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /opt/thehive/logs/thehive.log
  fields:
    service: thehive
    log_type: application
  fields_under_root: true
  multiline.pattern: '^[[:space:]]'
  multiline.negate: false
  multiline.match: after

- type: log
  enabled: true
  paths:
    - /opt/cortex/logs/*.log
  fields:
    service: cortex
    log_type: application
  fields_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch.empresa.com:9200"]
  index: "security-%{+yyyy.MM.dd}"

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

**Consultar Dados do Elastic no TheHive:**

```python
#!/usr/bin/env python3
"""
Enriquecer casos do TheHive com dados do Elasticsearch
"""

import requests
from elasticsearch import Elasticsearch

def enrich_case_with_elasticsearch(case_id):
    """Enriquece caso com dados do Elasticsearch"""
    # Conectar ao Elasticsearch
    es = Elasticsearch(["elasticsearch.empresa.com:9200"])

    # Buscar caso no TheHive
    thehive_url = "http://thehive.empresa.com/api"
    headers = {"Authorization": "Bearer <TOKEN>"}

    case_response = requests.get(f"{THEHIVE_URL}/case/{case_id}", headers=headers)
    case = case_response.json()

    # Extrair observables
    observables = case.get("observables", [])

    enriched_data = []

    for observable in observables:
        observable_type = observable.get("dataType")
        observable_value = observable.get("data")

        # Consultar Elasticsearch
        query = {
            "query": {
                "term": {f"{observable_type}.keyword": observable_value}
            },
            "size": 10
        }

        result = es.search(index="security-*", body=query)

        # Compilar resultados
        enriched_data.append({
            "observable": observable_value,
            "elasticsearch_hits": len(result["hits"]["hits"]),
            "events": result["hits"]["hits"]
        })

    # Atualizar caso com dados enriquecidos
    update_data = {
        "customFields": {
            "elasticsearch_enrichment": {
                "value": enriched_data
            }
        }
    }

    requests.patch(
        f"{THEHIVE_URL}/case/{case_id}",
        headers=headers,
        json=update_data
    )

    return enriched_data

if __name__ == "__main__":
    enrich_case_with_elasticsearch("CASE-2024-0001")
```

### 6.4 Webhooks e APIs

**Configurar Webhook para Integração Personalizada:**

```python
#!/usr/bin/env python3
"""
Webhook receiver para receber alertas de sistemas externos
"""

from flask import Flask, request, jsonify
import requests
import hmac
import hashlib

app = Flask(__name__)

THEHIVE_URL = "http://localhost:9000"
THEHIVE_TOKEN = "your-api-token"
WEBHOOK_SECRET = "your-webhook-secret"

@app.route('/webhook', methods=['POST'])
def webhook():
    # Verificar assinatura
    signature = request.headers.get('X-Signature')
    if not verify_signature(request.data, signature):
        return jsonify({"error": "Invalid signature"}), 401

    # Processar webhook
    data = request.json
    alert_type = data.get('type', 'generic')

    # Mapear para formato TheHive
    thehive_case = convert_to_thehive_format(data)

    # Enviar para TheHive
    headers = {
        "Authorization": f"Bearer {THEHIVE_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/case",
        headers=headers,
        json=thehive_case
    )

    if response.status_code == 201:
        return jsonify({"status": "success", "case_id": response.json()["id"]})
    else:
        return jsonify({"status": "error", "message": response.text}), 500

def verify_signature(payload, signature):
    """Verifica assinatura do webhook"""
    if not signature:
        return False

    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, f"sha256={expected}")

def convert_to_thehive_format(data):
    """Converte dados do webhook para formato TheHive"""
    alert_type = data.get('type', 'generic')

    mapping = {
        'wazuh': convert_wazuh_alert,
        'snort': convert_snort_alert,
        'suricata': convert_suricata_alert,
        'generic': convert_generic_alert
    }

    converter = mapping.get(alert_type, convert_generic_alert)
    return converter(data)

def convert_wazuh_alert(data):
    """Converte alerta do Wazuh"""
    return {
        "title": f"Wazuh Alert - {data.get('rule', {}).get('description', 'Unknown')}",
        "description": json.dumps(data, indent=2),
        "severity": map_severity(data.get('rule', {}).get('level', 1)),
        "tags": ["wazuh", data.get('rule', {}).get('group', 'security')],
        "tlp": 2,
        "pap": 2,
        "source": "wazuh",
        "observables": extract_observables(data)
    }

def convert_generic_alert(data):
    """Converte alerta genérico"""
    return {
        "title": data.get('title', 'Generic Alert'),
        "description": data.get('description', ''),
        "severity": data.get('severity', 1),
        "tags": data.get('tags', ['alert']),
        "tlp": 2,
        "pap": 2,
        "source": "webhook",
        "observables": data.get('observables', [])
    }

def map_severity(level):
    """Mapeia severidade externa para TheHive"""
    if level >= 10:
        return 4  # Critical
    elif level >= 7:
        return 3  # High
    elif level >= 4:
        return 2  # Medium
    else:
        return 1  # Low

def extract_observables(data):
    """Extrai IOCs do alerta"""
    observables = []

    # IP de origem
    if 'srcip' in data.get('data', {}):
        observables.append({
            "dataType": "ip",
            "data": data['data']['srcip'],
            "message": "Source IP",
            "tlp": 2,
            "pap": 2
        })

    return observables

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**Usar API do TheHive:**

```bash
#!/bin/bash
# Script de exemplos da API do TheHive

THEHIVE_URL="http://localhost:9000"
TOKEN="your-api-token"

# 1. Login e obter token
curl -X POST "${THEHIVE_URL}/api/user/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@thehive.local","password":"secret"}'

# 2. Listar casos
curl -X GET "${THEHIVE_URL}/api/case/_search" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {"_id": "CASE-2024-0001"}
  }'

# 3. Criar caso
curl -X POST "${THEHIVE_URL}/api/case" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Security Incident",
    "description": "Test incident created via API",
    "severity": 2,
    "tags": ["test", "api"],
    "tlp": 2,
    "pap": 2
  }'

# 4. Adicionar observable
curl -X POST "${THEHIVE_URL}/api/observable" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "dataType": "ip",
    "data": "192.168.1.100",
    "message": "Suspicious IP",
    "tlp": 2,
    "pap": 2,
    "case": "CASE-2024-0001"
  }'

# 5. Executar análise no Cortex
curl -X POST "${THEHIVE_URL}/api/analyzer/cortex/_search" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "analyzerId": "VirusTotal_GetReport_0_1_0",
    "observableId": "obs-123",
    "force": false
  }'

# 6. Adicionar tarefa
curl -X POST "${THEHIVE_URL}/api/case/CASE-2024-0001/task" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Investigate IP reputation",
    "description": "Check if IP is malicious",
    "assignee": "analyst@empresa.com",
    "dueAt": "2024-01-20T10:00:00Z"
  }'

# 7. Fechar caso
curl -X PATCH "${THEHIVE_URL}/api/case/CASE-2024-0001" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Closed",
    "resolutionStatus": "TruePositive",
    "impactStatus": "NoImpact",
    "closingDate": "2024-01-15T14:00:00Z",
    "closingNote": "Incident resolved successfully"
  }'

# 8. Gerar relatório
curl -X GET "${THEHIVE_URL}/api/case/CASE-2024-0001/_report" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: text/markdown" \
  -o report.md

# 9. Estatísticas
curl -X GET "${THEHIVE_URL}/api/case/_stats" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "range": {
      "field": "_createdAt",
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-01-31T23:59:59Z"
    }
  }'
```

## 7. Operação e Manutenção

### 7.1 Backup e Recovery

**Estratégia de Backup:**

```bash
# 1. Backup do Elasticsearch (data)
#!/bin/bash
# /usr/local/bin/backup-thehive.sh

BACKUP_DIR="/backup/thehive/$(date +%Y%m%d_%H%M%S)"
THEHIVE_HOME="/opt/thehive"

mkdir -p ${BACKUP_DIR}

# Backup do Elasticsearch
echo "Backuping Elasticsearch..."
curl -X PUT "localhost:9200/_snapshot/thehive_backup/snapshot_$(date +%Y%m%d)"
wait

# Download do snapshot
curl -X GET "localhost:9200/_snapshot/thehive_backup/snapshot_$(date +%Y%m%d)" > ${BACKUP_DIR}/elasticsearch_snapshot.json

# Backup dos dados do TheHive
echo "Backuping TheHive data..."
cp -r ${THEHIVE_HOME}/data ${BACKUP_DIR}/

# Backup das configurações
echo "Backuping configurations..."
cp -r ${THEHIVE_HOME}/conf ${BACKUP_DIR}/
cp /etc/nginx/sites-available/thehive ${BACKUP_DIR}/nginx.conf 2>/dev/null || true

# Backup dos logs
echo "Backuping logs..."
cp -r ${THEHIVE_HOME}/logs ${BACKUP_DIR}/logs

# Comprimir backup
cd /backup/thehive
tar -czf $(basename ${BACKUP_DIR}).tar.gz $(basename ${BACKUP_DIR})
rm -rf ${BACKUP_DIR}

# Manter apenas últimos 7 backups
find /backup/thehive -name "*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed: ${BACKUP_DIR}.tar.gz"
```

**Script de Restore:**

```bash
#!/bin/bash
# /usr/local/bin/restore-thehive.sh

if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

BACKUP_FILE=$1
RESTORE_DIR="/tmp/thehive-restore-$(date +%Y%m%d_%H%M%S)"

# Extrair backup
echo "Extracting backup..."
mkdir -p ${RESTORE_DIR}
tar -xzf ${BACKUP_FILE} -C ${RESTORE_DIR}

# Parar serviços
echo "Stopping services..."
docker-compose down

# Restore do Elasticsearch
echo "Restoring Elasticsearch..."
curl -X POST "localhost:9200/_snapshot/thehive_backup/_restore" \
  -H "Content-Type: application/json" \
  -d '{
    "snapshot": "snapshot_YYYYMMDD",
    "indices": "thehive-*"
  }'

# Restore dos dados do TheHive
echo "Restoring TheHive data..."
cp -r ${RESTORE_DIR}/data/* /opt/thehive/data/
cp -r ${RESTORE_DIR}/conf/* /opt/thehive/conf/

# Restaurar permissões
chown -R 1000:1000 /opt/thehive/data
chown -R thehive:thehive /opt/thehive/conf

# Reiniciar serviços
echo "Starting services..."
docker-compose up -d

echo "Restore completed. Check logs for any errors."
```

**Backup Automático com Cron:**

```bash
# Adicionar ao crontab
# crontab -e

# Backup diário às 02:00
0 2 * * * /usr/local/bin/backup-thehive.sh >> /var/log/thehive-backup.log 2>&1

# Verificação semanal do backup
0 3 * * 0 /usr/bin/test -f /backup/thehive/latest.tar.gz || /usr/local/bin/backup-thehive.sh
```

### 7.2 Monitoramento

**Métricas do Sistema:**

```bash
# Monitoramento com Prometheus + Grafana
# /etc/prometheus/prometheus.yml

global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'thehive'
    static_configs:
      - targets: ['localhost:9000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'elasticsearch'
    static_configs:
      - targets: ['localhost:9200']
    metrics_path: '/_prometheus/metrics'
    scrape_interval: 30s

  - job_name: 'cortex'
    static_configs:
      - targets: ['localhost:9001']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

**Dashboard do Grafana - Métricas do TheHive:**

```json
{
  "dashboard": {
    "title": "TheHive - SOC Metrics",
    "panels": [
      {
        "title": "Cases Created (Last 24h)",
        "type": "stat",
        "targets": [
          {
            "expr": "increase(thehive_cases_created_total[24h])"
          }
        ]
      },
      {
        "title": "Average Resolution Time (hours)",
        "type": "graph",
        "targets": [
          {
            "expr": "thehive_mttr_hours"
          }
        ]
      },
      {
        "title": "Cases by Severity",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (severity) (thehive_cases_total)"
          }
        ]
      },
      {
        "title": "Active Cortex Jobs",
        "type": "graph",
        "targets": [
          {
            "expr": "cortex_jobs_active"
          }
        ]
      },
      {
        "title": "Elasticsearch Health",
        "type": "stat",
        "targets": [
          {
            "expr": "elasticsearch_cluster_health_status"
          }
        ]
      }
    ]
  }
}
```

**Health Check Script:**

```bash
#!/bin/bin/bash
# /usr/local/bin/thehive-health-check.sh

THEHIVE_URL="http://localhost:9000"
ELASTICSEARCH_URL="http://localhost:9200"
CORTEX_URL="http://localhost:9001"

check_url() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}

    response=$(curl -s -o /dev/null -w "%{http_code}" ${url})

    if [ $response -eq $expected_status ]; then
        echo "✓ ${name}: OK (HTTP ${response})"
        return 0
    else
        echo "✗ ${name}: FAIL (HTTP ${response})"
        return 1
    fi
}

echo "=== TheHive Health Check - $(date) ==="
echo

# Verificar TheHive
check_url "${THEHIVE_URL}/api/user/me" "TheHive Application"

# Verificar Elasticsearch
check_url "${ELASTICSEARCH_URL}/_cluster/health" "Elasticsearch"

# Verificar Cortex
check_url "${CORTEX_URL}/api/user/me" "Cortex"

# Verificar espaço em disco
DISK_USAGE=$(df /opt/thehive | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo "✓ Disk Usage: OK (${DISK_USAGE}%)"
else
    echo "✗ Disk Usage: WARNING (${DISK_USAGE}%)"
fi

# Verificar memória
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -lt 90 ]; then
    echo "✓ Memory Usage: OK (${MEMORY_USAGE}%)"
else
    echo "✗ Memory Usage: WARNING (${MEMORY_USAGE}%)"
fi

# Verificar logs de erro
ERROR_COUNT=$(tail -n 1000 /opt/thehive/logs/application.log | grep -i error | wc -l)
echo "Recent Errors (last 1000 lines): ${ERROR_COUNT}"

echo
echo "=== Health Check Complete ==="
```

**Alertas Automatizados:**

```python
#!/usr/bin/env python3
"""
Monitor de saúde do TheHive com alertas
"""

import smtplib
import requests
from datetime import datetime
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

def check_health():
    """Verifica saúde dos serviços"""
    issues = []

    # Verificar TheHive
    try:
        response = requests.get("http://localhost:9000/api/user/me", timeout=10)
        if response.status_code != 200:
            issues.append("TheHive API não está respondendo")
    except Exception as e:
        issues.append(f"Erro ao conectar com TheHive: {str(e)}")

    # Verificar Elasticsearch
    try:
        response = requests.get("http://localhost:9200/_cluster/health", timeout=10)
        if response.json().get("status") not in ["green", "yellow"]:
            issues.append("Elasticsearch cluster health não está OK")
    except Exception as e:
        issues.append(f"Erro ao conectar com Elasticsearch: {str(e)}")

    return issues

def send_alert(issues):
    """Envia alerta por email"""
    smtp_server = "smtp.empresa.com"
    smtp_port = 587
    username = "alerts@empresa.com"
    password = "senha"

    to_addresses = ["soc@empresa.com"]

    subject = "ALERTA: Problemas detectados no TheHive"
    body = f"""
    Problemas detectados no ambiente TheHive:

    Timestamp: {datetime.now()}

    Issues encontrados:
    {chr(10).join('- ' + issue for issue in issues)}

    Por favor, verifique o sistema.

    --
    TheHive Health Monitor
    """

    msg = MimeMultipart()
    msg['From'] = username
    msg['To'] = ", ".join(to_addresses)
    msg['Subject'] = subject
    msg.attach(MimeText(body, 'plain'))

    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(username, password)
    server.send_message(msg)
    server.quit()

def main():
    issues = check_health()

    if issues:
        print("Issues found:", issues)
        send_alert(issues)
    else:
        print("All systems OK")

if __name__ == "__main__":
    main()

# Adicionar ao crontab para monitoramento a cada 5 minutos
# */5 * * * * /usr/local/bin/thehive-monitor.py >> /var/log/thehive-monitor.log 2>&1
```

### 7.3 Performance Tuning

**Otimização do Elasticsearch:**

```yaml
# /etc/elasticsearch/elasticsearch.yml

# Configurações de performance
indices.memory.index_buffer_size: 40%
indices.queries.cache.size: 512mb
indices.fielddata.cache.size: 512mb

# Thread pools
thread_pool.write.queue_size: 2000
thread_pool.search.queue_size: 2000
thread_pool.get.queue_size: 2000

# Cache de busca
search.cache.enable: true
search.cache.max_size: 10000
search.cache.expire: 5m

# Bulk settings
index.translog.flush_threshold_size: 1gb
index.translog.sync_interval: 30s

# Refresh interval (balance entre performance e freshness)
index.refresh_interval: 60s

# Index lifecycle management
xpack.ilm.enabled: true
```

**Otimização do TheHive:**

```hocon
# application.conf - configurações de performance

# Pool de conexões
db {
  default {
    hikariCP {
      maximumPoolSize = 50
      minimumIdle = 10
      idleTimeout = 300000
      connectionTimeout = 30000
      validationTimeout = 5000
      leakDetectionThreshold = 60000
      maxLifetime = 600000
    }
  }
}

# Akka actors
akka {
  actor {
    default-dispatcher {
      type = Dispatcher
      executor = "fork-join-executor"
      fork-join-executor {
        parallelism-min = 16
        parallelism-factor = 3.0
        parallelism-max = 32
      }
      throughput = 100
    }
  }

  # Timeout
  http.host-connection-pool {
    max-connections = 64
    max-connections-per-host = 32
    max-open-requests = 128
    pipelining-limit = 1
    pipelining-limit = 1
  }
}

# Cache
cache {
  defaultCache = "redis"

  redis {
    host = "localhost"
    port = 6379
    database = 0
    timeout = 2000

    # Pool do Redis
    pool {
      maxActive = 50
      maxIdle = 20
      maxWait = -1
      minEvictableIdleTimeMillis = 300000
      numTestsPerEvictionRun = 3
      softMinEvictableIdleTimeMillis = 300000
      testOnBorrow = false
      testOnReturn = false
      testWhileIdle = true
      timeBetweenEvictionRunsMillis = 60000
    }
  }
}
```

**Monitoramento de Performance:**

```bash
#!/bin/bash
# /usr/local/bin/thehive-performance-check.sh

echo "=== TheHive Performance Check ==="
echo

# 1. Uso de CPU
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print "CPU: " $1 "%"}'

# 2. Uso de Memória
echo
echo "Memory Usage:"
free -h | grep -E "(Mem|Swap)"

# 3. I/O do Disco
echo
echo "Disk I/O:"
iostat -x 1 1 | grep -E "(Device|loop|sd[a-z])" | head -10

# 4. Conexões de Rede
echo
echo "Network Connections:"
netstat -an | grep :9000 | grep ESTABLISHED | wc -l | awk '{print "TheHive ESTABLISHED connections: " $1}'

# 5. Status do Elasticsearch
echo
echo "Elasticsearch Status:"
curl -s localhost:9200/_cluster/health | jq '.'

# 6. Performance Queries
echo
echo "TheHive Response Time:"
time curl -s -o /dev/null -w "HTTP Status: %{http_code}\nTotal Time: %{time_total}s\n" http://localhost:9000/api/user/me

# 7. Top Queries do Elasticsearch
echo
echo "Slow Queries in Elasticsearch:"
curl -s localhost:9200/_nodes/stats/indices/search?pretty | jq '.nodes | to_entries[] | .value.indices.search.total'

echo
echo "=== Performance Check Complete ==="
```

### 7.4 Troubleshooting

**Problemas Comuns e Soluções:**

```bash
# 1. TheHive não inicia
# Sintomas: Logs mostram conexão recusada com Elasticsearch

# Verificar se Elasticsearch está rodando
sudo systemctl status elasticsearch

# Verificar logs do Elasticsearch
sudo tail -f /var/log/elasticsearch/thehive-cluster.log

# Reiniciar Elasticsearch
sudo systemctl restart elasticsearch

# Verificar conectividade
curl -X GET "localhost:9200/_cluster/health?pretty"

# 2. Erro de memória insuficiente
# Sintomas: OutOfMemoryError nos logs

# Aumentar heap do Java
export ES_HEAP_SIZE=4g

# Ou no docker-compose.yml
# environment:
#   - ES_JAVA_OPTS=-Xms4g -Xmx4g

# 3. Cortex jobs falhando
# Sintomas: Jobs ficam em estado "Failure"

# Verificar logs do Cortex
docker-compose logs cortex | grep ERROR

# Verificar configuração dos analyzers
curl -X GET "http://localhost:9001/api/analyzer/_list" \
  -H "Authorization: Bearer <TOKEN>"

# Reiniciar Cortex
docker-compose restart cortex

# 4. Performance lenta
# Sintomas: Interface carrega lentamente, buscas demoram

# Verificar uso de recursos
htop
iotop
iftop

# Otimizar Elasticsearch
curl -X PUT "localhost:9200/thehive/_settings" \
  -H "Content-Type: application/json" \
  -d '{
    "index": {
      "refresh_interval": "60s"
    }
  }'

# 5. Problema de autenticação
# Sintomas: Usuário não consegue fazer login

# Verificar usuário
curl -X GET "http://localhost:9000/api/user/<user-id>" \
  -H "Authorization: Bearer <TOKEN>"

# Resetar senha (via banco ou API admin)
# Usar o endpoint de reset de senha
```

**Log Analysis Script:**

```bash
#!/bin/bash
# /usr/local/bin/analyze-thehive-logs.sh

LOG_FILE="/opt/thehive/logs/application.log"
HOURS=${1:-24}

echo "=== Analyzing TheHive Logs (Last ${HOURS} hours) ==="
echo

# Filtrar logs das últimas N horas
since=$(date -d "${HOURS} hours ago" '+%Y-%m-%d %H:%M:%S')

echo "1. Top 10 Errors:"
grep "${since}" ${LOG_FILE} | grep -i error | awk '{print $NF}' | sort | uniq -c | sort -rn | head -10

echo
echo "2. Exceptions:"
grep "${since}" ${LOG_FILE} | grep -i exception | tail -20

echo
echo "3. Performance Issues (Slow queries):"
grep "${since}" ${LOG_FILE} | grep -i "slow query" | tail -10

echo
echo "4. Elasticsearch Issues:"
grep "${since}" ${LOG_FILE} | grep -i "elasticsearch" | tail -10

echo
echo "5. Cortex Issues:"
grep "${since}" ${LOG_FILE} | grep -i "cortex" | tail -10

echo
echo "6. User Activity (Logins):"
grep "${since}" ${LOG_FILE} | grep -i "login" | tail -10

echo
echo "7. API Errors (HTTP 5xx):"
grep "${since}" ${LOG_FILE} | grep "HTTP/1.1\" 5" | tail -10

echo
echo "8. Anomalies (Warnings):"
grep "${since}" ${LOG_FILE} | grep -i warning | tail -10

echo
echo "=== Analysis Complete ==="
```

**Recovery Procedures:**

```bash
# Procedimento de recovery completo

# 1. Parar todos os serviços
docker-compose down

# 2. Backup do estado atual (caso recovery falhe)
cp -r /opt/thehive/data /opt/thehive/data-backup-$(date +%Y%m%d)

# 3. Restaurar do backup
/usr/local/bin/restore-thehive.sh /backup/thehive/latest.tar.gz

# 4. Verificar restauração
sleep 30
curl -X GET "localhost:9000/api/user/me"

# 5. Verificar dados
curl -X GET "localhost:9000/api/case/_stats"

# 6. Reiniciar serviços se necessário
docker-compose restart thehive

# 7. Verificar logs
tail -f /opt/thehive/logs/application.log
```

## 8. Segurança

### 8.1 Configuração de Segurança

**Hardening do Sistema Operacional:**

```bash
# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Configurar firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 3. Configurar fail2ban
sudo apt install -y fail2ban

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 4. Configurar limites de sistema
cat >> /etc/security/limits.conf << 'EOF'
thehive soft nofile 65535
thehive hard nofile 65535
elasticsearch soft nofile 65535
elasticsearch hard nofile 65535
EOF

# 5. Configurar Kernel parameters
cat >> /etc/sysctl.conf << 'EOF'
# Proteção contra IP spoofing
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1

# Proteção contra SYN flood
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2

# Desabilitar IP forwarding (se não necessário)
net.ipv4.ip_forward = 0

# Protection against source routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log de pacotes suspeitos
net.ipv4.conf.all.log_martians = 1
EOF

sudo sysctl -p
```

**Configuração de SSL/TLS:**

```bash
# 1. Gerar certificado SSL com Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# 2. Obter certificado
sudo certbot --nginx -d thehive.empresa.com

# 3. Auto-renewal
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet

# 4. Configuração do Nginx
cat > /etc/nginx/sites-available/thehive-ssl << 'EOF'
server {
    listen 80;
    server_name thehive.empresa.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thehive.empresa.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/thehive.empresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thehive.empresa.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Proxy para TheHive
    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Block access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ \.(env|conf|config)$ {
        deny all;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/thehive-ssl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Configuração Segura do application.conf:**

```hocon
# Configurações de segurança

play {
  # Chave secreta forte (gerar com: openssl rand -base64 32)
  http.secret.key = "sua-chave-secreta-super-forte-de-32-caracteres-minimo-aqui"

  # Timeout da sessão
  session.maxAge = 86400  # 24 horas

  # Configurações de CORS
  filters {
    enabled = ["play.filters.cors.CORSFilter"]
    cors {
      allowedOrigins = ["https://thehive.empresa.com"]
      allowedMethods = ["GET", "POST", "PUT", "DELETE"]
      allowedHeaders = ["Accept", "Authorization", "Content-Type"]
      allowCredentials = true
      preflightMaxAge = 1 day
    }
  }

  # CSP (Content Security Policy)
  security {
    headers {
      contentSecurityPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    }
  }
}

# Configuração do Elasticsearch (somente localhost)
elasticSearch {
  nodes = ["127.0.0.1:9300"]
}

# Configuração de cache com timeout
cache {
  defaultTTL = 3600  # 1 hora

  # Redis com autenticação (se configurado)
  redis {
    host = "127.0.0.1"
    port = 6379
    timeout = 2000
    # password = "senha-super-secreta"
  }
}

# Configuração de upload
storage {
  maxAttachmentSize = 104857600  # 100MB
  chunkSize = 1048576  # 1MB

  # Validar tipo de arquivo
  allowedMimeTypes = [
    "application/pdf",
    "text/plain",
    "application/json",
    "image/png",
    "image/jpeg",
    "application/zip"
  ]
}
```

### 8.2 Autenticação

**Configurar LDAP/Active Directory:**

```hocon
# Integração com Active Directory

auth {
  # Tipo de autenticação
  provider = "ldap"

  # Configuração LDAP
  ldap {
    # Configurações do servidor
    server = "ldap://ldap.empresa.com:389"
    baseDn = "DC=empresa,DC=com"

    # DN de usuário para bind
    bindDn = "cn=thehive,ou=ServiceAccounts,dc=empresa,dc=com"
    bindPassword = "senha-do-service-account"

    # Filtro de usuário
    userFilter = "(sAMAccountName={0})"

    # Mapeamento de atributos
    map {
      login = "sAMAccountName"
      name = "displayName"
      email = "mail"
    }

    # Configurações de SSL
    ssl {
      enabled = false
      trustAllCerts = false
      trustStorePath = "/etc/ssl/certs/ldap-ca.jks"
      trustStorePassword = "senha"
    }

    # Timeout
    connectionTimeout = 5s
    readTimeout = 10s
  }
}
```

**Configurar SSO com SAML:**

```hocon
# Single Sign-On com SAML 2.0

auth {
  provider = "saml"

  saml {
    # Metadata do IdP
    metadataUrl = "https://idp.empresa.com/metadata"

    # Entity ID
    entityId = "https://thehive.empresa.com"

    # ACS (Assertion Consumer Service)
    assertionConsumerService {
      binding = "POST"
      url = "https://thehive.empresa.com/login"
    }

    # Configurações de chave privada
    key {
      path = "/etc/thehive/saml.key"
      password = "senha-da-chave"
    }

    # Certificado
    certificate = "/etc/thehive/saml.crt"

    # Mapeamento de atributos
    attributeMapping {
      login = "uid"
      name = "displayName"
      email = "mail"
      groups = "groups"
    }

    # Configurações de segurança
    security {
      authnRequestsSigned = true
      wantAssertionsSigned = true
      wantMessageSigned = true
      signatureAlgorithm = "RSA-SHA256"
    }

    # Configurações de sessão
    session {
      timeout = 3600  # 1 hora
      cookieSecure = true
      cookieHttpOnly = true
    }
  }
}
```

**Configurar OAuth2/OpenID Connect:**

```hocon
# OAuth2 com Keycloak/Google/GitHub

auth {
  provider = "oauth2"

  oauth2 {
    # Keycloak example
    keycloak {
      clientId = "thehive"
      clientSecret = "your-client-secret"
      redirectUri = "https://thehive.empresa.com/login"
      authorizationUri = "https://keycloak.empresa.com/auth/realms/TheHive/protocol/openid-connect/auth"
      tokenUri = "https://keycloak.empresa.com/auth/realms/TheHive/protocol/openid-connect/token"
      userInfoUri = "https://keycloak.empresa.com/auth/realms/TheHive/protocol/openid-connect/userinfo"
      scopes = ["openid", "profile", "email"]

      # Mapeamento de atributos
      field {
        login = "preferred_username"
        name = "name"
        email = "email"
      }
    }
  }
}
```

**Configurar Autenticação de Dois Fatores (2FA):**

```bash
# 1. Instalar TOTP support
# (Configurado via custom implementation ou proxy)

# 2. Exemplo de configuração de proxy com 2FA
cat > /etc/nginx/auth-request.conf << 'EOF'
# Autenticação adicional via auth_request
location / {
    auth_request /auth-verify;
    proxy_pass http://localhost:9000;
}

location = /auth-verify {
    proxy_pass http://localhost:8080/verify;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_set_header X-Original-URI $request_uri;
}
EOF

# 3. Serviço de verificação 2FA
cat > /opt/2fa-service/app.py << 'EOF'
from flask import Flask, request, jsonify
import pyotp

app = Flask(__name__)

# Armazenamento de secrets 2FA (em produção, usar database)
user_secrets = {
    "user@empresa.com": "JBSWY3DPEHPK3PXP"  # TOTP secret
}

@app.route('/verify', methods=['POST'])
def verify():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "No authorization"}), 401

    # Validar sessão
    # Verificar 2FA
    # return jsonify({"status": "ok"}), 200 ou 401

if __name__ == '__main__':
    app.run(port=8080)
EOF
```

### 8.3 Auditoria

**Configuração de Audit Logs:**

```hocon
# Configuração detalhada de logs de auditoria

play.logger {
  # Log de auditoria
  auditor {
    level = INFO
    file = "/opt/thehive/logs/audit.log"
    rolling = "daily"
    maxSize = "100MB"
    maxFiles = "30days"

    # Categorias de eventos para auditorar
    events = [
      "user.login"
      "user.logout"
      "user.create"
      "user.update"
      "user.delete"
      "case.create"
      "case.update"
      "case.delete"
      "case.close"
      "observable.create"
      "observable.delete"
      "task.create"
      "task.update"
      "task.complete"
      "cortex.job.start"
      "cortex.job.complete"
      "cortex.job.error"
      "alert.create"
      "alert.update"
      "api.request"
    ]

    # Campos obrigatórios
    fields = [
      "timestamp"
      "user"
      "ip_address"
      "action"
      "resource"
      "result"
      "details"
    ]
  }
}
```

**Exemplo de Log de Auditoria:**

```json
{
  "timestamp": "2024-01-15T14:30:00Z",
  "user": "analyst@empresa.com",
  "user_id": "user-123",
  "ip_address": "192.168.1.100",
  "action": "case.update",
  "resource": "CASE-2024-0001",
  "result": "success",
  "details": {
    "changes": {
      "status": {"old": "Open", "new": "InProgress"},
      "assignee": {"old": null, "new": "analyst@empresa.com"},
      "severity": {"old": 2, "new": 3}
    }
  },
  "user_agent": "Mozilla/5.0...",
  "session_id": "sess-abc123"
}
```

**Script de Análise de Auditoria:**

```bash
#!/bin/bash
# /usr/local/bin/analyze-audit-logs.sh

AUDIT_LOG="/opt/thehive/logs/audit.log"

echo "=== Security Audit Report - $(date) ==="
echo

# 1. Logins por usuário
echo "1. Login Statistics:"
grep "user.login" ${AUDIT_LOG} | awk '{print $4}' | sort | uniq -c | sort -rn | head -10

# 2. IPs suspeitas
echo
echo "2. Top Source IPs:"
grep "api.request" ${AUDIT_LOG} | awk '{print $6}' | sort | uniq -c | sort -rn | head -10

# 3. Ações por dia
echo
echo "3. Activity by Day:"
grep "$(date +%Y-%m-%d)" ${AUDIT_LOG} | wc -l | awk '{print "Today: " $1 " events"}'

# 4. Erros de autenticação
echo
echo "4. Failed Logins:"
grep "user.login" ${AUDIT_LOG} | grep -i fail | wc -l | awk '{print "Failed logins: " $1}'

# 5. Casos criados
echo
echo "5. Cases Created:"
grep "case.create" ${AUDIT_LOG} | wc -l | awk '{print "Total cases created: " $1}'

# 6. Análises executadas
echo
echo "6. Cortex Jobs Executed:"
grep "cortex.job.complete" ${AUDIT_LOG} | wc -l | awk '{print "Cortex jobs completed: " $1}'

# 7. Exportar para SIEM
echo
echo "7. Exporting to SIEM..."
# Enviar logs para SIEM
# tail -f ${AUDIT_LOG} | nc splunk.empresa.com 514

echo
echo "=== Report Complete ==="
```

**Integração com SIEM:**

```python
#!/usr/bin/env python3
"""
Forward audit logs para SIEM
"""

import json
import time
import requests
from datetime import datetime

class AuditForwarder:
    def __init__(self, siem_endpoint, api_key):
        self.siem_endpoint = siem_endpoint
        self.api_key = api_key
        self.batch = []
        self.batch_size = 100

    def forward_log(self, log_entry):
        """Envia log individual para SIEM"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "timestamp": datetime.now().isoformat(),
            "source": "thehive",
            "type": "audit",
            "data": log_entry
        }

        response = requests.post(
            self.siem_endpoint,
            headers=headers,
            json=payload,
            timeout=5
        )

        return response.status_code == 200

    def forward_batch(self):
        """Envia lote de logs"""
        if not self.batch:
            return

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "timestamp": datetime.now().isoformat(),
            "source": "thehive",
            "type": "audit_batch",
            "count": len(self.batch),
            "data": self.batch
        }

        response = requests.post(
            self.siem_endpoint,
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            self.batch = []
            print(f"Forwarded {payload['count']} logs to SIEM")
        else:
            print(f"Failed to forward logs: {response.text}")

# Usage
forwarder = AuditForwarder(
    siem_endpoint="https://siem.empresa.com/api/logs",
    api_key="your-siem-api-key"
)

# Monitorar log file
with open('/opt/thehive/logs/audit.log', 'r') as f:
    # Pular logs existentes
    f.seek(0, 2)

    while True:
        line = f.readline()
        if not line:
            time.sleep(1)
            continue

        try:
            log_entry = json.loads(line)
            forwarder.batch.append(log_entry)

            if len(forwarder.batch) >= forwarder.batch_size:
                forwarder.forward_batch()
        except json.JSONDecodeError:
            continue
```

### 8.4 Hardening

**Checklist de Hardening:**

```bash
#!/bin/bash
# /usr/local/bin/thehive-security-check.sh

echo "=== TheHive Security Checklist ==="
echo

# 1. Verificar versão do TheHive
echo "1. Version Check:"
curl -s http://localhost:9000/api/user/me | jq -r '.message // "Unknown"'
echo "   Latest version: https://github.com/TheHive-Project/TheHive/releases/latest"
echo

# 2. Verificar SSL/TLS
echo "2. SSL/TLS Configuration:"
if curl -s -o /dev/null -w "%{http_code}" https://thehive.empresa.com | grep -q 200; then
    echo "   ✓ SSL is enabled"
    # Testar configuração SSL
    echo | openssl s_client -connect thehive.empresa.com:443 2>/dev/null | openssl x509 -noout -dates | grep -E "(Not Before|Not After)"
else
    echo "   ✗ SSL is NOT enabled"
fi
echo

# 3. Verificar headers de segurança
echo "3. Security Headers:"
curl -I -s https://thehive.empresa.com | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Content-Security-Policy)"
echo

# 4. Verificar firewall
echo "4. Firewall Status:"
sudo ufw status | grep -E "(Status|9000|9001|9200)"
echo

# 5. Verificar fail2ban
echo "5. Fail2ban Status:"
sudo fail2ban-client status | grep -E "(Jail|Status)"
echo

# 6. Verificar permissões de arquivos
echo "6. File Permissions:"
ls -l /opt/thehive/conf/application.conf | awk '{print $1, $9}'
echo

# 7. Verificar configurações de segurança
echo "7. Security Configuration:"
grep -i "http.secret.key" /opt/thehive/conf/application.conf | head -1
grep -i "session.maxAge" /opt/thehive/conf/application.conf | head -1
echo

# 8. Verificar logs de erro
echo "8. Recent Security Logs:"
tail -n 50 /opt/thehive/logs/application.log | grep -i -E "(error|exception|security|unauthorized)" | tail -5
echo

# 9. Verificar autenticação LDAP/SSO
echo "9. Authentication Configuration:"
grep -i "provider" /opt/thehive/conf/application.conf | grep -v "^#"
echo

# 10. Verificar backup
echo "10. Backup Status:"
ls -lth /backup/thehive/ | head -3
echo

echo "=== Security Check Complete ==="
echo
echo "=== Additional Recommendations ==="
echo "- Change default admin password"
echo "- Enable 2FA for all users"
echo "- Regularly update TheHive and analyzers"
echo "- Review audit logs daily"
echo "- Enable network segmentation"
echo "- Implement intrusion detection"
echo "- Conduct penetration testing quarterly"
```

**Configuração de Rate Limiting:**

```nginx
# /etc/nginx/nginx.conf - rate limiting

http {
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    server {
        # Rate limiting para login
        location ~ ^/api/(user/login|auth) {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://thehive_backend;
        }

        # Rate limiting para API
        location /api/ {
            limit_req zone=api burst=200 nodelay;
            proxy_pass http://thehive_backend;
        }

        # Rate limiting geral
        location / {
            limit_req zone=general burst=50 nodelay;
            proxy_pass http://thehive_backend;
        }

        # Block suspicious requests
        location ~ ^/(.env|config|admin) {
            deny all;
        }
    }
}
```

**Monitoramento de Segurança em Tempo Real:**

```bash
#!/bin/bash
# /usr/local/bin/security-monitor.sh

ALERT_EMAIL="soc@empresa.com"
LOG_FILE="/opt/thehive/logs/application.log"

# Função para enviar alertas
send_alert() {
    subject="$1"
    body="$2"
    echo "$body" | mail -s "[SECURITY ALERT] $subject" $ALERT_EMAIL
}

# Monitorar tentativas de login inválidas
tail -f $LOG_FILE | while read line; do
    # 5+ tentativas de login falharam
    if echo "$line" | grep -q "Invalid credentials"; then
        ip=$(echo "$line" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | tail -1)
        count=$(grep "$ip" $LOG_FILE | grep "Invalid credentials" | tail -5 | wc -l)

        if [ $count -ge 5 ]; then
            send_alert "Multiple Failed Logins" "IP $ip has $count failed login attempts"
        fi
    fi

    # Acesso a API sem autenticação
    if echo "$line" | grep -q "Unauthorized API access"; then
        send_alert "Unauthorized API Access" "$line"
    fi

    # Tentativa de upload de arquivo malicioso
    if echo "$line" | grep -q "Malicious file upload blocked"; then
        send_alert "Malicious File Upload Blocked" "$line"
    fi

    # Suspeita de SQL injection
    if echo "$line" | grep -qi "sql injection"; then
        send_alert "SQL Injection Attempt" "$line"
    fi
done
```

## Conclusão

O **TheHive** é uma plataforma robusta e completa para gestão de resposta a incidentes, essencial para qualquer SOC moderno. Quando integrado corretamente na stack NeoAnd, proporciona:

- **Centralização** de todas as atividades de IR
- **Automação** de processos repetitivos via Cortex
- **Colaboração** eficiente entre analistas
- **Auditoria** completa de todas as ações
- **Integração** nativa com threat intelligence (MISP)
- **Escalabilidade** para atender organizações de qualquer tamanho

### Próximos Passos

1. **Implementação gradual** - Comece com casos simples e expanda
2. **Treinamento da equipe** - Capacite analistas no uso da plataforma
3. **Desenvolvimento de playbooks** - Automatize workflows comuns
4. **Integração contínua** - Conecte mais fontes de dados
5. **Monitoramento constante** - Acompanhe métricas e KPIs
6. **Melhoria contínua** - Refine processos com base em lições aprendidas

### Recursos Adicionais

- **Documentação oficial**: https://docs.thehive-project.org/
- **TheHive Project**: https://thehive-project.org/
- **Cortex Analyzers**: https://github.com/TheHive-Project/Cortex-Analyzers
- **Comunidade**: https://gitter.im/TheHive-Project/TheHive

---

*Documentação criada para a Stack NeoAnd - Versão 1.0 - 2024*