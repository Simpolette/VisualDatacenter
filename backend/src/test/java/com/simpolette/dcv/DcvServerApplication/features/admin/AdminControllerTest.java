package com.simpolette.dcv.DcvServerApplication.features.admin;

import com.simpolette.dcv.DcvServerApplication.common.security.RoomAccessService;
import com.simpolette.dcv.DcvServerApplication.config.TestSecurityConfig;
import com.simpolette.dcv.DcvServerApplication.features.admin.dto.*;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@Import(TestSecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private RoomAccessService roomAccessService;

    @Test
    void listUsers_withoutAdminRole_returnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .with(jwt().authorities(() -> "ROLE_noc_viewer")))
                .andExpect(status().isForbidden());
    }

    @Test
    void listUsers_withAdminRole_returnsUserList() throws Exception {
        UUID userId = UUID.randomUUID();
        UserResponseDTO user = new UserResponseDTO(
                userId, "admin", "admin@vdt.local", "Admin", "User", "platform_admin", 0, List.of()
        );

        Mockito.when(adminService.listUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/v1/admin/users")
                        .with(jwt().authorities(() -> "ROLE_platform_admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("admin"));
    }

    @Test
    void createUser_withAdminRole_returnsCreatedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        UserResponseDTO created = new UserResponseDTO(
                userId, "newuser", "newuser@vdt.local", "New", "User", "noc_viewer", 0, List.of()
        );

        Mockito.when(adminService.createUser(any(CreateUserDTO.class))).thenReturn(created);

        String jsonBody = """
            {
                "username": "newuser",
                "email": "newuser@vdt.local",
                "password": "password123",
                "firstName": "New",
                "lastName": "User",
                "role": "noc_viewer"
            }
            """;

        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody)
                        .with(jwt().authorities(() -> "ROLE_platform_admin")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newuser"));
    }

    @Test
    void updateRoomAssignments_withAdminRole_returnsUpdatedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        UserResponseDTO updated = new UserResponseDTO(
                userId, "testuser", "test@vdt.local", "Test", "User", "dc_manager", 1,
                List.of(new RoomAssignmentDTO(1L, "Room A"))
        );

        Mockito.when(adminService.updateRoomAssignments(eq(userId), any(), any())).thenReturn(updated);

        String jsonBody = """
            {
                "roomIds": [1]
            }
            """;

        mockMvc.perform(put("/api/v1/admin/users/" + userId + "/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody)
                        .with(jwt().authorities(() -> "ROLE_platform_admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedRoomCount").value(1));
    }
}
