# Playbook: Automação de Compliance

> **AI Context**: Playbook automatizado para validação e relatórios de compliance (PCI-DSS, CIS, GDPR) usando Wazuh e SOAR. Coleta automática de evidências e geração de relatórios. Stack: Wazuh → SOAR → Odoo Documents. Keywords: compliance automation, PCI-DSS, GDPR, CIS benchmarks, audit reports, SOAR playbook.

## Visão Geral

**Objetivo**: Automatizar coleta de evidências de compliance e gerar relatórios periódicos para auditorias.

**Frameworks Suportados**:
- PCI-DSS v4.0
- CIS Benchmarks
- GDPR
- ISO 27001
- SOC 2

**Frequência**: Diária, Semanal, Mensal

**Automação**: 100% automático

## Fluxo do Playbook

```
┌─────────────────────────────────────────────────────┐
│          SCHEDULE TRIGGER                           │
│     Daily: 06:00 AM / Weekly: Monday / Monthly     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  1. COLETA DE DADOS (5-10 min)                      │
│  ├─ Query Wazuh API (last 24h/7d/30d)              │
│  ├─ Filter by compliance tags (PCI-DSS, GDPR)      │
│  ├─ Aggregate by requirement                        │
│  └─ Calculate compliance score                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  2. VALIDAÇÃO (2-5 min)                             │
│  ├─ Check critical requirements (pass/fail)        │
│  ├─ Identify gaps and non-conformities             │
│  ├─ Calculate risk score                           │
│  └─ Compare with previous period                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  3. GERAÇÃO DE RELATÓRIO (2-3 min)                  │
│  ├─ Generate PDF report (executive summary)        │
│  ├─ Generate CSV (detailed findings)               │
│  ├─ Include charts and graphs                      │
│  └─ Add remediation recommendations                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  4. ARMAZENAMENTO (< 1 min)                         │
│  ├─ Upload to Odoo Documents                        │
│  ├─ Tag with compliance framework                  │
│  ├─ Set retention policy (7 years)                 │
│  └─ Create audit trail entry                       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  5. NOTIFICAÇÃO (< 1 min)                           │
│  ├─ Email to compliance team                        │
│  ├─ Slack notification with summary                │
│  ├─ Create ticket if critical gaps found           │
│  └─ Update compliance dashboard                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  6. REMEDIAÇÃO (Manual - if needed)                 │
│  ├─ Review non-conformities                         │
│  ├─ Create remediation tasks                       │
│  ├─ Assign to responsible teams                    │
│  └─ Track until closure                            │
└─────────────────────────────────────────────────────┘
```

## Implementação - PCI-DSS Daily Report

### Workflow n8n/Shuffle

```javascript
// Node 1: Schedule Trigger (Cron)
// Cron: 0 6 * * *  (Daily at 6 AM)
// Output: { timestamp: "2025-12-05T06:00:00-03:00" }
```

```javascript
// Node 2: Query Wazuh API (Last 24h)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const query = {
  start_date: yesterday.toISOString(),
  end_date: new Date().toISOString(),
  filters: {
    pci_dss: { exists: true }
  }
};

// HTTP Request to Wazuh API
const response = await $http.get('https://wazuh:55000/security/alerts', {
  headers: {
    'Authorization': 'Bearer ' + $env.WAZUH_API_TOKEN
  },
  params: query
});

return [{ json: response.data }];
```

```javascript
// Node 3: Aggregate by PCI-DSS Requirement
const alerts = $input.item.json.affected_items;

const pciBreakdown = {};
const requirementNames = {
  '1.1': 'Firewall Configuration',
  '2.2': 'Vendor Default Accounts',
  '6.5': 'Secure Application Development',
  '8.2': 'User Authentication',
  '10.2': 'Audit Logs',
  '11.4': 'File Integrity Monitoring'
};

// Aggregate alerts by PCI-DSS requirement
alerts.forEach(alert => {
  const pciTags = alert.rule.pci_dss || [];
  pciTags.forEach(tag => {
    if (!pciBreakdown[tag]) {
      pciBreakdown[tag] = {
        requirement: tag,
        name: requirementNames[tag] || 'Unknown',
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

// Calculate compliance score (example: % of requirements with 0 critical alerts)
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
// Node 4: Generate Report Content
const data = $input.item.json;

const reportMarkdown = `
# Relatório Diário de Compliance PCI-DSS
**Data**: ${new Date(data.timestamp).toLocaleDateString('pt-BR')}
**Período**: Últimas 24 horas

