package com.simpolette.dcv.DcvServerApplication.features.rack;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import org.junit.jupiter.api.condition.EnabledIf;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
@EnabledIf("isDockerAvailable")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class RackRepositoryTest {

    static boolean isDockerAvailable() {
        try {
            return org.testcontainers.DockerClientFactory.instance().isDockerAvailable();
        } catch (Throwable t) {
            return false;
        }
    }

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private RackRepository rackRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Room room;

    @BeforeEach
    void setUp() {
        room = new Room();
        room.setName("DC-Testcontainers");
        room.setLocation("Server Room A");
        room.setWidthM(10.0f);
        room.setLengthM(10.0f);
        room = roomRepository.save(room);
    }

    @Test
    @DisplayName("Should find racks by room ID using real PostgreSQL container")
    void findByRoomId_Success() {
        Rack rack1 = new Rack();
        rack1.setRoom(room);
        rack1.setName("Rack-101");
        rack1.setTotalUnits(42);
        rack1.setPosX(0.0f);
        rack1.setPosY(0.0f);

        Rack rack2 = new Rack();
        rack2.setRoom(room);
        rack2.setName("Rack-102");
        rack2.setTotalUnits(44);
        rack2.setPosX(1.0f);
        rack2.setPosY(1.0f);

        rackRepository.saveAll(List.of(rack1, rack2));

        List<Rack> found = rackRepository.findByRoomId(room.getId());

        assertThat(found).hasSize(2);
        assertThat(found).extracting(Rack::getName).containsExactlyInAnyOrder("Rack-101", "Rack-102");
    }

    @Test
    @DisplayName("Should search racks by rack name, device name, or IP address in PostgreSQL")
    void searchRacksInRoom_SearchMatching() {
        Rack rack = new Rack();
        rack.setRoom(room);
        rack.setName("Storage-Rack-01");
        rack.setTotalUnits(42);
        rack.setPosX(2.0f);
        rack.setPosY(2.0f);
        rackRepository.save(rack);

        DeviceType dt = new DeviceType();
        dt.setName("Dell PowerEdge R740");
        dt.setCategory(DeviceType.Category.COMPUTE);
        dt.setHeightU(2);
        entityManager.persist(dt);

        Device dev = new Device();
        dev.setRack(rack);
        dev.setDeviceType(dt);
        dev.setName("app-server-01");
        dev.setStartU(1);
        dev.setFace(Device.Face.FRONT);
        dev.setStatus(Device.Status.ACTIVE);
        dev.setIpAddress("10.0.1.50");
        entityManager.persist(dev);

        entityManager.flush();

        // 1. Match by rack name
        List<Rack> match1 = rackRepository.searchRacksInRoom(room.getId(), "storage");
        assertThat(match1).hasSize(1);

        // 2. Match by device name
        List<Rack> match2 = rackRepository.searchRacksInRoom(room.getId(), "app-server");
        assertThat(match2).hasSize(1);

        // 3. Match by device IP
        List<Rack> match3 = rackRepository.searchRacksInRoom(room.getId(), "10.0.1.50");
        assertThat(match3).hasSize(1);

        // 4. Match by device type name
        List<Rack> match4 = rackRepository.searchRacksInRoom(room.getId(), "poweredge");
        assertThat(match4).hasSize(1);
    }
}
