# Caso de Uso 1: Gestión Inteligente de IPs

> **Problema**: Conflictos de IP, sub-redes mal planificadas, IPAM disperso en hojas de cálculo.

---

## 🎯 Objetivo

Automatizar la gestión de IPs con:
- ✅ **Prevención** de conflictos
- ✅ **Planificación** automática de sub-redes
- ✅ **Auditoría** completa de uso
- ✅ **Integración** con DHCP y DNS

---

## 📊 Situación Antes vs Después

| Antes | Con NetBox |
|-------|------------|
| Hojas de cálculo dispersas con IPs | **CMDB única fuente** de verdad |
| Conflictos detectados después del impacto | **Conflictos evitados** antes de ocurrir |
| Sub-redes sin patrón | **Patrones automáticos** con validación |
| Cero auditoría | **Histórico completo** de cambios |

---

## 💡 Solución 1: Validación de Conflictos (Webhook)

### Código del Webhook Receiver

```python
import json
import ipaddress
import smtplib
from email.mime.text import MimeText
import pynetbox

# Configurar NetBox
nb = pynetbox.api(
    'http://netbox.company.com',
    token='TU_TOKEN_NETBOX'
)

def verificar_conflicto_ip(nuevo_ip):
    """
    Verifica si un IP ya existe en la red antes de crear
    """
    try:
        # Buscar IP exacto
        ip_exacto = nb.ipam.ip_addresses.get(address=nuevo_ip)

        if ip_exacto:
            return {
                'conflicto': True,
                'existe_en': ip_exacto.assigned_object,
                'action': 'RECHAZAR'
            }

        # Verificar si está en sub-red ya asignada
        nuevo_direccion = ipaddress.ip_network(nuevo_ip, strict=False)

        for ip_registrado in nb.ipam.ip_addresses.all():
            ip_reg = ipaddress.ip_address(ip_registrado.address.split('/')[0])

            if ip_reg in nuevo_direccion:
                # Verificar si es de la misma red
                subnet_registrada = ipaddress.ip_network(ip_registrado.address, strict=False)
                if subnet_registrada == nuevo_direccion:
                    return {
                        'conflicto': True,
                        'existe_en': ip_registrado.assigned_object,
                        'action': 'RECHAZAR'
                    }

        return {'conflicto': False, 'action': 'APROBAR'}

    except Exception as e:
        return {
            'conflicto': True,
            'error': str(e),
            'action': 'RECHAZAR'
        }

def notificar_conflicto(ip, info_conflicto):
    """
    Envía notificación por email/Slack sobre conflicto
    """
    mensaje = f"""
    ⚠️ CONFLICTO DE IP DETECTADO

    IP intentado: {ip}
    Conflicto con: {info_conflicto.get('existe_en', 'N/A')}
    Acción: {info_conflicto['action']}

    Detalles completos en: http://netbox.company.com/ip-addresses/
    """

    # Enviar a Slack
    import requests
    requests.post('https://hooks.slack.com/services/YOUR/WEBHOOK', json={
        'text': mensaje
    })

    # Enviar email
    msg = MimeText(mensaje)
    msg['Subject'] = '🚨 Conflicto de IP - NetBox'
    msg['From'] = 'netbox@company.com'
    msg['To'] = 'infra@company.com'

    with smtplib.SMTP('mail.company.com', 587) as server:
        server.send_message(msg)

# Webhook de NetBox
@app.route('/webhook/ip-address', methods=['POST'])
def webhook_netbox():
    data = request.json

    if data['event'] in ['create', 'update']:
        ip_address = data['data']['address']

        # Verificar conflicto
        resultado = verificar_conflicto_ip(ip_address)

        if resultado['conflicto']:
            # Rechazar en NetBox (vía API)
            nb.ipam.ip_addresses.delete(data['data']['id'])

            # Notificar
            notificar_conflicto(ip_address, resultado)

            return jsonify({
                'status': 'RECHAZADO',
                'motivo': 'Conflicto detectado'
            }), 409

    return jsonify({'status': 'APROBADO'}), 200
```

---

## 💡 Solución 2: Planificación Automática de Sub-redes

### Ejemplo: Generar sub-redes automáticamente

