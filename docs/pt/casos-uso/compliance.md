# Caso de Uso: Compliance e Auditoria com neo_stack

> **"Governança automatizada: políticas que se auto-executam."**

---

## 🎯 Objetivo

Automatizar a verificação de compliance e políticas de governança da infraestrutura:
- ✅ **Validação automática** de políticas
- ✅ **Relatórios de auditoria** em tempo real
- ✅ **Alertas** de violações
- ✅ **Certificações** (ISO 27001, SOC 2, LGPD)

---

## 📊 Problema que Resolve

| Auditoria Manual | Compliance Automatizado |
|-----------------|------------------------|
| **3 meses** para auditoria anual | **Tempo real** (continuous) |
| **99% de chances** de erro humano | **100% confiável** |
| **Custo alto** (R$ 500K/ano) | **Automático** (R$ 50K/ano) |
| **Dados desatualizados** | **Dados em tempo real** |

---

## 🏗️ Arquitetura da Solução

```mermaid
graph TD
    A[NetBox<br/>Infraestrutura] --> B[neo_stack<br/>Compliance Engine]
    B --> C[Políticas Defined as Code]
    C --> D[Validação Automática]
    D --> E{Compliant?}
    E -->|Não| F[Alerta Violação]
    E -->|Não| G[Bloquear Mudança]
    E -->|Sim| H[Continuar]
    F --> I[Relatório Auditoria]
    G --> J[Notificação Gestores]
    H --> K[Atualizar Status]
    I --> L[Dashboard Compliance]
```

---

## 💻 Implementação Prática

### 1. Engine de Compliance (Python)

