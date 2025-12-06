# Instalação e Configuração do MISP

## Visão Geral

Este guia fornece instruções completas para instalar e configurar o MISP utilizando Docker Compose, a abordagem recomendada para ambientes de produção e desenvolvimento.

!!! info "Objetivos deste Guia"
    - Instalar MISP via Docker Compose
    - Configurar banco de dados MySQL/MariaDB
    - Configurar Redis para cache e workers
    - Configurar workers para processamento em background
    - Configurar HTTPS com certificados SSL
    - Configurar envio de emails
    - Aplicar hardening de segurança
    - Otimizar performance
    - Troubleshooting de problemas comuns

## Pré-requisitos

### Requisitos de Hardware

| Componente | Mínimo | Recomendado | Enterprise |
|------------|--------|-------------|------------|
| **CPU** | 2 cores | 4 cores | 8+ cores |
| **RAM** | 4 GB | 8 GB | 16+ GB |
| **Disco** | 50 GB SSD | 100 GB SSD | 500+ GB SSD |
| **Network** | 100 Mbps | 1 Gbps | 10 Gbps |

!!! warning "Considerações de Armazenamento"
    - MISP armazena arquivos de malware e attachments
    - Databases podem crescer rapidamente com feeds
    - Planeje **pelo menos 100 GB** para produção
    - Use SSD para performance de banco de dados

### Requisitos de Software

=== "Sistema Operacional"
    ```yaml
    Suportados:
      - Ubuntu 20.04 LTS (recomendado)
      - Ubuntu 22.04 LTS (recomendado)
      - Debian 11/12
      - CentOS 8 Stream / Rocky Linux 8
      - RedHat Enterprise Linux 8/9

    Recomendação:
      - Ubuntu 22.04 LTS Server
      - Melhor suporte da comunidade
      - Documentação extensa
      - Pacotes atualizados
    ```

=== "Docker"
    ```bash
    # Versões necessárias
    Docker: >= 20.10
    Docker Compose: >= 2.0 (recomendado v2.x)

    # Verificar versões instaladas
    docker --version
    docker compose version
    ```

=== "Outros"
    ```yaml
    Ferramentas adicionais:
      - git: Para clonar repositório
      - curl/wget: Para downloads
      - openssl: Para gerar certificados
      - gpg: Para assinatura de eventos (opcional)

    Acesso:
      - Acesso root ou sudo
      - Portas 80, 443, 3306, 6379 disponíveis
    ```

### Instalação do Docker

Se você ainda não tem Docker instalado:

=== "Ubuntu/Debian"
    ```bash
    # Remover versões antigas
    sudo apt-get remove docker docker-engine docker.io containerd runc

    # Instalar dependências
    sudo apt-get update
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # Adicionar repositório oficial Docker
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin

    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    newgrp docker

    # Verificar instalação
    docker run hello-world
    ```

=== "CentOS/RHEL"
    ```bash
    # Remover versões antigas
    sudo yum remove docker docker-client docker-client-latest \
        docker-common docker-latest docker-latest-logrotate \
        docker-logrotate docker-engine

    # Instalar repositório
    sudo yum install -y yum-utils
    sudo yum-config-manager --add-repo \
        https://download.docker.com/linux/centos/docker-ce.repo

    # Instalar Docker Engine
    sudo yum install -y docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin

    # Iniciar Docker
    sudo systemctl start docker
    sudo systemctl enable docker

    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    newgrp docker

    # Verificar instalação
    docker run hello-world
    ```

## Instalação do MISP via Docker Compose

### Estrutura de Diretórios

Primeiro, crie a estrutura de diretórios para o MISP:

```bash
# Criar diretório base
sudo mkdir -p /opt/misp
cd /opt/misp

# Criar subdiretórios
sudo mkdir -p {mysql,redis,misp-files,misp-logs,misp-configs,ssl,gpg}

# Ajustar permissões
sudo chown -R $(id -u):$(id -g) /opt/misp
```

A estrutura final será:

```
/opt/misp/
├── docker-compose.yml
├── .env
├── mysql/              # Dados do MySQL
├── redis/              # Dados do Redis
├── misp-files/         # Arquivos do MISP (malware, attachments)
├── misp-logs/          # Logs do MISP
├── misp-configs/       # Configurações customizadas
├── ssl/                # Certificados SSL
└── gpg/                # Keys GPG para assinatura
```

