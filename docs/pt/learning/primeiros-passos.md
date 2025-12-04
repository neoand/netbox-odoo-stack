# Primeiros Passos com NetBox: Tutorial em 30 Minutos

> **Objetivo**: Do zero ao primeiro "Eureka!" em 30 minutos ou menos. Vamos criar um ambiente funcional e fazer sua primeira integração.

---

## 🎯 O que vamos conseguir

Ao final desta seção, você vai ter:

✅ **NetBox funcionando** no seu ambiente local (Docker)
✅ **Primeiro site, rack e dispositivo** criados
✅ **API testada** com um exemplo prático
✅ **Primeiro webhook** disparando
✅ **Visão clara** de como aplicar no seu trabalho

---

## 🚀 Passo 1: Preparando o Ambiente (5 min)

### Pré-requisitos
Você só precisa ter **Docker** instalado (que você já tem, certo?).

### Baixando o NetBox
```bash
# Clone o repositório oficial (já otimizado para Docker)
git clone https://github.com/netbox-community/netbox-docker.git
cd netbox-docker

# Copie o arquivo de exemplo
cp docker-compose.override.yml.example docker-compose.override.yml

# Configure as variáveis essenciais
cat > .env << 'EOF'
POSTGRES_PASSWORD=netbox_secret_123
REDIS_PASSWORD=redis_secret_456
SUPERUSER_PASSWORD=admin123
ALLOWED_HOSTS=*
EOF
```

### Subindo os containers
```bash
# Suba os serviços (NetBox + PostgreSQL + Redis)
docker compose up -d

# Verifique se está tudo rodando
docker compose ps
```

**Resultado esperado:**
```
NAME                    STATUS
netbox-docker-netbox-1  Up (healthy)
netbox-docker-postgres-1  Up (healthy)
netbox-docker-redis-1   Up (healthy)
```

### ✅ Verificação
Acesse http://localhost:8080 e faça login:
- **User**: `admin`
- **Password**: `admin123` (definido no .env)

Se abrir, você já tem o NetBox funcionando! 🎉

---

## 🏗️ Passo 2: Criando Sua Primeira Estrutura (10 min)

### Conceito fundamental: Hierarquia do NetBox

O NetBox segue uma hierarquia natural:

```
📍 Site
  └─ 🏢 Racks
       └─ 🖥️ Devices (servidores, switches, etc.)
            └─ 🔌 Interfaces
                 └─ 🌐 IPs
```

Vamos criar cada nível!

### 2.1. Criando um Site

Na interface web, vá em **Organization > Sites > Sites** e clique em **Add**:

```
Name: São Paulo HQ
Slug: sp-hq
Description: Sede da empresa em São Paulo
Status: Planned (ou Active)
```

### 2.2. Criando um Rack

Vá em **Organization > Racks > Racks** e clique em **Add**:

```
Name: Rack-01
Site: São Paulo HQ
Location: Sala do Servidor
Status: Reserved
Units: 42
```

### 2.3. Criando seu Primeiro Device

Vá em **Devices > Devices > Add**:

```
Device Type: (vou ensinar a criar em 2 min)
```

Ops! Primeiro precisamos criar o **Device Type**.

### Criando Device Type (Template de Hardware)

Vá em **Devices > Device Types > Add**:

```
Manufacturer: Dell
Model: PowerEdge R740
Slug: dell-r740
```

Agora volte a criar o Device:

```
Name: switch-core-01
Device Type: Dell PowerEdge R740
Role: Core Switch
Status: Active
Site: São Paulo HQ
Rack: Rack-01
Position: 20
```

**Momento "Eureka!" 🎉**: Agora você tem um switch no Rack 20, no Site São Paulo, com tudo rastreado!

---

## 🔌 Passo 3: Explorando a API (10 min)

### 3.1. Primeiro Request

NetBox tem uma **API REST** super poderosa. Vamos testar:

```bash
# Instale o client Python (opcional, mas facilita)
pip install pynetbox

# Crie um script para testar
cat > teste_api.py << 'EOF'
import pynetbox

# Conecte ao NetBox
nb = pynetbox.api(
    'http://localhost:8080',
    token='your-token-here'  # vamos pegar isso!
)

# Liste todos os sites
sites = nb.dcim.sites.all()
print("Sites cadastrados:")
for site in sites:
    print(f"  - {site.name} (status: {site.status})")
EOF

python teste_api.py
```

**Precisa de token?** Vá em **Admin > Tokens > Add** na interface web.

### 3.2. Exemplo Prático: Consultando Dependências