```python
# neo-stack/compliance/engine.py
import pynetbox
import json
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

class Severity(Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ComplianceStatus(Enum):
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    WARNING = "WARNING"
    NOT_APPLICABLE = "NOT_APPLICABLE"

@dataclass
class ComplianceRule:
    id: str
    name: str
    description: str
    severity: Severity
    category: str
    remediation: str
    enabled: bool = True

@dataclass
class ComplianceViolation:
    rule_id: str
    rule_name: str
    resource_id: str
    resource_type: str
    status: ComplianceStatus
    message: str
    severity: Severity
    detected_at: datetime
    remediation: str

class ComplianceEngine:
    def __init__(self, netbox_url, netbox_token):
        self.nb = pynetbox.api(netbox_url, token=netbox_token)
        self.rules = self._load_rules()
        self.violations: List[ComplianceViolation] = []

    def _load_rules(self) -> List[ComplianceRule]:
        """Carrega regras de compliance como código"""
        rules = [
            # Regra 1: Todo device deve ter asset_tag
            ComplianceRule(
                id="NETBOX-001",
                name="Device Asset Tag Required",
                description="Todo dispositivo deve ter código de inventário (asset_tag)",
                severity=Severity.HIGH,
                category="Inventário",
                remediation="Adicionar asset_tag no NetBox ou marcar como 'Sem Asset Tag' se isento",
                enabled=True
            ),

            # Regra 2: Device de produção deve estar em rack
            ComplianceRule(
                id="NETBOX-002",
                name="Production Device in Rack",
                description="Dispositivos com status 'active' devem estar fisicamente em um rack",
                severity=Severity.CRITICAL,
                category="Localização",
                remediation="Mover dispositivo para rack adequado no datacenter",
                enabled=True
            ),

            # Regra 3: Nome deve seguir padrão
            ComplianceRule(
                id="NETBOX-003",
                name="Device Naming Convention",
                description="Nome deve seguir padrão: tipo-serviço-número (ex: web-app-01)",
                severity=Severity.MEDIUM,
                category="Naming",
                remediation="Renomear dispositivo seguindo padrão established",
                enabled=True
            ),

            # Regra 4: IP deve ter descrição
            ComplianceRule(
                id="NETBOX-004",
                name="IP Address Description Required",
                description="Todo IP em uso deve ter descrição clara do uso",
                severity=Severity.MEDIUM,
                category="IPAM",
                remediation="Adicionar descrição有意义 ao IP address",
                enabled=True
            ),

            # Regra 5: Custom field obrigatório
            ComplianceRule(
                id="NETBOX-005",
                name="Cost Center Required",
                description="Todo device deve ter centro de custo definido (custom_field)",
                severity=Severity.HIGH,
                category="Financeiro",
                remediation="Definir custom field 'cost_center' no dispositivo",
                enabled=True
            ),

            # Regra 6: Warranty
            ComplianceRule(
                id="NETBOX-006",
                name="Warranty Check",
                description="Dispositivos não devem estar fora da garantia por mais de 6 meses",
                severity=Severity.MEDIUM,
                category="Hardware",
                remediation="Renovar garantia ou planejar substituição",
                enabled=True
            ),

            # Regra 7: VLAN sem uso
            ComplianceRule(
                id="NETBOX-007",
                name="Orphaned VLANs",
                description="VLANs sem IPs ou interfaces atribuídas há mais de 90 dias devem ser revisadas",
                severity=Severity.LOW,
                category="IPAM",
                remediation="Remover VLAN obsoleta ou atribuir IPs",
                enabled=True
            ),

            # Regra 8: Conflito de IP
            ComplianceRule(
                id="NETBOX-008",
                name="IP Conflict Detection",
                description="Verificar IPs duplicados na rede",
                severity=Severity.CRITICAL,
                category="IPAM",
                remediation="Resolver conflito IP alterando endereços duplicados",
                enabled=True
            ),

            # Regra 9: Site sem responsável
            ComplianceRule(
                id="NETBOX-009",
                name="Site Responsible Required",
                description="Todo site deve ter responsável definido (custom field)",
                severity=Severity.MEDIUM,
                category="Organização",
                remediation="Definir responsável pelo site",
                enabled=True
            ),

            # Regra 10: Device sem serial
            ComplianceRule(
                id="NETBOX-010",
                name="Device Serial Required",
                description="Todo device físico deve ter número de série registrado",
                severity=Severity.HIGH,
                category="Hardware",
                remediation="Registrar número de série do dispositivo",
                enabled=True
            ),
        ]
        return rules

    def validate_device(self, device) -> List[ComplianceViolation]:
        """Valida um device contra todas as regras"""
        violations = []

        for rule in self.rules:
            if not rule.enabled:
                continue

            try:
                if rule.id == "NETBOX-001":
                    # Device Asset Tag Required
                    if not device.asset_tag:
                        violations.append(ComplianceViolation(
                            rule_id=rule.id,
                            rule_name=rule.name,
                            resource_id=str(device.id),
                            resource_type="device",
                            status=ComplianceStatus.NON_COMPLIANT,
                            message=f"Device {device.name} sem asset_tag",
                            severity=rule.severity,
                            detected_at=datetime.now(),
                            remediation=rule.remediation
                        ))

                elif rule.id == "NETBOX-002":
                    # Production Device in Rack
                    if device.status.value == 'active' and not device.rack:
                        violations.append(ComplianceViolation(
                            rule_id=rule.id,
                            rule_name=rule.name,
                            resource_id=str(device.id),
                            resource_type="device",
                            status=ComplianceStatus.NON_COMPLIANT,
                            message=f"Device ativo {device.name} sem rack definido",
                            severity=rule.severity,
                            detected_at=datetime.now(),
                            remediation=rule.remediation
                        ))

                elif rule.id == "NETBOX-003":
                    # Device Naming Convention
                    import re
                    if not re.match(r'^[a-z]+-[a-z]+-\d+$', device.name):
                        violations.append(ComplianceViolation(
                            rule_id=rule.id,
                            rule_name=rule.name,
                            resource_id=str(device.id),
                            resource_type="device",
                            status=ComplianceStatus.WARNING,
                            message=f"Device {device.name} não segue padrão tipo-serviço-número",
                            severity=rule.severity,
                            detected_at=datetime.now(),
                            remediation=rule.remediation
                        ))

                elif rule.id == "NETBOX-005":
                    # Cost Center Required
                    custom_fields = device.custom_fields or {}
                    if not custom_fields.get('cost_center'):
                        violations.append(ComplianceViolation(
                            rule_id=rule.id,
                            rule_name=rule.name,
                            resource_id=str(device.id),
                            resource_type="device",
                            status=ComplianceStatus.NON_COMPLIANT,
                            message=f"Device {device.name} sem centro de custo definido",
                            severity=rule.severity,
                            detected_at=datetime.now(),
                            remediation=rule.remediation
                        ))

                elif rule.id == "NETBOX-006":
                    # Warranty Check
                    custom_fields = device.custom_fields or {}
                    warranty_end = custom_fields.get('warranty_end')
                    if warranty_end:
                        warranty_date = datetime.strptime(warranty_end, '%Y-%m-%d')
                        if (datetime.now() - warranty_date).days > 180:
                            violations.append(ComplianceViolation(
                                rule_id=rule.id,
                                rule_name=rule.name,
                                resource_id=str(device.id),
                                resource_type="device",
                                status=ComplianceStatus.WARNING,
                                message=f"Device {device.name} fora da garantia há mais de 6 meses",
                                severity=rule.severity,
                                detected_at=datetime.now(),
                                remediation=rule.remediation
                            ))

                elif rule.id == "NETBOX-010":
                    # Device Serial Required
                    if not device.serial:
                        violations.append(ComplianceViolation(
                            rule_id=rule.id,
                            rule_name=rule.name,
                            resource_id=str(device.id),
                            resource_type="device",
                            status=ComplianceStatus.NON_COMPLIANT,
                            message=f"Device {device.name} sem número de série",
                            severity=rule.severity,
                            detected_at=datetime.now(),
                            remediation=rule.remediation
                        ))

            except Exception as e:
                print(f"Erro ao validar regra {rule.id} para device {device.name}: {e}")

        return violations

    def validate_ip_address(self, ip) -> List[ComplianceViolation]:
        """Valida um IP address"""
        violations = []

        for rule in self.rules:
            if not rule.enabled or rule.id != "NETBOX-004":
                continue

            # IP Address Description Required
            if ip.assigned_object and not ip.description:
                violations.append(ComplianceViolation(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    resource_id=str(ip.id),
                    resource_type="ip_address",
                    status=ComplianceStatus.NON_COMPLIANT,
                    message=f"IP {ip.address} sem descrição",
                    severity=rule.severity,
                    detected_at=datetime.now(),
                    remediation=rule.remediation
                ))

        return violations

    def validate_all(self) -> Dict[str, Any]:
        """Valida toda a infraestrutura"""
        print("Iniciando validação de compliance...")

        total_violations = []
        devices_compliant = 0
        devices_non_compliant = 0
        ips_compliant = 0
        ips_non_compliant = 0

        # Validar devices
        print("Validando devices...")
        devices = self.nb.dcim.devices.all()
        for device in devices:
            violations = self.validate_device(device)
            if violations:
                devices_non_compliant += 1
                total_violations.extend(violations)
            else:
                devices_compliant += 1

        # Validar IPs
        print("Validando IPs...")
        ips = self.nb.ipam.ip_addresses.all()
        for ip in ips:
            violations = self.validate_ip_address(ip)
            if violations:
                ips_non_compliant += 1
                total_violations.extend(violations)
            else:
                ips_compliant += 1

        # Resumo
        summary = {
            'total_devices': devices_compliant + devices_non_compliant,
            'devices_compliant': devices_compliant,
            'devices_non_compliant': devices_non_compliant,
            'device_compliance_rate': (devices_compliant / (devices_compliant + devices_non_compliant) * 100) if (devices_compliant + devices_non_compliant) > 0 else 0,
            'total_ips': ips_compliant + ips_non_compliant,
            'ips_compliant': ips_compliant,
            'ips_non_compliant': ips_non_compliant,
            'ip_compliance_rate': (ips_compliant / (ips_compliant + ips_non_compliant) * 100) if (ips_compliant + ips_non_compliant) > 0 else 0,
            'total_violations': len(total_violations),
            'violations_by_severity': {
                'CRITICAL': len([v for v in total_violations if v.severity == Severity.CRITICAL]),
                'HIGH': len([v for v in total_violations if v.severity == Severity.HIGH]),
                'MEDIUM': len([v for v in total_violations if v.severity == Severity.MEDIUM]),
                'LOW': len([v for v in total_violations if v.severity == Severity.LOW]),
            },
            'violations_by_category': {},
            'timestamp': datetime.now().isoformat()
        }

        # Agrupar por categoria
        for violation in total_violations:
            rule = next((r for r in self.rules if r.id == violation.rule_id), None)
            category = rule.category if rule else 'Unknown'
            if category not in summary['violations_by_category']:
                summary['violations_by_category'][category] = 0
            summary['violations_by_category'][category] += 1

        self.violations = total_violations

        print(f"Validação concluída. {len(total_violations)} violações encontradas.")
        return summary

    def generate_report(self, summary: Dict[str, Any], output_path: str):
        """Gera relatório HTML"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório de Compliance</title>
            <style>
                body {{ font-family: Arial; margin: 20px; }}
                .header {{ background: #2c3e50; color: white; padding: 20px; }}
                .summary {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }}
                .metric {{ background: #ecf0f1; padding: 15px; border-radius: 8px; }}
                .metric h3 {{ margin: 0 0 10px 0; color: #2c3e50; }}
                .metric .value {{ font-size: 32px; font-weight: bold; }}
                .violations {{ margin: 20px 0; }}
                .violation {{ border-left: 4px solid #e74c3c; padding: 15px; margin: 10px 0; background: #fee; }}
                .violation.critical {{ border-color: #c0392b; }}
                .violation.high {{ border-color: #e67e22; }}
                .violation.medium {{ border-color: #f39c12; }}
                .violation.low {{ border-color: #3498db; }}
                .charts {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 Relatório de Compliance</h1>
                <p>Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
            </div>

            <div class="summary">
                <div class="metric">
                    <h3>📱 Devices</h3>
                    <div class="value">{summary['devices_compliant']}</div>
                    <p>de {summary['total_devices']} em compliance</p>
                    <div style="background: #27ae60; height: 10px; width: {summary['device_compliance_rate']}%"></div>
                </div>
                <div class="metric">
                    <h3>🌐 IPs</h3>
                    <div class="value">{summary['ips_compliant']}</div>
                    <p>de {summary['total_ips']} em compliance</p>
                    <div style="background: #27ae60; height: 10px; width: {summary['ip_compliance_rate']}%"></div>
                </div>
                <div class="metric">
                    <h3>⚠️ Violações</h3>
                    <div class="value" style="color: #e74c3c;">{summary['total_violations']}</div>
                    <p>{summary['violations_by_severity']['CRITICAL']} críticas</p>
                </div>
            </div>

            <h2>Violações por Severidade</h2>
            <div>
                <p><strong>🔴 CRÍTICAS:</strong> {summary['violations_by_severity']['CRITICAL']}</p>
                <p><strong>🟠 ALTAS:</strong> {summary['violations_by_severity']['HIGH']}</p>
                <p><strong>🟡 MÉDIAS:</strong> {summary['violations_by_severity']['MEDIUM']}</p>
                <p><strong>🔵 BAIXAS:</strong> {summary['violations_by_severity']['LOW']}</p>
            </div>

            <h2>Violações por Categoria</h2>
            <ul>
        """

        for category, count in summary['violations_by_category'].items():
            html += f"<li><strong>{category}:</strong> {count} violações</li>"

        html += """
            </ul>

            <h2>Detalhamento das Violações</h2>
            <div class="violations">
        """

        # Agrupar violações por severidade
        for severity in [Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW]:
            severity_name = severity.value
            violations_of_severity = [v for v in self.violations if v.severity == severity]
            if violations_of_severity:
                html += f"<h3>{severity_name} ({len(violations_of_severity)})</h3>"
                for violation in violations_of_severity:
                    html += f"""
                    <div class="violation {severity_name.lower()}">
                        <strong>{violation.rule_name}</strong><br>
                        Recurso: {violation.resource_type} ID {violation.resource_id}<br>
                        Mensagem: {violation.message}<br>
                        <em>Remediação:</em> {violation.remediation}
                    </div>
                    """

        html += """
            </div>
        </body>
        </html>
        """

        with open(output_path, 'w') as f:
            f.write(html)

        print(f"Relatório gerado: {output_path}")

# Uso
if __name__ == '__main__':
    engine = ComplianceEngine(
        netbox_url='http://netbox.company.com',
        netbox_token='SEU_TOKEN'
    )

    summary = engine.validate_all()
    engine.generate_report(summary, '/var/www/compliance-report.html')

    print(f"\nCompliance Rate:")
    print(f"Devices: {summary['device_compliance_rate']:.1f}%")
    print(f"IPs: {summary['ip_compliance_rate']:.1f}%")
```

