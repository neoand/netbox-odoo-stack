# Integração NetBox ↔ neo_stack (IaC/DevOps)

> **AI Context**: Este documento descreve como usar NetBox como Source of Truth para pipelines de Infrastructure as Code (Terraform, Ansible) no contexto do neo_stack, incluindo validação de dados, drift detection, e feedback loops.

## Objetivo

- Usar **NetBox como Single Source of Truth** para pipelines IaC/DevOps
- Automatizar **provisionamento** de infraestrutura baseado em dados confiáveis
- Implementar **validação de compliance** e drift detection
- Criar **feedback loops** entre estado real e modelo NetBox

## Arquitetura

```
┌────────────────────────────────────────────────────────┐
│                NetBox (CMDB/IPAM)                      │
│  - Prefixes, VLANs, IP addresses                       │
│  - Devices, Interfaces, Cables                         │
│  - Sites, Racks, Power                                 │
│  - Services, Custom Fields, Tags                       │
└──────────────┬─────────────────────────────────────────┘
               │
         [REST API / GraphQL]
               │
               ▼
┌────────────────────────────────────────────────────────┐
│            neo_stack Pipeline (CI/CD)                  │
│  1. Extract: Query NetBox API                          │
│  2. Validate: Lint & compliance checks                 │
│  3. Transform: Generate IaC (Terraform/Ansible)        │
│  4. Apply: Provision infrastructure                    │
│  5. Verify: Compare state real vs. NetBox              │
│  6. Feedback: Update NetBox (status, tags)             │
└──────────────┬─────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│              Infrastructure (Real State)               │
│  - Cloud (AWS, Azure, GCP)                             │
│  - On-premises (VMware, Proxmox)                       │
│  - Network devices (switches, routers)                 │
└────────────────────────────────────────────────────────┘
```

## Casos de Uso

### 1. Terraform: Provisioning de VMs

**Fluxo**:

```python
# Script: extract_netbox_vms.py
import pynetbox
import json

nb = pynetbox.api('https://netbox.example.com', token='token')

# Query virtual machines tagged com "terraform-managed"
vms = nb.virtualization.virtual_machines.filter(tag='terraform-managed')

# Gerar terraform.tfvars.json
tf_vars = {
    'vms': [
        {
            'name': vm.name,
            'vcpus': vm.vcpus,
            'memory': vm.memory,
            'disk': vm.disk,
            'cluster': vm.cluster.name,
            'primary_ip': str(vm.primary_ip4).split('/')[0] if vm.primary_ip4 else None,
        }
        for vm in vms
    ]
}

with open('terraform.tfvars.json', 'w') as f:
    json.dump(tf_vars, f, indent=2)
```

**Terraform:**

```hcl
# main.tf
variable "vms" {
  type = list(object({
    name       = string
    vcpus      = number
    memory     = number
    disk       = number
    cluster    = string
    primary_ip = string
  }))
}

resource "proxmox_vm_qemu" "netbox_vms" {
  for_each = { for vm in var.vms : vm.name => vm }

  name        = each.value.name
  target_node = each.value.cluster
  cores       = each.value.vcpus
  memory      = each.value.memory

  # ... outras configurações
}
```

### 2. Ansible: Configuração de Network Devices

**Fluxo**:

```python
# Script: generate_ansible_inventory.py
import pynetbox
import yaml

nb = pynetbox.api('https://netbox.example.com', token='token')

# Query devices com role "switch"
switches = nb.dcim.devices.filter(role='switch', status='active')

inventory = {
    'all': {
        'children': {
            'switches': {
                'hosts': {}
            }
        }
    }
}

for switch in switches:
    inventory['all']['children']['switches']['hosts'][switch.name] = {
        'ansible_host': str(switch.primary_ip4).split('/')[0],
        'ansible_network_os': switch.platform.slug if switch.platform else 'ios',
        'site': switch.site.name,
        'rack': switch.rack.name if switch.rack else None,
    }

with open('inventory.yml', 'w') as f:
    yaml.dump(inventory, f)
```

**Ansible Playbook:**

```yaml
# playbook.yml
- name: Configure switches from NetBox
  hosts: switches
  gather_facts: no
  tasks:
    - name: Get interfaces from NetBox
      uri:
        url: "https://netbox.example.com/api/dcim/interfaces/?device={{ inventory_hostname }}"
        headers:
          Authorization: "Token {{ netbox_token }}"
        return_content: yes
      register: netbox_interfaces
      delegate_to: localhost

    - name: Configure interfaces
      cisco.ios.ios_interfaces:
        config: "{{ netbox_interfaces.json.results | map_interfaces }}"
        state: merged
```

## Validações e Compliance

### Lint de Dados NetBox