### Docker Compose Configuration

Crie o arquivo `docker-compose.yml`:

```yaml title="/opt/misp/docker-compose.yml"
version: '3.8'

services:
  # MySQL Database
  misp-db:
    image: mysql:8.0
    container_name: misp-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - ./mysql:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d:ro
    networks:
      - misp-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache & Queue
  misp-redis:
    image: redis:7-alpine
    container_name: misp-redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - ./redis:/data
    networks:
      - misp-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MISP Core Application
  misp:
    image: coolacid/misp-docker:core-latest
    container_name: misp
    restart: always
    depends_on:
      misp-db:
        condition: service_healthy
      misp-redis:
        condition: service_healthy
    ports:
      - "80:80"
      - "443:443"
    environment:
      # Database
      MYSQL_HOST: misp-db
      MYSQL_PORT: 3306
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}

      # Redis
      REDIS_HOST: misp-redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}

      # MISP Configuration
      MISP_BASEURL: ${MISP_BASEURL}
      MISP_UUID: ${MISP_UUID}
      MISP_ORG: ${MISP_ORG}
      MISP_EMAIL: ${MISP_EMAIL}
      MISP_ADMIN_EMAIL: ${MISP_ADMIN_EMAIL}
      MISP_ADMIN_PASSPHRASE: ${MISP_ADMIN_PASSPHRASE}

      # Security
      SECURITY_SALT: ${SECURITY_SALT}
      SECURITY_ENCRYPTION_KEY: ${SECURITY_ENCRYPTION_KEY}

      # Email (SMTP)
      MISP_EMAIL_HOST: ${SMTP_HOST}
      MISP_EMAIL_PORT: ${SMTP_PORT}
      MISP_EMAIL_USERNAME: ${SMTP_USERNAME}
      MISP_EMAIL_PASSWORD: ${SMTP_PASSWORD}
      MISP_EMAIL_FROM: ${SMTP_FROM}
      MISP_EMAIL_TLS: ${SMTP_TLS}

      # Timezone
      TZ: America/Sao_Paulo

      # Workers
      MISP_WORKERS: 5

      # SSL
      MISP_ENABLE_HTTPS: "true"
      MISP_HTTPS_PORT: 443

    volumes:
      - ./misp-files:/var/www/MISP/app/files
      - ./misp-logs:/var/www/MISP/app/tmp/logs
      - ./misp-configs:/var/www/MISP/app/Config
      - ./ssl:/etc/nginx/certs:ro
      - ./gpg:/var/www/MISP/.gnupg
    networks:
      - misp-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/users/login"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # MISP Background Workers
  misp-workers:
    image: coolacid/misp-docker:core-latest
    container_name: misp-workers
    restart: always
    depends_on:
      misp:
        condition: service_healthy
    environment:
      MYSQL_HOST: misp-db
      MYSQL_PORT: 3306
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      REDIS_HOST: misp-redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      TZ: America/Sao_Paulo
    volumes:
      - ./misp-files:/var/www/MISP/app/files
      - ./misp-logs:/var/www/MISP/app/tmp/logs
      - ./misp-configs:/var/www/MISP/app/Config
    networks:
      - misp-network
    command: /var/www/MISP/app/Console/worker/start.sh

  # MISP Modules (Expansion, Export, Import)
  misp-modules:
    image: coolacid/misp-docker:modules-latest
    container_name: misp-modules
    restart: always
    environment:
      REDIS_HOST: misp-redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    networks:
      - misp-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6666/modules"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  misp-network:
    driver: bridge

volumes:
  mysql:
  redis:
```

### Arquivo de Variáveis de Ambiente

Crie o arquivo `.env` com as configurações:

