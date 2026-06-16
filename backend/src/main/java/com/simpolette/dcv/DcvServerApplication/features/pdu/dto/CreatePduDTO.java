package com.simpolette.dcv.DcvServerApplication.features.pdu.dto;

import com.simpolette.dcv.DcvServerApplication.features.pdu.Pdu;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePduDTO(
        @NotBlank(message = "Name is required")
        String name,

        @NotNull(message = "Position is required")
        Pdu.Position position,

        @Min(value = 1, message = "Outlet count must be at least 1")
        int outletCount
) {}