```python
# Script: lint_netbox_data.py
import pynetbox
from typing import List, Dict

nb = pynetbox.api('https://netbox.example.com', token='token')

def check_overlapping_prefixes() -> List[Dict]:
    """Detectar prefixos IP sobrepostos"""
    prefixes = nb.ipam.prefixes.all()
    errors = []

    # Lógica de detecção (simplificada)
    for i, p1 in enumerate(prefixes):
        for p2 in prefixes[i+1:]:
            if p1.prefix.overlaps(p2.prefix):
                errors.append({
                    'type': 'overlapping_prefix',
                    'prefix1': str(p1.prefix),
                    'prefix2': str(p2.prefix),
                })

    return errors

def check_duplicate_vlans() -> List[Dict]:
    """Detectar VLANs duplicadas no mesmo site"""
    vlans = nb.ipam.vlans.all()
    errors = []

    site_vlans = {}
    for vlan in vlans:
        site = vlan.site.slug if vlan.site else 'global'
        key = (site, vlan.vid)

        if key in site_vlans:
            errors.append({
                'type': 'duplicate_vlan',
                'site': site,
                'vlan_id': vlan.vid,
                'existing': site_vlans[key],
                'duplicate': vlan.name,
            })
        else:
            site_vlans[key] = vlan.name

    return errors

def check_naming_convention() -> List[Dict]:
    """Validar naming convention de devices"""
    devices = nb.dcim.devices.all()
    errors = []

    # Exemplo: switches devem ter nome "sw-<site>-<number>"
    for device in devices:
        if device.device_role.slug == 'switch':
            if not device.name.startswith('sw-'):
                errors.append({
                    'type': 'naming_convention',
                    'device': device.name,
                    'expected_pattern': 'sw-<site>-<number>',
                })

    return errors

# Executar todas as validações
all_errors = []
all_errors.extend(check_overlapping_prefixes())
all_errors.extend(check_duplicate_vlans())
all_errors.extend(check_naming_convention())

if all_errors:
    print(f"❌ Found {len(all_errors)} validation errors:")
    for error in all_errors:
        print(f"  - {error}")
    exit(1)
else:
    print("✅ All validations passed")
    exit(0)
```

### Integração com CI/CD

```yaml
# .gitlab-ci.yml ou .github/workflows/netbox-validation.yml
stages:
  - validate
  - plan
  - apply

validate_netbox:
  stage: validate
  script:
    - python3 lint_netbox_data.py
  only:
    - main
    - merge_requests

terraform_plan:
  stage: plan
  script:
    - python3 extract_netbox_vms.py
    - terraform init
    - terraform plan -out=tfplan
  dependencies:
    - validate_netbox
  artifacts:
    paths:
      - tfplan

terraform_apply:
  stage: apply
  script:
    - terraform apply tfplan
    - python3 update_netbox_status.py  # Feedback loop
  when: manual
  only:
    - main
```

## Drift Detection

### Comparar Estado Real vs. NetBox

```python
# Script: detect_drift.py
import pynetbox
import subprocess
import json

nb = pynetbox.api('https://netbox.example.com', token='token')

def get_netbox_vms():
    """Buscar VMs esperadas no NetBox"""
    vms = nb.virtualization.virtual_machines.filter(status='active')
    return {vm.name: vm for vm in vms}

def get_real_vms():
    """Buscar VMs reais no Proxmox/VMware"""
    # Exemplo com Proxmox
    result = subprocess.run(
        ['pvesh', 'get', '/cluster/resources', '--type', 'vm', '--output-format', 'json'],
        capture_output=True,
        text=True
    )
    vms = json.loads(result.stdout)
    return {vm['name']: vm for vm in vms}

def detect_drift():
    netbox_vms = get_netbox_vms()
    real_vms = get_real_vms()

    drift = {
        'missing_in_reality': [],  # No NetBox mas não existe
        'missing_in_netbox': [],   # Existe mas não está no NetBox
        'configuration_drift': [], # Existe mas configuração diverge
    }

    # VMs no NetBox mas não no ambiente real
    for name in set(netbox_vms.keys()) - set(real_vms.keys()):
        drift['missing_in_reality'].append(name)

    # VMs no ambiente real mas não no NetBox
    for name in set(real_vms.keys()) - set(netbox_vms.keys()):
        drift['missing_in_netbox'].append(name)

    # VMs em ambos mas com configuração divergente
    for name in set(netbox_vms.keys()) & set(real_vms.keys()):
        nb_vm = netbox_vms[name]
        real_vm = real_vms[name]

        if nb_vm.vcpus != real_vm['cpus']:
            drift['configuration_drift'].append({
                'vm': name,
                'field': 'vcpus',
                'netbox': nb_vm.vcpus,
                'reality': real_vm['cpus'],
            })

        if nb_vm.memory != real_vm['maxmem'] / (1024**2):  # MB
            drift['configuration_drift'].append({
                'vm': name,
                'field': 'memory',
                'netbox': nb_vm.memory,
                'reality': real_vm['maxmem'] / (1024**2),
            })

    return drift

if __name__ == '__main__':
    drift = detect_drift()

    if any(drift.values()):
        print("⚠️ Drift detected:")
        print(json.dumps(drift, indent=2))
        exit(1)
    else:
        print("✅ No drift detected")
        exit(0)
```