```bash title="/opt/misp/.env"
# MySQL Configuration
MYSQL_ROOT_PASSWORD=change_this_strong_root_password
MYSQL_DATABASE=misp
MYSQL_USER=misp
MYSQL_PASSWORD=change_this_strong_misp_password

# Redis Configuration
REDIS_PASSWORD=change_this_strong_redis_password

# MISP Base Configuration
MISP_BASEURL=https://misp.exemplo.com
MISP_UUID=your-unique-uuid-here  # Gerar com: uuidgen
MISP_ORG=Nome da Sua Organização
MISP_EMAIL=admin@exemplo.com
MISP_ADMIN_EMAIL=admin@exemplo.com
MISP_ADMIN_PASSPHRASE=change_this_admin_password

# Security Keys (gerar com: openssl rand -base64 32)
SECURITY_SALT=your_random_salt_here
SECURITY_ENCRYPTION_KEY=your_random_encryption_key_here

# SMTP Configuration
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USERNAME=misp@exemplo.com
SMTP_PASSWORD=smtp_password
SMTP_FROM=misp@exemplo.com
SMTP_TLS=true
```

!!! danger "Segurança Crítica"
    **NUNCA use as senhas de exemplo em produção!**

    Gere senhas fortes:
    ```bash
    # Gerar UUID
    uuidgen

    # Gerar senhas fortes
    openssl rand -base64 32

    # Ou usar pwgen
    pwgen -s 32 1
    ```

### Gerar Valores de Configuração

Execute os seguintes comandos para gerar valores seguros:

```bash
# Gerar UUID único para sua instância MISP
MISP_UUID=$(uuidgen | tr '[:upper:]' '[:lower:]')
echo "MISP_UUID=$MISP_UUID"

# Gerar senhas fortes
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
MYSQL_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
SECURITY_SALT=$(openssl rand -base64 32)
SECURITY_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Exibir (copie para .env)
echo "MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD"
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo "SECURITY_SALT=$SECURITY_SALT"
echo "SECURITY_ENCRYPTION_KEY=$SECURITY_ENCRYPTION_KEY"

# Ou salvar diretamente
cat > /opt/misp/.env.secrets << EOF
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_PASSWORD=$MYSQL_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
SECURITY_SALT=$SECURITY_SALT
SECURITY_ENCRYPTION_KEY=$SECURITY_ENCRYPTION_KEY
EOF

chmod 600 /opt/misp/.env.secrets
```

### Iniciar o MISP

Agora inicie os containers:

```bash
cd /opt/misp

# Pull das imagens
docker compose pull

# Iniciar em background
docker compose up -d

# Acompanhar logs
docker compose logs -f misp

# Aguardar inicialização (pode levar 2-5 minutos)
# Aguarde até ver: "MISP initialization complete"
```

### Verificar Status

```bash
# Status dos containers
docker compose ps

# Deve mostrar:
# NAME            STATUS          PORTS
# misp            Up (healthy)    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# misp-db         Up (healthy)
# misp-redis      Up (healthy)
# misp-workers    Up
# misp-modules    Up (healthy)

# Logs de cada serviço
docker compose logs misp
docker compose logs misp-db
docker compose logs misp-redis
docker compose logs misp-workers

# Verificar saúde
docker compose exec misp curl -f http://localhost/users/login
```

### Primeiro Acesso

Acesse o MISP no navegador:

```
URL: http://seu-servidor ou https://misp.exemplo.com
Usuário: admin@admin.test (usuário padrão)
Senha: admin (senha padrão)
```

!!! warning "IMPORTANTE: Trocar Credenciais Padrão"
    **IMEDIATAMENTE após o primeiro login:**

    1. Clique no menu **Administration** > **List Users**
    2. Edite o usuário `admin@admin.test`
    3. Altere o email para seu email real
    4. Altere a senha para uma senha forte
    5. Salve as alterações

## Configuração de MySQL/MariaDB

### Otimização de Performance

Crie um arquivo de configuração customizada:

```ini title="/opt/misp/mysql-config/my.cnf"
[mysqld]
# Performance
max_connections = 200
innodb_buffer_pool_size = 2G  # 50-70% da RAM disponível
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Charset
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Query Cache (desabilitado no MySQL 8.0+, mas útil em versões antigas)
# query_cache_type = 1
# query_cache_size = 128M

# Timeouts
wait_timeout = 600
interactive_timeout = 600

# Logs
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2

# Binary Logs para Backup
log_bin = /var/log/mysql/mysql-bin.log
binlog_expire_logs_seconds = 604800  # 7 dias
max_binlog_size = 100M
```

