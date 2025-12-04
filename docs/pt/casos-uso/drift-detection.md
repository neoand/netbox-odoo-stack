# Caso de Uso: Drift Detection com neo_stack

> **"Nunca mais se surpreenda com um servidor que 'mudou sozinho'."**

---

## 🎯 Objetivo

Detectar automaticamente quando a infraestrutura real difere do que está definido no NetBox:
- ✅ **Comparação** NetBox (ideal) vs Estado real
- ✅ **Alertas** automáticos quando detecta drift
- ✅ **Relatórios** de compliance
- ✅ **Histórico** de mudanças não autorizadas

---

## 📊 Problema que Resolve

| Cenário Sem Drift Detection | Com Drift Detection |
|---------------------------|-------------------|
| **Servidor com IP diferente** sem ninguém saber | Detecta em **10 min** e alerta |
| **VLAN alterada** e causa problema de rede | Gera **relatório** de alteração |
| **Configuração divergente** entre equipamentos | **Compara** automaticamente |
| **Hardware alterado** sem atualização no CMDB | **Audita** mudanças em tempo real |

---

## 🏗️ Arquitetura da Solução

```mermaid
graph LR
    A[NetBox<br/>Modelo Ideal] --> B[neo_stack<br/>Pipeline]
    B --> C[AnsibleFacts<br/>Estado Real]
    C --> D[Comparação]
    D --> E{Drift?}
    E -->|Sim| F[Alerta Slack/Email]
    E -->|Sim| G[Relatório HTML]
    E -->|Não| H[OK]
    F --> I[Atualizar NetBox]
    G --> J[Dashboard]
```

---

## 💻 Implementação Prática

### 1. Script de Coleta de Facts (Ansible)

```yaml
# ansible/playbooks/facts-collection.yml
---
- name: Coletar Facts para Drift Detection
  hosts: all
  gather_facts: yes
  tasks:
    - name: Coletar informações de rede
      ansible.builtin.setup:
        filter:
          - ansible_default_ipv4
          - ansible_*
          - ansible_distribution
          - ansible_kernel

    - name: Coletar interfaces de rede
      ansible.builtin.shell: |
        ip addr show | grep -E "^[0-9]+: " | awk '{print $2}'
      register: interfaces

    - name: Coletar IPs configurados
      ansible.builtin.shell: |
        ip addr show | grep -E "inet " | awk '{print $2}'
      register: ip_addresses

    - name: Gerar JSON de fatos
      ansible.builtin.copy:
        content: |
          {
            "hostname": "{{ inventory_hostname }}",
            "interfaces": {{ interfaces.stdout | to_json }},
            "ip_addresses": {{ ip_addresses.stdout | to_json }},
            "ansible_facts": {{ ansible_facts | to_json }},
            "timestamp": "{{ ansible_date_time.iso8601 }}"
          }
        dest: "/tmp/facts/{{ inventory_hostname }}.json"
      delegate_to: localhost

    - name: Enviar para neo_stack
      ansible.builtin.uri:
        url: "http://neo-stack:3000/api/facts"
        method: POST
        body_format: json
        body:
          hostname: "{{ inventory_hostname }}"
          facts: "{{ ansible_facts }}"
        headers:
          Authorization: "Bearer {{ neo_stack_token }}"
```

---

### 2. Comparação no neo_stack

