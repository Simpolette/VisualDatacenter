package com.simpolette.dcv.DcvServerApplication.features.devicetype.dto;

public record InterfaceTemplateDTO(
        String name,
        String type,
        boolean mgmtOnly
) {}