Adicione ao `docker-compose.yml`:

```yaml
  misp-db:
    # ... (configuração existente)
    volumes:
      - ./mysql:/var/lib/mysql
      - ./mysql-config/my.cnf:/etc/mysql/conf.d/custom.cnf:ro
      - ./mysql-logs:/var/log/mysql
```

### Backup e Restore

=== "Backup"
    ```bash
    # Backup completo do database
    docker compose exec misp-db mysqldump \
      -u root -p${MYSQL_ROOT_PASSWORD} \
      --single-transaction \
      --quick \
      --lock-tables=false \
      misp > /opt/misp/backups/misp-$(date +%Y%m%d-%H%M%S).sql

    # Backup com compressão
    docker compose exec misp-db mysqldump \
      -u root -p${MYSQL_ROOT_PASSWORD} \
      --single-transaction \
      --quick \
      misp | gzip > /opt/misp/backups/misp-$(date +%Y%m%d-%H%M%S).sql.gz

    # Script de backup automatizado
    cat > /opt/misp/scripts/backup-database.sh << 'EOF'
    #!/bin/bash
    BACKUP_DIR="/opt/misp/backups"
    RETENTION_DAYS=30
    DATE=$(date +%Y%m%d-%H%M%S)

    mkdir -p $BACKUP_DIR

    docker compose -f /opt/misp/docker-compose.yml exec -T misp-db mysqldump \
      -u root -p${MYSQL_ROOT_PASSWORD} \
      --single-transaction \
      --quick \
      misp | gzip > $BACKUP_DIR/misp-$DATE.sql.gz

    # Remover backups antigos
    find $BACKUP_DIR -name "misp-*.sql.gz" -mtime +$RETENTION_DAYS -delete

    echo "Backup concluído: misp-$DATE.sql.gz"
    EOF

    chmod +x /opt/misp/scripts/backup-database.sh

    # Adicionar ao crontab (backup diário às 2am)
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/misp/scripts/backup-database.sh") | crontab -
    ```

=== "Restore"
    ```bash
    # Parar MISP
    docker compose stop misp misp-workers

    # Restore do backup
    gunzip < /opt/misp/backups/misp-20250105-020000.sql.gz | \
      docker compose exec -T misp-db mysql \
      -u root -p${MYSQL_ROOT_PASSWORD} misp

    # Ou sem compressão
    docker compose exec -T misp-db mysql \
      -u root -p${MYSQL_ROOT_PASSWORD} misp < /opt/misp/backups/misp-20250105-020000.sql

    # Reiniciar MISP
    docker compose start misp misp-workers
    ```

## Configuração de Redis

### Configuração Avançada

Crie arquivo de configuração do Redis:

```conf title="/opt/misp/redis-config/redis.conf"
# Network
bind 0.0.0.0
protected-mode yes
port 6379
requirepass your_redis_password_here

# Persistence
save 900 1       # Salvar se pelo menos 1 key mudou em 900s
save 300 10      # Salvar se pelo menos 10 keys mudaram em 300s
save 60 10000    # Salvar se pelo menos 10000 keys mudaram em 60s

appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# Performance
maxmemory 1gb
maxmemory-policy allkeys-lru

# Logs
loglevel notice
logfile "/var/log/redis/redis.log"

# Slow log
slowlog-log-slower-than 10000  # 10ms
slowlog-max-len 128
```

Atualize o `docker-compose.yml`:

```yaml
  misp-redis:
    # ... (configuração existente)
    volumes:
      - ./redis:/data
      - ./redis-config/redis.conf:/etc/redis/redis.conf:ro
      - ./redis-logs:/var/log/redis
    command: redis-server /etc/redis/redis.conf
```

### Monitoramento do Redis

```bash
# Conectar ao Redis CLI
docker compose exec misp-redis redis-cli -a ${REDIS_PASSWORD}

# Comandos úteis no Redis CLI:
# INFO                  # Informações gerais
# INFO stats            # Estatísticas
# INFO memory           # Uso de memória
# DBSIZE                # Número de keys
# SLOWLOG GET 10        # Últimas 10 queries lentas
# MONITOR               # Monitorar comandos em tempo real (cuidado em produção!)
```

## Configuração de Workers

