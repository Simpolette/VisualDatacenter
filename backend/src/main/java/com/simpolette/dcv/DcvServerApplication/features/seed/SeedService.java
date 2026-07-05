package com.simpolette.dcv.DcvServerApplication.features.seed;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceService;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.*;
import com.simpolette.dcv.DcvServerApplication.features.pdu.Pdu;
import com.simpolette.dcv.DcvServerApplication.features.pdu.PduRepository;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import com.simpolette.dcv.DcvServerApplication.features.seed.dto.SeedResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class SeedService {

    private final RoomRepository roomRepository;
    private final RackRepository rackRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceTypeRepository deviceTypeRepository;
    private final PduRepository pduRepository;
    private final ModuleTypeRepository moduleTypeRepository;
    private final DeviceService deviceService;

    @PersistenceContext
    private EntityManager entityManager;

    public SeedService(
            RoomRepository roomRepository,
            RackRepository rackRepository,
            DeviceRepository deviceRepository,
            DeviceTypeRepository deviceTypeRepository,
            PduRepository pduRepository,
            ModuleTypeRepository moduleTypeRepository,
            DeviceService deviceService
    ) {
        this.roomRepository = roomRepository;
        this.rackRepository = rackRepository;
        this.deviceRepository = deviceRepository;
        this.deviceTypeRepository = deviceTypeRepository;
        this.pduRepository = pduRepository;
        this.moduleTypeRepository = moduleTypeRepository;
        this.deviceService = deviceService;
    }

    public SeedResponse seed() {
        return seed(10000);
    }

    public SeedResponse seed(int targetDeviceCount) {
        // 1. Clear existing data in reverse dependency order
        pduRepository.deleteAll();
        deviceRepository.deleteAll();
        rackRepository.deleteAll();
        roomRepository.deleteAll();
        deviceTypeRepository.deleteAll();
        moduleTypeRepository.deleteAll();

        pduRepository.flush();
        deviceRepository.flush();
        rackRepository.flush();
        roomRepository.flush();
        deviceTypeRepository.flush();
        moduleTypeRepository.flush();

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

        DeviceType hpeMsa2060 = new DeviceType();
        hpeMsa2060.setName("HPE MSA 2060");
        hpeMsa2060.setCategory(DeviceType.Category.STORAGE);
        hpeMsa2060.setHeightU(2);
        hpeMsa2060.setWidthMm(482.0f);
        hpeMsa2060.setLengthMm(520.0f);
        hpeMsa2060.setWeightKg(28.0f);
        hpeMsa2060.setFrontImagePath("/images/HPE/hpe-msa-2040-sff-chassis-ac.front.png");
        hpeMsa2060.setRearImagePath("/images/HPE/hpe-msa-2040-sff-chassis-ac.rear.png");

        DeviceType dellR640 = new DeviceType();
        dellR640.setName("Dell PowerEdge R640");
        dellR640.setCategory(DeviceType.Category.COMPUTE);
        dellR640.setHeightU(1);
        dellR640.setWidthMm(482.0f);
        dellR640.setLengthMm(705.0f);
        dellR640.setWeightKg(21.0f);
        dellR640.setFrontImagePath("/images/Dell/dell-poweredge-r640.front.png");
        dellR640.setRearImagePath("/images/Dell/dell-poweredge-r640.rear.png");

        DeviceType ciscoNexus = new DeviceType();
        ciscoNexus.setName("Cisco Nexus 93180YC-FX");
        ciscoNexus.setCategory(DeviceType.Category.NETWORK);
        ciscoNexus.setHeightU(1);
        ciscoNexus.setWidthMm(445.0f);
        ciscoNexus.setLengthMm(571.0f);
        ciscoNexus.setWeightKg(9.5f);
        ciscoNexus.setFrontImagePath("/images/Cisco/cisco-n9k-c93180yc-fx.front.png");
        ciscoNexus.setRearImagePath("/images/Cisco/cisco-n9k-c93180yc-fx.rear.png");

        DeviceType hpeDl380 = new DeviceType();
        hpeDl380.setName("HPE ProLiant DL380 Gen10");
        hpeDl380.setCategory(DeviceType.Category.COMPUTE);
        hpeDl380.setHeightU(2);
        hpeDl380.setWidthMm(445.4f);
        hpeDl380.setLengthMm(730.0f);
        hpeDl380.setWeightKg(24.5f);
        hpeDl380.setFrontImagePath("/images/HPE/hpe-proliant-dl380-gen10.front.png");
        hpeDl380.setRearImagePath("/images/HPE/hpe-proliant-dl380-gen10.rear.png");

        List<DeviceType> catalog = List.of(dellR740, cisco9300, hpeMsa2060, dellR640, ciscoNexus, hpeDl380);
        deviceTypeRepository.saveAll(catalog);

        // Seed ModuleTypes
        ModuleType nm4_10g = new ModuleType();
        nm4_10g.setManufacturer("Cisco");
        nm4_10g.setModel("C3850-NM-4-10G");
        nm4_10g.setPartNumber("C3850-NM-4-10G");
        moduleTypeRepository.save(nm4_10g);

        // 3. Calculate Layout for Target Devices
        int devicesPerRackTarget = 20;
        int totalRacksNeeded = Math.max(1, (int) Math.ceil((double) targetDeviceCount / devicesPerRackTarget));
        int racksPerRoom = 50;
        int roomCountNeeded = Math.max(1, (int) Math.ceil((double) totalRacksNeeded / racksPerRoom));

        List<Room> rooms = new ArrayList<>();
        for (int r = 1; r <= roomCountNeeded; r++) {
            Room room = new Room();
            room.setName("Datacenter Hall " + String.format("%02d", r));
            room.setLocation("Building " + (char) ('A' + (r - 1) % 5) + ", Floor " + ((r % 4) + 1));
            room.setWidthM(30.0f);
            room.setLengthM(20.0f);
            rooms.add(room);
        }
        roomRepository.saveAll(rooms);

        // 4. Create Racks in Grid layout per room
        List<Rack> allRacks = new ArrayList<>();
        int rackCounter = 0;
        for (Room room : rooms) {
            int racksInThisRoom = Math.min(racksPerRoom, totalRacksNeeded - rackCounter);
            int cols = 10;
            for (int i = 0; i < racksInThisRoom; i++) {
                int rowIdx = i / cols;
                int colIdx = i % cols;
                Rack rack = new Rack();
                rack.setName("Rack " + (char) ('A' + rowIdx) + String.format("%02d", colIdx + 1));
                rack.setTotalUnits(42);
                rack.setPosX(3.0f + colIdx * 2.5f);
                rack.setPosY(3.0f + rowIdx * 3.5f);
                rack.setRotationDeg(rowIdx % 2 == 0 ? 0.0f : 180.0f);
                rack.setRoom(room);
                allRacks.add(rack);
                rackCounter++;
            }
        }
        rackRepository.saveAll(allRacks);

        // 5. Create 10,000+ Devices with Utilization Distribution
        List<Device> deviceBatch = new ArrayList<>();
        List<Pdu> pduBatch = new ArrayList<>();
        int totalCreatedDevices = 0;
        int BATCH_SIZE = 1000;

        Device.Status[] statuses = Device.Status.values();
        Device.Face[] faces = Device.Face.values();

        for (int rIdx = 0; rIdx < allRacks.size() && totalCreatedDevices < targetDeviceCount; rIdx++) {
            Rack rack = allRacks.get(rIdx);

            // Determine utilization tier for visual QA:
            // 20% High (34U-41U), 30% Med (22U-31U), 50% Low (6U-17U)
            int maxU;
            if (rIdx % 10 < 2) {
                maxU = 34 + (rIdx % 8);
            } else if (rIdx % 10 < 5) {
                maxU = 22 + (rIdx % 10);
            } else {
                maxU = 6 + (rIdx % 12);
            }

            int currentU = 1;
            int devInRackIdx = 1;

            while (currentU <= maxU && currentU <= 41 && totalCreatedDevices < targetDeviceCount) {
                DeviceType dt = catalog.get((rIdx + devInRackIdx) % catalog.size());
                int devHeight = dt.getHeightU();

                if (currentU + devHeight - 1 > 42) {
                    break;
                }

                Device device = new Device();
                device.setRack(rack);
                device.setDeviceType(dt);
                device.setName(dt.getName().replace(" ", "-") + "-" + String.format("%05d", totalCreatedDevices + 1));
                device.setStartU(currentU);
                device.setFace(faces[totalCreatedDevices % faces.length]);
                device.setStatus(totalCreatedDevices % 15 == 0 ? Device.Status.MAINTENANCE : (totalCreatedDevices % 30 == 0 ? Device.Status.OFFLINE : Device.Status.ACTIVE));

                int hallNum = (rIdx / racksPerRoom) + 1;
                int subnet = (rIdx % 250) + 1;
                device.setIpAddress("10." + hallNum + "." + subnet + "." + devInRackIdx);
                device.setPort(1161);
                device.setSnmpCommunity("public");

                deviceBatch.add(device);
                totalCreatedDevices++;
                currentU += devHeight;
                devInRackIdx++;

                if (deviceBatch.size() >= BATCH_SIZE) {
                    deviceRepository.saveAll(deviceBatch);
                    deviceRepository.flush();
                    deviceBatch.clear();
                    if (entityManager != null) {
                        entityManager.clear();
                    }
                }
            }

            // Create 2 PDUs per rack
            Pdu pdu1 = new Pdu();
            pdu1.setRack(rack);
            pdu1.setName("PDU-" + rack.getName() + "-A");
            pdu1.setPosition(Pdu.Position.LEFT);
            pdu1.setOutletCount(24);

            Pdu pdu2 = new Pdu();
            pdu2.setRack(rack);
            pdu2.setName("PDU-" + rack.getName() + "-B");
            pdu2.setPosition(Pdu.Position.RIGHT);
            pdu2.setOutletCount(24);

            pduBatch.add(pdu1);
            pduBatch.add(pdu2);

            if (pduBatch.size() >= BATCH_SIZE) {
                pduRepository.saveAll(pduBatch);
                pduRepository.flush();
                pduBatch.clear();
            }
        }

        if (!deviceBatch.isEmpty()) {
            deviceRepository.saveAll(deviceBatch);
            deviceRepository.flush();
            deviceBatch.clear();
        }

        if (!pduBatch.isEmpty()) {
            pduRepository.saveAll(pduBatch);
            pduRepository.flush();
            pduBatch.clear();
        }

        return new SeedResponse(
                "Database seeded successfully with " + totalCreatedDevices + " devices across " + allRacks.size() + " racks",
                rooms.size(),
                allRacks.size(),
                catalog.size(),
                totalCreatedDevices,
                allRacks.size() * 2
        );
    }
}

