# Plugins: Estendendo o NetBox

> **"Plugins transformam o NetBox de uma ferramenta em uma plataforma. O limite é sua imaginação."**

---

## 🎯 **O que são Plugins?**

Plugins são **extensões** que adicionam funcionalidades ao NetBox:

```
NetBox Base
├── DCIM (Devices, Racks, Sites)
├── IPAM (IPs, VLANs, Prefixes)
├── Plugins (Extensões customizadas)
    ├── Documents (Documentação)
    ├── Inventory (Inventário)
    ├── Maintenance (Manutenção)
    └── ... (100+ plugins)
```

### **Por que usar plugins?**
- ✅ **Funcionalidades extras** sem customizar core
- ✅ **Fácil instalação** e remoção
- ✅ **Independentes** do ciclo de updates
- ✅ **Comunidade ativa** desenvolvendo

---

## 📦 **Plugins da Comunidade**

### **Plugin Directory Localizado em:** `/community/awesome-netbox/plugins/`

### **Top 10 Plugins Mais Utilizados:**

| Plugin | Função | Instalações | Rating |
|--------|--------|-------------|--------|
| **netbox-documents** | Anexar documentação | 2.5K | ⭐⭐⭐⭐⭐ |
| **netbox-inventory** | Gerenciamento de inventário | 1.8K | ⭐⭐⭐⭐⭐ |
| **netbox-wizard** | Assistente de configuração | 1.2K | ⭐⭐⭐⭐ |
| **netbox-golden-config** | Configurações de referência | 980 | ⭐⭐⭐⭐⭐ |
| **netbox-proxbox** | VMware integration | 876 | ⭐⭐⭐⭐ |
| **netbox-device-onboarding** | Onboarding automatizado | 754 | ⭐⭐⭐⭐ |
| **netbox-ssot** | Single Source of Truth | 643 | ⭐⭐⭐⭐⭐ |
| **netbox-traffic** | Monitor de tráfego | 532 | ⭐⭐⭐⭐ |
| **netbox-backup** | Backup de configurações | 487 | ⭐⭐⭐⭐ |
| **netbox-dns** | Gerenciamento DNS | 421 | ⭐⭐⭐⭐ |

---

## 🔌 **Plugin: netbox-documents**

### **O que faz:**
Permite anexar **documentos** (PDFs, imagens, links) diretamente aos dispositivos, racks, IPs, etc.

### **Funcionalidades:**
- ✅ Upload de arquivos (PDF, DOC, XLS, JPG, PNG)
- ✅ Links externos (documentação online)
- ✅ Organização por categorias
- ✅ Controle de acesso
- ✅ Versionamento
- ✅ Busca por documento

### **Instalação:**

#### **Método 1: Via PIP**
```bash
# Ativar ambiente virtual do NetBox
source /opt/netbox/venv/bin/activate

# Instalar plugin
pip install netbox-documents

# Editar configuração
cd /opt/netbox
nano netbox/netbox/configuration.py

# Adicionar ao PLUGINS:
PLUGINS = [
    'netbox.documents',
]

# Aplicar migrações
python netbox/manage.py migrate

# Recarregar NetBox
sudo systemctl restart netbox
```

#### **Método 2: Via requirements.txt**
```bash
# Adicionar ao requirements.txt
echo "netbox-documents" >> /opt/netbox/local/requirements.txt

# Reinstalar
cd /opt/netbox
source /opt/netbox/venv/bin/activate
pip install -r local/requirements.txt

# Migrar
python netbox/manage.py migrate
```

### **Configuração:**
```python
# configuration.py
PLUGINS = [
    'netbox.documents',
]

PLUGINS_CONFIG = {
    'netbox.documents': {
        'upload_size': 10,  # MB
        'allowed_extensions': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'],
        'document_types': [
            'manual',
            'datasheet',
            'diagram',
            'contract',
            'warranty',
            'other'
        ]
    }
}
```

### **Uso:**

#### **Via Interface Web:**
```bash
1. Device → Add Document
2. Selecionar tipo de documento
3. Upload do arquivo
4. Definir nome e descrição
5. Save
```

#### **Via API Python:**
```python
import pynetbox
import os

nb = pynetbox.api('http://localhost:8080', token='TOKEN')

# Criar documento
with open('manual-switch-core01.pdf', 'rb') as f:
    document = nb.extras.documents.create(
        device=123,
        document_type='manual',
        name='Manual Switch Core 01',
        file=f,
        description='Manual técnico completo'
    )

print(f"✅ Documento criado: {document.name}")
```