Os **workers** do MISP processam tarefas em background como:

- Correlação de attributes
- Export de feeds
- Import de dados
- Envio de emails
- Processamento de eventos

### Configuração de Workers

```bash
# Acessar container do MISP
docker compose exec misp bash

# Verificar status dos workers
/var/www/MISP/app/Console/cake Admin getSetting MISP.workers

# Configurar número de workers (via interface web)
# Administration > Server Settings & Maintenance > Workers
# Ou via CLI:
/var/www/MISP/app/Console/cake Admin setSetting MISP.workers 5

# Tipos de workers:
# - default: Tarefas gerais
# - email: Envio de emails
# - cache: Limpeza de cache
# - prio: Tarefas prioritárias
# - update: Atualizações
```

### Monitorar Workers

=== "Via Web"
    ```
    Acesse: Administration > Jobs
    - Mostra jobs em execução
    - Mostra jobs na fila
    - Mostra jobs com erro
    - Permite reiniciar jobs
    ```

=== "Via CLI"
    ```bash
    # Status dos workers
    docker compose exec misp /var/www/MISP/app/Console/cake Admin worker_status

    # Iniciar workers
    docker compose exec misp /var/www/MISP/app/Console/cake Admin worker_start all

    # Parar workers
    docker compose exec misp /var/www/MISP/app/Console/cake Admin worker_stop all

    # Reiniciar workers
    docker compose exec misp /var/www/MISP/app/Console/cake Admin worker_restart all
    ```

### Troubleshooting Workers

```bash
# Logs dos workers
docker compose logs misp-workers

# Jobs travados (limpar)
docker compose exec misp /var/www/MISP/app/Console/cake Admin clearQueue all

# Reprocessar job específico
docker compose exec misp /var/www/MISP/app/Console/cake Admin jobRetry <job_id>
```

## Configuração de GPG para Assinatura

GPG é usado para assinar eventos no MISP, garantindo autenticidade e integridade.

```bash
# Gerar chave GPG dentro do container
docker compose exec misp bash

# Gerar chave
gpg --full-generate-key

# Opções:
# 1) RSA and RSA (default)
# 4096 bits
# Key does not expire (0)
# Nome: MISP Instance - Nome da Sua Org
# Email: misp@exemplo.com
# Comment: MISP GPG Signing Key

# Exportar chave pública
gpg --armor --export misp@exemplo.com > /var/www/MISP/.gnupg/public.key

# Obter fingerprint
gpg --fingerprint misp@exemplo.com

# Configurar no MISP (via web):
# Administration > Server Settings & Maintenance > GnuPG
# - GnuPG.email: misp@exemplo.com
# - GnuPG.homedir: /var/www/MISP/.gnupg
# - GnuPG.password: (senha da chave, se configurada)
```

## Configuração de HTTPS

### Gerar Certificado SSL

=== "Let's Encrypt (Recomendado)"
    ```bash
    # Instalar certbot
    sudo apt-get install certbot

    # Obter certificado (HTTP challenge - requer porta 80 aberta)
    sudo certbot certonly --standalone \
      -d misp.exemplo.com \
      --email admin@exemplo.com \
      --agree-tos \
      --non-interactive

    # Certificados gerados em:
    # /etc/letsencrypt/live/misp.exemplo.com/

    # Copiar para diretório do MISP
    sudo cp /etc/letsencrypt/live/misp.exemplo.com/fullchain.pem \
      /opt/misp/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/misp.exemplo.com/privkey.pem \
      /opt/misp/ssl/key.pem

    # Ajustar permissões
    sudo chown $(id -u):$(id -g) /opt/misp/ssl/*.pem
    chmod 644 /opt/misp/ssl/cert.pem
    chmod 600 /opt/misp/ssl/key.pem

    # Auto-renovação (certbot já cria cronjob)
    # Adicionar hook para copiar certificados renovados:
    cat > /etc/letsencrypt/renewal-hooks/deploy/misp-copy.sh << 'EOF'
    #!/bin/bash
    cp /etc/letsencrypt/live/misp.exemplo.com/fullchain.pem /opt/misp/ssl/cert.pem
    cp /etc/letsencrypt/live/misp.exemplo.com/privkey.pem /opt/misp/ssl/key.pem
    docker restart misp
    EOF

    chmod +x /etc/letsencrypt/renewal-hooks/deploy/misp-copy.sh
    ```