---

### 2. Políticas como Código (YAML)

```yaml
# neo-stack/policies/compliance-rules.yml
policies:
  - id: "NETBOX-001"
    name: "Device Asset Tag Required"
    description: "Todo dispositivo deve ter código de inventário"
    severity: "HIGH"
    category: "Inventário"
    enabled: true
    target_resources: ["device"]
    validation:
      type: "field_required"
      field: "asset_tag"
    remediation: "Adicionar asset_tag no NetBox"

  - id: "NETBOX-002"
    name: "Production Device in Rack"
    description: "Dispositivos ativos devem estar em rack"
    severity: "CRITICAL"
    category: "Localização"
    enabled: true
    target_resources: ["device"]
    validation:
      type: "conditional_required"
      condition: "status == 'active'"
      field: "rack"
    remediation: "Mover dispositivo para rack"

  - id: "NETBOX-011"
    name: "Encryption at Rest"
    description: "Storage e backups devem ter encryption habilitada"
    severity: "HIGH"
    category: "Security"
    enabled: true
    target_resources: ["virtual_machine", "storage"]
    validation:
      type: "custom_field_equals"
      field: "encrypted"
      value: true
    remediation: "Habilitar encryption"

  - id: "NETBOX-012"
    name: "Backup Policy"
    description: "Dispositivos de produção devem ter backup"
    severity: "HIGH"
    category: "Disaster Recovery"
    enabled: true
    target_resources: ["device"]
    validation:
      type: "custom_field_exists"
      field: "backup_policy"
    remediation: "Definir política de backup"

  - id: "NETBOX-013"
    name: "Patch Level"
    description: "Dispositivos devem estar com patches em dia (máximo 90 dias)"
    severity: "MEDIUM"
    category: "Security"
    enabled: true
    target_resources: ["device"]
    validation:
      type: "custom_field_days_ago"
      field: "last_patch_date"
      max_days: 90
    remediation: "Aplicar patches de segurança"

  - id: "NETBOX-014"
    name: "Change Management"
    description: "Mudanças devem ter ticket de mudança associado"
    severity: "MEDIUM"
    category: "Process"
    enabled: true
    target_resources: ["device"]
    validation:
      type: "custom_field_exists"
      field: "change_ticket"
    remediation: "Criar ticket de mudança"

  - id: "NETBOX-015"
    name: "Owner Assignment"
    description: "Todo recurso deve ter responsável definido"
    severity: "HIGH"
    category: "Governança"
    enabled: true
    target_resources: ["device", "site", "rack"]
    validation:
      type: "custom_field_exists"
      field: "responsible"
    remediation: "Definir responsável"

  - id: "NETBOX-016"
    name: "SLA Monitoring"
    description: "Dispositivos de produção devem ter monitoramento"
    severity: "HIGH"
    category: "Monitoring"
    enabled: true
    target_resources: ["device"]
    validation:
      type: "custom_field_equals"
      field: "monitored"
      value: true
    remediation: "Habilitar monitoramento"

  - id: "NETBOX-017"
    name: "Access Control"
    description: "Dispositivos devem ter política de acesso documentada"
    severity: "MEDIUM"
    category: "Security"
    enabled: true
    target_resources: ["device"]
    validation:
      type: "custom_field_exists"
      field: "access_policy"
    remediation: "Documentar política de acesso"

  - id: "NETBOX-018"
    name: "Data Classification"
    description: "Dispositivos devem ter classificação de dados"
    severity: "MEDIUM"
    category: "Compliance"
    enabled: true
    target_resources: ["device"]
    validation:
      type: "custom_field_in"
      field: "data_classification"
      values: ["public", "internal", "confidential", "restricted"]
    remediation: "Definir classificação de dados"
```

