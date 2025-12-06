# Instalación y Configuración de MISP

## Introducción

Esta guía proporciona instrucciones detalladas para instalar y configurar MISP dentro del stack NEO_NETBOX_ODOO. Utilizaremos **Docker Compose** para una instalación limpia, reproducible y fácil de mantener.

!!! warning "Antes de Comenzar"
    - Esta instalación requiere conocimientos básicos de Docker y Linux
    - Tiempo estimado: 1-2 horas
    - Se requiere acceso root/sudo
    - Mínimo 4 GB RAM disponibles
    - 50+ GB de espacio en disco

## Prerrequisitos Detallados

### Requisitos de Hardware

| Componente | Mínimo | Recomendado | Producción |
|------------|--------|-------------|------------|
| **CPU** | 2 cores | 4 cores | 8+ cores |
| **RAM** | 4 GB | 8 GB | 16+ GB |
| **Disco** | 50 GB | 100 GB SSD | 500+ GB SSD |
| **Red** | 100 Mbps | 1 Gbps | 10 Gbps |

### Requisitos de Software

=== "Sistema Operativo"
    ```bash
    # Ubuntu 22.04 LTS (Recomendado)
    Ubuntu 22.04.3 LTS

    # Alternativas soportadas
    - Ubuntu 20.04 LTS
    - Debian 11 (Bullseye)
    - Debian 12 (Bookworm)
    - RHEL 8/9
    - Rocky Linux 8/9
    ```

=== "Docker"
    ```bash
    # Versión mínima requerida
    Docker Engine: 20.10+
    Docker Compose: 2.0+

    # Verificar versiones instaladas
    docker --version
    docker compose version
    ```

=== "Herramientas del Sistema"
    ```bash
    # Herramientas necesarias
    sudo apt update
    sudo apt install -y \
      curl \
      wget \
      git \
      openssl \
      gnupg \
      ca-certificates \
      net-tools \
      htop
    ```

### Verificación de Prerrequisitos

```bash
#!/bin/bash
# Script de verificación de prerrequisitos

echo "=== Verificando Prerrequisitos de MISP ==="

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker instalado: $(docker --version)"
else
    echo "❌ Docker NO instalado"
fi

# Check Docker Compose
if docker compose version &> /dev/null; then
    echo "✅ Docker Compose instalado: $(docker compose version)"
else
    echo "❌ Docker Compose NO instalado"
fi

# Check RAM
TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -ge 4 ]; then
    echo "✅ RAM suficiente: ${TOTAL_RAM}GB"
else
    echo "⚠️  RAM insuficiente: ${TOTAL_RAM}GB (mínimo 4GB recomendado)"
fi

# Check Disk Space
DISK_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_SPACE" -ge 50 ]; then
    echo "✅ Espacio en disco suficiente: ${DISK_SPACE}GB"
else
    echo "⚠️  Espacio en disco insuficiente: ${DISK_SPACE}GB (mínimo 50GB recomendado)"
fi

# Check Ports
PORTS=(80 443 3306 6379)
for PORT in "${PORTS[@]}"; do
    if ! ss -tuln | grep -q ":$PORT "; then
        echo "✅ Puerto $PORT disponible"
    else
        echo "⚠️  Puerto $PORT en uso"
    fi
done

echo "=== Verificación Completa ==="
```

## Instalación via Docker Compose

### Estructura del Proyecto

Crearemos la siguiente estructura de directorios:

```bash
/opt/misp/
├── docker-compose.yml
├── .env
├── config/
│   ├── nginx/
│   │   └── misp.conf
│   ├── ssl/
│   │   ├── misp.crt
│   │   └── misp.key
│   └── misp/
│       ├── config.php
│       └── bootstrap.php
├── data/
│   ├── mysql/
│   ├── redis/
│   ├── files/
│   └── logs/
└── backups/
```

### Paso 1: Crear Estructura de Directorios

```bash
# Crear directorio base
sudo mkdir -p /opt/misp
cd /opt/misp

# Crear subdirectorios
sudo mkdir -p config/{nginx,ssl,misp}
sudo mkdir -p data/{mysql,redis,files,logs}
sudo mkdir -p backups

# Establecer permisos
sudo chown -R $USER:$USER /opt/misp
chmod -R 755 /opt/misp
```

