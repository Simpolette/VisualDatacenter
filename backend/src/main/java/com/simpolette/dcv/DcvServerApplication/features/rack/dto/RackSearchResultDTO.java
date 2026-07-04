package com.simpolette.dcv.DcvServerApplication.features.rack.dto;

public record RackSearchResultDTO(
    Long rackId,
    String rackName,
    String matchedField
) {}
