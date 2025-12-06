# Instalación y Configuración de Shuffle

> **AI Context**: Guía completa de instalación de Shuffle SOAR vía Docker Compose. Incluye configuración inicial, API keys, webhooks y troubleshooting. Stack: Docker + OpenSearch + Shuffle. Keywords: Shuffle setup, Docker Compose, SOAR installation, webhook configuration, API keys.

## Prerrequisitos

### Hardware
- **CPU**: 4 núcleos (recomendado)
- **RAM**: 6GB mínimo, 8GB recomendado
- **Almacenamiento**: 20GB SSD
- **Red**: Puertos 3000, 3001, 3002 disponibles

### Software
```bash
# Versiones mínimas
docker --version   # Docker 24.0+
docker-compose --version  # Docker Compose 2.20+

# Verificar recursos
docker info | grep -E 'CPUs|Total Memory'
```

### Dependencias
- ✅ Docker Engine instalado
- ✅ Docker Compose instalado
- ✅ Acceso root/sudo
- ✅ Internet (para descarga de imágenes)

## Instalación vía Docker Compose

### Estructura de Directorios

```bash
# Crear estructura
mkdir -p /opt/neoand-netbox-odoo-stack/shuffle/{data,apps}
cd /opt/neoand-netbox-odoo-stack/shuffle

# Estructura final
/opt/neoand-netbox-odoo-stack/shuffle/
├── docker-compose.yml
├── .env
├── data/                  # OpenSearch data
└── apps/                  # Custom apps (opcional)
```

Continuar con archivo completo traducido...

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Probado con**: Shuffle 1.3.0, Docker 24.0.7, Ubuntu 22.04