### Paso 2: Configurar Variables de Entorno

Crear archivo `/opt/misp/.env`:

```bash
# Archivo: /opt/misp/.env

# ============================================
# MISP Configuration
# ============================================

# Versión de MISP
MISP_TAG=v2.4.183

# Dominio y URL
MISP_BASEURL=https://misp.tu-empresa.com
MISP_DOMAIN=misp.tu-empresa.com

# ============================================
# Database Configuration
# ============================================

MYSQL_ROOT_PASSWORD=cambiar_password_root_mysql_seguro_123
MYSQL_DATABASE=misp
MYSQL_USER=misp
MYSQL_PASSWORD=cambiar_password_misp_mysql_seguro_456

# ============================================
# Redis Configuration
# ============================================

REDIS_PASSWORD=cambiar_password_redis_seguro_789

# ============================================
# MISP Admin Configuration
# ============================================

MISP_ADMIN_EMAIL=admin@tu-empresa.com
MISP_ADMIN_PASSWORD=cambiar_password_admin_seguro_ABC
MISP_ADMIN_ORG=Tu Organización
MISP_ADMIN_KEY=cambiar_api_key_larga_segura_DEF123456789

# ============================================
# Email Configuration (SMTP)
# ============================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=notificaciones@tu-empresa.com
SMTP_PASSWORD=cambiar_password_smtp
SMTP_FROM=misp@tu-empresa.com
SMTP_TLS=true

# ============================================
# Security Configuration
# ============================================

# Salt para passwords (generar con: openssl rand -base64 32)
SECURITY_SALT=cambiar_salt_aleatorio_muy_largo_GHI

# GPG Key para firma de exportaciones
GPG_EMAIL=misp@tu-empresa.com
GPG_PASSPHRASE=cambiar_passphrase_gpg_JKL

# ============================================
# Timezone
# ============================================

TIMEZONE=America/Mexico_City

# ============================================
# Performance
# ============================================

PHP_MEMORY_LIMIT=512M
PHP_MAX_EXECUTION_TIME=300
PHP_UPLOAD_MAX_FILESIZE=50M

# Workers
MISP_WORKERS_DEFAULT=2
MISP_WORKERS_EMAIL=1
MISP_WORKERS_CACHE=1
MISP_WORKERS_PRIO=1
MISP_WORKERS_UPDATE=1

# ============================================
# Network
# ============================================

# Red Docker
NETWORK_SUBNET=172.28.0.0/16
MISP_IP=172.28.0.10
MYSQL_IP=172.28.0.11
REDIS_IP=172.28.0.12
```

!!! danger "Seguridad Crítica"
    **NUNCA** dejes los passwords por defecto. Genera passwords fuertes:
    ```bash
    # Generar passwords seguros
    openssl rand -base64 32

    # Generar API key
    openssl rand -hex 40
    ```

### Paso 3: Crear Docker Compose File

Crear archivo `/opt/misp/docker-compose.yml`:

