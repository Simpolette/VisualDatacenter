package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import tools.jackson.databind.json.JsonMapper;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateDeviceTypeDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DeviceTypeController.class)
class DeviceTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @MockitoBean
    private DeviceTypeService deviceTypeService;

    @Test
    @DisplayName("GET /api/v1/device-types - lists device types catalog")
    void list_ReturnsOk() throws Exception {
        DeviceType dt = new DeviceType();
        dt.setId(100L);
        dt.setName("Dell PowerEdge R740");
        when(deviceTypeService.list()).thenReturn(List.of(dt));

        mockMvc.perform(get("/api/v1/device-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Dell PowerEdge R740"));
    }

    @Test
    @DisplayName("POST /api/v1/device-types - creates device type")
    void create_ReturnsCreated() throws Exception {
        CreateDeviceTypeDTO dto = new CreateDeviceTypeDTO("Dell PowerEdge R740", DeviceType.Category.COMPUTE, 2, 440.0f, 700.0f, 25.0f, null, null, null, null, null, null, null, null, null, null, null, null);
        DeviceType dt = new DeviceType();
        dt.setId(101L);
        dt.setName("Dell PowerEdge R740");
        when(deviceTypeService.create(any(CreateDeviceTypeDTO.class))).thenReturn(dt);

        mockMvc.perform(post("/api/v1/device-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(101));
    }

    @Test
    @DisplayName("DELETE /api/v1/device-types/{id} - deletes device type")
    void delete_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/device-types/100"))
                .andExpect(status().isNoContent());
    }
}
