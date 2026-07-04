package com.simpolette.dcv.DcvServerApplication.features.seed;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceService;
import com.simpolette.dcv.DcvServerApplication.features.device.ModuleBay;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.pdu.PduRepository;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import com.simpolette.dcv.DcvServerApplication.features.seed.dto.SeedResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeedServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RackRepository rackRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private DeviceTypeRepository deviceTypeRepository;

    @Mock
    private PduRepository pduRepository;

    @Mock
    private ModuleTypeRepository moduleTypeRepository;

    @Mock
    private DeviceService deviceService;

    @InjectMocks
    private SeedService seedService;

    @Test
    @DisplayName("Should execute database seed workflow")
    void seed_Success() {
        when(moduleTypeRepository.save(any(ModuleType.class))).thenAnswer(i -> {
            ModuleType mt = i.getArgument(0);
            mt.setId(99L);
            return mt;
        });

        when(deviceRepository.saveAll(anyList())).thenAnswer(i -> {
            List<Device> list = i.getArgument(0);
            for (int idx = 0; idx < list.size(); idx++) {
                Device d = list.get(idx);
                d.setId((long) (idx + 1));
                ModuleBay bay = new ModuleBay();
                bay.setId(10L + idx);
                bay.setName("Uplink Bay 1");
                d.addModuleBay(bay);
            }
            return list;
        });

        SeedResponse response = seedService.seed();

        verify(pduRepository).deleteAll();
        verify(deviceRepository).deleteAll();
        verify(rackRepository).deleteAll();
        verify(roomRepository).deleteAll();

        assertThat(response.roomCount()).isEqualTo(1);
        assertThat(response.rackCount()).isEqualTo(4);
        assertThat(response.deviceCount()).isEqualTo(3);
    }
}
