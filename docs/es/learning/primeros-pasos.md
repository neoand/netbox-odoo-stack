# Primeros Pasos con NetBox: Tutorial en 30 Minutos

> **Objetivo**: De cero al primer "¡Eureka!" en 30 minutos o menos. Vamos a crear un ambiente funcional y hacer tu primera integración.

---

## 🎯 Lo que vamos a lograr

Al final de esta sección tendrás:

✅ **NetBox funcionando** en tu ambiente local (Docker)
✅ **Primer sitio, rack y dispositivo** creados
✅ **API probada** con un ejemplo práctico
✅ **Primer webhook** disparando
✅ **Visión clara** de cómo aplicar en tu trabajo

---

## 🚀 Paso 1: Preparando el Ambiente (5 min)

### Prerrequisitos
Solo necesitas tener **Docker** instalado (que ya tienes, ¿verdad?).

### Descargando NetBox
```bash
# Clonar el repositorio oficial (ya optimizado para Docker)
git clone https://github.com/netbox-community/netbox-docker.git
cd netbox-docker

# Copiar el archivo de ejemplo
cp docker-compose.override.yml.example docker-compose.override.yml

# Configurar las variables esenciales
cat > .env << 'EOF'
POSTGRES_PASSWORD=netbox_secret_123
REDIS_PASSWORD=redis_secret_456
SUPERUSER_PASSWORD=admin123
ALLOWED_HOSTS=*
EOF
```

### Subiendo los containers
```bash
# Subir los servicios (NetBox + PostgreSQL + Redis)
docker compose up -d

# Verificar que todo esté corriendo
docker compose ps
```

**Resultado esperado:**
```
NAME                    STATUS
netbox-docker-netbox-1  Up (healthy)
netbox-docker-postgres-1  Up (healthy)
netbox-docker-redis-1   Up (healthy)
```

### ✅ Verificación
Accede a http://localhost:8080 e inicia sesión:
- **Usuario**: `admin`
- **Contraseña**: `admin123` (definido en .env)

¡Si abre, ya tienes NetBox funcionando! 🎉

---

## 🏗️ Paso 2: Creando tu Primera Estructura (10 min)

### Concepto fundamental: Jerarquía de NetBox

NetBox sigue una jerarquía natural:

```
📍 Sitio (Site)
  └─ 🏢 Racks
       └─ 🖥️ Dispositivos (Devices)
            └─ 🔌 Interfaces
                 └─ 🌐 IPs
```

¡Vamos a crear cada nivel!

### 2.1. Creando un Sitio

En la interfaz web, ve a **Organization > Sites > Sites** y haz clic en **Add**:

```
Name: Ciudad de México HQ
Slug: cdmx-hq
Description: Sede de la empresa en CDMX
Status: Planned (o Active)
```

### 2.2. Creando un Rack

Ve a **Organization > Racks > Racks** y haz clic en **Add**:

```
Name: Rack-01
Site: Ciudad de México HQ
Location: Sala de Servidores
Status: Reserved
Units: 42
```

### 2.3. Creando tu Primer Dispositivo

Ve a **Devices > Devices > Add**:

```
Device Type: (voy a enseñar a crear en 2 min)
```

¡Espera! Primero necesitamos crear el **Device Type**.

### Creando Device Type (Template de Hardware)

Ve a **Devices > Device Types > Add**:

```
Manufacturer: Dell
Model: PowerEdge R740
Slug: dell-r740
```

Ahora vuelve a crear el Dispositivo:

```
Name: switch-core-01
Device Type: Dell PowerEdge R740
Role: Core Switch
Status: Active
Site: Ciudad de México HQ
Rack: Rack-01
Position: 20
```

**¡Momento "Eureka!" 🎉**: ¡Ahora tienes un switch en Rack 20, en Sitio Ciudad de México, con todo rastreado!

---

## 🔌 Paso 3: Explorando la API (10 min)

### 3.1. Primer Request

NetBox tiene una **API REST** súper poderosa. Vamos a probar:

```bash
# Instalar el client Python (opcional, pero facilita)
pip install pynetbox

# Crear un script para probar
cat > test_api.py << 'EOF'
import pynetbox

# Conectar a NetBox
nb = pynetbox.api(
    'http://localhost:8080',
    token='your-token-here'  # ¡vamos a conseguir eso!
)

# Listar todos los sitios
sites = nb.dcim.sites.all()
print("Sitios registrados:")
for site in sites:
    print(f"  - {site.name} (status: {site.status})")
EOF

python test_api.py
```

**¿Necesitas token?** Ve a **Admin > Tokens > Add** en la interfaz web.

### 3.2. Ejemplo Prático: Consultando Dependencias

