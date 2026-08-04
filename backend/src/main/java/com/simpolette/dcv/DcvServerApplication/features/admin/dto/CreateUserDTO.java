package com.simpolette.dcv.DcvServerApplication.features.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserDTO(
    @NotBlank String username,
    @NotBlank @Email String email,
    @NotBlank String password,
    String firstName,
    String lastName,
    @NotBlank String role
) {}