```yaml
# Archivo: /opt/misp/docker-compose.yml

version: '3.8'

services:
  # ============================================
  # MySQL Database
  # ============================================
  misp-db:
    image: mariadb:10.11
    container_name: misp-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      TZ: ${TIMEZONE}
    volumes:
      - ./data/mysql:/var/lib/mysql
      - ./backups:/backups
    networks:
      misp-network:
        ipv4_address: ${MYSQL_IP}
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --max-allowed-packet=64M
      - --innodb-buffer-pool-size=512M
      - --innodb-log-file-size=128M
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 30s
      timeout: 10s
      retries: 5

  # ============================================
  # Redis Cache
  # ============================================
  misp-redis:
    image: redis:7-alpine
    container_name: misp-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - ./data/redis:/data
    networks:
      misp-network:
        ipv4_address: ${REDIS_IP}
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # ============================================
  # MISP Core Application
  # ============================================
  misp-core:
    image: ghcr.io/misp/misp-docker/misp-core:${MISP_TAG}
    container_name: misp-core
    restart: unless-stopped
    depends_on:
      misp-db:
        condition: service_healthy
      misp-redis:
        condition: service_healthy
    environment:
      # Base Configuration
      MISP_BASEURL: ${MISP_BASEURL}
      MISP_FQDN: ${MISP_DOMAIN}
      TZ: ${TIMEZONE}

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

      # Admin
      MISP_ADMIN_EMAIL: ${MISP_ADMIN_EMAIL}
      MISP_ADMIN_PASSWORD: ${MISP_ADMIN_PASSWORD}
      MISP_ADMIN_ORG: ${MISP_ADMIN_ORG}
      MISP_ADMIN_KEY: ${MISP_ADMIN_KEY}

      # Email
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USERNAME: ${SMTP_USERNAME}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM: ${SMTP_FROM}
      SMTP_TLS: ${SMTP_TLS}

      # Security
      SECURITY_SALT: ${SECURITY_SALT}
      GPG_EMAIL: ${GPG_EMAIL}
      GPG_PASSPHRASE: ${GPG_PASSPHRASE}

      # PHP
      PHP_MEMORY_LIMIT: ${PHP_MEMORY_LIMIT}
      PHP_MAX_EXECUTION_TIME: ${PHP_MAX_EXECUTION_TIME}
      PHP_UPLOAD_MAX_FILESIZE: ${PHP_UPLOAD_MAX_FILESIZE}

      # Workers
      WORKERS_DEFAULT: ${MISP_WORKERS_DEFAULT}
      WORKERS_EMAIL: ${MISP_WORKERS_EMAIL}
      WORKERS_CACHE: ${MISP_WORKERS_CACHE}
      WORKERS_PRIO: ${MISP_WORKERS_PRIO}
      WORKERS_UPDATE: ${MISP_WORKERS_UPDATE}

    volumes:
      - ./data/files:/var/www/MISP/app/files
      - ./data/logs:/var/www/MISP/app/tmp/logs
      - ./config/misp:/var/www/MISP/app/Config/custom
    networks:
      misp-network:
        ipv4_address: ${MISP_IP}
    ports:
      - "80:80"
      - "443:443"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/users/login"]
      interval: 60s
      timeout: 10s
      retries: 5
      start_period: 120s

  # ============================================
  # MISP Modules (Expansion, Export, Import)
  # ============================================
  misp-modules:
    image: ghcr.io/misp/misp-docker/misp-modules:latest
    container_name: misp-modules
    restart: unless-stopped
    environment:
      REDIS_HOST: misp-redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    networks:
      - misp-network
    depends_on:
      - misp-redis

  # ============================================
  # MISP Workers (Background Tasks)
  # ============================================
  misp-workers:
    image: ghcr.io/misp/misp-docker/misp-core:${MISP_TAG}
    container_name: misp-workers
    restart: unless-stopped
    depends_on:
      - misp-core
    environment:
      MYSQL_HOST: misp-db
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      REDIS_HOST: misp-redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    volumes:
      - ./data/files:/var/www/MISP/app/files
      - ./data/logs:/var/www/MISP/app/tmp/logs
    networks:
      - misp-network
    command: /var/www/MISP/app/Console/worker/start.sh

networks:
  misp-network:
    driver: bridge
    ipam:
      config:
        - subnet: ${NETWORK_SUBNET}

volumes:
  mysql-data:
  redis-data:
  misp-files:
```

### Paso 4: Generar Certificados SSL

=== "Certificado Autofirmado (Desarrollo)"
    ```bash
    # Generar certificado autofirmado
    cd /opt/misp/config/ssl

    openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
      -keyout misp.key \
      -out misp.crt \
      -subj "/C=MX/ST=CDMX/L=Ciudad de Mexico/O=Tu Empresa/OU=IT/CN=misp.tu-empresa.com"

    # Verificar certificado
    openssl x509 -in misp.crt -text -noout
    ```