```python
def planear_subredes(vlans, prefijo_base='/16'):
    """
    Genera sub-redes automáticamente basado en las necesidades
    """
    base_network = ipaddress.ip_network(prefijo_base)
    subredes = []

    for vlan in vlans:
        # Calcular tamaño necesario
        hosts_necesarios = vlan['hosts_estimados']
        prefijo = 32 - (hosts_necesarios - 1).bit_length()

        # Garantizar que no sea menor que /30 (mínimo para 2 hosts)
        prefijo = max(prefijo, 30)

        # Encontrar próximo bloque disponible
        bloque = encontrar_proximo_bloque_disponible(base_network, prefijo)

        # Crear prefijo en NetBox
        prefijo_obj = nb.ipam.prefixes.create({
            'prefix': str(bloque),
            'vlan': vlan['id'],
            'status': 'Active',
            'description': f"Auto-generado para {vlan['nombre']}"
        })

        subredes.append({
            'vlan': vlan['nombre'],
            'prefijo': str(bloque),
            'hosts': bloque.num_addresses - 2,
            'netbox_id': prefijo_obj.id
        })

    return subredes

def encontrar_proximo_bloque_disponible(base_network, prefijo):
    """
    Encuentra el próximo bloque disponible en la red base
    """
    bloques_usados = set()

    # Listar todos los prefijos existentes
    for prefijo_existente in nb.ipam.prefixes.filter(prefix=base_network):
        bloque_usado = ipaddress.ip_network(prefijo_existente.prefix)
        bloques_usados.add(bloque_usado)

    # Calcular todos los sub-bloques posibles
    num_subredes = base_network.num_addresses // (2 ** (32 - prefijo))

    for i in range(num_subredes):
        inicio = i * (2 ** (32 - prefijo))
        bloque_test = list(base_network.subnets(new_prefix=prefijo))[i]

        if bloque_test not in bloques_usados:
            return bloque_test

    raise Exception("No hay bloques disponibles")

# Uso
vlans_necesarias = [
    {'nombre': 'VLAN_USUARIOS', 'hosts_estimados': 100, 'id': 100},
    {'nombre': 'VLAN_SERVIDORES', 'hosts_estimados': 50, 'id': 200},
    {'nombre': 'VLAN_IOT', 'hosts_estimados': 500, 'id': 300},
]

subredes_creadas = planear_subredes(vlans_necesarias)

for sub in subredes_creadas:
    print(f"VLAN {sub['vlan']}: {sub['prefijo']} ({sub['hosts']} hosts)")
```

---

## 💡 Solución 3: Dashboard de Monitoreo en Tiempo Real