## Feedback Loop: Atualizar NetBox

```python
# Script: update_netbox_status.py
import pynetbox

nb = pynetbox.api('https://netbox.example.com', token='token')

def update_vm_status_after_provisioning(vm_name: str, success: bool):
    """Atualizar status da VM no NetBox após provisioning"""
    vm = nb.virtualization.virtual_machines.get(name=vm_name)

    if success:
        vm.status = 'active'
        vm.custom_fields['last_provisioned'] = '2025-12-05'
        vm.custom_fields['provisioning_status'] = 'success'
    else:
        vm.status = 'failed'
        vm.custom_fields['provisioning_status'] = 'failed'

    vm.save()

def add_compliance_tag(device_name: str, compliant: bool):
    """Adicionar tag de compliance ao device"""
    device = nb.dcim.devices.get(name=device_name)

    if compliant:
        tag = nb.extras.tags.get(slug='compliant')
    else:
        tag = nb.extras.tags.get(slug='non-compliant')

    if tag not in device.tags:
        device.tags.append(tag)
        device.save()
```

## Webhooks NetBox para Pipelines

### Trigger de Pipeline ao Criar Device

```python
# Webhook receiver: /webhooks/netbox-device-created
from flask import Flask, request
import subprocess

app = Flask(__name__)

@app.route('/webhooks/netbox-device-created', methods=['POST'])
def handle_netbox_webhook():
    payload = request.json

    if payload['event'] == 'created' and payload['model'] == 'dcim.device':
        device_data = payload['data']

        # Trigger pipeline GitLab/GitHub
        subprocess.run([
            'curl', '-X', 'POST',
            '-H', 'Authorization: Bearer $GITLAB_TOKEN',
            'https://gitlab.com/api/v4/projects/123/trigger/pipeline',
            '-d', f'ref=main&variables[DEVICE_NAME]={device_data["name"]}'
        ])

        return {'status': 'pipeline_triggered'}, 200

    return {'status': 'ignored'}, 200
```

## Boas Práticas

### 1. Contratos de Dados (Schemas)

Documentar quais campos do NetBox são usados por cada pipeline:

```yaml
# netbox-contracts.yml
terraform_vms:
  entities:
    - virtualization.virtual_machines
  required_fields:
    - name
    - vcpus
    - memory
    - disk
    - cluster
    - primary_ip4
  optional_fields:
    - custom_fields.cost_center
    - tags

ansible_switches:
  entities:
    - dcim.devices
    - dcim.interfaces
  required_fields:
    - name
    - primary_ip4
    - platform
    - site
  filters:
    - device_role: switch
    - status: active
```

### 2. Idempotência

Garantir que pipelines podem ser executados múltiplas vezes sem efeitos colaterais:

```python
# Sempre usar upsert (create or update)
vm = nb.virtualization.virtual_machines.get(name='vm-test-01')
if vm:
    vm.update({'vcpus': 4, 'memory': 8192})
else:
    nb.virtualization.virtual_machines.create({
        'name': 'vm-test-01',
        'vcpus': 4,
        'memory': 8192,
        'cluster': 1,
    })
```

### 3. Versionamento

Versionar templates e mapeamentos junto com schemas NetBox:

```
repo/
├── netbox-schemas/
│   └── v1.0/
│       ├── devices.json
│       ├── vms.json
│       └── prefixes.json
├── terraform/
│   └── templates/
│       └── vm.tf.j2
└── ansible/
    └── templates/
        └── interface.j2
```

## Troubleshooting

### Pipeline falha ao consultar NetBox

```bash
# Verificar conectividade
curl -I https://netbox.example.com/api/

# Verificar token
curl -H "Authorization: Token $NETBOX_TOKEN" \
  https://netbox.example.com/api/dcim/devices/?limit=1

# Verificar rate limiting
curl -I https://netbox.example.com/api/ | grep -i rate
```

### Drift detection reportando falsos positivos

```python
# Adicionar tolerância em comparações numéricas
if abs(nb_vm.memory - real_vm['memory']) > 512:  # Tolerância de 512MB
    drift['configuration_drift'].append(...)
```

## Próximos Passos

- [ ] Implementar validação de dependências (service → app → host)
- [ ] Dashboard de compliance (% devices conformes)
- [ ] Auto-remediation de drift (reconciliar automaticamente)
- [ ] Integração com Vault para secrets (API tokens, passwords)
- [ ] Exemplo completo de pipeline end-to-end
- [ ] Métricas de tempo de provisionamento (NetBox → Infra ativa)

## Referências

- [NetBox as Source of Truth for Automation](https://netboxlabs.com/blog/netbox-source-of-truth-for-network-automation/)
- [Terraform Provider for NetBox](https://registry.terraform.io/providers/e-breuninger/netbox/latest/docs)
- [Ansible NetBox Inventory Plugin](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html)