=== "Let's Encrypt (Producción)"
    ```bash
    # Instalar certbot
    sudo apt install -y certbot

    # Obtener certificado (requiere DNS configurado)
    sudo certbot certonly --standalone \
      -d misp.tu-empresa.com \
      --email admin@tu-empresa.com \
      --agree-tos \
      --no-eff-email

    # Copiar certificados
    sudo cp /etc/letsencrypt/live/misp.tu-empresa.com/fullchain.pem /opt/misp/config/ssl/misp.crt
    sudo cp /etc/letsencrypt/live/misp.tu-empresa.com/privkey.pem /opt/misp/config/ssl/misp.key

    # Ajustar permisos
    sudo chown $USER:$USER /opt/misp/config/ssl/*
    chmod 600 /opt/misp/config/ssl/misp.key
    ```

=== "Certificado Corporativo"
    ```bash
    # Si tienes certificado de tu CA corporativa
    cp /ruta/a/certificado.crt /opt/misp/config/ssl/misp.crt
    cp /ruta/a/llave-privada.key /opt/misp/config/ssl/misp.key

    # Si tienes cadena de certificados
    cat certificado.crt ca-intermedia.crt ca-raiz.crt > /opt/misp/config/ssl/misp.crt
    ```

### Paso 5: Iniciar MISP

```bash
# Navegar al directorio de MISP
cd /opt/misp

# Validar docker-compose.yml
docker compose config

# Descargar imágenes
docker compose pull

# Iniciar servicios
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Esperar a que MISP esté listo (puede tomar 2-5 minutos)
echo "Esperando a que MISP inicie..."
until docker exec misp-core curl -sf http://localhost/users/login > /dev/null; do
    echo -n "."
    sleep 5
done
echo ""
echo "✅ MISP está listo!"
```

### Paso 6: Verificar Instalación

```bash
# Verificar estado de contenedores
docker compose ps

# Debe mostrar:
# NAME            STATUS          PORTS
# misp-core       Up (healthy)    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# misp-db         Up (healthy)
# misp-redis      Up (healthy)
# misp-modules    Up
# misp-workers    Up

# Verificar logs sin errores
docker compose logs misp-core | grep -i error

# Test de conectividad
curl -k https://localhost/users/login
```

## Configuración Inicial de MISP

### Primer Acceso

1. **Abrir navegador**: `https://misp.tu-empresa.com` (o IP del servidor)

2. **Login inicial**:
   ```
   Email:    admin@tu-empresa.com (valor de MISP_ADMIN_EMAIL)
   Password: [valor de MISP_ADMIN_PASSWORD]
   ```

3. **Cambiar password** (obligatorio en primer login):
   - MISP forzará cambio de password
   - Usar password fuerte (12+ caracteres, mayúsculas, minúsculas, números, símbolos)

### Configuración Básica via Web UI

#### 1. Server Settings

Navegar a: **Administration** → **Server Settings & Maintenance**

=== "MISP Settings"
    ```yaml
    MISP.baseurl: https://misp.tu-empresa.com
    MISP.external_baseurl: https://misp.tu-empresa.com
    MISP.host_org_id: 1
    MISP.email: misp@tu-empresa.com
    MISP.contact: admin@tu-empresa.com
    MISP.live: true
    ```

=== "Security Settings"
    ```yaml
    Security.auth_enforced: true
    Security.password_policy_length: 12
    Security.password_policy_complexity: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{12,}$/
    Security.log_each_individual_auth_fail: true
    Security.rest_client_enable_arbitrary_urls: false
    ```

=== "Session Settings"
    ```yaml
    Session.timeout: 600
    Session.cookie_timeout: 3600
    Session.autoRegenerateId: true
    Session.checkAgent: true
    ```

#### 2. Configuración de Email

```yaml
# Navegar a: Administration → Server Settings → Email
Email.transport: Smtp
Email.from: misp@tu-empresa.com
Email.host: smtp.gmail.com
Email.port: 587
Email.username: notificaciones@tu-empresa.com
Email.password: [password SMTP]
Email.tls: true
```

**Test de email**:
```bash
# Desde el contenedor
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin sendTestEmail admin@tu-empresa.com
```

#### 3. Configuración de Proxy (si aplica)

```yaml
# Si tu red requiere proxy para acceso a Internet
Proxy.host: proxy.tu-empresa.com
Proxy.port: 8080
Proxy.user: [usuario]
Proxy.password: [password]
```

