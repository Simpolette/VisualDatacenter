from pymodbus.client import ModbusTcpClient

# Connect to the mapped port exposed by your Docker container
client = ModbusTcpClient('127.0.0.1', port=5502)
client.connect()

print("Connected to Modbus server...")

# Read 5 holding registers starting at address 0
# Our mock server should return [85, 220, 220, 45, 35]
result = client.read_holding_registers(address=0, count=5, device_id=1)

if not result.isError():
    print("\n✅ Successfully read from Mock Server!")
    print(f"Battery Level: {result.registers[0]} %")
    print(f"Input Voltage: {result.registers[1]} V")
    print(f"Output Voltage:{result.registers[2]} V")
    print(f"Current Load:  {result.registers[3]} %")
    print(f"Temperature:   {result.registers[4]} °C")
else:
    print("\n❌ Error reading registers")

client.close()