```python
cat > buscar_dependencias.py << 'EOF'
import pynetbox

nb = pynetbox.api('http://localhost:8080', token='TU_TOKEN')

# Buscar un switch
switch = nb.dcim.devices.get(name='switch-core-01')

print(f"Switch: {switch.name}")
print(f"Sitio: {switch.site.name}")
print(f"Rack: {switch.rack.name}")
print(f"Posición: U{switch.position}")
print(f"Serial: {switch.serial}")

# Listar interfaces
print("\nInterfaces:")
for iface in switch.interfaces.all():
    print(f"  - {iface.name}: {iface.connected_endpoint}")

# Listar IPs asignados
print("\nIPs:")
for ip in nb.ipam.ip_addresses.filter(interface_id=switch.interfaces.all()[0].id):
    print(f"  - {ip.address}")
EOF

python buscar_dependencias.py
```

**Resultado visual:**
```
Switch: switch-core-01
Sitio: Ciudad de México HQ
Rack: Rack-01
Posición: U20
Serial: ABC123XYZ

Interfaces:
  - eth0: Servidor DB (eth0)

IPs:
  - 192.168.1.10/24
```

🎯 **Aquí es donde ves el poder**: ¡un comando muestra toda la estructura de la red!

---

## 🔔 Paso 4: Creando tu Primer Webhook (5 min)

### ¿Qué es un webhook?

Webhook es un **HTTP POST** que NetBox dispara cuando algo pasa. ¡Perfecto para integraciones!

### 4.1. Configurando un Webhook Simple

Ve a **Admin > Webhooks > Add**:

```
Name: Notificar Nuevo Dispositivo
HTTP Method: POST
URL: http://webhook.site/unique-id  (o ngrok para local)
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

### 4.2. Probando el Webhook

Ahora, **crea un nuevo dispositivo** en la interfaz web. ¡Observa el webhook disparándose!

**Ejemplo de payload recibido:**
```json
{
  "event": "create",
  "timestamp": "2024-12-04T10:30:00Z",
  "data": {
    "name": "switch-core-02",
    "site": "Ciudad de México HQ",
    "rack": "Rack-01",
    "serial": "XYZ789ABC"
  }
}
```

🎯 **Momento Eureka 2** 💡: ¡Cualquier cambio en NetBox puede disparar acciones automáticas!

---

## 💡 Paso 5: Primer Caso de Uso Real (5 min)

### Escenario: Notificación Slack cuando nuevo servidor es creado

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
            "text": f"🖥️ ¡Nuevo servidor creado!",
            "attachments": [
                {
                    "color": "good",
                    "fields": [
                        {"title": "Nombre", "value": data['data']['name'], "short": True},
                        {"title": "Sitio", "value": data['data']['site'], "short": True},
                        {"title": "Rack", "value": data['data']['rack'], "short": True}
                    ]
                }
            ]
        }

        # Enviar a Slack
        requests.post('https://hooks.slack.com/services/TU/WEBHOOK/URL', json=message)

    return "OK", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

```bash
# Ejecutar el receiver
python webhook_receiver.py

# Configurar el webhook en NetBox para http://localhost:5000/webhook/netbox
# ¡Ahora crea un nuevo dispositivo y ve la notificación llegando a Slack!
```

---

## 🎯 Conclusión: Lo que lograste

### Resultados visibles
✅ **NetBox funcionando** en tu máquina
✅ **Estructura básica** (Sitio → Rack → Dispositivo)
✅ **API probada** con consultas reales
✅ **Webhook funcionando** con notificación real

### Habilidades conquistadas
- ✅ Sabes **navegar** en la interfaz de NetBox
- ✅ Entiendes la **jerarquía** de datos
- ✅ Puedes **consultar** via API
- ✅ Puedes **integrar** con otros sistemas via webhooks

---

## 🚀 Próximos Pasos

Ahora que tuviste tu primer contacto, vamos a los **casos de uso reales**:

👉 **[Historias Reales](../historias/dolores-reales.md)** - Ve cómo NetBox resuelve problemas reales que ya enfrentaste

👉 **[Casos de Uso con Código](../casos-uso/)** - Ejemplos prácticos para escenarios específicos

👉 **[PWAs para Campo](../historias/pwas-campo.md)** - Cómo crear apps que tus técnicos van a usar

---

## 📚 Recursos Adicionales

- **Documentación oficial**: https://docs.netbox.dev/
- **Referencia de API**: http://localhost:8080/api/docs/ (cuando NetBox esté corriendo)
- **PyNetBox (client Python)**: https://pynetbox.readthedocs.io/

---

> **"El primer paso siempre es el más difícil. Ahora tienes NetBox corriendo y el resto es solo creatividad!"**