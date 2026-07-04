package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import tools.jackson.databind.json.JsonMapper;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateModuleTypeDTO;
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

@WebMvcTest(ModuleTypeController.class)
class ModuleTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @MockitoBean
    private ModuleTypeService moduleTypeService;

    @Test
    @DisplayName("GET /api/v1/module-types - lists module types")
    void list_ReturnsOk() throws Exception {
        ModuleType mt = new ModuleType();
        mt.setId(10L);
        mt.setModel("NM-4-10G");
        when(moduleTypeService.findAll()).thenReturn(List.of(mt));

        mockMvc.perform(get("/api/v1/module-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].model").value("NM-4-10G"));
    }

    @Test
    @DisplayName("GET /api/v1/module-types/{id} - gets module type by ID")
    void getById_ReturnsOk() throws Exception {
        ModuleType mt = new ModuleType();
        mt.setId(10L);
        mt.setModel("NM-4-10G");
        when(moduleTypeService.findById(10L)).thenReturn(mt);

        mockMvc.perform(get("/api/v1/module-types/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model").value("NM-4-10G"));
    }

    @Test
    @DisplayName("POST /api/v1/module-types - creates module type")
    void create_ReturnsCreated() throws Exception {
        CreateModuleTypeDTO dto = new CreateModuleTypeDTO("Cisco", "C3850-NM-4-10G", "NM-4-10G", null, null, null);
        ModuleType mt = new ModuleType();
        mt.setId(11L);
        mt.setModel("C3850-NM-4-10G");
        when(moduleTypeService.create(any(CreateModuleTypeDTO.class))).thenReturn(mt);

        mockMvc.perform(post("/api/v1/module-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(11));
    }

    @Test
    @DisplayName("DELETE /api/v1/module-types/{id} - deletes module type")
    void delete_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/module-types/10"))
                .andExpect(status().isNoContent());
    }
}