```python
# neo-stack/scripts/drift-detection.py
import pynetbox
import json
from pathlib import Path
import difflib
from datetime import datetime

class DriftDetector:
    def __init__(self, netbox_url, netbox_token):
        self.nb = pynetbox.api(netbox_url, token=netbox_token)
        self.facts_dir = Path('/tmp/facts')

    def collect_netbox_data(self, hostname):
        """Busca dados ideais do NetBox"""
        try:
            device = self.nb.dcim.devices.get(name=hostname)
            if not device:
                return None

            # Coletar dados técnicos
            netbox_data = {
                'hostname': device.name,
                'serial': device.serial,
                'asset_tag': device.asset_tag,
                'site': device.site.name if device.site else None,
                'rack': device.rack.name if device.rack else None,
                'position': device.position,
                'interfaces': []
            }

            # Interfaces do NetBox
            for iface in device.interfaces.all():
                netbox_data['interfaces'].append({
                    'name': iface.name,
                    'mac_address': iface.mac_address,
                    'enabled': iface.enabled,
                    'description': iface.description
                })

            # IPs do NetBox
            netbox_data['ip_addresses'] = []
            for ip in self.nb.ipam.ip_addresses.filter(device_id=device.id):
                netbox_data['ip_addresses'].append({
                    'address': ip.address,
                    'interface': ip.interface.name if ip.interface else None,
                    'vlan': ip.vlan.name if ip.vlan else None
                })

            return netbox_data

        except Exception as e:
            print(f"Erro ao coletar NetBox para {hostname}: {e}")
            return None

    def collect_real_data(self, hostname):
        """Busca estado real via Ansible facts"""
        facts_file = self.facts_dir / f"{hostname}.json"
        if facts_file.exists():
            with open(facts_file) as f:
                return json.load(f)
        return None

    def detect_drifts(self, hostname):
        """Compara NetBox vs Estado Real"""
        netbox_data = self.collect_netbox_data(hostname)
        real_data = self.collect_real_data(hostname)

        if not netbox_data or not real_data:
            return {
                'hostname': hostname,
                'status': 'ERROR',
                'error': 'Dados insuficientes'
            }

        drifts = []

        # Verificar hostname
        if real_data['hostname'] != netbox_data['hostname']:
            drifts.append({
                'field': 'hostname',
                'netbox': netbox_data['hostname'],
                'real': real_data['hostname'],
                'severity': 'HIGH'
            })

        # Verificar interfaces (comparar listas)
        real_interfaces = [iface.split(':')[0] for iface in real_data['interfaces']]
        netbox_interfaces = [iface['name'] for iface in netbox_data['interfaces']]

        # Interfaces em excesso no real
        for iface in real_interfaces:
            if iface not in netbox_interfaces and not iface.startswith('lo'):
                drifts.append({
                    'field': 'interfaces',
                    'message': f'Interface {iface} existe no real mas não no NetBox',
                    'severity': 'MEDIUM'
                })

        # IPs em excesso no real
        real_ips = [ip.split('/')[0] for ip in real_data['ip_addresses']]
        netbox_ips = [ip['address'].split('/')[0] for ip in netbox_data['ip_addresses']]

        for ip in real_ips:
            if ip not in netbox_ips:
                drifts.append({
                    'field': 'ip_addresses',
                    'message': f'IP {ip} configurado mas não no NetBox',
                    'severity': 'CRITICAL'
                })

        # Verificar MAC addresses
        for netbox_iface in netbox_data['interfaces']:
            if netbox_iface['mac_address']:
                # Procurar interface com mesmo nome
                matching_real = next(
                    (i for i in real_interfaces if netbox_iface['name'] in i),
                    None
                )
                if matching_real:
                    # MAC deve bater (simplificado)
                    real_mac = real_data.get('ansible_facts', {}).get('ansible_eth0', {}).get('macaddress')
                    if real_mac != netbox_iface['mac_address']:
                        drifts.append({
                            'field': 'mac_address',
                            'interface': netbox_iface['name'],
                            'message': f"MAC {real_mac} difere do NetBox {netbox_iface['mac_address']}",
                            'severity': 'HIGH'
                        })

        return {
            'hostname': hostname,
            'timestamp': datetime.now().isoformat(),
            'status': 'DRIFT' if drifts else 'COMPLIANT',
            'drifts': drifts,
            'drift_count': len(drifts)
        }

    def generate_report(self, drifts_report):
        """Gera relatório HTML"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório de Drift Detection</title>
            <style>
                body {{ font-family: Arial; margin: 20px; }}
                .header {{ background: #333; color: white; padding: 20px; }}
                .summary {{ background: #f0f0f0; padding: 15px; margin: 20px 0; }}
                .drift {{ border-left: 4px solid #ff9800; padding: 10px; margin: 10px 0; }}
                .critical {{ border-color: #f44336; }}
                .high {{ border-color: #ff9800; }}
                .medium {{ border-color: #ffc107; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Relatório de Drift Detection</h1>
                <p>Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
            </div>
        """

        total_drifts = sum(r['drift_count'] for r in drifts_report)
        compliant_count = sum(1 for r in drifts_report if r['status'] == 'COMPLIANT')

        html += f"""
            <div class="summary">
                <h2>📈 Resumo</h2>
                <p><strong>Total de hosts:</strong> {len(drifts_report)}</p>
                <p><strong>Em compliance:</strong> {compliant_count}</p>
                <p><strong>Com drift:</strong> {len(drifts_report) - compliant_count}</p>
                <p><strong>Total de drifts:</strong> {total_drifts}</p>
            </div>
        """

        for report in drifts_report:
            status_icon = "✅" if report['status'] == 'COMPLIANT' else "⚠️"
            status_color = "green" if report['status'] == 'COMPLIANT' else "orange"

            html += f"""
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd;">
                <h3>{status_icon} {report['hostname']} - Status: {report['status']}</h3>
            """

            if report['drifts']:
                for drift in report['drifts']:
                    severity = drift.get('severity', 'MEDIUM').lower()
                    html += f"""
                    <div class="drift {severity}">
                        <strong>{drift['field']}</strong>: {drift.get('message', drift.get('netbox', ''))}
                    </div>
                    """
            else:
                html += "<p style='color: green;'>✅ Host em compliance total</p>"

            html += "</div>"

        html += """
        </body>
        </html>
        """

        return html

# Uso
if __name__ == '__main__':
    detector = DriftDetector(
        netbox_url='http://netbox.company.com',
        netbox_token='SEU_TOKEN'
    )

    # Detectar drift para todos ativos os devices
    devices = detector.nb.dcim.devices.filter(status='active')
    reports = []

    for device in devices:
        print(f"Analisando {device.name}...")
        drift_report = detector.detect_drifts(device.name)
        reports.append(drift_report)

    # Gerar relatório
    report_html = detector.generate_report(reports)
    with open('/var/www/drift-report.html', 'w') as f:
        f.write(report_html)

    print(f"Relatório gerado: /var/www/drift-report.html")
```

