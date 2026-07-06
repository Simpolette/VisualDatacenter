package com.simpolette.dcv.DcvServerApplication.features.seed;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import com.simpolette.dcv.DcvServerApplication.features.seed.dto.SeedResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ParameterizedPreparedStatementSetter;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeedServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private DeviceTypeRepository deviceTypeRepository;

    @Mock
    private ModuleTypeRepository moduleTypeRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private SeedService seedService;

    @Test
    @DisplayName("Should execute database seed workflow using JdbcTemplate")
    void seed_Success() {
        when(deviceTypeRepository.saveAll(anyList())).thenAnswer(i -> {
            List<DeviceType> list = i.getArgument(0);
            long id = 1;
            for (DeviceType dt : list) {
                dt.setId(id++);
            }
            return list;
        });

        when(moduleTypeRepository.save(any(ModuleType.class))).thenAnswer(i -> {
            ModuleType mt = i.getArgument(0);
            mt.setId(99L);
            return mt;
        });

        when(roomRepository.save(any(Room.class))).thenAnswer(i -> {
            Room r = i.getArgument(0);
            r.setId(1L);
            return r;
        });

        when(jdbcTemplate.query(anyString(), any(RowMapper.class), any())).thenReturn(List.of(101L));

        SeedResponse response = seedService.seed(20);

        verify(jdbcTemplate, times(6)).update(startsWith("DELETE FROM"));
        verify(jdbcTemplate, times(3)).batchUpdate(anyString(), anyCollection(), anyInt(), any(ParameterizedPreparedStatementSetter.class));

        assertThat(response.roomCount()).isEqualTo(1);
        assertThat(response.rackCount()).isEqualTo(1);
        assertThat(response.deviceCount()).isGreaterThan(0);
    }
}