### Configuración via CLI

Alternativa: configurar desde línea de comandos

```bash
# Acceder al contenedor
docker exec -it misp-core bash

# Navegar a directorio de Console
cd /var/www/MISP/app/Console

# Actualizar configuración
./cake Admin setSetting "MISP.baseurl" "https://misp.tu-empresa.com"
./cake Admin setSetting "MISP.live" true
./cake Admin setSetting "Session.timeout" 600
./cake Admin setSetting "Security.auth_enforced" true

# Listar configuración actual
./cake Admin getSetting MISP.baseurl
```

## Configuración de Workers

Los workers procesan tareas en background (feeds, exports, emails, cache).

### Verificar Estado de Workers

```bash
# Desde el host
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin getWorkers

# Salida esperada:
# 2 default workers running
# 1 email worker running
# 1 cache worker running
# 1 prio worker running
# 1 update worker running
```

### Ajustar Número de Workers

Editar `/opt/misp/.env`:

```bash
# Para servidores con más recursos
MISP_WORKERS_DEFAULT=4    # Tareas generales
MISP_WORKERS_EMAIL=2      # Envío de emails
MISP_WORKERS_CACHE=2      # Cache y export
MISP_WORKERS_PRIO=1       # Tareas prioritarias
MISP_WORKERS_UPDATE=1     # Actualización de feeds
```

Reiniciar workers:

```bash
docker compose restart misp-workers
```

### Monitoreo de Workers

```bash
# Ver logs de workers
docker compose logs -f misp-workers

# Ver jobs en cola
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin jobStatus
```

## Configuración de GPG para Firma

GPG se usa para firmar y encriptar exportaciones de datos.

### Generar Par de Llaves GPG

```bash
# Acceder al contenedor
docker exec -it misp-core bash

# Generar llave (interactivo)
su -s /bin/bash www-data
gpg --full-generate-key

# Opciones recomendadas:
# Tipo: (1) RSA and RSA
# Tamaño: 4096 bits
# Validez: 0 (no expira)
# Nombre: MISP Instance
# Email: misp@tu-empresa.com
# Passphrase: [usar valor de GPG_PASSPHRASE del .env]
```

### Configurar GPG en MISP

```bash
# Obtener fingerprint de la llave
su -s /bin/bash www-data
gpg --list-keys --fingerprint

# Salida ejemplo:
# pub   rsa4096 2024-12-05 [SC]
#       1234 5678 90AB CDEF 1234  5678 90AB CDEF 1234 5678
# uid   MISP Instance <misp@tu-empresa.com>

# Configurar en MISP
/var/www/MISP/app/Console/cake Admin setSetting "GnuPG.email" "misp@tu-empresa.com"
/var/www/MISP/app/Console/cake Admin setSetting "GnuPG.homedir" "/var/www/MISP/.gnupg"
/var/www/MISP/app/Console/cake Admin setSetting "GnuPG.password" "[GPG_PASSPHRASE]"
```

### Importar Llave Pública de Otra Instancia MISP

```bash
# Para poder encriptar eventos compartidos
su -s /bin/bash www-data
gpg --keyserver keys.openpgp.org --recv-keys [FINGERPRINT_DESTINO]
```

## Hardening de Seguridad

### 1. Firewall

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirigir a HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verificar reglas
sudo ufw status verbose
```

### 2. Fail2Ban para Protección de Brute Force

```bash
# Instalar Fail2Ban
sudo apt install -y fail2ban

# Crear jail para MISP
sudo tee /etc/fail2ban/jail.d/misp.conf << 'EOF'
[misp]
enabled = true
port = http,https
filter = misp
logpath = /opt/misp/data/logs/error.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

# Crear filtro
sudo tee /etc/fail2ban/filter.d/misp.conf << 'EOF'
[Definition]
failregex = ^.*Authentication failed for .* from <HOST>.*$
ignoreregex =
EOF

# Reiniciar Fail2Ban
sudo systemctl restart fail2ban
sudo fail2ban-client status misp
```

### 3. Configuración de Headers de Seguridad

Editar configuración de Nginx en MISP (si usas proxy reverso):

```nginx
# Archivo: /opt/misp/config/nginx/security-headers.conf