## Resumo Executivo

**Compliance Score**: ${data.compliance_score}%
**Total de Alertas**: ${data.total_alerts}

### Status por Requisito

${data.requirements.map(req => `
#### ${req.requirement} - ${req.name}
- Total: ${req.total_alerts}
- Críticos: ${req.critical_alerts} 🔴
- Altos: ${req.high_alerts} 🟠
- Médios: ${req.medium_alerts} 🟡
`).join('\n')}

## Ações Recomendadas

${data.requirements
  .filter(req => req.critical_alerts > 0)
  .map(req => `- **${req.requirement}**: ${req.critical_alerts} alertas críticos requerem ação imediata`)
  .join('\n') || '✅ Nenhuma ação crítica necessária'}

---
*Relatório gerado automaticamente pelo SOAR NEO_NETBOX_ODOO_STACK*
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
// Node 5: Convert Markdown to PDF (via external service)
// HTTP Request to PDF generator microservice
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
// Node 6: Upload to Odoo Documents
{
  "name": "PCI-DSS Daily Report - {{ $json.timestamp }}",
  "datas": "{{ $json.pdf_base64 }}",
  "folder_id": 10,
  "tag_ids": [[6, 0, [15, 16]]],
  "description": "Relatório diário automático de compliance PCI-DSS. Compliance Score: {{ $json.compliance_score }}%"
}
```

```javascript
// Node 7: Send Notification
const score = $input.item.json.compliance_score;
const emoji = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '🔴';

const slackMessage = {
  channel: '#compliance',
  text: `${emoji} **Relatório PCI-DSS Diário**\n\n` +
        `**Compliance Score**: ${score}%\n` +
        `**Total Alertas**: ${$input.item.json.total_alerts}\n` +
        `**Período**: Últimas 24h\n\n` +
        `📄 Relatório disponível no Odoo Documents`
};

return [{ json: slackMessage }];
```

## Mapeamento de Alertas Wazuh para PCI-DSS

| PCI-DSS Requirement | Wazuh Rules | Descrição |
|---------------------|-------------|-----------|
| **1.1** - Firewall | 4101-4150 | Configuração de firewall |
| **2.2** - Defaults | 5710, 5715 | Contas padrão não alteradas |
| **6.5** - AppSec | 31100+ | Vulnerabilidades de aplicação |
| **8.2** - Auth | 5710-5720 | Autenticação de usuários |
| **10.2** - Logs | 18100+ | Auditoria de logs |
| **11.4** - FIM | 550-555 | File Integrity Monitoring |

### Exemplo de Regra Wazuh com Tag PCI-DSS

```xml
<!-- /var/ossec/ruleset/rules/0015-ossec_rules.xml -->
<rule id="550" level="7">
  <category>ossec</category>
  <decoded_as>syscheck_integrity_changed</decoded_as>
  <description>Integrity checksum changed.</description>
  <group>syscheck,pci_dss_11.4,gpg13_4.11,gdpr_II_5.1.f,hipaa_164.312.c.1,nist_800_53_SI.7,tsc_PI1.4,tsc_PI1.5,tsc_CC6.1,tsc_CC7.2,tsc_CC7.3</group>
</rule>
```

## Relatórios Disponíveis

### 1. Daily Report (Diário)

**Conteúdo**:
- Compliance score últimas 24h
- Alertas críticos
- Tendência (vs dia anterior)
- Ações recomendadas

**Destinatários**: Security team, Compliance officer

### 2. Weekly Report (Semanal)

**Conteúdo**:
- Compliance score semanal
- Top 10 alertas recorrentes
- Análise de tendências
- Remediation progress

**Destinatários**: CISO, IT management

### 3. Monthly Report (Mensal)

**Conteúdo**:
- Executive summary
- Compliance score por framework
- Gap analysis
- Audit-ready evidências

**Destinatários**: C-level, Auditors

### 4. Quarterly Report (Trimestral)

**Conteúdo**:
- Strategic overview
- ROI de automação
- Comparative analysis (YoY)
- Roadmap de melhorias

**Destinatários**: Board, Regulators

## Validação de Compliance

### CIS Benchmark Checks

```bash
#!/bin/bash
# Script: cis-benchmark-check.sh
# Executado via SOAR workflow