=== "Certificado Auto-assinado"
    ```bash
    # Gerar certificado auto-assinado (apenas para teste/desenvolvimento)
    openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
      -keyout /opt/misp/ssl/key.pem \
      -out /opt/misp/ssl/cert.pem \
      -subj "/C=BR/ST=SP/L=Sao Paulo/O=Minha Org/CN=misp.exemplo.com"

    # Ajustar permissões
    chmod 644 /opt/misp/ssl/cert.pem
    chmod 600 /opt/misp/ssl/key.pem
    ```

### Configurar Nginx/Apache no Container

O container `coolacid/misp-docker` já vem com Nginx configurado. Os certificados em `/opt/misp/ssl` são montados no container.

Reinicie o MISP:

```bash
docker compose restart misp
```

Acesse: `https://misp.exemplo.com`

## Configuração de Email (SMTP)

### Configuração Básica

Edite o arquivo `.env` e configure as variáveis SMTP:

```bash
SMTP_HOST=smtp.gmail.com        # ou seu servidor SMTP
SMTP_PORT=587                   # 587 para TLS, 465 para SSL, 25 para não criptografado
SMTP_USERNAME=misp@exemplo.com
SMTP_PASSWORD=sua_senha_smtp
SMTP_FROM=misp@exemplo.com
SMTP_TLS=true                   # true para TLS/STARTTLS
```

### Exemplos de Configuração por Provedor

=== "Gmail"
    ```bash
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USERNAME=seuemail@gmail.com
    SMTP_PASSWORD=senha_de_aplicativo  # Criar em: https://myaccount.google.com/apppasswords
    SMTP_FROM=seuemail@gmail.com
    SMTP_TLS=true
    ```

=== "Microsoft 365"
    ```bash
    SMTP_HOST=smtp.office365.com
    SMTP_PORT=587
    SMTP_USERNAME=seuemail@empresa.com
    SMTP_PASSWORD=sua_senha
    SMTP_FROM=seuemail@empresa.com
    SMTP_TLS=true
    ```

=== "SendGrid"
    ```bash
    SMTP_HOST=smtp.sendgrid.net
    SMTP_PORT=587
    SMTP_USERNAME=apikey
    SMTP_PASSWORD=sua_api_key_sendgrid
    SMTP_FROM=misp@exemplo.com
    SMTP_TLS=true
    ```

=== "Amazon SES"
    ```bash
    SMTP_HOST=email-smtp.us-east-1.amazonaws.com
    SMTP_PORT=587
    SMTP_USERNAME=seu_smtp_username_ses
    SMTP_PASSWORD=seu_smtp_password_ses
    SMTP_FROM=misp@exemplo.com
    SMTP_TLS=true
    ```

### Testar Envio de Email

```bash
# Acessar container
docker compose exec misp bash

# Testar envio via CLI
/var/www/MISP/app/Console/cake Admin sendTestEmail admin@exemplo.com

# Verificar logs de email
tail -f /var/www/MISP/app/tmp/logs/email-*.log
```

## Hardening de Segurança

### 1. Firewall

Configure firewall para permitir apenas portas necessárias:

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirecionar para HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Bloquear acesso direto ao MySQL e Redis
# (já estão na rede Docker interna)
```

### 2. Fail2Ban para MISP

Proteja contra brute-force de login:

```bash
# Instalar fail2ban
sudo apt-get install fail2ban

# Criar filtro do MISP
sudo tee /etc/fail2ban/filter.d/misp.conf << 'EOF'
[Definition]
failregex = ^.*Authentication failed for .*\[<HOST>\]$
            ^.*Failed authentication using.*\[<HOST>\]$
ignoreregex =
EOF

# Criar jail do MISP
sudo tee /etc/fail2ban/jail.d/misp.conf << 'EOF'
[misp]
enabled = true
port = 80,443
filter = misp
logpath = /opt/misp/misp-logs/error.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

# Reiniciar fail2ban
sudo systemctl restart fail2ban