add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 4. Auditoría y Logging

```bash
# Habilitar logging completo en MISP
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin setSetting "Security.audit_enabled" true
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin setSetting "Security.log_each_individual_auth_fail" true
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin setSetting "Security.log_user_ips" true
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin setSetting "MISP.log_auth" true

# Enviar logs a syslog (para integración con Wazuh)
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin setSetting "Security.syslog" true
```

## Performance Tuning

### 1. Optimización de MySQL

Editar `/opt/misp/docker-compose.yml` en sección `misp-db`:

```yaml
command:
  - --character-set-server=utf8mb4
  - --collation-server=utf8mb4_unicode_ci
  - --max-allowed-packet=64M
  - --innodb-buffer-pool-size=1G           # 50-70% de RAM disponible
  - --innodb-log-file-size=256M
  - --innodb-flush-log-at-trx-commit=2
  - --innodb-flush-method=O_DIRECT
  - --query-cache-size=0                   # Deshabilitado en MySQL 5.7+
  - --query-cache-type=0
  - --max-connections=200
```

### 2. Optimización de Redis

```yaml
# En misp-redis service
command:
  - redis-server
  - --requirepass ${REDIS_PASSWORD}
  - --appendonly yes
  - --maxmemory 512mb                      # Límite de memoria
  - --maxmemory-policy allkeys-lru         # Política de evicción
  - --save 900 1                           # Persistencia
  - --save 300 10
  - --save 60 10000
```

### 3. Optimización de PHP

Editar `/opt/misp/.env`:

```bash
PHP_MEMORY_LIMIT=1G                        # Para exportaciones grandes
PHP_MAX_EXECUTION_TIME=600                 # 10 minutos
PHP_UPLOAD_MAX_FILESIZE=100M               # Archivos grandes
PHP_POST_MAX_SIZE=100M
PHP_MAX_INPUT_TIME=600
```

### 4. Configurar Cache de MISP

```bash
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin setSetting "MISP.background_jobs" true
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin setSetting "MISP.cached_attachments" true
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin setSetting "MISP.enable_advanced_correlations" false  # Si hay problemas de performance
```

## Troubleshooting

### Problema 1: Contenedor no Inicia

```bash
# Ver logs detallados
docker compose logs misp-core

# Errores comunes:
# - "Cannot connect to MySQL": Esperar a que MySQL esté healthy
# - "Permission denied": Verificar permisos de volúmenes
# - "Port already in use": Cambiar puerto o detener servicio conflictivo
```

### Problema 2: No Puedo Acceder a la Web

```bash
# Verificar que el contenedor está corriendo
docker compose ps misp-core

# Verificar puerto
ss -tuln | grep ':443'

# Test desde el host
curl -k https://localhost/users/login

# Ver logs de nginx dentro del contenedor
docker exec -it misp-core cat /var/log/nginx/error.log
```

### Problema 3: Workers no Procesan Jobs

```bash
# Verificar workers
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin getWorkers

# Ver jobs en cola
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin jobStatus

# Reiniciar workers
docker compose restart misp-workers

# Limpiar jobs atascados
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin clearQueue
```

### Problema 4: Lentitud en la Interfaz

```bash
# Verificar uso de recursos
docker stats

# Si MySQL consume mucha RAM:
# - Reducir innodb-buffer-pool-size
# - Agregar más RAM al servidor

# Si CPU al 100%:
# - Verificar correlaciones pesadas
# - Considerar deshabilitar correlaciones avanzadas

# Limpiar cache
docker exec -it misp-core /var/www/MISP/app/Console/cake Admin clearCache
```

### Problema 5: Error al Enviar Emails

```bash
# Test de SMTP desde contenedor
docker exec -it misp-core bash
apt update && apt install -y swaks
swaks --to admin@tu-empresa.com \
      --from misp@tu-empresa.com \
      --server smtp.gmail.com:587 \
      --auth LOGIN \
      --auth-user notificaciones@tu-empresa.com \
      --auth-password 'tu-password' \
      --tls

# Ver logs de email en MISP
docker exec -it misp-core tail -f /var/www/MISP/app/tmp/logs/error.log | grep -i email
```

