#!/usr/bin/env python3
"""
🏭 PLC Simulator (S7-1200 Style)
Simulates industrial PLC with Modbus/TCP communication
"""

import socket
import threading
import time
import json
from datetime import datetime
import random

PLC_HOST = "0.0.0.0"
PLC_PORT = 2000

# Simulated PLC data areas
class PLCData:
    def __init__(self):
        # Digital outputs (coils)
        self.coils = [False] * 100
        # Digital inputs
        self.inputs = [False] * 100
        # Holding registers (analog outputs)
        self.holding_registers = [0.0] * 100
        # Input registers (analog inputs)
        self.input_registers = [0.0] * 100

    def simulate_io(self):
        """Simulate real industrial I/O changes"""
        # Simulate temperature sensor (input register 0)
        self.input_registers[0] = 20.0 + random.uniform(-5, 5)

        # Simulate pressure sensor (input register 1)
        self.input_registers[1] = 100.0 + random.uniform(-10, 10)

        # Simulate flow rate (input register 2)
        self.input_registers[2] = 50.0 + random.uniform(-20, 20)

        # Simulate tank level (input register 3)
        self.input_registers[3] = random.uniform(0, 100)

        # Digital inputs - safety switches
        self.inputs[0] = random.choice([True, False])  # Emergency stop
        self.inputs[1] = random.choice([True, False])  # Safety gate
        self.inputs[2] = random.choice([True, False])  # Overpressure

        # Simulate production counter
        self.holding_registers[10] = (self.holding_registers[10] + 1) % 10000

plc_data = PLCData()

def handle_modbus_request(client_socket):
    """Handle Modbus/TCP request"""
    try:
        data = client_socket.recv(1024)
        if len(data) < 7:
            return

        # Parse Modbus request (simplified)
        transaction_id = (data[0] << 8) | data[1]
        protocol_id = (data[2] << 8) | data[3]
        length = (data[4] << 8) | data[5]
        unit_id = data[6]
        function_code = data[7]

        # Simulate processing time
        time.sleep(0.01)

        if function_code == 0x01:  # Read coils
            start_address = (data[8] << 8) | data[9]
            coil_count = (data[10] << 8) | data[11]

            response = bytearray()
            response.extend([0x00, 0x01])  # Transaction ID
            response.extend([0x00, 0x00])  # Protocol ID
            response.extend([0x00, 0x00])  # Length (placeholder)
            response.extend([0x01])        # Unit ID
            response.extend([0x01])        # Function code
            response.extend([0x02])        # Byte count

            # Get coil values
            byte_value = 0
            for i in range(8):
                if start_address + i < len(plc_data.coils):
                    if plc_data.coils[start_address + i]:
                        byte_value |= (1 << i)

            response.extend([byte_value])

            # Set actual length
            response[4] = (len(response) - 6) >> 8
            response[5] = (len(response) - 6) & 0xFF

            client_socket.send(response)

        elif function_code == 0x02:  # Read discrete inputs
            start_address = (data[8] << 8) | data[9]
            input_count = (data[10] << 8) | data[11]

            response = bytearray()
            response.extend([0x00, 0x02])  # Transaction ID
            response.extend([0x00, 0x00])  # Protocol ID
            response.extend([0x00, 0x00])  # Length (placeholder)
            response.extend([0x01])        # Unit ID
            response.extend([0x02])        # Function code
            response.extend([0x02])        # Byte count

            # Get input values
            byte_value = 0
            for i in range(min(8, input_count)):
                if start_address + i < len(plc_data.inputs):
                    if plc_data.inputs[start_address + i]:
                        byte_value |= (1 << i)

            response.extend([byte_value])

            # Set actual length
            response[4] = (len(response) - 6) >> 8
            response[5] = (len(response) - 6) & 0xFF

            client_socket.send(response)

        elif function_code == 0x03:  # Read holding registers
            start_address = (data[8] << 8) | data[9]
            register_count = (data[10] << 8) | data[11]

            response = bytearray()
            response.extend([0x00, 0x03])  # Transaction ID
            response.extend([0x00, 0x00])  # Protocol ID
            response.extend([0x00, 0x00])  # Length (placeholder)
            response.extend([0x01])        # Unit ID
            response.extend([0x03])        # Function code
            response.extend([register_count * 2])  # Byte count

            # Get holding register values
            for i in range(register_count):
                if start_address + i < len(plc_data.holding_registers):
                    value = int(plc_data.holding_registers[start_address + i])
                    response.extend([value >> 8, value & 0xFF])

            # Set actual length
            response[4] = (len(response) - 6) >> 8
            response[5] = (len(response) - 6) & 0xFF

            client_socket.send(response)

        elif function_code == 0x04:  # Read input registers
            start_address = (data[8] << 8) | data[9]
            register_count = (data[10] << 8) | data[11]

            response = bytearray()
            response.extend([0x00, 0x04])  # Transaction ID
            response.extend([0x00, 0x00])  # Protocol ID
            response.extend([0x00, 0x00])  # Length (placeholder)
            response.extend([0x01])        # Unit ID
            response.extend([0x04])        # Function code
            response.extend([register_count * 2])  # Byte count

            # Get input register values
            for i in range(register_count):
                if start_address + i < len(plc_data.input_registers):
                    value = int(plc_data.input_registers[start_address + i] * 10)
                    response.extend([value >> 8, value & 0xFF])

            # Set actual length
            response[4] = (len(response) - 6) >> 8
            response[5] = (len(response) - 6) & 0xFF

            client_socket.send(response)

        elif function_code == 0x05:  # Write single coil
            start_address = (data[8] << 8) | data[9]
            coil_value = (data[10] << 8) | data[11]

            if start_address < len(plc_data.coils):
                plc_data.coils[start_address] = (coil_value == 0xFF00)

            # Echo back the request
            client_socket.send(data[:12])

        elif function_code == 0x06:  # Write single register
            start_address = (data[8] << 8) | data[9]
            register_value = (data[10] << 8) | data[11]

            if start_address < len(plc_data.holding_registers):
                plc_data.holding_registers[start_address] = float(register_value)

            # Echo back the request
            client_socket.send(data[:12])

    except Exception as e:
        print(f"❌ Error handling request: {e}")
    finally:
        client_socket.close()