# Verificar status
sudo fail2ban-client status misp
```

### 3. Configurações de Segurança no MISP

Acesse: **Administration > Server Settings & Maintenance > Security**

```yaml
Configurações Recomendadas:

Security.require_password_confirmation: true
  - Requer confirmação de senha para ações sensíveis

Security.password_policy_length: 12
  - Mínimo 12 caracteres para senhas

Security.password_policy_complexity: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{12,}$/
  - Requer maiúsculas, minúsculas e números

Security.advanced_authkeys: true
  - Permite múltiplas API keys por usuário

Security.do_not_log_authkeys: true
  - Não registrar API keys em logs

Security.disable_browser_cache: true
  - Desabilitar cache do navegador

Security.check_sec_fetch_site_header: true
  - Validar headers Sec-Fetch-Site

Security.csp_enforce: true
  - Content Security Policy

Security.login_lock_time: 300
  - Bloquear conta por 5min após falhas
```

### 4. RBAC (Role-Based Access Control)

Configure roles adequadas:

```yaml
Roles Sugeridas:

1. Admin:
   - Permissões completas
   - Apenas 1-2 pessoas

2. Org Admin:
   - Gerenciar usuários da organização
   - Criar/editar eventos da org
   - Não pode modificar settings globais

3. Publisher:
   - Criar e publicar eventos
   - Adicionar attributes e objects
   - Sincronizar eventos

4. User:
   - Visualizar eventos
   - Adicionar sightings
   - Fazer proposals (sugestões)

5. Sync User:
   - Apenas para sincronização entre instâncias
   - API access only
   - Permissões de pull/push configuráveis

6. Read Only:
   - Apenas visualização
   - Para auditoria, SOC Tier 1, etc
```

Criar roles: **Administration > Roles > Add Role**

## Performance Tuning

### 1. Índices do Database

```bash
# Acessar MySQL
docker compose exec misp-db mysql -u root -p${MYSQL_ROOT_PASSWORD} misp

# Verificar índices
SHOW INDEX FROM attributes;
SHOW INDEX FROM events;

# Índices recomendados (geralmente já existem):
# attributes: (event_id, type, value, deleted)
# events: (date, org_id, published)
# correlations: (attribute_id, 1_attribute_id)
```

### 2. Otimização de Queries

Acesse: **Administration > Server Settings & Maintenance > Diagnostics**

```bash
# Via CLI - otimizar correlações
docker compose exec misp /var/www/MISP/app/Console/cake Admin updateCorrelations

# Limpar dados antigos/não utilizados
docker compose exec misp /var/www/MISP/app/Console/cake Admin pruneCached orphaned

# Limpar logs antigos
docker compose exec misp /var/www/MISP/app/Console/cake Admin pruneLogs 90  # 90 dias
```

### 3. Tuning de Workers

```yaml
Configuração Recomendada:

Ambiente | CPU Cores | RAM  | Workers
---------|-----------|------|--------
Small    | 2         | 4GB  | 2-3
Medium   | 4         | 8GB  | 5
Large    | 8         | 16GB | 10
Xlarge   | 16+       | 32GB | 20

# Configurar via web:
Administration > Server Settings & Maintenance > Workers
MISP.workers: <número adequado>
```

### 4. Caching Agressivo

```bash
# Configurar Redis caching
# Administration > Server Settings & Maintenance > Cache

Redis.host: misp-redis
Redis.port: 6379
Redis.password: <sua_senha_redis>