# CIS 1.1.1.1: Disable unused filesystems
if lsmod | grep -q cramfs; then
  echo "FAIL: cramfs not disabled"
else
  echo "PASS: cramfs disabled"
fi

# CIS 1.4.1: Bootloader password set
if grep -q "password" /boot/grub/grub.cfg; then
  echo "PASS: Bootloader password set"
else
  echo "FAIL: Bootloader password missing"
fi

# CIS 5.2.1: SSH Protocol 2
if grep -q "Protocol 2" /etc/ssh/sshd_config; then
  echo "PASS: SSH Protocol 2"
else
  echo "FAIL: SSH Protocol not 2"
fi

# ... mais checks
```

### GDPR Data Access Logging

```javascript
// Workflow: Log all data access for GDPR compliance
// Trigger: Any database query to user_data tables

const accessLog = {
  timestamp: new Date().toISOString(),
  user_id: $input.item.json.user_id,
  accessed_by: $input.item.json.operator,
  purpose: $input.item.json.purpose,
  data_category: 'personal_data',
  retention_days: 2555  // 7 years
};

// Store in immutable audit log (blockchain-based or append-only DB)
await $http.post('http://audit-log:5000/gdpr/access', {
  body: accessLog
});

return [{ json: { logged: true, log_id: response.data.id } }];
```

## Métricas de Compliance

### Dashboard SQL Queries

```sql
-- Compliance Score Trend (Last 30 days)
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

-- Top Non-Compliant Requirements
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

-- Remediation Effectiveness
SELECT
  requirement_id,
  AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at))/3600) as avg_mttr_hours,
  COUNT(*) as total_issues,
  COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as resolved_issues
FROM compliance_violations
WHERE detected_at > NOW() - INTERVAL '90 days'
GROUP BY requirement_id;
```

## Integração com Auditorias

### Exportar Evidências para Auditores

```javascript
// Workflow: Export evidence package for audit
// Trigger: Manual or quarterly schedule

const startDate = '2025-01-01';
const endDate = '2025-03-31';

// 1. Collect all compliance reports
const reports = await $http.get(`http://odoo/api/documents.document`, {
  params: {
    filters: [
      ['tag_ids', 'in', [15, 16]],  // Compliance tags
      ['create_date', '>=', startDate],
      ['create_date', '<=', endDate]
    ]
  }
});

// 2. Collect audit logs
const auditLogs = await $http.get(`http://wazuh:55000/security/logs`, {
  params: { start_date: startDate, end_date: endDate }
});

// 3. Generate evidence index
const evidencePackage = {
  period: `${startDate} to ${endDate}`,
  reports: reports.data,
  logs: auditLogs.data,
  certifications: ['PCI-DSS', 'ISO 27001'],
  generated_at: new Date().toISOString()
};

// 4. Create ZIP package
const zip = await $http.post('http://archiver:5000/create-package', {
  body: evidencePackage
});

// 5. Upload to secure storage
return [{ json: { package_url: zip.data.download_url } }];
```

## Próximos Passos

1. **Configurar Schedule**: Definir cron jobs para cada relatório
2. **Customizar Relatórios**: Adaptar templates para sua organização
3. **Integrar com GRC**: Conectar com plataforma de Governance, Risk & Compliance

## Recursos Adicionais

- [PCI-DSS v4.0 Requirements](https://www.pcisecuritystandards.org/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [Wazuh Compliance Module](https://documentation.wazuh.com/current/user-manual/capabilities/policy-monitoring/index.html)

---

**Última atualização**: 2025-12-05
**Versão**: 2.0.0
**Compliance Score Atual**: 87% (PCI-DSS)