#### **Via API REST:**
```bash
curl -X POST http://localhost:8080/api/extras/documents/ \
  -H "Authorization: Token SEU_TOKEN" \
  -F "device=123" \
  -F "document_type=manual" \
  -F "name=Manual Switch" \
  -F "file=@manual.pdf"
```

### **Exemplo Prático: Automação de Documentos**

```python
#!/usr/bin/env python3
"""
Script para anexar automaticamente documentação aos dispositivos
baseado no asset_tag ou serial number.
"""

import os
import pynetbox
from pathlib import Path

nb = pynetbox.api('http://localhost:8080', token='TOKEN')

# Diretório com documentação
DOCS_DIR = './documentacao'

def attach_documents_to_device(device_id):
    """Anexa documentos relevantes ao dispositivo"""
    device = nb.dcim.devices.get(id=device_id)
    if not device:
        return

    # Buscar arquivos que correspondem ao device
    for doc_file in Path(DOCS_DIR).rglob('*'):
        if not doc_file.is_file():
            continue

        # Verificar se o nome do arquivo contém o serial ou asset_tag
        filename = doc_file.name.lower()
        device_identifier = f"{device.serial or device.asset_tag or device.name}".lower()

        if device_identifier in filename:
            print(f"📎 Anexando {doc_file.name} ao device {device.name}")

            # Determinar tipo do documento
            doc_type = 'other'
            if 'manual' in filename:
                doc_type = 'manual'
            elif 'datasheet' in filename:
                doc_type = 'datasheet'
            elif 'warranty' in filename:
                doc_type = 'warranty'

            # Upload do documento
            with open(doc_file, 'rb') as f:
                nb.extras.documents.create(
                    device=device.id,
                    document_type=doc_type,
                    name=doc_file.stem,
                    file=f,
                    description=f'Anexado automaticamente'
                )

def main():
    """Processa todos os dispositivos ativos"""
    devices = nb.dcim.devices.filter(status='active')

    for device in devices:
        attach_documents_to_device(device.id)

    print("✅ Processamento concluído")

if __name__ == '__main__':
    main()
```

---

## 🔌 **Plugin: netbox-inventory**

### **O que faz:**
Adiciona **gestão de inventário** avançada ao NetBox:
- Tracking de ativos
- Controle de garantia
- Contratos e licenciamento
- Localização detalhada
- Histórico de mudanças

### **Instalação:**
```bash
# Instalar
pip install netbox-inventory

# Configurar
PLUGINS = [
    'netbox_inventory',
]

# Migrar
python netbox/manage.py migrate netbox_inventory

# Reiniciar
sudo systemctl restart netbox
```

### **Funcionalidades:**

#### **1. Ativos (Assets)**
```python
# Criar ativo
asset = nb.extras.assets.create(
    device=123,
    asset_tag='SW-001',
    status='active',
    location='Datacenter A - Rack 01',
    purchase_date='2024-01-15',
    warranty_end='2027-01-15',
    warranty_type='manufacturer',
    serial=device.serial,
    value=15000.00,
    currency='USD'
)
```

#### **2. Contratos**
```python
# Criar contrato de manutenção
contract = nb.extras.contracts.create(
    device=123,
    contract_type='maintenance',
    contract_number='MNT-2024-001',
    start_date='2024-01-15',
    end_date='2025-01-15',
    value=2500.00,
    currency='USD',
    provider='Cisco'
)
```

#### **3. Licenças**
```python
# Adicionar licença de software
license = nb.extras.licenses.create(
    device=123,
    software='IOS XE',
    license_key='XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
    seat_count=1,
    expiration_date='2025-12-31'
)
```

### **Dashboard de Inventário:**
```python
# Relatório de ativos próximos ao fim da garantia
from datetime import datetime, timedelta

warranty_threshold = datetime.now() + timedelta(days=90)

assets = nb.extras.assets.filter()
critical_assets = []

for asset in assets:
    if asset.warranty_end and asset.warranty_end < warranty_threshold:
        critical_assets.append({
            'device': asset.device.name,
            'warranty_end': asset.warranty_end,
            'days_left': (asset.warranty_end - datetime.now()).days
        })

# Exibir ativos críticos
for asset in critical_assets:
    print(f"⚠️  {asset['device']}: Garantia expira em {asset['days_left']} dias")
```

---

## 🔌 **Plugin: netbox-wizard**

