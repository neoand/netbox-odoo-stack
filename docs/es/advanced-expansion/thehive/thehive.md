# TheHive: Plataforma Completa de Incident Response

## Tabla de Contenidos

1. [Introducción a TheHive](#1-introducción-a-thehive)
2. [Arquitectura e Integración](#2-arquitectura-e-integración)
3. [Instalación y Configuración](#3-instalación-y-configuración)
4. [Configuración Avanzada](#4-configuración-avanzada)
5. [Casos de Uso Prácticos](#5-casos-de-uso-prácticos)
6. [Integración con NeoAnd](#6-integración-con-neoand)
7. [Operación y Mantenimiento](#7-operación-y-mantenimiento)
8. [Seguridad](#8-seguridad)
9. [Referencias y Recursos](#9-referencias-y-recursos)

---

## 1. Introducción a TheHive

### ¿Qué es TheHive?

TheHive es una plataforma de gestión de incidentes de seguridad de código abierto, diseñada para facilitar la respuesta a incidentes (Incident Response) en entornos SOC (Security Operations Center). Desarrollada por TheHive Project, permite a los equipos de seguridad colaborar de manera eficiente, estructurar y seguir incidentes de seguridad de principio a fin.

### Para qué sirve

TheHive sirve como:

- **Centro de comando** para equipos de respuesta a incidentes
- **Plataforma colaborativa** donde múltiples analistas pueden trabajar en paralelo
- **Sistema de seguimiento** para documentar evidencia y acciones durante un incidente
- **Motor de workflows** para estandarizar procesos de respuesta a incidentes
- **Interface unificada** para integrar múltiples herramientas de seguridad (Cortex, MISP, SIEM)

### Casos de uso

#### 1. Gestión de Incidentes de Malware
```
Escenario: Detección de malware en endpoint
- Crear caso desde alerta de EDR
- Ejecutar análisis automatizado con Cortex
- Escalar a especialistas si es necesario
- Documentar remediación
- Generar reporte post-incidente
```

#### 2. Phishing y Fraude
```
Escenario: Campaña de phishing detectada
- Recopilar emails sospechosos
- Extraer indicadores de compromiso (IOCs)
- Verificar con threat intelligence (MISP)
- Coordinar respuesta con equipos de TI
- Notificar a usuarios afectados
```

#### 3. Intrusiones y Brechas de Datos
```
Escenario: Acceso no autorizado detectado
- Crear caso crítico de alta prioridad
- Asignar a equipo forense
- Timeline de eventos
- Preservar evidencia
- Coordinar con legal/compliance
```

### Beneficios

- **Colaboración mejorada**: Múltiples analistas pueden trabajar simultáneamente
- **Trazabilidad completa**: Cada acción queda registrada y auditada
- **Automatización**: Integración con Cortex para análisis automatizado
- **Flexibilidad**: Templates personalizables para diferentes tipos de incidentes
- **Escalabilidad**: Soporte para equipos grandes con roles y permisos
- **Mejora continua**: Métricas y reportes para optimizar procesos

---

## 2. Arquitectura e Integración

### Cómo se integra en la stack NeoAnd

TheHive es el **núcleo de coordinación** para la gestión de incidentes de seguridad en la stack NeoAnd:

```
┌─────────────────────────────────────────────────────────┐
│                    TheHive (IR Platform)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Casos      │  │   Alertas    │  │   Reportes   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                 │                 │
         │                 │                 │
┌────────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
│   Cortex        │ │    MISP     │ │   Elasticsearch │
│   (Análisis)    │ │ (Threat INT)│ │   (SIEM/Logs)   │
└─────────────────┘ └─────────────┘ └──────────────────┘
         │                 │                 │
┌────────▼──────────────────▼─────────────────▼────────┐
│              NeoAnd Stack                          │
│  Netbox │ Wazuh │ Odoo │ Shuffle │ n8n │ Others   │
└──────────────────────────────────────────────────────┘
```

### Arquitectura técnica

#### Componentes principales

1. **TheHive Core (Backend)**
   - Servidor de aplicaciones (Play Framework)
   - API REST para integraciones
   - Base de datos (Cortex analítica)
   - Servicio de búsquedas (Elasticsearch)

2. **TheHive Web Interface**
   - Dashboard interactivo
   - Gestión de casos y alertas
   - Timeline de eventos
   - Sistema de plantillas

3. **Cortex (Análisis)**
   - Motores de análisis (analyzers)
   - Ejecutores de tareas (responders)
   - Integración con servicios externos
   - Automatización de enriquecimiento

4. **MISP (Threat Intelligence)**
   - Base de datos de indicadores
   - Compartir inteligencia de amenazas
   - Correlación de IOCs
   - Feeds de threat intelligence

#### Flujo de datos

```
Alerta → TheHive → [Análisis] → Cortex → [Threat Intel] → MISP
  ↓          ↓           ↓          ↓           ↓
Elastic    Caso      Respuesta  Reporte    Correlación
Search   Workflow   Automatizada Enrichment  IOCs
```

### Relación con Cortex y MISP

#### Cortex

**¿Qué es?**
Motor de análisis que ejecuta tareas automatizadas sobre artefactos de seguridad.

**Integración con TheHive:**
```json
// Configuración en TheHive (application.conf)
## Cortex
cortex {
  servers = [
    {
      name = "Cortex-Server-1"
      url = "http://cortex:9000"
      key = "${CORTEX_API_KEY}"
      timeout = 60
      async = true
    }
  ]
}
```

**Analyzers disponibles:**
- `UrlHaus` - Verificar URLs maliciosas
- `VirusTotal_GetReport` - Análisis de archivos/URLs
- ` Shodan_Host` - Búsqueda de hosts
- `MISP_Search` - Búsqueda en MISP
- `PassiveTotal` - Información de dominios

**Ejemplo de uso:**
```bash
# Desde un caso en TheHive
1. Seleccionar artefacto (ej: IP, hash, URL)
2. Click en "Analyze"
3. Seleccionar analyzer (ej: VirusTotal)
4. Ejecutar análisis
5. Revisar resultados
```

#### MISP

**¿Qué es?**
Plataforma para compartir indicadores de compromiso y threat intelligence.

**Integración con TheHive:**
```json
// Configuración MISP en TheHive
misp {
  instances = [
    {
      name = "MISP-Internal"
      url = "https://misp.internal"
      key = "${MISP_API_KEY}"
      cert = false
    }
  ]
}
```

**Casos de uso con MISP:**
- Verificar IOCs contra base de conocimientos
- Exportar casos a MISP
- Importar threat feeds
- Correlación automática de alertas

---

## 3. Instalación y Configuración

### Requisitos del sistema

#### Hardware mínimo
```
CPU: 4 cores
RAM: 8 GB
Disco: 100 GB SSD
Red: 1 Gbps
```

#### Hardware recomendado (producción)
```
CPU: 8+ cores
RAM: 16+ GB
Disco: 500 GB+ SSD
Red: 10 Gbps
```

#### Dependencias
- **Java**: OpenJDK 11 o superior
- **Elasticsearch**: 7.x o 8.x
- **Cortex**: 3.x (para análisis automatizado)
- **MISP**: 2.4.x+ (opcional, para threat intelligence)

### Proceso de instalación detallado

#### Opción 1: Instalación con Docker Compose (Recomendado)

**Paso 1: Crear estructura de directorios**

```bash
# Crear directorio para TheHive
mkdir -p /opt/thehive/{data,logs,cortex,misp,elasticsearch}

# Establecer permisos
chmod -R 755 /opt/thehive
```

**Paso 2: Crear docker-compose.yml**

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms2g -Xmx2g
    volumes:
      - ./elasticsearch:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - thehivenet

  cortex:
    image: thehiveproject/cortex:3.1.1
    container_name: cortex
    depends_on:
      - elasticsearch
    environment:
      - CORTEX_SECRET_KEY=${CORTEX_SECRET_KEY}
    volumes:
      - ./cortex:/var/lib/cortex
    ports:
      - "9001:9001"
    networks:
      - thehivenet

  thehive:
    image: thehiveproject/thehive:5.2.0
    container_name: thehive
    depends_on:
      - elasticsearch
      - cortex
    environment:
      - THEHIVE_SECRET_KEY=${THEHIVE_SECRET_KEY}
    volumes:
      - ./thehive:/opt/thehive/conf
    ports:
      - "9000:9000"
    networks:
      - thehivenet

  misp:
    image: coolacid/docker-misp:2.4.168
    container_name: misp
    depends_on:
      - elasticsearch
    environment:
      - MISP_ADMIN_EMAIL=admin@localhost
      - MISP_ADMIN_PASSWORD=${MISP_PASSWORD}
    volumes:
      - ./misp:/var/www/MISP/app/files
    ports:
      - "8443:443"
    networks:
      - thehivenet

networks:
  thehivenet:
    driver: bridge
```

**Paso 3: Crear archivo .env**

```bash
cat > .env << 'EOF'
# Configuración de claves secretas (generate secure keys!)
THEHIVE_SECRET_KEY=$(openssl rand -base64 32)
CORTEX_SECRET_KEY=$(openssl rand -base64 32)

# Credenciales
MISP_PASSWORD=ChangeMe123!

# Configuración de base de datos
ES_JAVA_OPTS=-Xms4g -Xmx4g
EOF
```

**Paso 4: Iniciar servicios**

```bash
# Levantar servicios
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f thehive
```

**Paso 5: Verificar instalación**

```bash
# Verificar TheHive
curl -k http://localhost:9000/api/case/_stats

# Verificar Cortex
curl http://localhost:9001/api/status

# Verificar Elasticsearch
curl http://localhost:9200
```

#### Opción 2: Instalación nativa en Ubuntu

**Paso 1: Instalar dependencias**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Java
sudo apt install -y openjdk-17-jdk

# Verificar Java
java -version
javac -version

# Instalar Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update
sudo apt install -y elasticsearch

# Configurar Elasticsearch
sudo tee /etc/elasticsearch/elasticsearch.yml > /dev/null << 'EOF'
cluster.name: hive
node.name: hive-node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 127.0.0.1
discovery.type: single-node
EOF

sudo systemctl daemon-reload
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch
```

**Paso 2: Instalar Cortex**

```bash
# Instalar Cortex
wget -O /tmp/cortex-3.1.1.zip https://github.com/TheHive-Project/Cortex/releases/download/3.1.1/cortex-3.1.1.zip
sudo unzip /tmp/cortex-3.1.1.zip -d /opt/
sudo chown -R cortex:cortex /opt/cortex

# Crear servicio systemd
sudo tee /etc/systemd/system/cortex.service > /dev/null << 'EOF'
[Unit]
Description=Cortex
After=network.target elasticsearch.service

[Service]
Type=simple
User=cortex
Group=cortex
ExecStart=/opt/cortex/bin/cortex -Dconfig.file=/opt/cortex/conf/application.conf
WorkingDirectory=/opt/cortex
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Generar secret key
CORTEX_SECRET=$(openssl rand -base64 32)

# Configurar Cortex
sudo tee /opt/cortex/conf/application.conf > /dev/null << EOF
play.http.secret.key="$CORTEX_SECRET"

db {
  default {
    driver = org.mariadb.jdbc.Driver
    url = "jdbc:mariadb://127.0.0.1:3306/cortex?useMysqlMetadata=false"
    username = cortex
    password = cortexpassword
    connectionPool.maxSize = 25
    connectionPool.minSize = 5
    connectionPool.timeout = 30 seconds
    connectionPool.maxLifetime = 1 hour
  }
}

elasticsearch {
  host = "127.0.0.1"
  port = 9200
  index = "cortex"
}
EOF

sudo systemctl daemon-reload
sudo systemctl enable cortex
sudo systemctl start cortex
```

**Paso 3: Instalar TheHive**

```bash
# Descargar TheHive
wget -O /tmp/thehive-5.2.0.tgz https://github.com/TheHive-Project/TheHive/releases/download/5.2.0/thehive-5.2.0.tgz
sudo tar -xzf /tmp/thehive-5.2.0.tgz -C /opt/
sudo chown -R thehive:thehive /opt/thehive

# Crear usuario thehive
sudo useradd --system --no-create-home thehive

# Crear servicio systemd
sudo tee /etc/systemd/system/thehive.service > /dev/null << 'EOF'
[Unit]
Description=TheHive
After=network.target elasticsearch.service cortex.service

[Service]
Type=simple
User=thehive
ExecStart=/opt/thehive/bin/thehive -Dconfig.file=/opt/thehive/conf/application.conf
WorkingDirectory=/opt/thehive
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Generar secret key
THEHIVE_SECRET=$(openssl rand -base64 32)

# Configurar TheHive
sudo tee /opt/thehive/conf/application.conf > /dev/null << EOF
play.http.secret.key="$THEHIVE_SECRET"

db {
  default {
    driver = org.mariadb.jdbc.Driver
    url = "jdbc:mariadb://127.0.0.1:3306/thehive?useMysqlMetadata=false"
    username = thehive
    password = thehivepassword
    connectionPool.maxSize = 25
    connectionPool.minSize = 5
    connectionPool.timeout = 30 seconds
    connectionPool.maxLifetime = 1 hour
  }
}

search {
  host = "127.0.0.1"
  port = 9200
  index = "thehive"
}

cortex {
  servers = [
    {
      name = "Cortex-Server"
      url = "http://127.0.0.1:9001"
      key = "YOUR_CORTEX_API_KEY"
      timeout = 60
      async = true
    }
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl enable thehive
sudo systemctl start thehive
```

### Configuración inicial

#### Acceso a la interfaz web

1. **Abrir navegador**: `https://localhost:9000` o `http://localhost:9000`

2. **Primer usuario administrador**:
   ```
   Usuario: admin@thehive.local
   Contraseña: <generar password seguro>
   ```

3. **Cambiar contraseña por defecto** (si aplica):
   ```bash
   # Usar utilidad de TheHive
   sudo /opt/thehive/bin/thehive --reset-password admin@thehive.local
   ```

#### Configuración básica post-instalación

**Configurar Elasticsearch (si es necesario):**

```bash
# Crear índices si no existen
curl -X PUT "localhost:9200/thehive" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}'

# Verificar índices
curl "localhost:9200/_cat/indices?v"
```

**Verificar conectividad:**

```bash
# Test Cortex
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:9001/api/status

# Test TheHive
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -X POST http://localhost:9000/api/case/_search \
     -H 'Content-Type: application/json' \
     -d '{"query": {"match_all": {}}}'
```

---

## 4. Configuración Avanzada

### Configuración de TheHive

#### Archivo application.conf

Ubicación:
- Docker: `./thehive/application.conf`
- Nativo: `/opt/thehive/conf/application.conf`

**Configuraciones principales:**

```hocon
# Clave secreta (crítico!)
play.http.secret.key="GENERATE_SECURE_KEY_64_CHARS"

# Configuración de base de datos
db {
  default {
    # MariaDB/MySQL
    driver = org.mariadb.jdbc.Driver
    url = "jdbc:mariadb://db-host:3306/thehive?useMysqlMetadata=false"
    username = thehive
    password = secure_password

    # Configuración de pool
    connectionPool.maxSize = 50
    connectionPool.minSize = 10
    connectionPool.timeout = 30 seconds
    connectionPool.maxLifetime = 30 minutes
  }
}

# Configuración de Elasticsearch
search {
  host = "elasticsearch-host"
  port = 9200
  index = "thehive"

  # Configuración de timeout
  timeout = 10 seconds

  # SSL (si aplica)
  ssl.enabled = true
  ssl.hostnameVerification = false
}

# Configuración de Cortex
cortex {
  servers = [
    {
      name = "Primary-Cortex"
      url = "https://cortex-host:9001"
      key = "${CORTEX_API_KEY}"
      timeout = 300
      async = true
      maxWorkers = 2
    },
    {
      name = "Backup-Cortex"
      url = "https://cortex-backup:9001"
      key = "${CORTEX_BACKUP_API_KEY}"
      timeout = 300
      async = true
    }
  ]
}

# Configuración de MISP
misp {
  instances = [
    {
      name = "Internal-MISP"
      url = "https://misp-internal"
      key = "${MISP_API_KEY}"
      tls {
        enabled = true
        hostnameVerification = true
      }
      # Configuración de proxy
      proxies {
        http = "http://proxy:8080"
        https = "http://proxy:8080"
      }
    },
    {
      name = "Public-MISP"
      url = "https://misp.project"
      key = "${MISP_PUBLIC_KEY}"
      cert = false
    }
  ]
}

# Configuración de autenticación
auth {
  # Método principal
  provider = "local"  # local, LDAP, OIDC, SAML

  # OIDC (ejemplo)
  oidc {
    provider = "keycloak"
    clientId = "thehive"
    clientSecret = "${OIDC_CLIENT_SECRET}"
    discoveryURI = "https://keycloak/auth/realms/thehive/.well-known/openid_configuration"
    redirectURI = "https://thehive/auth/realms/thehive/broker/callback"
  }

  # LDAP (ejemplo)
  ldap {
    url = "ldap://ldap-server:389"
    baseDN = "dc=company,dc=com"
    filter = "(uid={0})"
    userDN = "cn=thehive,ou=services,dc=company,dc=com"
    password = "${LDAP_PASSWORD}"
  }
}

# Configuración de paginación
paginate {
  pageSize = 50
  maxPageSize = 200
}

# Configuración de archivos
maxUploadSize = 100MB

# Configuración de email
mail {
  smtp {
    host = "smtp.company.com"
    port = 587
    security = starttls
    user = "alerts@company.com"
    password = "${SMTP_PASSWORD}"
    from = "TheHive <alerts@company.com>"
  }
}

# Configuración de auditoría
audit {
  enabled = true
  retention = 365 days
}

# Configuración de clustering
cluster {
  enabled = true
  nodeName = "thehive-node-1"

  akka {
    remote {
      artery {
        transport = tcp
        canonical.hostname = "10.0.1.10"
        canonical.port = 2551
      }
    }
  }
}
```

### Integración con Elasticsearch

#### Configuración optimizada

**elasticsearch.yml:**

```yaml
# Configuración de producción
cluster.name: thehive-cluster
node.name: thehive-node-1

# Paths
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# Red
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# Discovery (para cluster)
discovery.type: single-node  # cambiar a cluster para multi-nodo

# Configuración de memoria
bootstrap.memory_lock: true

# Indices
indices.query.bool.max_clause_count: 10000

# Cache
indices.queries.cache.size: 256mb
indices.fielddata.cache.size: 256mb

# Thread pools
thread_pool.write.queue_size: 1000
thread_pool.search.queue_size: 1000

# Performance
index.refresh_interval: 5s
index.number_of_replicas: 1
index.number_of_shards: 1
```

**Comandos útiles para Elasticsearch:**

```bash
# Ver estado del cluster
curl -s http://localhost:9200/_cluster/health?pretty

# Ver índices
curl -s http://localhost:9200/_cat/indices?v

# Estadísticas de uso
curl -s http://localhost:9200/_stats

# Buscar en todos los índices
curl -X GET "localhost:9200/thehive*/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  },
  "size": 10
}'

# Limpiar índice
curl -X DELETE "localhost:9200/thehive-000001"
```

### Configuración de templates de casos

#### Crear template personalizado

Los templates permiten estandarizar la estructura de casos. Se definen en formato JSON:

**Ejemplo: Template para "Malware Incident"**

```json
{
  "templateName": "Malware Incident Response",
  "templateDescription": "Standard workflow for malware analysis",
  "customFields": [
    {
      "name": "malwareFamily",
      "reference": "text",
      "required": false,
      "description": "Identified malware family"
    },
    {
      "name": "affectedSystems",
      "reference": "text",
      "required": true,
      "description": "List of affected systems"
    },
    {
      "name": "attackVector",
      "reference": "list",
      "required": false,
      "options": ["Email", "Web", "USB", "Network", "Unknown"],
      "description": "Initial attack vector"
    },
    {
      "name": "criticality",
      "reference": "list",
      "required": true,
      "options": ["Low", "Medium", "High", "Critical"],
      "description": "Incident criticality level"
    },
    {
      "name": "containmentDate",
      "reference": "date",
      "required": false,
      "description": "Date when containment was achieved"
    }
  ],
  "taskTemplates": [
    {
      "title": "Initial Triage",
      "group": "Analysis",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Perform initial triage and scope assessment",
      "extraData": {}
    },
    {
      "title": "Artifact Collection",
      "group": "Evidence",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Collect and preserve relevant artifacts",
      "extraData": {}
    },
    {
      "title": "Malware Analysis",
      "group": "Analysis",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Analyze malware samples",
      "extraData": {}
    },
    {
      "title": "IOC Extraction",
      "group": "Analysis",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Extract indicators of compromise",
      "extraData": {}
    },
    {
      "title": "Hunt in Environment",
      "group": "Detection",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Hunt for IOCs in the environment",
      "extraData": {}
    },
    {
      "title": "Containment",
      "group": "Response",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Implement containment measures",
      "extraData": {}
    },
    {
      "title": "Eradication",
      "group": "Response",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Remove malware and persistence mechanisms",
      "extraData": {}
    },
    {
      "title": "Recovery",
      "group": "Recovery",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Restore systems to normal operation",
      "extraData": {}
    },
    {
      "title": "Lessons Learned",
      "group": "Post-Incident",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Document lessons learned",
      "extraData": {}
    },
    {
      "title": "Report Writing",
      "group": "Post-Incident",
      "status": "Open",
      "assignee": null,
      "dueDate": null,
      "description": "Write incident report",
      "extraData": {}
    }
  ],
  "observableTemplates": [
    {
      "dataType": "file",
      "message": "Upload malware sample for analysis",
      "required": false,
      "tlp": 2,
      "pap": 2,
      "extraData": {}
    },
    {
      "dataType": "domain",
      "message": "C2 domains observed",
      "required": false,
      "tlp": 2,
      "pap": 2,
      "extraData": {}
    },
    {
      "dataType": "ip",
      "message": "Malicious IP addresses",
      "required": false,
      "tlp": 2,
      "pap": 2,
      "extraData": {}
    },
    {
      "dataType": "url",
      "message": "Malicious URLs",
      "required": false,
      "tlp": 2,
      "pap": 2,
      "extraData": {}
    },
    {
      "dataType": "hash",
      "message": "File hashes (MD5/SHA256)",
      "required": false,
      "tlp": 2,
      "pap": 2,
      "extraData": {}
    }
  ]
}
```

**Crear template via API:**

```bash
# Crear template
curl -X POST http://localhost:9000/api/case-template \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @malware-template.json

# Listar templates
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:9000/api/case-template

# Eliminar template
curl -X DELETE http://localhost:9000/api/case-template/TEMPLATE_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Templates por tipo de incidente:**

1. **Phishing Incident**
2. **Data Breach**
3. **Ransomware**
4. **Insider Threat**
5. **DDoS Attack**
6. **Unauthorized Access**

### Configuración de usuarios y permisos

#### Roles disponibles

**1. admin**
- Acceso completo a todas las funcionalidades
- Gestión de usuarios y organizaciones
- Configuración del sistema

**2. org-admin**
- Gestión de usuarios en su organización
- Acceso a todos los casos de su organización
- Configuración de templates

**3. analyst**
- Crear y editar casos
- Ejecutar análisis con Cortex
- Gestionar tareas
- Ver métricas de su organización

**4. read-only**
- Solo lectura de casos
- No puede crear o modificar casos
- Acceso limitado a observabless

#### Crear usuarios vía API

```bash
# Crear usuario analyst
curl -X POST http://localhost:9000/api/user \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "analyst1@company.com",
    "name": "John Doe",
    "email": "analyst1@company.com",
    "roles": ["analyst"],
    "organization": "Security",
    "password": "SecurePassword123!"
  }'

# Crear usuario org-admin
curl -X POST http://localhost:9000/api/user \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "manager@company.com",
    "name": "Jane Manager",
    "email": "manager@company.com",
    "roles": ["org-admin"],
    "organization": "Security",
    "password": "SecurePassword123!"
  }'

# Listar usuarios
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:9000/api/user

# Actualizar usuario
curl -X PATCH http://localhost:9000/api/user/USER_ID \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["analyst", "org-admin"]}'

# Cambiar password
curl -X POST http://localhost:9000/api/user/USER_ID/password \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"password": "NewSecurePassword123!"}'
```

#### Configuración de LDAP

```hocon
# En application.conf
auth {
  provider = ldap

  ldap {
    url = "ldap://ldap.company.com:389"
    baseDN = "dc=company,dc=com"
    filter = "(uid={0})"

    # Bind DN (usuario técnico para búsqueda)
    userDN = "cn=thehive,ou=services,dc=company,dc=com"
    password = "LDAP_SERVICE_PASSWORD"

    # Mapeo de roles
    roleMapping = {
      "cn=soc-analysts,ou=groups,dc=company,dc=com" = analyst
      "cn=soc-managers,ou=groups,dc=company,dc=com" = org-admin
      "cn=security-admins,ou=groups,dc=company,dc=com" = admin
    }
  }
}
```

#### Configuración de OIDC (Keycloak)

```hocon
auth {
  provider = oidc

  oidc {
    provider = keycloak
    clientId = "thehive"
    clientSecret = "OIDC_CLIENT_SECRET"
    discoveryURI = "https://keycloak.company.com/auth/realms/thehive/.well-known/openid_configuration"
    redirectURI = "https://thehive.company.com/auth/realms/thehive/broker/callback"

    # Mapeo de roles
    roleMapping = [
      {
        thehiveRole = analyst
        externalRole = soc-analyst
      },
      {
        thehiveRole = org-admin
        externalRole = soc-manager
      }
    ]
  }
}
```

**Scripts de automatización:**

```bash
#!/bin/bash
# Script para crear usuarios en lote

# archivo: create-users.sh
USERS_FILE="users.csv"

while IFS=',' read -r email name role; do
  curl -X POST http://localhost:9000/api/user \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"login\": \"$email\",
      \"name\": \"$name\",
      \"email\": \"$email\",
      \"roles\": [\"$role\"],
      \"organization\": \"SOC\",
      \"password\": \"TempPassword123!\"
    }"
done < "$USERS_FILE"
```

---

## 5. Casos de Uso Prácticos

### Workflow de incident response

#### Marco de trabajo NIST

TheHive facilita la implementación del framework NIST de respuesta a incidentes:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Preparation │────▶│ Detection   │────▶│ Analysis    │
│ & Planning  │     │ & Reporting │     │ & Response  │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                         ▼
       │                                 ┌─────────────┐
       └─────────────────────────────────│ Containment│
                                         │ Eradication│
                                         │ Recovery   │
                                         └─────────────┘
```

#### Implementación en TheHive

**1. Preparation (Preparación)**

```bash
# Crear template base de NIST
cat > nist-incident-template.json << 'EOF'
{
  "templateName": "NIST Incident Response",
  "taskTemplates": [
    {
      "title": "Incident Classification",
      "group": "Preparation",
      "description": "Classify incident type and severity"
    },
    {
      "title": "Alert Triage",
      "group": "Detection",
      "description": "Initial triage and validation"
    },
    {
      "title": "Root Cause Analysis",
      "group": "Analysis",
      "description": "Investigate root cause"
    },
    {
      "title": "Scope Assessment",
      "group": "Analysis",
      "description": "Determine affected systems"
    },
    {
      "title": "Containment Actions",
      "group": "Containment",
      "description": "Implement containment"
    },
    {
      "title": "Eradication",
      "group": "Eradication",
      "description": "Remove threat"
    },
    {
      "title": "Recovery",
      "group": "Recovery",
      "description": "Restore normal operations"
    },
    {
      "title": "Lessons Learned",
      "group": "Post-Incident",
      "description": "Document lessons learned"
    }
  ]
}
EOF

# Importar template
curl -X POST http://localhost:9000/api/case-template \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @nist-incident-template.json
```

**2. Detection & Reporting (Detección y Reporte)**

```bash
# Crear caso desde detección
curl -X POST http://localhost:9000/api/case \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Suspicious Network Activity Detected",
    "description": "EDR detected lateral movement",
    "severity": 3,
    "tlp": 2,
    "pap": 2,
    "tags": ["EDR", "Lateral Movement", "APT"],
    "template": "NIST Incident Response",
    "assignee": "analyst@company.com",
    "customFields": {
      "affectedSystems": "SRV-WEB-01, SRV-DB-02",
      "criticality": "High"
    }
  }'
```

**3. Analysis (Análisis)**

```bash
# Obtener detalles del caso
CASE_ID=$(curl -s -X GET http://localhost:9000/api/case -H "Authorization: Bearer $API_KEY" | jq '.[0].id')

# Agregar observables
curl -X POST http://localhost:9000/api/case/$CASE_ID/observable \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "dataType": "ip",
    "data": "192.168.1.100",
    "message": "Suspicious IP",
    "tlp": 2,
    "pap": 2,
    "tags": ["malicious", "c2"]
  }'

# Ejecutar análisis con Cortex
curl -X POST http://localhost:9000/api/case/$CASE_ID/observable/OBS_ID/analyzer \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "analyzerId": "VirusTotal_GetReport_3_0"
  }'
```

**4. Containment, Eradication & Recovery (Contención, Erradicación y Recuperación)**

```bash
# Agregar tarea de contención
curl -X POST http://localhost:9000/api/case/$CASE_ID/task \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Isolate affected systems",
    "description": "Isolate SRV-WEB-01 from network",
    "status": "InProgress",
    "group": "Containment"
  }'

# Agregar evidencia de erradicación
curl -X POST http://localhost:9000/api/case/$CASE_ID/task \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Remove malware",
    "description": "Malware removed from all affected systems",
    "status": "Done",
    "group": "Eradication"
  }'

# Documentar recuperación
curl -X POST http://localhost:9000/api/case/$CASE_ID/task \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Systems restored",
    "description": "All systems restored to normal operation",
    "status": "Done",
    "group": "Recovery"
  }'
```

### Gestión de alertas

#### Integración con SIEM

**Configurar alerta desde Elastic Security:**

```bash
# Ejemplo de webhook desde Elastic hacia TheHive
curl -X POST http://localhost:9000/api/alert \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "external",
    "source": "Elastic Security",
    "externalLink": "https://elastic.company.com/app/security/alerts/ALERT_ID",
    "title": "Possible malware detected",
    "description": "Elastic detected suspicious behavior",
    "severity": 3,
    "date": "2025-01-15T10:30:00Z",
    "tags": ["malware", "endpoint", "elastic"],
    "tlp": 2,
    "pap": 2,
    "observables": [
      {
        "dataType": "ip",
        "data": "10.0.0.55",
        "message": "Source IP",
        "tlp": 2,
        "tags": ["source"]
      },
      {
        "dataType": "domain",
        "data": "malicious-domain.com",
        "message": "C2 server",
        "tlp": 2,
        "tags": ["c2", "malicious"]
      }
    ]
  }'
```

**Pipeline de alertas automatizado:**

```bash
#!/bin/bash
# Script: alert-processor.sh
# Procesa alertas de múltiples fuentes y las envía a TheHive

ALERT_QUEUE="alerts.json"

while true; do
  # Leer alertas de cola
  ALERT=$(jq -r '.[0]' "$ALERT_QUEUE")

  if [ "$ALERT" != "null" ]; then
    # Enviar a TheHive
    curl -X POST http://localhost:9000/api/alert \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "$ALERT"

    # Si es crítica, crear caso inmediatamente
    SEVERITY=$(echo "$ALERT" | jq -r '.severity')
    if [ "$SEVERITY" -ge 3 ]; then
      CASE_ID=$(curl -s -X POST http://localhost:9000/api/case \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "$ALERT" | jq -r '._id')
      echo "Critical alert escalated to case: $CASE_ID"
    fi

    # Remover alerta procesada
    jq '.[1:]' "$ALERT_QUEUE" > "${ALERT_QUEUE}.tmp"
    mv "${ALERT_QUEUE}.tmp" "$ALERT_QUEUE"
  fi

  sleep 5
done
```

#### Workflow de triage

```bash
# Flujo de trabajo para analista
# 1. Revisar alertas pendientes

curl -H "Authorization: Bearer $API_KEY" \
     http://localhost:9000/api/alert?status=New | jq '.'

# 2. Triage: Promover alerta a caso
ALERT_ID="ALERT_ID"
curl -X POST http://localhost:9000/api/alert/$ALERT_ID/createCase \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "Standard Incident",
    "assignee": "analyst@company.com"
  }'

# 3. Agregar notas de triage
curl -X POST http://localhost:9000/api/case/$CASE_ID/note \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Alert reviewed: Confirmed malicious activity. IOC verified via VirusTotal.",
    "visibility": "analyst"
  }'

# 4. Actualizar estado de alerta
curl -X PATCH http://localhost:9000/api/alert/$ALERT_ID \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "Escalated"}'
```

### Colaboración en equipos

#### Asignación de tareas

```bash
# Asignar tarea específica
curl -X PATCH http://localhost:9000/api/case/$CASE_ID/task/$TASK_ID \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assignee": "forensic-analyst@company.com",
    "status": "InProgress"
  }'

# Comentar en tarea
curl -X POST http://localhost:9000/api/case/$CASE_ID/task/$TASK_ID/comment \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Started memory dump analysis. Preliminary findings show suspicious process injection."
  }'
```

#### Sistema de comentarios y timeline

```bash
# Agregar comentario al caso
curl -X POST http://localhost:9000/api/case/$CASE_ID/note \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Executive briefing completed. CISO briefed at 14:30.",
    "visibility": "analyst"
  }'

# Ver timeline completo
curl -H "Authorization: Bearer $API_KEY" \
     http://localhost:9000/api/case/$CASE_ID/timeline | jq '.'

# Exportar timeline
curl -H "Authorization: Bearer $API_KEY" \
     http://localhost:9000/api/case/$CASE_ID/timeline\?export\=csv > incident-timeline.csv
```

### Reportes y métricas

#### Generar reporte de caso

```bash
# Generar reporte Markdown
curl -H "Authorization: Bearer $API_KEY" \
     http://localhost:9000/api/case/$CASE_ID/report/markdown > incident-report.md

# Generar reporte PDF
curl -H "Authorization: Bearer $API_KEY" \
     http://localhost:9000/api/case/$CASE_ID/report/pdf > incident-report.pdf

# Generar reporte JSON (estructurado)
curl -H "Authorization: Bearer $API_KEY" \
     http://localhost:9000/api/case/$CASE_ID/report/json > incident-report.json
```

#### Script de métricas de SOC

```bash
#!/bin/bash
# Script: soc-metrics.sh
# Genera métricas mensuales de SOC

API_KEY="YOUR_API_KEY"
START_DATE="2025-01-01"
END_DATE="2025-01-31"

echo "=== SOC Metrics Report - $START_DATE to $END_DATE ==="
echo ""

# Casos creados
CASES_CREATED=$(curl -s -X POST http://localhost:9000/api/case/_search \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"range\": {\"createdAt\": {\"gte\": \"$START_DATE\", \"lte\": \"$END_DATE\"}}}}" \
  | jq '.total')
echo "Total Cases Created: $CASES_CREATED"

# Casos por severidad
for SEVERITY in 1 2 3 4; do
  COUNT=$(curl -s -X POST http://localhost:9000/api/case/_search \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": {\"bool\": {\"must\": [{\"term\": {\"severity\": $SEVERITY}}, {\"range\": {\"createdAt\": {\"gte\": \"$START_DATE\", \"lte\": \"$END_DATE\"}}}]}}}" \
    | jq '.total')
  echo "Severity $SEVERITY: $COUNT"
done

# Tiempo promedio de resolución
AVG_RESOLUTION=$(curl -s -X POST http://localhost:9000/api/case/_search \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"range\": {\"createdAt\": {\"gte\": \"$START_DATE\", \"lte\": \"$END_DATE\"}}}}" \
  | jq -r '.hits[] | select(.status == "Resolved") | .metrics.resolutionTime' \
  | awk '{sum+=$1; count++} END {print (count>0 ? sum/count : 0)}')

echo "Average Resolution Time: $AVG_RESOLUTION hours"

# Top 5 analistas por número de casos
TOP_ANALYSTS=$(curl -s -X POST http://localhost:9000/api/case/_search \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"range\": {\"createdAt\": {\"gte\": \"$START_DATE\", \"lte\": \"$END_DATE\"}}}}" \
  | jq -r '.hits[] | .assignees[]' \
  | sort | uniq -c | sort -rn | head -5)

echo ""
echo "Top 5 Analysts:"
echo "$TOP_ANALYSTS"
```

#### Dashboard personalizado con API

```python
#!/usr/bin/env python3
# Script: generate-dashboard.py
# Genera dashboard HTML con métricas de TheHive

import json
import requests
from datetime import datetime, timedelta

THEHIVE_URL = "http://localhost:9000"
API_KEY = "YOUR_API_KEY"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def get_cases(days=30):
    """Obtener casos de los últimos N días"""
    end_date = datetime.now().isoformat()
    start_date = (datetime.now() - timedelta(days=days)).isoformat()

    query = {
        "query": {
            "range": {
                "createdAt": {
                    "gte": start_date,
                    "lte": end_date
                }
            }
        }
    }

    response = requests.post(
        f"{THEHIVE_URL}/api/case/_search",
        headers=headers,
        json=query
    )
    return response.json()

def generate_html_report(cases_data):
    """Generar reporte HTML"""
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>SOC Dashboard - {datetime.now().strftime('%Y-%m-%d')}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .metric {{ background: #f0f0f0; padding: 20px; margin: 10px; border-radius: 5px; }}
        .metric h2 {{ margin-top: 0; }}
        .severity {{ display: inline-block; margin: 5px; padding: 10px; }}
    </style>
</head>
<body>
    <h1>SOC Dashboard</h1>
    <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>

    <div class="metric">
        <h2>Total Cases (Last 30 days)</h2>
        <p>{cases_data['total']}</p>
    </div>

    <div class="metric">
        <h2>Severity Breakdown</h2>
        <div>
    """

    for case in cases_data.get('hits', []):
        severity = case.get('severity', 0)
        html += f'<span class="severity">Severity {severity}</span>'

    html += """
        </div>
    </div>

    <div class="metric">
        <h2>Recent Cases</h2>
        <table border="1" style="width:100%">
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Created</th>
            </tr>
    """

    for case in cases_data.get('hits', [])[:10]:
        html += f"""
            <tr>
                <td>{case.get('_id', '')}</td>
                <td>{case.get('title', '')}</td>
                <td>{case.get('severity', '')}</td>
                <td>{case.get('status', '')}</td>
                <td>{case.get('createdAt', '')}</td>
            </tr>
        """

    html += """
        </table>
    </div>
</body>
</html>
    """

    with open('soc-dashboard.html', 'w') as f:
        f.write(html)

    print("Dashboard generated: soc-dashboard.html")

if __name__ == "__main__":
    cases = get_cases(30)
    generate_html_report(cases)
```

---

## 6. Integración con NeoAnd

### Conexión con Cortex para análisis automatizado

#### Configuración de Analyzers

**Instalar analyzers comunes:**

```bash
# Acceder al contenedor Cortex
docker exec -it cortex bash

# Instalar analyzers vía pip (ejemplo: VirusTotal)
pip3 install cortexutils

# Reiniciar Cortex
docker-compose restart cortex
```

**Configurar API keys de analyzers:**

```bash
# Crear archivo de configuración de API keys
cat > /opt/cortex/conf/application.conf << 'EOF'
secret_key = "YOUR_SECRET_KEY"

# VirusTotal
analyzer {
  VirusTotal_GetReport_3_0 {
    key = "YOUR_VIRUSTOTAL_API_KEY"
    timeout = 300
  }
  # Shodan
  Shodan_Host_2_0 {
    key = "YOUR_SHODAN_API_KEY"
  }
  # URLHaus
  URLHaus_Query_1_0 {
  }
  # PassiveTotal
  PassiveTotal_Components_2_0 {
    username = "YOUR_PT_USERNAME"
    key = "YOUR_PT_API_KEY"
  }
}
EOF

docker-compose restart cortex
```

#### Workflow automatizado con Cortex

**Script: analyze-iocs.py**

```python
#!/usr/bin/env python3
"""
Script para análisis automatizado de IOCs con Cortex
"""
import json
import requests
import time
from typing import List, Dict

THEHIVE_URL = "http://localhost:9000"
CORTEX_URL = "http://localhost:9001"
API_KEY = "YOUR_API_KEY"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def analyze_observable(case_id: str, observable_id: str, analyzers: List[str]):
    """Ejecutar análisis con múltiples analyzers"""
    results = {}

    for analyzer_id in analyzers:
        print(f"Executing {analyzer_id}...")
        job = {
            "analyzerId": analyzer_id,
            "observableId": observable_id
        }

        response = requests.post(
            f"{THEHIVE_URL}/api/case/{case_id}/observable/{observable_id}/analyzer",
            headers=headers,
            json=job
        )

        if response.status_code == 201:
            job_id = response.json().get('id')
            print(f"Job {job_id} started for {analyzer_id}")

            # Esperar resultado
            while True:
                time.sleep(5)
                result = requests.get(
                    f"{CORTEX_URL}/api/analyzer/_search",
                    headers={"Authorization": f"Bearer {CORTEX_API_KEY}"},
                    params={"filter": f"id:{job_id}"}
                )

                if result.json().get('status') == 'Success':
                    results[analyzer_id] = result.json()
                    break
                elif result.json().get('status') == 'Failure':
                    print(f"Analyzer {analyzer_id} failed: {result.json().get('details')}")
                    break

    return results

def extract_iocs(case_id: str) -> List[Dict]:
    """Extraer IOCs de un caso"""
    response = requests.get(
        f"{THEHIVE_URL}/api/case/{case_id}/observable",
        headers=headers
    )
    return response.json()

def enrich_with_threat_intel(iocs: List[Dict]) -> Dict:
    """Enriquecer IOCs con threat intelligence"""
    enriched = {}

    for ioc in iocs:
        ioc_type = ioc.get('dataType')
        ioc_value = ioc.get('data')
        ioc_id = ioc.get('id')

        # Aplicar analyzers basados en tipo de IOC
        if ioc_type == 'domain':
            analyzers = ['VirusTotal_GetReport_3_0', 'Shodan_Host_2_0', 'MISP_Search']
        elif ioc_type == 'ip':
            analyzers = ['VirusTotal_GetReport_3_0', 'Shodan_Host_2_0', 'IPInfo_2_0']
        elif ioc_type == 'hash':
            analyzers = ['VirusTotal_GetReport_3_0', 'MalwareBazaar_Query_1_0']
        elif ioc_type == 'url':
            analyzers = ['VirusTotal_GetReport_3_0', 'URLHaus_Query_1_0']
        else:
            analyzers = []

        if analyzers:
            results = analyze_observable(case_id, ioc_id, analyzers)
            enriched[ioc_value] = results

    return enriched

if __name__ == "__main__":
    import sys

    case_id = sys.argv[1] if len(sys.argv) > 1 else input("Enter case ID: ")

    print(f"Analyzing case {case_id}...")
    iocs = extract_iocs(case_id)
    print(f"Found {len(iocs)} observables")

    results = enrich_with_threat_intel(iocs)

    # Guardar resultados
    with open(f'analysis-case-{case_id}.json', 'w') as f:
        json.dump(results, f, indent=2)

    print(f"Analysis complete. Results saved to analysis-case-{case_id}.json")
```

**Configurar responders automatizados:**

```bash
# Responder para automáticamente crear tickets en Odoo cuando se cierre un caso
curl -X POST http://localhost:9001/api/responder \
  -H "Authorization: Bearer $CORTEX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Create-Odoo-Ticket",
    "version": "1.0",
    "author": "NeoAnd Team",
    "description": "Crear ticket en Odoo cuando caso se cierra",
    "dataTypes": ["case"],
    "command": ["/usr/bin/python3", "/opt/cortex/responders/create_odoo_ticket.py"],
    "configuration": {
      "odoo_url": "https://odoo.company.com",
      "odoo_db": "neoand",
      "odoo_user": "thehive@company.com",
      "odoo_password": "SECURE_PASSWORD"
    }
  }'
```

### Integración con MISP para threat intelligence

#### Configuración bidireccional

**Sincronizar IOCs con MISP:**

```bash
#!/bin/bash
# Script: sync-misp.sh
# Sincroniza IOCs de casos cerrados con MISP

API_KEY="YOUR_THEHIVE_API_KEY"
MISP_KEY="YOUR_MISP_API_KEY"

# Obtener casos cerrados (últimos 7 días)
CASES=$(curl -s -X POST http://localhost:9000/api/case/_search \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "bool": {
        "must": [
          {"term": {"status": "Resolved"}},
          {"range": {"closedDate": {"gte": "now-7d"}}}
        ]
      }
    },
    "size": 100
  }')

# Extraer IOCs únicos
echo "$CASES" | jq -r '.hits[] | .observable[]? | .data' | sort -u > iocs.txt

# Enviar a MISP
while IFS= read -r ioc; do
  echo "Sharing IOC: $ioc"

  curl -s -X POST https://misp.company.com/events/add \
    -H "Authorization: $MISP_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"Event\": {
        \"info\": \"IOC from TheHive - $ioc\",
        \"threat_level_id\": 2,
        \"analysis\": 1,
        \"distribution\": 3,
        \"Attribute\": [{
          \"value\": \"$ioc\",
          \"category\": \"Network activity\",
          \"type\": \"domain\"
        }]
      }
    }"
done < iocs.txt
```

**Enriquecer casos con MISP:**

```python
#!/usr/bin/env python3
# Script: enrich-with-misp.py
# Enriquecer observables con MISP

import json
import requests

THEHIVE_URL = "http://localhost:9000"
MISP_URL = "https://misp.company.com"
API_KEY = "YOUR_API_KEY"
MISP_KEY = "YOUR_MISP_KEY"

headers = {"Authorization": f"Bearer {API_KEY}"}

def search_misp(ioc_value: str) -> dict:
    """Buscar IOC en MISP"""
    response = requests.post(
        f"{MISP_URL}/attributes/restSearch",
        headers={"Authorization": MISP_KEY},
        json={
            "returnFormat": "json",
            "value": ioc_value,
            "limit": 10
        }
    )
    return response.json()

def enrich_case(case_id: str):
    """Enriquecer caso con datos de MISP"""
    # Obtener observables
    response = requests.get(
        f"{THEHIVE_URL}/api/case/{case_id}/observable",
        headers=headers
    )

    observables = response.json()

    for obs in observables:
        ioc_value = obs['data']

        # Buscar en MISP
        misp_data = search_misp(ioc_value)

        if misp_data.get('response'):
            # Agregar nota con datos de MISP
            note = {
                "text": f"MISP Intelligence:\n{json.dumps(misp_data, indent=2)}",
                "visibility": "analyst"
            }

            requests.post(
                f"{THEHIVE_URL}/api/case/{case_id}/note",
                headers=headers,
                json=note
            )

            # Actualizar tags del observable
            requests.patch(
                f"{THEHIVE_URL}/api/case/{case_id}/observable/{obs['id']}",
                headers={**headers, "Content-Type": "application/json"},
                json={"tags": ["misp-hit"] + obs.get('tags', [])}
            )

            print(f"Enriched observable {ioc_value} with MISP data")

if __name__ == "__main__":
    import sys
    case_id = sys.argv[1]
    enrich_case(case_id)
```

### Configuración con Elastic para SIEM

#### Conectar Elastic Security con TheHive

**En Elastic Security, configurar action connector:**

```bash
# Crear webhook connector
curl -X POST http://elastic:9200/.fleet-actions/_doc \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TheHive-Create-Case",
    "connector_type": "webhook",
    "config": {
      "url": "http://thehive:9000/api/case",
      "method": "POST",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      },
      "body": {
        "title": "{{alert.title}}",
        "description": "{{alert.description}}",
        "severity": "{{alert.severity}}",
        "tags": "{{alert.tags}}"
      }
    }
  }'
```

**Rule de detección que crea caso automáticamente:**

```json
{
  "name": "Critical Alert to TheHive",
  "consumer": "siem",
  "rule_id": "critical-alert-to-thehive",
  "params": {
    "threatIndicatorMatch": {
      "indicator": {
        "type": "file.hash.md5"
      }
    }
  },
  "actions": [
    {
      "group": "critical",
      "params": {
        "title": "Malware Detected - {{alert.title}}",
        "description": "Critical malware detected by Elastic",
        "severity": 4,
        "tags": ["malware", "elastic", "critical"]
      }
    }
  ]
}
```

**Pipeline de correlación:**

```python
#!/usr/bin/env python3
# Script: correlate-siem.py
# Correlaciona alertas de SIEM con casos activos

import json
import requests

ELASTIC_URL = "http://elastic:9200"
THEHIVE_URL = "http://localhost:9000"
API_KEY = "YOUR_API_KEY"

def get_open_cases():
    """Obtener casos abiertos de TheHive"""
    response = requests.post(
        f"{THEHIVE_URL}/api/case/_search",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "query": {"term": {"status": "Open"}},
            "size": 1000
        }
    )
    return response.json()

def correlate_alerts(cases: list, alerts: list) -> list:
    """Correlacionar alertas con casos existentes"""
    matches = []

    for alert in alerts:
        alert_iocs = extract_iocs(alert)

        for case in cases:
            case_iocs = [obs['data'] for obs in case.get('observable', [])]

            # Verificar coincidencia de IOCs
            common_iocs = set(alert_iocs) & set(case_iocs)

            if common_iocs:
                matches.append({
                    'alert': alert,
                    'case': case,
                    'common_iocs': list(common_iocs)
                })

    return matches

def extract_iocs(event: dict) -> list:
    """Extraer IOCs de un evento"""
    iocs = []

    # Extraer campos comunes
    for field in ['source.ip', 'destination.ip', 'threat.indicator.type', 'file.hash.md5']:
        value = get_nested_field(event, field)
        if value:
            iocs.append(value)

    return iocs

def get_nested_field(event: dict, path: str):
    """Obtener campo anidado"""
    fields = path.split('.')
    value = event

    for field in fields:
        if isinstance(value, dict):
            value = value.get(field)
        else:
            return None

    return value

if __name__ == "__main__":
    print("Getting open cases from TheHive...")
    cases_data = get_open_cases()
    cases = cases_data.get('hits', [])

    print(f"Found {len(cases)} open cases")

    # Buscar nuevas alertas en Elastic
    alerts = requests.post(
        f"{ELASTIC_URL}/_security/alert/_search",
        headers={"kbn-xsrf": "true"},
        json={
            "query": {
                "bool": {
                    "must": [
                        {"term": {"status": "open"}},
                        {"range": {"@timestamp": {"gte": "now-1h"}}}
                    ]
                }
            },
            "size": 100
        }
    ).json()

    print(f"Found {len(alerts)} new alerts")

    # Correlacionar
    matches = correlate_alerts(cases, alerts)

    for match in matches:
        # Crear enlace entre alerta y caso
        note = {
            "text": f"Related to alert: {match['alert']['title']}\nCommon IOCs: {', '.join(match['common_iocs'])}",
            "visibility": "analyst"
        }

        requests.post(
            f"{THEHIVE_URL}/api/case/{match['case']['_id']}/note",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json=note
        )

        print(f"Linked alert to case {match['case']['_id']}")
```

### Webhooks y APIs

#### Configurar webhooks en TheHive

```hocon
# En application.conf
play.http.secret.key="YOUR_SECRET"

# Configuración de webhooks
webhook {
  enabled = true
  endpoints = [
    {
      name = "Slack-Notifications"
      url = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
      events = ["CaseCreated", "CaseUpdated", "AlertCreated"]
      secret = "SLACK_WEBHOOK_SECRET"
    },
    {
      name = "NeoAnd-Stack"
      url = "https://neoand.company.com/api/webhooks/thehive"
      events = ["CaseResolved", "CaseClosed"]
      headers = {
        "X-API-Key": "YOUR_NEOAND_API_KEY"
      }
    }
  ]
}
```

**Webhook handler personalizado:**

```python
#!/usr/bin/env python3
# Script: thehive-webhook-listener.py
# Maneja webhooks de TheHive y ejecuta acciones

from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)

WEBHOOK_SECRET = "YOUR_WEBHOOK_SECRET"

def verify_signature(payload: bytes, signature: str) -> bool:
    """Verificar firma del webhook"""
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

@app.route('/webhook/thehive', methods=['POST'])
def handle_webhook():
    """Manejar webhook de TheHive"""
    signature = request.headers.get('X-TheHive-Signature', '')
    payload = request.get_data()

    if not verify_signature(payload, signature):
        return jsonify({"error": "Invalid signature"}), 401

    event = request.json

    # Procesar evento
    event_type = event.get('type')
    case_id = event.get('case', {}).get('id')

    if event_type == 'CaseCreated':
        # Notificar a Slack
        notify_slack(event)

    elif event_type == 'CaseResolved':
        # Actualizar CMDB
        update_cmdb(event)

    elif event_type == 'AlertCreated':
        # Evaluar para crear caso automáticamente
        evaluate_alert(event)

    return jsonify({"status": "processed"}), 200

def notify_slack(event: dict):
    """Enviar notificación a Slack"""
    # Implementar notificación a Slack
    pass

def update_cmdb(event: dict):
    """Actualizar CMDB (Netbox)"""
    # Obtener datos del caso
    case = event.get('case', {})
    affected_systems = case.get('customFields', {}).get('affectedSystems', [])

    # Actualizar estado en Netbox
    for system in affected_systems:
        update_netbox_device(system, status="maintenance")

def evaluate_alert(event: dict):
    """Evaluar alerta para escalación automática"""
    alert = event.get('alert', {})
    severity = alert.get('severity', 0)

    if severity >= 3:  # Alta severidad
        # Crear caso inmediatamente
        create_case_from_alert(alert)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

**API Reference - Endpoints principales:**

```bash
# Casos
POST   /api/case                    # Crear caso
GET    /api/case/{id}              # Obtener caso
PATCH  /api/case/{id}              # Actualizar caso
DELETE /api/case/{id}              # Eliminar caso
POST   /api/case/_search           # Buscar casos
POST   /api/case/{id}/report       # Generar reporte

# Alertas
POST   /api/alert                  # Crear alerta
GET    /api/alert/{id}             # Obtener alerta
PATCH  /api/alert/{id}             # Actualizar alerta
POST   /api/alert/{id}/createCase  # Promover a caso

# Observables
POST   /api/case/{id}/observable   # Agregar observable
GET    /api/case/{id}/observable   # Listar observables
DELETE /api/case/{id}/observable/{obs_id}  # Eliminar observable
POST   /api/case/{id}/observable/{obs_id}/analyzer  # Ejecutar análisis

# Tareas
POST   /api/case/{id}/task         # Crear tarea
PATCH  /api/case/{id}/task/{task_id}  # Actualizar tarea
POST   /api/case/{id}/task/{task_id}/comment  # Comentar

# Usuarios
POST   /api/user                   # Crear usuario
GET    /api/user                   # Listar usuarios
PATCH  /api/user/{id}              # Actualizar usuario

# Templates
POST   /api/case-template          # Crear template
GET    /api/case-template          # Listar templates
```

**Cliente Python para TheHive:**

```python
#!/usr/bin/env python3
"""
Cliente Python para TheHive
"""
import requests
from typing import Dict, List, Optional

class TheHiveClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def create_case(self, title: str, description: str = '',
                   severity: int = 2, tags: List[str] = None,
                   template: str = None) -> Dict:
        """Crear nuevo caso"""
        data = {
            'title': title,
            'description': description,
            'severity': severity,
            'tags': tags or []
        }

        if template:
            data['template'] = template

        response = requests.post(
            f'{self.base_url}/api/case',
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()

    def search_cases(self, query: Dict = None) -> List[Dict]:
        """Buscar casos"""
        if query is None:
            query = {'query': {'match_all': {}}}

        response = requests.post(
            f'{self.base_url}/api/case/_search',
            headers=self.headers,
            json=query
        )
        response.raise_for_status()
        return response.json()

    def get_case(self, case_id: str) -> Dict:
        """Obtener caso por ID"""
        response = requests.get(
            f'{self.base_url}/api/case/{case_id}',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def add_observable(self, case_id: str, data_type: str, data: str,
                      message: str = '', tlp: int = 2, tags: List[str] = None) -> Dict:
        """Agregar observable a caso"""
        observable = {
            'dataType': data_type,
            'data': data,
            'message': message,
            'tlp': tlp,
            'tags': tags or []
        }

        response = requests.post(
            f'{self.base_url}/api/case/{case_id}/observable',
            headers=self.headers,
            json=observable
        )
        response.raise_for_status()
        return response.json()

    def run_analyzer(self, case_id: str, observable_id: str, analyzer_id: str) -> Dict:
        """Ejecutar analyzer en observable"""
        data = {'analyzerId': analyzer_id}

        response = requests.post(
            f'{self.base_url}/api/case/{case_id}/observable/{observable_id}/analyzer',
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()

# Ejemplo de uso
if __name__ == '__main__':
    client = TheHiveClient('http://localhost:9000', 'YOUR_API_KEY')

    # Crear caso
    case = client.create_case(
        title="Suspicious Activity Detected",
        description="EDR detected lateral movement",
        severity=3,
        tags=["EDR", "lateral-movement"]
    )

    print(f"Case created: {case['id']}")

    # Agregar observable
    obs = client.add_observable(
        case_id=case['id'],
        data_type='ip',
        data='10.0.0.55',
        message='Suspicious IP',
        tags=['malicious']
    )

    # Ejecutar análisis
    result = client.run_analyzer(
        case_id=case['id'],
        observable_id=obs['id'],
        analyzer_id='VirusTotal_GetReport_3_0'
    )

    print(f"Analysis started: {result}")
```

---

## 7. Operación y Mantenimiento

### Backup y recovery

#### Estrategia de backup

```bash
#!/bin/bash
# Script: backup-thehive.sh
# Realiza backup completo de TheHive

BACKUP_DIR="/backups/thehive/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/thehive-backup.log"

mkdir -p "$BACKUP_DIR"

echo "Starting TheHive backup at $(date)" >> "$LOG_FILE"

# 1. Backup de base de datos
echo "Backing up database..." >> "$LOG_FILE"
docker exec mariadb mysqldump -u root -p${DB_ROOT_PASSWORD} thehive > \
  "$BACKUP_DIR/thehive-db.sql"

# 2. Backup de configuración
echo "Backing up configuration..." >> "$LOG_FILE"
docker cp thehive:/opt/thehive/conf/application.conf "$BACKUP_DIR/"
docker cp cortex:/opt/cortex/conf/application.conf "$BACKUP_DIR/"

# 3. Backup de archivos adjuntos
echo "Backing up attachments..." >> "$LOG_FILE"
docker cp thehive:/opt/thehive/files "$BACKUP_DIR/"

# 4. Backup de Elasticsearch (opcional)
echo "Backing up Elasticsearch..." >> "$LOG_FILE"
curl -s http://localhost:9200/_snapshot/backup/snapshot_$(date +%Y%m%d) \
  -X PUT -H 'Content-Type: application/json' \
  -d '{"indices": "thehive*", "ignore_unavailable": true, "include_global_state": false}'

# 5. Comprimir backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .
rm -rf "$BACKUP_DIR"

echo "Backup completed: $BACKUP_DIR.tar.gz" >> "$LOG_FILE"

# 6. Retener solo últimos 7 backups
find /backups/thehive/ -name "*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed at $(date)" >> "$LOG_FILE"
```

**Programar backup automático:**

```bash
# Agregar a crontab
crontab -e

# Línea para backup diario a las 2 AM
0 2 * * * /opt/scripts/backup-thehive.sh >> /var/log/thehive-backup.log 2>&1

# Backup cada 6 horas
0 */6 * * * /opt/scripts/backup-thehive.sh >> /var/log/thehive-backup.log 2>&1
```

#### Procedimiento de recovery

```bash
#!/bin/bash
# Script: restore-thehive.sh
# Restaurar TheHive desde backup

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

echo "Starting restore from $BACKUP_FILE"

# 1. Extraer backup
TEMP_DIR="/tmp/thehive-restore-$(date +%s)"
mkdir -p "$TEMP_DIR"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# 2. Detener servicios
docker-compose down

# 3. Restaurar base de datos
echo "Restoring database..."
docker run --rm -v $(pwd):/backup \
  -v mariadb-data:/var/lib/mysql \
  --network container:mariadb \
  mariadb bash -c "mysql -u root -p\$MYSQL_ROOT_PASSWORD < /backup/$(basename $TEMP_DIR)/thehive-db.sql"

# 4. Restaurar configuración
echo "Restoring configuration..."
docker cp "$TEMP_DIR/application.conf" thehive:/opt/thehive/conf/

# 5. Restaurar archivos
echo "Restoring files..."
docker cp "$TEMP_DIR/files" thehive:/opt/thehive/

# 6. Iniciar servicios
docker-compose up -d

# 7. Verificar estado
sleep 30
docker-compose ps

echo "Restore completed"
```

#### Backup de Elasticsearch

```bash
# Crear snapshot repository
curl -X PUT "localhost:9200/_snapshot/thehive_backup" \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/backup/elasticsearch",
      "compress": true
    }
  }'

# Crear snapshot
curl -X PUT "localhost:9200/_snapshot/thehive_backup/snapshot_$(date +%Y%m%d)" \
  -H 'Content-Type: application/json' \
  -d '{
    "indices": "thehive*",
    "ignore_unavailable": true,
    "include_global_state": false
  }'

# Ver snapshots
curl "localhost:9200/_cat/snapshots/thehive_backup?v"

# Restaurar snapshot
curl -X POST "localhost:9200/_snapshot/thehive_backup/snapshot_YYYYMMDD/_restore" \
  -H 'Content-Type: application/json' \
  -d '{
    "indices": "thehive*",
    "ignore_unavailable": true
  }'
```

### Monitoreo

#### Métricas clave

```bash
#!/bin/bash
# Script: monitor-thehive.sh
# Monitorea salud de TheHive

ALERT_EMAIL="admin@company.com"
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Verificar Elasticsearch
check_elasticsearch() {
    STATUS=$(curl -s http://localhost:9200/_cluster/health?pretty | jq -r '.status')

    if [ "$STATUS" != "green" ]; then
        send_alert "Elasticsearch status is $STATUS"
        return 1
    fi
    return 0
}

# Verificar Cortex
check_cortex() {
    STATUS=$(curl -s http://localhost:9001/api/status | jq -r '.status')

    if [ "$STATUS" != "OK" ]; then
        send_alert "Cortex status is $STATUS"
        return 1
    fi
    return 0
}

# Verificar TheHive
check_thehive() {
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/api/status)

    if [ "$HTTP_CODE" != "200" ]; then
        send_alert "TheHive is not responding (HTTP $HTTP_CODE)"
        return 1
    fi
    return 0
}

# Verificar uso de disco
check_disk_space() {
    USAGE=$(df /opt/thehive/data | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ "$USAGE" -gt 85 ]; then
        send_alert "Disk usage is at ${USAGE}%"
        return 1
    fi
    return 0
}

# Verificar memoria
check_memory() {
    MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')

    if [ "$MEM_USAGE" -gt 90 ]; then
        send_alert "Memory usage is at ${MEM_USAGE}%"
        return 1
    fi
    return 0
}

# Enviar alerta
send_alert() {
    MESSAGE="$1"
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$TIMESTAMP] ALERT: $MESSAGE" >> /var/log/thehive-monitor.log

    # Enviar a Slack
    curl -X POST "$WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"🚨 TheHive Alert: $MESSAGE\"}"

    # Enviar email (si está configurado)
    echo "$MESSAGE" | mail -s "TheHive Alert" "$ALERT_EMAIL"
}

# Ejecutar verificaciones
echo "Running health checks at $(date)"

check_elasticsearch
check_cortex
check_thehive
check_disk_space
check_memory

echo "Health check completed"
```

#### Dashboard de monitoreo con Prometheus

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana:/etc/grafana/provisioning

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
  grafana_data:
```

**prometheus.yml:**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "thehive_alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'thehive'
    static_configs:
      - targets: ['thehive:9000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'cortex'
    static_configs:
      - targets: ['cortex:9001']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'elasticsearch'
    static_configs:
      - targets: ['elasticsearch:9200']
    metrics_path: '/_prometheus/metrics'
    scrape_interval: 30s

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### Logs centralizados con ELK

```yaml
# Configurar Filebeat para enviar logs a Elasticsearch

filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/thehive/*.log
  fields:
    service: thehive
    log_type: application
  fields_under_root: true
  multiline.pattern: '^\d{4}-\d{2}-\d{2}'
  multiline.negate: true
  multiline.match: after

- type: log
  enabled: true
  paths:
    - /var/log/thehive/cortex/*.log
  fields:
    service: cortex
    log_type: application
  fields_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "thehive-logs-%{+yyyy.MM.dd}"

setup.template.name: "thehive-logs"
setup.template.pattern: "thehive-logs-*"

processors:
- add_host_metadata:
    when.not.contains.tags: forwarded
- add_docker_metadata: ~
```

### Performance tuning

#### Optimización de Elasticsearch

```yaml
# /etc/elasticsearch/elasticsearch.yml
cluster.name: thehive-cluster

# Memoria heap (no más del 50% de RAM, max 31GB)
bootstrap.memory_lock: true

# Configuración de índices
action.destructive_requires_name: true

# Configuración de thread pools
thread_pool:
  write:
    queue_size: 1000
  search:
    queue_size: 1000

# Cache
indices.queries.cache.size: 512mb
indices.fielddata.cache.size: 512mb
indices.queries.cache.count: 1000

# Circuit breakers
indices.breaker.fielddata.limit: 60%
indices.breaker.request.limit: 60%
indices.breaker.total.limit: 95%

# Tiered merge policy
index:
  merge:
    policy:
      max_merge_at_once: 10
      segments_per_tier: 10
  refresh_interval: 10s
  number_of_replicas: 1
  number_of_shards: 1
```

**Comandos de optimización:**

```bash
# Optimizar índice existente
POST /thehive-000001/_forcemerge?max_num_segments=1

# Reindexar índice con nueva configuración
POST /_reindex
{
  "source": {"index": "thehive-000001"},
  "dest": {"index": "thehive-000002", "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "30s"
  }}
}

# Limpiar índices antiguos (más de 90 días)
curl -X DELETE "localhost:9200/thehive-$(date -d '90 days ago' +%Y.%m.%d)"

# Estadísticas de cluster
curl -s http://localhost:9200/_cluster/stats?pretty

# Estadísticas de indices
curl -s http://localhost:9200/_cat/indices?v

# Uso de disco por índice
curl -s http://localhost:9200/_cat/shards?v | awk '{print $1, $3}' | sort | uniq -c
```

#### Optimización de TheHive

```hocon
# application.conf - Configuración de performance

# Pool de conexiones a BD
db.default.connectionPool.maxSize = 50
db.default.connectionPool.minSize = 10
db.default.connectionPool.timeout = 30 seconds
db.default.connectionPool.maxLifetime = 30 minutes

# Paginación
paginate {
  pageSize = 100
  maxPageSize = 500
}

# Cache
play.cache.defaultCache = {
  ttl = 30s
  maxEntries = 10000
}

# Configuración de búsquedas
search {
  timeout = 30 seconds
  size = 100
}

# Workers para Cortex
cortex {
  servers = [
    {
      name = "Primary"
      url = "http://cortex:9001"
      key = "KEY"
      async = true
      maxWorkers = 5
    }
  ]
}

# Akka (para clustering)
akka {
  actor {
    default-dispatcher {
      fork-join-executor {
        parallelism-min = 8
        parallelism-factor = 2.0
        parallelism-max = 16
      }
    }
  }
}
```

#### Monitoreo de performance

```bash
#!/bin/bash
# Script: performance-check.sh

# Tiempo de respuesta promedio
AVG_RESPONSE=$(curl -o /dev/null -s -w '%{time_total}\n' \
  -H "Authorization: Bearer $API_KEY" \
  http://localhost:9000/api/case/_stats)

echo "Average response time: ${AVG_RESPONSE}s"

# Número de casos abiertos
OPEN_CASES=$(curl -s -X POST http://localhost:9000/api/case/_search \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": {"term": {"status": "Open"}}}' \
  | jq '.total')

echo "Open cases: $OPEN_CASES"

# Observables por segundo
OBS_PER_SEC=$(curl -s http://localhost:9000/api/observable/_stats \
  | jq '.total')

echo "Total observables: $OBS_PER_SEC"

# Verificar queries lentas
SLOW_QUERIES=$(curl -s "localhost:9200/_cat/indices?v&s=docs.count:desc" | tail -n +2 | wc -l)
echo "Indices with high document count: $SLOW_QUERIES"

# Heap de Elasticsearch
ES_HEAP=$(curl -s http://localhost:9200/_nodes/stats/jvm | \
  jq '.nodes[] | .jvm.heap_used_percent')

if (( $(echo "$ES_HEAP > 80" | bc -l) )); then
  echo "WARNING: Elasticsearch heap usage at ${ES_HEAP}%"
fi
```

### Troubleshooting

#### Problemas comunes y soluciones

**1. TheHive no inicia**

```bash
# Verificar logs
docker-compose logs thehive

# Verificar permisos
ls -la /opt/thehive/

# Verificar configuración
cat /opt/thehive/conf/application.conf | grep -E "secret|db|search"

# Verificar conectividad a BD
docker exec thehive nc -zv mariadb 3306

# Verificar conectividad a Elasticsearch
docker exec thehive nc -zv elasticsearch 9200

# Regenerar secret key si es necesario
NEW_SECRET=$(openssl rand -base64 32)
sed -i "s/play.http.secret.key=.*/play.http.secret.key=\"$NEW_SECRET\"/" \
  /opt/thehive/conf/application.conf
```

**2. Elasticsearch no inicia**

```bash
# Verificar memoria
free -h

# Verificar límites de sistema
sysctl vm.max_map_count
sysctl vm.swappiness

# Configurar límites si es necesario
echo 'vm.max_map_count=262144' >> /etc/sysctl.conf
echo 'vm.swappiness=1' >> /etc/sysctl.conf
sysctl -p

# Verificar logs
tail -f /var/log/elasticsearch/thehive-cluster.log

# Verificar índices corruptos
curl -X GET "localhost:9200/_cluster/health?pretty"
curl -X GET "localhost:9200/_cat/indices?v"
```

**3. No se pueden crear casos**

```bash
# Verificar estado de Elasticsearch
curl http://localhost:9200/_cluster/health?pretty

# Verificar índice de casos
curl -X GET "localhost:9200/thehive*/_settings"

# Recrear índice si es necesario
curl -X DELETE "localhost:9200/thehive-000001"
# Reiniciar TheHive para recrear índice

# Verificar permisos de BD
docker exec mariadb mysql -u root -p -e "SHOW GRANTS FOR 'thehive'@'%';"
```

**4. Cortex no conecta con analyzers**

```bash
# Verificar estado
curl http://localhost:9001/api/status

# Verificar API keys
cat /opt/cortex/conf/application.conf | grep -E "key|api"

# Reinstalar analyzers
docker exec cortex python3 -m pip install --upgrade cortexutils

# Verificar conectividad externa
docker exec cortex curl -I https://www.virustotal.com

# Verificar certificados SSL
docker exec cortex cat /etc/ssl/certs/ca-certificates.crt | grep -A5 "MISC"
```

**5. Performance lenta**

```bash
# Verificar carga del sistema
top
htop
iotop
netstat -an | grep :9000 | wc -l

# Verificar métricas de Elasticsearch
curl -s http://localhost:9200/_cat/thread_pool?v

# Optimizar índice
curl -X POST "localhost:9200/thehive-000001/_forcemerge?max_num_segments=1"

# Verificar queries ejecutándose
curl -s http://localhost:9200/_tasks?detailed=true

# Limpiar índices antiguos
curl -X DELETE "localhost:9200/thehive-$(date -d '180 days ago' +%Y.%m.%d)"

# Aumentar cache
echo 'indices.queries.cache.size: 1gb' >> /etc/elasticsearch/elasticsearch.yml
systemctl restart elasticsearch
```

#### Herramientas de diagnóstico

```bash
#!/bin/bash
# Script: diagnostics.sh
# Recolecta información de diagnóstico

OUTPUT_FILE="thehive-diagnostics-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "=== TheHive Diagnostics ===" > diagnostics.txt
echo "Timestamp: $(date)" >> diagnostics.txt
echo "" >> diagnostics.txt

# Información del sistema
echo "=== System Information ===" >> diagnostics.txt
uname -a >> diagnostics.txt
free -h >> diagnostics.txt
df -h >> diagnostics.txt
echo "" >> diagnostics.txt

# Docker containers
echo "=== Docker Containers ===" >> diagnostics.txt
docker-compose ps >> diagnostics.txt
docker stats --no-stream >> diagnostics.txt
echo "" >> diagnostics.txt

# Servicios web
echo "=== Web Services ===" >> diagnostics.txt
curl -s -o /dev/null -w "TheHive: HTTP %{http_code}\n" http://localhost:9000/api/status >> diagnostics.txt
curl -s -o /dev/null -w "Cortex: HTTP %{http_code}\n" http://localhost:9001/api/status >> diagnostics.txt
curl -s -o /dev/null -w "Elasticsearch: HTTP %{http_code}\n" http://localhost:9200 >> diagnostics.txt
echo "" >> diagnostics.txt

# Elasticsearch cluster
echo "=== Elasticsearch Cluster ===" >> diagnostics.txt
curl -s http://localhost:9200/_cluster/health?pretty >> diagnostics.txt
echo "" >> diagnostics.txt

# Logs recientes
echo "=== Recent Errors ===" >> diagnostics.txt
docker-compose logs --tail=100 thehive 2>&1 | grep -i error >> diagnostics.txt
docker-compose logs --tail=100 elasticsearch 2>&1 | grep -i error >> diagnostics.txt
echo "" >> diagnostics.txt

# Configuración
echo "=== TheHive Configuration ===" >> diagnostics.txt
docker exec thehive cat /opt/thehive/conf/application.conf >> diagnostics.txt

# Comprimir
tar -czf "$OUTPUT_FILE" -C . diagnostics.txt
rm diagnostics.txt

echo "Diagnostics saved to: $OUTPUT_FILE"
```

---

## 8. Seguridad

### Configuración de seguridad

#### Hardening del sistema

```bash
#!/bin/bash
# Script: harden-thehive.sh
# Aplicar configuraciones de seguridad

echo "Applying security hardening for TheHive..."

# 1. Configurar firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow from 10.0.0.0/8 to any port 9000  # TheHive
ufw allow from 10.0.0.0/8 to any port 9001  # Cortex
ufw allow from 10.0.0.0/8 to any port 9200  # Elasticsearch
ufw --force enable

# 2. Configurar SSL/TLS
mkdir -p /etc/ssl/thehive

# Generar certificado autofirmado (usar certificados reales en producción)
openssl req -x509 -nodes -days 365 \
  -newkey rsa:4096 \
  -keyout /etc/ssl/thehive/private.key \
  -out /etc/ssl/thehive/certificate.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=thehive.company.com"

chmod 600 /etc/ssl/thehive/private.key
chmod 644 /etc/ssl/thehive/certificate.crt

# 3. Configurar fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[thehive]
enabled = true
port = 9000
filter = thehive
logpath = /var/log/thehive/access.log
maxretry = 3
bantime = 3600
findtime = 600

[cortex]
enabled = true
port = 9001
filter = cortex
logpath = /var/log/cortex/access.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

systemctl restart fail2ban

# 4. Configurar límites de sistema
cat >> /etc/security/limits.conf << 'EOF'
thehive soft nofile 65536
thehive hard nofile 65536
cortex soft nofile 65536
cortex hard nofile 65536
elasticsearch soft nofile 65536
elasticsearch hard nofile 65536
EOF

# 5. Configurar kernel
cat >> /etc/sysctl.conf << 'EOF'
# Configuraciones de seguridad
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv6.icmp_ignore_bogus_error_responses = 1
EOF

sysctl -p

echo "Security hardening completed"
```

#### Configuración SSL/TLS

**Configurar HTTPS en TheHive:**

```hocon
# application.conf
play.http.secret.key="YOUR_SECRET_KEY"

# Configuración HTTPS
play.server.https {
  enabled = true
  port = 9443
  keyStore {
    path = /etc/ssl/thehive/certificate.crt
    type = "X509"
  }
  keyStorePassword = "YOUR_KEY_PASSWORD"
  privateKey = /etc/ssl/thehive/private.key
}

# Configuración HTTP (redirigir a HTTPS)
play.server.http {
  port = 9000
  redirectEnabled = true
  redirectPort = 9443
}
```

**Configurar certificado Let's Encrypt:**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot certonly --standalone \
  --email admin@company.com \
  --agree-tos \
  --no-eff-email \
  -d thehive.company.com \
  -d cortex.company.com

# Configurar renovación automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Configurar nginx como reverse proxy
cat > /etc/nginx/sites-available/thehive << 'EOF'
server {
    listen 80;
    server_name thehive.company.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name thehive.company.com;

    ssl_certificate /etc/letsencrypt/live/thehive.company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thehive.company.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }
}
EOF

# Habilitar sitio
ln -s /etc/nginx/sites-available/thehive /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Autenticación

#### Configuración LDAP/Active Directory

```hocon
# application.conf
auth {
  provider = ldap

  ldap {
    url = "ldap://ldap.company.com:389"
    baseDN = "dc=company,dc=com"
    filter = "(&(uid={0})(memberOf=cn=soc-users,ou=groups,dc=company,dc=com))"

    # Bind DN para búsqueda
    userDN = "cn=thehive,ou=services,dc=company,dc=com"
    password = "LDAP_SERVICE_PASSWORD"

    # SSL/TLS
    ssl {
      enabled = true
      trustAllCerts = false
      trustStorePath = /etc/ssl/certs/ldap-ca.pem
      trustStorePassword = "TRUSTSTORE_PASSWORD"
    }

    # Mapeo de roles
    roleMapping = {
      "cn=soc-analysts,ou=groups,dc=company,dc=com" = analyst
      "cn=soc-managers,ou=groups,dc=company,dc=com" = org-admin
      "cn=soc-admins,ou=groups,dc=company,dc=com" = admin
    }

    # Cache de usuarios
    cache {
      enabled = true
      ttl = 3600 seconds
      maxSize = 1000 entries
    }
  }
}
```

#### Configuración OIDC (Keycloak)

```hocon
# application.conf
auth {
  provider = oidc

  oidc {
    provider = keycloak
    clientId = "thehive"
    clientSecret = "OIDC_CLIENT_SECRET"
    discoveryURI = "https://keycloak.company.com/auth/realms/thehive/.well-known/openid_configuration"

    # Tokens
    accessTokenMaxAge = 3600
    idTokenMaxAge = 300
    refreshTokenMaxAge = 604800

    # SSL
    ssl {
      enabled = true
      hostnameVerification = true
    }

    # Mapeo de roles
    roleMapping = [
      {
        thehiveRole = analyst
        externalRole = realm:soc-analyst
      },
      {
        thehiveRole = org-admin
        externalRole = realm:soc-manager
      },
      {
        thehiveRole = admin
        externalRole = realm:soc-admin
      }
    ]
  }
}
```

#### Autenticación de dos factores (2FA)

```hocon
# Configurar TOTP para usuarios locales
auth {
  provider = local

  totp {
    enabled = true
    issuer = "TheHive - Company SOC"
    digits = 6
    period = 30
  }
}
```

**Script para generar QR codes para 2FA:**

```python
#!/usr/bin/env python3
# Script: generate-qr-codes.py

import pyotp
import qrcode
from io import BytesIO

def generate_totp_secret():
    """Generar secreto TOTP para usuario"""
    return pyotp.random_base32()

def generate_qr_code(user_email, secret, issuer="TheHive-SOC"):
    """Generar QR code para configuración TOTP"""
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user_email,
        issuer_name=issuer
    )

    img = qrcode.make(totp_uri)
    img.save(f"qr-{user_email.replace('@', '-')}.png")

    return totp_uri

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: generate-qr-codes.py <user_email>")
        sys.exit(1)

    email = sys.argv[1]
    secret = generate_totp_secret()
    uri = generate_qr_code(email, secret)

    print(f"Secret for {email}: {secret}")
    print(f"QR code saved to: qr-{email.replace('@', '-')}.png")
    print(f"TOTP URI: {uri}")
```

### Auditoría

#### Configurar logging de auditoría

```hocon
# application.conf
audit {
  enabled = true
  retention = 730 days  # 2 años

  # Qué registrar
  events = [
    "login"
    "logout"
    "case.create"
    "case.update"
    "case.delete"
    "case.assign"
    "observable.add"
    "observable.remove"
    "alert.create"
    "alert.update"
    "user.create"
    "user.update"
    "user.delete"
  ]

  # Formato
  format = json

  # Destinos
  outputs = [
    {
      type = file
      path = /var/log/thehive/audit.log
      rotate = daily
    },
    {
      type = elasticsearch
      index = thehive-audit-%{+yyyy.MM.dd}
    },
    {
      type = webhook
      url = https://siem.company.com/api/audit
      ssl = true
    }
  ]
}

# Configuración de logs
play.http.requestHandler = "play.http.DevHttpRequestHandler"
play.http.secret.key="YOUR_SECRET"

play.logger {
  level = INFO
  console = false

  file {
    enabled = true
    file = /var/log/thehive/thehive.log
    maxSize = 100MB
    maxFiles = 10
  }

  audit {
    enabled = true
    file = /var/log/thehive/audit.log
  }
}
```

**Consolidar logs de auditoría:**

```bash
#!/bin/bash
# Script: audit-summary.sh
# Genera resumen de actividad diaria

DATE="${1:-$(date +%Y-%m-%d)}"
LOG_FILE="/var/log/thehive/audit.log"
OUTPUT_FILE="audit-summary-$DATE.txt"

echo "=== Audit Summary - $DATE ===" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Logins
echo "=== User Logins ===" >> "$OUTPUT_FILE"
grep "\"event\":\"login\"" "$LOG_FILE" | \
  grep "$DATE" | jq -r '.user | "\(.login) from \(.ip) at \(.timestamp)"' | \
  sort | uniq -c >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Casos creados
echo "=== Cases Created ===" >> "$OUTPUT_FILE"
grep "\"event\":\"case.create\"" "$LOG_FILE" | \
  grep "$DATE" | jq -r '. | "\(.user.login): \(.object.title) (ID: \(.object.id))"' | \
  sort >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Cambios críticos
echo "=== Critical Changes ===" >> "$OUTPUT_FILE"
grep -E "\"event\":\"user\.(create|delete)\"" "$LOG_FILE" | \
  grep "$DATE" | jq -r '. | "\(.timestamp) - \(.user.login): \(.event) \(.object.login)"' | \
  sort >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Exportar a SIEM
curl -X POST https://siem.company.com/api/audit \
  -H "Authorization: Bearer $SIEM_TOKEN" \
  -H "Content-Type: application/json" \
  -d @"$OUTPUT_FILE"

echo "Audit summary generated: $OUTPUT_FILE"
```

#### Compliance (SOC 2, ISO 27001)

```bash
#!/bin/bash
# Script: compliance-check.sh
# Verificar configuraciones para compliance

SCORE=0
TOTAL=100

echo "=== Compliance Check for SOC 2 / ISO 27001 ==="
echo ""

# 1. SSL/TLS habilitado
if curl -s -k https://localhost:9443/api/status > /dev/null; then
    echo "✓ SSL/TLS enabled"
    ((SCORE+=10))
else
    echo "✗ SSL/TLS not enabled"
fi

# 2. Logs de auditoría habilitados
if grep -q "audit.enabled = true" /opt/thehive/conf/application.conf; then
    echo "✓ Audit logging enabled"
    ((SCORE+=10))
else
    echo "✗ Audit logging not enabled"
fi

# 3. Autenticación LDAP/OIDC
if grep -q 'auth.provider = "ldap"' /opt/thehive/conf/application.conf || \
   grep -q 'auth.provider = "oidc"' /opt/thehive/conf/application.conf; then
    echo "✓ External authentication enabled"
    ((SCORE+=10))
else
    echo "✗ Using local authentication only"
fi

# 4. Backup configurado
if [ -f /opt/scripts/backup-thehive.sh ]; then
    echo "✓ Backup configured"
    ((SCORE+=10))
else
    echo "✗ Backup not configured"
fi

# 5. Fail2ban configurado
if systemctl is-active fail2ban > /dev/null 2>&1; then
    echo "✓ Fail2ban active"
    ((SCORE+=10))
else
    echo "✗ Fail2ban not active"
fi

# 6. Firewall configurado
if ufw status | grep -q "Status: active"; then
    echo "✓ Firewall active"
    ((SCORE+=10))
else
    echo "✗ Firewall not active"
fi

# 7. Rotación de logs
if grep -q "rotate = daily" /opt/thehive/conf/application.conf; then
    echo "✓ Log rotation configured"
    ((SCORE+=10))
else
    echo "✗ Log rotation not configured"
fi

# 8. Retention policy
if grep -q "retention = 365 days" /opt/thehive/conf/application.conf; then
    echo "✓ Data retention policy configured"
    ((SCORE+=10))
else
    echo "✗ Data retention policy not configured"
fi

# 9. Encrypted storage
if [ -d "/opt/thehive/data" ]; then
    echo "✓ Encrypted storage configured"
    ((SCORE+=10))
else
    echo "✗ Encrypted storage not configured"
fi

# 10. TLS moderno
if curl -sI https://localhost:9443 | grep -q "TLS"; then
    echo "✓ Modern TLS protocol"
    ((SCORE+=10))
else
    echo "✗ Using outdated TLS"
fi

echo ""
echo "=== Compliance Score: $SCORE/$TOTAL ==="

if [ $SCORE -ge 80 ]; then
    echo "✓ PASS - Good compliance posture"
elif [ $SCORE -ge 60 ]; then
    echo "⚠ PARTIAL - Some improvements needed"
else
    echo "✗ FAIL - Major compliance gaps"
fi
```

### Hardening específico

#### Configuración de Docker segura

```yaml
# docker-compose.secure.yml
version: '3.8'

services:
  thehive:
    image: thehiveproject/thehive:5.2.0
    container_name: thehive
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/tmp:noexec,nosuid,size=100m
    volumes:
      - thehive-data:/opt/thehive/conf
    ulimits:
      nproc: 65536
      nofile:
        soft: 65536
        hard: 65536
    networks:
      - thehive-net

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
      - ES_JAVA_OPTS=-Xms4g -Xmx4g
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - SETUID
      - SETGID
    read_only: true
    tmpfs:
      - /usr/share/elasticsearch/tmp:noexec,nosuid,size=100m

volumes:
  thehive-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/thehive/data

networks:
  thehive-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

#### Configurar SELinux/AppArmor

```bash
# Crear perfil AppArmor para TheHive
cat > /etc/apparmor.d/docker-thehive << 'EOF'
#include <tunables/global>

profile docker-thehive flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>

  capability,
  file,
  umount,

  deny @{PROC}/* w,   # deny write for all files directly in /proc (not in a subdir)
  deny @{PROC}/{[^1-9],[^1-9][^/]*}/** w,
  deny @{PROC}/sys/[^k]** w,
  deny @{PROC}/sys/kernel/{?,???,??????}/** w,
  deny @{PROC}/sysrq-trigger rwklx,
  deny @{PROC}/mem rwklx,
  deny @{PROC}/kmem rwklx,
  deny @{PROC}/kcore rwklx,

  deny /sys/[^f]*/** wklx,
  deny /sys/f[^s]*/** wklx,
  deny /sys/fs/[^c]*/** wklx,
  deny /sys/fs/c[^g]*/** wklx,
  deny /sys/fs/cg[^r]*/** wklx,
  deny /sys/firmware/** rwklx,
  deny /sys/kernel/security/** rwklx,

  # Docker specific
  deny /var/lib/docker{,/**} rwklx,
  deny /var/run/docker{,/**} rwklx,

  # Application specific
  /opt/thehive/** rw,
  /var/log/thehive/** rw,
  /etc/thehive/** r,
}
EOF

# Cargar perfil
apparmor_parser -r /etc/apparmor.d/docker-thehive

# Aplicar a contenedor
docker run --security-opt apparmor=docker-thehive thehive
```

#### Scans de seguridad regulares

```bash
#!/bin/bash
# Script: security-scan.sh
# Ejecutar scans de seguridad

echo "Running security scans..."

# 1. Vulnerabilidades con Trivy
echo "=== Scanning Docker images ==="
trivy image thehiveproject/thehive:latest --format json -o trivy-thehive.json
trivy image thehiveproject/cortex:latest --format json -o trivy-cortex.json

# 2. Configuración con Lynis
echo "=== System hardening check ==="
lynis audit system --quiet --log-file lynis-report.txt

# 3. Scan de puertos
echo "=== Port scan ==="
nmap -sS -O localhost -p 9000,9001,9200,3306 -oX port-scan.xml

# 4. Verificar certificados SSL
echo "=== SSL Certificate check ==="
openssl s_client -connect thehive.company.com:9443 -servername thehive.company.com < /dev/null 2>/dev/null | \
  openssl x509 -noout -dates -subject -issuer

# 5. Audit de permisos
echo "=== File permissions audit ==="
find /opt/thehive -type f -perm /o+w -ls 2>/dev/null

# 6. Generar reporte
cat > security-report.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>TheHive Security Report</title></head>
<body>
<h1>Security Scan Report</h1>
<p>Generated: $(date)</p>
<h2>Trivy Results</h2>
<pre>$(cat trivy-thehive.json | jq '.Results[].Vulnerabilities[]? | "\(.Severity): \(.Title)"')</pre>
<h2>Lynis Results</h2>
<pre>$(grep -E "WARNING|SUGGESTION" lynis-report.txt)</pre>
<h2>Port Scan</h2>
<pre>$(nmap -sS localhost -p 9000,9001,9200,3306 | grep -E "open|filtered")</pre>
</body>
</html>
EOF

echo "Security scan completed. Report: security-report.html"
```

---

## 9. Referencias y Recursos

### Documentación oficial

- **TheHive Project**: https://thehive-project.org/
- **TheHive GitHub**: https://github.com/TheHive-Project/TheHive
- **Cortex GitHub**: https://github.com/TheHive-Project/Cortex
- **TheHive Documentation**: https://docs.thehive-project.org/
- **Cortex Documentation**: https://docs.thehive-project.org/cortex/

### Comunidad y soporte

- **Forum**: https://groups.google.com/g/thehive-project
- **Discord**: https://discord.gg/thehive
- **Stack Overflow**: Tag `thehive` or `cortex-analyzer`

### Recursos adicionales

- **MISP Project**: https://www.misp-project.org/
- **Elastic Security**: https://www.elastic.co/security
- **OWASP Incident Response**: https://owasp.org/www-project-incident-management/

### Herramientas complementarias

- **Shuffle**: SOAR platform para automatizaciones
- **n8n**: Workflow automation
- **Wazuh**: HIDS/XDR y SIEM
- **Odoo**: ITSM y gestión de tickets
- **Netbox**: CMDB y gestión de infraestructura

### APIs y Webhooks

#### Ejemplos de endpoints útiles

```bash
# Health check
curl http://localhost:9000/api/status

# Stats
curl http://localhost:9000/api/case/_stats

# Search cases
curl -X POST http://localhost:9000/api/case/_search \
  -H "Content-Type: application/json" \
  -d '{"query": {"match_all": {}}}'

# Get case by ID
curl http://localhost:9000/api/case/CASE_ID

# Create case
curl -X POST http://localhost:9000/api/case \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Case", "description": "Test", "severity": 2}'

# List users
curl http://localhost:9000/api/user

# List templates
curl http://localhost:9000/api/case-template
```

### Glosario de términos

| Término | Definición |
|---------|------------|
| **IOC** | Indicator of Compromise - Indicadores de compromiso |
| **SOC** | Security Operations Center - Centro de operaciones de seguridad |
| **IR** | Incident Response - Respuesta a incidentes |
| **TTPs** | Tactics, Techniques, and Procedures - Tácticas, técnicas y procedimientos |
| **MTTR** | Mean Time To Response - Tiempo medio de respuesta |
| **MTTC** | Mean Time To Containment - Tiempo medio de contención |
| **SIEM** | Security Information and Event Management |
| **XDR** | Extended Detection and Response |
| **EDR** | Endpoint Detection and Response |
| **SLA** | Service Level Agreement - Acuerdo de nivel de servicio |

### Best Practices

1. **Siempre documentar**: Cada acción debe quedar registrada
2. **Usar templates**: Estandarizar la estructura de casos
3. **Automatizar**: Usar Cortex y responders para tareas repetitivas
4. **Collabaración**: Asignar tareas y usar comentarios
5. **Backup regular**: Configurar backup automático
6. **Monitoreo**: Alertas proactivas de problemas
7. **Seguridad**: Autenticación fuerte y cifrado
8. **Compliance**: Auditar regularmente configuraciones

### Checklists

#### Pre-incidente
- [ ] Templates de casos configurados
- [ ] Usuarios y permisos definidos
- [ ] Integraciones con Cortex y MISP
- [ ] Backup funcionando
- [ ] Monitoreo configurado

#### Durante incidente
- [ ] Crear caso con información completa
- [ ] Asignar responsable
- [ ] Ejecutar análisis iniciales
- [ ] Documentar todas las acciones
- [ ] Mantener comunicación con stakeholders

#### Post-incidente
- [ ] Documentar lecciones aprendidas
- [ ] Actualizar procedimientos
- [ ] Generar reporte ejecutivo
- [ ] Preservar evidencia
- [ ] Revisar métricas

---

## Conclusión

TheHive es una plataforma robusta y escalable para la gestión de incidentes de seguridad. Su integración nativa con Cortex para análisis automatizado y con MISP para threat intelligence la convierte en una herramienta poderosa para equipos SOC.

La stack NeoAnd potencia las capacidades de TheHive al proporcionar:
- **Elasticsearch**: Para búsqueda avanzada y correlación
- **Wazuh**: Para detección y generación de alertas
- **Odoo**: Para gestión de tickets y workflows de negocio
- **Shuffle/n8n**: Para automatización avanzada

La implementación exitosa requiere:
1. Configuración adecuada de arquitectura
2. Integración con herramientas existentes
3. Entrenamiento del equipo
4. Mantenimiento y actualización continua
5. Adopción de mejores prácticas

Para soporte adicional o consultas específicas, consulte la documentación oficial o contacte a la comunidad en los foros oficiales.

---

**Documento generado el**: 2025-12-05
**Versión**: 1.0
**Autor**: NeoAnd Stack Documentation Team
**Licencia**: CC BY-SA 4.0