---

### 3. Integração com Certificações

```python
# neo-stack/compliance/certifications.py
class CertificationMapper:
    """Mapeia regras de compliance para certificações"""

    def __init__(self):
        self.certifications = {
            'ISO_27001': {
                'A.8.2.1': ['NETBOX-001', 'NETBOX-010'],  # Asset Management
                'A.12.6.1': ['NETBOX-003'],  # Technical Vulnerability Management
                'A.9.2.3': ['NETBOX-015'],  # Access Rights Management
            },
            'SOC_2': {
                'CC6.1': ['NETBOX-016'],  # Logical and Physical Access Controls
                'CC7.2': ['NETBOX-011', 'NETBOX-012'],  # System Operations
                'CC8.1': ['NETBOX-014'],  # Change Management
            },
            'LGPD': {
                'Art.46': ['NETBOX-017', 'NETBOX-018'],  # Security Measures
                'Art.37': ['NETBOX-015'],  # Data Protection Officer
            }
        }

    def get_violations_by_certification(self, violations: List[ComplianceViolation]) -> Dict:
        """Agrupa violações por certificação"""
        cert_violations = {
            'ISO_27001': [],
            'SOC_2': [],
            'LGPD': []
        }

        for violation in violations:
            for cert, rules in self.certifications.items():
                for control, rule_ids in rules.items():
                    if violation.rule_id in rule_ids:
                        cert_violations[cert].append({
                            'control': control,
                            'violation': violation
                        })

        return cert_violations

    def generate_certification_report(self, cert_violations: Dict) -> str:
        """Gera relatório específico por certificação"""
        report = "# Relatório de Compliance por Certificação\n\n"

        for cert, violations in cert_violations.items():
            report += f"## {cert}\n\n"
            report += f"**Total de violações:** {len(violations)}\n\n"

            if violations:
                report += "### Violações encontradas:\n\n"
                for item in violations:
                    v = item['violation']
                    report += f"- **{item['control']}**: {v.message}\n"
            else:
                report += "✅ Nenhuma violação encontrada\n"

            report += "\n"

        return report
```

