package com.simpolette.dcv.DcvServerApplication.features.rack.dto;

public record UpdateRackDTO(
        String name,
        Float posX,
        Float posY,
        Float rotationDeg
) {}
