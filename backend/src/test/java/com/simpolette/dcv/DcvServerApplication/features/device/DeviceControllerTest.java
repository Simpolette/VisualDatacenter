package com.simpolette.dcv.DcvServerApplication.features.device;

import tools.jackson.databind.json.JsonMapper;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.device.dto.InstallDeviceDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeviceController.class)
class DeviceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @MockitoBean
    private DeviceService deviceService;

    @Test
    @DisplayName("POST /api/v1/racks/{rackId}/devices - installs device and returns HTTP 201 CREATED")
    void install_ReturnsCreated() throws Exception {
        InstallDeviceDTO dto = new InstallDeviceDTO(100L, "Server-01", 10, Device.Face.FRONT, "192.168.1.10", 22, "public");
        Device device = new Device();
        device.setId(500L);
        device.setName("Server-01");
        when(deviceService.install(eq(10L), any(InstallDeviceDTO.class))).thenReturn(device);

        mockMvc.perform(post("/api/v1/racks/10/devices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(500))
                .andExpect(jsonPath("$.name").value("Server-01"));
    }

    @Test
    @DisplayName("POST /api/v1/racks/{rackId}/devices - returns 409 CONFLICT when slot is occupied")
    void install_Conflict_Returns409() throws Exception {
        InstallDeviceDTO dto = new InstallDeviceDTO(100L, "Server-01", 10, Device.Face.FRONT, "192.168.1.10", 22, "public");
        when(deviceService.install(eq(10L), any(InstallDeviceDTO.class)))
                .thenThrow(new SlotConflictException("Slot overlap"));

        mockMvc.perform(post("/api/v1/racks/10/devices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("DELETE /api/v1/devices/{id} - returns 204 NO_CONTENT")
    void delete_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/devices/500"))
                .andExpect(status().isNoContent());
    }
}
