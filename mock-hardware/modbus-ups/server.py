import asyncio
import random
from pymodbus.server import StartAsyncTcpServer
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext

async def update_values(block):
    while True:
        try:
            # Regs: 0=Battery, 1=InputVolt, 2=OutputVolt, 3=Load, 4=Temp
            current = block.getValues(1, 5)
            battery = max(20, min(100, current[0] + random.choice([-1, 0, 1])))
            input_volt = max(215, min(225, current[1] + random.choice([-2, -1, 0, 1, 2])))
            output_volt = max(218, min(222, current[2] + random.choice([-1, 0, 1])))
            load = max(30, min(80, current[3] + random.choice([-2, -1, 0, 1, 2])))
            temp = max(30, min(50, current[4] + random.choice([-1, 0, 1])))
            
            block.setValues(1, [battery, input_volt, output_volt, load, temp])
        except Exception as e:
            print(f"Error updating modbus values: {e}")
        await asyncio.sleep(2)

async def main():
    # Initial values for holding registers:
    block = ModbusSequentialDataBlock(1, [85, 220, 220, 45, 35])
    store = ModbusSlaveContext(di=block, hr=block)
    context = ModbusServerContext(slaves=store, single=True)
    print("Starting Modbus TCP Mock Server on port 502...")
    
    # Run update task in background
    asyncio.create_task(update_values(block))
    
    await StartAsyncTcpServer(context=context, address=("0.0.0.0", 502))

if __name__ == "__main__":
    asyncio.run(main())
