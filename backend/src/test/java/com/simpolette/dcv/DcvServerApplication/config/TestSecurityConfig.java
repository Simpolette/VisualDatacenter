package com.simpolette.dcv.DcvServerApplication.config;

import com.simpolette.dcv.DcvServerApplication.common.security.RoomAccessService;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@TestConfiguration
public class TestSecurityConfig {

    @Bean
    @Primary
    public JwtDecoder jwtDecoder() {
        return Mockito.mock(JwtDecoder.class);
    }

    @Bean
    @Primary
    public RoomAccessService roomAccessService() {
        RoomAccessService mock = Mockito.mock(RoomAccessService.class);
        Mockito.when(mock.isPlatformAdmin()).thenReturn(true);
        Mockito.when(mock.hasAccessToRoom(Mockito.anyLong())).thenReturn(true);
        Mockito.when(mock.hasAccessToRack(Mockito.anyLong())).thenReturn(true);
        Mockito.when(mock.hasAccessToDevice(Mockito.anyLong())).thenReturn(true);
        return mock;
    }
}
