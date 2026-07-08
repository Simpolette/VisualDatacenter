import socket
import sys
import random
import time

# Global state dictionary for device metrics
state = {
    "uptime_start": time.time(),
    "cpu": 45.0,
    "ram": 62.0,
    "network": 350.0,
    "temp": 38.0
}

def update_snmp_state():
    # Minor random walk changes
    state["cpu"] = max(5, min(95, state["cpu"] + random.choice([-2, -1, 0, 1, 2])))
    state["ram"] = max(10, min(90, state["ram"] + random.choice([-1, 0, 1])))
    state["network"] = max(50, min(900, state["network"] + random.choice([-10, -5, 0, 5, 10])))
    state["temp"] = max(20, min(75, state["temp"] + random.choice([-1, 0, 1])))

def build_ber_length(length):
    if length < 128:
        return bytes([length])
    elif length < 256:
        return bytes([0x81, length])
    else:
        return bytes([0x82, (length >> 8) & 0xFF, length & 0xFF])

def build_ber_int(val, tag=0x02):
    if val == 0:
        b = bytes([0])
    else:
        b = []
        v = val
        while v > 0:
            b.append(v & 0xFF)
            v >>= 8
        if b[-1] & 0x80:
            b.append(0)
        b.reverse()
        b = bytes(b)
    return bytes([tag]) + build_ber_length(len(b)) + b

def build_ber_oid(oid_str):
    parts = [int(p) for p in oid_str.strip('.').split('.')]
    first = parts[0] * 40 + parts[1]
    octets = [first]
    for p in parts[2:]:
        if p < 128:
            octets.append(p)
        else:
            sub = []
            v = p
            while v > 0:
                sub.append(v & 0x7F)
                v >>= 7
            sub.reverse()
            for i in range(len(sub) - 1):
                sub[i] |= 0x80
            octets.extend(sub)
    b = bytes(octets)
    return bytes([0x06]) + build_ber_length(len(b)) + b

def build_varbind(oid_str, val, tag=0x02):
    oid_bytes = build_ber_oid(oid_str)
    val_bytes = build_ber_int(val, tag=tag)
    seq = oid_bytes + val_bytes
    return bytes([0x30]) + build_ber_length(len(seq)) + seq

def handle_snmp_get(data):
    if not data or data[0] != 0x30:
        return None

    # Find GetRequest PDU tag 0xA0
    pdu_idx = data.find(b'\xa0')
    if pdu_idx == -1:
        return None

    # Handle BER length after 0xA0
    len_byte = data[pdu_idx + 1]
    if len_byte < 128:
        req_id_start = pdu_idx + 2
    elif len_byte == 0x81:
        req_id_start = pdu_idx + 3
    elif len_byte == 0x82:
        req_id_start = pdu_idx + 4
    else:
        return None

    if data[req_id_start] != 0x02:
        return None

    req_id_len = data[req_id_start + 1]
    req_id_bytes = data[req_id_start: req_id_start + 2 + req_id_len]

    # Update states randomly on every poll
    update_snmp_state()

    uptime_ticks = int((time.time() - state["uptime_start"]) * 100)
    cpu_val = int(state["cpu"])
    ram_val = int(state["ram"])
    network_val = int(state["network"])
    temp_val = int(state["temp"])

    # Build VarBinds for metrics:
    vb1 = build_varbind("1.3.6.1.2.1.1.3.0", uptime_ticks, tag=0x43) # TimeTicks tag=0x43 (sysUpTime)
    vb2 = build_varbind("1.3.6.1.2.1.25.3.3.1.2.1", cpu_val)         # CPU Usage %
    vb3 = build_varbind("1.3.6.1.2.1.25.2.3.1.6.1", ram_val)         # RAM Usage %
    vb4 = build_varbind("1.3.6.1.2.1.2.2.1.10.1", network_val)       # Network Mbps
    vb5 = build_varbind("1.3.6.1.4.1.2021.11.11.0", temp_val)        # Temp °C

    varbind_list_bytes = vb1 + vb2 + vb3 + vb4 + vb5
    varbind_seq = bytes([0x30]) + build_ber_length(len(varbind_list_bytes)) + varbind_list_bytes

    # GetResponse PDU (0xA2)
    err_status = bytes([0x02, 0x01, 0x00])
    err_index = bytes([0x02, 0x01, 0x00])

    pdu_payload = req_id_bytes + err_status + err_index + varbind_seq
    response_pdu = bytes([0xA2]) + build_ber_length(len(pdu_payload)) + pdu_payload

    # SNMP Packet: 0x30 <len> Version=1 (v2c: 0x02 0x01 0x01) Community="public" (0x04 0x06 "public") <pdu>
    version_bytes = bytes([0x02, 0x01, 0x01]) # v2c
    community_bytes = bytes([0x04, 0x06]) + b"public"

    packet_payload = version_bytes + community_bytes + response_pdu
    response_packet = bytes([0x30]) + build_ber_length(len(packet_payload)) + packet_payload

    return response_packet

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(('0.0.0.0', 161))
    print("Starting Mock SNMP v2c Server on UDP port 161...")

    while True:
        try:
            data, addr = sock.recvfrom(2048)
            resp = handle_snmp_get(data)
            if resp:
                sock.sendto(resp, addr)
        except Exception as e:
            print(f"Error handling SNMP request: {e}", file=sys.stderr)

if __name__ == '__main__':
    main()
