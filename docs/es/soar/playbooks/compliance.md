# Playbook: Automatización de Compliance

> **AI Context**: Playbook automatizado para validación y reportes de compliance (PCI-DSS, CIS, GDPR) usando Wazuh y SOAR. Recolección automática de evidencias y generación de reportes. Stack: Wazuh → SOAR → Odoo Documents. Keywords: compliance automation, PCI-DSS, GDPR, CIS benchmarks, audit reports, SOAR playbook.

## Descripción General

**Objetivo**: Automatizar recolección de evidencias de compliance y generar reportes periódicos para auditorías.

**Frameworks Soportados**:
- PCI-DSS v4.0
- CIS Benchmarks
- GDPR
- ISO 27001
- SOC 2

**Frecuencia**: Diaria, Semanal, Mensual

**Automatización**: 100% automático

## Flujo del Playbook

```
┌─────────────────────────────────────────────────────┐
│          TRIGGER PROGRAMADO                         │
│     Diario: 06:00 AM / Semanal: Lunes / Mensual   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  1. RECOLECCIÓN DE DATOS (5-10 min)                │
│  ├─ Consultar API Wazuh (últimas 24h/7d/30d)      │
│  ├─ Filtrar por tags de compliance (PCI-DSS, GDPR)│
│  ├─ Agregar por requisito                          │
│  └─ Calcular puntuación de compliance             │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  2. VALIDACIÓN (2-5 min)                            │
│  ├─ Verificar requisitos críticos (pass/fail)     │
│  ├─ Identificar brechas y no conformidades        │
│  ├─ Calcular puntuación de riesgo                 │
│  └─ Comparar con período anterior                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  3. GENERACIÓN DE REPORTE (2-3 min)                │
│  ├─ Generar reporte PDF (resumen ejecutivo)       │
│  ├─ Generar CSV (hallazgos detallados)            │
│  ├─ Incluir gráficos y tablas                     │
│  └─ Agregar recomendaciones de remediación        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  4. ALMACENAMIENTO (< 1 min)                        │
│  ├─ Subir a Odoo Documents                         │
│  ├─ Etiquetar con framework de compliance         │
│  ├─ Establecer política de retención (7 años)     │
│  └─ Crear entrada en audit trail                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  5. NOTIFICACIÓN (< 1 min)                          │
│  ├─ Email a equipo de compliance                   │
│  ├─ Notificación Slack con resumen                │
│  ├─ Crear ticket si se encuentran brechas críticas│
│  └─ Actualizar dashboard de compliance            │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  6. REMEDIACIÓN (Manual - si es necesario)         │
│  ├─ Revisar no conformidades                       │
│  ├─ Crear tareas de remediación                   │
│  ├─ Asignar a equipos responsables                │
│  └─ Rastrear hasta cierre                         │
└─────────────────────────────────────────────────────┘
```

## Implementación - Reporte Diario PCI-DSS

### Workflow n8n/Shuffle

```javascript
// Node 1: Schedule Trigger (Cron)
// Cron: 0 6 * * *  (Diario a las 6 AM)
// Output: { timestamp: "2025-12-05T06:00:00-03:00" }
```

```javascript
// Node 2: Consultar API Wazuh (Últimas 24h)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const query = {
  start_date: yesterday.toISOString(),
  end_date: new Date().toISOString(),
  filters: {
    pci_dss: { exists: true }
  }
};

// HTTP Request a API Wazuh
const response = await $http.get('https://wazuh:55000/security/alerts', {
  headers: {
    'Authorization': 'Bearer ' + $env.WAZUH_API_TOKEN
  },
  params: query
});

return [{ json: response.data }];
```

```javascript
// Node 3: Agregar por Requisito PCI-DSS
const alerts = $input.item.json.affected_items;

const pciBreakdown = {};
const requirementNames = {
  '1.1': 'Configuración de Firewall',
  '2.2': 'Cuentas Predeterminadas del Proveedor',
  '6.5': 'Desarrollo Seguro de Aplicaciones',
  '8.2': 'Autenticación de Usuario',
  '10.2': 'Logs de Auditoría',
  '11.4': 'Monitoreo de Integridad de Archivos'
};

// Agregar alertas por requisito PCI-DSS
alerts.forEach(alert => {
  const pciTags = alert.rule.pci_dss || [];
  pciTags.forEach(tag => {
    if (!pciBreakdown[tag]) {
      pciBreakdown[tag] = {
        requirement: tag,
        name: requirementNames[tag] || 'Desconocido',
        total_alerts: 0,
        critical_alerts: 0,
        high_alerts: 0,
        medium_alerts: 0
      };
    }

    pciBreakdown[tag].total_alerts++;

    if (alert.rule.level >= 12) {
      pciBreakdown[tag].critical_alerts++;
    } else if (alert.rule.level >= 10) {
      pciBreakdown[tag].high_alerts++;
    } else {
      pciBreakdown[tag].medium_alerts++;
    }
  });
});

// Calcular puntuación de compliance (ejemplo: % requisitos con 0 alertas críticas)
const totalRequirements = Object.keys(pciBreakdown).length;
const compliantRequirements = Object.values(pciBreakdown)
  .filter(req => req.critical_alerts === 0).length;

const complianceScore = totalRequirements > 0
  ? Math.round((compliantRequirements / totalRequirements) * 100)
  : 100;

return [{
  json: {
    timestamp: $input.item.json.timestamp,
    total_alerts: alerts.length,
    compliance_score: complianceScore,
    requirements: Object.values(pciBreakdown),
    period: 'last_24h'
  }
}];
```

