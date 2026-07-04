package com.simpolette.dcv.DcvServerApplication.features.seed;

import com.simpolette.dcv.DcvServerApplication.features.seed.dto.SeedResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SeedController.class)
class SeedControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SeedService seedService;

    @Test
    @DisplayName("POST /api/v1/seed - triggers database seed operation")
    void seed_ReturnsOk() throws Exception {
        SeedResponse res = new SeedResponse("Seeded successfully", 1, 4, 3, 3, 3);
        when(seedService.seed()).thenReturn(res);

        mockMvc.perform(post("/api/v1/seed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Seeded successfully"))
                .andExpect(jsonPath("$.roomCount").value(1));
    }
}
