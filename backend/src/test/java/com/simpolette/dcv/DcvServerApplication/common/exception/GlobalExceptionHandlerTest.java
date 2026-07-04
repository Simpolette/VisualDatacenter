package com.simpolette.dcv.DcvServerApplication.common.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Should handle ResourceNotFoundException with 404 NOT_FOUND status")
    void handleResourceNotFound() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Room", 99L);

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleResourceNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody())
                .containsEntry("status", 404)
                .containsEntry("error", "Not Found")
                .containsEntry("message", "Room not found with id: 99");
    }

    @Test
    @DisplayName("Should handle SlotConflictException with 409 CONFLICT status")
    void handleSlotConflict() {
        SlotConflictException ex = new SlotConflictException("Slot overlap detected");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleSlotConflict(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody())
                .containsEntry("status", 409)
                .containsEntry("error", "Conflict")
                .containsEntry("message", "Slot overlap detected");
    }

    @Test
    @DisplayName("Should handle DataIntegrityViolationException with 409 CONFLICT status")
    void handleDataIntegrity() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Duplicate key", new RuntimeException("Key exists"));

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleDataIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody())
                .containsEntry("status", 409)
                .containsEntry("error", "Conflict")
                .hasEntrySatisfying("message", msg -> assertThat((String) msg).contains("Data integrity violation"));
    }

    @Test
    @DisplayName("Should handle IllegalArgumentException with 400 BAD_REQUEST status")
    void handleIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid slot");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleIllegalArgument(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .containsEntry("status", 400)
                .containsEntry("error", "Bad Request")
                .containsEntry("message", "Invalid slot");
    }

    @Test
    @DisplayName("Should handle generic Exception with 500 INTERNAL_SERVER_ERROR status")
    void handleGeneric() {
        Exception ex = new RuntimeException("Unexpected db crash");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleGeneric(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody())
                .containsEntry("status", 500)
                .containsEntry("error", "Internal Server Error")
                .containsEntry("message", "An unexpected error occurred");
    }

    @Test
    @DisplayName("Should handle MethodArgumentNotValidException with 400 BAD_REQUEST status")
    void handleValidation() {
        org.springframework.validation.BindingResult bindingResult = org.mockito.Mockito.mock(org.springframework.validation.BindingResult.class);
        org.springframework.validation.FieldError fieldError = new org.springframework.validation.FieldError("room", "name", "must not be blank");
        org.mockito.Mockito.when(bindingResult.getFieldErrors()).thenReturn(java.util.List.of(fieldError));

        org.springframework.web.bind.MethodArgumentNotValidException ex = new org.springframework.web.bind.MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .containsEntry("status", 400)
                .containsEntry("error", "Bad Request")
                .containsEntry("message", "name: must not be blank");
    }
}