### Logs Importantes

```bash
# Logs de aplicación
docker compose logs -f misp-core

# Logs de MySQL
docker compose logs -f misp-db

# Logs de workers
docker compose logs -f misp-workers

# Logs dentro del contenedor MISP
docker exec -it misp-core tail -f /var/www/MISP/app/tmp/logs/error.log
docker exec -it misp-core tail -f /var/www/MISP/app/tmp/logs/debug.log
```

## Backup y Restauración

### Script de Backup Automático

Crear `/opt/misp/backup.sh`:

```bash
#!/bin/bash
# Archivo: /opt/misp/backup.sh

BACKUP_DIR="/opt/misp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "=== MISP Backup Started: $DATE ==="

# Backup MySQL
echo "Backing up MySQL database..."
docker exec misp-db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} misp | gzip > "$BACKUP_DIR/misp_db_$DATE.sql.gz"

# Backup Redis
echo "Backing up Redis..."
docker exec misp-redis redis-cli -a ${REDIS_PASSWORD} --rdb /data/dump.rdb BGSAVE
sleep 5
cp /opt/misp/data/redis/dump.rdb "$BACKUP_DIR/misp_redis_$DATE.rdb"

# Backup Files
echo "Backing up MISP files..."
tar czf "$BACKUP_DIR/misp_files_$DATE.tar.gz" -C /opt/misp/data/files .

# Backup Configuration
echo "Backing up configuration..."
tar czf "$BACKUP_DIR/misp_config_$DATE.tar.gz" /opt/misp/.env /opt/misp/docker-compose.yml /opt/misp/config/

# Delete old backups
echo "Cleaning old backups (>$RETENTION_DAYS days)..."
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

echo "=== MISP Backup Completed ==="
du -sh "$BACKUP_DIR"/*_$DATE.*
```

Configurar cron:

```bash
chmod +x /opt/misp/backup.sh

# Agregar a crontab (backup diario a las 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/misp/backup.sh >> /opt/misp/backups/backup.log 2>&1") | crontab -
```

### Restauración desde Backup

```bash
#!/bin/bash
# Restaurar desde backup

BACKUP_DATE="20241205_020000"  # Ajustar a fecha de backup
BACKUP_DIR="/opt/misp/backups"

# Detener MISP
cd /opt/misp
docker compose down

# Restaurar MySQL
echo "Restoring MySQL..."
gunzip < "$BACKUP_DIR/misp_db_$BACKUP_DATE.sql.gz" | docker exec -i misp-db mysql -u root -p${MYSQL_ROOT_PASSWORD} misp

# Restaurar Redis
echo "Restoring Redis..."
cp "$BACKUP_DIR/misp_redis_$BACKUP_DATE.rdb" /opt/misp/data/redis/dump.rdb

# Restaurar Files
echo "Restoring MISP files..."
rm -rf /opt/misp/data/files/*
tar xzf "$BACKUP_DIR/misp_files_$BACKUP_DATE.tar.gz" -C /opt/misp/data/files/

# Reiniciar MISP
docker compose up -d

echo "Restauración completada. Verificar funcionamiento."
```

## Próximos Pasos

Una vez que MISP está instalado y configurado:

1. **[Gestión de Threat Intelligence](threat-intelligence.md)** - Aprende a crear events y trabajar con IOCs
2. **[Compartir y Comunidad](sharing.md)** - Configura sharing groups y sincronización
3. **[Integración con Stack](integration-stack.md)** - Conecta con Wazuh, TheHive, Shuffle

---

!!! success "Instalación Completa"
    Si has llegado hasta aquí, tienes MISP completamente funcional. Asegúrate de:

    - ✅ Cambiar todos los passwords por defecto
    - ✅ Configurar backups automáticos
    - ✅ Configurar firewall
    - ✅ Habilitar SSL con certificado válido
    - ✅ Configurar envío de emails
    - ✅ Monitorear logs regularmente

**¡Tu plataforma de Threat Intelligence está lista!**