### Frontend (HTML + JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard IPAM - NetBox</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .metricas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .metrica-card { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .metrica-valor { font-size: 2em; font-weight: bold; color: #2563eb; }
    .metrica-label { color: #666; margin-top: 5px; }
    .grafico { margin-top: 30px; }
    .tabela { margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background-color: #f3f4f6; }
  </style>
</head>
<body>
  <h1>📊 Dashboard IPAM</h1>

  <!-- Métricas principales -->
  <div class="metricas">
    <div class="metrica-card">
      <div class="metrica-valor" id="total-ips">-</div>
      <div class="metrica-label">Total de IPs</div>
    </div>
    <div class="metrica-card">
      <div class="metrica-valor" id="ips-em-uso">-</div>
      <div class="metrica-label">IPs en Uso</div>
    </div>
    <div class="metrica-card">
      <div class="metrica-valor" id="ips-livres">-</div>
      <div class="metrica-label">IPs Libres</div>
    </div>
  </div>

  <!-- Gráfico de utilización -->
  <div class="grafico">
    <h2>📈 Utilización por VLAN</h2>
    <canvas id="grafico-vlans"></canvas>
  </div>

  <!-- Tabla de IPs recientes -->
  <div class="tabela">
    <h2>🕒 IPs Recientes</h2>
    <table id="tabela-ips-recentes">
      <thead>
        <tr>
          <th>Dirección IP</th>
          <th>Dispositivo</th>
          <th>Interfaz</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <script>
    async function cargarDashboardIP() {
      const response = await fetch('/api/ipam/dashboard');
      const dados = await response.json();

      // Métricas
      document.getElementById('total-ips').textContent = dados.total;
      document.getElementById('ips-em-uso').textContent = dados.em_uso;
      document.getElementById('ips-livres').textContent = dados.livres;

      // Gráfico
      const ctx = document.getElementById('grafico-vlans').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dados.vlans.map(v => v.nome),
          datasets: [{
            label: 'IPs Usados',
            data: dados.vlans.map(v => v.usados),
            backgroundColor: 'rgba(54, 162, 235, 0.5)'
          }, {
            label: 'IPs Libres',
            data: dados.vlans.map(v => v.livres),
            backgroundColor: 'rgba(153, 102, 255, 0.5)'
          }]
        }
      });

      // Tabla de IPs recientes
      const tbody = document.querySelector('#tabela-ips-recentes tbody');
      tbody.innerHTML = dados.recientes.map(ip => `
        <tr>
          <td>${ip.address}</td>
          <td>${ip.device || '-'}</td>
          <td>${ip.interface || '-'}</td>
          <td>${new Date(ip.created).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }

    // Actualizar cada 30 segundos
    setInterval(cargarDashboardIP, 30000);
    cargarDashboardIP();
  </script>
</body>
</html>
```

### Backend del Dashboard (Python)

```python
@app.route('/api/ipam/dashboard')
def dashboard_ipam():
    # Total de IPs
    total_ips = nb.ipam.ip_addresses.count()

    # IPs en uso (que tienen assignment)
    ips_en_uso = len([ip for ip in nb.ipam.ip_addresses.all()
                     if ip.assigned_object])

    # IPs libres
    ips_libres = total_ips - ips_en_uso

    # Uso por VLAN
    vlans = {}
    for ip in nb.ipam.ip_addresses.all():
        vlan_nombre = ip.vlan.name if ip.vlan else 'Sin VLAN'
        if vlan_nombre not in vlans:
            vlans[vlan_nombre] = {'usados': 0, 'libres': 0}

        if ip.assigned_object:
            vlans[vlan_nombre]['usados'] += 1
        else:
            vlans[vlan_nombre]['libres'] += 1

    # IPs recientes (últimos 30)
    ips_recientes = sorted(
        nb.ipam.ip_addresses.all(),
        key=lambda x: x.created,
        reverse=True
    )[:30]

    return jsonify({
        'total': total_ips,
        'en_uso': ips_en_uso,
        'libres': ips_libres,
        'vlans': [{'nombre': k, **v} for k, v in vlans.items()],
        'recientes': [
            {
                'id': ip.id,
                'address': ip.address,
                'device': ip.assigned_object.device.name if ip.assigned_object and hasattr(ip.assigned_object, 'device') else None,
                'interface': ip.assigned_object.name if ip.assigned_object else None,
                'created': ip.created
            }
            for ip in ips_recientes
        ]
    })
```

---

## 🎯 Resultados Obtenidos

### Métricas Reales (Ejemplo de Implementación)

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Conflictos de IP/mes** | 15 | 0 | -100% |
| **Tiempo para encontrar IP libre** | 2 horas | 30 seg | -97% |
| **IPs huérfanos** | 200 | 15 | -92% |
| **Planificación de red** | 1 semana | 2 horas | -94% |

### Ahorro Financiero

```
Cálculo para empresa de 1000 IPs:

Antes:
- 15 conflictos/mes × 3 horas para resolver × $100 MXN/hora
= $4,500 MXN/mes en retrabajo

Después:
- 0 conflictos
- Tiempo ahorrado: 45 horas/mes
- Ahorro: $4,500 MXN/mes = $54,000 MXN/año

Inversión en desarrollo: $20,000 MXN
ROI: 270% en el primer año
```

---

## 📝 Cómo Implementar en tu Empresa

### Paso a Paso

1. **Instalar NetBox**
   - Docker Compose (ver setup.md)
   - Configurar PostgreSQL + Redis

2. **Importar datos existentes**
   ```python
   # Script de migración (hoja de cálculo → NetBox)
   import pandas as pd

   hoja = pd.read_excel('ips_actuales.xlsx')

   for _, row in hoja.iterrows():
       nb.ipam.ip_addresses.create({
           'address': row['ip'],
           'status': 'active' if row['en_uso'] else 'available',
           'description': row['observaciones'],
           'tags': row['vlan'] if 'vlan' in row else None
       })
   ```

3. **Configurar webhooks** (conflictos)

4. **Implementar validaciones** (lint de datos)

5. **Entrenar equipo** (30 min de entrenamiento)

---

## 🔗 Próximos Pasos

👉 **[Caso de Uso 2: Integración con Odoo](./integracion-odoo.md)** - Sincronizar inventario técnico + financiero

👉 **[Caso de Uso 3: Automatización con neo_stack](./integracion-neo-stack.md)** - Pipelines de IaC

---

## 📚 Recursos

- **[NetBox IPAM Documentation](https://docs.netbox.dev/en/stable/models/ipam/)** - Documentación oficial
- **[Python ipaddress Module](https://docs.python.org/3/library/ipaddress.html)** - Manipulación de IPs
- **[Webhook Configuration](https://docs.netbox.dev/en/stable/integrations/webhooks/)** - NetBox Webhooks

---

> **"Con NetBox, el IPAM deixa de ser um problema e vira uma vantagem competitiva."**