### **O que faz:**
Assistente visual para criar dispositivos, racks, interfaces de forma guiada.

### **Instalação:**
```bash
pip install netbox-wizard
```

### **Uso:**
```bash
1. Acesse: NetBox → Plugins → Wizard
2. Selecione tipo de operação:
   - Add Device
   - Add Rack
   - Add Site
3. Siga o assistente passo-a-passo
4. Review e Save
```

---

## 🔌 **Plugin: netbox-golden-config**

### **O que faz:**
Mantém **configurações de referência** (golden configs) para cada dispositivo.

### **Instalação:**
```bash
pip install netbox-golden-config
```

### **Configuração:**
```python
PLUGINS_CONFIG = {
    'netbox_golden_config': {
        'per_row_bulk_size': 1000,
        'jinja_repository': '/opt/netbox/golden-config/templates',
        'backup_repository': '/opt/netbox/golden-config/backup',
        'delete_old_backup_on_creation': True,
        'post_save_script': '/opt/netbox/golden-config/post_save.py',
        'highlight_rules': [
            {
                'start': 'interface ',
                'end': '!',
                'color': 'yellow'
            }
        ]
    }
}
```

### **Fluxo de Trabalho:**
```python
# 1. Backup automático da configuração
# 2. Geração do template Jinja2
# 3. Comparação (compliant vs actual)
# 4. Report de diferenças
```

---

## 🔌 **Desenvolvendo Plugins Customizados**

### **Usando o Template:**

```bash
# Instalar cookiecutter
pip install cookiecutter

# Criar novo plugin
cookiecutter https://github.com/netbox-community/cookiecutter-netbox-plugin

# Responder às perguntas:
#   plugin_name: My Custom Plugin
#   plugin_slug: netbox-my-custom
#   plugin_class: MyCustom
#   author_name: Seu Nome
#   author_email: seu@email.com
#   description: Meu plugin customizado
#   open_source_license: BSD-3-Clause
#   netbox_version: v4.0
```

### **Estrutura Gerada:**
```
netbox-my-custom/
├── netbox_my_custom/
│   ├── __init__.py
│   ├── admin.py
│   ├── api/
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── filtersets.py
│   ├── models.py
│   ├── tables.py
│   ├── template_content.py
│   └── views.py
├── docs/
│   └── ...
├── examples/
├── tasks.py
├── pyproject.toml
├── setup.py
└── README.md
```

### **Exemplo: Plugin para Tickets**

```python
# netbox_tickets/models.py
from django.db import models
from netbox.models import NetBoxModel

class Ticket(NetBoxModel):
    TICKET_STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=100)
    device = models.ForeignKey(
        to='dcim.Device',
        on_delete=models.CASCADE,
        related_name='tickets'
    )
    status = models.CharField(
        max_length=20,
        choices=TICKET_STATUS_CHOICES,
        default='new'
    )
    description = models.TextField()

    class Meta:
        ordering = ('-created',)

# netbox_tickets/views.py
from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, CreateView
from .models import Ticket

class TicketListView(ListView):
    model = Ticket
    template_name = 'netbox_tickets/tickets_list.html'
    context_object_name = 'tickets'

class TicketCreateView(CreateView):
    model = Ticket
    fields = ['title', 'device', 'description']
    template_name = 'netbox_tickets/ticket_create.html'

def ticket_detail(request, pk):
    ticket = get_object_or_404(Ticket, pk=pk)
    return render(request, 'netbox_tickets/ticket_detail.html', {'ticket': ticket})
```

---

## 🔌 **Instalação de Plugins via Docker**

### **docker-compose.yml:**
```yaml
version: '3.4'

services:
  netbox:
    image: netboxcommunity/netbox:v4.0-3.0
    volumes:
      - netbox-media:/opt/netbox/netbox/media  # uploaded images
      - netbox-initializers:/opt/netbox/netbox/initializers  # optional
    environment:
      - NETBOX_PLUGIN_DIRS=/opt/netbox/plugins
    ports:
      - "8000:8080"

  plugins:
    build: ./plugins
    volumes:
      - ./plugins:/opt/netbox/plugins
```

### **Dockerfile para Plugins:**
```dockerfile
FROM netboxcommunity/netbox:v4.0-3.0

# Instalar plugins
COPY requirements-plugins.txt /tmp/
RUN /opt/netbox/venv/bin/pip install --no-cache-dir -r /tmp/requirements-plugins.txt

# Copiar plugins customizados
COPY . /opt/netbox/plugins/

# Configurar permissões
RUN chown -R netbox:netbox /opt/netbox/plugins
```

