package com.simpolette.dcv.DcvServerApplication.features.seed.dto;

public record SeedResponse(
    String message,
    int roomCount,
    int rackCount,
    int deviceTypeCount,
    int deviceCount,
    int pduCount
) {}