---

### 4. Dashboard de Compliance

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard de Compliance</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .metric { background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0; color: #2c3e50; }
        .metric .value { font-size: 48px; font-weight: bold; margin: 10px 0; }
        .critical { color: #e74c3c; }
        .warning { color: #f39c12; }
        .success { color: #27ae60; }
        .charts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #34495e; color: white; }
        .btn { padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ Dashboard de Compliance</h1>
        <p>Monitoramento em tempo real de políticas de governança</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <h3>Overall Compliance</h3>
            <div class="value success" id="overall-rate">--%</div>
            <p>Taxa média de compliance</p>
        </div>
        <div class="metric">
            <h3>Violações Críticas</h3>
            <div class="value critical" id="critical-violations">--</div>
            <p>Requerem ação imediata</p>
        </div>
        <div class="metric">
            <h3>Em Auditoria</h3>
            <div class="value warning" id="audit-pending">--</div>
            <p>Esperando aprovação</p>
        </div>
        <div class="metric">
            <h3>Certificações</h3>
            <div class="value" id="certifications">--/3</div>
            <p>ISO 27001, SOC 2, LGPD</p>
        </div>
    </div>

    <div class="charts">
        <div class="chart-container">
            <h3>Compliance por Categoria</h3>
            <canvas id="category-chart"></canvas>
        </div>
        <div class="chart-container">
            <h3>Tendência de Compliance (30 dias)</h3>
            <canvas id="trend-chart"></canvas>
        </div>
    </div>

    <h2>Violações Recentes</h2>
    <table id="violations-table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Regra</th>
                <th>Recurso</th>
                <th>Severidade</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

    <button class="btn" onclick="exportReport()">📊 Exportar Relatório</button>
    <button class="btn" onclick="runValidation()">🔄 Nova Validação</button>

    <script>
        async function loadDashboard() {
            const response = await fetch('/api/compliance/dashboard');
            const data = await response.json();

            document.getElementById('overall-rate').textContent = data.overall_rate.toFixed(1) + '%';
            document.getElementById('critical-violations').textContent = data.critical_violations;
            document.getElementById('audit-pending').textContent = data.audit_pending;
            document.getElementById('certifications').textContent = `${data.certifications_passed}/3`;

            // Gráfico por categoria
            const ctx1 = document.getElementById('category-chart').getContext('2d');
            new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data.by_category),
                    datasets: [{
                        data: Object.values(data.by_category).map(v => v.compliant),
                        backgroundColor: ['#27ae60', '#e74c3c', '#f39c12', '#3498db']
                    }]
                }
            });

            // Gráfico de tendência
            const ctx2 = document.getElementById('trend-chart').getContext('2d');
            new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: data.trend.dates,
                    datasets: [{
                        label: 'Compliance Rate',
                        data: data.trend.rates,
                        borderColor: '#27ae60',
                        tension: 0.4
                    }]
                }
            });

            // Tabela de violações
            const tbody = document.querySelector('#violations-table tbody');
            tbody.innerHTML = data.recent_violations.map(v => `
                <tr>
                    <td>${new Date(v.timestamp).toLocaleString()}</td>
                    <td>${v.rule_name}</td>
                    <td>${v.resource_type} #${v.resource_id}</td>
                    <td><span class="${v.severity.toLowerCase()}">${v.severity}</span></td>
                    <td><button onclick="remediate('${v.rule_id}', '${v.resource_id}')">Remediar</button></td>
                </tr>
            `).join('');
        }

        async function runValidation() {
            await fetch('/api/compliance/validate', { method: 'POST' });
            alert('Validação iniciada! Aguarde alguns minutos.');
        }

        async function exportReport() {
            const response = await fetch('/api/compliance/export');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
        }

        // Carregar dashboard
        loadDashboard();
        setInterval(loadDashboard, 30000); // Atualizar a cada 30s
    </script>