# Habilitar cache
MISP.enable_advanced_correlations_caching: true
MISP.cached_attachments: true
```

## Troubleshooting

### Problemas Comuns

=== "Container não inicia"
    ```bash
    # Verificar logs
    docker compose logs misp

    # Problemas comuns:
    # 1. Porta já em uso
    sudo lsof -i :80
    sudo lsof -i :443

    # 2. Permissões de volumes
    sudo chown -R 33:33 /opt/misp/misp-files  # www-data UID/GID
    sudo chown -R 33:33 /opt/misp/misp-logs

    # 3. Memória insuficiente
    docker stats
    # Verificar se há memória disponível
    ```

=== "Erro de conexão com database"
    ```bash
    # Verificar se database está UP
    docker compose ps misp-db

    # Testar conexão manualmente
    docker compose exec misp-db mysql -u misp -p${MYSQL_PASSWORD} misp

    # Verificar variáveis de ambiente
    docker compose exec misp env | grep MYSQL
    ```

=== "Workers não processam jobs"
    ```bash
    # Verificar se workers estão rodando
    docker compose ps misp-workers

    # Verificar logs
    docker compose logs misp-workers

    # Reiniciar workers
    docker compose restart misp-workers

    # Limpar fila travada
    docker compose exec misp /var/www/MISP/app/Console/cake Admin clearQueue all
    ```

=== "Erro 500 Internal Server Error"
    ```bash
    # Verificar logs do Apache/Nginx
    docker compose exec misp tail -f /var/log/nginx/error.log

    # Verificar logs do MISP
    docker compose exec misp tail -f /var/www/MISP/app/tmp/logs/error.log

    # Verificar permissões
    docker compose exec misp ls -la /var/www/MISP/app/tmp
    docker compose exec misp ls -la /var/www/MISP/app/files
    ```

=== "Lentidão extrema"
    ```bash
    # Verificar uso de recursos
    docker stats

    # Verificar slow queries no MySQL
    docker compose exec misp-db mysql -u root -p${MYSQL_ROOT_PASSWORD} \
      -e "SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;"

    # Verificar tamanho do database
    docker compose exec misp-db mysql -u root -p${MYSQL_ROOT_PASSWORD} \
      -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)' \
          FROM information_schema.TABLES WHERE table_schema = 'misp' \
          ORDER BY (data_length + index_length) DESC;"

    # Otimizar tables
    docker compose exec misp-db mysqlcheck -u root -p${MYSQL_ROOT_PASSWORD} --optimize misp
    ```

### Logs Importantes

```bash
# Logs do container MISP
docker compose logs -f misp

# Logs de erro do MISP
docker compose exec misp tail -f /var/www/MISP/app/tmp/logs/error.log

# Logs de acesso
docker compose exec misp tail -f /var/log/nginx/access.log

# Logs de workers
docker compose logs -f misp-workers

# Logs do MySQL
docker compose logs -f misp-db

# Logs de email
docker compose exec misp tail -f /var/www/MISP/app/tmp/logs/email-*.log
```

### Comandos Úteis de Manutenção

```bash
# Limpar cache
docker compose exec misp /var/www/MISP/app/Console/cake Admin clearCache

# Reindexar correlações
docker compose exec misp /var/www/MISP/app/Console/cake Admin updateCorrelations

# Atualizar taxonomies
docker compose exec misp /var/www/MISP/app/Console/cake Admin updateTaxonomies

# Atualizar galaxy clusters
docker compose exec misp /var/www/MISP/app/Console/cake Admin updateGalaxies

# Atualizar warninglists
docker compose exec misp /var/www/MISP/app/Console/cake Admin updateWarningLists

# Atualizar notice lists
docker compose exec misp /var/www/MISP/app/Console/cake Admin updateNoticeLists

# Atualizar object templates
docker compose exec misp /var/www/MISP/app/Console/cake Admin updateObjectTemplates
```

## Próximos Passos

Agora que você tem o MISP instalado e configurado:

1. **[Gestão de Threat Intelligence](threat-intelligence.md)** - Aprender a criar eventos, attributes e objects
2. **[Compartilhamento](sharing.md)** - Configurar sharing groups e sincronização
3. **[Integração com Stack](integration-stack.md)** - Integrar MISP com Wazuh, TheHive, Shuffle
4. **[Casos de Uso](use-cases.md)** - Exemplos práticos de uso

!!! tip "Checklist Pós-Instalação"
    - [ ] Trocar senha padrão do admin
    - [ ] Configurar HTTPS com certificado válido
    - [ ] Configurar SMTP para envio de emails
    - [ ] Criar usuários e roles adequadas
    - [ ] Atualizar taxonomies, galaxies, warninglists
    - [ ] Configurar backup automatizado
    - [ ] Testar conectividade de rede
    - [ ] Documentar credenciais em vault seguro
    - [ ] Configurar monitoramento (opcional: Prometheus, Grafana)

---

**Documentação**: NEO_NETBOX_ODOO Stack - MISP
**Versão**: 1.0
**Última Atualização**: 2025-12-05
