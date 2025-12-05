# 🌐 Laboratório IoT/OT - Internet of Things & Operational Technology

> **"Proteja sua infraestrutura crítica: ICS, SCADA, PLCs, RTUs e dispositivos IoT"**

---

## 🎯 **Objetivo**

Laboratório hands-on para segurança em ambientes IoT/OT:
- ✅ **ICS/SCADA Security**
- ✅ **PLC Programming & Simulation**
- ✅ **IoT Device Management**
- ✅ **Network Segmentation (Air-Gapped)**
- ✅ **Protocol Analysis (Modbus, DNP3, IEC 61850)**
- ✅ **Threat Detection & Response**

---

## 📋 **Componentes**

| Serviço | Porta | Função |
|---------|-------|--------|
| **NetBox IoT** | 8020 | CMDB para dispositivos IoT/OT |
| **Mosquitto MQTT** | 1883 | IoT messaging broker |
| **Node-RED** | 1880 | IoT flow-based programming |
| **Grafana IoT** | 3002 | IoT dashboards |
| **InfluxDB** | 8086 | Time-series database |
| **Wireshark** | N/A | Protocol analyzer |
| **PLC Simulator** | 2000 | Siemens S7-1200 simulation |
| **IoT Penetration** | 8085 | Security testing tools |
| **Elastic** | 9201 | Log analysis |

---

## 🚀 **Quick Start**

```bash
# Lab IoT/OT
cd labs/iot-ot
docker-compose up -d

# Acessar:
# - NetBox IoT: http://localhost:8020
# - Node-RED: http://localhost:1880
# - Grafana IoT: http://localhost:3002
# - MQTT Broker: localhost:1883
```

---

## 🎓 **Exercícios**

### **Exercício 1: IoT Device Management (45 min)**
```bash
# 1. Registrar 50+ dispositivos IoT simulados
# 2. Configurar MQTT topics
# 3. Criar dashboards em tempo real
# 4. Testar comandos remotos
# 5. Monitorar telemetria
```

**Dispositivos simulados:**
- 20 sensores de temperatura
- 15 câmeras de segurança
- 10 controladores de iluminação
- 5 medidores de energia elétrica

### **Exercício 2: ICS/SCADA Security (60 min)**
```bash
# 1. Configurar PLC simulator (S7-1200)
# 2. Conectar HMI (WinCC)
# 3. Mapear rede industrial
# 4. Simular ataque (Stuxnet-like)
# 5. Detectar anomalias
```

### **Exercício 3: Protocol Analysis (30 min)**
```python
# Analisar protocolos IoT/OT:
# - Modbus TCP (porta 502)
# - DNP3 (porta 20000)
# - IEC 61850 (porta 102)
# - MQTT (porta 1883)
# - CoAP (porta 5683)
```

### **Exercício 4: IoT Pentesting (45 min)**
```bash
# 1. Descoberta de dispositivos
# 2. Scanning de vulnerabilidades
# 3. Exploit testing (CVE-2024-XXXX)
# 4. Bypass authentication
# 5. Data exfiltration attempt
```

---

## 📊 **Métricas IoT/OT**

### **Dashboard Principal:**
- **Dispositivos Online:** 47/50 (94%)
- **Comunicações MQTT:** 1,247 msgs/min
- **Alertas SCADA:** 3 críticos
- **Protocol Violations:** 12
- **Compliance Score:** 82.1%
- **MTTR Incidentes:** 25 minutos

### **Dispositivos por Tipo:**
- 📡 **Sensores:** 20 (temperatura, umidade, pressão)
- 🎥 **Câmeras:** 15 (CCTV, IP cameras)
- 💡 **Atuadores:** 10 (iluminação, relés)
- ⚡ **Medidores:** 5 (energia, água, gás)

---

## 🎯 **Casos de Uso**

### **1. Smart Building**
- Controle de iluminação inteligente
- Climatização automatizada
- Monitoramento de energia
- Controle de acesso biométrico

### **2. Industrial IoT**
- Monitoramento de máquinas
- Manutenção preditiva
- Controle de qualidade
- Rastreamento de ativos

### **3. Energia & Utilities**
- Smart grids
- Controle de subestações
- Medição inteligente
- Monitoramento de rede

### **4. Transporte & Logística**
- Rastreamento de frotas
- Monitoramento de carga
- Controle de semaforização
- RFID/GPS tracking

---

## 🛠️ **Ferramentas IoT/OT**

### **IoT Platforms:**
- AWS IoT Core
- Azure IoT Hub
- Google Cloud IoT
- Node-RED
- ThingsBoard

### **Protocols:**
- MQTT (Message Queue Telemetry Transport)
- CoAP (Constrained Application Protocol)
- LwM2M (Lightweight M2M)
- AMQP (Advanced Message Queuing Protocol)

### **ICS/SCADA:**
- Siemens SIMATIC
- Schneider Electric
- ABB Control Builder
- Rockwell Automation
- Mitsubishi GX Works

### **Security:**
- IoT Inspector
- Armis
- Claroty
- Nozomi Networks
- Dragos

---

## 📚 **Recursos**

- 📖 [NIST Cybersecurity Framework for IoT](https://www.nist.gov/cybersecurity)
- 🎥 [SANS ICS/SCADA Security Courses](https://www.sans.org/ics)
- 📝 [IoT Security Best Practices](https://www.owasp.org/IoT_Security/)

---

**🌐 IoT Security: Protegendo o futuro conectado. Lab v1.0**