```python
cat > busca_dependencias.py << 'EOF'
import pynetbox

nb = pynetbox.api('http://localhost:8080', token='SEU_TOKEN')

# Buscar um switch
switch = nb.dcim.devices.get(name='switch-core-01')

print(f"Switch: {switch.name}")
print(f"Site: {switch.site.name}")
print(f"Rack: {switch.rack.name}")
print(f"Posição: U{switch.position}")
print(f"Serial: {switch.serial}")

# Listar interfaces
print("\nInterfaces:")
for iface in switch.interfaces.all():
    print(f"  - {iface.name}: {iface.connected_endpoint}")

# Listar IPs atribuídos
print("\nIPs:")
for ip in nb.ipam.ip_addresses.filter(interface_id=switch.interfaces.all()[0].id):
    print(f"  - {ip.address}")
EOF

python busca_dependencias.py
```

**Resultado visual:**
```
Switch: switch-core-01
Site: São Paulo HQ
Rack: Rack-01
Posição: U20
Serial: ABC123XYZ

Interfaces:
  - eth0: Servidor DB (eth0)

IPs:
  - 192.168.1.10/24
```

🎯 **Aqui é onde você vê o poder**: um comando mostra toda a estrutura da rede!

---

## 🔔 Passo 4: Criando seu Primeiro Webhook (5 min)

### O que é um webhook?

Webhook é um **HTTP POST** que o NetBox dispara quando algo acontece. Perfeito para integrações!

### 4.1. Configurando um Webhook Simples

Vá em **Admin > Webhooks > Add**:

```
Name: Notify New Device
HTTP Method: POST
URL: http://webhook.site/unique-id  (ou ngrok para local)
```

Body Template:
```json
{
  "event": "{{ event }}",
  "timestamp": "{{ timestamp }}",
  "data": {
    "name": "{{ data.name }}",
    "site": "{{ data.site.name }}",
    "rack": "{{ data.rack.name }}",
    "serial": "{{ data.serial }}"
  }
}
```

### 4.2. Testando o Webhook

Agora, **crie um novo device** na interface web. Observe o webhook sendo disparado!

**Exemplo de payload recebido:**
```json
{
  "event": "create",
  "timestamp": "2024-12-04T10:30:00Z",
  "data": {
    "name": "switch-core-02",
    "site": "São Paulo HQ",
    "rack": "Rack-01",
    "serial": "XYZ789ABC"
  }
}
```

🎯 **Momento Eureka 2** 💡: Qualquer mudança no NetBox pode disparar ações automáticas!

---

## 💡 Passo 5: Primeiro Caso de Uso Real (5 min)

### Cenário: Notificação Slack quando novo servidor é criado

```python
# webhook_receiver.py
import json
import requests
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhook/netbox', methods=['POST'])
def netbox_webhook():
    data = request.json

    if data['event'] == 'create':
        message = {
            "text": f"🖥️ Novo servidor criado!",
            "attachments": [
                {
                    "color": "good",
                    "fields": [
                        {"title": "Nome", "value": data['data']['name'], "short": True},
                        {"title": "Site", "value": data['data']['site'], "short": True},
                        {"title": "Rack", "value": data['data']['rack'], "short": True}
                    ]
                }
            ]
        }

        # Envia para Slack
        requests.post('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', json=message)

    return "OK", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

```bash
# Execute o receiver
python webhook_receiver.py

# Configure o webhook no NetBox para http://localhost:5000/webhook/netbox
# Agora crie um novo device e veja a notificação chegando no Slack!
```

---

## 🎯 Conclusão: O que você conseguiu

### Resultados visíveis
✅ **NetBox funcionando** na sua máquina
✅ **Estrutura básica** (Site → Rack → Device)
✅ **API testada** com consultas reais
✅ **Webhook funcionando** com notificação real

### Habilidades conquistadas
- ✅ Sabe **navegar** na interface do NetBox
- ✅ Entende a **hierarquia** de dados
- ✅ Consegue **consultar** via API
- ✅ Pode **integrar** com outros sistemas via webhooks

---

## 🚀 Próximos Passos

Agora que você teve seu primeiro contato, vamos aos **casos de uso reais**:

👉 **[Histórias Reais](../historias/dores-reais.md)** - Veja como o NetBox resolve problemas reais que você já enfrentou

👉 **[Casos de Uso com Código](../casos-uso/)** - Exemplos práticos para cenários específicos

👉 **[PWAs para Time de Campo](../historias/pwas-campo.md)** - Como criar apps que seus técnicos vão usar

---

## 📚 Recursos Adicionais

- **Documentação oficial**: https://docs.netbox.dev/
- **API Reference**: http://localhost:8080/api/docs/ (quando NetBox estiver rodando)
- **PyNetBox (client Python)**: https://pynetbox.readthedocs.io/

---

> **"O primeiro passo é sempre o mais difícil. Agora você tem NetBox rodando e o resto é só criatividade!"**