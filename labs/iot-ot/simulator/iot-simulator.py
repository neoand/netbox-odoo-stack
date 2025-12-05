#!/usr/bin/env python3
"""
🌐 IoT Device Simulator
Simulates 50+ IoT devices sending telemetry data via MQTT
"""

import json
import random
import time
from datetime import datetime
from dataclasses import dataclass
from typing import Dict, List
import asyncio
import paho.mqtt.client as mqtt

# Simulated IoT Devices
IOT_DEVICES = [
    # Temperature sensors
    {"id": "sensor-temp-001", "type": "temperature", "location": "Sala Servidores"},
    {"id": "sensor-temp-002", "type": "temperature", "location": "Escritório TI"},
    {"id": "sensor-temp-003", "type": "temperature", "location": "Data Center"},
    {"id": "sensor-temp-004", "type": "temperature", "location": "Recepção"},
    {"id": "sensor-temp-005", "type": "temperature", "location": "Laboratório"},

    # Cameras
    {"id": "cam-001", "type": "camera", "location": "Entrada Principal"},
    {"id": "cam-002", "type": "camera", "location": "Estacionamento"},
    {"id": "cam-003", "type": "camera", "location": "Corredor A"},
    {"id": "cam-004", "type": "camera", "location": "Data Center"},
    {"id": "cam-005", "type": "camera", "location": "Estoque"},

    # Smart lights
    {"id": "light-001", "type": "light", "location": "Sala Reuniões 1"},
    {"id": "light-002", "type": "light", "location": "Sala Reuniões 2"},
    {"id": "light-003", "type": "light", "location": "Open Space"},
    {"id": "light-004", "type": "light", "location": "Corredor Principal"},
    {"id": "light-005", "type": "light", "location": "Auditório"},

    # Energy meters
    {"id": "meter-001", "type": "energy", "location": "Prédio Principal"},
    {"id": "meter-002", "type": "energy", "location": "Prédio Anexo"},
    {"id": "meter-003", "type": "energy", "location": "Data Center"},
    {"id": "meter-004", "type": "energy", "location": "Fábrica"},
    {"id": "meter-005", "type": "energy", "location": "Estacionamento"},

    # Humidity sensors
    {"id": "humid-001", "type": "humidity", "location": "Sala Servidores"},
    {"id": "humid-002", "type": "humidity", "location": "Laboratório"},
    {"id": "humid-003", "type": "humidity", "location": "Biblioteca"},
    {"id": "humid-004", "type": "humidity", "location": "Cozinha"},
    {"id": "humid-005", "type": "humidity", "location": "Banheiro"},

    # Pressure sensors
    {"id": "press-001", "type": "pressure", "location": "Sistema HVAC 1"},
    {"id": "press-002", "type": "pressure", "location": "Sistema HVAC 2"},
    {"id": "press-003", "type": "pressure", "location": "Prédio Anexo"},

    # Motion sensors
    {"id": "motion-001", "type": "motion", "location": "Corredor A"},
    {"id": "motion-002", "type": "motion", "location": "Corredor B"},
    {"id": "motion-003", "type": "motion", "location": "Escritório TI"},
    {"id": "motion-004", "type": "motion", "location": "Sala Reuniões"},

    # Water meters
    {"id": "water-001", "type": "water", "location": "Prédio Principal"},
    {"id": "water-002", "type": "water", "location": "Prédio Anexo"},
    {"id": "water-003", "type": "water", "location": "Jardim"},

    # Gas sensors
    {"id": "gas-001", "type": "gas", "location": "Estoque Químico"},
    {"id": "gas-002", "type": "gas", "location": "Laboratório"},
    {"id": "gas-003", "type": "gas", "location": "Garagem"},

    # RFID readers
    {"id": "rfid-001", "type": "rfid", "location": "Entrada Principal"},
    {"id": "rfid-002", "type": "rfid", "location": "Data Center"},
    {"id": "rfid-003", "type": "rfid", "location": "Estoque"},

    # Smart locks
    {"id": "lock-001", "type": "lock", "location": "Sala Cofre"},
    {"id": "lock-002", "type": "lock", "location": "Data Center"},
    {"id": "lock-003", "type": "lock", "location": "Laboratório"},

    # Air quality
    {"id": "air-001", "type": "air_quality", "location": "Open Space"},
    {"id": "air-002", "type": "air_quality", "location": "Biblioteca"},
    {"id": "air-003", "type": "air_quality", "location": "Sala Reuniões"},

    # Smart switches
    {"id": "switch-001", "type": "switch", "location": "Prédio Principal"},
    {"id": "switch-002", "type": "switch", "location": "Prédio Anexo"},
    {"id": "switch-003", "type": "switch", "location": "Estacionamento"},
]

