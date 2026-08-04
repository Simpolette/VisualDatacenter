package com.simpolette.dcv.DcvServerApplication.features.admin.dto;

import java.util.List;

public record UpdateRoomAssignmentsDTO(
    List<Long> roomIds
) {}
