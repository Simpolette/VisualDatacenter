package com.simpolette.dcv.DcvServerApplication.features.seed;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.*;
import com.simpolette.dcv.DcvServerApplication.features.pdu.Pdu;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import com.simpolette.dcv.DcvServerApplication.features.seed.dto.SeedResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class SeedService {

    private final RoomRepository roomRepository;
    private final DeviceTypeRepository deviceTypeRepository;
    private final ModuleTypeRepository moduleTypeRepository;
    private final JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    public SeedService(
            RoomRepository roomRepository,
            DeviceTypeRepository deviceTypeRepository,
            ModuleTypeRepository moduleTypeRepository,
            JdbcTemplate jdbcTemplate
    ) {
        this.roomRepository = roomRepository;
        this.deviceTypeRepository = deviceTypeRepository;
        this.moduleTypeRepository = moduleTypeRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public SeedResponse seed() {
        return seed(10000);
    }

    public SeedResponse seed(int targetDeviceCount) {
        // 1. High-speed database cleanup via JdbcTemplate
        jdbcTemplate.update("DELETE FROM pdu");
        jdbcTemplate.update("DELETE FROM device");
        jdbcTemplate.update("DELETE FROM rack");
        jdbcTemplate.update("DELETE FROM room");
        jdbcTemplate.update("DELETE FROM device_type");
        jdbcTemplate.update("DELETE FROM module_type");

        if (entityManager != null) {
            entityManager.clear();
        }

        // 2. Seed Catalog: DeviceTypes
        DeviceType dellR740 = new DeviceType();
        dellR740.setName("Dell PowerEdge R740");
        dellR740.setCategory(DeviceType.Category.COMPUTE);
        dellR740.setHeightU(2);
        dellR740.setWidthMm(482.0f);
        dellR740.setLengthMm(715.0f);
        dellR740.setWeightKg(26.0f);
        dellR740.setFrontImagePath("/images/Dell/dell-poweredge-r760.front.png");
        dellR740.setRearImagePath("/images/Dell/dell-poweredge-r760.rear.png");
        dellR740.setOidUptime("1.3.6.1.2.1.1.3.0");
        dellR740.setOidCpu("1.3.6.1.4.1.674.10892.5.4.600.12.1.6.1.1");
        dellR740.setOidRam("1.3.6.1.4.1.674.10892.5.4.1100.50.1.5.1.1");
        dellR740.setOidNetwork("1.3.6.1.2.1.2.2.1.10.1");
        dellR740.setOidTemp("1.3.6.1.4.1.674.10892.5.4.700.20.1.6.1.1");

        DeviceType cisco9300 = new DeviceType();
        cisco9300.setName("Cisco Catalyst 9300");
        cisco9300.setCategory(DeviceType.Category.NETWORK);
        cisco9300.setHeightU(1);
        cisco9300.setWidthMm(445.0f);
        cisco9300.setLengthMm(445.0f);
        cisco9300.setWeightKg(7.0f);
        cisco9300.setFrontImagePath("/images/Cisco/cisco-c9300-48t.front.png");
        cisco9300.setRearImagePath("/images/Cisco/cisco-c9300-48t.rear.png");
        cisco9300.setOidUptime("1.3.6.1.2.1.1.3.0");
        cisco9300.setOidCpu("1.3.6.1.4.1.9.9.109.1.1.1.1.5.1");
        cisco9300.setOidRam("1.3.6.1.4.1.9.9.48.1.1.1.5.1");
        cisco9300.setOidNetwork("1.3.6.1.2.1.2.2.1.10.1");
        cisco9300.setOidTemp("1.3.6.1.4.1.9.9.13.1.3.1.3.1");

        DeviceType hpeMsa2060 = new DeviceType();
        hpeMsa2060.setName("HPE MSA 2060");
        hpeMsa2060.setCategory(DeviceType.Category.STORAGE);
        hpeMsa2060.setHeightU(2);
        hpeMsa2060.setWidthMm(482.0f);
        hpeMsa2060.setLengthMm(520.0f);
        hpeMsa2060.setWeightKg(28.0f);
        hpeMsa2060.setFrontImagePath("/images/HPE/hpe-msa-2040-sff-chassis-ac.front.png");
        hpeMsa2060.setRearImagePath("/images/HPE/hpe-msa-2040-sff-chassis-ac.rear.png");
        hpeMsa2060.setOidUptime("1.3.6.1.2.1.1.3.0");
        hpeMsa2060.setOidCpu("1.3.6.1.4.1.11.2.3.9.4.2.1.41.1");
        hpeMsa2060.setOidRam("1.3.6.1.4.1.11.2.3.9.4.2.1.41.2");
        hpeMsa2060.setOidNetwork("1.3.6.1.2.1.2.2.1.10.1");
        hpeMsa2060.setOidTemp("1.3.6.1.4.1.11.2.3.9.4.2.1.41.3");

        DeviceType dellR640 = new DeviceType();
        dellR640.setName("Dell PowerEdge R640");
        dellR640.setCategory(DeviceType.Category.COMPUTE);
        dellR640.setHeightU(1);
        dellR640.setWidthMm(482.0f);
        dellR640.setLengthMm(705.0f);
        dellR640.setWeightKg(21.0f);
        dellR640.setFrontImagePath("/images/Dell/dell-poweredge-r640.front.png");
        dellR640.setRearImagePath("/images/Dell/dell-poweredge-r640.rear.png");
        dellR640.setOidUptime("1.3.6.1.2.1.1.3.0");
        dellR640.setOidCpu("1.3.6.1.4.1.674.10892.5.4.600.12.1.6.1.1");
        dellR640.setOidRam("1.3.6.1.4.1.674.10892.5.4.1100.50.1.5.1.1");
        dellR640.setOidNetwork("1.3.6.1.2.1.2.2.1.10.1");
        dellR640.setOidTemp("1.3.6.1.4.1.674.10892.5.4.700.20.1.6.1.1");

        DeviceType ciscoNexus = new DeviceType();
        ciscoNexus.setName("Cisco Nexus 93180YC-FX");
        ciscoNexus.setCategory(DeviceType.Category.NETWORK);
        ciscoNexus.setHeightU(1);
        ciscoNexus.setWidthMm(445.0f);
        ciscoNexus.setLengthMm(571.0f);
        ciscoNexus.setWeightKg(9.5f);
        ciscoNexus.setFrontImagePath("/images/Cisco/cisco-n9k-c93180yc-fx.front.png");
        ciscoNexus.setRearImagePath("/images/Cisco/cisco-n9k-c93180yc-fx.rear.png");
        ciscoNexus.setOidUptime("1.3.6.1.2.1.1.3.0");
        ciscoNexus.setOidCpu("1.3.6.1.4.1.9.9.109.1.1.1.1.5.1");
        ciscoNexus.setOidRam("1.3.6.1.4.1.9.9.48.1.1.1.5.1");
        ciscoNexus.setOidNetwork("1.3.6.1.2.1.2.2.1.10.1");
        ciscoNexus.setOidTemp("1.3.6.1.4.1.9.9.13.1.3.1.3.1");

        DeviceType hpeDl380 = new DeviceType();
        hpeDl380.setName("HPE ProLiant DL380 Gen10");
        hpeDl380.setCategory(DeviceType.Category.COMPUTE);
        hpeDl380.setHeightU(2);
        hpeDl380.setWidthMm(445.4f);
        hpeDl380.setLengthMm(730.0f);
        hpeDl380.setWeightKg(24.5f);
        hpeDl380.setFrontImagePath("/images/HPE/hpe-proliant-dl380-gen10.front.png");
        hpeDl380.setRearImagePath("/images/HPE/hpe-proliant-dl380-gen10.rear.png");
        hpeDl380.setOidUptime("1.3.6.1.2.1.1.3.0");
        hpeDl380.setOidCpu("1.3.6.1.4.1.232.6.2.2.1.0");
        hpeDl380.setOidRam("1.3.6.1.4.1.232.6.2.3.1.0");
        hpeDl380.setOidNetwork("1.3.6.1.2.1.2.2.1.10.1");
        hpeDl380.setOidTemp("1.3.6.1.4.1.232.6.2.6.8.1.4.0.1");

        List<DeviceType> catalog = List.of(dellR740, cisco9300, hpeMsa2060, dellR640, ciscoNexus, hpeDl380);
        List<DeviceType> savedCatalog = deviceTypeRepository.saveAll(catalog);

        // Seed ModuleTypes
        ModuleType nm4_10g = new ModuleType();
        nm4_10g.setManufacturer("Cisco");
        nm4_10g.setModel("C3850-NM-4-10G");
        nm4_10g.setPartNumber("C3850-NM-4-10G");
        moduleTypeRepository.save(nm4_10g);

        // 3. Calculate Layout & Dynamic Room Dimensions
        int devicesPerRackTarget = 20;
        int totalRacksNeeded = Math.max(1, (int) Math.ceil((double) targetDeviceCount / devicesPerRackTarget));
        int cols = Math.max(5, Math.min(35, (int) Math.ceil(Math.sqrt(totalRacksNeeded * 1.5))));
        
        float stepX = 1.0f;
        float stepY = 3.0f;

        int maxCol = Math.min(totalRacksNeeded - 1, cols - 1);
        int maxRow = (totalRacksNeeded - 1) / cols;

        float maxPosX = 2.5f + maxCol * stepX;
        float maxPosY = 3.5f + maxRow * stepY;

        float roomWidthM = Math.max(15.0f, (float) Math.ceil(maxPosX + 4.5f));
        float roomLengthM = Math.max(15.0f, (float) Math.ceil(maxPosY + 5.5f));

        Room room = new Room();
        room.setName("Main Datacenter Hall");
        room.setLocation("Building A, Floor 1");
        room.setWidthM(roomWidthM);
        room.setLengthM(roomLengthM);
        Room savedRoom = roomRepository.save(room);

        // 4. Create Racks via JdbcTemplate batching
        List<RackRecord> rackRecords = new ArrayList<>();
        String insertRackSql = "INSERT INTO rack (name, total_units, pos_x, pos_y, rotation_deg, length, room_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        Timestamp now = Timestamp.from(Instant.now());

        for (int i = 0; i < totalRacksNeeded; i++) {
            int rowIdx = i / cols;
            int colIdx = i % cols;
            String name = (char) ('A' + (rowIdx % 26)) + String.format("%02d", colIdx + 1);
            float posX = 2.5f + colIdx * stepX;
            float posY = 3.5f + rowIdx * stepY;
            float rot = rowIdx % 2 == 0 ? 0.0f : 180.0f;

            rackRecords.add(new RackRecord(name, 42, posX, posY, rot, 1.0f, savedRoom.getId()));
        }

        jdbcTemplate.batchUpdate(insertRackSql, rackRecords, rackRecords.size(), (PreparedStatement ps, RackRecord r) -> {
            ps.setString(1, r.name);
            ps.setInt(2, r.totalUnits);
            ps.setFloat(3, r.posX);
            ps.setFloat(4, r.posY);
            ps.setFloat(5, r.rotationDeg);
            ps.setFloat(6, r.length);
            ps.setLong(7, r.roomId);
            ps.setTimestamp(8, now);
            ps.setTimestamp(9, now);
        });

        // Retrieve created rack IDs from database
        List<Long> rackIds = jdbcTemplate.query(
                "SELECT id FROM rack WHERE room_id = ? ORDER BY id ASC",
                (rs, rowNum) -> rs.getLong("id"),
                savedRoom.getId()
        );

        // 5. Prepare Device and PDU batches for JdbcTemplate
        List<DeviceRecord> deviceBatch = new ArrayList<>();
        List<PduRecord> pduBatch = new ArrayList<>();
        int totalCreatedDevices = 0;

        for (int rIdx = 0; rIdx < rackIds.size() && totalCreatedDevices < targetDeviceCount; rIdx++) {
            Long rackId = rackIds.get(rIdx);
            String rackName = rackRecords.get(rIdx).name;

            // Utilization tier:
            // 1st rack: Green (< 50% filled, maxU = 10)
            // 2nd rack: Blue (50% - 79% filled, maxU = 26)
            // All other racks: Fully Filled (42U filled)
            int maxU = (rIdx == 0) ? 10 : ((rIdx == 1) ? 26 : 42);

            int currentU = 1;
            int devInRackIdx = 1;

            while (currentU <= maxU && currentU <= 42 && totalCreatedDevices < targetDeviceCount) {
                DeviceType dt = savedCatalog.get((rIdx + devInRackIdx) % savedCatalog.size());
                int devHeight = dt.getHeightU();

                if (currentU + devHeight - 1 > 42) {
                    break;
                }

                String devName = dt.getName().replace(" ", "-") + "-" + String.format("%05d", totalCreatedDevices + 1);
                String status = totalCreatedDevices % 15 == 0 ? "MAINTENANCE" : (totalCreatedDevices % 30 == 0 ? "OFFLINE" : "ACTIVE");
                int subnet = (rIdx % 250) + 1;
                String ipAddress = "10.1." + subnet + "." + devInRackIdx;

                deviceBatch.add(new DeviceRecord(
                        devName, rackId, dt.getId(), currentU, "FRONT", status, ipAddress, 1161, "public"
                ));

                totalCreatedDevices++;
                currentU += devHeight;
                devInRackIdx++;
            }

            // Create 2 PDUs per rack
            pduBatch.add(new PduRecord("PDU-" + rackName + "-A", rackId, "LEFT", 24));
            pduBatch.add(new PduRecord("PDU-" + rackName + "-B", rackId, "RIGHT", 24));
        }

        // Execute batch insert for Devices
        String insertDeviceSql = "INSERT INTO device (name, rack_id, device_type_id, start_u, face, status, ip_address, port, snmp_community, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.batchUpdate(insertDeviceSql, deviceBatch, deviceBatch.size(), (PreparedStatement ps, DeviceRecord d) -> {
            ps.setString(1, d.name);
            ps.setLong(2, d.rackId);
            ps.setLong(3, d.deviceTypeId);
            ps.setInt(4, d.startU);
            ps.setString(5, d.face);
            ps.setString(6, d.status);
            ps.setString(7, d.ipAddress);
            ps.setInt(8, d.port);
            ps.setString(9, d.snmpCommunity);
            ps.setTimestamp(10, now);
            ps.setTimestamp(11, now);
        });

        // Execute batch insert for PDUs
        String insertPduSql = "INSERT INTO pdu (name, rack_id, position, outlet_count, created_at) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.batchUpdate(insertPduSql, pduBatch, pduBatch.size(), (PreparedStatement ps, PduRecord p) -> {
            ps.setString(1, p.name);
            ps.setLong(2, p.rackId);
            ps.setString(3, p.position);
            ps.setInt(4, p.outletCount);
            ps.setTimestamp(5, now);
        });

        return new SeedResponse(
                "Database seeded successfully with " + totalCreatedDevices + " devices across " + rackIds.size() + " racks",
                1,
                rackIds.size(),
                savedCatalog.size(),
                totalCreatedDevices,
                pduBatch.size()
        );
    }

    // Helper records for JDBC batching
    private record RackRecord(String name, int totalUnits, float posX, float posY, float rotationDeg, float length, Long roomId) {}
    private record DeviceRecord(String name, Long rackId, Long deviceTypeId, int startU, String face, String status, String ipAddress, int port, String snmpCommunity) {}
    private record PduRecord(String name, Long rackId, String position, int outletCount) {}
}

