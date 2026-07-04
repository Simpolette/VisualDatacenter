package com.simpolette.dcv.DcvServerApplication.features.pdu;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpolette.dcv.DcvServerApplication.features.pdu.dto.CreatePduDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
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

@WebMvcTest(PduController.class)
class PduControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PduService pduService;

    @Test
    @DisplayName("POST /api/v1/racks/{rackId}/pdus - attaches PDU")
    void attach_ReturnsCreated() throws Exception {
        CreatePduDTO dto = new CreatePduDTO("PDU-A1", Pdu.Position.LEFT, 24);
        Pdu pdu = new Pdu();
        pdu.setId(100L);
        pdu.setName("PDU-A1");

        when(pduService.attach(eq(10L), any(CreatePduDTO.class))).thenReturn(pdu);

        mockMvc.perform(post("/api/v1/racks/10/pdus")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100));
    }

    @Test
    @DisplayName("DELETE /api/v1/pdus/{id} - detaches PDU")
    void detach_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/pdus/100"))
                .andExpect(status().isNoContent());
    }
}
