# Playbooks SOAR - Catálogo

> **AI Context**: Catálogo completo de playbooks de respuesta a incidentes para NEO_NETBOX_ODOO_STACK. Automatizaciones listas para malware, brute force, compliance. Keywords: SOAR playbooks, incident response, automation catalog, security playbooks, Wazuh response.

## Descripción General

Los **Playbooks** son workflows automatizados de respuesta a incidentes específicos, que contienen:
- **Triggers**: Condiciones que inician el playbook
- **Acciones**: Pasos automatizados
- **Decisiones**: Puntos de aprobación manual
- **Métricas**: KPIs de éxito

## Catálogo de Playbooks

### Respuesta a Amenazas

| Playbook | Rule IDs | Severidad | Complejidad | Tiempo Promedio |
|----------|----------|-----------|-------------|-----------------|
| [Respuesta a Malware](malware-response.md) | 554, 555 | Crítica | Media | 5-15 min |
| [Respuesta a Brute Force](brute-force.md) | 5712, 5710 | Alta | Baja | 2-5 min |
| Detección de Ransomware | 60200+ | Crítica | Alta | 10-30 min |
| Escalación de Privilegios | 80790+ | Alta | Media | 5-10 min |

### Compliance

| Playbook | Framework | Frecuencia | Complejidad |
|----------|-----------|------------|-------------|
| [Compliance PCI-DSS](compliance.md) | PCI-DSS | Diaria | Media |
| Verificación CIS Benchmark | CIS | Semanal | Alta |
| Log de Acceso a Datos GDPR | GDPR | Continua | Baja |
| Evidencia ISO 27001 | ISO 27001 | Mensual | Media |

### Operaciones

| Playbook | Descripción | Automatización | Manual |
|----------|-------------|----------------|--------|
| Parcheo de Vulnerabilidades | CVE crítico → parche | 70% | 30% |
| Desprovisionamiento de Usuario | Eliminar usuario → revocar accesos | 90% | 10% |
| Validación de Backup | Verificar backups diarios | 100% | 0% |
| Renovación de Certificados | SSL expirando → renovar | 80% | 20% |

## Anatomía de un Playbook

```
┌─────────────────────────────────────────────────┐
│                   PLAYBOOK                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. TRIGGER (Automático)                        │
│     ├─ Rule ID / Alert Level                    │
│     └─ Condiciones específicas                  │
│                                                 │
│  2. ENRIQUECIMIENTO (Automático)                │
│     ├─ NetBox: Contexto del asset              │
│     ├─ Threat Intel: IOCs conocidos            │
│     └─ CMDB: Criticidad de negocio             │
│                                                 │
│  3. DECISIÓN (Automático + Manual)              │
│     ├─ Reglas automáticas (if/else)            │
│     └─ Aprobación humana cuando necesario      │
│                                                 │
│  4. RESPUESTA (Automático)                      │
│     ├─ Contención (aislar, bloquear)           │
│     ├─ Documentación (ticket, log)             │
│     └─ Notificación (email, Slack)             │
│                                                 │
│  5. VALIDACIÓN (Manual)                         │
│     ├─ Verificar efectividad                   │
│     └─ Cerrar ticket                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Métricas de Playbooks

### KPIs Operacionales

| Métrica | Descripción | Meta | Cómo Medir |
|---------|-------------|------|------------|
| **MTTD** | Mean Time To Detect | < 5 min | Timestamp alerta |
| **MTTR** | Mean Time To Respond | < 30 min | Timestamp acción |
| **Tasa Automatización** | % alertas tratadas automáticamente | > 70% | Workflows/Alertas |
| **Falsos Positivos** | % alertas no-incidentes | < 10% | Tickets cerrados sin acción |
| **Cobertura** | % alertas con playbook | > 80% | Playbooks activos/Rules |

### Ejemplo de Medición

```python
# Script: playbook-metrics.py
import requests
from datetime import datetime, timedelta

def calculate_mttr(workflow_executions):
    """Calcula MTTR promedio"""
    times = []
    for exec in workflow_executions:
        start = datetime.fromisoformat(exec['started_at'])
        end = datetime.fromisoformat(exec['finished_at'])
        times.append((end - start).total_seconds() / 60)

    return sum(times) / len(times) if times else 0

# Query workflows últimas 24h
workflows = requests.get('http://n8n:5678/api/v1/executions?limit=100').json()

mttr = calculate_mttr(workflows)
print(f"MTTR: {mttr:.2f} minutos")
```

## Implementación de Playbooks

### Paso 1: Elegir Plataforma

```bash
# Opción A: Shuffle (Enterprise)
cd /opt/neoand-netbox-odoo-stack/shuffle
# Importar workflow JSON

# Opción B: n8n (Prototipado)
cd /opt/neoand-netbox-odoo-stack/n8n
# Importar workflow JSON
```

### Paso 2: Importar Playbook

```bash
# Vía API (n8n)
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d @playbook-malware-response.json

# Vía UI
# 1. Workflows → Import
# 2. Pegar JSON
# 3. Activar workflow
```

### Paso 3: Configurar Credenciales

```bash
# Odoo API Key
# NetBox Token
# Slack Webhook
# etc.
```

### Paso 4: Probar

```bash
# Enviar alerta simulada
curl -X POST http://localhost:5678/webhook/malware-alert \
  -H "Content-Type: application/json" \
  -d @test-alert.json

# Verificar ejecución
# UI → Executions → Ver detalles
```

### Paso 5: Monitorear

```bash
# Logs de ejecución
docker logs n8n | grep "Workflow.*malware"

# Métricas
curl http://localhost:5678/api/v1/executions?workflowId=123
```

## Estructura de la Documentación

1. **[Respuesta a Malware](malware-response.md)**
   - Detección → Aislamiento → Análisis → Remediación

2. **[Respuesta a Brute Force](brute-force.md)**
   - Detección → Bloqueo → Investigación → Reporte

3. **[Automatización de Compliance](compliance.md)**
   - Recolección → Validación → Reporte → Evidencias

## Roadmap de Playbooks

### Q1 2026
- ✅ Respuesta a Malware
- ✅ Respuesta a Brute Force
- ✅ Compliance PCI-DSS
- 🔄 Detección de Ransomware
- 🔄 Mitigación DDoS

### Q2 2026
- 📅 Detección APT
- 📅 Exfiltración de Datos
- 📅 Amenaza Interna
- 📅 Ataque Supply Chain

### Q3 2026
- 📅 Seguridad Cloud (AWS/Azure)
- 📅 Seguridad Contenedores (K8s)
- 📅 Seguridad IoT

## Contribuyendo

### Crear Nuevo Playbook

1. Copiar template:
```bash
cp playbook-template.md playbooks/mi-playbook.md
```

2. Definir:
   - Trigger (Rule IDs)
   - Flujo de respuesta
   - Acciones automatizadas
   - Puntos de decisión manual

3. Implementar workflow (Shuffle o n8n)

4. Probar en entorno staging

5. Documentar métricas de éxito

## Recursos Adicionales

- [NIST Incident Response Guide](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf)
- [SANS Incident Handler's Handbook](https://www.sans.org/white-papers/33901/)
- [Wazuh Use Cases](https://documentation.wazuh.com/current/user-manual/capabilities/index.html)

## Próximos Pasos

1. **Implementar playbooks**: Elija casos críticos primero
2. **Medir resultados**: Configure dashboards de métricas
3. **Iterar y mejorar**: Ajuste playbooks basándose en feedback

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Playbooks activos**: 3 (Malware, Brute Force, Compliance)