```javascript
// Node 4: Generar Contenido del Reporte
const data = $input.item.json;

const reportMarkdown = `
# Reporte Diario de Compliance PCI-DSS
**Fecha**: ${new Date(data.timestamp).toLocaleDateString('es-MX')}
**Período**: Últimas 24 horas

## Resumen Ejecutivo

**Compliance Score**: ${data.compliance_score}%
**Total de Alertas**: ${data.total_alerts}

### Estado por Requisito

${data.requirements.map(req => `
#### ${req.requirement} - ${req.name}
- Total: ${req.total_alerts}
- Críticos: ${req.critical_alerts} 🔴
- Altos: ${req.high_alerts} 🟠
- Medios: ${req.medium_alerts} 🟡
`).join('\n')}

## Acciones Recomendadas

${data.requirements
  .filter(req => req.critical_alerts > 0)
  .map(req => `- **${req.requirement}**: ${req.critical_alerts} alertas críticas requieren acción inmediata`)
  .join('\n') || '✅ No se requiere ninguna acción crítica'}

---
*Reporte generado automáticamente por SOAR NEO_NETBOX_ODOO_STACK*
`;

return [{
  json: {
    ...data,
    report_markdown: reportMarkdown,
    report_filename: `pci-dss-daily-${new Date().toISOString().split('T')[0]}.pdf`
  }
}];
```

```javascript
// Node 5: Convertir Markdown a PDF (vía servicio externo)
// HTTP Request a microservicio generador de PDF
const pdfResponse = await $http.post('http://pdf-generator:5000/generate', {
  body: {
    content: $input.item.json.report_markdown,
    format: 'pdf',
    template: 'compliance-report'
  }
});

return [{
  json: {
    ...$input.item.json,
    pdf_base64: pdfResponse.data.pdf_base64
  }
}];
```

```json
// Node 6: Subir a Odoo Documents
{
  "name": "Reporte PCI-DSS Diario - {{ $json.timestamp }}",
  "datas": "{{ $json.pdf_base64 }}",
  "folder_id": 10,
  "tag_ids": [[6, 0, [15, 16]]],
  "description": "Reporte diario automático de compliance PCI-DSS. Compliance Score: {{ $json.compliance_score }}%"
}
```

```javascript
// Node 7: Enviar Notificación
const score = $input.item.json.compliance_score;
const emoji = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '🔴';

const slackMessage = {
  channel: '#compliance',
  text: `${emoji} **Reporte PCI-DSS Diario**\n\n` +
        `**Compliance Score**: ${score}%\n` +
        `**Total Alertas**: ${$input.item.json.total_alerts}\n` +
        `**Período**: Últimas 24h\n\n` +
        `📄 Reporte disponible en Odoo Documents`
};

return [{ json: slackMessage }];
```

## Mapeo de Alertas Wazuh a PCI-DSS

| Requisito PCI-DSS | Reglas Wazuh | Descripción |
|-------------------|--------------|-------------|
| **1.1** - Firewall | 4101-4150 | Configuración de firewall |
| **2.2** - Predeterminados | 5710, 5715 | Cuentas predeterminadas no cambiadas |
| **6.5** - AppSec | 31100+ | Vulnerabilidades de aplicación |
| **8.2** - Auth | 5710-5720 | Autenticación de usuarios |
| **10.2** - Logs | 18100+ | Auditoría de logs |
| **11.4** - FIM | 550-555 | Monitoreo de Integridad de Archivos |

### Ejemplo de Regla Wazuh con Tag PCI-DSS

```xml
<!-- /var/ossec/ruleset/rules/0015-ossec_rules.xml -->
<rule id="550" level="7">
  <category>ossec</category>
  <decoded_as>syscheck_integrity_changed</decoded_as>
  <description>Integrity checksum changed.</description>
  <group>syscheck,pci_dss_11.4,gpg13_4.11,gdpr_II_5.1.f,hipaa_164.312.c.1,nist_800_53_SI.7,tsc_PI1.4,tsc_PI1.5,tsc_CC6.1,tsc_CC7.2,tsc_CC7.3</group>
</rule>
```

## Reportes Disponibles

### 1. Reporte Diario
**Contenido**:
- Compliance score últimas 24h
- Alertas críticas
- Tendencia (vs día anterior)
- Acciones recomendadas

**Destinatarios**: Equipo de seguridad, Oficial de cumplimiento

### 2. Reporte Semanal
**Contenido**:
- Compliance score semanal
- Top 10 alertas recurrentes
- Análisis de tendencias
- Progreso de remediación

**Destinatarios**: CISO, Gerencia de TI