MQTT_BROKER = "mosquitto"
MQTT_PORT = 1883
CLIENT_ID = f"iot-simulator-{random.randint(1000, 9999)}"

client = mqtt.Client(CLIENT_ID)

def generate_telemetry(device: Dict) -> Dict:
    """Generate realistic telemetry data based on device type"""
    device_id = device["id"]
    device_type = device["type"]
    location = device["location"]

    timestamp = datetime.utcnow().isoformat()

    if device_type == "temperature":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "value": round(random.uniform(18.0, 28.0), 2),
            "unit": "°C",
            "status": "ok"
        }

    elif device_type == "humidity":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "value": round(random.uniform(40.0, 70.0), 2),
            "unit": "%",
            "status": "ok"
        }

    elif device_type == "pressure":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "value": round(random.uniform(900.0, 1100.0), 2),
            "unit": "hPa",
            "status": "ok"
        }

    elif device_type == "camera":
        # Simulate camera events
        events = ["motion_detected", "face_detected", "no_activity", "night_mode"]
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "event": random.choice(events),
            "recording": random.choice([True, False]),
            "status": "online"
        }

    elif device_type == "light":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "status": random.choice(["on", "off", "dimmed"]),
            "brightness": random.randint(0, 100),
            "power_consumption": round(random.uniform(5.0, 50.0), 2)
        }

    elif device_type == "energy":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "voltage": round(random.uniform(220.0, 240.0), 2),
            "current": round(random.uniform(1.0, 20.0), 2),
            "power": round(random.uniform(100.0, 5000.0), 2),
            "unit": "W"
        }

    elif device_type == "motion":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "motion_detected": random.choice([True, False]),
            "status": "ok"
        }

    elif device_type == "water":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "flow_rate": round(random.uniform(0.0, 10.0), 2),
            "total_volume": round(random.uniform(1000.0, 50000.0), 2),
            "unit": "L"
        }

    elif device_type == "gas":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "concentration": round(random.uniform(0.0, 100.0), 2),
            "unit": "ppm",
            "status": "ok"
        }

    elif device_type == "rfid":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "tag_detected": random.choice([True, False]),
            "tag_id": f"RFID{random.randint(100000, 999999)}" if random.random() > 0.7 else None
        }

    elif device_type == "lock":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "status": random.choice(["locked", "unlocked", "ajar"]),
            "access_granted": random.choice([True, False, None])
        }

    elif device_type == "air_quality":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "pm25": round(random.uniform(5.0, 50.0), 2),
            "pm10": round(random.uniform(10.0, 80.0), 2),
            "co2": round(random.uniform(400.0, 2000.0), 2),
            "voc": round(random.uniform(0.1, 1.5), 2),
            "aqi": random.randint(20, 150)
        }

    elif device_type == "switch":
        return {
            "device_id": device_id,
            "type": device_type,
            "location": location,
            "timestamp": timestamp,
            "status": random.choice(["on", "off", "auto"]),
            "power": round(random.uniform(0.0, 100.0), 2)
        }

    return {}

def publish_telemetry():
    """Publish telemetry data for all devices"""
    while True:
        for device in IOT_DEVICES:
            telemetry = generate_telemetry(device)
            topic = f"iot/{device['type']}/{device['id']}"
            payload = json.dumps(telemetry)

            try:
                client.publish(topic, payload)
                print(f"📡 Published to {topic}: {telemetry['value'] if 'value' in telemetry else telemetry.get('event', 'event')}")
            except Exception as e:
                print(f"❌ Error publishing: {e}")

        time.sleep(5)  # Send data every 5 seconds

def on_connect(client, userdata, flags, rc):
    """MQTT connection callback"""
    if rc == 0:
        print(f"✅ Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        print(f"🔢 Simulating {len(IOT_DEVICES)} IoT devices")
    else:
        print(f"❌ Failed to connect, return code {rc}")

if __name__ == "__main__":
    client.on_connect = on_connect
    client.connect(MQTT_BROKER, MQTT_PORT, 60)

    print("🌐 IoT Device Simulator Started")
    print(f"💡 Simulating {len(IOT_DEVICES)} devices")
    print("📡 Publishing telemetry via MQTT every 5 seconds")
    print("-" * 60)

    # Start publishing in a separate thread
    import threading
    pub_thread = threading.Thread(target=publish_telemetry, daemon=True)
    pub_thread.start()

    # Keep main thread alive
    try:
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n⏹️  IoT Simulator stopped")
