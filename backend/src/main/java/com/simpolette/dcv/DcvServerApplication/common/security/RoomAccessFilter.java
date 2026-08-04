package com.simpolette.dcv.DcvServerApplication.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class RoomAccessFilter extends OncePerRequestFilter {

    private static final Pattern ROOM_PATH_PATTERN = Pattern.compile("^/api/v1/rooms/(\\d+)(?:/.*)?$");
    private static final Pattern RACK_PATH_PATTERN = Pattern.compile("^/api/v1/racks/(\\d+)(?:/.*)?$");

    private final RoomAccessService roomAccessService;

    public RoomAccessFilter(RoomAccessService roomAccessService) {
        this.roomAccessService = roomAccessService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        Matcher roomMatcher = ROOM_PATH_PATTERN.matcher(path);
        if (roomMatcher.matches()) {
            Long roomId = Long.parseLong(roomMatcher.group(1));
            if (!roomAccessService.hasAccessToRoom(roomId)) {
                sendForbiddenResponse(response, "Access denied to room " + roomId);
                return;
            }
        }

        Matcher rackMatcher = RACK_PATH_PATTERN.matcher(path);
        if (rackMatcher.matches()) {
            Long rackId = Long.parseLong(rackMatcher.group(1));
            if (!roomAccessService.hasAccessToRack(rackId)) {
                sendForbiddenResponse(response, "Access denied to rack " + rackId);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendForbiddenResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String body = String.format("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"%s\"}", message);
        response.getWriter().write(body);
    }
}
