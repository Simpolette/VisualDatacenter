package com.simpolette.dcv.DcvServerApplication.features.rack.dto;

public record UtilizationDTO(
        int totalUnits,
        int occupiedUnits,
        int freeUnits,
        double utilizationPercent
) {}