### 3. Reporte Mensual
**Contenido**:
- Resumen ejecutivo
- Compliance score por framework
- Análisis de brechas
- Evidencias listas para auditoría

**Destinatarios**: Nivel C, Auditores

### 4. Reporte Trimestral
**Contenido**:
- Visión estratégica
- ROI de automatización
- Análisis comparativo (YoY)
- Roadmap de mejoras

**Destinatarios**: Junta, Reguladores

## Validación de Compliance

### Verificaciones CIS Benchmark

```bash
#!/bin/bash
# Script: cis-benchmark-check.sh
# Ejecutado vía workflow SOAR

# CIS 1.1.1.1: Deshabilitar sistemas de archivos no usados
if lsmod | grep -q cramfs; then
  echo "FAIL: cramfs no deshabilitado"
else
  echo "PASS: cramfs deshabilitado"
fi

# CIS 1.4.1: Contraseña de bootloader configurada
if grep -q "password" /boot/grub/grub.cfg; then
  echo "PASS: Contraseña de bootloader configurada"
else
  echo "FAIL: Falta contraseña de bootloader"
fi

# CIS 5.2.1: SSH Protocolo 2
if grep -q "Protocol 2" /etc/ssh/sshd_config; then
  echo "PASS: SSH Protocolo 2"
else
  echo "FAIL: SSH Protocolo no es 2"
fi

# ... más verificaciones
```

### Registro de Acceso a Datos GDPR

```javascript
// Workflow: Registrar todos los accesos a datos para compliance GDPR
// Trigger: Cualquier consulta de base de datos a tablas user_data

const accessLog = {
  timestamp: new Date().toISOString(),
  user_id: $input.item.json.user_id,
  accessed_by: $input.item.json.operator,
  purpose: $input.item.json.purpose,
  data_category: 'personal_data',
  retention_days: 2555  // 7 años
};

// Almacenar en log de auditoría inmutable (basado en blockchain o DB append-only)
await $http.post('http://audit-log:5000/gdpr/access', {
  body: accessLog
});

return [{ json: { logged: true, log_id: response.data.id } }];
```

## Métricas de Compliance

### Queries SQL para Dashboard

```sql
-- Tendencia Compliance Score (Últimos 30 días)
SELECT
  DATE(execution_date) as date,
  AVG(compliance_score) as avg_score,
  MIN(compliance_score) as min_score,
  MAX(compliance_score) as max_score
FROM compliance_reports
WHERE framework = 'PCI-DSS'
  AND execution_date > NOW() - INTERVAL '30 days'
GROUP BY DATE(execution_date)
ORDER BY date;

-- Top Requisitos No Conformes
SELECT
  requirement_id,
  requirement_name,
  COUNT(*) as violation_count,
  SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_violations
FROM compliance_violations
WHERE framework = 'PCI-DSS'
  AND status = 'open'
GROUP BY requirement_id, requirement_name
ORDER BY critical_violations DESC, violation_count DESC
LIMIT 10;

-- Efectividad de Remediación
SELECT
  requirement_id,
  AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at))/3600) as avg_mttr_hours,
  COUNT(*) as total_issues,
  COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as resolved_issues
FROM compliance_violations
WHERE detected_at > NOW() - INTERVAL '90 days'
GROUP BY requirement_id;
```

## Integración con Auditorías

### Exportar Evidencias para Auditores

```javascript
// Workflow: Exportar paquete de evidencias para auditoría
// Trigger: Manual o programación trimestral

const startDate = '2025-01-01';
const endDate = '2025-03-31';

// 1. Recolectar todos los reportes de compliance
const reports = await $http.get(`http://odoo/api/documents.document`, {
  params: {
    filters: [
      ['tag_ids', 'in', [15, 16]],  // Tags de compliance
      ['create_date', '>=', startDate],
      ['create_date', '<=', endDate]
    ]
  }
});

// 2. Recolectar logs de auditoría
const auditLogs = await $http.get(`http://wazuh:55000/security/logs`, {
  params: { start_date: startDate, end_date: endDate }
});

// 3. Generar índice de evidencias
const evidencePackage = {
  period: `${startDate} to ${endDate}`,
  reports: reports.data,
  logs: auditLogs.data,
  certifications: ['PCI-DSS', 'ISO 27001'],
  generated_at: new Date().toISOString()
};

// 4. Crear paquete ZIP
const zip = await $http.post('http://archiver:5000/create-package', {
  body: evidencePackage
});

// 5. Subir a almacenamiento seguro
return [{ json: { package_url: zip.data.download_url } }];
```

## Próximos Pasos

1. **Configurar Programación**: Definir cron jobs para cada reporte
2. **Personalizar Reportes**: Adaptar templates para su organización
3. **Integrar con GRC**: Conectar con plataforma de Governance, Risk & Compliance

## Recursos Adicionales

- [PCI-DSS v4.0 Requirements](https://www.pcisecuritystandards.org/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [Wazuh Compliance Module](https://documentation.wazuh.com/current/user-manual/capabilities/policy-monitoring/index.html)

---

**Última actualización**: 2025-12-05
**Versión**: 2.0.0
**Compliance Score Actual**: 87% (PCI-DSS)