def start_plc_server():
    """Start the PLC Modbus server"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((PLC_HOST, PLC_PORT))
    server.listen(5)

    print(f"🏭 PLC Simulator (S7-1200) started on port {PLC_PORT}")
    print("📡 Accepting Modbus/TCP connections")
    print("-" * 60)

    while True:
        client, address = server.accept()
        print(f"🔗 Client connected from {address}")
        thread = threading.Thread(target=handle_modbus_request, args=(client,))
        thread.daemon = True
        thread.start()

def simulate_plc_process():
    """Simulate the industrial process"""
    while True:
        plc_data.simulate_io()
        time.sleep(2)

        # Print status every 30 seconds
        if int(time.time()) % 30 == 0:
            print(f"⏰ {datetime.now().strftime('%H:%M:%S')} - PLC Status:")
            print(f"   🌡️  Temperature: {plc_data.input_registers[0]:.1f}°C")
            print(f"   🔘 Emergency Stop: {'PRESSED' if plc_data.inputs[0] else 'OK'}")
            print(f"   📦 Production Count: {int(plc_data.holding_registers[10])}")
            print("-" * 60)

if __name__ == "__main__":
    # Start PLC server in background
    server_thread = threading.Thread(target=start_plc_server, daemon=True)
    server_thread.start()

    # Start process simulation
    simulate_thread = threading.Thread(target=simulate_plc_process, daemon=True)
    simulate_thread.start()

    print("🏭 PLC Simulator Ready")
    print("💡 Simulated I/O points:")
    print("   - Digital Inputs: Safety switches, sensors")
    print("   - Digital Outputs: Motors, valves, indicators")
    print("   - Analog Inputs: Temperature, pressure, flow")
    print("   - Analog Outputs: Setpoints, control signals")
    print("")
    print("🌐 Modbus/TCP Server: port 2000")
    print("")

    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n⏹️  PLC Simulator stopped")
