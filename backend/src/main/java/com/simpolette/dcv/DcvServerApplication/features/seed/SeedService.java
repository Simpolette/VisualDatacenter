package com.simpolette.dcv.DcvServerApplication.features.seed;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.InterfaceTemplate;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.PowerPortTemplate;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ConsolePortTemplate;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleBayTemplate;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceService;
import com.simpolette.dcv.DcvServerApplication.features.pdu.Pdu;
import com.simpolette.dcv.DcvServerApplication.features.pdu.PduRepository;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import com.simpolette.dcv.DcvServerApplication.features.seed.dto.SeedResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        // 1. Clear existing data in reverse dependency order
        pduRepository.deleteAll();
        deviceRepository.deleteAll();
        rackRepository.deleteAll();
        roomRepository.deleteAll();
        deviceTypeRepository.deleteAll();
        moduleTypeRepository.deleteAll();

        // Flush deletes to database before inserting new data
        roomRepository.flush();
        deviceTypeRepository.flush();
        moduleTypeRepository.flush();

        // 2. Seed DeviceTypes
        DeviceType dellR740 = new DeviceType();
        dellR740.setName("Dell PowerEdge R740");
        dellR740.setCategory(DeviceType.Category.COMPUTE);
        dellR740.setHeightU(2);
        dellR740.setWidthMm(482.0f);
        dellR740.setLengthMm(715.0f);
        dellR740.setWeightKg(26.0f);
        dellR740.setImagePath("/images/dell-r740.png");

        InterfaceTemplate idrac = new InterfaceTemplate();
        idrac.setName("iDRAC");
        idrac.setType("1000base-t");
        idrac.setMgmtOnly(true);
        dellR740.addInterfaceTemplate(idrac);

        InterfaceTemplate nic1 = new InterfaceTemplate();
        nic1.setName("NIC1");
        nic1.setType("10gbase-t");
        nic1.setMgmtOnly(false);
        dellR740.addInterfaceTemplate(nic1);

        InterfaceTemplate nic2 = new InterfaceTemplate();
        nic2.setName("NIC2");
        nic2.setType("10gbase-t");
        nic2.setMgmtOnly(false);
        dellR740.addInterfaceTemplate(nic2);

        PowerPortTemplate dellPsu1 = new PowerPortTemplate();
        dellPsu1.setName("PSU1");
        dellPsu1.setType("iec-60320-c14");
        dellR740.addPowerPortTemplate(dellPsu1);

        PowerPortTemplate dellPsu2 = new PowerPortTemplate();
        dellPsu2.setName("PSU2");
        dellPsu2.setType("iec-60320-c14");
        dellR740.addPowerPortTemplate(dellPsu2);

        ConsolePortTemplate dellConsole = new ConsolePortTemplate();
        dellConsole.setName("Console");
        dellConsole.setType("rj-45");
        dellR740.addConsolePortTemplate(dellConsole);

        DeviceType cisco9300 = new DeviceType();
        cisco9300.setName("Cisco Catalyst 9300");
        cisco9300.setCategory(DeviceType.Category.NETWORK);
        cisco9300.setHeightU(1);
        cisco9300.setWidthMm(445.0f);
        cisco9300.setLengthMm(445.0f);
        cisco9300.setWeightKg(7.0f);
        cisco9300.setImagePath("/images/cisco-9300.png");

        for (int i = 1; i <= 4; i++) {
            InterfaceTemplate eth = new InterfaceTemplate();
            eth.setName("GigabitEthernet1/0/" + i);
            eth.setType("1000base-t");
            eth.setMgmtOnly(false);
            cisco9300.addInterfaceTemplate(eth);
        }

        PowerPortTemplate ciscoPsu1 = new PowerPortTemplate();
        ciscoPsu1.setName("PSU1");
        ciscoPsu1.setType("iec-60320-c14");
        cisco9300.addPowerPortTemplate(ciscoPsu1);

        ConsolePortTemplate ciscoConsole = new ConsolePortTemplate();
        ciscoConsole.setName("Console");
        ciscoConsole.setType("rj-45");
        cisco9300.addConsolePortTemplate(ciscoConsole);

        ModuleBayTemplate uplinkBay = new ModuleBayTemplate();
        uplinkBay.setName("Uplink Bay 1");
        uplinkBay.setLabel("Uplink Bay 1");
        uplinkBay.setPosition("1");
        cisco9300.addModuleBayTemplate(uplinkBay);

        DeviceType hpeMsa2060 = new DeviceType();
        hpeMsa2060.setName("HPE MSA 2060");
        hpeMsa2060.setCategory(DeviceType.Category.STORAGE);
        hpeMsa2060.setHeightU(2);
        hpeMsa2060.setWidthMm(482.0f);
        hpeMsa2060.setLengthMm(520.0f);
        hpeMsa2060.setWeightKg(28.0f);
        hpeMsa2060.setImagePath("/images/hpe-msa2060.png");

        deviceTypeRepository.saveAll(List.of(dellR740, cisco9300, hpeMsa2060));

        // Seed ModuleTypes
        ModuleType nm4_10g = new ModuleType();
        nm4_10g.setManufacturer("Cisco");
        nm4_10g.setModel("C3850-NM-4-10G");
        nm4_10g.setPartNumber("C3850-NM-4-10G");

        InterfaceTemplate t1 = new InterfaceTemplate();
        t1.setName("TenGigabitEthernet1/1");
        t1.setType("10gbase-x-sfpp");
        nm4_10g.addInterfaceTemplate(t1);

        InterfaceTemplate t2 = new InterfaceTemplate();
        t2.setName("TenGigabitEthernet1/2");
        t2.setType("10gbase-x-sfpp");
        nm4_10g.addInterfaceTemplate(t2);

        InterfaceTemplate t3 = new InterfaceTemplate();
        t3.setName("TenGigabitEthernet1/3");
        t3.setType("10gbase-x-sfpp");
        nm4_10g.addInterfaceTemplate(t3);

        InterfaceTemplate t4 = new InterfaceTemplate();
        t4.setName("TenGigabitEthernet1/4");
        t4.setType("10gbase-x-sfpp");
        nm4_10g.addInterfaceTemplate(t4);

        moduleTypeRepository.save(nm4_10g);

        // 3. Seed Room
        Room mainDcv = new Room();
        mainDcv.setName("Main Datacenter");
        mainDcv.setLocation("Building A, Floor 3");
        mainDcv.setWidthM(15.0f);
        mainDcv.setLengthM(12.0f);
        roomRepository.save(mainDcv);

        // 4. Seed Racks
        Rack rackA1 = new Rack();
        rackA1.setName("Rack A1");
        rackA1.setTotalUnits(42);
        rackA1.setPosX(3.0f);
        rackA1.setPosY(4.0f);
        rackA1.setRotationDeg(0.0f);
        rackA1.setRoom(mainDcv);

        Rack rackA2 = new Rack();
        rackA2.setName("Rack A2");
        rackA2.setTotalUnits(42);
        rackA2.setPosX(4.5f);
        rackA2.setPosY(4.0f);
        rackA2.setRotationDeg(0.0f);
        rackA2.setRoom(mainDcv);

        Rack rackB1 = new Rack();
        rackB1.setName("Rack B1");
        rackB1.setTotalUnits(44);
        rackB1.setPosX(3.0f);
        rackB1.setPosY(8.0f);
        rackB1.setRotationDeg(180.0f);
        rackB1.setRoom(mainDcv);

        Rack rackB2 = new Rack();
        rackB2.setName("Rack B2");
        rackB2.setTotalUnits(44);
        rackB2.setPosX(4.5f);
        rackB2.setPosY(8.0f);
        rackB2.setRotationDeg(180.0f);
        rackB2.setRoom(mainDcv);

        rackRepository.saveAll(List.of(rackA1, rackA2, rackB1, rackB2));

        // 5. Seed Devices
        Device webServer = new Device();
        webServer.setRack(rackA1);
        webServer.setDeviceType(dellR740);
        webServer.setName("Web Server 01");
        webServer.setStartU(1);
        webServer.setFace(Device.Face.FRONT);
        webServer.setStatus(Device.Status.ACTIVE);
        deviceService.initializeComponents(webServer, dellR740);

        Device coreSwitch = new Device();
        coreSwitch.setRack(rackA1);
        coreSwitch.setDeviceType(cisco9300);
        coreSwitch.setName("Core Switch 01");
        coreSwitch.setStartU(10);
        coreSwitch.setFace(Device.Face.FRONT);
        coreSwitch.setStatus(Device.Status.ACTIVE);
        deviceService.initializeComponents(coreSwitch, cisco9300);

        Device sanStorage = new Device();
        sanStorage.setRack(rackA2);
        sanStorage.setDeviceType(hpeMsa2060);
        sanStorage.setName("SAN Storage 01");
        sanStorage.setStartU(5);
        sanStorage.setFace(Device.Face.REAR);
        sanStorage.setStatus(Device.Status.ACTIVE);
        deviceService.initializeComponents(sanStorage, hpeMsa2060);

        deviceRepository.saveAll(List.of(webServer, coreSwitch, sanStorage));

        // Find the bay we created on coreSwitch
        var bay = coreSwitch.getModuleBays().stream()
                .filter(b -> b.getName().equals("Uplink Bay 1"))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Uplink Bay 1 not found on Cisco 9300"));

        deviceService.installModule(coreSwitch.getId(), bay.getId(), nm4_10g.getId());

        // 6. Seed PDUs
        Pdu pduLeft = new Pdu();
        pduLeft.setRack(rackA1);
        pduLeft.setName("PDU A1-Left");
        pduLeft.setPosition(Pdu.Position.LEFT);
        pduLeft.setOutletCount(24);

        Pdu pduRight = new Pdu();
        pduRight.setRack(rackA1);
        pduRight.setName("PDU A1-Right");
        pduRight.setPosition(Pdu.Position.RIGHT);
        pduRight.setOutletCount(24);

        Pdu pduRear = new Pdu();
        pduRear.setRack(rackA2);
        pduRear.setName("PDU A2-Rear");
        pduRear.setPosition(Pdu.Position.REAR);
        pduRear.setOutletCount(12);

        pduRepository.saveAll(List.of(pduLeft, pduRight, pduRear));

        return new SeedResponse(
                "Database seeded successfully",
                1, // 1 Room
                4, // 4 Racks
                3, // 3 DeviceTypes
                3, // 3 Devices
                3  // 3 PDUs
        );
    }
}