---

### 3. Pipeline neo_stack (YAML)

```yaml
# neo-stack/pipelines/drift-detection.yml
name: Drift Detection Pipeline

triggers:
  - cron: "0 */6 * * *"  # A cada 6 horas
  - webhook: "netbox.device.updated"

stages:
  1: Facts Collection
    jobs:
      - name: "Run Ansible Facts"
        type: "ansible-playbook"
        config:
          playbook: "playbooks/facts-collection.yml"
          inventory: "inventory/production"
          timeout: 3600
        notifications:
          - slack: "#infra-alerts"

  2: Drift Analysis
    jobs:
      - name: "Analyze Drifts"
        type: "python"
        script: "scripts/drift-detection.py"
        dependencies: ["1"]
        output:
          - file: "/var/www/drift-report.html"
          - json: "/tmp/drift-report.json"

  3: Compliance Actions
    jobs:
      - name: "Update NetBox"
        type: "webhook"
        config:
          url: "http://netbox.company.com/api/dcim/devices/"
          method: "PATCH"
          payload: "{{ from_stage_2.needs_update }}"
        condition:
          - field: "drift_count"
            operator: "gt"
            value: 0

      - name: "Send Alert"
        type: "notification"
        config:
          channels: ["slack", "email"]
          template: "drift-alert.j2"
        condition:
          - field: "drift_count"
            operator: "gt"
            value: 0
```

---

