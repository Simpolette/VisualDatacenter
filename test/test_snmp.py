import asyncio

# Notice we are importing get_cmd (snake_case) instead of getCmd
from pysnmp.hlapi.asyncio import (
    get_cmd,
    SnmpEngine, 
    CommunityData, 
    UdpTransportTarget, 
    ContextData, 
    ObjectType, 
    ObjectIdentity
)

async def test_mock_snmp_server():
    target_ip = '127.0.0.1'
    port = 1161
    community_string = 'public'

    print(f"Connecting to SNMP server at {target_ip}:{port}...\n")

    oids_to_test = [
        ObjectType(ObjectIdentity('1.3.6.1.2.1.1.3.0')),         # TimeTicks (sysUpTime)
        ObjectType(ObjectIdentity('1.3.6.1.2.1.25.3.3.1.2.1')),  # CPU Usage %
        ObjectType(ObjectIdentity('1.3.6.1.2.1.25.2.3.1.6.1')),  # RAM Usage %
        ObjectType(ObjectIdentity('1.3.6.1.2.1.2.2.1.10.1')),    # Network Traffic Mbps
        ObjectType(ObjectIdentity('1.3.6.1.4.1.2021.11.11.0'))   # Temperature °C
    ]

    snmpEngine = SnmpEngine()

    # Await the correctly named get_cmd function
    errorIndication, errorStatus, errorIndex, varBinds = await get_cmd(
        snmpEngine,
        CommunityData(community_string, mpModel=1), # mpModel=1 forces v2c
        
        # FIX IS HERE: Await the async factory method
        await UdpTransportTarget.create((target_ip, port)), 
        
        ContextData(),
        *oids_to_test
    )

    if errorIndication:
        print(f"❌ Connection Error: {errorIndication}")
    elif errorStatus:
        print(f"❌ SNMP Error: {errorStatus.prettyPrint()} at index {errorIndex}")
    else:
        print("✅ Successfully received data from Mock SNMP Server!\n")
        print("--- DECODED RESPONSE ---")
        for varBind in varBinds:
            oid = varBind[0].prettyPrint()
            value = varBind[1].prettyPrint()
            
            label = "Unknown"
            if "1.3.6.1.2.1.1.3.0" in oid: label = "Uptime (TimeTicks)"
            elif "1.3.6.1.2.1.25.3.3.1.2.1" in oid: label = "CPU Usage (%)"
            elif "1.3.6.1.2.1.25.2.3.1.6.1" in oid: label = "RAM Usage (%)"
            elif "1.3.6.1.2.1.2.2.1.10.1" in oid: label = "Network (Mbps)"
            elif "1.3.6.1.4.1.2021.11.11.0" in oid: label = "Temperature (°C)"

            print(f"{label:<20} | {oid} = {value}")

if __name__ == '__main__':
    asyncio.run(test_mock_snmp_server())