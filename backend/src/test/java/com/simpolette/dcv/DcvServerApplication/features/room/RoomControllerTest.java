package com.simpolette.dcv.DcvServerApplication.features.room;

import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomResponseDTO;
import tools.jackson.databind.json.JsonMapper;
import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.CreateRoomDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomDetailDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RoomController.class)
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @MockitoBean
    private RoomService roomService;

    @Test
    @DisplayName("GET /api/v1/rooms - returns list of rooms")
    void list_ReturnsOk() throws Exception {
        RoomResponseDTO dto = new RoomResponseDTO(1L, "DC-01", "Building A", 20.0f, 30.0f, null, Instant.now(), Instant.now());
        when(roomService.list()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("DC-01"));
    }

    @Test
    @DisplayName("POST /api/v1/rooms - creates room and returns HTTP 201 CREATED")
    void create_ReturnsCreated() throws Exception {
        CreateRoomDTO dto = new CreateRoomDTO("DC-02", "Building B", 10.0f, 15.0f);
        RoomResponseDTO created = new RoomResponseDTO(2L, "DC-02", "Building B", 10.0f, 15.0f, null, Instant.now(), Instant.now());
        when(roomService.create(any(CreateRoomDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("DC-02"));
    }

    @Test
    @DisplayName("GET /api/v1/rooms/{id} - returns 404 NOT FOUND when room does not exist")
    void getDetail_NotFound_Returns404() throws Exception {
        when(roomService.getDetail(99L)).thenThrow(new ResourceNotFoundException("Room", 99L));

        mockMvc.perform(get("/api/v1/rooms/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("DELETE /api/v1/rooms/{id} - returns HTTP 204 NO_CONTENT")
    void delete_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/rooms/1"))
                .andExpect(status().isNoContent());
    }
}