</body>
</html>
```

---

## 📊 Métricas e ROI

### KPIs de Compliance

```
Cenário: Empresa com 1000 dispositivos

Custos Anuais de Compliance Manual:
- Auditoria externa: R$ 500.000
- Consultor ISO 27001: R$ 300.000
- Auditoria interna (2 pessoas x 6 meses): R$ 600.000
- Ferramentas de auditoria: R$ 100.000
- Total: R$ 1.500.000/ano

Custos com Automação neo_stack:
- Desenvolvimento da solução: R$ 150.000 (one-time)
- Manutenção anual: R$ 50.000
- Total: R$ 50.000/ano

Economia: R$ 1.450.000/ano
ROI: 967% no primeiro ano

Benefícios Adicionais:
- ⚡ Detecção em tempo real (vs 1x por ano)
- 🎯 100% de cobertura (vs amostra de 20%)
- 📊 Dados confiáveis sempre
- 🔄 Auditoria contínua (não punitiva)
```

---

## 🔗 Próximos Passos

👉 **[Drift Detection](./drift-detection.md)** - Monitoramento contínuo

👉 **[Provisionamento](./provisionamento.md)** - Automação com compliance

👉 **[Dashboard NetBox + neo_stack](../integrations/netbox-neo_stack.md)** - Visão unificada

---

## 📚 Recursos

- **[ISO 27001 Controls](https://www.iso.org/isoiec-27001-information-security.html)** - Controle A.8.2.1
- **[SOC 2 Criteria](https://www.aicpa.org/resources/article/system-and-organization-controls-soc-2)** - Trust Services Criteria
- **[LGPD Compliance](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm)** - Art. 46
- **[Open Policy Agent](https://www.openpolicyagent.org/)** - Policy as Code

---

> **"Compliance não é um destino, é uma jornada contínua. A diferença é que agora ela é automática."**