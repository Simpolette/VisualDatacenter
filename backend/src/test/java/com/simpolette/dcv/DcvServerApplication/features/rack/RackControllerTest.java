package com.simpolette.dcv.DcvServerApplication.features.rack;

import tools.jackson.databind.json.JsonMapper;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.CreateRackDTO;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackSearchResultDTO;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.UtilizationDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RackController.class)
class RackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @MockitoBean
    private RackService rackService;

    @Test
    @DisplayName("GET /api/v1/rooms/{roomId}/racks - returns racks in room")
    void listByRoom_ReturnsOk() throws Exception {
        Rack rack = new Rack();
        rack.setId(10L);
        rack.setName("Rack-A1");
        when(rackService.listByRoom(1L)).thenReturn(List.of(rack));

        mockMvc.perform(get("/api/v1/rooms/1/racks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Rack-A1"));
    }

    @Test
    @DisplayName("GET /api/v1/rooms/{roomId}/racks/search - returns search results")
    void searchInRoom_ReturnsOk() throws Exception {
        RackSearchResultDTO res = new RackSearchResultDTO(10L, "Rack-A1", "RACK_NAME");
        when(rackService.searchInRoom(1L, "Rack")).thenReturn(List.of(res));

        mockMvc.perform(get("/api/v1/rooms/1/racks/search?q=Rack"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].matchedField").value("RACK_NAME"));
    }

    @Test
    @DisplayName("POST /api/v1/rooms/{roomId}/racks - creates rack and returns HTTP 201 CREATED")
    void create_ReturnsCreated() throws Exception {
        CreateRackDTO dto = new CreateRackDTO("Rack-A2", 42, 1.0f, 2.0f, 0.0f, 1.0f);
        Rack rack = new Rack();
        rack.setId(11L);
        rack.setName("Rack-A2");
        when(rackService.create(eq(1L), any(CreateRackDTO.class))).thenReturn(rack);

        mockMvc.perform(post("/api/v1/rooms/1/racks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(11));
    }

    @Test
    @DisplayName("GET /api/v1/racks/{id}/utilization - returns rack utilization stats")
    void getUtilization_ReturnsOk() throws Exception {
        UtilizationDTO dto = new UtilizationDTO(42, 10, 32, 23.81);
        when(rackService.getUtilization(10L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/racks/10/utilization"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.utilizationPercent").value(23.81));
    }
}