### 4. Template de Alerta (Slack/Email)

```jinja2
# templates/drift-alert.j2
🚨 **DRIFT DETECTADO**

Host: {{ hostname }}
Data: {{ timestamp }}

{% if drifts %}
**Drifts encontrados ({{ drift_count }}):**

{% for drift in drifts %}
⚠️ **{{ drift.field }}** ({{ drift.severity }})
   {{ drift.message }}

{% endfor %}
{% endif %}

Ações:
- Ver relatório completo: {{ report_url }}
- Atualizar NetBox: {{ netbox_link }}

---
Pipeline: {{ pipeline_id }}
```

---

### 5. Docker Compose (neo_stack + NetBox)

```yaml
# docker-compose.yml (adicionar ao projeto)
version: '3.8'
services:
  neo-stack:
    image: neoand/neo-stack:latest
    ports:
      - "3000:3000"
    environment:
      - NETBOX_URL=http://netbox:8080
      - NETBOX_TOKEN=${NETBOX_TOKEN}
      - NEO_STACK_DB_HOST=postgres
    volumes:
      - ./pipelines:/app/pipelines
      - ./scripts:/app/scripts
      - /tmp/facts:/tmp/facts
    depends_on:
      - postgres

  drift-scheduler:
    image: neoand/neo-stack:latest
    command: ["python", "scheduler.py", "drift-detection"]
    environment:
      - NEO_STACK_API=http://neo-stack:3000
    volumes:
      - /tmp/facts:/tmp/facts

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./reports:/var/www
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - neo-stack
```

---

## 📊 Métricas e ROI

### Métricas Coletadas

```python
# neo-stack/metrics/drift-metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Métricas Prometheus
drift_detections = Counter('drift_detections_total', 'Total de drifts detectados', ['severity'])
drift_resolution_time = Histogram('drift_resolution_seconds', 'Tempo para resolver drift')
compliance_percentage = Gauge('compliance_percentage', 'Porcentagem de hosts em compliance')
devices_scanned = Counter('devices_scanned_total', 'Total de dispositivos escaneados')

# Exemplo de uso
for report in drift_reports:
    devices_scanned.inc()
    compliance_pct = (report['compliant'] / report['total']) * 100
    compliance_percentage.set(compliance_pct)

    for drift in report['drifts']:
        drift_detections.labels(severity=drift['severity']).inc()
```

### ROI Calculado

```
Cenário: 500 servidores

Antes do Drift Detection:
- 2 drifts/semana não detectados
- 4h para encontrar cada drift
- Custo: R$ 200/hora
- Perda por drift: R$ 20.000 (downtime)
- Custo total/mês: R$ 160.000

Com Drift Detection:
- 0 drifts não detectados
- 10 min para detectar
- Custo por drift: R$ 500 (investigação)
- Custo total/mês: R$ 2.000

Economia mensal: R$ 158.000
Economia anual: R$ 1.896.000

Investimento (desenvolvimento): R$ 80.000
ROI: 2.270% no primeiro ano
```

---

## 🔗 Próximos Passos

👉 **[Pipelines de Provisionamento](./provisionamento.md)** - Automatizar criação de infraestrutura

👉 **[Integração NetBox + neo_stack](../integrations/netbox-neo_stack.md)** - Ver mais integrações

👉 **[Compliance Auditor eia](./compliance.md)** - Políticas e governança

---

## 📚 Recursos

- **[Ansible Facts](https://docs.ansible.com/ansible/latest/modules/setup_module.html)** - Módulo de coleta
- **[NetBox API](https://docs.netbox.dev/en/stable/api-guide/)** - Documentação REST/GraphQL
- **[Pipeline as Code](https://www.jenkins.io/doc/book/pipeline-as-code/)** - Conceito de pipelines
- **[Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)** - Observabilidade

---

> **"A diferença entre infraestrutura boa e infraestrutura excelente é que na excelente você detecta problemas antes que eles te detectem."**