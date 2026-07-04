import asyncio
from pymodbus.server import StartAsyncTcpServer
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext

async def main():
    # Initial values for holding registers:
    # Reg 0: Battery % (85)
    # Reg 1: Input Volt (220V)
    # Reg 2: Output Volt (220V)
    # Reg 3: Load % (45)
    # Reg 4: Temp C (35)
    block = ModbusSequentialDataBlock(1, [85, 220, 220, 45, 35])
    store = ModbusSlaveContext(di=block, hr=block)
    context = ModbusServerContext(slaves=store, single=True)
    print("Starting Modbus TCP Mock Server on port 502...")
    await StartAsyncTcpServer(context=context, address=("0.0.0.0", 502))

if __name__ == "__main__":
    asyncio.run(main())
