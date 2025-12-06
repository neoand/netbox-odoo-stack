# 🛡️ Wazuh 4.12+ - Plataforma de Inteligencia y Monitoreo de Seguridad

> **Contexto AI**: Este es el punto de entrada de la documentación de Wazuh para el stack NEO v2.0. Actualizado para Wazuh 4.12 con nuevas capacidades: eBPF FIM, enlaces CTI directos, hot reload de configuraciones, e integraciones nativas con Shuffle (asociación oficial Sep/2025) y n8n.

---

## 🎯 **¿Qué es Wazuh?**

**Wazuh 4.12+** es una plataforma open source de seguridad (SIEM) y XDR que ofrece visibilidad, detección de amenazas y conformidad para infraestructuras de TI.

### 🔥 **Componentes Principales**

| 🧩 Componente | 📋 Descripción | 🎯 Función |
|---------------|----------------|-----------|
| **Wazuh Manager** | Motor principal | Recolecta, analiza y correlaciona logs |
| **Wazuh Agents** | Agentes ligeros | Monitorea sistemas finales |
| **Wazuh Indexer** | Basado en ElasticSearch | Almacena e indexa datos |
| **Wazuh Dashboard** | Basado en Kibana | Visualización e informes |
| **Wazuh Integration API** | API RESTful | Conecta con herramientas externas |

---

## 🚀 **Inicio Rápido (Docker - Wazuh 4.12)**

```bash
# Clonar repositorio oficial
git clone -b 4.12 https://github.com/wazuh/wazuh-docker.git
cd wazuh-docker/single-node

# Levantar stack completo
docker-compose -f generate-indexer-certs.yml run --rm generator
docker-compose up -d

# Acceder: https://localhost
# Usuario: admin / Contraseña: SecretPassword
```

---

## 📚 **Documentación Completa**

### **Archivos Principales**

- [📖 Introducción Completa](introduction.md) - Guía completa para principiantes
- [🔥 Features & Funcionalidades](features.md) - Capacidades técnicas detalladas
- [🎯 Casos de Uso](use-cases.md) - Escenarios reales por industria

### **Integraciones**

- [🔀 Shuffle SOAR](integrations/shuffle.md) - Automatización de respuesta
- [🔗 n8n Workflows](integrations/n8n.md) - Automatización de procesos
- [🎫 Odoo 19 Auto-Ticketing](integrations/odoo.md) - Ticketing automático

### **Reglas Personalizadas**

- [📋 Reglas Custom NEO Stack](rules/custom-rules.md) - Reglas XML completas

---

## 🎯 **Próximos Pasos**

### Para Gestores (15 min)
1. [Introducción](introduction.md) → Entender Wazuh
2. [Casos de Uso](use-cases.md) → Ver ejemplos reales
3. [Comunidad](community/) → Recursos

### Para DevOps (2-4 horas)
1. [Instalación](introduction.md#-instalación-rápida-docker) → Configuración completa
2. [Integración Shuffle](integrations/shuffle.md) → SOAR automation
3. [Integración n8n](integrations/n8n.md) → Workflows personalizados
4. [Integración Odoo](integrations/odoo.md) → Auto-ticketing

---

## 🆘 **Recursos y Soporte**

- [Documentación Oficial](https://documentation.wazuh.com/)
- [Discord](https://discord.gg/wazuh)
- [GitHub](https://github.com/wazuh/wazuh)

---

**📊 Estado: ✅ Documentación Completa ES | 7 archivos | 100% traducido | Production-Ready**