---

## 🔍 **Gerenciamento de Plugins**

### **Listar Plugins Instalados:**
```bash
# Via Django shell
python netbox/manage.py shell -c "from django.conf import settings; print(settings.PLUGINS)"

# Via API
curl -H "Authorization: Token TOKEN" http://localhost:8080/api/plugins/
```

### **Verificar Configuração:**
```python
# Verificar configuração de um plugin
python netbox/manage.py shell -c "
from django.conf import settings
config = settings.PLUGINS_CONFIG.get('netbox_documents', {})
print(config)
"
```

### **Troubleshooting:**
```bash
# Verificar erros
docker compose logs netbox | grep ERROR

# Verificar migrações pendentes
python netbox/manage.py showmigrations

# Recriar migrações (se necessário)
python netbox/manage.py makemigrations netbox_documents
python netbox/manage.py migrate netbox_documents
```

---

## 📊 **Top Plugins por Categoria**

### **Monitoring & Observability**
- **netbox-traffic** - Monitor de tráfego de rede
- **netbox-snmp** - Coleta SNMP automática
- **netbox-prometheus** - Integração Prometheus

### **Automation & Orchestration**
- **netbox-device-onboarding** - Onboarding automatizado
- **netbox-ansible** - Módulos Ansible
- **netbox-webhook** - Webhooks avançados

### **Integration**
- **netbox-proxbox** - VMware vSphere
- **netbox-homelab** - Proxmox VE
- **netbox-baremetal** - IPMI/BMC

### **Reporting & Analytics**
- **netbox-reporting** - Relatórios personalizados
- **netbox-capacity-metrics** - Métricas de capacidade
- **netbox-device-audit** - Auditoria de dispositivos

---

## 🔗 **Integração com neo_stack**

### **Plugins + neo_stack Framework:**

```python
# backend/app/services/plugin_service.py
from app.core.netbox_client import NetBoxClient
from typing import List, Dict

class PluginService:
    def __init__(self):
        self.nb = NetBoxClient()

    def get_device_documents(self, device_id: int) -> List[Dict]:
        """Retorna documentos anexados ao device"""
        documents = self.nb.extras.documents.filter(device=device_id)

        return [
            {
                'id': doc.id,
                'name': doc.name,
                'type': doc.document_type,
                'url': doc.file.url if doc.file else None,
                'created': doc.created
            }
            for doc in documents
        ]

    def add_device_document(self, device_id: int, file_path: str, doc_type: str):
        """Anexa documento ao device"""
        device = self.nb.dcim.devices.get(id=device_id)

        with open(file_path, 'rb') as f:
            document = self.nb.extras.documents.create(
                device=device.id,
                document_type=doc_type,
                name=os.path.basename(file_path),
                file=f
            )

        return document

    def get_inventory_report(self, site_id: int = None) -> Dict:
        """Gera relatório de inventário"""
        filters = {'site': site_id} if site_id else {}
        assets = self.nb.extras.assets.filter(**filters)

        total_value = 0
        warranty_expiring = []

        for asset in assets:
            if asset.value:
                total_value += asset.value

            if asset.warranty_end:
                days_left = (asset.warranty_end - datetime.now()).days
                if days_left <= 90:
                    warranty_expiring.append({
                        'device': asset.device.name,
                        'warranty_end': asset.warranty_end,
                        'days_left': days_left
                    })

        return {
            'total_assets': len(assets),
            'total_value': total_value,
            'warranty_expiring': warranty_expiring
        }
```

---

## 📚 **Recursos**

### **Documentação Oficial**
👉 **[NetBox Plugin Development](https://docs.netbox.dev/en/stable/plugins/)**

👉 **[Plugin Template](https://github.com/netbox-community/cookiecutter-netbox-plugin)**

### **Exemplos**
👉 **[netbox-plugin-examples](https://github.com/netbox-community/netbox-plugin-examples)**

---

## 🎯 **Próximos Passos**

1. 👉 **[Instale seus Primeiros Plugins](plugins/installation.md)**
2. 👉 **[Configure Documentos](plugins/documents-setup.md)**
3. 👉 **[Implemente Inventário](plugins/inventory-setup.md)**
4. 👉 **[Desenvolva Plugin Customizado](plugins/development.md)**

---

> **"Plugins são o futuro do NetBox. Contribua com a comunidade!"**